from typing import Any

from fastapi import APIRouter, Depends

from app.auth.dependencies import require_spectator
from app.schemas.transaction_schema import (
    ReservationRequest,
    ReservationResponse,
    PaymentRequest,
    PaymentResponse,
    ReservationHistoryItem,
    CancellationRequestCreate,
    CancellationResponse,
    CancellationPenaltyResponse,
    ReportRequest,
    ReportResponse,
)
from app.services.transaction_service import TransactionService

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)


@router.post("/reserve", response_model=ReservationResponse)
def reserve_ticket(
    request: ReservationRequest,
    current_user: dict[str, Any] = Depends(require_spectator),
):
    return TransactionService.reserve_ticket(
        request,
        current_user["user_id"],
    )


@router.post("/pay", response_model=PaymentResponse)
def pay_for_ticket(
    request: PaymentRequest,
    current_user: dict[str, Any] = Depends(require_spectator),
):
    return TransactionService.pay_for_reservation(
        request,
        current_user["user_id"],
    )


@router.get("/bookings", response_model=list[ReservationHistoryItem])
def get_user_bookings(
    current_user: dict[str, Any] = Depends(require_spectator),
):
    return TransactionService.get_user_history(
        current_user["user_id"],
    )


@router.get(
    "/cancellation-penalty/{reservation_id}",
    response_model=CancellationPenaltyResponse,
)
def check_cancellation_penalty(
    reservation_id: int,
    current_user: dict[str, Any] = Depends(require_spectator),
):
    return TransactionService.check_cancellation_penalty(
        reservation_id,
        current_user["user_id"],
    )


@router.post("/cancel", response_model=CancellationResponse)
def cancel_ticket(
    request: CancellationRequestCreate,
    current_user: dict[str, Any] = Depends(require_spectator),
):
    return TransactionService.create_cancellation_request(
        request.reservation_id,
        current_user["user_id"],
    )


@router.post("/report", response_model=ReportResponse)
def report_ticket_issue(
    request: ReportRequest,
    current_user: dict[str, Any] = Depends(require_spectator),
):
    return TransactionService.create_report(
        request,
        current_user["user_id"],
    )