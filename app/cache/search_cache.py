import hashlib
import json
from typing import Any, Optional

from app.cache.redis_client import redis_client

# Cache Configuration

SEARCH_TTL_SECONDS = 120        # Search cache: 2 minute
DETAIL_TTL_SECONDS = 600     # Ticket details cache: 10 minutes

SEARCH_PREFIX = "search:tickets:"
DETAIL_PREFIX = "ticket:detail:"


# Helper Functions

def _build_search_key(filters: dict) -> str:
    """ Generate a unique cache key from search filters. """
    normalized = json.dumps(filters, sort_keys=True, default=str)
    digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
    return f"{SEARCH_PREFIX}{digest}"


# Search Cache

def get_cached_search(filters: dict) -> Optional[list]:
    """
    Return cached search results if available.
    """
    key = _build_search_key(filters)

    cached = redis_client.get(key)

    if cached is None:
        return None

    return json.loads(cached)


def set_cached_search(filters: dict, results: list[Any]) -> None:
    """ Store search results in Redis. """
    key = _build_search_key(filters)

    redis_client.setex(
        key,
        SEARCH_TTL_SECONDS,
        json.dumps(results, default=str),
    )


# Ticket Details Cache

def get_cached_ticket_detail(ticket_id: int) -> Optional[dict]:
    """ Return cached ticket details. """
    cached = redis_client.get(f"{DETAIL_PREFIX}{ticket_id}")

    if cached is None:
        return None

    return json.loads(cached)


def set_cached_ticket_detail(ticket_id: int, detail: dict) -> None:
    """ Store ticket details in Redis. """
    redis_client.setex(
        f"{DETAIL_PREFIX}{ticket_id}",
        DETAIL_TTL_SECONDS,
        json.dumps(detail, default=str),
    )


# Cache Invalidation

def invalidate_ticket_detail(ticket_id: int) -> None:
    """ Remove cache of a specific ticket. """
    redis_client.delete(f"{DETAIL_PREFIX}{ticket_id}")


def invalidate_all_search_cache() -> None:
    """ Clear all cached search results. """
    for key in redis_client.scan_iter(f"{SEARCH_PREFIX}*"):
        redis_client.delete(key)
