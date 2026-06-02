"""Tests for user profile and address management."""

from tests.conftest import auth_header


def test_get_profile(client, user_token):
    res = client.get("/api/v1/users/profile", headers=auth_header(user_token))
    assert res.status_code == 200
    assert res.json()["email"] == "test@example.com"


def test_update_profile(client, user_token):
    res = client.patch("/api/v1/users/profile",
        headers=auth_header(user_token),
        json={"full_name": "Updated Name", "phone": "9999999999"},
    )
    assert res.status_code == 200
    assert res.json()["full_name"] == "Updated Name"
    assert res.json()["phone"] == "9999999999"


def test_add_address(client, user_token):
    res = client.post("/api/v1/users/addresses",
        headers=auth_header(user_token),
        json={
            "full_name": "Test User",
            "phone": "9876543210",
            "line1": "123 Main Street",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001",
            "country": "India",
            "is_default": True,
        },
    )
    assert res.status_code == 201
    assert res.json()["city"] == "Mumbai"
    assert res.json()["is_default"] is True


def test_list_addresses(client, user_token):
    client.post("/api/v1/users/addresses",
        headers=auth_header(user_token),
        json={"full_name": "T", "phone": "1234567890", "line1": "123 St",
              "city": "Delhi", "state": "DL", "pincode": "110001", "country": "India", "is_default": False},
    )
    res = client.get("/api/v1/users/addresses", headers=auth_header(user_token))
    assert res.status_code == 200
    assert len(res.json()) == 1


def test_delete_address(client, user_token):
    add_res = client.post("/api/v1/users/addresses",
        headers=auth_header(user_token),
        json={"full_name": "T", "phone": "1234567890", "line1": "123 St",
              "city": "Delhi", "state": "DL", "pincode": "110001", "country": "India", "is_default": False},
    )
    addr_id = add_res.json()["id"]
    del_res = client.delete(f"/api/v1/users/addresses/{addr_id}", headers=auth_header(user_token))
    assert del_res.status_code == 204
