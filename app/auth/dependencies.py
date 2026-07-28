from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from app.auth.security import decode_access_token

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict[str, Any]:

    token = credentials.credentials

    try:
        payload = decode_access_token(token)

        return payload

    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        ) from exc


def require_admin(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:

    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    return current_user


def require_spectator(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:

    if current_user.get("role") != "spectator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Spectator access required.",
        )

    return current_user