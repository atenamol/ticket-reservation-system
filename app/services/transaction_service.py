from fastapi import HTTPException

from app.database.database import get_connection, commit, rollback, close
from app.schemas.transaction_schema import (
    ReservationRequest,
    ReservationResponse,
    ReservationHistoryItem,
    PaymentRequest
)
from app.queries import transaction_queries as queries
from app.schemas.transaction_schema import (
    PaymentResponse,
)
from datetime import datetime
from decimal import Decimal

from app.schemas.transaction_schema import (
    CancellationPenaltyResponse,
    CancellationResponse,
    ReportRequest,
    ReportResponse,
)


class TransactionService:

# ---------- Reservation & User Bookings ----------

    @staticmethod
    def reserve_ticket(request: ReservationRequest, user_id: int) -> ReservationResponse:
        connection = get_connection()

        try:
            with connection.cursor() as cursor:

                ticket = queries.get_ticket_for_reservation(
                    cursor,
                    request.ticket_id,
                )

                if ticket is None:
                    raise HTTPException(
                        status_code=404,
                        detail="Ticket not found.",
                    )

                if ticket["remaining_capacity"] <= 0:
                    raise HTTPException(
                        status_code=400,
                        detail="Ticket is sold out.",
                    )

                existing = queries.get_user_ticket_reservation(
                    cursor,
                    user_id,
                    request.ticket_id,
                )

                if existing and existing["status"] == "reserved":
                    raise HTTPException(
                        status_code=400,
                        detail="You already have an active reservation for this ticket.",
                    )

                queries.decrease_capacity(
                    cursor,
                    request.ticket_id,
                )

                reservation_id = queries.create_reservation(
                    cursor,
                    request.ticket_id,
                    user_id,
                )

                reservation = queries.get_reservation(
                    cursor,
                    reservation_id,
                )

                commit(connection)

                return ReservationResponse(
                    reservation_id=reservation["reservation_id"],
                    ticket_id=reservation["ticket_id"],
                    user_id=reservation["user_id"],
                    status=reservation["status"],
                    reserved_at=reservation["reserved_at"],
                    expires_at=reservation["expires_at"],
                )

        except HTTPException:
            rollback(connection)
            raise

        except Exception:
            rollback(connection)
            raise HTTPException(
                status_code=500,
                detail="Failed to reserve ticket.",
            )

        finally:
            close(connection)

    @staticmethod
    def get_reservation(
        reservation_id: int,
        user_id: int,
    ) -> ReservationResponse:

        connection = get_connection()

        try:
            with connection.cursor() as cursor:

                reservation = queries.get_reservation_by_user(
                    cursor,
                    reservation_id,
                    user_id,
                )

                if reservation is None:
                    raise HTTPException(
                        status_code=404,
                        detail="Reservation not found.",
                    )

                return ReservationResponse(
                    reservation_id=reservation["reservation_id"],
                    ticket_id=reservation["ticket_id"],
                    user_id=reservation["user_id"],
                    status=reservation["status"],
                    reserved_at=reservation["reserved_at"],
                    expires_at=reservation["expires_at"],
                )

        except HTTPException:
            raise

        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Failed to retrieve reservation.",
            )

        finally:
            close(connection)

    @staticmethod
    def get_user_history(user_id: int) -> list[ReservationHistoryItem]:
        connection = get_connection()

        try:
            with connection.cursor() as cursor:

                reservations = queries.get_user_reservations(
                    cursor,
                    user_id,
                )

                return [
                    ReservationHistoryItem(**reservation)
                    for reservation in reservations
                ]

        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Failed to retrieve reservation history.",
            )

        finally:
            close(connection)

# ---------- Payment ----------

    @staticmethod
    def pay_for_reservation(
        request: PaymentRequest,
        user_id: int,
    ) -> PaymentResponse:

        connection = get_connection()

        try:
            with connection.cursor() as cursor:

                reservation = queries.get_reservation_by_user(
                    cursor,
                    request.reservation_id,
                    user_id,
                )

                if reservation is None:
                    raise HTTPException(
                        status_code=404,
                        detail="Reservation not found.",
                    )

                if reservation["status"] == "paid":
                    raise HTTPException(
                        status_code=400,
                        detail="Reservation has already been paid.",
                    )

                if reservation["status"] == "cancelled":
                    raise HTTPException(
                        status_code=400,
                        detail="Cancelled reservations cannot be paid.",
                    )

                ticket = queries.get_ticket_for_reservation(
                    cursor,
                    reservation["ticket_id"],
                )

                payment_id = queries.create_payment(
                    cursor,
                    request.reservation_id,
                    user_id,
                    ticket["price"],
                    request.payment_method,
                )

                queries.mark_reservation_paid(
                    cursor,
                    request.reservation_id,
                )

                payment = queries.get_payment(
                    cursor,
                    payment_id,
                )

                commit(connection)

                return PaymentResponse(
                    payment_id=payment["payment_id"],
                    reservation_id=payment["reservation_id"],
                    user_id=payment["user_id"],
                    amount=payment["amount"],
                    payment_status=payment["payment_status"],
                    payment_method=payment["payment_method"],
                    transaction_date=payment["transaction_date"],
                    refund_amount=payment["refund_amount"],
                )

        except HTTPException:
            rollback(connection)
            raise

        except Exception:
            rollback(connection)
            raise HTTPException(
                status_code=500,
                detail="Payment failed.",
            )

        finally:
            close(connection)


