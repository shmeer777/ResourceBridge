import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.resource import Resource
from app.models.booking import Booking
from app.core.security import create_access_token, hash_password

def test_booking_messaging_workflow_and_security(client: TestClient, db_session: Session):
    # 1. Setup Provider, Seeker, and an Unrelated Third-party User
    provider = User(
        email="msg_provider@test.com",
        full_name="Prof. Provider",
        hashed_password=hash_password("Pass123!"),
        role="provider",
        organization_name="Provider Institute",
        organization_type="College / University"
    )
    seeker = User(
        email="msg_seeker@test.com",
        full_name="Sam Seeker",
        hashed_password=hash_password("Pass123!"),
        role="seeker",
        organization_name="Seeker Startup"
    )
    unrelated_user = User(
        email="msg_unrelated@test.com",
        full_name="Eve Intruder",
        hashed_password=hash_password("Pass123!"),
        role="seeker",
        organization_name="External Org"
    )
    db_session.add_all([provider, seeker, unrelated_user])
    db_session.commit()
    db_session.refresh(provider)
    db_session.refresh(seeker)
    db_session.refresh(unrelated_user)

    prov_headers = {"Authorization": f"Bearer {create_access_token(data={'sub': provider.id, 'role': provider.role})}"}
    seek_headers = {"Authorization": f"Bearer {create_access_token(data={'sub': seeker.id, 'role': seeker.role})}"}
    unrelated_headers = {"Authorization": f"Bearer {create_access_token(data={'sub': unrelated_user.id, 'role': unrelated_user.role})}"}

    # 2. Provider creates a Resource
    resource = Resource(
        owner_id=provider.id,
        title="Fluorescence Microscope XYZ",
        description="High precision optical microscope",
        category="Equipment",
        location="Lab Wing B",
        capacity=1,
        hourly_rate=25.0
    )
    db_session.add(resource)
    db_session.commit()
    db_session.refresh(resource)

    # 3. Seeker submits a Booking Request
    now = datetime.now(timezone.utc)
    booking = Booking(
        resource_id=resource.id,
        seeker_id=seeker.id,
        start_time=now + timedelta(days=2),
        end_time=now + timedelta(days=2, hours=3),
        purpose="Cell imaging for thesis project",
        status="pending"
    )
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)

    # 4. Security Check: Unauthenticated access rejected
    unauth_get = client.get(f"/api/v1/bookings/{booking.id}/messages")
    assert unauth_get.status_code == 401

    unauth_post = client.post(f"/api/v1/bookings/{booking.id}/messages", json={"content": "Hello"})
    assert unauth_post.status_code == 401

    # 5. Security Check: Unrelated user cannot read or send messages
    unrelated_get = client.get(f"/api/v1/bookings/{booking.id}/messages", headers=unrelated_headers)
    assert unrelated_get.status_code == 403

    unrelated_post = client.post(
        f"/api/v1/bookings/{booking.id}/messages",
        headers=unrelated_headers,
        json={"content": "Can I spy on this?"}
    )
    assert unrelated_post.status_code == 403

    # 6. Validation Check: Reject empty messages
    empty_post = client.post(
        f"/api/v1/bookings/{booking.id}/messages",
        headers=prov_headers,
        json={"content": "   "}
    )
    assert empty_post.status_code in [400, 422]

    # 7. Workflow: Provider sends inquiry message to Seeker
    prov_msg_res = client.post(
        f"/api/v1/bookings/{booking.id}/messages",
        headers=prov_headers,
        json={"content": "Hello Sam, which stains and laser wavelengths will you require for this session?"}
    )
    assert prov_msg_res.status_code == 201
    prov_msg_data = prov_msg_res.json()
    assert prov_msg_data["content"] == "Hello Sam, which stains and laser wavelengths will you require for this session?"
    assert prov_msg_data["sender_id"] == provider.id
    assert prov_msg_data["sender_role"] == "provider"
    assert prov_msg_data["is_read"] is False

    # Verify booking status remains pending (messaging does not alter status)
    db_session.refresh(booking)
    assert booking.status == "pending"

    # 8. Workflow: Seeker checks conversations list and sees unread message
    conv_res = client.get("/api/v1/bookings/conversations", headers=seek_headers)
    assert conv_res.status_code == 200
    conversations = conv_res.json()
    assert len(conversations) >= 1
    this_conv = next(c for c in conversations if c["booking_id"] == booking.id)
    assert this_conv["unread_count"] == 1
    assert this_conv["total_messages"] == 1
    assert this_conv["booking_status"] == "pending"

    # 9. Workflow: Seeker opens messages and replies
    seek_msgs_res = client.get(f"/api/v1/bookings/{booking.id}/messages", headers=seek_headers)
    assert seek_msgs_res.status_code == 200
    seek_msgs = seek_msgs_res.json()
    assert len(seek_msgs) == 1
    assert seek_msgs[0]["content"] == prov_msg_data["content"]
    # It should now be marked as read
    assert seek_msgs[0]["is_read"] is True

    # Seeker replies with project details
    seek_reply_res = client.post(
        f"/api/v1/bookings/{booking.id}/messages",
        headers=seek_headers,
        json={"content": "Hi Professor, I will use DAPI (405nm) and GFP (488nm). Samples are fixed."}
    )
    assert seek_reply_res.status_code == 201
    assert seek_reply_res.json()["sender_role"] == "seeker"

    # 10. Provider retrieves conversation history and verifies both messages
    prov_view_res = client.get(f"/api/v1/bookings/{booking.id}/messages", headers=prov_headers)
    assert prov_view_res.status_code == 200
    all_msgs = prov_view_res.json()
    assert len(all_msgs) == 2
    assert all_msgs[0]["sender_role"] == "provider"
    assert all_msgs[1]["sender_role"] == "seeker"
    assert "DAPI" in all_msgs[1]["content"]

    # 11. Workflow Integration: Provider decides to Approve Booking after messaging
    decision_res = client.patch(
        f"/api/v1/bookings/{booking.id}/decision",
        headers=prov_headers,
        json={"decision": "approve"}
    )
    assert decision_res.status_code == 200
    assert decision_res.json()["status"] == "approved"

    # 12. History preservation: Messages remain fully accessible after approval
    after_decision_msgs = client.get(f"/api/v1/bookings/{booking.id}/messages", headers=seek_headers)
    assert after_decision_msgs.status_code == 200
    assert len(after_decision_msgs.json()) == 2
