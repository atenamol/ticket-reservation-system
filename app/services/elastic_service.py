"""
Service layer for Elasticsearch.
"""
from decimal import Decimal
from datetime import datetime

from elasticsearch import Elasticsearch
from elasticsearch.exceptions import ConnectionError

from app.config import ELASTIC_INDEX
from app.database.database import get_connection, close
from app.queries import catalog_queries as q


client = Elasticsearch(
    "http://localhost:9200",
    request_timeout=60
)

mapping = {
    "properties": {
        "ticket_id": {
            "type": "integer"
        },
        "price": {
            "type": "float"
        },
        "category": {
            "type": "keyword"
        },
        "remaining_capacity": {
            "type": "integer"
        },

        "match_id": {
            "type": "integer"
        },
        "sport_type": {
            "type": "keyword"
        },
        "match_date": {
            "type": "date"
        },

        "venue_id": {
            "type": "integer"
        },
        "venue_name": {
            "type": "text"
        },

        "city_id": {
            "type": "integer"
        },
        "city_name": {
            "type": "keyword"
        },

        "home_team_id": {
            "type": "integer"
        },

        "away_team_id": {
            "type": "integer"
        },

        "home_team": {
            "type": "text"
        },

        "away_team": {
            "type": "text"
        }
    }
}

def check_connection() -> bool:

    try:
        return client.ping()

    except ConnectionError:
        return False


def create_index():
    if client.indices.exists(index=ELASTIC_INDEX):
        print(f"Index '{ELASTIC_INDEX}' already exists")
        return False

    client.indices.create(
        index=ELASTIC_INDEX,
        settings={
            "number_of_shards": 1,
            "number_of_replicas": 0,
        },
        mappings=mapping,
    )

    print(f"Index '{ELASTIC_INDEX}' created")
    return True


def prepare_ticket(ticket):

    return {
        "ticket_id": ticket["ticket_id"],

        "price": float(ticket["price"])
        if isinstance(ticket["price"], Decimal)
        else ticket["price"],

        "category": ticket["category"],

        "remaining_capacity":
            ticket["remaining_capacity"],


        "match_id": ticket["match_id"],

        "sport_type":
            ticket["sport_type"],


        "match_date":
            ticket["match_date"].isoformat()
            if isinstance(ticket["match_date"], datetime)
            else ticket["match_date"],


        "venue_id":
            ticket["venue_id"],

        "venue_name":
            ticket["venue_name"],


        "city_id":
            ticket["city_id"],

        "city_name":
            ticket["city_name"],


        "home_team_id":
            ticket["home_team_id"],

        "home_team":
            ticket["home_team"],


        "away_team_id":
            ticket["away_team_id"],

        "away_team":
            ticket["away_team"],
    }

def index_ticket(ticket):

    document = prepare_ticket(ticket)

    return client.index(
        index=ELASTIC_INDEX,
        id=ticket["ticket_id"],
        document=document
    )


def delete_index():
    if client.indices.exists(index=ELASTIC_INDEX):
        client.indices.delete(index=ELASTIC_INDEX)


def recreate_index():
    delete_index()
    create_index()


def update_ticket(ticket: dict):
    client.update(
        index=ELASTIC_INDEX,
        id=ticket["ticket_id"],
        doc=prepare_ticket(ticket),
    )

def delete_ticket(ticket_id: int):
    client.delete(
        index=ELASTIC_INDEX,
        id=ticket_id,
        ignore=[404],
    )

def sync_all():
    create_index()

    con = get_connection()

    try:
        with con.cursor() as cur:

            tickets = q.get_all_tickets_for_indexing(cur)

            print("Tickets count:", len(tickets))

            for ticket in tickets:
                index_ticket(ticket)

            client.indices.refresh(index=ELASTIC_INDEX)

            return {
                "indexed": len(tickets)
            }

    finally:
        close(con)