# ---------- get_payment for testing ----------

    @staticmethod
    def get_payment(
        reservation_id: int,
    ) -> PaymentResponse:

        connection = get_connection()

        try:
            with connection.cursor() as cursor:

                payment = queries.get_payment_by_reservation(
                    cursor,
                    reservation_id,
                )

                if payment is None:
                    raise HTTPException(
                        status_code=404,
                        detail="Payment not found.",
                    )

                return PaymentResponse(
                    payment_id=payment["payment_id"],
                    reservation_id=payment["reservation_id"],
                    user_id=payment["user_id"],
                    amount=payment["amount"],
                    payment_status=payment["payment_status"],
                    payment_method=payment["payment_method"],
                    transaction_date=payment["transaction_date"],
                    refund_amount=payment["refund_amount"],
                )

        except HTTPException:
            raise

        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Failed to retrieve payment.",
            )

        finally:
            close(connection)


# ---------- Cancellation Penalty & Cancellation Request ----------

    #penalties for cancellations:
    #48 hours before match → 10%
    #24-48 hours → 30%
    #<24 hours → 50%

    @staticmethod
    def check_cancellation_penalty(
        reservation_id: int,
        user_id: int,
    ) -> CancellationPenaltyResponse:

        connection = get_connection()

        try:
            with connection.cursor() as cursor:

                reservation = queries.get_reservation_by_user(
                    cursor,
                    reservation_id,
                    user_id,
                )

                if reservation is None:
                    raise HTTPException(
                        status_code=404,
                        detail="Reservation not found.",
                    )

                ticket = queries.get_ticket_for_reservation(
                    cursor,
                    reservation["ticket_id"],
                )

                match_time = ticket["match_date"]
                hours_left = (match_time - datetime.now()).total_seconds() / 3600

                if hours_left >= 48:
                    penalty = Decimal("10.00")
                elif hours_left >= 24:
                    penalty = Decimal("30.00")
                else:
                    penalty = Decimal("50.00")

                refund = ticket["price"] * (Decimal("100") - penalty) / Decimal("100")

                return CancellationPenaltyResponse(
                    penalty_percent=penalty,
                    refund_amount=refund,
                )

        except HTTPException:
            raise

        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Failed to calculate cancellation penalty.",
            )

        finally:
            close(connection)


    @staticmethod
    def create_cancellation_request(
        reservation_id: int,
        user_id: int,
    ) -> CancellationResponse:

        connection = get_connection()

        try:
            with connection.cursor() as cursor:

                reservation = queries.get_reservation_by_user(
                    cursor,
                    reservation_id,
                    user_id,
                )

                if reservation is None:
                    raise HTTPException(
                        status_code=404,
                        detail="Reservation not found.",
                    )

                penalty_info = TransactionService.check_cancellation_penalty(
                    reservation_id,
                    user_id,
                )

                cancel_id = queries.create_cancellation_request(
                    cursor,
                    reservation_id,
                    user_id,
                    penalty_info.penalty_percent,
                    penalty_info.refund_amount,
                )

                cancellation = queries.get_cancellation_request(
                    cursor,
                    cancel_id,
                )

                commit(connection)

                return CancellationResponse(
                    cancel_id=cancellation["cancel_id"],
                    reservation_id=cancellation["reservation_id"],
                    penalty_percent=cancellation["penalty_percent"],
                    refund_amount=cancellation["refund_amount"],
                    status=cancellation["status"],
                )

        except HTTPException:
            rollback(connection)
            raise

        except Exception:
            rollback(connection)
            raise HTTPException(
                status_code=500,
                detail="Failed to create cancellation request.",
            )

        finally:
            close(connection)


# ---------- Report issue ----------
    @staticmethod
    def create_report(
        request: ReportRequest,
        user_id: int,
    ) -> ReportResponse:

        connection = get_connection()

        try:
            with connection.cursor() as cursor:

                report_id = queries.create_report(
                    cursor,
                    user_id,
                    request.ticket_id,
                    request.subject,
                    request.description,
                )

                report = queries.get_report(
                    cursor,
                    report_id,
                )

                commit(connection)

                return ReportResponse(
                    report_id=report["report_id"],
                    status=report["status"],
                    created_at=report["created_at"],
                    admin_response=report["admin_response"],
                )

        except Exception:
            rollback(connection)
            raise HTTPException(
                status_code=500,
                detail="Failed to submit report.",
            )

        finally:
            close(connection)