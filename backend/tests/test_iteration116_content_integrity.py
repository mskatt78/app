"""
Iteration 116 - Content Integrity Pipeline Testing
Tests that content_integrity and normalized source_references are present in:
- /api/yoga/poses
- /api/mantras
- /api/mudras
- /api/sacred-guardians
- /api/courses
- /api/meditations
- /api/breathwork/sessions
- /api/crystals/deep (verified image metadata)
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestContentIntegrityPipeline:
    """Tests for content_integrity metadata across user-facing libraries"""

    def test_yoga_poses_has_content_integrity(self):
        """GET /api/yoga/poses returns items with content_integrity"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        if len(data) > 0:
            pose = data[0]
            assert "content_integrity" in pose, "Missing content_integrity field"
            ci = pose["content_integrity"]
            assert "source_type" in ci, "Missing source_type in content_integrity"
            assert "verified" in ci, "Missing verified in content_integrity"
            assert "references_count" in ci, "Missing references_count in content_integrity"
            assert "source_references" in pose, "Missing source_references field"
            assert isinstance(pose["source_references"], list), "source_references should be a list"
            print(f"PASS: /api/yoga/poses returns {len(data)} poses with content_integrity")

    def test_mantras_has_content_integrity(self):
        """GET /api/mantras returns items with content_integrity"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        if len(data) > 0:
            mantra = data[0]
            assert "content_integrity" in mantra, "Missing content_integrity field"
            ci = mantra["content_integrity"]
            assert "source_type" in ci, "Missing source_type in content_integrity"
            assert "verified" in ci, "Missing verified in content_integrity"
            assert "references_count" in ci, "Missing references_count in content_integrity"
            assert "source_references" in mantra, "Missing source_references field"
            assert isinstance(mantra["source_references"], list), "source_references should be a list"
            print(f"PASS: /api/mantras returns {len(data)} mantras with content_integrity")

    def test_mudras_has_content_integrity(self):
        """GET /api/mudras returns items with content_integrity"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        if len(data) > 0:
            mudra = data[0]
            assert "content_integrity" in mudra, "Missing content_integrity field"
            ci = mudra["content_integrity"]
            assert "source_type" in ci, "Missing source_type in content_integrity"
            assert "verified" in ci, "Missing verified in content_integrity"
            assert "references_count" in ci, "Missing references_count in content_integrity"
            assert "source_references" in mudra, "Missing source_references field"
            assert isinstance(mudra["source_references"], list), "source_references should be a list"
            print(f"PASS: /api/mudras returns {len(data)} mudras with content_integrity")

    def test_sacred_guardians_has_content_integrity(self):
        """GET /api/sacred-guardians returns items with content_integrity"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        if len(data) > 0:
            guardian = data[0]
            assert "content_integrity" in guardian, "Missing content_integrity field"
            ci = guardian["content_integrity"]
            assert "source_type" in ci, "Missing source_type in content_integrity"
            assert "verified" in ci, "Missing verified in content_integrity"
            assert "references_count" in ci, "Missing references_count in content_integrity"
            assert "source_references" in guardian, "Missing source_references field"
            assert isinstance(guardian["source_references"], list), "source_references should be a list"
            print(f"PASS: /api/sacred-guardians returns {len(data)} guardians with content_integrity")

    def test_meditations_has_content_integrity(self):
        """GET /api/meditations returns items with content_integrity"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        if len(data) > 0:
            meditation = data[0]
            assert "content_integrity" in meditation, "Missing content_integrity field"
            ci = meditation["content_integrity"]
            assert "source_type" in ci, "Missing source_type in content_integrity"
            assert "verified" in ci, "Missing verified in content_integrity"
            assert "references_count" in ci, "Missing references_count in content_integrity"
            assert "source_references" in meditation, "Missing source_references field"
            assert isinstance(meditation["source_references"], list), "source_references should be a list"
            print(f"PASS: /api/meditations returns {len(data)} meditations with content_integrity")

    def test_breathwork_sessions_has_content_integrity(self):
        """GET /api/breathwork/sessions returns items with content_integrity"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        if len(data) > 0:
            session = data[0]
            assert "content_integrity" in session, "Missing content_integrity field"
            ci = session["content_integrity"]
            assert "source_type" in ci, "Missing source_type in content_integrity"
            assert "verified" in ci, "Missing verified in content_integrity"
            assert "references_count" in ci, "Missing references_count in content_integrity"
            assert "source_references" in session, "Missing source_references field"
            assert isinstance(session["source_references"], list), "source_references should be a list"
            print(f"PASS: /api/breathwork/sessions returns {len(data)} sessions with content_integrity")

    def test_courses_endpoint_stable(self):
        """GET /api/courses returns items (courses may have different structure)"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"PASS: /api/courses returns {len(data)} courses")
        # Courses may have content_integrity if enriched
        if len(data) > 0:
            course = data[0]
            if "content_integrity" in course:
                ci = course["content_integrity"]
                assert "source_type" in ci, "Missing source_type in content_integrity"
                print(f"  - Course has content_integrity: {ci.get('source_type')}")

    def test_crystals_deep_has_verified_image_metadata(self):
        """GET /api/crystals/deep returns items with verified image metadata"""
        response = requests.get(f"{BASE_URL}/api/crystals/deep")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) > 0, "Expected at least one crystal"
        crystal = data[0]
        assert "image_validation" in crystal, "Missing image_validation field"
        assert "image_source" in crystal, "Missing image_source field"
        print(f"PASS: /api/crystals/deep returns {len(data)} crystals with image metadata")


