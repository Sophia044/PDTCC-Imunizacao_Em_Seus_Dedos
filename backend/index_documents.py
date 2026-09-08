# ============================================================
# SCRIPT DE INDEXAÇÃO VETORIAL (RAG) — VacinApp
#
# OBJETIVO:
#   Processar os arquivos PDF oficiais de vacinação (Ministério da Saúde e SBIm)
#   armazenados na pasta "documentos-vacinacao/", convertê-los em chunks de texto,
#   gerar embeddings vetoriais via Ollama (nomic-embed-text) e persistir a base
#   no ChromaDB ("chroma_db/").
#
# QUANDO EXECUTAR:
#   Execute este script MANUALMENTE toda vez que adicionar, remover ou atualizar
#   arquivos PDF na pasta "documentos-vacinacao/".
#
# COMO EXECUTAR NO TERMINAL:
#   cd backend
#   .\venv\Scripts\activate
#   python index_documents.py
#
# CONCEITOS IMPORTANTES PARA A BANCA DO TCC:
#   1. Chunking: Textos longos são divididos em trechos de ~500 palavras com
#      50 palavras de sobreposição (overlap). A sobreposição é crucial para não
#      cortar explicações ou frases médicas ao meio entre chunks adjacentes.
#   2. Rastreabilidade (Metadados): Cada trecho guarda o nome do arquivo de
#      origem e o número da página, garantindo auditoria da fonte de informação.
#   3. Espaço Vetorial Cosseno: Configurado com 'hnsw:space: cosine' para permitir
#      cálculo direto de similaridade semântica angular entre perguntas e trechos.
# ============================================================

import os
import sys
import time
from pathlib import Path
from typing import List, Dict, Any

# Garante compatibilidade de saída UTF-8 no terminal do Windows (PowerShell/CMD)
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Garante que o Python encontre o módulo 'app' se executado diretamente
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

import httpx
import pypdf
import chromadb
from chromadb.config import Settings as ChromaSettings

from app.config import settings

# -------------------------------------------------------
# Parâmetros de Chunking e Indexação
# -------------------------------------------------------
CHUNK_SIZE_WORDS = 500       # Tamanho alvo de cada pedaço de texto
CHUNK_OVERLAP_WORDS = 50     # Quantidade de palavras sobrepostas entre chunks consecutivos
EMBEDDING_TIMEOUT = 60.0     # Timeout para chamada ao Ollama


def get_pdf_files(docs_dir: Path) -> List[Path]:
    """Retorna todos os arquivos .pdf presentes na pasta de documentos."""
    if not docs_dir.exists():
        docs_dir.mkdir(parents=True, exist_ok=True)
        return []
    return sorted(list(docs_dir.glob("*.pdf")))


def extract_pages_from_pdf(pdf_path: Path) -> List[Dict[str, Any]]:
    """
    Extrai o texto página por página do arquivo PDF usando pypdf.
    Retorna uma lista de dicionários com 'page_number' e 'text'.
    """
    pages_data = []
    try:
        reader = pypdf.PdfReader(str(pdf_path))
        for page_idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            text = text.strip()
            if text:
                pages_data.append({
                    "page_number": page_idx + 1,  # 1-indexed para humanos
                    "text": text
                })
    except Exception as exc:
        print(f"  ❌ Erro ao ler PDF {pdf_path.name}: {exc}")
    return pages_data


def split_text_into_chunks(pages_data: List[Dict[str, Any]], filename: str) -> List[Dict[str, Any]]:
    """
    Divide o texto extraído em chunks de ~500 palavras com 50 palavras de sobreposição.
    Preserva o número da página e o nome do arquivo como metadados.
    """
    chunks = []
    chunk_global_idx = 1

    for page_info in pages_data:
        page_num = page_info["page_number"]
        words = page_info["text"].split()

        if not words:
            continue

        start = 0
        while start < len(words):
            end = min(start + CHUNK_SIZE_WORDS, len(words))
            chunk_words = words[start:end]
            chunk_text = " ".join(chunk_words).strip()

            if chunk_text:
                chunks.append({
                    "id": f"{filename}_p{page_num}_c{chunk_global_idx}",
                    "text": chunk_text,
                    "metadata": {
                        "source": filename,
                        "page": int(page_num),
                        "chunk_index": int(chunk_global_idx)
                    }
                })
                chunk_global_idx += 1

            # Avança a janela considerando a sobreposição
            if end == len(words):
                break
            start += (CHUNK_SIZE_WORDS - CHUNK_OVERLAP_WORDS)

    return chunks


def generate_embedding(text: str, client: httpx.Client) -> List[float]:
    """
    Gera o vetor de embedding via Ollama utilizando o prefixo recomendado
    'search_document: ' do modelo nomic-embed-text.
    """
    prompt = f"search_document: {text.strip()}"
    payload = {
        "model": settings.rag_embedding_model,
        "prompt": prompt,
    }

    response = client.post(
        f"{settings.ollama_url}/api/embeddings",
        json=payload,
        timeout=EMBEDDING_TIMEOUT
    )
    response.raise_for_status()
    data = response.json()
    embedding = data.get("embedding")
    if not embedding:
        raise ValueError("Ollama retornou embedding vazio.")
    return embedding


