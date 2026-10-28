"""실제 키를 출력하지 않고 로컬 설정을 만듭니다. 기존 .env는 보존합니다."""
import secrets
from pathlib import Path

root = Path(__file__).resolve().parent.parent
target = root / "backend" / ".env"
if target.exists():
    print("backend/.env가 이미 있습니다. 기존 설정을 사용합니다.")
else:
    template = (root / "backend" / ".env.example").read_text(encoding="utf-8")
    template = template.replace(
        "REPLACE_WITH_RANDOM_64_HEX_CHARACTERS", secrets.token_hex(32)
    )
    with target.open("x", encoding="utf-8") as handle:
        handle.write(template)
    target.chmod(0o600)
    print("backend/.env를 생성했습니다. 실제 키는 출력하지 않습니다.")
