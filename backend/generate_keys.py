# ============================================================
# Gera as chaves de criptografia do VacinApp.
#
# Uso:
#   python generate_keys.py            -> só imprime as linhas
#   python generate_keys.py --write    -> acrescenta ao arquivo .env
#                                         (se as chaves ainda estiverem vazias)
# ============================================================

import secrets
import sys
from pathlib import Path

from cryptography.fernet import Fernet

encryption_key = Fernet.generate_key().decode()
hash_key = secrets.token_urlsafe(48)

lines = f"ENCRYPTION_KEYS={encryption_key}\nHASH_KEY={hash_key}\n"

if "--write" in sys.argv:
    env_path = Path(__file__).parent / ".env"
    content = env_path.read_text(encoding="utf-8") if env_path.exists() else ""
    already = any(
        l.split("=", 1)[0] in ("ENCRYPTION_KEYS", "HASH_KEY") and l.split("=", 1)[1].strip()
        for l in content.splitlines() if "=" in l
    )
    if already:
        print("O .env já possui chaves preenchidas. Nada foi alterado")
        print("(sobrescrever tornaria os dados já criptografados ilegíveis).")
        sys.exit(1)
    kept = [l for l in content.splitlines() if l.split("=", 1)[0] not in ("ENCRYPTION_KEYS", "HASH_KEY")]
    env_path.write_text("\n".join(kept) + ("\n" if kept else "") + lines, encoding="utf-8")
    print(f"Chaves gravadas em {env_path}")
else:
    print("Cole estas duas linhas no arquivo backend/.env:\n")
    print(lines)
    print("Guarde-as em local seguro. Sem elas os dados criptografados não podem ser lidos.")
