"""
Test Android API 36 Configuration Endpoints for Google Play Compliance
Tests the android-api-config endpoints and assetlinks.json static file
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestAndroidAPI36Config:
    """Android API 36 configuration endpoint tests for Play Store compliance"""

    def test_android_api_config_returns_200(self):
        """GET /api/android-api-config returns 200"""
        response = requests.get(f"{BASE_URL}/api/android-api-config")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: /api/android-api-config returns 200")

    def test_android_api_config_returns_valid_json(self):
        """GET /api/android-api-config returns valid JSON"""
        response = requests.get(f"{BASE_URL}/api/android-api-config")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict), "Response should be a JSON object"
        print("PASS: /api/android-api-config returns valid JSON")

    def test_android_api_config_has_play_store_requirements(self):
        """GET /api/android-api-config contains play_store_release_requirements"""
        response = requests.get(f"{BASE_URL}/api/android-api-config")
        assert response.status_code == 200
        data = response.json()
        
        assert "play_store_release_requirements" in data, "Missing play_store_release_requirements"
        requirements = data["play_store_release_requirements"]
        
        # Verify required_target_sdk = 36
        assert requirements.get("required_target_sdk") == 36, \
            f"Expected required_target_sdk=36, got {requirements.get('required_target_sdk')}"
        
        # Verify recommended_compile_sdk = 36
        assert requirements.get("recommended_compile_sdk") == 36, \
            f"Expected recommended_compile_sdk=36, got {requirements.get('recommended_compile_sdk')}"
        
        # Verify package_id_for_existing_release
        expected_package = "host.emergent.embodiment_journey.twa"
        assert requirements.get("package_id_for_existing_release") == expected_package, \
            f"Expected package_id={expected_package}, got {requirements.get('package_id_for_existing_release')}"
        
        print("PASS: /api/android-api-config has correct play_store_release_requirements")
        print(f"  - required_target_sdk: {requirements.get('required_target_sdk')}")
        print(f"  - recommended_compile_sdk: {requirements.get('recommended_compile_sdk')}")
        print(f"  - package_id_for_existing_release: {requirements.get('package_id_for_existing_release')}")

    def test_user_mobile_android_api_config_returns_200(self):
        """GET /api/user/mobile/android-api-config returns 200"""
        response = requests.get(f"{BASE_URL}/api/user/mobile/android-api-config")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: /api/user/mobile/android-api-config returns 200")

    def test_user_mobile_android_api_config_returns_valid_json(self):
        """GET /api/user/mobile/android-api-config returns valid JSON"""
        response = requests.get(f"{BASE_URL}/api/user/mobile/android-api-config")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict), "Response should be a JSON object"
        print("PASS: /api/user/mobile/android-api-config returns valid JSON")

    def test_user_mobile_android_api_config_has_play_store_requirements(self):
        """GET /api/user/mobile/android-api-config contains same API36 requirements"""
        response = requests.get(f"{BASE_URL}/api/user/mobile/android-api-config")
        assert response.status_code == 200
        data = response.json()
        
        assert "play_store_release_requirements" in data, "Missing play_store_release_requirements"
        requirements = data["play_store_release_requirements"]
        
        # Verify required_target_sdk = 36
        assert requirements.get("required_target_sdk") == 36, \
            f"Expected required_target_sdk=36, got {requirements.get('required_target_sdk')}"
        
        # Verify recommended_compile_sdk = 36
        assert requirements.get("recommended_compile_sdk") == 36, \
            f"Expected recommended_compile_sdk=36, got {requirements.get('recommended_compile_sdk')}"
        
        # Verify package_id_for_existing_release
        expected_package = "host.emergent.embodiment_journey.twa"
        assert requirements.get("package_id_for_existing_release") == expected_package, \
            f"Expected package_id={expected_package}, got {requirements.get('package_id_for_existing_release')}"
        
        print("PASS: /api/user/mobile/android-api-config has correct play_store_release_requirements")

    def test_both_endpoints_return_same_payload(self):
        """Both android-api-config endpoints return identical play_store_release_requirements"""
        response1 = requests.get(f"{BASE_URL}/api/android-api-config")
        response2 = requests.get(f"{BASE_URL}/api/user/mobile/android-api-config")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        data1 = response1.json()
        data2 = response2.json()
        
        # Compare play_store_release_requirements
        req1 = data1.get("play_store_release_requirements", {})
        req2 = data2.get("play_store_release_requirements", {})
        
        assert req1 == req2, "play_store_release_requirements should be identical across endpoints"
        print("PASS: Both endpoints return identical play_store_release_requirements")


class TestAssetLinksJson:
    """Test /.well-known/assetlinks.json static file"""

    def test_assetlinks_json_accessible(self):
        """GET /.well-known/assetlinks.json returns 200"""
        response = requests.get(f"{BASE_URL}/.well-known/assetlinks.json")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: /.well-known/assetlinks.json is accessible (200)")

    def test_assetlinks_json_valid_json(self):
        """GET /.well-known/assetlinks.json returns valid JSON array"""
        response = requests.get(f"{BASE_URL}/.well-known/assetlinks.json")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "assetlinks.json should be a JSON array"
        assert len(data) > 0, "assetlinks.json should have at least one entry"
        print("PASS: /.well-known/assetlinks.json is valid JSON array")

    def test_assetlinks_json_contains_correct_package_name(self):
        """GET /.well-known/assetlinks.json contains correct package_name"""
        response = requests.get(f"{BASE_URL}/.well-known/assetlinks.json")
        assert response.status_code == 200
        data = response.json()
        
        expected_package = "host.emergent.embodiment_journey.twa"
        
        # Find the entry with the correct package_name
        found = False
        for entry in data:
            target = entry.get("target", {})
            if target.get("package_name") == expected_package:
                found = True
                # Verify namespace is android_app
                assert target.get("namespace") == "android_app", \
                    f"Expected namespace=android_app, got {target.get('namespace')}"
                # Verify relation includes delegate_permission/common.handle_all_urls
                relation = entry.get("relation", [])
                assert "delegate_permission/common.handle_all_urls" in relation, \
                    f"Missing delegate_permission/common.handle_all_urls in relation"
                break
        
        assert found, f"assetlinks.json does not contain package_name={expected_package}"
        print(f"PASS: /.well-known/assetlinks.json contains package_name={expected_package}")


class TestAndroidConfigNoRegression:
    """Regression tests for android config endpoints"""

    def test_android_api_config_has_required_fields(self):
        """Verify /api/android-api-config has all required fields"""
        response = requests.get(f"{BASE_URL}/api/android-api-config")
        assert response.status_code == 200
        data = response.json()
        
        # Check required top-level fields
        required_fields = ["mobile_platform", "api_version", "base_path", "play_store_release_requirements", "auth"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        assert data["mobile_platform"] == "android"
        assert data["api_version"] == "v1"
        assert data["base_path"] == "/api"
        
        print("PASS: /api/android-api-config has all required fields")

    def test_user_android_api_config_returns_200(self):
        """GET /api/user/android-api-config returns 200 (backward compat)"""
        response = requests.get(f"{BASE_URL}/api/user/android-api-config")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: /api/user/android-api-config returns 200")

    def test_mobile_android_api_config_returns_200(self):
        """GET /api/mobile/android-api-config returns 200 (backward compat)"""
        response = requests.get(f"{BASE_URL}/api/mobile/android-api-config")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: /api/mobile/android-api-config returns 200")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
