from fastapi import APIRouter

from app.schemas.transaction_schema import ReservationRequest
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/reserve")
def reserve_ticket(request: ReservationRequest):

    return TransactionService.reserve_ticket(request)