import json
from typing import Any

from app.cache.redis_client import redis_client

PROFILE_PREFIX = "profile:"
PROFILE_TTL_SECONDS = 600


def get_cached_profile(user_id: int) -> dict[str, Any] | None:
    """
    Return cached user profile if available.
    """
    cached = redis_client.get(f"{PROFILE_PREFIX}{user_id}")

    if cached is None:
        return None

    return json.loads(cached)


def set_cached_profile(user_id: int, profile: dict[str, Any]) -> None:
    """
    Store user profile in Redis.
    """
    redis_client.setex(
        f"{PROFILE_PREFIX}{user_id}",
        PROFILE_TTL_SECONDS,
        json.dumps(profile, default=str),
    )


def invalidate_profile(user_id: int) -> None:
    """
    Remove cached user profile.
    """
    redis_client.delete(f"{PROFILE_PREFIX}{user_id}")