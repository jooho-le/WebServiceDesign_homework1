"""서버 설정은 환경변수 또는 backend/.env에서 읽습니다."""
import os
import re
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def load_secret():
    value = os.getenv("JWT_SECRET", "")
    if not re.fullmatch(r"[0-9a-fA-F]{64}", value) or len(set(value.lower())) == 1:
        raise RuntimeError(
            "JWT_SECRET에 새로 생성한 64자리 16진수 키를 설정하세요. "
            "프로젝트 루트에서 python3 tools/setup_env.py를 실행할 수 있습니다."
        )
    return bytes.fromhex(value)


JWT_SECRET = load_secret()
JWT_ISSUER = os.getenv("JWT_ISSUER", "webservice-class").strip()
JWT_AUDIENCE = os.getenv("JWT_AUDIENCE", "board-api").strip()
if not JWT_ISSUER or not JWT_AUDIENCE:
    raise RuntimeError("JWT_ISSUER와 JWT_AUDIENCE는 빈 값일 수 없습니다.")

try:
    TOKEN_TTL = int(os.getenv("TOKEN_TTL", "90"))
    if TOKEN_TTL <= 0:
        raise ValueError
except ValueError:
    raise RuntimeError("TOKEN_TTL은 초 단위의 양의 정수여야 합니다.") from None
