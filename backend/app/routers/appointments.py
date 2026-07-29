# ============================================================
# ROUTER: Agenda (appointments)
# Usado pela tela app/(professional)/agenda.tsx e pelos cartões
# de "hoje" na home do profissional.
# ============================================================

import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import models, schemas, utils
from app.database import get_db
from app.deps import current_professional

router = APIRouter(prefix="/appointments", tags=["Agenda"])


def _to_out(appt: models.Appointment) -> schemas.AppointmentOut:
    return schemas.AppointmentOut(
        id=str(appt.id),
        date=utils.to_iso_date(appt.appointment_date),
        time=appt.appointment_time.strftime("%H:%M"),
        patient_id=str(appt.patient_id),
        patient_name=appt.patient.user.name,
        vaccine=appt.vaccine.name if appt.vaccine else "—",
        plan=("SUS" if appt.patient.network_type == "public" else (appt.patient.health_plan or "—")),
        status=appt.status,
    )


@router.get("", response_model=list[schemas.AppointmentOut])
def list_appointments(
    date: str | None = Query(default=None, description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
    professional: models.Professional = Depends(current_professional),
):
    q = db.query(models.Appointment).filter_by(professional_id=professional.id)
    if date:
        q = q.filter(models.Appointment.appointment_date == dt.date.fromisoformat(date))
    appointments = q.order_by(models.Appointment.appointment_date, models.Appointment.appointment_time).all()
    return [_to_out(a) for a in appointments]


@router.patch("/{appointment_id}", response_model=schemas.AppointmentOut)
def update_appointment_status(
    appointment_id: int,
    payload: schemas.AppointmentUpdateRequest,
    db: Session = Depends(get_db),
    professional: models.Professional = Depends(current_professional),
):
    appt = db.get(models.Appointment, appointment_id)
    if appt is None or appt.professional_id != professional.id:
        raise HTTPException(404, "Agendamento não encontrado.")
    appt.status = payload.status
    db.commit()
    db.refresh(appt)
    return _to_out(appt)
