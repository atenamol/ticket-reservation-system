from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.config import (
    JWT_SECRET,
    JWT_ALGORITHM,
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES,
)


def hash_password(password: str) -> str:

    salt = bcrypt.gensalt()

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        salt,
    )

    return hashed_password.decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str,

) -> bool:

    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def create_access_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:

    payload = data.copy()

    expire = datetime.now(UTC) + (
        expires_delta
        or timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    payload.update({"exp": expire})

    encoded_jwt = jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )

    return encoded_jwt


def decode_access_token(
    token: str,
) -> dict[str, Any]:

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )

        if payload.get("sub") is None:
            raise JWTError("Token payload is missing subject.")

        if payload.get("role") is None:
            raise JWTError("Token payload is missing role.")

        return payload

    except JWTError as exc:
        raise JWTError("Invalid or expired token.") from exc