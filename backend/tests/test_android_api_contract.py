"""
Android API Contract Tests for Google Play Store Requirements

Tests the Android API config endpoints and privacy/account deletion endpoints
required for Play Store compliance.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Android API config endpoints to test
ANDROID_CONFIG_ENDPOINTS = [
    "/api/user/mobile/android-api-config",
    "/api/user/android-api-config",
    "/api/mobile/android-api-config",
    "/api/android-api-config",
]

# Required keys in the Android API contract JSON
REQUIRED_CONTRACT_KEYS = [
    "base_path",
    "required_public_endpoints",
    "privacy_and_account_deletion",
]

# Privacy/deletion endpoints (require auth)
# NOTE: Actual endpoints are at /api/account/* NOT /api/user/account/*
# The Android API contract incorrectly documents them as /api/user/account/*
ACTUAL_PRIVACY_ENDPOINTS = [
    "/api/account/export",
    "/api/account/delete-request",
    "/api/account/deletion-status",
]

# Documented endpoints in Android API contract (incorrect paths)
DOCUMENTED_PRIVACY_ENDPOINTS = [
    "/api/user/account/export",
    "/api/user/account/delete-request",
    "/api/user/account/deletion-status",
]


class TestAndroidAPIConfig:
    """Tests for Android API config endpoints."""

    @pytest.mark.parametrize("endpoint", ANDROID_CONFIG_ENDPOINTS)
    def test_android_config_endpoint_returns_200(self, endpoint):
        """Each Android config endpoint should return 200 OK."""
        url = f"{BASE_URL}{endpoint}"
        response = requests.get(url, timeout=10)
        
        assert response.status_code == 200, f"Expected 200 for {endpoint}, got {response.status_code}"
        
        # Verify JSON response
        data = response.json()
        assert isinstance(data, dict), f"Expected dict response for {endpoint}"

    @pytest.mark.parametrize("endpoint", ANDROID_CONFIG_ENDPOINTS)
    def test_android_config_has_required_keys(self, endpoint):
        """Each Android config endpoint should include required contract keys."""
        url = f"{BASE_URL}{endpoint}"
        response = requests.get(url, timeout=10)
        
        assert response.status_code == 200
        data = response.json()
        
        for key in REQUIRED_CONTRACT_KEYS:
            assert key in data, f"Missing required key '{key}' in {endpoint} response"

    def test_android_config_base_path_is_api(self):
        """base_path should be '/api'."""
        url = f"{BASE_URL}/api/android-api-config"
        response = requests.get(url, timeout=10)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("base_path") == "/api", f"Expected base_path='/api', got '{data.get('base_path')}'"

    def test_android_config_has_privacy_endpoints(self):
        """privacy_and_account_deletion should contain export, delete-request, deletion-status endpoints."""
        url = f"{BASE_URL}/api/android-api-config"
        response = requests.get(url, timeout=10)
        
        assert response.status_code == 200
        data = response.json()
        
        privacy_section = data.get("privacy_and_account_deletion", {})
        
        assert "export_endpoint" in privacy_section, "Missing export_endpoint in privacy_and_account_deletion"
        assert "deletion_request_endpoint" in privacy_section, "Missing deletion_request_endpoint"
        assert "deletion_status_endpoint" in privacy_section, "Missing deletion_status_endpoint"
        
        # Verify endpoint paths
        assert privacy_section["export_endpoint"] == "/api/user/account/export"
        assert privacy_section["deletion_request_endpoint"] == "/api/user/account/delete-request"
        assert privacy_section["deletion_status_endpoint"] == "/api/user/account/deletion-status"

    def test_android_config_has_required_public_endpoints(self):
        """required_public_endpoints should be a non-empty list."""
        url = f"{BASE_URL}/api/android-api-config"
        response = requests.get(url, timeout=10)
        
        assert response.status_code == 200
        data = response.json()
        
        endpoints = data.get("required_public_endpoints", [])
        assert isinstance(endpoints, list), "required_public_endpoints should be a list"
        assert len(endpoints) > 0, "required_public_endpoints should not be empty"
        
        # Verify some critical endpoints are listed
        assert "/api/health" in endpoints, "/api/health should be in required_public_endpoints"
        assert "/api/auth/me" in endpoints, "/api/auth/me should be in required_public_endpoints"

    def test_all_config_endpoints_return_same_contract(self):
        """All Android config endpoints should return the same contract structure."""
        responses = []
        for endpoint in ANDROID_CONFIG_ENDPOINTS:
            url = f"{BASE_URL}{endpoint}"
            response = requests.get(url, timeout=10)
            assert response.status_code == 200
            responses.append(response.json())
        
        # Compare key fields (excluding cors_origin_received which may vary)
        first = responses[0]
        for i, data in enumerate(responses[1:], start=1):
            assert data.get("base_path") == first.get("base_path"), f"base_path mismatch at endpoint {i}"
            assert data.get("mobile_platform") == first.get("mobile_platform"), f"mobile_platform mismatch at endpoint {i}"
            assert data.get("api_version") == first.get("api_version"), f"api_version mismatch at endpoint {i}"
            assert data.get("required_public_endpoints") == first.get("required_public_endpoints"), f"required_public_endpoints mismatch at endpoint {i}"
            assert data.get("privacy_and_account_deletion") == first.get("privacy_and_account_deletion"), f"privacy_and_account_deletion mismatch at endpoint {i}"


class TestPrivacyEndpointsAuth:
    """Tests for privacy/account deletion endpoints (auth behavior).
    
    NOTE: There is a mismatch between documented and actual endpoint paths.
    - Documented in Android API contract: /api/user/account/*
    - Actual working endpoints: /api/account/*
    
    This is a BUG that needs to be fixed by either:
    1. Adding the endpoints at /api/user/account/* paths, OR
    2. Updating the Android API contract to document /api/account/* paths
    """

    def test_actual_account_export_requires_auth(self):
        """GET /api/account/export should return 401 without auth (actual working endpoint)."""
        url = f"{BASE_URL}/api/account/export"
        response = requests.get(url, timeout=10)
        
        # Should require authentication
        assert response.status_code == 401, f"Expected 401 for unauthenticated export, got {response.status_code}"

    def test_actual_account_delete_request_requires_auth(self):
        """POST /api/account/delete-request should return 401 without auth (actual working endpoint)."""
        url = f"{BASE_URL}/api/account/delete-request"
        response = requests.post(url, json={}, timeout=10)
        
        # Should require authentication
        assert response.status_code == 401, f"Expected 401 for unauthenticated delete-request, got {response.status_code}"

    def test_actual_account_deletion_status_requires_auth(self):
        """GET /api/account/deletion-status should return 401 without auth (actual working endpoint)."""
        url = f"{BASE_URL}/api/account/deletion-status"
        response = requests.get(url, timeout=10)
        
        # Should require authentication
        assert response.status_code == 401, f"Expected 401 for unauthenticated deletion-status, got {response.status_code}"

    def test_documented_endpoints_return_404(self):
        """Documented /api/user/account/* endpoints return 404 - BUG: path mismatch."""
        for endpoint in DOCUMENTED_PRIVACY_ENDPOINTS:
            url = f"{BASE_URL}{endpoint}"
            response = requests.get(url, timeout=10)
            # These return 404 because the actual endpoints are at /api/account/*
            assert response.status_code == 404, f"Expected 404 for documented but non-existent {endpoint}, got {response.status_code}"


class TestPublicEndpointsNoRegression:
    """Tests for public endpoints to ensure no regression."""

    def test_health_endpoint_returns_200(self):
        """GET /api/health should return 200 with healthy status."""
        url = f"{BASE_URL}/api/health"
        response = requests.get(url, timeout=10)
        
        assert response.status_code == 200, f"Expected 200 for /api/health, got {response.status_code}"
        
        data = response.json()
        assert data.get("status") == "healthy", f"Expected status='healthy', got '{data.get('status')}'"

    def test_auth_me_returns_401_without_auth(self):
        """GET /api/auth/me should return 401 without authentication."""
        url = f"{BASE_URL}/api/auth/me"
        response = requests.get(url, timeout=10)
        
        # Without auth, should return 401
        assert response.status_code == 401, f"Expected 401 for unauthenticated /api/auth/me, got {response.status_code}"


class TestAndroidConfigAdditionalFields:
    """Tests for additional fields in Android API config."""

    def test_android_config_has_auth_section(self):
        """Android config should include auth configuration."""
        url = f"{BASE_URL}/api/android-api-config"
        response = requests.get(url, timeout=10)
        
        assert response.status_code == 200
        data = response.json()
        
        auth_section = data.get("auth", {})
        assert "cookie_session" in auth_section, "Missing cookie_session in auth section"
        assert "bearer_fallback" in auth_section, "Missing bearer_fallback in auth section"

    def test_android_config_has_mobile_platform(self):
        """Android config should specify mobile_platform as 'android'."""
        url = f"{BASE_URL}/api/android-api-config"
        response = requests.get(url, timeout=10)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("mobile_platform") == "android", f"Expected mobile_platform='android', got '{data.get('mobile_platform')}'"

    def test_android_config_has_api_version(self):
        """Android config should include api_version."""
        url = f"{BASE_URL}/api/android-api-config"
        response = requests.get(url, timeout=10)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "api_version" in data, "Missing api_version in response"
        assert data.get("api_version") == "v1", f"Expected api_version='v1', got '{data.get('api_version')}'"
