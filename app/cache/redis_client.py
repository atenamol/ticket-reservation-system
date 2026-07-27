import os

import redis
from dotenv import load_dotenv

load_dotenv()

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    db=0,
    decode_responses=True
)


def check_redis():
    try:
        redis_client.ping()
        return True
    except Exception:
        return False


def set_value(key, value, ex=None):
    redis_client.set(key, value, ex=ex)


def get_value(key):
    return redis_client.get(key)


def delete_value(key):
    redis_client.delete(key)