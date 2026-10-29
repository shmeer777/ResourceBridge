from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.report import ConditionReportCreate, ConditionReportOut, IncidentCreate, IncidentOut
from app.core.dependencies import get_current_user
from app.services.report_service import create_condition_report, list_condition_reports, create_incident_report

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/condition", response_model=ConditionReportOut, status_code=status.HTTP_201_CREATED)
def post_condition_report(
    report_in: ConditionReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a resource condition report."""
    return create_condition_report(db=db, report_in=report_in, current_user=current_user)

@router.get("/condition", response_model=List[ConditionReportOut])
def get_condition_reports(
    resource_id: Optional[str] = Query(None),
    booking_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List condition reports for a resource or booking."""
    return list_condition_reports(db=db, resource_id=resource_id, booking_id=booking_id)

@router.post("/incidents", response_model=IncidentOut, status_code=status.HTTP_201_CREATED)
def post_incident(
    incident_in: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Report an incident or issue on a resource."""
    return create_incident_report(db=db, incident_in=incident_in, current_user=current_user)
