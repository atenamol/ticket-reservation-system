from typing import Any

from fastapi import APIRouter, Depends

from app.auth.dependencies import (
    require_admin,
    require_spectator,
)

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
    AdminCancellationUpdateRequest,
    AdminCancellationItem,
    AdminReportUpdateRequest,
    AdminReportItem,
    SuspiciousPaymentItem,
    MessageResponse,
    UserReportItem,
)

from app.services.transaction_service import TransactionService

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)

# ---------- Reservation ----------


@router.post("/reserve", response_model=ReservationResponse)
def reserve_ticket(
    request: ReservationRequest,
    current_user: dict[str, Any] = Depends(require_spectator),
):
    return TransactionService.reserve_ticket(
        request,
        current_user["user_id"],
    )

@router.get(
    "/my-reservations",
    response_model=list[ReservationHistoryItem],
)
def get_my_reservations(
    current_user: dict[str, Any] = Depends(require_spectator),
):
    return TransactionService.get_active_reservations(
        current_user["user_id"],
    )
# ---------- Payment ----------


@router.post("/pay", response_model=PaymentResponse)
def pay_for_ticket(
    request: PaymentRequest,
    current_user: dict[str, Any] = Depends(require_spectator),
):
    return TransactionService.pay_for_reservation(
        request,
        current_user["user_id"],
    )

# ---------- Booking ----------


@router.get("/bookings", response_model=list[ReservationHistoryItem])
def get_user_bookings(
    current_user: dict[str, Any] = Depends(require_spectator),
):
    return TransactionService.get_user_history(
        current_user["user_id"],
    )

# ---------- Cancellation ----------


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
@router.post("/my-reservations/cancel", response_model=MessageResponse)
def cancel_my_reservation(request: CancellationRequestCreate,
    current_user: dict[str, Any] = Depends(require_spectator)):
    return TransactionService.cancel_active_reservation(
        request.reservation_id,
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

# ---------- Report ----------


@router.post("/report", response_model=ReportResponse)
def report_ticket_issue(
    request: ReportRequest,
    current_user: dict[str, Any] = Depends(require_spectator),
):
    return TransactionService.create_report(
        request,
        current_user["user_id"],
    )

@router.get(
    "/reports",
    response_model=list[UserReportItem],
)
def get_my_reports(
        current_user: dict[str, Any] = Depends(require_spectator),
):
    return TransactionService.get_user_reports(
        current_user["user_id"],
    )

# ---------- Admin ----------

@router.get(
    "/admin/cancellations",
    response_model=list[AdminCancellationItem],
)
def get_all_cancellation_requests(
    current_user: dict[str, Any] = Depends(require_admin),
):
    return TransactionService.get_all_cancellation_requests()


@router.patch(
    "/admin/cancellations/{cancel_id}",
    response_model=MessageResponse,
)
def update_cancellation_request(
    cancel_id: int,
    request: AdminCancellationUpdateRequest,
    current_user: dict[str, Any] = Depends(require_admin),
):
    return TransactionService.update_cancellation_request(
        cancel_id,
        request.status,
        current_user["user_id"],
    )


@router.get(
    "/admin/reports",
    response_model=list[AdminReportItem],
)
def get_all_reports(
    current_user: dict[str, Any] = Depends(require_admin),
):
    return TransactionService.get_all_reports()


@router.patch(
    "/admin/reports/{report_id}",
    response_model=MessageResponse,
)
def update_report(
    report_id: int,
    request: AdminReportUpdateRequest,
    current_user: dict[str, Any] = Depends(require_admin),
):
    return TransactionService.update_report(
        report_id,
        request.status,
        request.admin_response,
    )


@router.get(
    "/admin/payments/suspicious",
    response_model=list[SuspiciousPaymentItem],
)
def get_suspicious_payments(
    current_user: dict[str, Any] = Depends(require_admin),
):
    return TransactionService.get_suspicious_payments()