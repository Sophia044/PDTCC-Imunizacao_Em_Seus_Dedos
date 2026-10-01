# ============================================================
# ROUTER: Validação de CRM no portal do CFM
#
# GET  /crm/validate?crm=123456&uf=SP
#   → Consulta o portal oficial do CFM (https://portal.cfm.org.br/busca-medicos)
#     usando Playwright headless e retorna os dados cadastrais do médico.
#
# Esta rota é utilizada na tela de cadastro de profissionais para
# garantir que o CRM informado exista e esteja com situação "Regular"
# antes de criar a conta no sistema.
#
# ⚠️  A consulta demora entre 10-30 segundos porque abre um browser
#     real em modo headless para contornar o reCAPTCHA do portal do CFM.
#     Por isso a rota tem timeout de 60 s e o front-end deve exibir
#     um indicador de carregamento ("Verificando CRM...").
# ============================================================

import asyncio
import logging

from fastapi import APIRouter, HTTPException, Query, status

from app.utils.validar_crm import _validar_crm_async

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/crm", tags=["Validação CRM"])


@router.get(
    "/validate",
    summary="Valida CRM no portal oficial do CFM",
    response_description=(
        "Dados cadastrais do médico consultados em tempo real no CFM."
    ),
)
async def validate_crm(
    crm: str = Query(
        ...,
        description="Número do CRM (somente dígitos, ex: 123456)",
        example="52211",
    ),
    uf: str = Query(
        ...,
        description="Sigla da UF de inscrição (2 letras, ex: SP)",
        example="SP",
    ),
) -> dict:
    """
    Consulta o portal do CFM em tempo real e retorna:

    - **valido**: `true` se o médico está cadastrado e com situação Regular.
    - **nome**: nome completo do médico.
    - **situacao**: situação cadastral (ex: "Regular", "Suspenso").
    - **especialidades**: lista de especialidades registradas no CFM.
    - **crm**: número do CRM normalizado.
    - **uf**: UF normalizada.
    - **erro**: mensagem de erro caso a consulta falhe.

    > ℹ️ A consulta usa Playwright (browser headless) para navegar no portal
    > do CFM, pois o site exige JavaScript e possui reCAPTCHA.
    > O tempo de resposta típico é de **15 a 40 segundos**.
    """
    logger.info("Validando CRM %s/%s no portal do CFM...", crm, uf.upper())

    try:
        # Executa a consulta assíncrona diretamente no event loop do FastAPI.
        # _validar_crm_async já é uma coroutine — podemos awaitar diretamente.
        resultado = await _validar_crm_async(crm, uf)
    except Exception as exc:
        logger.error("Erro inesperado ao validar CRM %s/%s: %s", crm, uf, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Não foi possível consultar o portal do CFM. "
                "Tente novamente em instantes."
            ),
        )

    # Loga o resultado resumido
    if resultado.valido:
        logger.info("CRM %s/%s válido — %s", crm, uf.upper(), resultado.nome)
    else:
        logger.warning(
            "CRM %s/%s inválido ou não encontrado. Motivo: %s",
            crm, uf.upper(), resultado.erro,
        )

    return resultado.to_dict()
