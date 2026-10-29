from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.models.organization import Organization
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, VALID_ORGANIZATION_TYPES
from app.schemas.user import UserOut
from app.services.audit_service import log_audit_event

def register_user(db: Session, req: RegisterRequest) -> TokenResponse:
    # 1. Normalize email
    normalized_email = req.email.lower().strip()

    # 2. Check duplicate email
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # 3. Validate role-specific requirements
    if req.role == "provider":
        if not req.organization_type or not req.organization_type.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organisation type is required for Provider registration."
            )
        clean_org_type = req.organization_type.strip()
        if clean_org_type not in VALID_ORGANIZATION_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid organisation type '{clean_org_type}'. Must be one of: {', '.join(VALID_ORGANIZATION_TYPES)}"
            )
        if not req.organization_name or not req.organization_name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organisation name is required for Provider registration."
            )

    # 4. Hash password securely
    hashed_pwd = hash_password(req.password)

    # 5. Create User
    new_user = User(
        email=normalized_email,
        full_name=req.full_name.strip(),
        hashed_password=hashed_pwd,
        role=req.role,
        organization_name=req.organization_name.strip() if req.organization_name else None,
        organization_type=req.organization_type.strip() if req.organization_type else None,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 6. If provider and organization name supplied, create or associate organization
    if req.role == "provider" and req.organization_name:
        org = Organization(
            name=req.organization_name.strip(),
            organization_type=req.organization_type.strip() if req.organization_type else None,
            owner_id=new_user.id
        )
        db.add(org)
        db.commit()

    # 7. Audit log
    log_audit_event(
        db=db,
        action="USER_REGISTERED",
        target_type="user",
        target_id=new_user.id,
        actor=new_user,
        details={
            "role": new_user.role,
            "email": new_user.email,
            "organization_type": new_user.organization_type
        }
    )

    # 8. Generate JWT access token
    token_data = {"sub": new_user.id, "role": new_user.role, "email": new_user.email}
    token = create_access_token(token_data)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(new_user)
    )

def authenticate_user(db: Session, req: LoginRequest) -> TokenResponse:
    normalized_email = req.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive."
        )

    # Enforce role boundary if logging in through dedicated role portal
    if req.role and req.role != user.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This account is registered as a {user.role}. Please log in via the {user.role} portal."
        )

    # Audit log
    log_audit_event(
        db=db,
        action="USER_LOGGED_IN",
        target_type="user",
        target_id=user.id,
        actor=user,
        details={"role": user.role}
    )

    token_data = {"sub": user.id, "role": user.role, "email": user.email}
    token = create_access_token(token_data)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )
