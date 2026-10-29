import httpx
import sqlite3
import time
from pathlib import Path

def run_checks():
    client = httpx.Client(base_url="http://localhost:8000/api/v1", timeout=10.0)
    ts = int(time.time())
    print("=== STARTING FULL AUTHENTICATION & ROLE RESTRICTION TESTS ===")

    # 1. Duplicate email handling for Provider
    print("\n1. Testing Provider Registration & Duplicate Email...")
    prov_email = f"unique_provider_{ts}@demo.org"
    res1 = client.post("/auth/register", json={
        "email": prov_email,
        "password": "Password123!",
        "full_name": "Dr. Unique Provider",
        "role": "provider",
        "organization_type": "Research Laboratory",
        "organization_name": "Unique Genomics Center"
    })
    assert res1.status_code == 201, f"Provider register failed: {res1.text}"
    print(f"[OK] Provider registered: {res1.json()['user']['email']}")

    # Try registering same email again
    res1_dup = client.post("/auth/register", json={
        "email": prov_email,
        "password": "Password123!",
        "full_name": "Another Person",
        "role": "provider",
        "organization_type": "Startup",
        "organization_name": "Another Lab"
    })
    assert res1_dup.status_code == 400
    assert "already exists" in res1_dup.json()["detail"]
    print(f"[OK] Duplicate email properly rejected with 400: '{res1_dup.json()['detail']}'")

    # 2. Duplicate email handling for Seeker
    print("\n2. Testing Seeker Registration & Duplicate Email...")
    seeker_email = f"unique_seeker_{ts}@demo.org"
    res2 = client.post("/auth/register", json={
        "email": seeker_email,
        "password": "Password123!",
        "full_name": "Unique Seeker User",
        "role": "seeker",
        "organization_name": "Innovative Research Lab"
    })
    assert res2.status_code == 201, f"Seeker register failed: {res2.text}"
    print(f"[OK] Seeker registered: {res2.json()['user']['email']}")

    # Try duplicate email for seeker
    res2_dup = client.post("/auth/register", json={
        "email": seeker_email,
        "password": "Password123!",
        "full_name": "Another Seeker",
        "role": "seeker"
    })
    assert res2_dup.status_code == 400
    assert "already exists" in res2_dup.json()["detail"]
    print(f"[OK] Duplicate seeker email properly rejected with 400: '{res2_dup.json()['detail']}'")

    # 3. Login with invalid credentials
    print("\n3. Testing Login with Invalid Credentials...")
    bad_login = client.post("/auth/login", json={
        "email": prov_email,
        "password": "WrongPassword999!",
        "role": "provider"
    })
    assert bad_login.status_code == 401
    assert "Invalid email or password" in bad_login.json()["detail"]
    print(f"[OK] Bad password properly rejected with 401: '{bad_login.json()['detail']}'")

    # 4. Role separation enforcement
    print("\n4. Testing Role Separation Enforcement on Login...")
    # Provider tries to log in through seeker portal
    prov_on_seeker = client.post("/auth/login", json={
        "email": prov_email,
        "password": "Password123!",
        "role": "seeker"
    })
    assert prov_on_seeker.status_code == 403
    assert "registered as a provider" in prov_on_seeker.json()["detail"]
    print(f"[OK] Provider attempting seeker login properly blocked with 403: '{prov_on_seeker.json()['detail']}'")

    # Seeker tries to log in through provider portal
    seeker_on_prov = client.post("/auth/login", json={
        "email": seeker_email,
        "password": "Password123!",
        "role": "provider"
    })
    assert seeker_on_prov.status_code == 403
    assert "registered as a seeker" in seeker_on_prov.json()["detail"]
    print(f"[OK] Seeker attempting provider login properly blocked with 403: '{seeker_on_prov.json()['detail']}'")

    # 5. Successful login & token retrieval
    print("\n5. Testing Valid Login & Token Generation...")
    prov_login = client.post("/auth/login", json={
        "email": prov_email,
        "password": "Password123!",
        "role": "provider"
    })
    assert prov_login.status_code == 200
    prov_token = prov_login.json()["access_token"]
    assert len(prov_token) > 20
    print(f"[OK] Provider logged in successfully. Token generated.")

    seek_login = client.post("/auth/login", json={
        "email": seeker_email,
        "password": "Password123!",
        "role": "seeker"
    })
    assert seek_login.status_code == 200
    seek_token = seek_login.json()["access_token"]
    assert len(seek_token) > 20
    print(f"[OK] Seeker logged in successfully. Token generated.")

    # 6. Database persistence check
    print("\n6. Verifying Database Records...")
    db_path = Path(__file__).resolve().parent.parent / "resourcebridge.db"
    con = sqlite3.connect(str(db_path))
    cur = con.cursor()
    prov_row = cur.execute("SELECT email, role, organization_name, organization_type FROM users WHERE email = ?", (prov_email,)).fetchone()
    assert prov_row[1] == "provider"
    assert prov_row[2] == "Unique Genomics Center"
    assert prov_row[3] == "Research Laboratory"
    print(f"[OK] Provider verified in DB: {prov_row}")

    seek_row = cur.execute("SELECT email, role, organization_name FROM users WHERE email = ?", (seeker_email,)).fetchone()
    assert seek_row[1] == "seeker"
    assert seek_row[2] == "Innovative Research Lab"
    print(f"[OK] Seeker verified in DB: {seek_row}")
    con.close()

    # 7. Frontend availability & theme script check
    print("\n7. Verifying Frontend Dev Server & Pre-render Theme Script...")
    fe = httpx.get("http://localhost:5173")
    assert fe.status_code == 200
    assert "rb_theme" in fe.text
    assert 'class="dark"' in fe.text
    print("[OK] Frontend serves index.html with dark mode default and zero-flash theme script.")

    print("\n=== ALL AUTHENTICATION, ROLE SEPARATION, AND THEME CHECKS PASSED! ===")

if __name__ == "__main__":
    run_checks()

