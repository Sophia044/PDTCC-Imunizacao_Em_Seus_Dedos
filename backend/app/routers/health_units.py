# ============================================================
# ROUTER: Unidades de saúde (UBS, postos, clínicas, hospitais)
# Usado pelo mapa do paciente (app/(patient)/map.tsx), pela
# triagem (para achar a unidade pelo CNES) e pelo cadastro de
# profissional (vínculo com a unidade).
# ============================================================

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app import models, schemas, utils
from app.database import get_db

router = APIRouter(prefix="/health-units", tags=["Unidades de Saúde"])


def _to_out(unit: models.HealthUnit, user_lat: float | None, user_lng: float | None) -> schemas.HealthUnitOut:
    distance = None
    if user_lat is not None and user_lng is not None and unit.latitude is not None and unit.longitude is not None:
        km = utils.haversine_km(user_lat, user_lng, float(unit.latitude), float(unit.longitude))
        distance = f"{km:.1f} km".replace(".", ",")

    return schemas.HealthUnitOut(
        id=str(unit.id),
        name=unit.name,
        address=unit.address,
        type=("SUS" if unit.type == "public" else "Particular"),
        hours=unit.opening_hours or "Horário não informado",
        phone=unit.phone or "—",
        lat=float(unit.latitude) if unit.latitude is not None else None,
        lng=float(unit.longitude) if unit.longitude is not None else None,
        distance=distance,
    )


@router.get("", response_model=list[schemas.HealthUnitOut])
def list_health_units(
    lat: float | None = Query(default=None),
    lng: float | None = Query(default=None),
    db: Session = Depends(get_db),
):
    units = db.query(models.HealthUnit).filter_by(active=True).order_by(models.HealthUnit.name).all()
    result = [_to_out(u, lat, lng) for u in units]
    if lat is not None and lng is not None:
        result.sort(key=lambda u: float(u.distance.replace(" km", "").replace(",", ".")) if u.distance else 999)
    return result
