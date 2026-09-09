# ============================================================
# ROUTER: Assistente Virtual com IA Local e RAG (Ollama + ChromaDB)
#
# Este módulo expõe o endpoint POST /ai/ask que:
#   1. Recebe a pergunta do paciente autenticado.
#   2. Consulta a base vetorial local (ChromaDB) para buscar trechos
#      de documentos oficiais (Ministério da Saúde / SBIm).
#   3. Aplica o LIMIAR DE SIMILARIDADE para decidir a rota:
#      - SE encontrou trechos oficiais relevantes:
#          Injeta os chunks no prompt e instrui a IA a responder
#          estritamente com base nesses dados, citando as fontes oficiais.
#          Retorna 'baseado_em_documentos: true'.
#      - SE NÃO encontrou trechos suficientes:
#          Instrui a IA a responder apenas com conhecimento geral,
#          SEM INVENTAR datas, doses ou nomes específicos, alertando
#          claramente o usuário e recomendando um profissional de saúde.
#          Retorna 'baseado_em_documentos: false'.
#   4. Envia o prompt final para o modelo Qwen (qwen2.5:14b) via Ollama.
#   5. Retorna a resposta com o texto gerado e a indicação de procedência.
#
# PONTO FUNDAMENTAL PARA O TCC:
# Esta arquitetura RAG condicional garante o princípio da "IA Responsável em Saúde":
# impede alucinações em dados sensíveis e dá total transparência ao paciente
# sobre a procedência da orientação recebida.
# ============================================================

from typing import List
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.config import settings
from app.deps import current_patient
from app import models
from app.services.rag_service import rag_service

# Prefixo /ai agrupa todos os endpoints de inteligência artificial
router = APIRouter(prefix="/ai", tags=["Assistente Virtual"])

# Timeout para geração de texto: modelos de 14B podem demorar alguns segundos
OLLAMA_TIMEOUT_SECONDS = 90.0


# -------------------------------------------------------
# Schemas de entrada e saída deste endpoint
# -------------------------------------------------------

class AskRequest(BaseModel):
    """Payload enviado pelo app com a pergunta do usuário."""
    question: str  # Texto da pergunta em linguagem natural


class AskResponse(BaseModel):
    """Resposta retornada ao app com o texto gerado pela IA e metadados RAG."""
    answer: str                          # Texto da resposta gerada pelo modelo
    baseado_em_documentos: bool = False  # True se embasada nos PDFs oficiais
    fontes: List[str] = []               # Documentos oficiais consultados


# -------------------------------------------------------
# Endpoint principal: POST /ai/ask
# -------------------------------------------------------

@router.post("/ask", response_model=AskResponse)
async def ask_ai(
    body: AskRequest,
    # Garante que apenas pacientes autenticados usem o assistente
    _patient: models.Patient = Depends(current_patient),
) -> AskResponse:
    """
    Recebe uma pergunta sobre vacinação, pesquisa documentos oficiais via RAG
    e gera uma resposta segura e fundamentada com o modelo local.
    """
    question_clean = body.question.strip()
    if not question_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A pergunta não pode estar vazia."
        )

    # -------------------------------------------------------
    # ETAPA 1: Busca Semântica no ChromaDB (RAG)
    # -------------------------------------------------------
    rag_result = await rag_service.query_relevant_documents(question_clean)

    # -------------------------------------------------------
    # ETAPA 2: Decisão Condicional do Prompt (Engenharia de Prompt Segura)
    # -------------------------------------------------------
    if rag_result.baseado_em_documentos:
        # ROTA 1: Resposta embasada em documentos oficiais do Ministério da Saúde / SBIm
        context_chunks_formatted = "\n\n".join(
            f"--- Trecho do documento: {chunk.source_file}"
            + (f" (Página {chunk.page})" if chunk.page else "")
            + f" ---\n{chunk.content}"
            for chunk in rag_result.chunks
        )

        final_prompt = (
            "Você é um assistente de saúde especializado em vacinação, parte do aplicativo VacinApp.\n"
            "Use ESTRITAMENTE as informações abaixo, extraídas de documentos oficiais"
            "para responder de forma clara, amigável e acolhedora em português brasileiro.\n"
            "Diretrizes importantes:\n"
            "1. Não acrescente dados específicos (como datas ou dosagens) que não estejam presentes nos trechos abaixo.\n"
            f"Informações dos documentos oficiais:\n{context_chunks_formatted}\n\n"
            f"Pergunta do usuário: {question_clean}"
        )
    else:
        # ROTA 2: Ausência de trechos oficiais que superem o limiar de similaridade
        # Não alucinar dados específicos (datas, doses, marcas de vacina)
        final_prompt = (
            "Você é um assistente de saúde especializado em vacinação, parte do aplicativo VacinApp.\n"
            "Não há informação sobre esta pergunta específica nos documentos oficiais disponíveis no sistema.\n"
            "Responda com seu conhecimento geral sobre o assunto, seguindo com rigor estas regras:\n"
            "1. NUNCA invente dados específicos como datas precisas, números de doses ou nomes comerciais de produtos que você não tenha absoluta certeza.\n"
            "2. Dê apenas orientações gerais e educativas de saúde.\n"
            "3. Deixe claro ao usuário, de forma natural e empática, que esta resposta é baseada em conhecimento geral de saúde e não nos documentos oficiais atualizados da nossa base.\n"
            "4. quando convenient recomende ao paciente que confirme a informação em uma Unidade Básica de Saúde (UBS), posto de vacinação ou com um profissional de saúde habilitado.\n\n"
            "5. Fale de forma simples e resumida para que seja entendido por todos.\n\n "
            "6. Sempre responda em Portugues do Brasil"
            f"Pergunta do usuário: {question_clean}"
        )

    # Payload formatado para a API do Ollama (/api/generate)
    ollama_payload = {
        "model": settings.ollama_model,
        "prompt": final_prompt,
        "stream": False,
    }

    # -------------------------------------------------------
    # ETAPA 3: Envio ao Modelo de IA Local (qwen2.5:14b)
    # -------------------------------------------------------
    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT_SECONDS) as client:
            response = await client.post(
                f"{settings.ollama_url}/api/generate",
                json=ollama_payload,
            )
            response.raise_for_status()

    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O assistente virtual está temporariamente indisponível. Certifique-se de que o Ollama está em execução.",
        )

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="O modelo demorou muito para responder. Tente uma pergunta mais curta ou tente novamente.",
        )

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Erro interno do assistente ({exc.response.status_code}). Verifique se o modelo está instalado no Ollama.",
        )

    # -------------------------------------------------------
    # ETAPA 4: Formatação da Resposta Final
    # -------------------------------------------------------
    data = response.json()
    answer_text = data.get("response", "").strip()

    if not answer_text:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="O assistente não retornou uma resposta válida. Tente novamente.",
        )

    return AskResponse(
        answer=answer_text,
        baseado_em_documentos=rag_result.baseado_em_documentos,
        fontes=rag_result.fontes,
    )
