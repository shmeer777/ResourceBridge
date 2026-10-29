import time
import httpx
import sqlite3
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_audit():
    print("=================================================================")
    print("STARTING RESOURCEBRIDGE BOOKING INQUIRY & MESSAGING AUDIT")
    print("=================================================================")

    client = httpx.Client(base_url=BASE_URL, timeout=15.0)
    ts = int(time.time())

    # Step 1: Authenticate demo Provider and demo Seeker
    print("\n[Step 1] Authenticating Demo Accounts...")
    p_login = client.post("/auth/login", json={
        "email": "provider@demo.com",
        "password": "DemoPassword123!",
        "role": "provider"
    })
    assert p_login.status_code == 200, f"Provider login failed: {p_login.text}"
    p_token = p_login.json()["access_token"]
    p_user = p_login.json()["user"]
    p_headers = {"Authorization": f"Bearer {p_token}"}
    print(f"[PASS] Provider authenticated: {p_user['full_name']} ({p_user['email']})")

    s_login = client.post("/auth/login", json={
        "email": "seeker@demo.com",
        "password": "DemoPassword123!",
        "role": "seeker"
    })
    assert s_login.status_code == 200, f"Seeker login failed: {s_login.text}"
    s_token = s_login.json()["access_token"]
    s_user = s_login.json()["user"]
    s_headers = {"Authorization": f"Bearer {s_token}"}
    print(f"[PASS] Seeker authenticated: {s_user['full_name']} ({s_user['email']})")

    # Also register an unrelated third user to test cross-tenant isolation
    third_email = f"intruder_{ts}@test.org"
    third_reg = client.post("/auth/register", json={
        "email": third_email,
        "password": "Password123!",
        "full_name": "Eve External",
        "role": "seeker"
    })
    assert third_reg.status_code == 201
    third_token = third_reg.json()["access_token"]
    third_headers = {"Authorization": f"Bearer {third_token}"}
    print(f"[PASS] External unrelated user created for security checks: {third_email}")

    # Step 2: Provider creates a test resource for this booking
    print("\n[Step 2] Setting up Test Resource & Availability...")
    res_res = client.post("/resources", headers=p_headers, json={
        "title": f"Cryo-EM Grid Preparation Robot #{ts}",
        "description": "Automated plunge freezing system for cryo-electron microscopy",
        "category": "Lab Facility",
        "location": "Structural Biology Core, Room 410",
        "capacity": 2,
        "hourly_rate": 35.0,
        "eligibility_criteria": "Biosafety Level 2 training required",
        "rules": "Bring own liquid nitrogen storage and cryo-boxes"
    })
    assert res_res.status_code == 201, f"Resource creation failed: {res_res.text}"
    resource_id = res_res.json()["id"]
    resource_title = res_res.json()["title"]
    print(f"[PASS] Created resource '{resource_title}' (ID: {resource_id[:8]}...)")

    # Step 3: Seeker submits a Booking Request
    print("\n[Step 3] Seeker Submits Booking Request...")
    booking_res = client.post("/bookings", headers=s_headers, json={
        "resource_id": resource_id,
        "start_time": "2026-11-05T09:00:00Z",
        "end_time": "2026-11-05T13:00:00Z",
        "purpose": "Preparation of membrane protein cryo-grids for single-particle analysis."
    })
    assert booking_res.status_code == 201, f"Booking creation failed: {booking_res.text}"
    booking_id = booking_res.json()["id"]
    assert booking_res.json()["status"] == "pending"
    print(f"[PASS] Booking request submitted: ID {booking_id[:8]}..., Status: {booking_res.json()['status']}")

    # Step 4: Security & Authorization Checks
    print("\n[Step 4] Testing Security & Access Control Boundaries...")
    # 4a. Unauthenticated access rejected
    unauth_get = client.get(f"/bookings/{booking_id}/messages")
    assert unauth_get.status_code == 401, f"Expected 401, got {unauth_get.status_code}"
    unauth_post = client.post(f"/bookings/{booking_id}/messages", json={"content": "Spy message"})
    assert unauth_post.status_code == 401, f"Expected 401, got {unauth_post.status_code}"
    print("[PASS] Unauthenticated access properly rejected (401 Unauthorized)")

    # 4b. Unrelated third-party rejected
    intruder_get = client.get(f"/bookings/{booking_id}/messages", headers=third_headers)
    assert intruder_get.status_code == 403, f"Expected 403, got {intruder_get.status_code}"
    intruder_post = client.post(
        f"/bookings/{booking_id}/messages",
        headers=third_headers,
        json={"content": "Unauthorized eavesdropping attempt"}
    )
    assert intruder_post.status_code == 403, f"Expected 403, got {intruder_post.status_code}"
    print("[PASS] Unrelated user blocked from accessing another booking's conversation (403 Forbidden)")

    # Step 5: Content Validation (Reject empty or whitespace messages)
    print("\n[Step 5] Testing Content Validation...")
    empty_post = client.post(
        f"/bookings/{booking_id}/messages",
        headers=p_headers,
        json={"content": "    \n   "}
    )
    assert empty_post.status_code in [400, 422], f"Expected 400 or 422, got {empty_post.status_code}"
    print("[PASS] Empty / whitespace-only messages properly rejected with validation error")

    # Step 6: Provider sends Inquiry Message
    print("\n[Step 6] Provider Sends Inquiry to Seeker...")
    p_msg_content = "Hi Marcus, please confirm if your protein samples have passed negative stain screening and if you have BSL-2 certification on file."
    p_send_res = client.post(
        f"/bookings/{booking_id}/messages",
        headers=p_headers,
        json={"content": p_msg_content}
    )
    assert p_send_res.status_code == 201, f"Message send failed: {p_send_res.text}"
    p_msg_data = p_send_res.json()
    assert p_msg_data["content"] == p_msg_content
    assert p_msg_data["sender_id"] == p_user["id"]
    assert p_msg_data["sender_role"] == "provider"
    assert p_msg_data["is_read"] is False
    print(f"[PASS] Provider message sent successfully (Msg ID: {p_msg_data['id'][:8]}...)")

    # Step 7: Booking status remains PENDING while messaging
    print("\n[Step 7] Verifying Booking Status Invariance...")
    check_bk = client.get(f"/bookings/{booking_id}", headers=p_headers)
    assert check_bk.status_code == 200
    assert check_bk.json()["status"] == "pending", "Booking status must remain 'pending' during inquiry!"
    print(f"[PASS] Verified: Booking status remains '{check_bk.json()['status']}' — messaging does not alter decision state")

    # Step 8: Seeker Conversation List & Unread Counter
    print("\n[Step 8] Seeker Conversation List & Unread Counter...")
    seeker_convs = client.get("/bookings/conversations", headers=s_headers)
    assert seeker_convs.status_code == 200
    conv_list = seeker_convs.json()
    assert len(conv_list) >= 1
    target_conv = next(c for c in conv_list if c["booking_id"] == booking_id)
    assert target_conv["unread_count"] == 1
    assert target_conv["total_messages"] == 1
    assert target_conv["last_message_content"] == p_msg_content
    print(f"[PASS] Seeker conversations list reflects 1 unread message from Provider")

    # Step 9: Seeker Reads Conversation (Auto Mark-as-Read) & Replies
    print("\n[Step 9] Seeker Reads Messages & Sends Reply...")
    seeker_read_res = client.get(f"/bookings/{booking_id}/messages", headers=s_headers)
    assert seeker_read_res.status_code == 200
    msgs = seeker_read_res.json()
    assert len(msgs) == 1
    assert msgs[0]["content"] == p_msg_content
    assert msgs[0]["is_read"] is True, "Opening message thread should mark incoming message as read"

    # Seeker sends reply
    s_reply_content = "Yes Dr. Rostova, negative stain showed homogeneous particles at 50nM, and my BSL-2 induction is valid through Dec 2026."
    s_reply_res = client.post(
        f"/bookings/{booking_id}/messages",
        headers=s_headers,
        json={"content": s_reply_content}
    )
    assert s_reply_res.status_code == 201
    s_reply_data = s_reply_res.json()
    assert s_reply_data["sender_role"] == "seeker"
    assert s_reply_data["content"] == s_reply_content
    print(f"[PASS] Seeker replied with technical specifications (Msg ID: {s_reply_data['id'][:8]}...)")

    # Step 10: Provider Retrieves Full History
    print("\n[Step 10] Provider Retrieves Chronological Conversation...")
    prov_history_res = client.get(f"/bookings/{booking_id}/messages", headers=p_headers)
    assert prov_history_res.status_code == 200
    history = prov_history_res.json()
    assert len(history) == 2
    assert history[0]["sender_role"] == "provider"
    assert history[1]["sender_role"] == "seeker"
    assert history[1]["content"] == s_reply_content
    print(f"[PASS] Full 2-way conversation history verified in chronological order")

    # Step 11: Workflow Integration: Provider Approves Booking After Inquiry
    print("\n[Step 11] Provider Approves Booking Request After Inquiry...")
    decision_res = client.patch(
        f"/bookings/{booking_id}/decision",
        headers=p_headers,
        json={"decision": "approve"}
    )
    assert decision_res.status_code == 200
    assert decision_res.json()["status"] == "approved"
    print(f"[PASS] Booking successfully approved. Status: {decision_res.json()['status']}")

    # Step 12: History Preservation Post-Decision
    print("\n[Step 12] Verifying Message History Preservation Post-Decision...")
    post_msgs_res = client.get(f"/bookings/{booking_id}/messages", headers=s_headers)
    assert post_msgs_res.status_code == 200
    post_msgs = post_msgs_res.json()
    assert len(post_msgs) == 2
    print(f"[PASS] Conversation history fully preserved after booking decision")

    # Step 13: Database Persistence Verification
    print("\n[Step 13] Verifying Direct SQLite Database Records...")
    db_path = Path(__file__).resolve().parent.parent / "resourcebridge.db"
    con = sqlite3.connect(str(db_path))
    cur = con.cursor()
    rows = cur.execute(
        "SELECT id, booking_id, sender_id, content, is_read, created_at FROM messages WHERE booking_id = ? ORDER BY created_at ASC",
        (booking_id,)
    ).fetchall()
    assert len(rows) == 2
    assert rows[0][3] == p_msg_content
    assert rows[1][3] == s_reply_content
    print(f"[PASS] SQLite verification confirmed 2 persistent records in 'messages' table for booking {booking_id[:8]}")
    con.close()

    print("\n=================================================================")
    print("ALL 13 BOOKING INQUIRY & MESSAGING AUDIT CHECKS PASSED LIVE!")
    print("=================================================================")

if __name__ == "__main__":
    run_audit()
