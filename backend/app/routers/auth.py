# ============================================================
# ROUTER: Autenticação
# Login e cadastro para os três perfis de acesso do app:
# paciente (SUS/Convênio), profissional e unidade de saúde.
#
# Os formatos de entrada/saída seguem exatamente os payloads já
# documentados nas telas do front-end (ver comentários
# "PREPARADO PARA BACKEND" em VacinApp/app/(auth)/*.tsx).
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas, utils
from app.database import get_db
from app.deps import current_unit_user
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Autenticação"])


# ------------------------------------------------------------
# PACIENTE
# ------------------------------------------------------------
@router.post("/patient/register/sus", response_model=schemas.TokenResponse, status_code=201)
def register_patient_sus(payload: schemas.PatientRegisterSusRequest, db: Session = Depends(get_db)):
    cpf = utils.only_digits(payload.cpf)
    cns = utils.only_digits(payload.cns)

    if db.query(models.User).filter_by(email=payload.email).first():
        raise HTTPException(400, "Este e-mail já está cadastrado.")
    if db.query(models.Patient).filter_by(cpf=cpf, network_type="public").first():
        raise HTTPException(400, "Este CPF já possui cadastro na rede pública.")

    user = models.User(name=payload.name, email=payload.email, password_hash=hash_password(payload.password), role="patient")
    db.add(user)
    db.flush()

    patient = models.Patient(
        user_id=user.id,
        cpf=cpf,
        birth_date=utils.parse_br_date(payload.birthdate),
        phone=payload.phone,
        network_type="public",
        sus_number=cns,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    token = create_access_token(f"patient:{patient.id}")
    return schemas.TokenResponse(token=token)


@router.post("/patient/register/private", response_model=schemas.TokenResponse, status_code=201)
def register_patient_private(payload: schemas.PatientRegisterPrivateRequest, db: Session = Depends(get_db)):
    cpf = utils.only_digits(payload.cpf)

    if db.query(models.User).filter_by(email=payload.email).first():
        raise HTTPException(400, "Este e-mail já está cadastrado.")
    if db.query(models.Patient).filter_by(cpf=cpf, network_type="private").first():
        raise HTTPException(400, "Este CPF já possui cadastro na rede privada.")

    user = models.User(name=payload.name, email=payload.email, password_hash=hash_password(payload.password), role="patient")
    db.add(user)
    db.flush()

    patient = models.Patient(
        user_id=user.id,
        cpf=cpf,
        birth_date=utils.parse_br_date(payload.birthdate),
        phone=payload.phone,
        network_type="private",
        health_plan=payload.convenio,
        health_plan_card=payload.carteirinha,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    token = create_access_token(f"patient:{patient.id}")
    return schemas.TokenResponse(token=token)


@router.post("/patient/login", response_model=schemas.TokenResponse)
def login_patient(payload: schemas.PatientLoginRequest, db: Session = Depends(get_db)):
    network_type = "public" if payload.network_type == "sus" else "private"
    cpf = utils.only_digits(payload.cpf)

    patient = db.query(models.Patient).filter_by(cpf=cpf, network_type=network_type).first()
    if patient is None or not verify_password(payload.password, patient.user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "CPF ou senha inválidos.")
    if not patient.user.active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Conta desativada. Procure a unidade de saúde.")

    token = create_access_token(f"patient:{patient.id}")
    return schemas.TokenResponse(token=token)


# ------------------------------------------------------------
# PROFISSIONAL
# ------------------------------------------------------------
def _infer_council_type(registry: str) -> str:
    registry_upper = registry.upper()
    if "CRM" in registry_upper:
        return "CRM"
    if "COREN" in registry_upper:
        return "COREN"
    return "OTHER"


def _get_or_create_unit(db: Session, name: str, network_type: str) -> models.HealthUnit:
    unit = db.query(models.HealthUnit).filter_by(name=name).first()
    if unit:
        return unit
    unit = models.HealthUnit(
        name=name,
        type=network_type,
        address="Endereço a confirmar",
        cnes="0000000" if network_type == "public" else None,
    )
    db.add(unit)
    db.flush()
    return unit


@router.post("/professional/register", response_model=schemas.TokenResponse, status_code=201)
def register_professional(payload: schemas.ProfessionalRegisterRequest, db: Session = Depends(get_db)):
    council_type = _infer_council_type(payload.professional_registry)

    if db.query(models.User).filter_by(email=payload.email).first():
        raise HTTPException(400, "Este e-mail já está cadastrado.")
    if db.query(models.Professional).filter_by(
        council_type=council_type, professional_registry=payload.professional_registry
    ).first():
        raise HTTPException(400, "Este registro profissional já está cadastrado.")

    user = models.User(
        name=payload.name, email=payload.email, password_hash=hash_password(payload.password), role="professional"
    )
    db.add(user)
    db.flush()

    professional = models.Professional(
        user_id=user.id,
        council_type=council_type,
        professional_registry=payload.professional_registry,
        specialty=payload.specialty,
        network_type=payload.network_type,
        verification_status="pending",
    )
    db.add(professional)
    db.flush()

    unit = _get_or_create_unit(db, payload.unit_name, payload.network_type)
    db.add(models.ProfessionalHealthUnit(professional_id=professional.id, health_unit_id=unit.id))
    db.commit()
    db.refresh(professional)

    token = create_access_token(f"professional:{professional.id}")
    return schemas.TokenResponse(token=token)


@router.post("/professional/login", response_model=schemas.TokenResponse)
def login_professional(payload: schemas.ProfessionalLoginRequest, db: Session = Depends(get_db)):
    professional = (
        db.query(models.Professional)
        .join(models.User)
        .filter(
            models.User.email == payload.email,
            models.Professional.professional_registry == payload.professional_registry,
            models.Professional.network_type == payload.network_type,
        )
        .first()
    )
    if professional is None or not verify_password(payload.password, professional.user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciais inválidas.")
    if not professional.user.active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Conta desativada.")

    # Rede Privada: a instituição é obrigatória e precisa corresponder à
    # unidade de saúde vinculada a este profissional em
    # professional_health_units (ligação feita no cadastro, via
    # _get_or_create_unit). Isso liga de fato o campo "Instituição" do
    # login a um estabelecimento real do sistema, em vez de ser apenas
    # texto decorativo.
    if payload.network_type == "private":
        institution = (payload.institution or "").strip()
        if not institution:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Informe a instituição vinculada ao seu cadastro.",
            )
        link = next((l for l in professional.unit_links if l.active), None)
        if link is None or link.health_unit.name.strip().lower() != institution.lower():
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                "Instituição não corresponde ao cadastro deste profissional.",
            )

    token = create_access_token(f"professional:{professional.id}")
    return schemas.TokenResponse(token=token)


# ------------------------------------------------------------
# UNIDADE DE SAÚDE (triagem)
# ------------------------------------------------------------
@router.post("/unit/login", response_model=schemas.TokenResponse)
def login_unit(payload: schemas.UnitLoginRequest, db: Session = Depends(get_db)):
    cnes = utils.only_digits(payload.cnes)
    unit = db.query(models.HealthUnit).filter_by(cnes=cnes).first()
    if unit is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "CNES não encontrado.")

    unit_user = (
        db.query(models.HealthUnitUser)
        .filter(
            models.HealthUnitUser.health_unit_id == unit.id,
            (models.HealthUnitUser.email == payload.identifier)
            | (models.HealthUnitUser.registration_number == payload.identifier),
        )
        .first()
    )
    if unit_user is None or not verify_password(payload.password, unit_user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciais inválidas.")
    if not unit_user.active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Usuário desativado.")

    token = create_access_token(f"unit:{unit_user.id}", extra_claims={"healthUnitId": unit.id})
    return schemas.TokenResponse(token=token)


@router.get("/unit/me", response_model=schemas.UnitOut)
def get_my_unit(unit_user: models.HealthUnitUser = Depends(current_unit_user)):
    unit = unit_user.health_unit
    return schemas.UnitOut(id=str(unit.id), name=unit.name, cnes=unit.cnes or "—")
