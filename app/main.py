import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.elastic_service import (
    check_connection,
    create_index,
    sync_all,
)
from app.cache.redis_client import check_redis
from app.services.transaction_service import TransactionService
from app.routers.transaction_router import router as transaction_router
from app.routers.catalog_router import router as catalog_router
from app.routers.auth_router import router as auth_router

async def reservation_expiration_loop():
    while True:
        try:
            expired_count = TransactionService.expire_reservations()

            if expired_count > 0: print(f"Reservation expiration: "
                                        f"{expired_count} reservation(s) expired.")
        except Exception as error: print(f"Reservation expiration error: {error}")
        # Check every 60 seconds
        await asyncio.sleep(60)

@asynccontextmanager
async def lifespan(app: FastAPI):

    #Redis connection check
    if check_redis():
        print("Redis is connected.")
    else:
        print("Redis is not available.")

    # Elasticsearch Startup
    if not check_connection():
        print("Elasticsearch is not available.")
    else:
        print("Elasticsearch is connected.")
        index_created = create_index()
        if index_created:
            sync_result = sync_all()
            print(f"Elasticsearch initial sync completed: "
                    f"{sync_result['indexed']} tickets indexed.")
        else:
            print("Elasticsearch index already initialized. " "Skipping sync.")

    # Start Reservation Expiration Task
    reservation_task = asyncio.create_task(reservation_expiration_loop())
    print("Reservation expiration background task started.")

    try:
        yield

    finally:
        reservation_task.cancel()

        try:
            await reservation_task

        except asyncio.CancelledError:
            pass
        print("Reservation expiration background task stopped.")

app = FastAPI(
    title="Ticket Reservation System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:63342",
        "http://127.0.0.1:63342",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transaction_router)
app.include_router(catalog_router)
app.include_router(auth_router)

@app.get("/")
def root():

    return {
        "message": "Ticket Reservation System API is running."
    }
