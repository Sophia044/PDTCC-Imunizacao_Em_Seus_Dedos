# ============================================================
# SEGURANÇA: hash de senha (bcrypt) e tokens de acesso (JWT)
# ============================================================

import datetime as dt
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.config import settings


def hash_password(raw_password: str) -> str:
    """Gera o hash bcrypt de uma senha em texto puro."""
    return bcrypt.hashpw(raw_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(raw_password: str, password_hash: str) -> bool:
    """Confere se a senha em texto puro bate com o hash salvo."""
    try:
        return bcrypt.checkpw(raw_password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    """
    Cria um JWT de acesso.
    `subject` é sempre "<role>:<id>" (ex: "patient:42"), o que
    deixa o token compacto e permite identificar o tipo de
    usuário sem consultar o banco antes de decodificar.
    """
    expire = dt.datetime.now(dt.timezone.utc) + dt.timedelta(minutes=settings.jwt_expires_minutes)
    payload: dict[str, Any] = {"sub": subject, "exp": expire}
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None
