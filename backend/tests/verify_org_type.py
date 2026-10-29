import httpx
import sqlite3
import time
from pathlib import Path

def verify():
    client = httpx.Client(base_url="http://localhost:8000/api/v1", timeout=10.0)
    ts = int(time.time())

    print("--- 1. Testing Provider Registration with Organization Types ---")
    test_cases = [
        ("School", "Oakridge International STEM Academy", f"oakridge_prov_{ts}@school.edu"),
        ("Startup", "OmniRobotics AI Corp", f"omni_prov_{ts}@startup.io"),
        ("Hospital / Healthcare Institution", "General Medical Research Hospital", f"med_prov_{ts}@hospital.org"),
        ("Coworking Space", "Downtown Innovation Garage", f"cowork_prov_{ts}@space.co"),
    ]

    for org_type, org_name, email in test_cases:
        reg = client.post("/auth/register", json={
            "email": email,
            "password": "SecurePassword123!",
            "full_name": f"Admin for {org_name}",
            "role": "provider",
            "organization_type": org_type,
            "organization_name": org_name
        })
        assert reg.status_code == 201, f"Failed for {org_type}: {reg.text}"
        user_data = reg.json()["user"]
        assert user_data["organization_type"] == org_type, f"Org type mismatch: {user_data}"
        assert user_data["organization_name"] == org_name, f"Org name mismatch: {user_data}"
        print(f"[OK] Registered provider with type '{org_type}' & name '{org_name}'")

        # Login immediately
        login = client.post("/auth/login", json={
            "email": email,
            "password": "SecurePassword123!",
            "role": "provider"
        })
        assert login.status_code == 200, f"Login failed for {email}: {login.text}"
        login_user = login.json()["user"]
        assert login_user["organization_type"] == org_type
        print(f"[OK] Login verified for '{email}' with matching org_type")

    print("\n--- 2. Testing Database Persistence ---")
    db_path = Path(__file__).resolve().parent.parent / "resourcebridge.db"
    con = sqlite3.connect(str(db_path))
    cur = con.cursor()
    for org_type, org_name, email in test_cases:
        row = cur.execute("SELECT email, role, organization_name, organization_type FROM users WHERE email = ?", (email,)).fetchone()
        assert row is not None, f"Database record not found for {email}"
        assert row[2] == org_name
        assert row[3] == org_type
        print(f"[OK] DB Verified: User {row[0]} -> org_name='{row[2]}', org_type='{row[3]}'")

        org_row = cur.execute("SELECT name, organization_type FROM organizations WHERE owner_id = (SELECT id FROM users WHERE email = ?)", (email,)).fetchone()
        assert org_row is not None
        assert org_row[0] == org_name
        assert org_row[1] == org_type
        print(f"[OK] DB Verified: Organization '{org_row[0]}' -> org_type='{org_row[1]}'")
    con.close()

    print("\n--- 3. Testing Provider Validation Edge Cases ---")
    # Missing org_type
    bad_res1 = client.post("/auth/register", json={
        "email": f"missing_type_{ts}@test.com",
        "password": "Password123!",
        "full_name": "No Type",
        "role": "provider",
        "organization_name": "My Org"
    })
    assert bad_res1.status_code == 400
    assert "Organisation type is required" in bad_res1.json()["detail"]
    print("[OK] Missing organization_type properly rejected with 400")

    # Invalid org_type
    bad_res2 = client.post("/auth/register", json={
        "email": f"invalid_type_{ts}@test.com",
        "password": "Password123!",
        "full_name": "Invalid Type",
        "role": "provider",
        "organization_type": "Unknown Type Not In List",
        "organization_name": "My Org"
    })
    assert bad_res2.status_code == 400
    assert "Invalid organisation type" in bad_res2.json()["detail"]
    print("[OK] Invalid organization_type properly rejected with 400")

    # Missing org_name
    bad_res3 = client.post("/auth/register", json={
        "email": f"missing_name_{ts}@test.com",
        "password": "Password123!",
        "full_name": "No Name",
        "role": "provider",
        "organization_type": "Startup"
    })
    assert bad_res3.status_code == 400
    assert "Organisation name is required" in bad_res3.json()["detail"]
    print("[OK] Missing organization_name properly rejected with 400")

    print("\n--- 4. Testing Seeker Registration & Login (Unbroken) ---")
    seeker_email = f"seeker_{ts}@test.com"
    seeker_res = client.post("/auth/register", json={
        "email": seeker_email,
        "password": "Password123!",
        "full_name": "Sally Seeker",
        "role": "seeker",
        "organization_name": "Independent Researcher"
    })
    assert seeker_res.status_code == 201
    assert seeker_res.json()["user"]["role"] == "seeker"
    print("[OK] Seeker registered successfully without organization_type")

    seeker_login = client.post("/auth/login", json={
        "email": seeker_email,
        "password": "Password123!",
        "role": "seeker"
    })
    assert seeker_login.status_code == 200
    print("[OK] Seeker login verified")

    print("\n--- 5. Testing Existing Demo Accounts ---")
    demo_prov = client.post("/auth/login", json={
        "email": "provider@demo.com",
        "password": "DemoPassword123!",
        "role": "provider"
    })
    assert demo_prov.status_code == 200
    print("[OK] Demo provider login verified: Dr. Elena Rostova")

    demo_seek = client.post("/auth/login", json={
        "email": "seeker@demo.com",
        "password": "DemoPassword123!",
        "role": "seeker"
    })
    assert demo_seek.status_code == 200
    print("[OK] Demo seeker login verified: Marcus Vance")

    print("\n--- ALL VERIFICATIONS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    verify()

