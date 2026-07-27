import pymysql
from pymysql.cursors import DictCursor

from app.config import (
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
)


def get_connection() -> pymysql.connections.Connection:

    connection = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=DictCursor,
        autocommit=False,
    )

    return connection

def commit(connection: pymysql.connections.Connection) -> None:
    connection.commit()


def rollback(connection: pymysql.connections.Connection) -> None:
    connection.rollback()


def close(connection: pymysql.connections.Connection) -> None:
    try:
        connection.close()
    except Exception:
        pass