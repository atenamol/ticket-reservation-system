from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel


# ---------- Cities ----------

class CityResponse(BaseModel):
    city_id: int
    name: str
    province: str


# ---------- Venues ----------

class VenueResponse(BaseModel):
    venue_id: int
    name: str
    capacity: int
    address: str
    refund_policy_rules: Optional[str] = None
    city_id: int
    city_name: str


# ---------- Ticket search ----------

class TicketSearchQuery(BaseModel):
    sport_type: Optional[Literal["Volleyball", "Basketball", "Football"]] = None
    city_id: Optional[int] = None
    venue_id: Optional[int] = None
    team_id: Optional[int] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    category: Optional[Literal["VIP", "normal", "special"]] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None


class TicketSearchResult(BaseModel):
    ticket_id: int
    price: Decimal
    category: str
    remaining_capacity: int
    match_id: int
    sport_type: str
    match_date: datetime
    venue_id: int
    venue_name: str
    city_id: int
    city_name: str
    home_team: str
    away_team: str


# ---------- Ticket details ----------

class TicketDetailResponse(BaseModel):
    ticket_id: int
    price: Decimal
    category: str
    remaining_capacity: int
    match_id: int
    sport_type: str
    match_date: datetime
    venue_id: int
    venue_name: str
    address: str
    city_name: str
    home_team: str
    away_team: str
    seat_section: Optional[str] = None
    seat_row: Optional[str] = None
    seat_number: Optional[int] = None
    ticket_type: Optional[str] = None
    league_name: Optional[str] = None
    stadium_or_hall_name: Optional[str] = None
    amenities: Optional[str] = None
