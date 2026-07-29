from fastapi import FastAPI

from app.routers.transaction_router import router as transaction_router
from app.routers.catalog_router import router as catalog_router
from app.routers.auth_router import router as auth_router

app = FastAPI(
    title="Ticket Reservation System",
    version="1.0.0",
)

app.include_router(transaction_router)
app.include_router(catalog_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {
        "message": "Ticket Reservation System API is running."
    }