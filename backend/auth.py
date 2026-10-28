import re
import time

import jwt

from config import JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE, TOKEN_TTL
from errors import ApiError
from users import find_public


def issue_token(user):
    """비밀번호 검증을 마친 계정의 공개 정보로 JWT를 발급합니다."""
    return jwt.encode(
        {
            "sub": str(user["id"]),
            "exp": int(time.time()) + TOKEN_TTL,
            "iss": JWT_ISSUER,
            "aud": JWT_AUDIENCE,
        },
        JWT_SECRET,
        algorithm="HS256",
    )


def current_user_id(request):
    header = request.headers.get("Authorization", "")
    match = re.fullmatch(r"Bearer[ \t]+([^\s]+)", header, flags=re.IGNORECASE)
    if not match:
        raise ApiError(401, "TOKEN_REQUIRED", "로그인이 필요합니다.")
    token = match.group(1)
    options = {"require": ["sub", "exp", "iss", "aud"], "strict_aud": True}
    try:
        # 만료 전에 나머지 클레임도 확인해, 잘못된 토큰을 만료로 오인하지 않습니다.
        claims = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"],
            issuer=JWT_ISSUER,
            audience=JWT_AUDIENCE,
            options={**options, "verify_exp": False},
        )
        subject = claims["sub"]
        if (
            not isinstance(subject, str)
            or not re.fullmatch(r"[1-9][0-9]{0,15}", subject)
            or not find_public(int(subject))
            or type(claims["exp"]) is not int
        ):
            raise jwt.InvalidTokenError("Invalid user or expiration claim")
        # 실제 만료 판정도 PyJWT에 맡깁니다. 서명 검증을 비활성화하지 않습니다.
        jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"],
            issuer=JWT_ISSUER,
            audience=JWT_AUDIENCE,
            options=options,
        )
    except jwt.ExpiredSignatureError:
        raise ApiError(
            401, "TOKEN_EXPIRED", "로그인 시간이 만료되었습니다. 다시 로그인하세요."
        ) from None
    except jwt.InvalidTokenError:
        raise ApiError(
            401, "INVALID_TOKEN", "로그인 정보를 확인할 수 없습니다. 다시 로그인하세요."
        ) from None
    return int(subject)


def assert_owner(user_id, author_id):
    if user_id != author_id:
        raise ApiError(403, "FORBIDDEN", "본인이 작성한 글만 수정·삭제할 수 있습니다.")
