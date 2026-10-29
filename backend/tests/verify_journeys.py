import httpx
from datetime import datetime, timezone, timedelta

def run_verification():
    client = httpx.Client(base_url="http://localhost:8000/api/v1", timeout=10.0)

    print("--- STARTING COMPLETE USER JOURNEY VERIFICATION ---")

    # ================= PROVIDER JOURNEY =================
    # 1. Log in as Provider
    login_prov = client.post("/auth/login", json={
        "email": "provider@demo.com",
        "password": "DemoPassword123!",
        "role": "provider"
    })
    assert login_prov.status_code == 200, f"Provider login failed: {login_prov.text}"
    prov_token = login_prov.json()["access_token"]
    prov_headers = {"Authorization": f"Bearer {prov_token}"}
    print("[OK] Provider logged in successfully:", login_prov.json()["user"]["full_name"])

    # 2. Open Provider dashboard / fetch my resources
    my_res = client.get("/resources/my", headers=prov_headers)
    assert my_res.status_code == 200
    print(f"[OK] Provider dashboard loaded {len(my_res.json())} existing resource(s)")

    # 3. Create a resource
    new_res = client.post("/resources", json={
        "title": "High-Throughput DNA Sequencer",
        "description": "Illumina NextSeq benchtop high-throughput sequencing system for genomics projects.",
        "category": "Lab Facility",
        "location": "Genomics Suite 401",
        "capacity": 2,
        "hourly_rate": 85.0,
        "eligibility_criteria": "Genomics safety and sample prep induction level 2",
        "rules": "Store reagents at -20C immediately. Report any flow cell load errors."
    }, headers=prov_headers)
    assert new_res.status_code == 201
    res_id = new_res.json()["id"]
    res_title = new_res.json()["title"]
    print(f"[OK] Created new resource: {res_title} (ID: {res_id[:8]}...)")

    # 4. Confirm it appears in the provider list
    my_res_updated = client.get("/resources/my", headers=prov_headers)
    assert any(r["id"] == res_id for r in my_res_updated.json())
    print("[OK] Confirmed new resource appears in Provider inventory")

    # 5. Open details and edit it
    edit_res = client.patch(f"/resources/{res_id}", json={
        "title": "Illumina NextSeq 2000 DNA Sequencer",
        "hourly_rate": 90.0,
        "description": "Updated description: Advanced Illumina NextSeq 2000 for high-depth RNA-seq and WGS."
    }, headers=prov_headers)
    assert edit_res.status_code == 200
    assert edit_res.json()["title"] == "Illumina NextSeq 2000 DNA Sequencer"
    assert edit_res.json()["hourly_rate"] == 90.0
    print("[OK] Resource edited and verified persistence:", edit_res.json()["title"])

    # 6. Add availability window
    slot_start = datetime.now(timezone.utc) + timedelta(days=5, hours=9)
    slot_end = slot_start + timedelta(hours=6)
    avail_slot = client.post(f"/availability/{res_id}", json={
        "start_time": slot_start.isoformat(),
        "end_time": slot_end.isoformat(),
        "is_available": True
    }, headers=prov_headers)
    assert avail_slot.status_code == 201
    print("[OK] Added availability slot for resource")

    # ================= SEEKER JOURNEY =================
    # 7. Log in as Seeker
    login_seek = client.post("/auth/login", json={
        "email": "seeker@demo.com",
        "password": "DemoPassword123!",
        "role": "seeker"
    })
    assert login_seek.status_code == 200, f"Seeker login failed: {login_seek.text}"
    seek_token = login_seek.json()["access_token"]
    seek_headers = {"Authorization": f"Bearer {seek_token}"}
    print("[OK] Seeker logged in successfully:", login_seek.json()["user"]["full_name"])

    # 8. Browse available resources & search
    browse_res = client.get("/resources?search=Sequencer")
    assert browse_res.status_code == 200
    found = browse_res.json()
    assert len(found) >= 1
    print(f"[OK] Seeker searched and discovered {len(found)} resource(s) matching 'Sequencer'")

    # 9. Open resource details & check availability
    details_res = client.get(f"/resources/{res_id}")
    assert details_res.status_code == 200
    avail_res = client.get(f"/availability/{res_id}")
    assert avail_res.status_code == 200
    assert len(avail_res.json()) >= 1
    print(f"[OK] Seeker viewed resource details & verified {len(avail_res.json())} availability slot(s)")

    # 10. Submit booking request
    book_start = slot_start + timedelta(hours=1)
    book_end = book_start + timedelta(hours=2)
    req_booking = client.post("/bookings", json={
        "resource_id": res_id,
        "start_time": book_start.isoformat(),
        "end_time": book_end.isoformat(),
        "purpose": "Single-cell transcriptomics run on clinical samples"
    }, headers=seek_headers)
    assert req_booking.status_code == 201
    booking_id = req_booking.json()["id"]
    assert req_booking.json()["status"] == "pending"
    print(f"[OK] Seeker submitted booking request (ID: {booking_id[:8]}..., Status: pending)")

    # 11. Provider reviews and approves request
    approve_resp = client.patch(f"/bookings/{booking_id}/decision", json={
        "decision": "approve"
    }, headers=prov_headers)
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "approved"
    print("[OK] Provider approved the booking request")

    # 12. Verify seeker sees approved status
    my_bookings = client.get("/bookings/my", headers=seek_headers)
    assert any(b["id"] == booking_id and b["status"] == "approved" for b in my_bookings.json())
    print("[OK] Seeker confirmed booking is now APPROVED")

    # 13. Seeker Check-In and Check-Out with condition reports
    checkin = client.post(f"/bookings/{booking_id}/check-in", json={
        "condition_rating": "excellent",
        "notes": "Optics and fluidics lines inspected, zero blockages."
    }, headers=seek_headers)
    assert checkin.status_code == 200 and checkin.json()["status"] == "checked_in"
    print("[OK] Seeker checked in with inspection report")

    checkout = client.post(f"/bookings/{booking_id}/check-out", json={
        "condition_rating": "good",
        "notes": "Flow cell washed, wash waste emptied."
    }, headers=seek_headers)
    assert checkout.status_code == 200 and checkout.json()["status"] == "completed"
    print("[OK] Seeker checked out with condition completion report")

    # 14. Verify Provider condition reports
    prov_reports = client.get(f"/reports/condition?resource_id={res_id}", headers=prov_headers)
    assert prov_reports.status_code == 200
    assert len(prov_reports.json()) == 2
    print(f"[OK] Provider verified condition report log ({len(prov_reports.json())} reports recorded)")

    print("--- ALL USER JOURNEYS FULLY VERIFIED END-TO-END! ---")

if __name__ == "__main__":
    run_verification()

