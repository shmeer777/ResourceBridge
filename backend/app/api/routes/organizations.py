from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.organization import Organization
from app.models.user import User
from app.schemas.organization import OrganizationCreate, OrganizationOut
from app.core.dependencies import get_current_user, require_provider

router = APIRouter(prefix="/organizations", tags=["organizations"])

@router.get("", response_model=List[OrganizationOut])
def get_organizations(db: Session = Depends(get_db)):
    """List registered organizations and labs."""
    orgs = db.query(Organization).order_by(Organization.created_at.desc()).all()
    return [OrganizationOut.model_validate(o) for o in orgs]

@router.post("", response_model=OrganizationOut, status_code=status.HTTP_201_CREATED)
def create_organization(
    org_in: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_provider)
):
    """Register an organization (Provider only)."""
    org = Organization(
        name=org_in.name.strip(),
        description=org_in.description.strip() if org_in.description else None,
        owner_id=current_user.id
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return OrganizationOut.model_validate(org)

@router.get("/{org_id}", response_model=OrganizationOut)
def get_organization_by_id(org_id: str, db: Session = Depends(get_db)):
    """Get single organization profile."""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found.")
    return OrganizationOut.model_validate(org)
