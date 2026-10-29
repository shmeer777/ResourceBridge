from datetime import datetime, timedelta, timezone

def test_booking_lifecycle_and_overlap_prevention(client):
    # 1. Register provider
    prov_res = client.post("/api/v1/auth/register", json={
        "email": "prov_booking@example.com",
        "password": "Password123!",
        "full_name": "Provider Pro",
        "role": "provider",
        "organization_name": "Pro Booking Hub",
        "organization_type": "Research Laboratory"
    })
    prov_token = prov_res.json()["access_token"]
    prov_headers = {"Authorization": f"Bearer {prov_token}"}

    # 2. Register seeker
    seek_res = client.post("/api/v1/auth/register", json={
        "email": "seek_booking@example.com",
        "password": "Password123!",
        "full_name": "Seeker Pro",
        "role": "seeker"
    })
    seek_token = seek_res.json()["access_token"]
    seek_headers = {"Authorization": f"Bearer {seek_token}"}

    # 3. Create resource
    res_data = client.post("/api/v1/resources", json={
        "title": "Cleanroom Laser Cutter",
        "description": "High precision CO2 laser cutter",
        "category": "Equipment",
        "location": "Cleanroom 3",
        "hourly_rate": 30.0
    }, headers=prov_headers).json()
    resource_id = res_data["id"]

    # 4. Seeker submits booking request
    start = datetime.now(timezone.utc) + timedelta(days=1)
    end = start + timedelta(hours=2)

    booking_res = client.post("/api/v1/bookings", json={
        "resource_id": resource_id,
        "start_time": start.isoformat(),
        "end_time": end.isoformat(),
        "purpose": "Fabricating microfluidic acrylic chips"
    }, headers=seek_headers)
    assert booking_res.status_code == 201
    booking = booking_res.json()
    booking_id = booking["id"]
    assert booking["status"] == "pending"

    # 5. Provider approves booking
    decision_res = client.patch(f"/api/v1/bookings/{booking_id}/decision", json={
        "decision": "approve"
    }, headers=prov_headers)
    assert decision_res.status_code == 200
    assert decision_res.json()["status"] == "approved"

    # 6. Verify overlapping booking is rejected (double-booking prevention)
    seek2_res = client.post("/api/v1/auth/register", json={
        "email": "seek2@example.com",
        "password": "Password123!",
        "full_name": "Seeker Two",
        "role": "seeker"
    })
    seek2_token = seek2_res.json()["access_token"]
    seek2_headers = {"Authorization": f"Bearer {seek2_token}"}

    # Same time slot
    overlap_res = client.post("/api/v1/bookings", json={
        "resource_id": resource_id,
        "start_time": start.isoformat(),
        "end_time": end.isoformat(),
        "purpose": "Conflict request"
    }, headers=seek2_headers)
    assert overlap_res.status_code == 409
    assert "already has an approved reservation" in overlap_res.json()["detail"]

    # 7. Check-in and check-out with condition reporting
    checkin_res = client.post(f"/api/v1/bookings/{booking_id}/check-in", json={
        "notes": "Lens inspected, no damage observed.",
        "condition_rating": "excellent"
    }, headers=seek_headers)
    assert checkin_res.status_code == 200
    assert checkin_res.json()["status"] == "checked_in"

    checkout_res = client.post(f"/api/v1/bookings/{booking_id}/check-out", json={
        "notes": "Cutting job completed cleanly.",
        "condition_rating": "good"
    }, headers=seek_headers)
    assert checkout_res.status_code == 200
    assert checkout_res.json()["status"] == "completed"

    # 8. Check condition reports recorded
    reports_res = client.get(f"/api/v1/reports/condition?resource_id={resource_id}", headers=prov_headers)
    assert reports_res.status_code == 200
    reports = reports_res.json()
    assert len(reports) == 2  # check-in and check-out reports
