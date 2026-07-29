# ============================================================
# SEED: popula o banco com dados de demonstração
# Os mesmos personagens e cenários que existiam em
# VacinApp/constants/MockData.ts, agora como linhas reais no
# banco de dados. Roda com segurança várias vezes (limpa e
# recria) — use apenas em desenvolvimento.
#
# Como rodar:
#   python seed.py
# ============================================================

import datetime as dt

from app.database import Base, SessionLocal, engine
from app.security import hash_password
from app import models

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

DEMO_PASSWORD = "senha1234"  # senha padrão de todas as contas de demonstração


def make_user(name: str, email: str, role: str) -> models.User:
    user = models.User(name=name, email=email, password_hash=hash_password(DEMO_PASSWORD), role=role)
    db.add(user)
    db.flush()
    return user


# ------------------------------------------------------------
# 1) Catálogo de vacinas
# ------------------------------------------------------------
vaccine_names = [
    "BCG", "Hepatite B", "Penta (DTP+Hib+HB)", "VIP (Poliomielite)",
    "VRH (Rotavírus)", "Pneumocócica 10V", "Meningocócica C",
    "Febre Amarela", "Tríplice Viral (SCR)", "Varicela",
    "Hepatite A", "HPV", "Meningocócica ACWY", "COVID-19",
    "Influenza", "Tétano e Difteria (dT)", "Dengue (Qdenga)",
]
vaccines = {name: models.Vaccine(name=name) for name in vaccine_names}
db.add_all(vaccines.values())
db.flush()

# ------------------------------------------------------------
# 2) Unidades de saúde
# ------------------------------------------------------------
units_data = [
    dict(name="UBS Central", type="public", cnes="1234567", address="R. das Flores, 123 — Centro",
         phone="(11) 3000-0001", latitude=-23.5505, longitude=-46.6333, opening_hours="Seg–Sex 07h–17h"),
    dict(name="UBS Jardim América", type="public", cnes="1234568", address="Av. Brasil, 456 — Jd. América",
         phone="(11) 3000-0002", latitude=-23.5605, longitude=-46.6633, opening_hours="Seg–Sex 07h–19h"),
    dict(name="Clínica Vida Saúde", type="private", cnes=None, address="R. das Acácias, 789 — Vila Nova",
         phone="(11) 4000-1234", latitude=-23.5305, longitude=-46.6133, opening_hours="Seg–Sáb 08h–20h"),
    dict(name="UBS Vila Esperança", type="public", cnes="1234569", address="R. da Paz, 321 — Vila Esperança",
         phone="(11) 3000-0003", latitude=-23.5805, longitude=-46.6933, opening_hours="Seg–Sex 07h–17h"),
    dict(name="Centro de Imunização Premium", type="private", cnes=None, address="Av. Paulista, 1000 — Bela Vista",
         phone="(11) 5000-5678", latitude=-23.5615, longitude=-46.6558, opening_hours="Todos os dias 08h–22h"),
]
units = {d["name"]: models.HealthUnit(**d) for d in units_data}
db.add_all(units.values())
db.flush()

ubs_central = units["UBS Central"]
ubs_jardim = units["UBS Jardim América"]
clinica_vida = units["Clínica Vida Saúde"]

# ------------------------------------------------------------
# 3) Usuário institucional (login da Unidade de Saúde / triagem)
#    CNES: 1234567 | Matrícula/e-mail: recepcao@ubscentral.gov.br
# ------------------------------------------------------------
unit_user = models.HealthUnitUser(
    health_unit_id=ubs_central.id,
    name="Recepção UBS Central",
    email="recepcao@ubscentral.gov.br",
    registration_number="TRIAGEM-001",
    password_hash=hash_password(DEMO_PASSWORD),
    role="triage",
)
db.add(unit_user)

