# ============================================================
# ROUTER: Campanhas vacinais ativas
# Usado no card de campanha da home do profissional.
# ============================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas, utils
from app.database import get_db
from app.deps import current_professional

router = APIRouter(prefix="/campaigns", tags=["Campanhas"])


@router.get("", response_model=list[schemas.CampaignOut])
def list_campaigns(
    db: Session = Depends(get_db),
    professional: models.Professional = Depends(current_professional),
):
    link = next((l for l in professional.unit_links if l.active), None)
    if link is None:
        return []

    campaigns = (
        db.query(models.Campaign)
        .filter_by(health_unit_id=link.health_unit_id, active=True)
        .order_by(models.Campaign.deadline)
        .all()
    )
    return [
        schemas.CampaignOut(
            id=str(c.id),
            name=c.name,
            target=c.target,
            deadline=utils.to_br_date(c.deadline),
            applied=c.applied,
            goal=c.goal,
        )
        for c in campaigns
    ]
