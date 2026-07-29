# ============================================================
# ROUTER: Estoque de vacinas da unidade
# Usado no card de alerta de estoque baixo na home do profissional.
# ============================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.deps import current_professional

router = APIRouter(prefix="/stock", tags=["Estoque"])


@router.get("", response_model=list[schemas.StockItemOut])
def list_stock(
    db: Session = Depends(get_db),
    professional: models.Professional = Depends(current_professional),
):
    link = next((l for l in professional.unit_links if l.active), None)
    if link is None:
        return []

    items = db.query(models.StockItem).filter_by(health_unit_id=link.health_unit_id).all()
    return [
        schemas.StockItemOut(
            id=str(item.id),
            vaccine=item.vaccine.name,
            quantity=item.quantity,
            min_level=item.min_level,
        )
        for item in items
    ]
