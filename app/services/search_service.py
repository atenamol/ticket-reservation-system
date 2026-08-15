from elasticsearch import Elasticsearch

from app.config import ELASTIC_HOST, ELASTIC_INDEX


client = Elasticsearch(
    ELASTIC_HOST,
    request_timeout=60,
)


def search_tickets(filters: dict):
    must = []

    if filters.get("sport_type") is not None:
        must.append({
            "term": {
                "sport_type": filters["sport_type"]
            }
        })

    if filters.get("city_id") is not None:
        must.append({
            "term": {
                "city_id": filters["city_id"]
            }
        })

    if filters.get("venue_id") is not None:
        must.append({
            "term": {
                "venue_id": filters["venue_id"]
            }
        })

    if filters.get("team_id") is not None:
        must.append({
            "bool": {
                "should": [
                    {
                        "term": {
                            "home_team_id": filters["team_id"]
                        }
                    },
                    {
                        "term": {
                            "away_team_id": filters["team_id"]
                        }
                    },
                ],
                "minimum_should_match": 1,
            }
        })

    if filters.get("date_from") is not None:
        must.append({
            "range": {
                "match_date": {
                    "gte": filters["date_from"]
                }
            }
        })

    if filters.get("date_to") is not None:
        must.append({
            "range": {
                "match_date": {
                    "lte": filters["date_to"]
                }
            }
        })

    if filters.get("category") is not None:
        must.append({
            "term": {
                "category": filters["category"]
            }
        })

    price_range = {}

    if filters.get("min_price") is not None:
        price_range["gte"] = float(filters["min_price"])

    if filters.get("max_price") is not None:
        price_range["lte"] = float(filters["max_price"])

    if price_range:
        must.append({
            "range": {
                "price": price_range
            }
        })

    query = {
        "bool": {
            "must": must
        }
    }

    response = client.search(
        index=ELASTIC_INDEX,
        query=query,
    )

    return [
        hit["_source"]
        for hit in response["hits"]["hits"]
    ]