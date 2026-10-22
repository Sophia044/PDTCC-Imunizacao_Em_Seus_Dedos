# ============================================================
# TESTE DA CRIPTOGRAFIA
#
# Uso (com o venv ativado, dentro da pasta backend):
#   python test_encryption.py
#
# O que verifica:
#   1. O valor gravado no banco (lido com SQL puro) NÃO é o texto original.
#   2. Lendo pelo ORM, o valor volta descriptografado e correto.
#   3. A busca por CPF/CNS via índice HMAC (blind index) funciona.
#   4. O texto original não aparece dentro do arquivo .db (SQLite).
#
# O registro de teste é removido no final.
# ============================================================

import datetime as dt
from pathlib import Path

from sqlalchemy import text

from app import models
from app.config import settings
from app.crypto import blind_index
from app.database import Base, SessionLocal, engine
from app.security import hash_password

Base.metadata.create_all(bind=engine)

CPF = "99988877766"
SUS = "700999888777666"
PHONE = "(11) 91234-5678"
ALLERGY = "Alergia-Secreta-TESTE"
BLOOD = "AB-"
BIRTH = dt.date(1990, 5, 17)
EMAIL = "teste.cripto@example.com"

ok = True


def check(label: str, condition: bool) -> None:
    global ok
    ok = ok and condition
    print(f"[{'OK' if condition else 'FALHOU'}] {label}")


db = SessionLocal()

# limpa sobras de execuções anteriores
old = db.query(models.User).filter_by(email=EMAIL).first()
if old:
    db.delete(old)
    db.commit()

user = models.User(name="Teste Cripto", email=EMAIL, password_hash=hash_password("senha1234"), role="patient")
db.add(user)
db.flush()
patient = models.Patient(
    user_id=user.id, cpf=CPF, birth_date=BIRTH, phone=PHONE, network_type="public",
    sus_number=SUS, allergies=ALLERGY, blood_type=BLOOD,
)
db.add(patient)
db.commit()
pid = patient.id

# 1) SQL puro: o que realmente está gravado no banco
with engine.connect() as conn:
    raw = conn.execute(
        text("SELECT cpf, birth_date, phone, sus_number, allergies, blood_type, cpf_hash FROM patients WHERE id = :id"),
        {"id": pid},
    ).mappings().one()

print("\nComo está gravado no banco (SQL puro):")
for k, v in raw.items():
    print(f"  {k:12} = {str(v)[:60]}{'...' if len(str(v)) > 60 else ''}")
print()

check("CPF cifrado no banco", raw["cpf"] != CPF and raw["cpf"].startswith("enc:v1:"))
check("Data de nascimento cifrada", raw["birth_date"].startswith("enc:v1:"))
check("Telefone cifrado", raw["phone"].startswith("enc:v1:"))
check("CNS cifrado", raw["sus_number"].startswith("enc:v1:"))
check("Alergias cifradas", raw["allergies"].startswith("enc:v1:"))
check("Tipo sanguíneo cifrado", raw["blood_type"].startswith("enc:v1:"))
check("cpf_hash é um HMAC de 64 caracteres (sem o CPF)", len(raw["cpf_hash"]) == 64 and CPF not in raw["cpf_hash"])

# 2) ORM: leitura descriptografada
db.expire_all()
p = db.get(models.Patient, pid)
check("ORM devolve o CPF original", p.cpf == CPF)
check("ORM devolve a data original", p.birth_date == BIRTH)
check("ORM devolve o telefone original", p.phone == PHONE)
check("ORM devolve o CNS original", p.sus_number == SUS)
check("ORM devolve as alergias originais", p.allergies == ALLERGY)

# 3) Busca por blind index (mesmo com máscara na entrada)
found = db.query(models.Patient).filter_by(cpf_hash=blind_index("999.888.777-66"), network_type="public").first()
check("Busca por CPF via blind index encontra o paciente", found is not None and found.id == pid)
found = db.query(models.Patient).filter_by(sus_hash=blind_index("700 9998 8877 7666")).first()
check("Busca por CNS via blind index encontra o paciente", found is not None and found.id == pid)
check("CPF diferente não encontra ninguém",
      db.query(models.Patient).filter_by(cpf_hash=blind_index("11111111111")).first() is None)

# 4) Arquivo SQLite não contém o texto original
if settings.database_url.startswith("sqlite"):
    db_file = Path(settings.database_url.replace("sqlite:///", "", 1))
    if db_file.exists():
        data = db_file.read_bytes()
        check("CPF em texto puro NÃO aparece dentro do arquivo .db", CPF.encode() not in data)
        check("Alergia em texto puro NÃO aparece dentro do arquivo .db", ALLERGY.encode() not in data)

# limpeza
db.delete(db.get(models.User, user.id))
db.commit()
db.close()

print("\n" + ("Tudo certo: a criptografia está funcionando." if ok else "Há falhas — revise a configuração."))
raise SystemExit(0 if ok else 1)
