def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "ResourceBridge" in data["service"]

def test_register_provider_success(client):
    payload = {
        "email": "provider1@example.com",
        "password": "Password123!",
        "full_name": "Dr. Sarah Provider",
        "role": "provider",
        "organization_name": "Robotics Lab Inc.",
        "organization_type": "Research Laboratory"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "provider1@example.com"
    assert data["user"]["role"] == "provider"
    assert data["user"]["organization_name"] == "Robotics Lab Inc."
    assert data["user"]["organization_type"] == "Research Laboratory"

def test_register_provider_missing_organization_type(client):
    payload = {
        "email": "prov_notype@example.com",
        "password": "Password123!",
        "full_name": "No Type",
        "role": "provider",
        "organization_name": "Some Org"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "Organisation type is required" in response.json()["detail"]

def test_register_provider_invalid_organization_type(client):
    payload = {
        "email": "prov_invalidtype@example.com",
        "password": "Password123!",
        "full_name": "Invalid Type",
        "role": "provider",
        "organization_name": "Some Org",
        "organization_type": "Invalid Organization Type"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "Invalid organisation type" in response.json()["detail"]

def test_register_provider_missing_organization_name(client):
    payload = {
        "email": "prov_noname@example.com",
        "password": "Password123!",
        "full_name": "No Name",
        "role": "provider",
        "organization_type": "Startup"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "Organisation name is required" in response.json()["detail"]

def test_register_seeker_success(client):
    payload = {
        "email": "seeker1@example.com",
        "password": "Password123!",
        "full_name": "Alex Seeker",
        "role": "seeker",
        "organization_name": "Independent Researcher"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "seeker1@example.com"
    assert data["user"]["role"] == "seeker"

def test_register_duplicate_email(client):
    payload = {
        "email": "duplicate@example.com",
        "password": "Password123!",
        "full_name": "User One",
        "role": "seeker"
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]

def test_login_success(client):
    reg_payload = {
        "email": "loginuser@example.com",
        "password": "ValidPassword123",
        "full_name": "Login Test",
        "role": "seeker"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {
        "email": "loginuser@example.com",
        "password": "ValidPassword123"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "loginuser@example.com"

def test_login_invalid_password(client):
    reg_payload = {
        "email": "wrongpass@example.com",
        "password": "CorrectPassword123",
        "full_name": "Test User",
        "role": "seeker"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    response = client.post("/api/v1/auth/login", json={
        "email": "wrongpass@example.com",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_login_role_separation_enforcement(client):
    # A seeker tries to log in through the provider portal with role="provider"
    reg_payload = {
        "email": "onlyseeker@example.com",
        "password": "Password123!",
        "full_name": "Seeker Only",
        "role": "seeker"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    response = client.post("/api/v1/auth/login", json={
        "email": "onlyseeker@example.com",
        "password": "Password123!",
        "role": "provider"
    })
    assert response.status_code == 403
    assert "registered as a seeker" in response.json()["detail"]

def test_auth_me_endpoint(client):
    reg_payload = {
        "email": "metest@example.com",
        "password": "Password123!",
        "full_name": "Me Test",
        "role": "provider",
        "organization_name": "Me Organization",
        "organization_type": "Startup"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]

    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "metest@example.com"
    assert response.json()["organization_type"] == "Startup"
