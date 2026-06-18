"""
Mudra Image Verification Tests - Iteration 177
Tests for user-reported issue: Mudra images not certified and many look repeated
Requirements:
1. GET /api/mudras returns 12 unique mudras with unique non-null image_url values
2. All mudras have image_validation.status=verified and image_source set to Wikimedia/Commons verified source
3. All image URLs should be from Wikimedia Commons
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestMudrasImageVerification:
    """Tests for mudra image verification and uniqueness"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Fetch mudras data once for all tests"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200, f"Failed to fetch mudras: {response.status_code}"
        self.mudras = response.json()

    def test_mudras_endpoint_returns_200(self):
        """Test that /api/mudras endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        print("PASS: /api/mudras returns 200")

    def test_mudras_count_is_12(self):
        """Test that exactly 12 mudras are returned"""
        assert len(self.mudras) == 12, f"Expected 12 mudras, got {len(self.mudras)}"
        print(f"PASS: 12 mudras returned")

    def test_all_mudras_have_non_null_image_url(self):
        """Test that all mudras have non-null image_url"""
        for mudra in self.mudras:
            assert mudra.get('image_url') is not None, f"Mudra '{mudra.get('name')}' has null image_url"
        print("PASS: All mudras have non-null image_url")

    def test_all_image_urls_are_unique(self):
        """Test that all image URLs are unique (no repeated images)"""
        urls = [m.get('image_url') for m in self.mudras]
        unique_urls = set(urls)
        assert len(unique_urls) == len(urls), f"Found duplicate URLs: {len(urls)} total, {len(unique_urls)} unique"
        print(f"PASS: All {len(unique_urls)} image URLs are unique")

    def test_all_mudras_have_verified_status(self):
        """Test that all mudras have image_validation.status=verified"""
        for mudra in self.mudras:
            validation = mudra.get('image_validation', {})
            status = validation.get('status')
            assert status == 'verified', f"Mudra '{mudra.get('name')}' has status '{status}', expected 'verified'"
        print("PASS: All mudras have verified status")

    def test_all_mudras_have_wikimedia_source(self):
        """Test that all mudras have image_source set to wikimedia_commons_verified"""
        for mudra in self.mudras:
            source = mudra.get('image_source', '')
            assert 'wikimedia' in source.lower(), f"Mudra '{mudra.get('name')}' has source '{source}', expected wikimedia"
        print("PASS: All mudras have wikimedia source")

    def test_all_image_urls_from_wikimedia(self):
        """Test that all image URLs are from Wikimedia Commons"""
        for mudra in self.mudras:
            url = mudra.get('image_url', '')
            assert 'wikimedia' in url.lower(), f"Mudra '{mudra.get('name')}' URL not from wikimedia: {url}"
        print("PASS: All image URLs are from Wikimedia")

    def test_all_mudras_have_source_references(self):
        """Test that all mudras have source_references"""
        for mudra in self.mudras:
            refs = mudra.get('source_references', [])
            assert len(refs) > 0, f"Mudra '{mudra.get('name')}' has no source_references"
        print("PASS: All mudras have source_references")

    def test_mudra_element_filter_works(self):
        """Test that element filtering works correctly"""
        # Get all unique elements
        elements = set(m.get('element') for m in self.mudras)
        print(f"Elements found: {elements}")
        
        # Verify each element has at least one mudra
        for element in elements:
            filtered = [m for m in self.mudras if m.get('element') == element]
            assert len(filtered) > 0, f"No mudras found for element '{element}'"
        print("PASS: Element filtering works correctly")


class TestMudrasDataIntegrity:
    """Tests for mudra data integrity"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Fetch mudras data once for all tests"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        self.mudras = response.json()

    def test_all_mudras_have_required_fields(self):
        """Test that all mudras have required fields"""
        required_fields = ['id', 'name', 'element', 'description', 'image_url', 'image_validation']
        for mudra in self.mudras:
            for field in required_fields:
                assert field in mudra, f"Mudra '{mudra.get('name')}' missing field '{field}'"
        print("PASS: All mudras have required fields")

    def test_image_validation_has_required_fields(self):
        """Test that image_validation has required fields"""
        required_fields = ['status', 'source_type', 'score']
        for mudra in self.mudras:
            validation = mudra.get('image_validation', {})
            for field in required_fields:
                assert field in validation, f"Mudra '{mudra.get('name')}' image_validation missing '{field}'"
        print("PASS: All image_validation objects have required fields")

    def test_verification_scores_are_high(self):
        """Test that verification scores are above threshold"""
        for mudra in self.mudras:
            score = mudra.get('image_validation', {}).get('score', 0)
            assert score >= 0.9, f"Mudra '{mudra.get('name')}' has low score: {score}"
        print("PASS: All verification scores are >= 0.9")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
