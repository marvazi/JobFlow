from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.schemas import UserUpdate


router = APIRouter(
    tags=["users"],
)


@router.get("/me")
def read_me(
    current_user=Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url,
    }


@router.patch("/me")
def update_user(
    new_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if new_data.name is not None:
        current_user.name = new_data.name

    if new_data.avatar_url is not None:
        current_user.avatar_url = new_data.avatar_url

    db.commit()
    db.refresh(current_user)

    return current_user