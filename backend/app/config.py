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

    # --- CORS ---
    # "*" libera qualquer origem — adequado para o Expo Go em
    # desenvolvimento. Restrinja em produção.
    cors_allow_origins: str = "*"

    # --- App ---
    app_name: str = "VacinApp API"
    environment: str = "development"

    # --- Integração com IA Local (Ollama) ---
    # O backend roda no mesmo PC que o Ollama, então usamos localhost.
    # Para mudar o modelo ou a URL (ex: em outro ambiente), defina no .env:
    #   OLLAMA_URL=http://localhost:11434
    #   OLLAMA_MODEL=qwen2.5:14b
    ollama_url: str = "http://100.70.203.65:11434"
    ollama_model: str = "qwen2.5:14b"

    # --- Sistema RAG (Retrieval-Augmented Generation) ---
    # Parâmetros para indexação e recuperação de documentos oficiais de vacinação
    rag_docs_dir: str = "documentos-vacinacao"
    rag_chroma_dir: str = "chroma_db"
    rag_collection_name: str = "vacinacao_docs"
    rag_embedding_model: str = "nomic-embed-text"
    rag_top_k: int = 4  # Quantidade de chunks mais similares recuperados
    # Limiar mínimo de similaridade de cosseno (0.0 a 1.0).
    # Com base em validação empírica com o nomic-embed-text:
    # - Perguntas fora do tema ou não cobertas ficam entre 0.55 e 0.60
    # - Perguntas pertinentes com correspondência oficial atingem > 0.70
    # Portanto, 0.65 garante uma separação ideal entre documentos oficiais e conhecimento geral.
    rag_similarity_threshold: float = 0.65

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
