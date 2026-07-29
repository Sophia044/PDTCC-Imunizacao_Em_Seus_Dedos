# ============================================================
# PONTO DE ENTRADA DA API
# Monta a aplicação FastAPI, libera CORS (para o app Expo acessar
# de qualquer origem em desenvolvimento) e registra todas as
# rotas. Também cria as tabelas automaticamente se ainda não
# existirem (equivalente a rodar o schema.sql na primeira vez).
#
# Para rodar:
#   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
#
# Documentação interativa gerada automaticamente:
#   http://localhost:8000/docs
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401 - garante que os modelos sejam registrados no Base
from app.config import settings
from app.database import Base, engine
from app.routers import (
    appointments,
    auth,
    campaigns,
    health_units,
    patients,
    professionals,
    queue,
    stock,
    vaccinations,
    vaccines,
)

# Cria as tabelas que ainda não existirem. Em produção com MySQL,
# prefira aplicar backend/database/schema.sql manualmente (ou uma
# ferramenta de migração como Alembic) e deixe isto apenas como
# rede de segurança para ambientes novos/de desenvolvimento.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    description="API do VacinApp — Imunização em Seus Dedos (TCC ETEC)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_allow_origins] if settings.cors_allow_origins != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(professionals.router)
app.include_router(vaccines.router)
app.include_router(vaccinations.router)
app.include_router(appointments.router)
app.include_router(health_units.router)
app.include_router(queue.router)
app.include_router(campaigns.router)
app.include_router(stock.router)


@app.get("/", tags=["Status"])
def health_check():
    return {"status": "ok", "app": settings.app_name, "environment": settings.environment}
