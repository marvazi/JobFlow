from idlelib import query
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field,EmailStr
from database import engine
from fastapi import Depends
from enum import Enum
from database import get_db
from sqlalchemy.orm import Session

import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ApplicationStatus(str, Enum):
    applied = "applied"
    screening = "screening"
    interview = "interview"
    test_task = "test_task"
    offer = "offer"
    rejected = "rejected"

class ApplicationCreate(BaseModel):
    company: str = Field(min_length=2, max_length=100)
    position: str = Field(min_length=2, max_length=100)
    salary: int = Field(gt=0)
    notes: str | None = None
    status: ApplicationStatus

class ApplicationUpdate(BaseModel):
    company: str = Field(min_length=2, max_length=100)
    position: str = Field(min_length=2, max_length=100)
    salary: int = Field(gt=0)
    notes: str | None = None
    status: ApplicationStatus

@app.get("/applications",)
def read_applications(status: ApplicationStatus | None = None,db: Session = Depends(get_db)):
    query= db.query(models.Application)
    if status is not None:
        query = query.filter(models.Application.status == status.value)

    return query.all()

@app.get("/applications/{id}",)
def read_application(id: int,db: Session = Depends(get_db)):
    application = (
        db.query(models.Application)
        .filter(models.Application.id == id)
        .first()
    )
    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )
    return application

@app.delete("/applications/{id}",)
def delete_application(id:int, db: Session = Depends(get_db)):
    application = (
        db.query(models.Application)
        .filter(models.Application.id == id)
        .first()
    )
    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )
    db.delete(application)
    db.commit()
    return {'message': 'Application deleted'}


@app.post("/applications")
def create_application(application: ApplicationCreate, db: Session = Depends(get_db)):
    new_application = models.Application(
        company=application.company,
        position=application.position,
        salary=application.salary,
        notes=application.notes,
        status=application.status,
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return new_application

@app.put("/applications/{id}")
def update_application(id: int, new_data: ApplicationUpdate, db: Session = Depends(get_db)):
    application = (
        db.query(models.Application)
        .filter(models.Application.id == id)
        .first()
    )
    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )
    application.company = new_data.company
    application.position = new_data.position
    application.salary = new_data.salary
    application.notes = new_data.notes
    application.status = new_data.status

    db.commit()
    db.refresh(application)
    return application


