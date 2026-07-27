from fastapi import FastAPI

from app.routers.transaction_router import router as transaction_router

app = FastAPI(title="Ticket Reservation System")

app.include_router(transaction_router)