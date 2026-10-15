# ============================================================
# ROUTER: Validação de CRM no portal do CFM
#
# GET  /crm/validate?crm=123456&uf=SP
#   → Consulta o portal oficial do CFM (https://portal.cfm.org.br/busca-medicos)
#     usando Playwright headless e retorna os dados cadastrais do médico.
#
# ⚠️  A consulta demora entre 10-30 segundos porque abre um browser
#     real em modo headless. O front-end deve exibir um indicador de
#     carregamento ("Verificando CRM...").
#
# IMPORTANTE: o Playwright é importado só dentro do endpoint
# (import preguiçoso). Assim, se ele não estiver instalado, apenas
# esta rota falha (503) — o resto da API (login, pacientes etc.)
# continua subindo normalmente.
# ============================================================

import logging

from fastapi import APIRouter, HTTPException, Query, status

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/crm", tags=["Validação CRM"])


@router.get(
    "/validate",
    summary="Valida CRM no portal oficial do CFM",
    response_description="Dados cadastrais do médico consultados em tempo real no CFM.",
)
async def validate_crm(
    crm: str = Query(..., description="Número do CRM (somente dígitos, ex: 123456)", example="52211"),
    uf: str = Query(..., description="Sigla da UF de inscrição (2 letras, ex: SP)", example="SP"),
) -> dict:
    """
    Retorna: valido, nome, situacao, especialidades, crm, uf, erro.
    """
    try:
        from app.utils.validar_crm import _validar_crm_async
    except ImportError as exc:
        logger.error("Playwright não está disponível: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Validação de CRM indisponível: Playwright não está instalado no servidor.",
        )

    logger.info("Validando CRM %s/%s no portal do CFM...", crm, uf.upper())

    try:
        resultado = await _validar_crm_async(crm, uf)
    except Exception as exc:
        logger.error("Erro inesperado ao validar CRM %s/%s: %s", crm, uf, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Não foi possível consultar o portal do CFM. Tente novamente em instantes.",
        )

    if resultado.valido:
        logger.info("CRM %s/%s válido — %s", crm, uf.upper(), resultado.nome)
    else:
        logger.warning("CRM %s/%s inválido ou não encontrado. Motivo: %s", crm, uf.upper(), resultado.erro)

    return resultado.to_dict()
