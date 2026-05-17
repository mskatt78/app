"""
Iteration 117 - Provenance/Review Workflow for Remaining Collections + Gifts Refactor Regression

Tests:
1. GET /api/ancient-wisdom returns content_integrity + source_references list
2. GET /api/shamanic-practices returns content_integrity + source_references list
3. GET /api/elemental-practices returns content_integrity + source_references list
4. GET /api/heart-practices returns content_integrity + source_references list
5. Gifts payment-related endpoints sanity check (non-500 behavior for unauthenticated)
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestAncientWisdomContentIntegrity:
    """Test ancient_wisdom collection returns content_integrity metadata."""

    def test_ancient_wisdom_returns_list(self):
        """GET /api/ancient-wisdom returns a list."""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"✓ GET /api/ancient-wisdom returned {len(data)} entries")

    def test_ancient_wisdom_has_content_integrity(self):
        """Each ancient wisdom entry should have content_integrity field."""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom", timeout=15)
        assert response.status_code == 200
        data = response.json()
        if len(data) == 0:
            pytest.skip("No ancient wisdom entries in database")
        
        for entry in data[:5]:  # Check first 5
            assert "content_integrity" in entry, f"Entry {entry.get('id')} missing content_integrity"
            ci = entry["content_integrity"]
            assert "source_type" in ci, "content_integrity missing source_type"
            assert "verified" in ci, "content_integrity missing verified"
            assert "references_count" in ci, "content_integrity missing references_count"
        print(f"✓ Ancient wisdom entries have content_integrity metadata")

    def test_ancient_wisdom_has_source_references_list(self):
        """Each ancient wisdom entry should have source_references as a list."""
        response = requests.get(f"{BASE_URL}/api/ancient-wisdom", timeout=15)
        assert response.status_code == 200
        data = response.json()
        if len(data) == 0:
            pytest.skip("No ancient wisdom entries in database")
        
        for entry in data[:5]:
            assert "source_references" in entry, f"Entry {entry.get('id')} missing source_references"
            assert isinstance(entry["source_references"], list), "source_references should be a list"
        print(f"✓ Ancient wisdom entries have source_references as list")


class TestShamanicPracticesContentIntegrity:
    """Test shamanic_practices collection returns content_integrity metadata."""

    def test_shamanic_practices_returns_list(self):
        """GET /api/shamanic-practices returns a list."""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"✓ GET /api/shamanic-practices returned {len(data)} entries")

    def test_shamanic_practices_has_content_integrity(self):
        """Each shamanic practice should have content_integrity field."""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices", timeout=15)
        assert response.status_code == 200
        data = response.json()
        if len(data) == 0:
            pytest.skip("No shamanic practices in database")
        
        for entry in data[:5]:
            assert "content_integrity" in entry, f"Entry {entry.get('id')} missing content_integrity"
            ci = entry["content_integrity"]
            assert "source_type" in ci, "content_integrity missing source_type"
            assert "verified" in ci, "content_integrity missing verified"
            assert "references_count" in ci, "content_integrity missing references_count"
        print(f"✓ Shamanic practices have content_integrity metadata")

    def test_shamanic_practices_has_source_references_list(self):
        """Each shamanic practice should have source_references as a list."""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices", timeout=15)
        assert response.status_code == 200
        data = response.json()
        if len(data) == 0:
            pytest.skip("No shamanic practices in database")
        
        for entry in data[:5]:
            assert "source_references" in entry, f"Entry {entry.get('id')} missing source_references"
            assert isinstance(entry["source_references"], list), "source_references should be a list"
        print(f"✓ Shamanic practices have source_references as list")


class TestElementalPracticesContentIntegrity:
    """Test elemental_practices collection returns content_integrity metadata."""

    def test_elemental_practices_returns_list(self):
        """GET /api/elemental-practices returns a list."""
        response = requests.get(f"{BASE_URL}/api/elemental-practices", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"✓ GET /api/elemental-practices returned {len(data)} entries")

    def test_elemental_practices_has_content_integrity(self):
        """Each elemental practice should have content_integrity field."""
        response = requests.get(f"{BASE_URL}/api/elemental-practices", timeout=15)
        assert response.status_code == 200
        data = response.json()
        if len(data) == 0:
            pytest.skip("No elemental practices in database")
        
        for entry in data[:5]:
            assert "content_integrity" in entry, f"Entry {entry.get('id')} missing content_integrity"
            ci = entry["content_integrity"]
            assert "source_type" in ci, "content_integrity missing source_type"
            assert "verified" in ci, "content_integrity missing verified"
            assert "references_count" in ci, "content_integrity missing references_count"
        print(f"✓ Elemental practices have content_integrity metadata")

    def test_elemental_practices_has_source_references_list(self):
        """Each elemental practice should have source_references as a list."""
        response = requests.get(f"{BASE_URL}/api/elemental-practices", timeout=15)
        assert response.status_code == 200
        data = response.json()
        if len(data) == 0:
            pytest.skip("No elemental practices in database")
        
        for entry in data[:5]:
            assert "source_references" in entry, f"Entry {entry.get('id')} missing source_references"
            assert isinstance(entry["source_references"], list), "source_references should be a list"
        print(f"✓ Elemental practices have source_references as list")


class TestHeartPracticesContentIntegrity:
    """Test heart_practices collection returns content_integrity metadata."""

    def test_heart_practices_returns_list(self):
        """GET /api/heart-practices returns a list."""
        response = requests.get(f"{BASE_URL}/api/heart-practices", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"✓ GET /api/heart-practices returned {len(data)} entries")

    def test_heart_practices_has_content_integrity(self):
        """Each heart practice should have content_integrity field."""
        response = requests.get(f"{BASE_URL}/api/heart-practices", timeout=15)
        assert response.status_code == 200
        data = response.json()
        if len(data) == 0:
            pytest.skip("No heart practices in database")
        
        for entry in data[:5]:
            assert "content_integrity" in entry, f"Entry {entry.get('id')} missing content_integrity"
            ci = entry["content_integrity"]
            assert "source_type" in ci, "content_integrity missing source_type"
            assert "verified" in ci, "content_integrity missing verified"
            assert "references_count" in ci, "content_integrity missing references_count"
        print(f"✓ Heart practices have content_integrity metadata")

    def test_heart_practices_has_source_references_list(self):
        """Each heart practice should have source_references as a list."""
        response = requests.get(f"{BASE_URL}/api/heart-practices", timeout=15)
        assert response.status_code == 200
        data = response.json()
        if len(data) == 0:
            pytest.skip("No heart practices in database")
        
        for entry in data[:5]:
            assert "source_references" in entry, f"Entry {entry.get('id')} missing source_references"
            assert isinstance(entry["source_references"], list), "source_references should be a list"
        print(f"✓ Heart practices have source_references as list")


class TestGiftsEndpointsRegression:
    """Test gifts payment-related endpoints for non-500 behavior after refactor."""

    def test_gifts_create_requires_body(self):
        """POST /api/gifts/create without body should return 422 (validation error), not 500."""
        response = requests.post(f"{BASE_URL}/api/gifts/create", json={}, timeout=10)
        # Should be 422 (validation error) not 500
        assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
        print(f"✓ POST /api/gifts/create without body returns {response.status_code} (validation error)")

    def test_gifts_pay_requires_auth(self):
        """POST /api/gifts/pay without auth should return 401, not 500."""
        response = requests.post(
            f"{BASE_URL}/api/gifts/pay",
            json={"gift_code": "GIFT-TEST1234", "origin_url": "https://example.com"},
            timeout=10
        )
        # Should be 401 (unauthorized) not 500
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ POST /api/gifts/pay without auth returns {response.status_code}")

    def test_gifts_redeem_requires_auth(self):
        """POST /api/gifts/redeem without auth should return 401, not 500."""
        response = requests.post(
            f"{BASE_URL}/api/gifts/redeem",
            json={"gift_code": "GIFT-TEST1234"},
            timeout=10
        )
        # Should be 401 (unauthorized) not 500
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ POST /api/gifts/redeem without auth returns {response.status_code}")

    def test_gifts_get_by_code_not_found(self):
        """GET /api/gifts/{code} for non-existent code should return 404, not 500."""
        response = requests.get(f"{BASE_URL}/api/gifts/GIFT-NONEXISTENT", timeout=10)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ GET /api/gifts/GIFT-NONEXISTENT returns 404")

    def test_gifts_my_sent_requires_auth(self):
        """GET /api/gifts/my/sent without auth should return 401, not 500."""
        response = requests.get(f"{BASE_URL}/api/gifts/my/sent", timeout=10)
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ GET /api/gifts/my/sent without auth returns {response.status_code}")

    def test_gifts_my_received_requires_auth(self):
        """GET /api/gifts/my/received without auth should return 401, not 500."""
        response = requests.get(f"{BASE_URL}/api/gifts/my/received", timeout=10)
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ GET /api/gifts/my/received without auth returns {response.status_code}")


class TestNotificationsEndpoints:
    """Test notifications endpoints for non-500 behavior."""

    def test_notifications_subscribe_requires_body(self):
        """POST /api/notifications/subscribe without proper body should return 422."""
        response = requests.post(f"{BASE_URL}/api/notifications/subscribe", json={}, timeout=10)
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print(f"✓ POST /api/notifications/subscribe without body returns 422")

    def test_notifications_unsubscribe_requires_body(self):
        """POST /api/notifications/unsubscribe without proper body should return 422."""
        response = requests.post(f"{BASE_URL}/api/notifications/unsubscribe", json={}, timeout=10)
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print(f"✓ POST /api/notifications/unsubscribe without body returns 422")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
