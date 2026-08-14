
from elasticsearch import Elasticsearch

from app.config import ELASTIC_HOST, ELASTIC_INDEX


client = Elasticsearch(
    ELASTIC_HOST,
    request_timeout=60,
)


def search_tickets(filters: dict):

    filter_queries = []

    filter_queries.append(
        {
            "range": {
                "remaining_capacity": {
                    "gt": 0
                }
            }
        }
    )
    
    # Sport type
    if filters.get("sport_type"):
        filter_queries.append(
            {
                "term": {
                    "sport_type": filters["sport_type"]
                }
            }
        )

    # City
    if filters.get("city_id"):
        filter_queries.append(
            {
                "term": {
                    "city_id": filters["city_id"]
                }
            }
        )

    # Venue
    if filters.get("venue_id"):
        filter_queries.append(
            {
                "term": {
                    "venue_id": filters["venue_id"]
                }
            }
        )

    if filters.get("team_name"):
        filter_queries.append(
            {
                "bool": {
                    "should": [
                        {
                            "match": {
                                "home_team": filters["team_name"]
                            }
                        },
                        {
                            "match": {
                                "away_team": filters["team_name"]
                            }
                        }
                    ],
                    "minimum_should_match": 1
                }
            }
        )

    # Category
    if filters.get("category"):
        filter_queries.append(
            {
                "term": {
                    "category": filters["category"]
                }
            }
        )

    # Price range
    price_range = {}

    if filters.get("min_price") is not None:
        price_range["gte"] = float(filters["min_price"])

    if filters.get("max_price") is not None:
        price_range["lte"] = float(filters["max_price"])

    if price_range:
        filter_queries.append(
            {
                "range": {
                    "price": price_range
                }
            }
        )

    # Match date range
    date_range = {}

    if filters.get("date_from"):
        date_range["gte"] = filters["date_from"].isoformat()

    if filters.get("date_to"):
        date_range["lte"] = filters["date_to"].isoformat()

    if date_range:
        filter_queries.append(
            {
                "range": {
                    "match_date": date_range
                }
            }
        )


    response = client.search(
        index=ELASTIC_INDEX,
        query={
            "bool": {
                "filter": filter_queries
            }
        },
        size=100
    )

    return [
        hit["_source"]
        for hit in response["hits"]["hits"]
    ]