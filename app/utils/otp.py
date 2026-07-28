import random

from app.cache.redis_client import redis_client
import re
import smtplib
from email.message import EmailMessage

from app.config import (
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    EMAIL_FROM,
)


OTP_EXPIRE_SECONDS = 300


def generate_otp():
    return str(random.randint(100000, 999999))


def save_otp(contact: str, otp: str):
    redis_client.setex(
        f"otp:{contact}",
        OTP_EXPIRE_SECONDS,
        otp
    )


def get_otp(contact: str):
    return redis_client.get(f"otp:{contact}")


def verify_otp(contact: str, otp: str):
    saved = get_otp(contact)

    if saved is None:
        return False

    if saved != otp:
        return False

    redis_client.delete(f"otp:{contact}")
    return True

def is_email(destination: str) -> bool:
    return re.match(r"^[^@]+@[^@]+\.[^@]+$", destination) is not None


def send_sms_otp(contact: str, otp: str):
    """
    Placeholder for SMS provider integration.
    """
    print(f"SMS OTP for {contact}: {otp}")


def send_email_otp(email: str, otp: str):
    message = EmailMessage()
    message["Subject"] = "Your Ticket Reservation OTP"
    message["From"] = EMAIL_FROM
    message["To"] = email

    message.set_content(
        f"""
Your verification code is:

{otp}

This code will expire in {OTP_EXPIRE_SECONDS // 60} minutes.

If you did not request this code, please ignore this email.
"""
    )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(SMTP_USER, SMTP_PASSWORD)
        smtp.send_message(message)

def send_otp(destination: str, otp: str):
    if is_email(destination):
        send_email_otp(destination, otp)
    else:
        send_sms_otp(destination, otp)