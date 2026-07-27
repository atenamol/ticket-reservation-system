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
    """
    Create and return a new MySQL database connection.
    """

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

if __name__ == "__main__":
    try:
        connection = get_connection()
        print("Connected to MySQL successfully!")
        connection.close()
    except Exception as e:
        print("Connection failed!")
        print(e)