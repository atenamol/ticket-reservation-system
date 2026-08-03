"""
All raw SQL for the Catalog + Search domain (City, Venue, Ticket, Matchh).
"""


def get_all_cities(cursor):
    cursor.execute("""
        SELECT city_id, name, province
        FROM City
        ORDER BY name
        """)
    return cursor.fetchall()


def get_all_venues(cursor, city_id=None):
    if city_id:
        cursor.execute(
            """
            SELECT v.venue_id, v.name, v.capacity, v.address,
                   v.refund_policy_rules, c.city_id, c.name AS city_name
            FROM Venue v
            JOIN City c ON v.city_id = c.city_id
            WHERE v.city_id = %s
            ORDER BY v.name
            """,
            (city_id,),
        )
    else:
        cursor.execute("""
            SELECT v.venue_id, v.name, v.capacity, v.address,
                   v.refund_policy_rules, c.city_id, c.name AS city_name
            FROM Venue v
            JOIN City c ON v.city_id = c.city_id
            ORDER BY v.name
            """)
    return cursor.fetchall()


def search_tickets(
    cursor,
    sport_type=None,
    city_id=None,
    venue_id=None,
    team_id=None,
    date_from=None,
    date_to=None,
    category=None,
    min_price=None,
    max_price=None,
):
    """
    Search available tickets with optional filters.
    Only tickets with remaining_capacity > 0 are returned.
    """
    sql = """
        SELECT
            t.ticket_id,
            t.price,
            t.category,
            t.remaining_capacity,
            m.match_id,
            m.sport_type,
            m.match_date,
            v.venue_id,
            v.name AS venue_name,
            c.city_id,
            c.name AS city_name,
            ht.name AS home_team,
            at.name AS away_team
        FROM Ticket t
        JOIN Matchh m ON t.match_id = m.match_id
        JOIN Venue v ON m.venue_id = v.venue_id
        JOIN City c ON v.city_id = c.city_id
        JOIN Team ht ON m.home_team_id = ht.team_id
        JOIN Team at ON m.away_team_id = at.team_id
        WHERE t.remaining_capacity > 0
    """
    params = []

    if sport_type:
        sql += " AND m.sport_type = %s"
        params.append(sport_type)
    if city_id:
        sql += " AND c.city_id = %s"
        params.append(city_id)
    if venue_id:
        sql += " AND v.venue_id = %s"
        params.append(venue_id)
    if team_id:
        sql += " AND (m.home_team_id = %s OR m.away_team_id = %s)"
        params.extend([team_id, team_id])
    if date_from:
        sql += " AND DATE(m.match_date) >= %s"
        params.append(date_from)
    if date_to:
        sql += " AND DATE(m.match_date) <= %s"
        params.append(date_to)
    if category:
        sql += " AND t.category = %s"
        params.append(category)
    if min_price is not None:
        sql += " AND t.price >= %s"
        params.append(min_price)
    if max_price is not None:
        sql += " AND t.price <= %s"
        params.append(max_price)

    sql += " ORDER BY m.match_date ASC"

    cursor.execute(sql, tuple(params))
    return cursor.fetchall()


def get_ticket_base(cursor, ticket_id):
    """Core ticket info shared by every sport."""
    cursor.execute(
        """
        SELECT
            t.ticket_id,
            t.price,
            t.category,
            t.remaining_capacity,
            m.match_id,
            m.sport_type,
            m.match_date,
            v.venue_id,
            v.name AS venue_name,
            v.address,
            c.city_id,
            c.name AS city_name,
            ht.name AS home_team,
            at.name AS away_team
        FROM Ticket t
        JOIN Matchh m ON t.match_id = m.match_id
        JOIN Venue v ON m.venue_id = v.venue_id
        JOIN City c ON v.city_id = c.city_id
        JOIN Team ht ON m.home_team_id = ht.team_id
        JOIN Team at ON m.away_team_id = at.team_id
        WHERE t.ticket_id = %s
        """,
        (ticket_id,),
    )
    return cursor.fetchone()


def get_football_detail(cursor, ticket_id):
    cursor.execute("SELECT * FROM FootballDetail WHERE ticket_id = %s", (ticket_id,))
    return cursor.fetchone()


def get_volleyball_detail(cursor, ticket_id):
    cursor.execute("SELECT * FROM VolleyballDetail WHERE ticket_id = %s", (ticket_id,))
    return cursor.fetchone()


def get_basketball_detail(cursor, ticket_id):
    cursor.execute("SELECT * FROM BasketballDetail WHERE ticket_id = %s", (ticket_id,))
    return cursor.fetchone()

def get_all_tickets_for_indexing(cursor):
    cursor.execute(
        """
        SELECT
            t.ticket_id,
            t.price,
            t.category,
            t.remaining_capacity,
            m.match_id,
            m.sport_type,
            m.match_date,
            v.venue_id,
            v.name AS venue_name,
            c.city_id,
            c.name AS city_name,
            ht.team_id AS home_team_id,
            ht.name AS home_team,
            at.team_id AS away_team_id,
            at.name AS away_team
        FROM Ticket t
        JOIN Matchh m ON t.match_id = m.match_id
        JOIN Venue v ON m.venue_id = v.venue_id
        JOIN City c ON v.city_id = c.city_id
        JOIN Team ht ON m.home_team_id = ht.team_id
        JOIN Team at ON m.away_team_id = at.team_id
        WHERE t.remaining_capacity > 0
        ORDER BY t.ticket_id
        """
    )

    return cursor.fetchall()