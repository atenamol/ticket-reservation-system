from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel


# ---------- Reservation ----------

class ReservationRequest(BaseModel):
    ticket_id: int


class ReservationResponse(BaseModel):
    reservation_id: int
    ticket_id: int
    user_id: int
    status: Literal["reserved", "paid", "cancelled"]
    reserved_at: datetime
    expires_at: datetime


# ---------- Payment ----------

class PaymentRequest(BaseModel):
    reservation_id: int
    payment_method: str


class PaymentResponse(BaseModel):
    payment_id: int
    reservation_id: int
    user_id: int
    amount: Decimal
    payment_status: Literal["completed", "pending", "failed"]
    payment_method: str
    transaction_date: datetime
    refund_amount: Decimal


# ---------- Reservation History ----------

class ReservationHistoryItem(BaseModel):
    reservation_id: int
    status: Literal["reserved", "paid", "cancelled"]
    reserved_at: datetime
    expires_at: datetime
    ticket_id: int
    price: Decimal
    category: str
    sport_type: str
    match_date: datetime


# ---------- Cancellation ----------

class CancellationRequestCreate(BaseModel):
    reservation_id: int


class CancellationResponse(BaseModel):
    cancel_id: int
    reservation_id: int
    penalty_percent: Decimal
    refund_amount: Decimal
    status: Literal["pending", "approved", "rejected"]

class CancellationPenaltyResponse(BaseModel):
    penalty_percent: Decimal
    refund_amount: Decimal


# ---------- Report ----------

class ReportRequest(BaseModel):
    ticket_id: int
    subject: str
    description: str


class ReportResponse(BaseModel):
    report_id: int
    status: Literal["open", "closed", "in_progress"]
    created_at: datetime
    admin_response: Optional[str] = None


# ---------- Admin ----------

class AdminCancellationUpdateRequest(BaseModel):
    status: Literal["approved", "rejected"]


class AdminCancellationItem(BaseModel):
    cancel_id: int
    reservation_id: int
    user_id: int
    penalty_percent: Decimal
    refund_amount: Decimal
    status: Literal["pending", "approved", "rejected"]


class AdminReportUpdateRequest(BaseModel):
    status: Literal["open", "in_progress", "closed"]
    admin_response: str


class AdminReportItem(BaseModel):
    report_id: int
    user_id: int
    ticket_id: int
    subject: str
    description: str
    status: Literal["open", "in_progress", "closed"]
    created_at: datetime
    admin_response: Optional[str]


class SuspiciousPaymentItem(BaseModel):
    payment_id: int
    reservation_id: int
    user_id: int
    amount: Decimal
    payment_status: Literal["completed", "pending", "failed"]
    payment_method: str
    transaction_date: datetime

class MessageResponse(BaseModel):
    message: str