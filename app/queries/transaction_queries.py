"""
All raw SQL for the Transaction domain.

Handles reservations, payments, cancellation requests and reports.
Every function takes an open pymysql DictCursor.
No ORM.
"""

def get_ticket_for_reservation(cursor, ticket_id):
    cursor.execute(
        """
        SELECT
            ticket_id,
            price,
            remaining_capacity,
            category
        FROM Ticket
        WHERE ticket_id = %s
        """,
        (ticket_id,),
    )
    return cursor.fetchone()

def get_ticket_id_from_reservation(cursor, reservation_id):
    cursor.execute(
        """
        SELECT ticket_id
        FROM Reservation
        WHERE reservation_id = %s
        """,
        (reservation_id,),
    )
    return cursor.fetchone()


def create_reservation(cursor, ticket_id, user_id):
    cursor.execute(
        """
        INSERT INTO Reservation
        (
            ticket_id,
            user_id,
            status,
            reserved_at,
            expires_at
        )
        VALUES
        (
            %s,
            %s,
            'reserved',
            NOW(),
            DATE_ADD(NOW(), INTERVAL 10 MINUTE)
        )
        """,
        (ticket_id, user_id),
    )
    return cursor.lastrowid


def get_reservation(cursor, reservation_id):
    cursor.execute(
        """
        SELECT *
        FROM Reservation
        WHERE reservation_id = %s
        """,
        (reservation_id,),
    )
    return cursor.fetchone()

def get_reservation_by_user(cursor, reservation_id, user_id):
    cursor.execute(
        """
        SELECT *
        FROM Reservation
        WHERE reservation_id = %s
          AND user_id = %s
        """,
        (reservation_id, user_id),
    )
    return cursor.fetchone()


def get_user_reservations(cursor, user_id):
    cursor.execute(
        """
        SELECT
            r.reservation_id,
            r.status,
            r.reserved_at,
            r.expires_at,
            t.ticket_id,
            t.price,
            t.category,
            m.sport_type,
            m.match_date
        FROM Reservation r
        JOIN Ticket t
            ON r.ticket_id = t.ticket_id
        JOIN Matchh m
            ON t.match_id = m.match_id
        WHERE r.user_id = %s
        ORDER BY r.reserved_at DESC
        """,
        (user_id,),
    )
    return cursor.fetchall()

def get_user_ticket_reservation(cursor, user_id, ticket_id):
    cursor.execute(
        """
        SELECT *
        FROM Reservation
        WHERE user_id = %s
          AND ticket_id = %s
        ORDER BY reserved_at DESC
        LIMIT 1
        """,
        (user_id, ticket_id),
    )
    return cursor.fetchone()

def decrease_capacity(cursor, ticket_id):
    cursor.execute(
        """
        UPDATE Ticket
        SET remaining_capacity = remaining_capacity - 1
        WHERE ticket_id = %s
          AND remaining_capacity > 0
        """,
        (ticket_id,),
    )


def increase_capacity(cursor, ticket_id):
    cursor.execute(
        """
        UPDATE Ticket
        SET remaining_capacity = remaining_capacity + 1
        WHERE ticket_id = %s
        """,
        (ticket_id,),
    )


def mark_reservation_paid(cursor, reservation_id):
    cursor.execute(
        """
        UPDATE Reservation
        SET status = 'paid'
        WHERE reservation_id = %s
            AND status = 'reserved'
        """,
        (reservation_id,),
    )


def cancel_reservation(cursor, reservation_id):
    cursor.execute(
        """
        UPDATE Reservation
        SET status = 'cancelled'
        WHERE reservation_id = %s
            AND status = 'reserved'
        """,
        (reservation_id,),
    )


def create_payment(
    cursor,
    reservation_id,
    user_id,
    amount,
    payment_method,
    payment_status="completed",
):
    cursor.execute(
        """
        INSERT INTO Payment
        (
            reservation_id,
            user_id,
            amount,
            payment_status,
            payment_method
        )
        VALUES
        (
            %s,
            %s,
            %s,
            %s,
            %s
        )
        """,
        (
            reservation_id,
            user_id,
            amount,
            payment_status,
            payment_method,
        ),
    )
    return cursor.lastrowid


def get_payment(cursor, payment_id):
    cursor.execute(
        """
        SELECT *
        FROM Payment
        WHERE payment_id = %s
        """,
        (payment_id,),
    )
    return cursor.fetchone()

def get_payment_by_reservation(cursor, reservation_id):
    cursor.execute(
        """
        SELECT *
        FROM Payment
        WHERE reservation_id = %s
        """,
        (reservation_id,),
    )
    return cursor.fetchone()


def create_cancellation_request(
    cursor,
    reservation_id,
    user_id,
    penalty_percent,
    refund_amount,
):
    cursor.execute(
        """
        INSERT INTO CancellationRequest
        (
            reservation_id,
            user_id,
            penalty_percent,
            refund_amount,
            status
        )
        VALUES
        (
            %s,
            %s,
            %s,
            %s,
            'pending'
        )
        """,
        (
            reservation_id,
            user_id,
            penalty_percent,
            refund_amount,
        ),
    )
    return cursor.lastrowid

def get_cancellation_request(cursor, cancel_id):
    cursor.execute(
        """
        SELECT *
        FROM CancellationRequest
        WHERE cancel_id = %s
        """,
        (cancel_id,),
    )
    return cursor.fetchone()


def create_report(
    cursor,
    user_id,
    ticket_id,
    subject,
    description,
):
    cursor.execute(
        """
        INSERT INTO Report
        (
            user_id,
            ticket_id,
            subject,
            description,
            status
        )
        VALUES
        (
            %s,
            %s,
            %s,
            %s,
            'open'
        )
        """,
        (
            user_id,
            ticket_id,
            subject,
            description,
        ),
    )
    return cursor.lastrowid

def get_report(cursor, report_id):
    cursor.execute(
        """
        SELECT *
        FROM Report
        WHERE report_id = %s
        """,
        (report_id,),
    )
    return cursor.fetchone()