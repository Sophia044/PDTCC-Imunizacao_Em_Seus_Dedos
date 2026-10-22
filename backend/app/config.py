# ============================================================
# CONFIGURAÇÃO CENTRAL DO BACKEND
# Lê variáveis de ambiente (arquivo .env) e expõe um objeto
# "settings" único, usado em toda a aplicação.
#
# Por que assim: manter toda configuração num único lugar deixa
# fácil trocar de SQLite -> MySQL, mudar segredo do JWT, liberar
# outra origem no CORS, etc. sem caçar valores espalhados pelo
# código.
# ============================================================

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- Banco de dados ---
    # Por padrão usa SQLite (zero configuração, ótimo para
    # desenvolver e para rodar o TCC em qualquer máquina).
    # Para produção/MySQL Workbench, defina no .env:
    #   DATABASE_URL=mysql+pymysql://usuario:senha@localhost:3306/vacinapp
    database_url: str = "sqlite:///./vacinapp.db"

    # --- Autenticação (JWT) ---
    jwt_secret_key: str = "troque-esta-chave-em-producao"
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 60 * 24 * 7  # 7 dias

    # --- Criptografia de dados sensíveis ---
    # ENCRYPTION_KEYS: uma ou mais chaves Fernet separadas por vírgula.
    #   A primeira é usada para criptografar; todas servem para
    #   descriptografar (permite rotação de chaves).
    # HASH_KEY: segredo do HMAC usado nos índices de busca (CPF / SUS).
    # Gere ambos com: python generate_keys.py
    # NUNCA versione o .env nem perca estas chaves: sem elas os dados
    # criptografados ficam irrecuperáveis.
    encryption_keys: str = ""
    hash_key: str = ""

    # --- CORS ---
    # "*" libera qualquer origem — adequado para o Expo Go em
    # desenvolvimento. Restrinja em produção.
    cors_allow_origins: str = "*"

    # --- App ---
    app_name: str = "VacinApp API"
    environment: str = "development"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
