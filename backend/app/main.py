from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, users, applications


app = FastAPI(
    title="JobFlow API"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "https://jobflow-1-iyuj.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(applications.router)