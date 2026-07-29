# ============================================================
# CONEXÃO COM O BANCO DE DADOS
# Cria o "engine" do SQLAlchemy a partir da DATABASE_URL definida
# em app/config.py e expõe:
#   - Base: classe base para os modelos (app/models.py)
#   - get_db(): dependency do FastAPI que entrega uma sessão por
#     requisição e garante que ela é fechada no final.
# ============================================================

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

# connect_args especial é necessário apenas para SQLite (permite
# usar a mesma conexão em threads diferentes, como o Uvicorn faz).
connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(settings.database_url, connect_args=connect_args, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependency: abre uma sessão de banco por requisição e fecha ao final."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
