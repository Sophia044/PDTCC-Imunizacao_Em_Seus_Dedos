# ============================================================
# CRIPTOGRAFIA DE DADOS SENSÍVEIS (campo a campo)
#
# 1) EncryptedString / EncryptedDate
#    Tipos de coluna do SQLAlchemy que criptografam o valor
#    ANTES de gravar no banco e descriptografam ao ler. O resto
#    do código (routers, utils, schemas) continua vendo o valor
#    normal (str / date) — a criptografia é transparente.
#
#    Algoritmo: Fernet (AES-128-CBC + HMAC-SHA256, lib `cryptography`).
#    Suporta rotação de chaves: ENCRYPTION_KEYS aceita várias
#    chaves separadas por vírgula; a PRIMEIRA criptografa, e todas
#    servem para descriptografar.
#
# 2) blind_index()
#    Fernet gera um texto diferente a cada vez, então não dá para
#    fazer WHERE cpf = '...' em um campo criptografado. Para buscas
#    exatas (login por CPF, busca por Nº SUS) guardamos também um
#    HASH HMAC-SHA256 (com chave secreta separada, HASH_KEY) do
#    valor normalizado (só dígitos). Ele não é reversível e permite
#    comparar igualdade e garantir unicidade.
# ============================================================

import datetime as dt
import hashlib
import hmac
import re
from functools import lru_cache

from cryptography.fernet import Fernet, InvalidToken, MultiFernet
from sqlalchemy.types import Text, TypeDecorator

from app.config import settings

# Prefixo gravado antes do texto cifrado. Serve para (a) identificar
# o que está cifrado e (b) tolerar dados antigos ainda em texto puro.
_PREFIX = "enc:v1:"


@lru_cache
def _fernet() -> MultiFernet:
    keys = [k.strip() for k in settings.encryption_keys.split(",") if k.strip()]
    if not keys:
        raise RuntimeError(
            "ENCRYPTION_KEYS não configurada. Rode `python generate_keys.py` "
            "e cole os valores no arquivo backend/.env."
        )
    try:
        return MultiFernet([Fernet(k.encode()) for k in keys])
    except ValueError as exc:
        raise RuntimeError(
            "ENCRYPTION_KEYS inválida. Gere uma nova com `python generate_keys.py`."
        ) from exc


def encrypt_text(plain: str) -> str:
    token = _fernet().encrypt(plain.encode("utf-8")).decode("utf-8")
    return _PREFIX + token


def decrypt_text(stored: str) -> str:
    if not stored.startswith(_PREFIX):
        return stored  # dado legado em texto puro (antes da criptografia)
    token = stored[len(_PREFIX):]
    try:
        return _fernet().decrypt(token.encode("utf-8")).decode("utf-8")
    except InvalidToken as exc:
        raise RuntimeError(
            "Falha ao descriptografar: ENCRYPTION_KEYS diferente da usada "
            "para gravar os dados (ou dado corrompido)."
        ) from exc


def blind_index(value: str | None) -> str | None:
    """HMAC-SHA256 do valor normalizado (somente dígitos). None -> None."""
    if value is None:
        return None
    if not settings.hash_key:
        raise RuntimeError(
            "HASH_KEY não configurada. Rode `python generate_keys.py` "
            "e cole os valores no arquivo backend/.env."
        )
    digits = re.sub(r"\D", "", str(value))
    return hmac.new(settings.hash_key.encode("utf-8"), digits.encode("utf-8"), hashlib.sha256).hexdigest()


# ------------------------------------------------------------
# Tipos de coluna
# ------------------------------------------------------------
class EncryptedString(TypeDecorator):
    """Texto criptografado de forma transparente (guardado como TEXT)."""

    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return encrypt_text(str(value))

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return decrypt_text(value)


class EncryptedDate(TypeDecorator):
    """Data criptografada (ISO 8601 cifrado). No Python continua sendo `date`."""

    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, dt.datetime):
            value = value.date()
        return encrypt_text(value.isoformat())

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return dt.date.fromisoformat(decrypt_text(value))
