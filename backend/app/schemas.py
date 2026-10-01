# ============================================================
# SCHEMAS (Pydantic) — contrato de entrada/saída da API
#
# Os campos aqui foram desenhados para bater exatamente com os
# tipos TypeScript já definidos em VacinApp/constants/MockData.ts
# e com os payloads que cada tela já documentava nos comentários
# "PREPARADO PARA BACKEND". Assim a troca de mock -> API real no
# front-end é praticamente 1 para 1.
#
# Internamente usamos snake_case (padrão Python/SQLAlchemy), mas
# o JSON exposto é sempre camelCase (padrão usado no front-end),
# graças ao CamelModel abaixo.
# ============================================================

from __future__ import annotations

import datetime as dt
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


def to_camel(snake: str) -> str:
    first, *rest = snake.split("_")
    return first + "".join(word.capitalize() for word in rest)


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


# ------------------------------------------------------------
# Autenticação
# ------------------------------------------------------------
class PatientLoginRequest(CamelModel):
    cpf: str
    password: str
    network_type: str  # 'sus' | 'private'


class PatientRegisterSusRequest(CamelModel):
    name: str
    cpf: str
    birthdate: str  # DD/MM/AAAA
    cns: str
    phone: Optional[str] = None
    email: EmailStr
    password: str = Field(min_length=8)


class PatientRegisterPrivateRequest(CamelModel):
    name: str
    cpf: str
    birthdate: str
    convenio: str
    carteirinha: str
    phone: Optional[str] = None
    email: EmailStr
    password: str = Field(min_length=8)


class ProfessionalLoginRequest(CamelModel):
    email: EmailStr
    password: str
    professional_registry: str
    network_type: str  # 'public' | 'private'
    institution: Optional[str] = None


class ProfessionalRegisterRequest(CamelModel):
    name: str
    professional_registry: str  # CRM/COREN, ex: "CRM/SP-98765"
    specialty: Optional[str] = None
    unit_name: str
    network_type: str  # 'public' | 'private'
    email: EmailStr
    password: str = Field(min_length=8)


class UnitLoginRequest(CamelModel):
    cnes: str
    identifier: str  # e-mail ou matrícula
    password: str


class UnitOut(CamelModel):
    id: str
    name: str
    cnes: str


class TokenResponse(CamelModel):
    token: str
    token_type: str = "bearer"


# ------------------------------------------------------------
# Vacina (histórico do paciente — aplicada ou prevista)
# ------------------------------------------------------------
class VaccineOut(CamelModel):
    id: str
    name: str
    date: str  # YYYY-MM-DD
    status: str  # complete | pending | overdue
    dose: Optional[str] = None
    location: Optional[str] = None
    next_dose: Optional[str] = None
    notes: Optional[str] = None


# ------------------------------------------------------------
# Paciente — resumo (listas) e perfil completo
# ------------------------------------------------------------
class PatientOut(CamelModel):
    id: str
    name: str
    age: int
    cpf: str
    last_vaccine: str
    last_vaccine_date: str  # DD/MM/YYYY
    pending_count: int


class PatientProfileOut(PatientOut):
    sus: str
    plan: str
    blood_type: str
    allergies: list[str]
    vaccines: list[VaccineOut]
    pending_vaccines: list[str]
    overdue_vaccines: list[str]
    email: str
    birth_date: str  # DD/MM/YYYY
    phone: Optional[str] = None


# ------------------------------------------------------------
# Profissional autenticado
# ------------------------------------------------------------
class ProfessionalUserOut(CamelModel):
    id: str
    name: str
    role: str
    registry: str
    network_type: str
    unit: str
    institution: Optional[str] = None
    # ID da unidade de saúde vinculada (professional_health_units),
    # usado pelo front-end para pré-selecionar/travar o campo
    # "Unidade de Saúde" na tela de Registrar Vacinação.
    health_unit_id: Optional[str] = None


class ProfessionalVerifyRegistryRequest(CamelModel):
    # Usado para "liberar" a troca de unidade de saúde na tela de
    # registro de vacinação: o profissional confirma novamente o
    # próprio CRM/COREN antes de poder escolher outra unidade.
    professional_registry: str


class ProfessionalVerifyResponse(CamelModel):
    verified: bool


# ------------------------------------------------------------
# Registro de vacinação (criação)
# ------------------------------------------------------------
class VaccinationCreateRequest(CamelModel):
    patient_id: str
    vaccine: str  # nome da vacina (catálogo)
    dose: str
    manufacturer: Optional[str] = None
    lot: Optional[str] = None
    date: str  # DD/MM/YYYY
    # ID de uma unidade de saúde válida (tabela health_units).
    # Se omitido, o backend usa a unidade vinculada ao profissional
    # autenticado como padrão — nunca um texto livre digitado na tela.
    health_unit_id: Optional[str] = None
    notes: Optional[str] = None
    network_type: str


# ------------------------------------------------------------
# Agenda (appointments)
# ------------------------------------------------------------
class AppointmentOut(CamelModel):
    id: str
    date: str
    time: str
    patient_id: str
    patient_name: str
    vaccine: str
    plan: str
    status: str


class AppointmentUpdateRequest(CamelModel):
    status: str  # scheduled | done | missed | cancelled


# ------------------------------------------------------------
# Campanhas e estoque
# ------------------------------------------------------------
class CampaignOut(CamelModel):
    id: str
    name: str
    target: str
    deadline: str  # DD/MM/YYYY
    applied: int
    goal: int


class StockItemOut(CamelModel):
    id: str
    vaccine: str
    quantity: int
    min_level: int


# ------------------------------------------------------------
# Unidades de saúde
# ------------------------------------------------------------
class HealthUnitOut(CamelModel):
    id: str
    name: str
    address: str
    type: str  # 'SUS' | 'Particular'
    hours: str
    phone: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    distance: Optional[str] = None


# ------------------------------------------------------------
# Fila pública (triagem)
# ------------------------------------------------------------
class PublicQueueAddRequest(CamelModel):
    sus: Optional[str] = None
    patient_id: Optional[str] = None
    reason: str = "Vacinação"
    health_unit_id: Optional[str] = None


class PublicQueueItemOut(CamelModel):
    id: str
    patient_id: str
    arrival_time: str
    reason: str
    status: str
    position: int
    patient: PatientProfileOut
