from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate
from app.core.dependencies import get_current_user
from app.core.security import hash_password

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve the current user profile."""
    return UserOut.model_validate(current_user)

@router.patch("/me", response_model=UserOut)
def update_me(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update profile details (name, organization, or password)."""
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name.strip()
    if user_update.organization_name is not None:
        current_user.organization_name = user_update.organization_name.strip()
    if user_update.password:
        if len(user_update.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long."
            )
        current_user.hashed_password = hash_password(user_update.password)

    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)

@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """View public information for a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return UserOut.model_validate(user)
