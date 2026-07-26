from pydantic import BaseModel


class ReservationRequest(BaseModel):
    ticket_id: int


class ReservationResponse(BaseModel):
    reservation_id: int
    status: str
    expires_at: str