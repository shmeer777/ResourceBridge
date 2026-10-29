import httpx
from datetime import datetime, timezone, timedelta

def run():
    client = httpx.Client(base_url="http://localhost:8000/api/v1", timeout=12.0)
    print("=================================================================")
    print("STARTING RESOURCEBRIDGE COMPREHENSIVE END-TO-END VERIFICATION")
    print("=================================================================")

    # -------------------------------------------------------------
    # 1. Unauthenticated Protection Check
    # -------------------------------------------------------------
    print("\n[Step 1] Checking Unauthenticated Access Protection...")
    unauth_res = client.get("/resources/my")
    assert unauth_res.status_code == 401, f"Expected 401 for unauth /resources/my, got {unauth_res.status_code}"
    print("[PASS] Unauthenticated access to /resources/my correctly rejected with 401 Unauthorized.")

    unauth_post = client.post("/resources", json={"title": "Test Hack"})
    assert unauth_post.status_code == 401, f"Expected 401 for unauth POST /resources, got {unauth_post.status_code}"
    print("[PASS] Unauthenticated POST /resources correctly rejected with 401 Unauthorized.")

    # -------------------------------------------------------------
    # 2. Demo Account Login Verification
    # -------------------------------------------------------------
    print("\n[Step 2] Testing Pre-seeded Demo Accounts...")
    prov_login = client.post("/auth/login", json={
        "email": "provider@demo.com",
        "password": "DemoPassword123!",
        "role": "provider"
    })
    assert prov_login.status_code == 200, f"Demo provider login failed: {prov_login.text}"
    prov_data = prov_login.json()
    prov_token = prov_data["access_token"]
    prov_headers = {"Authorization": f"Bearer {prov_token}"}
    assert prov_data["user"]["role"] == "provider"
    assert prov_data["user"]["organization_name"] == "BioFab Innovations Lab"
    assert prov_data["user"]["organization_type"] == "Research Laboratory"
    print(f"[PASS] Demo Provider logged in: {prov_data['user']['full_name']} ({prov_data['user']['organization_name']})")

    seek_login = client.post("/auth/login", json={
        "email": "seeker@demo.com",
        "password": "DemoPassword123!",
        "role": "seeker"
    })
    assert seek_login.status_code == 200, f"Demo seeker login failed: {seek_login.text}"
    seek_data = seek_login.json()
    seek_token = seek_data["access_token"]
    seek_headers = {"Authorization": f"Bearer {seek_token}"}
    assert seek_data["user"]["role"] == "seeker"
    assert seek_data["user"]["organization_name"] == "Quantum Bio Devices"
    print(f"[PASS] Demo Seeker logged in: {seek_data['user']['full_name']} ({seek_data['user']['organization_name']})")

    # -------------------------------------------------------------
    # 3. Role Restriction & Cross-Portal Access
    # -------------------------------------------------------------
    print("\n[Step 3] Testing Cross-Portal Login & Role Boundaries...")
    cross1 = client.post("/auth/login", json={
        "email": "provider@demo.com",
        "password": "DemoPassword123!",
        "role": "seeker"
    })
    assert cross1.status_code == 403, f"Expected 403, got {cross1.status_code}"
    print(f"[PASS] Provider prevented from logging into Seeker portal (403: {cross1.json()['detail']})")

    cross2 = client.post("/auth/login", json={
        "email": "seeker@demo.com",
        "password": "DemoPassword123!",
        "role": "provider"
    })
    assert cross2.status_code == 403, f"Expected 403, got {cross2.status_code}"
    print(f"[PASS] Seeker prevented from logging into Provider portal (403: {cross2.json()['detail']})")

    # Seeker attempts to create a resource (Provider-only action)
    seek_create = client.post("/resources", json={
        "title": "Seeker Owned Resource",
        "description": "This should fail",
        "category": "Equipment"
    }, headers=seek_headers)
    assert seek_create.status_code == 403, f"Expected 403 for seeker creating resource, got {seek_create.status_code}"
    print(f"[PASS] Seeker prevented from creating resources (403 Forbidden)")

    # -------------------------------------------------------------
    # 4. Resource Creation and Editing (Provider)
    # -------------------------------------------------------------
    print("\n[Step 4] Testing Provider Resource Creation & Modification...")
    new_resource_payload = {
        "title": "Automated Liquid Handler Star 400",
        "description": "High throughput 96-channel liquid handling robot for microplate pipetting.",
        "category": "Equipment",
        "location": "Robotics Bay 302",
        "capacity": 1,
        "hourly_rate": 65.0,
        "eligibility_criteria": "Robotics automation safety induction completed",
        "rules": "Flush lines after session. Do not leave pipette tips on head."
    }
    create_res = client.post("/resources", json=new_resource_payload, headers=prov_headers)
    assert create_res.status_code == 201, f"Failed creating resource: {create_res.text}"
    res_id = create_res.json()["id"]
    print(f"[PASS] Created resource '{create_res.json()['title']}' (ID: {res_id[:8]}...)")

    # Edit resource
    edit_payload = {
        "title": "Automated Liquid Handler Star 400 Pro",
        "hourly_rate": 70.0
    }
    patch_res = client.patch(f"/resources/{res_id}", json=edit_payload, headers=prov_headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["title"] == "Automated Liquid Handler Star 400 Pro"
    assert patch_res.json()["hourly_rate"] == 70.0
    print(f"[PASS] Edited resource successfully: title updated to '{patch_res.json()['title']}'")

    # -------------------------------------------------------------
    # 5. Availability Slot Scheduling (Provider)
    # -------------------------------------------------------------
    print("\n[Step 5] Testing Availability Slot Creation...")
    slot_start = datetime.now(timezone.utc) + timedelta(days=2)
    slot_end = slot_start + timedelta(hours=4)
    slot_res = client.post(f"/resources/{res_id}/availability", json={
        "start_time": slot_start.isoformat(),
        "end_time": slot_end.isoformat(),
        "is_available": True
    }, headers=prov_headers)
    assert slot_res.status_code == 201, f"Slot creation failed: {slot_res.text}"
    print(f"[PASS] Created availability slot for resource: {slot_start.strftime('%Y-%m-%d %H:%M')} to {slot_end.strftime('%H:%M')} UTC")

    # -------------------------------------------------------------
    # 6. Resource Discovery & Details (Seeker)
    # -------------------------------------------------------------
    print("\n[Step 6] Testing Seeker Resource Discovery & Inspection...")
    browse_res = client.get("/resources", params={"query": "Liquid Handler", "category": "Equipment"})
    assert browse_res.status_code == 200
    matched = [r for r in browse_res.json() if r["id"] == res_id]
    assert len(matched) == 1, "Created resource not found in public discovery"
    print(f"[PASS] Seeker discovered resource in public search (matched query='Liquid Handler')")

    details_res = client.get(f"/resources/{res_id}", headers=seek_headers)
    assert details_res.status_code == 200
    assert details_res.json()["title"] == "Automated Liquid Handler Star 400 Pro"

    avail_res = client.get(f"/resources/{res_id}/availability", headers=seek_headers)
    assert avail_res.status_code == 200
    assert len(avail_res.json()) >= 1
    print(f"[PASS] Seeker viewed full resource details & verified {len(avail_res.json())} availability slot(s)")

    # -------------------------------------------------------------
    # 7. Booking Request Creation (Seeker)
    # -------------------------------------------------------------
    print("\n[Step 7] Testing Seeker Booking Request Creation...")
    book_req = client.post("/bookings", json={
        "resource_id": res_id,
        "start_time": slot_start.isoformat(),
        "end_time": slot_end.isoformat(),
        "purpose": "High-throughput drug screen assay for oncology project"
    }, headers=seek_headers)
    assert book_req.status_code == 201, f"Booking request failed: {book_req.text}"
    booking_id = book_req.json()["id"]
    assert book_req.json()["status"] == "pending"
    print(f"[PASS] Seeker submitted booking request (ID: {booking_id[:8]}..., Status: pending)")

    # -------------------------------------------------------------
    # 8. Provider Decision (Approve)
    # -------------------------------------------------------------
    print("\n[Step 8] Testing Provider Booking Decision (Approve)...")
    decide_res = client.patch(f"/bookings/{booking_id}/decision", json={
        "decision": "approve"
    }, headers=prov_headers)
    assert decide_res.status_code == 200, f"Approval failed: {decide_res.text}"
    assert decide_res.json()["status"] == "approved"
    print(f"[PASS] Provider approved booking request. Updated status: approved")

    # Seeker verifies approval
    seeker_booking_check = client.get(f"/bookings/{booking_id}", headers=seek_headers)
    assert seeker_booking_check.status_code == 200
    assert seeker_booking_check.json()["status"] == "approved"
    print(f"[PASS] Seeker confirmed booking status is 'approved'")

    # -------------------------------------------------------------
    # 9. Check-In & Check-Out with Condition Reports
    # -------------------------------------------------------------
    print("\n[Step 9] Testing Check-In / Check-Out & Condition Reports...")
    # Check-in
    checkin_res = client.post(f"/bookings/{booking_id}/check-in", json={
        "condition_rating": "good",
        "notes": "Equipment inspected prior to run; clean deck and fluidics primed."
    }, headers=seek_headers)
    assert checkin_res.status_code == 200
    assert checkin_res.json()["status"] == "checked_in"
    print("[PASS] Seeker performed check-in with initial condition report.")

    # Check-out
    checkout_res = client.post(f"/bookings/{booking_id}/check-out", json={
        "condition_rating": "excellent",
        "notes": "Run completed successfully, decontamination routine executed."
    }, headers=seek_headers)
    assert checkout_res.status_code == 200
    assert checkout_res.json()["status"] == "completed"
    print("[PASS] Seeker performed check-out with final condition report.")

    # Provider verifies condition reports
    reports_res = client.get("/reports/condition", params={"booking_id": booking_id}, headers=prov_headers)
    assert reports_res.status_code == 200
    assert len(reports_res.json()) == 2
    print(f"[PASS] Provider retrieved 2 condition reports for booking (check-in & check-out logs verified).")

    print("\n=================================================================")
    print("ALL 9 CORE WORKFLOW SUITES FULLY TESTED AND VERIFIED END-TO-END!")
    print("=================================================================")

if __name__ == "__main__":
    run()
