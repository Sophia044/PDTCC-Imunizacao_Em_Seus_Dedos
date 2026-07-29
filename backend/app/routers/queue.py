# ============================================================
# ROUTER: Fila pública de vacinação (triagem)
# Espelha o que services/PublicQueueStore.ts fazia em memória,
# agora persistido no banco e vinculado à unidade do usuário
# institucional autenticado.
# ============================================================

import datetime as dt

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas, utils
from app.database import get_db
from app.deps import current_unit, current_unit_from_professional_or_unit

router = APIRouter(prefix="/queue", tags=["Fila Pública"])


def _to_out(entry: models.PublicQueueEntry, position: int) -> schemas.PublicQueueItemOut:
    return schemas.PublicQueueItemOut(
        id=str(entry.id),
        patient_id=str(entry.patient_id),
        arrival_time=entry.arrival_time.strftime("%H:%M"),
        reason=entry.reason,
        status=entry.status,
        position=position,
        patient=utils.build_patient_profile(entry.patient),
    )


@router.get("", response_model=list[schemas.PublicQueueItemOut])
def get_queue(db: Session = Depends(get_db), unit: models.HealthUnit = Depends(current_unit_from_professional_or_unit)):
    entries = (
        db.query(models.PublicQueueEntry)
        .filter(
            models.PublicQueueEntry.health_unit_id == unit.id,
            models.PublicQueueEntry.status.in_(["waiting", "called"]),
        )
        .order_by(models.PublicQueueEntry.arrival_time)
        .all()
    )
    return [_to_out(e, i + 1) for i, e in enumerate(entries)]


@router.get("/find-patient", response_model=schemas.PatientProfileOut)
def find_patient_by_sus(sus: str, db: Session = Depends(get_db), _unit: models.HealthUnit = Depends(current_unit)):
    digits = utils.only_digits(sus)
    patient = db.query(models.Patient).filter_by(sus_number=digits).first()
    if patient is None:
        raise HTTPException(404, "Nenhum paciente encontrado com esse número do SUS.")
    return utils.build_patient_profile(patient)


@router.post("", response_model=schemas.PublicQueueItemOut, status_code=201)
def add_to_queue(
    payload: schemas.PublicQueueAddRequest,
    db: Session = Depends(get_db),
    unit: models.HealthUnit = Depends(current_unit),
):
    patient = None
    if payload.patient_id:
        patient = db.get(models.Patient, int(payload.patient_id))
    elif payload.sus:
        patient = db.query(models.Patient).filter_by(sus_number=utils.only_digits(payload.sus)).first()

    if patient is None:
        raise HTTPException(404, "Paciente não encontrado.")

    existing = (
        db.query(models.PublicQueueEntry)
        .filter_by(patient_id=patient.id, health_unit_id=unit.id, status="waiting")
        .first()
    )
    if existing:
        entries = db.query(models.PublicQueueEntry).filter_by(health_unit_id=unit.id, status="waiting").order_by(
            models.PublicQueueEntry.arrival_time
        ).all()
        position = next(i + 1 for i, e in enumerate(entries) if e.id == existing.id)
        return _to_out(existing, position)

    entry = models.PublicQueueEntry(patient_id=patient.id, health_unit_id=unit.id, reason=payload.reason)
    db.add(entry)
    db.commit()
    db.refresh(entry)

    total_waiting = db.query(models.PublicQueueEntry).filter_by(health_unit_id=unit.id, status="waiting").count()
    return _to_out(entry, total_waiting)


@router.post("/{queue_id}/call", response_model=schemas.PublicQueueItemOut)
def call_next(queue_id: int, db: Session = Depends(get_db), unit: models.HealthUnit = Depends(current_unit_from_professional_or_unit)):
    entry = db.get(models.PublicQueueEntry, queue_id)
    if entry is None or entry.health_unit_id != unit.id:
        raise HTTPException(404, "Registro da fila não encontrado.")
    entry.status = "called"
    db.commit()
    db.refresh(entry)
    return _to_out(entry, 0)


@router.delete("/{queue_id}", status_code=204)
def remove_from_queue(queue_id: int, db: Session = Depends(get_db), unit: models.HealthUnit = Depends(current_unit_from_professional_or_unit)):
    entry = db.get(models.PublicQueueEntry, queue_id)
    if entry is None or entry.health_unit_id != unit.id:
        raise HTTPException(404, "Registro da fila não encontrado.")
    db.delete(entry)
    db.commit()
