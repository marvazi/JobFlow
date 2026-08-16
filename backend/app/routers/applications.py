from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app import models
from app.auth import get_current_user
from app.database import get_db
from app.schemas import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationStatus,
)

router = APIRouter(
    prefix="/applications",
    tags=["applications"],
)


@router.get("")
def read_applications(
    status: ApplicationStatus | None = None,
    search: str | None = None,
    sort: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = (
        db.query(models.Application)
        .filter(models.Application.user_id == current_user.id)
    )

    if status is not None:
        query = query.filter(
            models.Application.status == status.value
        )

    if search is not None:
        query = query.filter(
            or_(
                models.Application.company.ilike(f"%{search}%"),
                models.Application.position.ilike(f"%{search}%"),
            )
        )

    if sort == "salary_asc":
        query = query.order_by(
            models.Application.salary.asc()
        )

    elif sort == "salary_desc":
        query = query.order_by(
            models.Application.salary.desc()
        )

    elif sort == "company_asc":
        query = query.order_by(
            models.Application.company.asc()
        )

    return query.all()


@router.get("/{id}")
def read_application(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    application = (
        db.query(models.Application)
        .filter(
            models.Application.id == id,
            models.Application.user_id == current_user.id,
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    return application


@router.post("")
def create_application(
    new_application: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    application = models.Application(
        company=new_application.company,
        position=new_application.position,
        salary=new_application.salary,
        status=new_application.status.value,
        notes=new_application.notes,
        user_id=current_user.id,
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return application


@router.put("/{id}")
def update_application(
    id: int,
    new_data: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    application = (
        db.query(models.Application)
        .filter(
            models.Application.id == id,
            models.Application.user_id == current_user.id,
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    application.company = new_data.company
    application.position = new_data.position
    application.salary = new_data.salary
    application.status = new_data.status.value
    application.notes = new_data.notes

    db.commit()
    db.refresh(application)

    return application


@router.delete("/{id}")
def delete_application(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    application = (
        db.query(models.Application)
        .filter(
            models.Application.id == id,
            models.Application.user_id == current_user.id,
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    db.delete(application)
    db.commit()

    return {"message": "Application deleted"}