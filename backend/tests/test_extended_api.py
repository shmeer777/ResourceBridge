from datetime import datetime, timedelta, timezone

def test_user_profile_and_organization_lifecycle(client):
    # Register Provider
    prov_res = client.post("/api/v1/auth/register", json={
        "email": "ext_provider@example.com",
        "password": "Password123!",
        "full_name": "Original Name",
        "role": "provider",
        "organization_name": "Original Org",
        "organization_type": "Research Laboratory"
    }).json()
    token = prov_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test /users/me
    me_res = client.get("/api/v1/users/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["full_name"] == "Original Name"

    # Test PATCH /users/me
    patch_res = client.patch("/api/v1/users/me", json={
        "full_name": "Updated Name",
        "organization_name": "Updated Lab Hub"
    }, headers=headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["full_name"] == "Updated Name"
    assert patch_res.json()["organization_name"] == "Updated Lab Hub"

    # Test /organizations
    org_res = client.post("/api/v1/organizations", json={
        "name": "Advanced Photonics Consortium",
        "description": "Joint quantum and optical physics facility"
    }, headers=headers)
    assert org_res.status_code == 201
    org_id = org_res.json()["id"]

    org_get = client.get(f"/api/v1/organizations/{org_id}")
    assert org_get.status_code == 200
    assert org_get.json()["name"] == "Advanced Photonics Consortium"

def test_availability_and_checkin_aliases(client):
    # Provider
    p = client.post("/api/v1/auth/register", json={
        "email": "avail_prov@example.com",
        "password": "Password123!",
        "full_name": "Avail Prov",
        "role": "provider",
        "organization_name": "Avail Center",
        "organization_type": "Research Laboratory"
    }).json()
    p_headers = {"Authorization": f"Bearer {p['access_token']}"}

    # Resource
    res = client.post("/api/v1/resources", json={
        "title": "Cryogenic SEM",
        "description": "Field emission scanning electron microscope",
        "category": "Lab Facility",
        "location": "Cryo Suite"
    }, headers=p_headers).json()
    res_id = res["id"]

    # Add slot via /api/v1/availability/{id}
    s_start = datetime.now(timezone.utc) + timedelta(days=3)
    s_end = s_start + timedelta(hours=4)
    slot_res = client.post(f"/api/v1/availability/{res_id}", json={
        "start_time": s_start.isoformat(),
        "end_time": s_end.isoformat(),
        "is_available": True
    }, headers=p_headers)
    assert slot_res.status_code == 201
    assert slot_res.json()["resource_id"] == res_id

    # List slots
    slots_res = client.get(f"/api/v1/availability/{res_id}")
    assert slots_res.status_code == 200
    assert len(slots_res.json()) >= 1

    # Seeker booking
    s = client.post("/api/v1/auth/register", json={
        "email": "avail_seek@example.com",
        "password": "Password123!",
        "full_name": "Avail Seeker",
        "role": "seeker"
    }).json()
    s_headers = {"Authorization": f"Bearer {s['access_token']}"}

    booking = client.post("/api/v1/bookings", json={
        "resource_id": res_id,
        "start_time": s_start.isoformat(),
        "end_time": s_end.isoformat(),
        "purpose": "Cryo specimen imaging"
    }, headers=s_headers).json()
    booking_id = booking["id"]

    # Provider approves
    client.patch(f"/api/v1/bookings/{booking_id}/decision", json={"decision": "approve"}, headers=p_headers)

    # Check-in alias /api/v1/check-in/{booking_id}
    checkin_res = client.post(f"/api/v1/check-in/{booking_id}", json={
        "notes": "Vacuum chamber pumped down and ready",
        "condition_rating": "excellent"
    }, headers=s_headers)
    assert checkin_res.status_code == 200
    assert checkin_res.json()["status"] == "checked_in"

    # Check-out alias /api/v1/check-out/{booking_id}
    checkout_res = client.post(f"/api/v1/check-out/{booking_id}", json={
        "notes": "Specimen removed, liquid nitrogen topped off",
        "condition_rating": "good"
    }, headers=s_headers)
    assert checkout_res.status_code == 200
    assert checkout_res.json()["status"] == "completed"

