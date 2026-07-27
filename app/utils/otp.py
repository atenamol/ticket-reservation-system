import random

from app.cache.redis_client import redis_client


OTP_EXPIRE_SECONDS = 300


def generate_otp():
    return str(random.randint(100000, 999999))


def save_otp(phone: str, otp: str):
    redis_client.setex(
        f"otp:{phone}",
        OTP_EXPIRE_SECONDS,
        otp
    )


def get_otp(phone: str):
    return redis_client.get(f"otp:{phone}")


def verify_otp(phone: str, otp: str):
    saved = get_otp(phone)

    if saved is None:
        return False

    if saved != otp:
        return False

    redis_client.delete(f"otp:{phone}")
    return True