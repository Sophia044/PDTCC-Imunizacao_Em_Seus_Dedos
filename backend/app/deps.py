# ============================================================
# DEPENDÊNCIAS DE AUTENTICAÇÃO
# Lê o header "Authorization: Bearer <token>", decodifica o JWT
# e devolve o registro correspondente (paciente, profissional ou
# usuário de unidade), já carregado do banco.
#
# Cada rota declara qual papel espera (ex: current_professional)
# e o FastAPI cuida de validar antes de executar o endpoint.
# ============================================================

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


def _unauthorized(detail: str = "Não autenticado") -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def _forbidden(detail: str = "Acesso não permitido para este perfil") -> HTTPException:
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def get_token_payload(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> dict:
    if credentials is None:
        raise _unauthorized()
    payload = decode_access_token(credentials.credentials)
    if payload is None or "sub" not in payload:
        raise _unauthorized("Token inválido ou expirado")
    return payload


def current_patient(
    payload: dict = Depends(get_token_payload),
    db: Session = Depends(get_db),
) -> models.Patient:
    role, _, raw_id = payload["sub"].partition(":")
    if role != "patient":
        raise _forbidden("Rota exclusiva para pacientes")
    patient = db.get(models.Patient, int(raw_id))
    if patient is None:
        raise _unauthorized("Paciente não encontrado")
    return patient


def current_professional(
    payload: dict = Depends(get_token_payload),
    db: Session = Depends(get_db),
) -> models.Professional:
    role, _, raw_id = payload["sub"].partition(":")
    if role != "professional":
        raise _forbidden("Rota exclusiva para profissionais")
    professional = db.get(models.Professional, int(raw_id))
    if professional is None:
        raise _unauthorized("Profissional não encontrado")
    return professional


def current_unit_user(
    payload: dict = Depends(get_token_payload),
    db: Session = Depends(get_db),
) -> models.HealthUnitUser:
    role, _, raw_id = payload["sub"].partition(":")
    if role != "unit":
        raise _forbidden("Rota exclusiva para unidades de saúde")
    unit_user = db.get(models.HealthUnitUser, int(raw_id))
    if unit_user is None:
        raise _unauthorized("Usuário da unidade não encontrado")
    return unit_user


def current_unit(
    unit_user: models.HealthUnitUser = Depends(current_unit_user),
) -> models.HealthUnit:
    """Devolve diretamente a unidade de saude do usuario institucional logado."""
    return unit_user.health_unit


def current_unit_from_professional_or_unit(
    payload: dict = Depends(get_token_payload),
    db: Session = Depends(get_db),
) -> models.HealthUnit:
    """
    A fila publica de vacinacao e vista tanto pela recepcao da
    unidade (login de unidade) quanto pelo profissional que vai
    chamar o proximo paciente (login de profissional). Esta
    dependency aceita os dois papeis e devolve sempre a mesma
    unidade de saude de referencia.
    """
    role, _, raw_id = payload["sub"].partition(":")

    if role == "unit":
        unit_user = db.get(models.HealthUnitUser, int(raw_id))
        if unit_user is None:
            raise _unauthorized("Usuario da unidade nao encontrado")
        return unit_user.health_unit

    if role == "professional":
        professional = db.get(models.Professional, int(raw_id))
        if professional is None:
            raise _unauthorized("Profissional nao encontrado")
        link = next((l for l in professional.unit_links if l.active), None)
        if link is None:
            raise _forbidden("Profissional nao esta vinculado a nenhuma unidade de saude")
        return link.health_unit

    raise _forbidden("Rota exclusiva para unidades de saude ou profissionais")
