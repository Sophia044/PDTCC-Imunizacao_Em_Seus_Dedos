# ============================================================
# ROUTER: Registro de vacinação
# Endpoint principal usado pela tela "Registrar Vacinação"
# (app/(professional)/register-vaccine.tsx).
#
# CORREÇÕES:
# 1) Bloqueia registrar a MESMA vacina/dose/data duas vezes para
#    o mesmo paciente (evita duplo clique / reenvio criando dois
#    registros válidos de uma vacinação que já foi aplicada).
# 2) Quando a dose aplicada corresponde a um agendamento
#    "scheduled" do paciente para aquela vacina, o agendamento é
#    marcado como "done" automaticamente. Sem isso, a agenda do
#    profissional (app/(professional)/agenda.tsx) nunca refletia
#    o registro da vacinação, e o paciente continuava aparecendo
#    como "aguardando"/pendente mesmo após ser vacinado.
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


def _mark_matching_appointment_done(db: Session, patient: models.Patient, vaccine: models.Vaccine) -> None:
    """
    Quando a dose é efetivamente aplicada, o agendamento dessa
    mesma vacina para o paciente deixa de ser "pendente" — isso
    alimenta tanto a agenda do profissional (rede privada) quanto
    o cálculo de pendências/atrasos do paciente, já que ambos
    derivam de `appointments` com status "scheduled"
    (ver utils.build_patient_vaccine_history).
    """
    appointment = (
        db.query(models.Appointment)
        .filter_by(patient_id=patient.id, vaccine_id=vaccine.id, status="scheduled")
        .order_by(models.Appointment.appointment_date)
        .first()
    )
    if appointment is not None:
        appointment.status = "done"


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
    application_date = utils.parse_br_date(payload.date)

    # Evita registrar a mesma vacinação (vacina + dose + data) mais de uma vez
    duplicate = (
        db.query(models.VaccinationRecord)
        .filter_by(
            patient_id=patient.id,
            vaccine_id=vaccine.id,
            dose=payload.dose,
            application_date=application_date,
            status="valid",
        )
        .first()
    )
    if duplicate is not None:
        raise HTTPException(
            400,
            "Esta vacinação (mesma vacina, dose e data) já foi registrada para este paciente.",
        )

    record = models.VaccinationRecord(
        patient_id=patient.id,
        vaccine_id=vaccine.id,
        professional_id=professional.id,
        health_unit_id=health_unit.id,
        dose=payload.dose,
        manufacturer=payload.manufacturer,
        lot=payload.lot,
        application_date=application_date,
        notes=payload.notes,
        network_type=payload.network_type,
    )
    db.add(record)

    # Fecha o agendamento correspondente, se houver (mantém a agenda em dia)
    _mark_matching_appointment_done(db, patient, vaccine)

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
