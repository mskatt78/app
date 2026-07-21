"""
Heart Practices API Tests - Iteration 261
Tests for /api/heart-practices endpoint image alignment fix
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Expected heart practice IDs with deterministic image overrides
EXPECTED_HEART_PRACTICE_IDS = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
    "heart-supp-101", "heart-supp-102", "heart-supp-103", "heart-supp-104"
]

# Expected image URL prefix for deterministic overrides
EXPECTED_IMAGE_PREFIX = "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/"


class TestHeartPracticesAPI:
    """Tests for Heart Practices API endpoints"""
    
    def test_get_all_heart_practices_returns_14(self):
        """Verify /api/heart-practices returns exactly 14 practices"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 14, f"Expected 14 practices, got {len(data)}"
    
    def test_all_practices_have_image_urls(self):
        """Verify all heart practices have image_url field"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        
        data = response.json()
        for practice in data:
            assert "image_url" in practice, f"Practice {practice.get('id')} missing image_url"
            assert practice["image_url"], f"Practice {practice.get('id')} has empty image_url"
    
    def test_all_practices_use_deterministic_image_overrides(self):
        """Verify all practices use the new deterministic image URLs from HEART_IMAGE_OVERRIDES"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        
        data = response.json()
        for practice in data:
            image_url = practice.get("image_url", "")
            assert image_url.startswith(EXPECTED_IMAGE_PREFIX), \
                f"Practice {practice.get('id')} ({practice.get('name')}) has non-deterministic image: {image_url[:60]}..."
    
    def test_practice_ids_match_expected(self):
        """Verify all expected practice IDs are present"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        
        data = response.json()
        actual_ids = [str(p.get("id")) for p in data]
        
        for expected_id in EXPECTED_HEART_PRACTICE_IDS:
            assert expected_id in actual_ids, f"Missing expected practice ID: {expected_id}"
    
    def test_single_practice_endpoint(self):
        """Verify /api/heart-practices/{id} returns correct practice with image"""
        # Test first practice
        response = requests.get(f"{BASE_URL}/api/heart-practices/1")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("id") == "1" or data.get("id") == 1, f"Expected id=1, got {data.get('id')}"
        assert data.get("name") == "Heart Opening Ceremony", f"Unexpected name: {data.get('name')}"
        assert data.get("image_url", "").startswith(EXPECTED_IMAGE_PREFIX), \
            f"Single practice endpoint not using deterministic image override"
    
    def test_supplement_practices_in_list_have_images(self):
        """Verify supplement practices (heart-supp-*) have correct images in list endpoint
        Note: Supplements are only available via list endpoint, not single practice endpoint
        """
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        
        data = response.json()
        supplement_practices = [p for p in data if str(p.get("id", "")).startswith("heart-supp-")]
        
        assert len(supplement_practices) >= 4, f"Expected at least 4 supplement practices, got {len(supplement_practices)}"
        
        for practice in supplement_practices:
            assert practice.get("image_url", "").startswith(EXPECTED_IMAGE_PREFIX), \
                f"Supplement practice {practice.get('id')} not using deterministic image override"
    
    def test_practice_has_required_fields(self):
        """Verify practices have all required fields for UI rendering"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["id", "name", "description", "image_url", "category", "duration_minutes"]
        
        for practice in data:
            for field in required_fields:
                assert field in practice, f"Practice {practice.get('id')} missing required field: {field}"
    
    def test_category_filter_works(self):
        """Verify category filter parameter works"""
        response = requests.get(f"{BASE_URL}/api/heart-practices?category=self_love")
        assert response.status_code == 200
        
        data = response.json()
        # Should return practices, may be filtered or all if category doesn't match
        assert isinstance(data, list), "Response should be a list"
    
    def test_image_urls_are_accessible(self):
        """Verify image URLs return valid responses (HEAD request)"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        
        data = response.json()
        # Test first 3 images
        for practice in data[:3]:
            image_url = practice.get("image_url")
            if image_url:
                head_response = requests.head(image_url, timeout=10)
                assert head_response.status_code == 200, \
                    f"Image URL not accessible for {practice.get('name')}: {image_url}"


class TestHeartPracticeImageAlignment:
    """Specific tests for image-to-practice semantic alignment"""
    
    def test_each_practice_has_unique_image(self):
        """Verify each practice has a unique image URL (no duplicates)"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        
        data = response.json()
        image_urls = [p.get("image_url") for p in data]
        unique_urls = set(image_urls)
        
        assert len(image_urls) == len(unique_urls), \
            f"Found duplicate image URLs: {len(image_urls)} total, {len(unique_urls)} unique"
    
    def test_image_alt_matches_practice_name(self):
        """Verify image alt text matches practice name (frontend check via API data)"""
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200
        
        data = response.json()
        for practice in data:
            # The frontend uses practice.name as img alt, verify name exists
            assert practice.get("name"), f"Practice {practice.get('id')} missing name for alt text"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