class TestEndpointStability:
    """Tests that existing endpoints remain stable and return expected data"""

    def test_yoga_poses_returns_data(self):
        """GET /api/yoga/poses returns non-empty list"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected at least one yoga pose"
        pose = data[0]
        assert "id" in pose, "Missing id field"
        assert "name" in pose, "Missing name field"
        print(f"PASS: /api/yoga/poses returns {len(data)} poses")

    def test_mantras_returns_data(self):
        """GET /api/mantras returns non-empty list"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected at least one mantra"
        mantra = data[0]
        assert "id" in mantra, "Missing id field"
        assert "name" in mantra, "Missing name field"
        print(f"PASS: /api/mantras returns {len(data)} mantras")

    def test_mudras_returns_data(self):
        """GET /api/mudras returns non-empty list"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected at least one mudra"
        mudra = data[0]
        assert "id" in mudra, "Missing id field"
        assert "name" in mudra, "Missing name field"
        print(f"PASS: /api/mudras returns {len(data)} mudras")

    def test_sacred_guardians_returns_data(self):
        """GET /api/sacred-guardians returns non-empty list"""
        response = requests.get(f"{BASE_URL}/api/sacred-guardians")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected at least one guardian"
        guardian = data[0]
        assert "id" in guardian, "Missing id field"
        assert "name" in guardian, "Missing name field"
        print(f"PASS: /api/sacred-guardians returns {len(data)} guardians")

    def test_meditations_returns_data(self):
        """GET /api/meditations returns non-empty list"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected at least one meditation"
        meditation = data[0]
        assert "id" in meditation, "Missing id field"
        assert "name" in meditation, "Missing name field"
        print(f"PASS: /api/meditations returns {len(data)} meditations")

    def test_breathwork_sessions_returns_data(self):
        """GET /api/breathwork/sessions returns non-empty list"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0, "Expected at least one breathwork session"
        session = data[0]
        assert "id" in session, "Missing id field"
        assert "name" in session, "Missing name field"
        print(f"PASS: /api/breathwork/sessions returns {len(data)} sessions")

    def test_courses_returns_data(self):
        """GET /api/courses returns list"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"PASS: /api/courses returns {len(data)} courses")


class TestSourceReferencesNormalization:
    """Tests that source_references are properly normalized as URL lists"""

    def test_yoga_poses_source_references_are_urls(self):
        """Yoga poses source_references should be list of valid URLs"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        for pose in data[:5]:  # Check first 5
            refs = pose.get("source_references", [])
            for ref in refs:
                assert ref.startswith("http://") or ref.startswith("https://"), f"Invalid URL: {ref}"
        print("PASS: Yoga poses have properly normalized source_references")

    def test_mantras_source_references_are_urls(self):
        """Mantras source_references should be list of valid URLs"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        for mantra in data[:5]:  # Check first 5
            refs = mantra.get("source_references", [])
            for ref in refs:
                assert ref.startswith("http://") or ref.startswith("https://"), f"Invalid URL: {ref}"
        print("PASS: Mantras have properly normalized source_references")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
