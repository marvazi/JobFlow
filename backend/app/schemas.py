from pydantic import BaseModel, EmailStr, Field
from enum import Enum


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)

class LoginData(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)

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

class UserUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    avatar_url: str | None = None