# ------------------------------------------------------------
# 4) Profissionais
#    Pública:  fernanda.alves@saude.gov.br | COREN/SP-123456
#    Privada:  ricardo.oliveira@vidasaude.com | CRM/SP-98765
# ------------------------------------------------------------
user_fernanda = make_user("Fernanda Alves", "fernanda.alves@saude.gov.br", "professional")
prof_fernanda = models.Professional(
    user_id=user_fernanda.id, council_type="COREN", professional_registry="COREN/SP-123456",
    specialty="Enfermagem", network_type="public", verification_status="approved",
)
db.add(prof_fernanda)
db.flush()
db.add(models.ProfessionalHealthUnit(professional_id=prof_fernanda.id, health_unit_id=ubs_jardim.id))

user_ricardo = make_user("Ricardo Oliveira", "ricardo.oliveira@vidasaude.com", "professional")
prof_ricardo = models.Professional(
    user_id=user_ricardo.id, council_type="CRM", professional_registry="CRM/SP-98765",
    specialty="Clínica Geral", network_type="private", verification_status="approved",
)
db.add(prof_ricardo)
db.flush()
db.add(models.ProfessionalHealthUnit(professional_id=prof_ricardo.id, health_unit_id=clinica_vida.id))
db.flush()

# ------------------------------------------------------------
# 5) Pacientes + histórico vacinal
# ------------------------------------------------------------
def make_patient(name, email, cpf, birth_date, network_type, allergies="", blood_type=None, **extra):
    user = make_user(name, email, "patient")
    patient = models.Patient(
        user_id=user.id, cpf=cpf, birth_date=birth_date, network_type=network_type,
        allergies=allergies, blood_type=blood_type, phone="(11) 90000-0000", **extra,
    )
    db.add(patient)
    db.flush()
    return patient


def add_record(patient, vaccine_name, dose, date, unit, professional, manufacturer=None, lot=None, notes=None):
    db.add(models.VaccinationRecord(
        patient_id=patient.id, vaccine_id=vaccines[vaccine_name].id, professional_id=professional.id,
        health_unit_id=unit.id, dose=dose, manufacturer=manufacturer, lot=lot,
        application_date=date, notes=notes,
        network_type=("public" if unit.type == "public" else "private"), status="valid",
    ))


def add_pending(patient, vaccine_name, due_date, unit):
    """Cria uma dose futura/pendente como um agendamento vinculado à vacina."""
    db.add(models.Appointment(
        patient_id=patient.id, health_unit_id=unit.id, vaccine_id=vaccines[vaccine_name].id,
        appointment_date=due_date, appointment_time=dt.time(9, 0), status="scheduled",
    ))


today = dt.date.today()

ana = make_patient(
    "Ana Clara Souza", "ana.clara@example.com", "12345678900", dt.date(1996, 4, 12), "private",
    allergies="Penicilina, Dipirona", blood_type="A+", health_plan="Unimed", health_plan_card="000111222",
)
add_record(ana, "COVID-19", "Reforço", dt.date(2024, 1, 15), ubs_central, prof_fernanda, "Pfizer", "LOTE-001")
add_record(ana, "Febre Amarela", "Dose Única", dt.date(2023, 9, 5), clinica_vida, prof_ricardo, "Bio-Manguinhos (Fiocruz)")
add_pending(ana, "Influenza", today + dt.timedelta(days=10), clinica_vida)

carlos = make_patient(
    "Carlos Eduardo Lima", "carlos.lima@example.com", "98765432100", dt.date(1979, 8, 3), "public",
    blood_type="O-", sus_number="700009876543210",
)
add_record(carlos, "Influenza", "Dose Anual", dt.date(2024, 3, 10), ubs_jardim, prof_fernanda, "Butantan")
add_pending(carlos, "Hepatite B", today - dt.timedelta(days=30), ubs_jardim)  # atrasada
add_pending(carlos, "Tétano e Difteria (dT)", today + dt.timedelta(days=15), ubs_jardim)

mariana = make_patient(
    "Mariana Ferreira", "mariana.ferreira@example.com", "45678912300", dt.date(1991, 11, 20), "private",
    allergies="Látex", blood_type="B+", health_plan="Bradesco Saúde", health_plan_card="000333444",
)
add_record(mariana, "Hepatite B", "3ª Dose", dt.date(2024, 2, 20), clinica_vida, prof_ricardo)
add_record(mariana, "HPV", "2ª Dose", dt.date(2023, 7, 14), ubs_jardim, prof_fernanda)

