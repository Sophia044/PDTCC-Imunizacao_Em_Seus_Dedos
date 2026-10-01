# ============================================================
# ROUTER: Profissionais
# /professionals/me -> dados do profissional autenticado, no
# mesmo formato que a tela de login já esperava (ProfessionalUser).
#
# /professionals/me/verify-registry -> confirma que o CRM/COREN
# informado é o mesmo do profissional autenticado. Usado pela tela
# de Registrar Vacinação para "liberar" a troca da unidade de
# saúde padrão (que vem travada com a unidade vinculada ao
# profissional).
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status

from app import models, schemas
from app.deps import current_professional

router = APIRouter(prefix="/professionals", tags=["Profissionais"])


def _to_professional_user_out(professional: models.Professional) -> schemas.ProfessionalUserOut:
    active_link = next((link for link in professional.unit_links if link.active), None)
    unit = active_link.health_unit if active_link else None

    is_public = professional.network_type == "public"
    return schemas.ProfessionalUserOut(
        id=str(professional.id),
        name=professional.user.name,
        role=professional.role_label,
        registry=professional.professional_registry,
        network_type=professional.network_type,
        unit=(unit.name if (unit and is_public) else ""),
        institution=(unit.name if (unit and not is_public) else None),
        health_unit_id=(str(unit.id) if unit else None),
    )


@router.get("/me", response_model=schemas.ProfessionalUserOut)
def get_my_professional_profile(professional: models.Professional = Depends(current_professional)):
    return _to_professional_user_out(professional)


@router.post("/me/verify-registry", response_model=schemas.ProfessionalVerifyResponse)
def verify_my_registry(
    payload: schemas.ProfessionalVerifyRegistryRequest,
    professional: models.Professional = Depends(current_professional),
):
    """
    Confere se o CRM/COREN informado bate com o cadastro do
    profissional já autenticado (não é um segundo login — o token
    JWT continua sendo a autenticação real). Serve apenas como uma
    segunda confirmação explícita antes de liberar a troca da
    unidade de saúde padrão na tela de registro de vacinação.
    """
    provided = payload.professional_registry.strip().upper()
    current = professional.professional_registry.strip().upper()
    if not provided or provided != current:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Registro profissional não confere com o seu cadastro.",
        )
    return schemas.ProfessionalVerifyResponse(verified=True)
