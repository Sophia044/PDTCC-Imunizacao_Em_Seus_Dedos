# ============================================================
# SERVIÇO RAG: Recuperação Vetorial de Documentos Oficiais
#
# Este módulo implementa a camada de busca semântica (RAG):
# 1. Conecta ao banco de dados vetorial local (ChromaDB).
# 2. Gera o vetor de embedding da pergunta via Ollama (nomic-embed-text).
# 3. Executa a busca pelos chunks mais próximos (menor distância de cosseno).
# 4. Aplica o LIMIAR DE SIMILARIDADE: se a similaridade for inferior a 0.55,
#    os documentos são considerados insuficientes para responder com precisão,
#    garantindo que o assistente recorra ao conhecimento geral com avisos de segurança.
#
# Este é um ponto chave na banca do TCC para demonstrar responsabilidade,
# mitigação de alucinações e conformidade técnica no uso de IA em saúde.
# ============================================================

import logging
from pathlib import Path
from typing import List, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
import httpx
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger(__name__)

# Timeout para geração de embeddings no Ollama
EMBEDDING_TIMEOUT_SECONDS = 30.0


# -------------------------------------------------------
# Estruturas de Dados do RAG
# -------------------------------------------------------

class RelevantChunk(BaseModel):
    """Representa um pedaço de texto recuperado dos documentos oficiais."""
    content: str               # Texto do trecho extraído do PDF
    source_file: str           # Nome do arquivo de origem (ex: Calendario_SBIm.pdf)
    page: Optional[int] = None # Página onde o trecho se encontra no PDF
    similarity: float          # Similaridade de cosseno (0.0 a 1.0)


class RagQueryResult(BaseModel):
    """Resultado consolidado da consulta RAG."""
    chunks: List[RelevantChunk]
    baseado_em_documentos: bool  # True se passou pelo limiar de similaridade
    fontes: List[str]            # Nomes únicos dos arquivos consultados


# -------------------------------------------------------
# Serviço RAG
# -------------------------------------------------------

class RagService:
    def __init__(self):
        # Diretório base do backend para resolver caminhos relativos
        base_dir = Path(__file__).resolve().parent.parent.parent
        self.chroma_path = base_dir / settings.rag_chroma_dir
        self.collection_name = settings.rag_collection_name
        self.similarity_threshold = settings.rag_similarity_threshold
        self._client = None
        self._collection = None

    def _get_collection(self):
        """
        Inicializa o cliente ChromaDB persistente e obtém a coleção.
        Retorna None se a base vetorial ainda não foi criada via script de indexação.
        """
        if self._collection is not None:
            return self._collection

        if not self.chroma_path.exists():
            logger.info("Diretório do ChromaDB ainda não existe (%s). RAG desativado.", self.chroma_path)
            return None

        try:
            self._client = chromadb.PersistentClient(
                path=str(self.chroma_path),
                settings=ChromaSettings(anonymized_telemetry=False)
            )
            # Carrega a coleção configurada com métrica de cosseno
            self._collection = self._client.get_collection(name=self.collection_name)
            return self._collection
        except Exception as exc:
            logger.warning("Coleção '%s' não encontrada no ChromaDB: %s", self.collection_name, exc)
            return None

    async def generate_embedding(self, text: str, is_query: bool = True) -> Optional[List[float]]:
        """
        Gera o embedding de 768 dimensões usando o modelo nomic-embed-text no Ollama.
        
        NOTA TÉCNICA (TCC):
        O modelo nomic-embed-text foi treinado com prefixos específicos:
          - Perguntas/Consultas: 'search_query: <texto>'
          - Documentos/Chunks:  'search_document: <texto>'
        O uso desses prefixos melhora expressivamente a qualidade da busca semântica.
        """
        prefix = "search_query: " if is_query else "search_document: "
        prompt_text = f"{prefix}{text.strip()}"

        payload = {
            "model": settings.rag_embedding_model,
            "prompt": prompt_text,
        }

        try:
            async with httpx.AsyncClient(timeout=EMBEDDING_TIMEOUT_SECONDS) as client:
                response = await client.post(
                    f"{settings.ollama_url}/api/embeddings",
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                embedding = data.get("embedding")
                return embedding

        except (httpx.ConnectError, httpx.TimeoutException, httpx.HTTPStatusError) as exc:
            logger.error("Erro ao gerar embedding no Ollama (%s): %s", settings.rag_embedding_model, exc)
            return None

    async def query_relevant_documents(self, question: str) -> RagQueryResult:
        """
        Busca os trechos mais relevantes para a pergunta do paciente.
        
        Fluxo de Decisão:
        1. Se o ChromaDB não existir ou estiver vazio -> Retorna baseado_em_documentos=False.
        2. Gera o vetor da pergunta do paciente.
        3. Recupera os top K chunks mais próximos.
        4. No ChromaDB com métrica cosseno:
             distancia_cosseno = 1 - similaridade_cosseno
             similaridade = 1.0 - distancia
        5. Aplica o LIMIAR: apenas chunks com similaridade >= 0.55 são aceitos.
        6. Se nenhum chunk atingir o limiar -> Retorna baseado_em_documentos=False.
        """
        empty_result = RagQueryResult(chunks=[], baseado_em_documentos=False, fontes=[])

        collection = self._get_collection()
        if collection is None:
            return empty_result

        try:
            doc_count = collection.count()
            if doc_count == 0:
                logger.info("Base vetorial vazia. Execute index_documents.py.")
                return empty_result
        except Exception as exc:
            logger.warning("Falha ao contar documentos no ChromaDB: %s", exc)
            return empty_result

        # Gera embedding da pergunta
        query_vector = await self.generate_embedding(question, is_query=True)
        if not query_vector:
            logger.warning("Não foi possível gerar embedding para a pergunta. Prosseguindo sem contexto RAG.")
            return empty_result

        # Quantidade de resultados a buscar
        n_results = min(settings.rag_top_k, doc_count)

        try:
            results = collection.query(
                query_embeddings=[query_vector],
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )
        except Exception as exc:
            logger.error("Erro ao consultar ChromaDB: %s", exc)
            return empty_result

        # Processamento e filtragem por limiar
        relevant_chunks: List[RelevantChunk] = []
        unique_sources = set()

        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        for doc_text, meta, distance in zip(documents, metadatas, distances):
            # No Chroma com hnsw:space=cosine:
            # distância = 1 - similaridade
            similarity = max(0.0, min(1.0, 1.0 - float(distance)))

            # DECISÃO CRÍTICA (TCC): Filtro de Relevância
            # Chunks com similaridade menor que o limiar são descartados para evitar alucinação
            if similarity >= settings.rag_similarity_threshold:
                source_file = meta.get("source", "Documento Oficial")
                page_num = meta.get("page")
                unique_sources.add(source_file)

                relevant_chunks.append(
                    RelevantChunk(
                        content=doc_text,
                        source_file=source_file,
                        page=page_num,
                        similarity=round(similarity, 4)
                    )
                )

        has_relevant = len(relevant_chunks) > 0
        return RagQueryResult(
            chunks=relevant_chunks,
            baseado_em_documentos=has_relevant,
            fontes=sorted(list(unique_sources))
        )


# Instância única do serviço
rag_service = RagService()
