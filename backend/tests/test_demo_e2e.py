from datetime import datetime, timedelta, timezone

def test_complete_demo_workflow_end_to_end(client):
    """
    Simulates the exact hackathon demo scenario:
    1. Register Provider and create a resource with availability and eligibility rules.
    2. Register Seeker and search/browse the resource.
    3. Seeker requests a booking time slot.
    4. Provider reviews and approves the booking.
    5. Conflicting overlapping booking is rejected with 409 Conflict.
    6. Seeker records check-in with condition inspection report.
    7. Seeker records check-out with final condition report.
    8. Provider checks condition reports and audit trail.
    """
    # 1. Register Provider
    prov_resp = client.post("/api/v1/auth/register", json={
        "email": "demo_provider@labbridge.org",
        "password": "StrongPassword123!",
        "full_name": "Dr. Elena Rostova",
        "role": "provider",
        "organization_name": "BioFab Innovations",
        "organization_type": "Research Laboratory"
    })
    assert prov_resp.status_code == 201
    prov_token = prov_resp.json()["access_token"]
    prov_headers = {"Authorization": f"Bearer {prov_token}"}

    # Create resource
    resource_payload = {
        "title": "Nikon Confocal Laser Microscope",
        "description": "High resolution inverted microscope for fluorescence live cell imaging.",
        "category": "Lab Facility",
        "location": "BioFab Building 2, Room 310",
        "capacity": 2,
        "hourly_rate": 65.0,
        "eligibility_criteria": "Biosafety Level 2 training certification required",
        "rules": "Laser safety goggles required. Clean immersion oil off objectives before leaving."
    }
    create_res = client.post("/api/v1/resources", json=resource_payload, headers=prov_headers)
    assert create_res.status_code == 201
    resource_id = create_res.json()["id"]

    # 2. Register Seeker
    seeker_resp = client.post("/api/v1/auth/register", json={
        "email": "demo_seeker@postgrad.edu",
        "password": "StrongPassword123!",
        "full_name": "Marcus Vance",
        "role": "seeker",
        "organization_name": "Cellular Biology Institute"
    })
    assert seeker_resp.status_code == 201
    seeker_token = seeker_resp.json()["access_token"]
    seeker_headers = {"Authorization": f"Bearer {seeker_token}"}

    # Seeker searches for microscope
    search_res = client.get("/api/v1/resources?search=Confocal", headers=seeker_headers)
    assert search_res.status_code == 200
    search_items = search_res.json()
    assert len(search_items) >= 1
    assert search_items[0]["id"] == resource_id

    # 3. Seeker submits booking request
    slot_start = datetime.now(timezone.utc) + timedelta(days=2, hours=10)
    slot_end = slot_start + timedelta(hours=3)

    book_req = client.post("/api/v1/bookings", json={
        "resource_id": resource_id,
        "start_time": slot_start.isoformat(),
        "end_time": slot_end.isoformat(),
        "purpose": "Z-stack imaging of fluorescently tagged organoids"
    }, headers=seeker_headers)
    assert book_req.status_code == 201
    booking_id = book_req.json()["id"]
    assert book_req.json()["status"] == "pending"

    # 4. Provider reviews and approves request
    decision_resp = client.patch(f"/api/v1/bookings/{booking_id}/decision", json={
        "decision": "approve"
    }, headers=prov_headers)
    assert decision_resp.status_code == 200
    assert decision_resp.json()["status"] == "approved"

    # 5. Overlapping booking conflict prevention
    seeker2_resp = client.post("/api/v1/auth/register", json={
        "email": "competing_seeker@med.org",
        "password": "StrongPassword123!",
        "full_name": "Dr. Chloe Adams",
        "role": "seeker"
    })
    seeker2_token = seeker2_resp.json()["access_token"]
    seeker2_headers = {"Authorization": f"Bearer {seeker2_token}"}

    # Request that overlaps the approved slot
    overlap_req = client.post("/api/v1/bookings", json={
        "resource_id": resource_id,
        "start_time": (slot_start + timedelta(hours=1)).isoformat(),
        "end_time": (slot_end + timedelta(hours=1)).isoformat(),
        "purpose": "Conflicting histology study"
    }, headers=seeker2_headers)
    assert overlap_req.status_code == 409
    assert "approved reservation" in overlap_req.json()["detail"]

    # 6. Check-in with condition report
    checkin_resp = client.post(f"/api/v1/bookings/{booking_id}/check-in", json={
        "condition_rating": "excellent",
        "notes": "Laser alignment checked; mirrors and immersion lenses spotless."
    }, headers=seeker_headers)
    assert checkin_resp.status_code == 200
    assert checkin_resp.json()["status"] == "checked_in"

    # 7. Check-out with condition report
    checkout_resp = client.post(f"/api/v1/bookings/{booking_id}/check-out", json={
        "condition_rating": "good",
        "notes": "Completed 45 Z-stacks. Optics cleaned with lens paper; lasers powered down."
    }, headers=seeker_headers)
    assert checkout_resp.status_code == 200
    assert checkout_resp.json()["status"] == "completed"

    # 8. Check condition reports & audit history
    reports_resp = client.get(f"/api/v1/reports/condition?resource_id={resource_id}", headers=prov_headers)
    assert reports_resp.status_code == 200
    reports = reports_resp.json()
    assert len(reports) == 2
    assert any(r["report_type"] == "check_in" for r in reports)
    assert any(r["report_type"] == "check_out" for r in reports)

    audit_resp = client.get(f"/api/v1/audit/{resource_id}", headers=prov_headers)
    assert audit_resp.status_code == 200
    audit_events = audit_resp.json()
    assert len(audit_events) >= 1
    actions = [e["action"] for e in audit_events]
    assert "RESOURCE_CREATED" in actions

