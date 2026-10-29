from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.condition_report import ConditionReport
from app.models.incident import Incident
from app.models.resource import Resource
from app.models.user import User
from app.schemas.report import ConditionReportCreate, ConditionReportOut, IncidentCreate, IncidentOut
from app.services.audit_service import log_audit_event

def create_condition_report(
    db: Session,
    report_in: ConditionReportCreate,
    current_user: User
) -> ConditionReportOut:
    resource = db.query(Resource).filter(Resource.id == report_in.resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found.")

    report = ConditionReport(
        booking_id=report_in.booking_id,
        resource_id=report_in.resource_id,
        reporter_id=current_user.id,
        report_type=report_in.report_type,
        condition_rating=report_in.condition_rating,
        notes=report_in.notes,
        image_url=report_in.image_url
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    log_audit_event(
        db=db,
        action="CONDITION_REPORT_SUBMITTED",
        target_type="condition_report",
        target_id=report.id,
        actor=current_user,
        details={"rating": report.condition_rating, "type": report.report_type}
    )

    return ConditionReportOut(
        id=report.id,
        booking_id=report.booking_id,
        resource_id=report.resource_id,
        reporter_id=report.reporter_id,
        reporter_name=current_user.full_name,
        report_type=report.report_type,
        condition_rating=report.condition_rating,
        notes=report.notes,
        image_url=report.image_url,
        created_at=report.created_at
    )

def list_condition_reports(
    db: Session,
    resource_id: Optional[str] = None,
    booking_id: Optional[str] = None
) -> List[ConditionReportOut]:
    query = db.query(ConditionReport)
    if resource_id:
        query = query.filter(ConditionReport.resource_id == resource_id)
    if booking_id:
        query = query.filter(ConditionReport.booking_id == booking_id)

    reports = query.order_by(ConditionReport.created_at.desc()).all()
    return [
        ConditionReportOut(
            id=r.id,
            booking_id=r.booking_id,
            resource_id=r.resource_id,
            reporter_id=r.reporter_id,
            reporter_name=r.reporter.full_name if r.reporter else None,
            report_type=r.report_type,
            condition_rating=r.condition_rating,
            notes=r.notes,
            image_url=r.image_url,
            created_at=r.created_at
        )
        for r in reports
    ]

def create_incident_report(
    db: Session,
    incident_in: IncidentCreate,
    current_user: User
) -> IncidentOut:
    resource = db.query(Resource).filter(Resource.id == incident_in.resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found.")

    incident = Incident(
        booking_id=incident_in.booking_id,
        resource_id=incident_in.resource_id,
        reporter_id=current_user.id,
        severity=incident_in.severity,
        description=incident_in.description,
        status="open"
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    log_audit_event(
        db=db,
        action="INCIDENT_REPORTED",
        target_type="incident",
        target_id=incident.id,
        actor=current_user,
        details={"severity": incident.severity}
    )

    return IncidentOut(
        id=incident.id,
        booking_id=incident.booking_id,
        resource_id=incident.resource_id,
        reporter_id=incident.reporter_id,
        severity=incident.severity,
        description=incident.description,
        status=incident.status,
        created_at=incident.created_at
    )
