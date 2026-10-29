from datetime import datetime, timedelta, timezone

def test_permissions_and_ownership(client):
    # Provider 1
    p1 = client.post("/api/v1/auth/register", json={
        "email": "p1@example.com",
        "password": "Password123!",
        "full_name": "Provider One",
        "role": "provider",
        "organization_name": "Org One",
        "organization_type": "Research Laboratory"
    }).json()
    p1_headers = {"Authorization": f"Bearer {p1['access_token']}"}

    # Provider 2
    p2 = client.post("/api/v1/auth/register", json={
        "email": "p2@example.com",
        "password": "Password123!",
        "full_name": "Provider Two",
        "role": "provider",
        "organization_name": "Org Two",
        "organization_type": "Startup"
    }).json()
    p2_headers = {"Authorization": f"Bearer {p2['access_token']}"}

    # Provider 1 creates a resource
    res = client.post("/api/v1/resources", json={
        "title": "3D Metal Printer",
        "description": "Direct Metal Laser Sintering 3D Printer",
        "category": "Equipment",
        "location": "Additive Lab 102"
    }, headers=p1_headers).json()
    res_id = res["id"]

    # Provider 2 tries to modify Provider 1's resource -> should be 403 Forbidden
    patch_res = client.patch(f"/api/v1/resources/{res_id}", json={
        "title": "Hacked Title"
    }, headers=p2_headers)
    assert patch_res.status_code == 403
    assert "do not have permission" in patch_res.json()["detail"]

    # Provider 2 tries to delete Provider 1's resource -> should be 403 Forbidden
    delete_res = client.delete(f"/api/v1/resources/{res_id}", headers=p2_headers)
    assert delete_res.status_code == 403
