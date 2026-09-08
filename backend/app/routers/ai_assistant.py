# ============================================================
# ROUTER: Assistente Virtual com IA Local (Ollama)
#
# Este módulo expõe um único endpoint POST /ai/ask que:
#   1. Recebe a pergunta do paciente autenticado
#   2. Monta o prompt e envia para o Ollama rodando localmente
#   3. Retorna a resposta da IA para o app
#
# A comunicação com o Ollama usa httpx (cliente HTTP assíncrono)
# para não bloquear o servidor FastAPI enquanto a IA processa.
#
# Para funcionar, o Ollama precisa estar rodando e o modelo
# configurado deve estar instalado:
#   ollama run qwen2.5:14b
# ============================================================

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.config import settings
from app.deps import current_patient
from app import models

# Prefixo /ai agrupa todos os endpoints de inteligência artificial
router = APIRouter(prefix="/ai", tags=["Assistente Virtual"])

# Timeout generoso: modelos de linguagem podem demorar alguns segundos
# para processar uma resposta complexa, especialmente na primeira chamada
OLLAMA_TIMEOUT_SECONDS = 60.0


# -------------------------------------------------------
# Schemas de entrada e saída deste endpoint
# -------------------------------------------------------

class AskRequest(BaseModel):
    """Payload enviado pelo app com a pergunta do usuário."""
    question: str  # Texto da pergunta em linguagem natural


class AskResponse(BaseModel):
    """Resposta retornada ao app com o texto gerado pela IA."""
    answer: str  # Texto da resposta gerada pelo modelo


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
    Recebe uma pergunta sobre vacinação e retorna a resposta da IA.

    O backend atua como intermediário entre o app e o Ollama:
    o app nunca se comunica diretamente com o Ollama (que só
    está acessível internamente via localhost).
    """

    # -------------------------------------------------------
    # Monta o prompt com contexto de domínio
    # Orientar o modelo a responder especificamente sobre
    # vacinação melhora a qualidade e a relevância da resposta.
    # -------------------------------------------------------
    system_context = (
        "Você é um assistente de saúde especializado em vacinação, "
        "fazendo parte do aplicativo VacinApp. "
        "Responda de forma clara, amigável e em português brasileiro. "
        "Foque em informações sobre vacinas, calendário vacinal, "
        "efeitos colaterais e orientações gerais de imunização. "
        "Se a pergunta não for sobre saúde ou vacinação, oriente o "
        "usuário a procurar um profissional de saúde ou a reformular "
        "a pergunta dentro do contexto do aplicativo."
    )

    # Payload no formato esperado pela API do Ollama
    # Referência: https://github.com/ollama/ollama/blob/main/docs/api.md
    ollama_payload = {
        "model": settings.ollama_model,    # Modelo configurado no .env (padrão: qwen2.5:14b)
        "prompt": f"{system_context}\n\nPergunta do usuário: {body.question}",
        "stream": False,                   # False = aguarda a resposta completa antes de retornar
    }

    # -------------------------------------------------------
    # Chama o Ollama via HTTP usando httpx assíncrono
    # -------------------------------------------------------
    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT_SECONDS) as client:
            response = await client.post(
                f"{settings.ollama_url}/api/generate",
                json=ollama_payload,
            )
            response.raise_for_status()  # Lança erro se o Ollama retornar HTTP 4xx/5xx

    except httpx.ConnectError:
        # Ollama não está rodando ou a URL está errada
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O assistente virtual está temporariamente indisponível. Tente novamente mais tarde.",
        )

    except httpx.TimeoutException:
        # O modelo demorou mais que o timeout configurado
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="A resposta demorou muito para chegar. Tente uma pergunta mais curta ou tente novamente.",
        )

    except httpx.HTTPStatusError as exc:
        # O Ollama retornou um erro HTTP (ex: modelo não instalado)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Erro interno do assistente: {exc.response.status_code}. Verifique se o modelo está instalado.",
        )

    # -------------------------------------------------------
    # Extrai a resposta do JSON retornado pelo Ollama
    # O campo "response" contém o texto gerado pelo modelo
    # -------------------------------------------------------
    data = response.json()
    answer_text = data.get("response", "").strip()

    if not answer_text:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="O assistente não retornou uma resposta. Tente novamente.",
        )

    return AskResponse(answer=answer_text)