def main():
    print("\n" + "=" * 65)
    print("📚 VacinApp — Indexador de Documentos Oficiais (RAG)")
    print("=" * 65)

    base_dir = CURRENT_DIR
    docs_dir = base_dir / settings.rag_docs_dir
    chroma_dir = base_dir / settings.rag_chroma_dir

    print(f"📁 Pasta de documentos: {docs_dir}")
    print(f"💾 Banco vetorial:     {chroma_dir}")
    print(f"🧠 Modelo embedding:   {settings.rag_embedding_model}")
    print(f"🤖 Servidor Ollama:     {settings.ollama_url}")
    print("-" * 65)

    # 1. Busca os arquivos PDF
    pdf_files = get_pdf_files(docs_dir)
    if not pdf_files:
        print(f"\n⚠️  Nenhum arquivo PDF encontrado na pasta: '{docs_dir}'")
        print("➡️  Para indexar:")
        print("   1. Copie seus PDFs oficiais (ex: Calendário SBIm, PNI SUS) para essa pasta.")
        print("   2. Execute este script novamente: python index_documents.py\n")
        return

    print(f"📄 Encontrados {len(pdf_files)} arquivo(s) PDF para indexação:")
    for f in pdf_files:
        print(f"   • {f.name}")
    print("-" * 65)

    # 2. Testar conectividade com o Ollama antes de processar os PDFs
    print("🔍 Testando conectividade com o Ollama...")
    try:
        with httpx.Client(timeout=10.0) as http_client:
            test_resp = http_client.get(f"{settings.ollama_url}/api/tags")
            test_resp.raise_for_status()
            models_list = [m.get("name") for m in test_resp.json().get("models", [])]
            
            # Verifica se nomic-embed-text está disponível
            has_embed_model = any(settings.rag_embedding_model in m for m in models_list)
            if not has_embed_model:
                print(f"\n❌ O modelo '{settings.rag_embedding_model}' não foi encontrado no Ollama.")
                print(f"➡️  Execute no terminal: ollama pull {settings.rag_embedding_model}\n")
                return

        print(f"✅ Ollama conectado e modelo '{settings.rag_embedding_model}' disponível!\n")
    except Exception as exc:
        print(f"\n❌ Não foi possível conectar ao Ollama em '{settings.ollama_url}': {exc}")
        print("➡️  Certifique-se de que o Ollama está aberto e rodando no seu computador.\n")
        return

    # 3. Extração e Chunking
    all_chunks = []
    print("✂️  Extraindo texto e dividindo em chunks...")
    for pdf_path in pdf_files:
        print(f"\n📖 Processando: {pdf_path.name}")
        pages = extract_pages_from_pdf(pdf_path)
        print(f"   ✓ Extraídas {len(pages)} página(s) com texto legível.")

        chunks = split_text_into_chunks(pages, pdf_path.name)
        print(f"   ✓ Gerados {len(chunks)} chunk(s) (tamanho ~{CHUNK_SIZE_WORDS} palavras, overlap {CHUNK_OVERLAP_WORDS} palavras).")
        all_chunks.extend(chunks)

    if not all_chunks:
        print("\n⚠️  Nenhum texto pôde ser extraído dos PDFs. Verifique se os arquivos não são apenas imagens digitalizadas sem OCR.")
        return

    print(f"\n📊 Total de chunks a vetorizar: {len(all_chunks)}")
    print("-" * 65)

    # 4. Inicializa o ChromaDB com persistência local
    print("💾 Inicializando ChromaDB...")
    chroma_dir.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(
        path=str(chroma_dir),
        settings=ChromaSettings(anonymized_telemetry=False)
    )

    # Para garantir consistência com novos ou arquivos removidos,
    # recria a coleção para que os dados fiquem 100% atualizados
    try:
        client.delete_collection(name=settings.rag_collection_name)
        print(f"   ✓ Coleção anterior '{settings.rag_collection_name}' limpa para reindexação limpa.")
    except Exception:
        pass

    collection = client.create_collection(
        name=settings.rag_collection_name,
        metadata={"hnsw:space": "cosine"}  # Métrica de cosseno
    )
    print(f"   ✓ Coleção '{settings.rag_collection_name}' criada com métrica de cosseno.")

    # 5. Gera embeddings e insere no ChromaDB
    print("\n⚡ Gerando embeddings via Ollama e inserindo no ChromaDB:")
    batch_size = 10
    total_chunks = len(all_chunks)

    start_time = time.time()
    with httpx.Client(timeout=EMBEDDING_TIMEOUT) as http_client:
        for i in range(0, total_chunks, batch_size):
            batch = all_chunks[i:i + batch_size]
            batch_ids = [c["id"] for c in batch]
            batch_texts = [c["text"] for c in batch]
            batch_metadatas = [c["metadata"] for c in batch]
            batch_embeddings = []

            for chunk_item in batch:
                emb = generate_embedding(chunk_item["text"], http_client)
                batch_embeddings.append(emb)

            collection.add(
                ids=batch_ids,
                documents=batch_texts,
                metadatas=batch_metadatas,
                embeddings=batch_embeddings
            )

            processed = min(i + batch_size, total_chunks)
            percent = (processed / total_chunks) * 100
            print(f"   [{processed}/{total_chunks}] ({percent:.1f}%) chunks indexados com sucesso...")

    elapsed = time.time() - start_time
    print("-" * 65)
    print(f"🎉 SUCESSO! Base vetorial criada em {elapsed:.2f} segundos.")
    print(f"📁 Localização: {chroma_dir.resolve()}")
    print(f"🔢 Total indexado: {collection.count()} chunks a partir de {len(pdf_files)} PDF(s).")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    main()
