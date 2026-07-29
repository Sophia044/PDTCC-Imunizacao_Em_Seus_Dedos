# ============================================================
# MODELOS DO BANCO DE DADOS (SQLAlchemy)
#
# Este arquivo é a fonte da verdade da estrutura do banco.
# Ele espelha fielmente as tabelas descritas em
# backend/database/schema.sql (o esqueleto original do projeto),
# e acrescenta duas tabelas que as telas do profissional já
# esperavam (campaigns e stock_items), que ainda não existiam
# no schema original.
#
# Funciona tanto em SQLite (padrão, zero configuração) quanto em
# MySQL (produção, ver README do backend) sem alterações.
# ============================================================

import datetime as dt

from sqlalchemy import (
    Boolean, CheckConstraint, Date, DateTime, Enum, ForeignKey,
    Integer, Numeric, String, Text, UniqueConstraint, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# ------------------------------------------------------------
# Usuários base do sistema: pacientes, profissionais e admins.
# ------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    email: Mapped[str] = mapped_column(String(180), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(Enum("patient", "professional", "admin", name="user_role"), nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    patient: Mapped["Patient"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    professional: Mapped["Professional"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")


# ------------------------------------------------------------
# Pacientes da rede publica (SUS) e privada (convenio).
# ------------------------------------------------------------
class Patient(Base):
    __tablename__ = "patients"
    __table_args__ = (
        UniqueConstraint("cpf", "network_type", name="uq_patients_cpf_network"),
        CheckConstraint(
            "(network_type = 'public' AND sus_number IS NOT NULL) OR "
            "(network_type = 'private' AND health_plan IS NOT NULL AND health_plan_card IS NOT NULL)",
            name="chk_patients_public_or_private",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    cpf: Mapped[str] = mapped_column(String(11), nullable=False)
    birth_date: Mapped[dt.date] = mapped_column(Date, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20))
    network_type: Mapped[str] = mapped_column(Enum("public", "private", name="patient_network_type"), nullable=False)
    sus_number: Mapped[str | None] = mapped_column(String(15), unique=True)
    health_plan: Mapped[str | None] = mapped_column(String(120))
    health_plan_card: Mapped[str | None] = mapped_column(String(80))
    blood_type: Mapped[str | None] = mapped_column(String(3))
    allergies: Mapped[str | None] = mapped_column(Text)  # lista separada por vírgula
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    user: Mapped[User] = relationship(back_populates="patient")
    vaccination_records: Mapped[list["VaccinationRecord"]] = relationship(back_populates="patient")
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="patient")
    queue_entries: Mapped[list["PublicQueueEntry"]] = relationship(back_populates="patient")


# ------------------------------------------------------------
# Profissionais de saude (medicos, enfermeiros, etc).
# ------------------------------------------------------------
class Professional(Base):
    __tablename__ = "professionals"
    __table_args__ = (
        UniqueConstraint("council_type", "professional_registry", name="uq_professionals_registry"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    cpf: Mapped[str | None] = mapped_column(String(11))
    council_type: Mapped[str] = mapped_column(Enum("CRM", "COREN", "OTHER", name="council_type"), nullable=False)
    professional_registry: Mapped[str] = mapped_column(String(40), nullable=False)
    specialty: Mapped[str | None] = mapped_column(String(120))
    network_type: Mapped[str] = mapped_column(Enum("public", "private", name="professional_network_type"), nullable=False)
    verification_status: Mapped[str] = mapped_column(
        Enum("pending", "approved", "rejected", name="verification_status"), nullable=False, default="approved"
    )
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    user: Mapped[User] = relationship(back_populates="professional")
    unit_links: Mapped[list["ProfessionalHealthUnit"]] = relationship(back_populates="professional", cascade="all, delete-orphan")
    vaccination_records: Mapped[list["VaccinationRecord"]] = relationship(back_populates="professional")
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="professional")

    @property
    def role_label(self) -> str:
        """Papel exibido no app, derivado do tipo de conselho (CRM/COREN)."""
        return {"CRM": "Médico", "COREN": "Enfermeiro"}.get(self.council_type, "Profissional de Saúde")


# ------------------------------------------------------------
# UBS, postos, clinicas, hospitais e centros de imunizacao.
# ------------------------------------------------------------
class HealthUnit(Base):
    __tablename__ = "health_units"
    __table_args__ = (
        CheckConstraint("(type = 'public' AND cnes IS NOT NULL) OR type = 'private'", name="chk_health_units_public_cnes"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    type: Mapped[str] = mapped_column(Enum("public", "private", name="health_unit_type"), nullable=False)
    cnes: Mapped[str | None] = mapped_column(String(7), unique=True)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20))
    latitude: Mapped[float | None] = mapped_column(Numeric(10, 8))
    longitude: Mapped[float | None] = mapped_column(Numeric(11, 8))
    opening_hours: Mapped[str | None] = mapped_column(String(120))
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    unit_users: Mapped[list["HealthUnitUser"]] = relationship(back_populates="health_unit", cascade="all, delete-orphan")
    professional_links: Mapped[list["ProfessionalHealthUnit"]] = relationship(back_populates="health_unit", cascade="all, delete-orphan")
    vaccination_records: Mapped[list["VaccinationRecord"]] = relationship(back_populates="health_unit")
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="health_unit")
    queue_entries: Mapped[list["PublicQueueEntry"]] = relationship(back_populates="health_unit", cascade="all, delete-orphan")
    campaigns: Mapped[list["Campaign"]] = relationship(back_populates="health_unit", cascade="all, delete-orphan")
    stock_items: Mapped[list["StockItem"]] = relationship(back_populates="health_unit", cascade="all, delete-orphan")


# ------------------------------------------------------------
# Usuarios institucionais da unidade (recepcao/triagem).
# Usado pela tela "Entrar como Unidade de Saude".
# ------------------------------------------------------------
class HealthUnitUser(Base):
    __tablename__ = "health_unit_users"
    __table_args__ = (
        UniqueConstraint("health_unit_id", "registration_number", name="uq_health_unit_users_registration"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    health_unit_id: Mapped[int] = mapped_column(ForeignKey("health_units.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    email: Mapped[str] = mapped_column(String(180), nullable=False, unique=True)
    registration_number: Mapped[str | None] = mapped_column(String(40))
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(Enum("triage", "manager", name="unit_user_role"), nullable=False, default="triage")
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    health_unit: Mapped[HealthUnit] = relationship(back_populates="unit_users")


# ------------------------------------------------------------
# Vinculo entre profissional e unidade onde atua.
# ------------------------------------------------------------
class ProfessionalHealthUnit(Base):
    __tablename__ = "professional_health_units"
    __table_args__ = (
        UniqueConstraint("professional_id", "health_unit_id", name="uq_professional_health_unit"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    professional_id: Mapped[int] = mapped_column(ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False)
    health_unit_id: Mapped[int] = mapped_column(ForeignKey("health_units.id", ondelete="CASCADE"), nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())

    professional: Mapped[Professional] = relationship(back_populates="unit_links")
    health_unit: Mapped[HealthUnit] = relationship(back_populates="professional_links")


# ------------------------------------------------------------
# Catalogo de vacinas disponiveis no sistema.
# ------------------------------------------------------------
class Vaccine(Base):
    __tablename__ = "vaccines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False, unique=True)
    disease: Mapped[str | None] = mapped_column(String(160))
    description: Mapped[str | None] = mapped_column(Text)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    vaccination_records: Mapped[list["VaccinationRecord"]] = relationship(back_populates="vaccine")


# ------------------------------------------------------------
# Carteira digital real: registros aplicados por profissional.
# ------------------------------------------------------------
class VaccinationRecord(Base):
    __tablename__ = "vaccination_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="RESTRICT"), nullable=False)
    vaccine_id: Mapped[int] = mapped_column(ForeignKey("vaccines.id", ondelete="RESTRICT"), nullable=False)
    professional_id: Mapped[int] = mapped_column(ForeignKey("professionals.id", ondelete="RESTRICT"), nullable=False)
    health_unit_id: Mapped[int] = mapped_column(ForeignKey("health_units.id", ondelete="RESTRICT"), nullable=False)
    dose: Mapped[str | None] = mapped_column(String(60))
    manufacturer: Mapped[str | None] = mapped_column(String(120))
    lot: Mapped[str | None] = mapped_column(String(80))
    application_date: Mapped[dt.date] = mapped_column(Date, nullable=False)
    next_dose_date: Mapped[dt.date | None] = mapped_column(Date)
    notes: Mapped[str | None] = mapped_column(Text)
    network_type: Mapped[str] = mapped_column(Enum("public", "private", name="record_network_type"), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("valid", "cancelled", "corrected", name="record_status"), nullable=False, default="valid"
    )
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    patient: Mapped[Patient] = relationship(back_populates="vaccination_records")
    vaccine: Mapped[Vaccine] = relationship(back_populates="vaccination_records")
    professional: Mapped[Professional] = relationship(back_populates="vaccination_records")
    health_unit: Mapped[HealthUnit] = relationship(back_populates="vaccination_records")


# ------------------------------------------------------------
# Agenda de vacinacao, principalmente para rede privada.
# ------------------------------------------------------------
class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    professional_id: Mapped[int | None] = mapped_column(ForeignKey("professionals.id", ondelete="SET NULL"))
    health_unit_id: Mapped[int] = mapped_column(ForeignKey("health_units.id", ondelete="CASCADE"), nullable=False)
    vaccine_id: Mapped[int | None] = mapped_column(ForeignKey("vaccines.id", ondelete="SET NULL"))
    appointment_date: Mapped[dt.date] = mapped_column(Date, nullable=False)
    appointment_time: Mapped[dt.time] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("scheduled", "done", "missed", "cancelled", name="appointment_status"), nullable=False, default="scheduled"
    )
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    patient: Mapped[Patient] = relationship(back_populates="appointments")
    professional: Mapped[Professional | None] = relationship(back_populates="appointments")
    health_unit: Mapped[HealthUnit] = relationship(back_populates="appointments")
    vaccine: Mapped[Vaccine | None] = relationship()


# ------------------------------------------------------------
# Fila de atendimento da unidade publica.
# ------------------------------------------------------------
class PublicQueueEntry(Base):
    __tablename__ = "public_queue"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    health_unit_id: Mapped[int] = mapped_column(ForeignKey("health_units.id", ondelete="CASCADE"), nullable=False)
    reason: Mapped[str] = mapped_column(String(160), nullable=False, default="Vacinacao")
    arrival_time: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())
    status: Mapped[str] = mapped_column(
        Enum("waiting", "called", "done", "cancelled", name="queue_status"), nullable=False, default="waiting"
    )
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    patient: Mapped[Patient] = relationship(back_populates="queue_entries")
    health_unit: Mapped[HealthUnit] = relationship(back_populates="queue_entries")


# ------------------------------------------------------------
# Campanhas vacinais ativas de uma unidade.
# (Não existia no schema.sql original — a tela do profissional
# já previa este dado, então a tabela foi acrescentada aqui.)
# ------------------------------------------------------------
class Campaign(Base):
    __tablename__ = "campaigns"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    health_unit_id: Mapped[int] = mapped_column(ForeignKey("health_units.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    target: Mapped[str] = mapped_column(String(180), nullable=False)
    deadline: Mapped[dt.date] = mapped_column(Date, nullable=False)
    applied: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    goal: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())

    health_unit: Mapped[HealthUnit] = relationship(back_populates="campaigns")


# ------------------------------------------------------------
# Estoque de vacinas de uma unidade.
# (Idem acima: tabela nova para suportar a tela do profissional.)
# ------------------------------------------------------------
class StockItem(Base):
    __tablename__ = "stock_items"
    __table_args__ = (
        UniqueConstraint("health_unit_id", "vaccine_id", name="uq_stock_unit_vaccine"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    health_unit_id: Mapped[int] = mapped_column(ForeignKey("health_units.id", ondelete="CASCADE"), nullable=False)
    vaccine_id: Mapped[int] = mapped_column(ForeignKey("vaccines.id", ondelete="CASCADE"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    min_level: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    health_unit: Mapped[HealthUnit] = relationship(back_populates="stock_items")
    vaccine: Mapped[Vaccine] = relationship()
