from app.cache import search_cache as cache
from app.database.database import close, get_connection
from app.queries import catalog_queries as q
from app.schemas.catalog_schema import TicketSearchQuery

# Cities


def list_cities():
    conn = get_connection()

    try:
        with conn.cursor() as cur:
            return q.get_all_cities(cur)
    finally:
        close(conn)


# Venues


def list_venues(city_id: int | None = None):
    conn = get_connection()

    try:
        with conn.cursor() as cur:
            return q.get_all_venues(cur, city_id)
    finally:
        close(conn)


# Ticket Search


def search_tickets(filters: TicketSearchQuery):
    """
    Search tickets using optional filters.
    Results are cached in Redis.
    """

    filter_dict = filters.model_dump(exclude_none=True)

    cached = cache.get_cached_search(filter_dict)
    if cached is not None:
        return cached

    conn = get_connection()

    try:
        with conn.cursor() as cur:
            results = q.search_tickets(cur, **filter_dict)
    finally:
        close(conn)

    cache.set_cached_search(filter_dict, results)

    return results


# Ticket Details


def get_ticket_detail(ticket_id: int):
    """
    Return detailed information about one ticket.
    """

    cached = cache.get_cached_ticket_detail(ticket_id)

    if cached is not None:
        return cached

    conn = get_connection()

    try:
        with conn.cursor() as cur:

            base = q.get_ticket_base(cur, ticket_id)

            if base is None:
                return None

            detail = dict(base)

            sport = base.get("sport_type")

            if sport == "Football":
                extra = q.get_football_detail(cur, ticket_id)
                hall_name = extra.get("stadium_name") if extra else None

            elif sport == "Basketball":
                extra = q.get_basketball_detail(cur, ticket_id)
                hall_name = extra.get("hall_name") if extra else None

            elif sport == "Volleyball":
                extra = q.get_volleyball_detail(cur, ticket_id)
                hall_name = extra.get("hall_name") if extra else None

            else:
                extra = None
                hall_name = None

            if extra:
                detail.update(
                    {
                        "seat_section": extra.get("seat_section"),
                        "seat_row": extra.get("seat_row"),
                        "seat_number": extra.get("seat_number"),
                        "ticket_type": extra.get("ticket_type"),
                        "league_name": extra.get("league_name"),
                        "stadium_or_hall_name": hall_name,
                        "amenities": extra.get("amenities"),
                    }
                )

    finally:
        close(conn)

    cache.set_cached_ticket_detail(ticket_id, detail)

    return detail
