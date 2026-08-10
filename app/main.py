from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.services.search_service import check_connection, create_index, sync_all
from app.routers.transaction_router import router as transaction_router
from app.routers.catalog_router import router as catalog_router
from app.routers.auth_router import router as auth_router

app = FastAPI(
    title="Ticket Reservation System",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:63342",
        "http://127.0.0.1:63342"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transaction_router)
app.include_router(catalog_router)
app.include_router(auth_router)
@app.on_event("startup")
def startup_event():

    if not check_connection():
        print("Elasticsearch is not available.")
        return

    print("Elasticsearch is connected.")

    index_created = create_index()

    if index_created:
        sync_result = sync_all()

        print(
            f"Elasticsearch initial sync completed: "
            f"{sync_result['indexed']} tickets indexed."
        )
    else:
        print("Elasticsearch index already initialized. Skipping sync.")

            
@app.get("/")
def root():
    return {
        "message": "Ticket Reservation System API is running."
    }