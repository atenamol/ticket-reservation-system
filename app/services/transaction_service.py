from app.schemas.transaction_schema import (
    ReservationRequest,
    ReservationResponse
)


class TransactionService:

    @staticmethod
    def reserve_ticket(request: ReservationRequest) -> ReservationResponse:

        return ReservationResponse(
            reservation_id=1,
            status="reserved",
            expires_at="2026-08-01T12:00:00"
        )