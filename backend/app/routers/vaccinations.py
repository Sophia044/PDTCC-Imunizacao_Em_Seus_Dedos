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


def _resolve_health_unit(
    db: Session, professional: models.Professional, health_unit_id: str | None
) -> models.HealthUnit:
    """
    Determina a unidade de saúde do registro de vacinação.

    - Se `health_unit_id` não for informado, usa a unidade vinculada
      ao profissional autenticado (comportamento padrão/travado da
      tela de registro).
    - Se for informado, precisa ser o ID de uma unidade ativa
      realmente cadastrada em `health_units` — nunca um texto livre.
      O front-end só permite essa troca depois de o profissional
      confirmar o próprio CRM/COREN em POST /professionals/me/verify-registry
      e selecionar a unidade em uma lista (não digitar livremente),
      mas o backend valida de qualquer forma, já que é a fonte da
      verdade.
    """
    if not health_unit_id:
        return _professional_active_unit(db, professional)

    try:
        unit_id = int(health_unit_id)
    except (TypeError, ValueError):
        raise HTTPException(400, "Unidade de saúde inválida.")

    unit = db.get(models.HealthUnit, unit_id)
    if unit is None or not unit.active:
        raise HTTPException(400, "Unidade de saúde inválida.")
    return unit


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
    health_unit = _resolve_health_unit(db, professional, payload.health_unit_id)

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

    # ----------------------------------------------------------------
    # Ao registrar a vacina, marcar como "done" todos os agendamentos
    # pendentes (scheduled) do mesmo paciente para essa mesma vacina.
    # Isso garante que vacinas atrasadas (overdue) saiam do histórico
    # assim que forem efetivamente aplicadas.
    # ----------------------------------------------------------------
    pending_appointments = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.patient_id == patient.id,
            models.Appointment.vaccine_id == vaccine.id,
            models.Appointment.status == "scheduled",
        )
        .all()
    )
    for appt in pending_appointments:
        appt.status = "done"

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
