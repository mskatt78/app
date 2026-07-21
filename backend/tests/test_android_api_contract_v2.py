"""
Android API Contract Verification Tests - Iteration 263
Tests for Google Play Store API update request verification.
Verifies that the critical path mismatch from iteration 262 has been fixed.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAndroidAPIContractEndpoints:
    """Test all 4 Android API config endpoints return 200 with correct contract."""
    
    def test_android_config_user_mobile(self):
        """GET /api/user/mobile/android-api-config returns 200"""
        response = requests.get(f"{BASE_URL}/api/user/mobile/android-api-config")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "mobile_platform" in data
        assert data["mobile_platform"] == "android"
        print(f"PASS: /api/user/mobile/android-api-config returns 200")
    
    def test_android_config_user(self):
        """GET /api/user/android-api-config returns 200"""
        response = requests.get(f"{BASE_URL}/api/user/android-api-config")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "mobile_platform" in data
        assert data["mobile_platform"] == "android"
        print(f"PASS: /api/user/android-api-config returns 200")
    
    def test_android_config_mobile(self):
        """GET /api/mobile/android-api-config returns 200"""
        response = requests.get(f"{BASE_URL}/api/mobile/android-api-config")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "mobile_platform" in data
        assert data["mobile_platform"] == "android"
        print(f"PASS: /api/mobile/android-api-config returns 200")
    
    def test_android_config_root(self):
        """GET /api/android-api-config returns 200"""
        response = requests.get(f"{BASE_URL}/api/android-api-config")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "mobile_platform" in data
        assert data["mobile_platform"] == "android"
        print(f"PASS: /api/android-api-config returns 200")


class TestAndroidContractPrivacyEndpointPaths:
    """
    CRITICAL: Verify the path mismatch from iteration 262 is fixed.
    Contract JSON must document correct privacy endpoints: /api/account/*
    """
    
    def test_contract_documents_correct_export_path(self):
        """Contract should document /api/account/export (not /api/user/account/export)"""
        response = requests.get(f"{BASE_URL}/api/android-api-config")
        assert response.status_code == 200
        data = response.json()
        
        privacy = data.get("privacy_and_account_deletion", {})
        export_endpoint = privacy.get("export_endpoint", "")
        
        # CRITICAL: Must be /api/account/export, NOT /api/user/account/export
        assert export_endpoint == "/api/account/export", \
            f"Expected /api/account/export, got {export_endpoint}"
        print(f"PASS: Contract documents correct export path: {export_endpoint}")
    
    def test_contract_documents_correct_delete_request_path(self):
        """Contract should document /api/account/delete-request"""
        response = requests.get(f"{BASE_URL}/api/android-api-config")
        assert response.status_code == 200
        data = response.json()
        
        privacy = data.get("privacy_and_account_deletion", {})
        delete_endpoint = privacy.get("deletion_request_endpoint", "")
        
        assert delete_endpoint == "/api/account/delete-request", \
            f"Expected /api/account/delete-request, got {delete_endpoint}"
        print(f"PASS: Contract documents correct delete-request path: {delete_endpoint}")
    
    def test_contract_documents_correct_deletion_status_path(self):
        """Contract should document /api/account/deletion-status"""
        response = requests.get(f"{BASE_URL}/api/android-api-config")
        assert response.status_code == 200
        data = response.json()
        
        privacy = data.get("privacy_and_account_deletion", {})
        status_endpoint = privacy.get("deletion_status_endpoint", "")
        
        assert status_endpoint == "/api/account/deletion-status", \
            f"Expected /api/account/deletion-status, got {status_endpoint}"
        print(f"PASS: Contract documents correct deletion-status path: {status_endpoint}")
    
    def test_required_public_endpoints_include_privacy_paths(self):
        """required_public_endpoints should include the correct privacy paths"""
        response = requests.get(f"{BASE_URL}/api/android-api-config")
        assert response.status_code == 200
        data = response.json()
        
        required_endpoints = data.get("required_public_endpoints", [])
        
        assert "/api/account/export" in required_endpoints, \
            f"/api/account/export not in required_public_endpoints"
        assert "/api/account/delete-request" in required_endpoints, \
            f"/api/account/delete-request not in required_public_endpoints"
        assert "/api/account/deletion-status" in required_endpoints, \
            f"/api/account/deletion-status not in required_public_endpoints"
        print(f"PASS: required_public_endpoints includes all 3 privacy paths")


class TestPrivacyEndpointsAuthBehavior:
    """Test that privacy endpoints require authentication (return 401 unauthenticated)."""
    
    def test_account_export_requires_auth(self):
        """GET /api/account/export returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/account/export")
        assert response.status_code == 401, \
            f"Expected 401 for unauthenticated request, got {response.status_code}"
        print(f"PASS: /api/account/export returns 401 (auth required)")
    
    def test_account_deletion_status_requires_auth(self):
        """GET /api/account/deletion-status returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/account/deletion-status")
        assert response.status_code == 401, \
            f"Expected 401 for unauthenticated request, got {response.status_code}"
        print(f"PASS: /api/account/deletion-status returns 401 (auth required)")
    
    def test_account_delete_request_exists_and_requires_auth(self):
        """POST /api/account/delete-request returns 401 (not 404) without auth"""
        response = requests.post(
            f"{BASE_URL}/api/account/delete-request",
            json={"reason": "test"}
        )
        # CRITICAL: Must be 401 (auth required), NOT 404 (endpoint not found)
        assert response.status_code == 401, \
            f"Expected 401 for unauthenticated POST, got {response.status_code}. " \
            f"If 404, endpoint doesn't exist. If 422, validation error."
        print(f"PASS: POST /api/account/delete-request returns 401 (auth required, endpoint exists)")


class TestNoRegressionHealthAndAuth:
    """Verify no regression in /api/health and /api/auth/me behavior."""
    
    def test_health_endpoint(self):
        """GET /api/health returns 200 with healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("status") == "healthy", f"Expected healthy status, got {data}"
        print(f"PASS: /api/health returns 200 healthy")
    
    def test_auth_me_requires_auth(self):
        """GET /api/auth/me returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401, \
            f"Expected 401 for unauthenticated request, got {response.status_code}"
        print(f"PASS: /api/auth/me returns 401 (auth required)")


class TestAllConfigEndpointsReturnSameContract:
    """Verify all 4 config endpoints return identical contract structure."""
    
    def test_all_endpoints_return_same_privacy_paths(self):
        """All 4 Android config endpoints should return same privacy paths"""
        endpoints = [
            "/api/user/mobile/android-api-config",
            "/api/user/android-api-config",
            "/api/mobile/android-api-config",
            "/api/android-api-config"
        ]
        
        privacy_configs = []
        for endpoint in endpoints:
            response = requests.get(f"{BASE_URL}{endpoint}")
            assert response.status_code == 200, f"{endpoint} returned {response.status_code}"
            data = response.json()
            privacy_configs.append(data.get("privacy_and_account_deletion", {}))
        
        # All should be identical
        first = privacy_configs[0]
        for i, config in enumerate(privacy_configs[1:], 1):
            assert config == first, \
                f"Endpoint {endpoints[i]} has different privacy config than {endpoints[0]}"
        
        print(f"PASS: All 4 config endpoints return identical privacy_and_account_deletion")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
