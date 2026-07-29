from pymysql.cursors import DictCursor

from app.database import get_connection
from app.schemas.auth_schema import SignupRequest


def get_user_by_email(cursor: DictCursor, email: str) -> dict | None:

    cursor.execute(
        """
        SELECT 
            user_id,
            first_name,
            last_name,
            email,
            phone,
            role,
            city_id,
            password_hash,
            account_status,
            profile_picture,
            registered_at
        FROM User
        WHERE email = %s
        """,
        (email,)
    )

    return cursor.fetchone()



def get_user_by_phone(cursor: DictCursor, phone: str) -> dict | None:
    cursor.execute(
        """
        SELECT 
            user_id,
            first_name,
            last_name,
            email,
            phone,
            role,
            city_id,
            password_hash,
            account_status,
            profile_picture,
            registered_at
        FROM User
        WHERE phone = %s
        """,
        (phone,)
    )

    return cursor.fetchone()


def get_user_by_contact(cursor: DictCursor, email: str | None,
                        phone: str | None ) -> dict | None:

    cursor.execute(
        """
        SELECT 
            user_id,
            first_name,
            last_name,
            email,
            phone,
            role,
            city_id,
            password_hash,
            account_status,
            profile_picture,
            registered_at
        FROM User
        WHERE
            (%s IS NOT NULL AND email = %s)
            OR
            (%s IS NOT NULL AND phone = %s)
        """,
        (email, email, phone, phone),
    )

    return cursor.fetchone()


def create_user(cursor,
    user: SignupRequest,
    password_hash: str,
) -> int:

    cursor.execute(
        """
        INSERT INTO User
        (
            first_name,
            last_name,
            email,
            phone,
            role,
            city_id,
            password_hash,
            profile_picture
        )
        VALUES
        (
            %s,%s,%s,%s,'spectator',%s,%s,%s
        )
        """,
        (
            user.first_name,
            user.last_name,
            user.email,
            user.phone,
            user.city_id,
            password_hash,
            user.profile_picture,
        ),
    )

    return cursor.lastrowid


def get_user_by_id(cursor: DictCursor,
    user_id: int,
) -> dict | None:

    cursor.execute(
        """
        SELECT 
            user_id,
            first_name,
            last_name,
            email,
            phone,
            role,
            city_id,
            password_hash,
            account_status,
            profile_picture,
            registered_at
        FROM User
        WHERE user_id = %s
        """,
        (user_id,),
    )

    return cursor.fetchone()


def update_user_profile(cursor,
    user_id: int,
    first_name: str | None,
    last_name: str | None,
    email: str | None,
    phone: str | None,
    city_id: int | None,
    profile_picture: str | None,
) -> bool:

    cursor.execute(
        """
        UPDATE User
        SET
            first_name = COALESCE(%s, first_name),
            last_name = COALESCE(%s, last_name),
            email = COALESCE(%s, email),
            phone = COALESCE(%s, phone),
            city_id = COALESCE(%s, city_id),
            profile_picture = COALESCE(%s, profile_picture)
        WHERE user_id = %s
        """,
        (
            first_name,
            last_name,
            email,
            phone,
            city_id,
            profile_picture,
            user_id,
        ),
    )

    return cursor.rowcount > 0
