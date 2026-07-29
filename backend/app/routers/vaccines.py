# ============================================================
# ROUTER: Catálogo de vacinas
# Lista as vacinas cadastradas no sistema — usado no dropdown
# da tela "Registrar Vacinação" e em qualquer outra tela que
# precise exibir os nomes disponíveis.
# ============================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.database import get_db

router = APIRouter(prefix="/vaccines", tags=["Vacinas"])


@router.get("", response_model=list[str])
def list_vaccine_names(db: Session = Depends(get_db)):
    names = db.query(models.Vaccine.name).filter_by(active=True).order_by(models.Vaccine.name).all()
    return [n for (n,) in names]