joao = make_patient(
    "João Pedro Alves", "joao.alves@example.com", "32165498700", dt.date(2013, 5, 2), "public",
    blood_type="AB+", sus_number="700003216549870",
)
add_record(joao, "HPV", "1ª Dose", dt.date(2023, 7, 14), ubs_central, prof_fernanda)
add_pending(joao, "Meningocócica ACWY", today - dt.timedelta(days=20), ubs_central)  # atrasada
add_pending(joao, "Varicela", today + dt.timedelta(days=25), ubs_central)

fernanda_costa = make_patient(
    "Fernanda Costa", "fernanda.costa@example.com", "78912345600", dt.date(1958, 2, 17), "private",
    allergies="Ovo, Gelatina", blood_type="O+", health_plan="SulAmérica", health_plan_card="000555666",
)
add_record(fernanda_costa, "Febre Amarela", "Dose Única", dt.date(2023, 9, 5), clinica_vida, prof_ricardo)
add_pending(fernanda_costa, "Influenza", today + dt.timedelta(days=5), clinica_vida)

db.flush()

# ------------------------------------------------------------
# 6) Agenda da rede privada (appointments do Dr. Ricardo)
# ------------------------------------------------------------
def add_appointment(patient, vaccine_name, date, time, status):
    db.add(models.Appointment(
        patient_id=patient.id, professional_id=prof_ricardo.id, health_unit_id=clinica_vida.id,
        vaccine_id=vaccines[vaccine_name].id if vaccine_name else None,
        appointment_date=date, appointment_time=time, status=status,
    ))

tomorrow = today + dt.timedelta(days=1)
in_2_days = today + dt.timedelta(days=2)
yesterday = today - dt.timedelta(days=1)

add_appointment(ana, "Influenza", today, dt.time(8, 0), "done")
add_appointment(fernanda_costa, "Influenza", today, dt.time(9, 30), "scheduled")
add_appointment(mariana, "COVID-19", today, dt.time(11, 30), "scheduled")
add_appointment(ana, "Hepatite B", tomorrow, dt.time(9, 0), "scheduled")
add_appointment(mariana, "Febre Amarela", tomorrow, dt.time(10, 30), "scheduled")
add_appointment(fernanda_costa, "Dengue (Qdenga)", in_2_days, dt.time(14, 30), "scheduled")
add_appointment(mariana, "Tríplice Viral (SCR)", yesterday, dt.time(11, 0), "done")

# ------------------------------------------------------------
# 7) Campanhas e estoque (unidade pública de referência)
# ------------------------------------------------------------
db.add(models.Campaign(
    health_unit_id=ubs_jardim.id, name="Campanha de Influenza 2026", target="Idosos acima de 60 anos",
    deadline=today + dt.timedelta(days=45), applied=312, goal=500,
))
db.add(models.Campaign(
    health_unit_id=ubs_jardim.id, name="Vacinação contra Dengue", target="População de 10 a 59 anos",
    deadline=today + dt.timedelta(days=75), applied=78, goal=300,
))

stock_data = [
    ("Influenza", 8, 20),
    ("COVID-19", 45, 10),
    ("Hepatite B", 3, 15),
    ("Febre Amarela", 22, 10),
]
for vaccine_name, quantity, min_level in stock_data:
    db.add(models.StockItem(
        health_unit_id=ubs_jardim.id, vaccine_id=vaccines[vaccine_name].id,
        quantity=quantity, min_level=min_level,
    ))

# ------------------------------------------------------------
db.commit()
db.close()

print("Banco populado com sucesso!\n")
print("Contas de demonstração (senha para todas: 'senha1234'):\n")
print("  Paciente SUS ......... CPF 987.654.321-00  (Carlos Eduardo Lima)")
print("  Paciente Convênio ..... CPF 123.456.789-00  (Ana Clara Souza)")
print("  Profissional Pública .. fernanda.alves@saude.gov.br | COREN/SP-123456")
print("  Profissional Privada .. ricardo.oliveira@vidasaude.com | CRM/SP-98765")
print("  Unidade de Saúde ...... CNES 1234567 | recepcao@ubscentral.gov.br")
