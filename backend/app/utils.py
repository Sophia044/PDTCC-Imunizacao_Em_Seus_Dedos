# ============================================================
# FUNÇÕES UTILITÁRIAS
# Conversões de data, cálculo de idade, montagem do histórico
# vacinal (pendente/atrasado/completo) e cálculo de distância
# entre coordenadas — usadas por vários routers.
# ============================================================

from __future__ import annotations

import datetime as dt
import math
import re

from app import models, schemas


def only_digits(value: str) -> str:
    return re.sub(r"\D", "", value or "")


def parse_br_date(value: str) -> dt.date:
    """Converte 'DD/MM/AAAA' (formato usado no front-end) para date."""
    return dt.datetime.strptime(value.strip(), "%d/%m/%Y").date()


def to_br_date(value: dt.date) -> str:
    return value.strftime("%d/%m/%Y")


def to_iso_date(value: dt.date) -> str:
    return value.strftime("%Y-%m-%d")


def calculate_age(birth_date: dt.date, today: dt.date | None = None) -> int:
    today = today or dt.date.today()
    years = today.year - birth_date.year
    if (today.month, today.day) < (birth_date.month, birth_date.day):
        years -= 1
    return years


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def build_patient_vaccine_history(patient: models.Patient, today: dt.date | None = None) -> list[schemas.VaccineOut]:
    """
    Monta o histórico vacinal exibido ao paciente/profissional,
    combinando:
      - vaccination_records (doses já aplicadas -> status "complete")
      - appointments com vacina definida (doses previstas -> "pending"
        se a data ainda não chegou, "overdue" se já passou e não foi
        aplicada)

    Essa combinação existe porque o schema original não tem uma
    tabela de "calendário vacinal previsto"; agendamentos futuros
    já cumprem esse papel muito bem sem duplicar conceito.
    """
    today = today or dt.date.today()
    items: list[schemas.VaccineOut] = []

    for record in patient.vaccination_records:
        if record.status == "cancelled":
            continue
        items.append(
            schemas.VaccineOut(
                id=f"vac-{record.id}",
                name=record.vaccine.name,
                date=to_iso_date(record.application_date),
                status="complete",
                dose=record.dose,
                location=record.health_unit.name if record.health_unit else None,
                next_dose=to_iso_date(record.next_dose_date) if record.next_dose_date else None,
                notes=record.notes,
            )
        )

    for appt in patient.appointments:
        if appt.status != "scheduled" or appt.vaccine is None:
            continue
        status = "overdue" if appt.appointment_date < today else "pending"
        items.append(
            schemas.VaccineOut(
                id=f"apt-{appt.id}",
                name=appt.vaccine.name,
                date=to_iso_date(appt.appointment_date),
                status=status,
                dose=None,
                location=appt.health_unit.name if appt.health_unit else None,
                next_dose=to_iso_date(appt.appointment_date),
                notes=appt.notes,
            )
        )

    items.sort(key=lambda v: v.date, reverse=True)
    return items


def build_patient_profile(patient: models.Patient) -> schemas.PatientProfileOut:
    vaccines = build_patient_vaccine_history(patient)
    completed = [v for v in vaccines if v.status == "complete"]
    pending = [v for v in vaccines if v.status == "pending"]
    overdue = [v for v in vaccines if v.status == "overdue"]

    last_vaccine = completed[0] if completed else None

    return schemas.PatientProfileOut(
        id=str(patient.id),
        name=patient.user.name,
        age=calculate_age(patient.birth_date),
        cpf=patient.cpf,
        last_vaccine=last_vaccine.name if last_vaccine else "—",
        last_vaccine_date=to_br_date(dt.date.fromisoformat(last_vaccine.date)) if last_vaccine else "—",
        pending_count=len(pending) + len(overdue),
        sus=patient.sus_number or "—",
        plan=("SUS" if patient.network_type == "public" else (patient.health_plan or "—")),
        blood_type=patient.blood_type or "—",
        allergies=[a.strip() for a in (patient.allergies or "").split(",") if a.strip()],
        vaccines=vaccines,
        pending_vaccines=[v.name for v in pending],
        overdue_vaccines=[v.name for v in overdue],
        email=patient.user.email,
        birth_date=to_br_date(patient.birth_date),
        phone=patient.phone,
    )


def build_patient_summary(patient: models.Patient) -> schemas.PatientOut:
    profile = build_patient_profile(patient)
    return schemas.PatientOut(
        id=profile.id,
        name=profile.name,
        age=profile.age,
        cpf=profile.cpf,
        last_vaccine=profile.last_vaccine,
        last_vaccine_date=profile.last_vaccine_date,
        pending_count=profile.pending_count,
    )
