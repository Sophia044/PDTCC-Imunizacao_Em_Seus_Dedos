# ============================================================
# ROUTER: Pacientes
# /patients/me      -> paciente vê o próprio histórico
# /patients         -> profissional lista pacientes (resumo)
# /patients/search  -> profissional busca por nome/cpf/sus/plano
# /patients/{id}    -> profissional abre o perfil completo
#
# CRIPTOGRAFIA: CPF e CNS estão criptografados no banco, então não
# dá para usar LIKE em SQL. A busca por nome/plano continua em SQL;
# a busca por CPF/CNS (parcial) é feita em Python, depois que o
# SQLAlchemy descriptografa os registros. Para o porte do projeto
# (TCC) isso é perfeitamente adequado.
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import models, schemas, utils
from app.database import get_db
from app.deps import current_patient, current_professional

router = APIRouter(prefix="/patients", tags=["Pacientes"])


def _base_query(db: Session):
    return db.query(models.Patient).join(models.User)


@router.get("/me", response_model=schemas.PatientProfileOut)
def get_my_profile(patient: models.Patient = Depends(current_patient)):
    return utils.build_patient_profile(patient)


@router.get("", response_model=list[schemas.PatientOut])
def list_patients(
    query: str | None = Query(default=None, description="Filtro por nome ou CPF"),
    db: Session = Depends(get_db),
    _professional: models.Professional = Depends(current_professional),
):
    patients = _base_query(db).order_by(models.User.name).all()
    if query:
        digits = utils.only_digits(query)
        needle = query.strip().lower()
        patients = [
            p for p in patients
            if needle in p.user.name.lower() or (digits and digits in (p.cpf or ""))
        ]
    return [utils.build_patient_summary(p) for p in patients]


@router.get("/search", response_model=list[schemas.PatientProfileOut])
def search_patients(
    query: str = Query(default=""),
    filter: str = Query(default="name", pattern="^(name|cpf|sus|plan)$"),
    db: Session = Depends(get_db),
    _professional: models.Professional = Depends(current_professional),
):
    patients_query = _base_query(db)
    digits = utils.only_digits(query)

    # Filtros que ainda funcionam em SQL (campos não criptografados)
    if query and filter == "name":
        patients_query = patients_query.filter(models.User.name.ilike(f"%{query}%"))
    elif query and filter == "plan":
        patients_query = patients_query.filter(models.Patient.health_plan.ilike(f"%{query}%"))

    patients = patients_query.order_by(models.User.name).all()

    # Filtros em campos criptografados: feitos em Python após descriptografar
    if query and filter == "cpf":
        patients = [p for p in patients if digits and digits in (p.cpf or "")]
    elif query and filter == "sus":
        patients = [p for p in patients if digits and digits in (p.sus_number or "")]

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
