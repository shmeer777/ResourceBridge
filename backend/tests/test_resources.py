def test_create_and_browse_resources(client):
    # Register a provider
    provider_res = client.post("/api/v1/auth/register", json={
        "email": "labowner@example.com",
        "password": "Password123!",
        "full_name": "Lab Manager",
        "role": "provider",
        "organization_name": "Tech Hub",
        "organization_type": "Research Laboratory"
    })
    token = provider_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create a resource
    res_payload = {
        "title": "Industrial CNC Mill",
        "description": "5-axis high-precision CNC milling machine with CAM workstation.",
        "category": "Equipment",
        "location": "Building 4, Workshop B",
        "capacity": 1,
        "hourly_rate": 45.0,
        "eligibility_criteria": "Safety certification level 2 required",
        "rules": "Clean workspace after session. Report any bit breakages immediately."
    }
    create_res = client.post("/api/v1/resources", json=res_payload, headers=headers)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["title"] == "Industrial CNC Mill"
    assert created_data["category"] == "Equipment"
    assert created_data["hourly_rate"] == 45.0
    res_id = created_data["id"]

    # Public browse / search
    browse_res = client.get("/api/v1/resources")
    assert browse_res.status_code == 200
    items = browse_res.json()
    assert len(items) >= 1
    assert any(r["id"] == res_id for r in items)

    # Search filter
    search_res = client.get("/api/v1/resources?search=CNC")
    assert search_res.status_code == 200
    assert len(search_res.json()) >= 1

    # Category filter
    cat_res = client.get("/api/v1/resources?category=Equipment")
    assert cat_res.status_code == 200
    assert len(cat_res.json()) >= 1

    # Single resource fetch
    single_res = client.get(f"/api/v1/resources/{res_id}")
    assert single_res.status_code == 200
    assert single_res.json()["title"] == "Industrial CNC Mill"

def test_seeker_cannot_create_resource(client):
    # Register seeker
    seeker_res = client.post("/api/v1/auth/register", json={
        "email": "seeker_only@example.com",
        "password": "Password123!",
        "full_name": "Seeker User",
        "role": "seeker"
    })
    token = seeker_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res_payload = {
        "title": "Unauthorized Resource",
        "description": "This should not be allowed.",
        "category": "Equipment",
        "location": "Room 101"
    }
    response = client.post("/api/v1/resources", json=res_payload, headers=headers)
    assert response.status_code == 403
    assert "Access forbidden" in response.json()["detail"]
