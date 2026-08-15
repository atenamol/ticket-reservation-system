from datetime import date
from decimal import Decimal
from typing import Optional
from typing import Literal
from fastapi import APIRouter, HTTPException, Query

from app.schemas.catalog_schema import (
    CityResponse,
    TicketDetailResponse,
    TicketSearchQuery,
    TicketSearchResult,
    VenueResponse,
)

from app.services import catalog_service as service

router = APIRouter(
    prefix="/catalog",
    tags=["Catalog"],
)


# Cities


@router.get("/cities", response_model=list[CityResponse])
def get_cities():
    """
    Return all available cities.
    """
    return service.list_cities()


# Venues


@router.get("/venues", response_model=list[VenueResponse])
def get_venues(
    city_id: Optional[int] = Query(default=None),
):
    """
    Return all venues
    Optionally filter by city.
    """

    return service.list_venues(city_id)


# Ticket Search


@router.get("/tickets/search", response_model=list[TicketSearchResult])
def search_tickets(
        sport_type: Optional[Literal["Football", "Basketball", "Volleyball"]] = Query(
            default=None
        ),
        city_id: Optional[int] = Query(default=None),
        venue_id: Optional[int] = Query(default=None),
        team_id: Optional[int] = Query(default=None),
        date_from: Optional[date] = Query(default=None),
        date_to: Optional[date] = Query(default=None),
        category: Optional[str] = Query(default=None),
        min_price: Optional[Decimal] = Query(default=None),
        max_price: Optional[Decimal] = Query(default=None),
        q: Optional[str] = Query(default=None),
):
    filters = TicketSearchQuery(
        q=q,
        sport_type=sport_type,
        city_id=city_id,
        venue_id=venue_id,
        team_id=team_id,
        date_from=date_from,
        date_to=date_to,
        category=category,
        min_price=min_price,
        max_price=max_price,
    )

    return service.search_tickets(filters)

# Ticket Details


@router.get(
    "/tickets/{ticket_id}",
    response_model=TicketDetailResponse,
)
def get_ticket_details(ticket_id: int):
    """
    Return details for one ticket.
    """

    ticket = service.get_ticket_detail(ticket_id)
    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    return ticket

__all__ = ["router"]