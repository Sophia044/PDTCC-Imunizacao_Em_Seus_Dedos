# ============================================================
# ROUTER: Registro de vacinação
# Endpoint principal usado pela tela "Registrar Vacinação"
# (app/(professional)/register-vaccine.tsx).
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas, utils
from app.database import get_db
from app.deps import current_professional

router = APIRouter(prefix="/vaccinations", tags=["Vacinações"])


def _get_or_create_vaccine(db: Session, name: str) -> models.Vaccine:
    vaccine = db.query(models.Vaccine).filter_by(name=name).first()
    if vaccine:
        return vaccine
    vaccine = models.Vaccine(name=name)
    db.add(vaccine)
    db.flush()
    return vaccine


def _professional_active_unit(db: Session, professional: models.Professional) -> models.HealthUnit:
    link = next((l for l in professional.unit_links if l.active), None)
    if link is None:
        raise HTTPException(400, "Profissional não está vinculado a nenhuma unidade de saúde.")
    return link.health_unit


@router.post("", response_model=schemas.VaccineOut, status_code=201)
def register_vaccination(
    payload: schemas.VaccinationCreateRequest,
    db: Session = Depends(get_db),
    professional: models.Professional = Depends(current_professional),
):
    patient = db.get(models.Patient, int(payload.patient_id))
    if patient is None:
        raise HTTPException(404, "Paciente não encontrado.")

    vaccine = _get_or_create_vaccine(db, payload.vaccine)
    health_unit = _professional_active_unit(db, professional)

    record = models.VaccinationRecord(
        patient_id=patient.id,
        vaccine_id=vaccine.id,
        professional_id=professional.id,
        health_unit_id=health_unit.id,
        dose=payload.dose,
        manufacturer=payload.manufacturer,
        lot=payload.lot,
        application_date=utils.parse_br_date(payload.date),
        notes=payload.notes,
        network_type=payload.network_type,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return schemas.VaccineOut(
        id=f"vac-{record.id}",
        name=vaccine.name,
        date=utils.to_iso_date(record.application_date),
        status="complete",
        dose=record.dose,
        location=health_unit.name,
        notes=record.notes,
    )


@router.get("", response_model=list[schemas.VaccineOut])
def list_vaccinations(
    patient_id: int,
    db: Session = Depends(get_db),
    _professional: models.Professional = Depends(current_professional),
):
    patient = db.get(models.Patient, patient_id)
    if patient is None:
        raise HTTPException(404, "Paciente não encontrado.")
    return utils.build_patient_vaccine_history(patient)
