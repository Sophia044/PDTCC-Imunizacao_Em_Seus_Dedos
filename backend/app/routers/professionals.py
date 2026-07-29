# ============================================================
# ROUTER: Profissionais
# /professionals/me -> dados do profissional autenticado, no
# mesmo formato que a tela de login já esperava (ProfessionalUser).
# ============================================================

from fastapi import APIRouter, Depends

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
    )


@router.get("/me", response_model=schemas.ProfessionalUserOut)
def get_my_professional_profile(professional: models.Professional = Depends(current_professional)):
    return _to_professional_user_out(professional)
