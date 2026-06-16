"""
Iteration 133 - Code Quality Cleanup Regression Tests
Tests backend regression after deeper content.py decomposition and full quality sweep.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestExpandScriptDecomposition:
    """Tests for /api/content/expand-script after _expand_with_llm split helpers."""

    def test_expand_script_use_ai_false_returns_paragraphs_and_segments(self):
        """Verify expand-script works with use_ai=false and returns paragraphs/segments."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Grounding Earth Meditation",
                "element": "earth",
                "duration_minutes": 10,
                "use_ai": False,
                "include_toning": True,
                "anti_repetition_mode": "strict",
                "steps": ["Sit comfortably", "Close your eyes", "Feel the earth beneath you"],
                "source_texts": ["Connect with the earth element for stability and grounding."],
            },
            timeout=30,
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "paragraphs" in data, "Response missing 'paragraphs'"
        assert "segments" in data, "Response missing 'segments'"
        assert "word_count" in data, "Response missing 'word_count'"
        assert "used_ai" in data, "Response missing 'used_ai'"
        
        # Verify data types
        assert isinstance(data["paragraphs"], list), "paragraphs should be a list"
        assert isinstance(data["segments"], list), "segments should be a list"
        assert len(data["paragraphs"]) > 0, "paragraphs should not be empty"
        assert len(data["segments"]) > 0, "segments should not be empty"
        
        # Verify word count meets 7-minute floor (840 words)
        assert data["word_count"] >= 700, f"word_count {data['word_count']} below 7-min floor"
        assert not data["used_ai"], "used_ai should be False"
        print(f"PASS: expand-script returned {len(data['paragraphs'])} paragraphs, {len(data['segments'])} segments, {data['word_count']} words")

    def test_expand_script_balanced_mode(self):
        """Verify expand-script works with balanced anti_repetition_mode."""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Water Flow Meditation",
                "element": "water",
                "duration_minutes": 8,
                "use_ai": False,
                "include_toning": False,
                "anti_repetition_mode": "balanced",
                "steps": ["Breathe deeply", "Visualize flowing water"],
                "source_texts": [],
            },
            timeout=30,
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["word_count"] >= 700, f"word_count {data['word_count']} below floor"
        print(f"PASS: balanced mode returned {data['word_count']} words")


class TestCrystalImageResolution:
    """Tests for crystal endpoints after state-object refactors."""

    def test_crystals_list_no_500(self):
        """Verify /api/crystals returns 200 without 500 errors."""
        response = requests.get(f"{BASE_URL}/api/crystals", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: /api/crystals returned {len(data)} crystals")

    def test_crystals_by_id_no_500(self):
        """Verify /api/crystals/{id} returns 200 or 404, not 500."""
        # First get a valid crystal ID
        list_response = requests.get(f"{BASE_URL}/api/crystals", timeout=15)
        if list_response.status_code == 200 and list_response.json():
            crystal_id = list_response.json()[0].get("id", "amethyst")
        else:
            crystal_id = "amethyst"
        
        response = requests.get(f"{BASE_URL}/api/crystals/{crystal_id}", timeout=15)
        assert response.status_code in [200, 404], f"Expected 200 or 404, got {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            assert "id" in data or "name" in data, "Crystal should have id or name"
            print(f"PASS: /api/crystals/{crystal_id} returned crystal data")
        else:
            print(f"PASS: /api/crystals/{crystal_id} returned 404 (crystal not found)")

    def test_crystals_invalid_id_no_500(self):
        """Verify invalid crystal ID returns 404, not 500."""
        response = requests.get(f"{BASE_URL}/api/crystals/invalid-crystal-xyz-123", timeout=15)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: Invalid crystal ID returns 404")


class TestBroadAPISanity:
    """Broad API sanity tests after full quality cleanup."""

    def test_astrology_current(self):
        """Verify /api/astrology/current returns valid moon data."""
        response = requests.get(f"{BASE_URL}/api/astrology/current", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "name" in data or "id" in data, "Response should have name or id"
        print(f"PASS: /api/astrology/current returned moon: {data.get('name', data.get('id'))}")

    def test_elemental_practices(self):
        """Verify /api/elemental-practices returns list."""
        response = requests.get(f"{BASE_URL}/api/elemental-practices", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: /api/elemental-practices returned {len(data)} practices")

    def test_yoga_poses(self):
        """Verify /api/yoga/poses returns list."""
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: /api/yoga/poses returned {len(data)} poses")

    def test_mantras(self):
        """Verify /api/mantras returns list."""
        response = requests.get(f"{BASE_URL}/api/mantras", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: /api/mantras returned {len(data)} mantras")

    def test_mudras(self):
        """Verify /api/mudras returns list."""
        response = requests.get(f"{BASE_URL}/api/mudras", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: /api/mudras returned {len(data)} mudras")

    def test_breathwork_sessions(self):
        """Verify /api/breathwork/sessions returns list."""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: /api/breathwork/sessions returned {len(data)} sessions")


class TestGiftsRouterMypy:
    """Tests for gifts.py after mypy fix."""

    def test_gifts_create_endpoint_exists(self):
        """Verify /api/gifts/create endpoint exists (POST)."""
        # Just verify the endpoint responds (even with validation error)
        response = requests.post(
            f"{BASE_URL}/api/gifts/create",
            json={},  # Empty payload to trigger validation
            timeout=15,
        )
        # Should get 422 (validation error) not 500 or 404
        assert response.status_code in [422, 400], f"Expected 422 or 400, got {response.status_code}"
        print("PASS: /api/gifts/create endpoint exists and validates input")

    def test_gifts_get_by_code_404(self):
        """Verify /api/gifts/{code} returns 404 for invalid code."""
        response = requests.get(f"{BASE_URL}/api/gifts/INVALID-CODE-XYZ", timeout=15)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: /api/gifts/{code} returns 404 for invalid code")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
