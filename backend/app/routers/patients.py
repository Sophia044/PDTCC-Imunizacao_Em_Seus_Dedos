# ============================================================
# ROUTER: Pacientes
# /patients/me      -> paciente vê o próprio histórico
# /patients         -> profissional lista pacientes (resumo)
# /patients/search  -> profissional busca por nome/cpf/sus/plano
# /patients/{id}    -> profissional abre o perfil completo
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app import models, schemas, utils
from app.database import get_db
from app.deps import current_patient, current_professional

router = APIRouter(prefix="/patients", tags=["Pacientes"])


@router.get("/me", response_model=schemas.PatientProfileOut)
def get_my_profile(patient: models.Patient = Depends(current_patient)):
    return utils.build_patient_profile(patient)


@router.get("", response_model=list[schemas.PatientOut])
def list_patients(
    query: str | None = Query(default=None, description="Filtro por nome ou CPF"),
    db: Session = Depends(get_db),
    _professional: models.Professional = Depends(current_professional),
):
    patients_query = db.query(models.Patient).join(models.User)
    if query:
        like = f"%{query}%"
        digits = utils.only_digits(query)
        conditions = [models.User.name.ilike(like)]
        if digits:
            conditions.append(models.Patient.cpf.like(f"%{digits}%"))
        patients_query = patients_query.filter(or_(*conditions))
    patients = patients_query.order_by(models.User.name).all()
    return [utils.build_patient_summary(p) for p in patients]


@router.get("/search", response_model=list[schemas.PatientProfileOut])
def search_patients(
    query: str = Query(default=""),
    filter: str = Query(default="name", pattern="^(name|cpf|sus|plan)$"),
    db: Session = Depends(get_db),
    _professional: models.Professional = Depends(current_professional),
):
    patients_query = db.query(models.Patient).join(models.User)
    if query:
        digits = utils.only_digits(query)
        like = f"%{query}%"
        if filter == "name":
            patients_query = patients_query.filter(models.User.name.ilike(like))
        elif filter == "cpf":
            patients_query = patients_query.filter(models.Patient.cpf.like(f"%{digits}%")) if digits else patients_query.filter(False)
        elif filter == "sus":
            patients_query = patients_query.filter(models.Patient.sus_number.like(f"%{digits}%")) if digits else patients_query.filter(False)
        elif filter == "plan":
            patients_query = patients_query.filter(models.Patient.health_plan.ilike(like))
    patients = patients_query.order_by(models.User.name).all()
    return [utils.build_patient_profile(p) for p in patients]


@router.get("/{patient_id}", response_model=schemas.PatientProfileOut)
def get_patient_profile(
    patient_id: int,
    db: Session = Depends(get_db),
    _professional: models.Professional = Depends(current_professional),
):
    patient = db.get(models.Patient, patient_id)
    if patient is None:
        raise HTTPException(404, "Paciente não encontrado.")
    return utils.build_patient_profile(patient)
