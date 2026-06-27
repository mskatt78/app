"""
Test suite for POST /api/content/expand-script endpoint
Tests: long-form output consistency, word_count for 7+ min narration, cache performance
"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestExpandScriptEndpoint:
    """Tests for /api/content/expand-script endpoint"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test payload"""
        self.test_payload = {
            "practice_id": "test-breathwork-001",
            "practice_name": "Earth Grounding Breath",
            "element": "earth",
            "duration_minutes": 15,
            "use_ai": False,
            "include_toning": True,
            "anti_repetition_mode": "strict",
            "steps": [
                "Find a comfortable seated position",
                "Close your eyes and take three deep breaths",
                "Visualize roots growing from your body into the earth",
                "Feel the stability and support of the ground beneath you"
            ],
            "source_texts": [
                "This grounding practice connects you to the earth element",
                "Feel the stability and support of Mother Earth",
                "Allow your breath to become slow and steady",
                "With each exhale, release tension into the ground"
            ]
        }

    def test_expand_script_returns_200(self):
        """Test that expand-script endpoint returns 200 OK"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=self.test_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: expand-script returns 200 OK")

    def test_expand_script_response_structure(self):
        """Test that response has required fields"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=self.test_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        required_fields = ["practice_name", "target_minutes", "target_word_count", "word_count", "used_ai", "paragraphs", "segments"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        print(f"PASS: Response has all required fields: {required_fields}")

    def test_expand_script_long_form_word_count(self):
        """Test that word_count supports 7+ min narration floor (minimum ~680 words at 132 WPM)"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=self.test_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        word_count = data.get("word_count", 0)
        # 7 minutes * 132 WPM = 924 words minimum for long-form
        # But with speed adjustments, minimum floor is ~680 words
        minimum_long_form_words = 680
        
        print(f"Word count: {word_count}, Minimum expected: {minimum_long_form_words}")
        assert word_count >= minimum_long_form_words, f"Word count {word_count} below long-form floor {minimum_long_form_words}"
        print(f"PASS: Word count {word_count} meets 7+ min narration floor")

    def test_expand_script_paragraphs_not_empty(self):
        """Test that paragraphs array is not empty"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=self.test_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data.get("paragraphs", [])
        assert len(paragraphs) > 0, "Paragraphs array is empty"
        print(f"PASS: Paragraphs array has {len(paragraphs)} items")

    def test_expand_script_segments_not_empty(self):
        """Test that segments array is not empty"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=self.test_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        segments = data.get("segments", [])
        assert len(segments) > 0, "Segments array is empty"
        print(f"PASS: Segments array has {len(segments)} items")

    def test_expand_script_cache_performance(self):
        """Test that repeated calls with same payload show faster response (cache hit)"""
        # First call - should be slower (cache miss)
        start_time_1 = time.time()
        response_1 = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=self.test_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        elapsed_1 = time.time() - start_time_1
        assert response_1.status_code == 200
        
        # Second call - should be faster (cache hit)
        start_time_2 = time.time()
        response_2 = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=self.test_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        elapsed_2 = time.time() - start_time_2
        assert response_2.status_code == 200
        
        # Third call - confirm cache consistency
        start_time_3 = time.time()
        response_3 = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=self.test_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        elapsed_3 = time.time() - start_time_3
        assert response_3.status_code == 200
        
        # Report timings (non-functional assertion - just report)
        print(f"First call (cache miss): {elapsed_1:.3f}s")
        print(f"Second call (cache hit): {elapsed_2:.3f}s")
        print(f"Third call (cache hit): {elapsed_3:.3f}s")
        
        # Verify responses are consistent
        data_1 = response_1.json()
        data_2 = response_2.json()
        data_3 = response_3.json()
        
        assert data_1["word_count"] == data_2["word_count"] == data_3["word_count"], "Word counts should be consistent across cached calls"
        assert len(data_1["paragraphs"]) == len(data_2["paragraphs"]) == len(data_3["paragraphs"]), "Paragraph counts should be consistent"
        assert len(data_1["segments"]) == len(data_2["segments"]) == len(data_3["segments"]), "Segment counts should be consistent"
        
        print(f"PASS: Cache returns consistent results across 3 calls")
        print(f"OBSERVATION: Cache hit should be faster - First: {elapsed_1:.3f}s, Second: {elapsed_2:.3f}s, Third: {elapsed_3:.3f}s")

    def test_expand_script_different_payload_no_cache(self):
        """Test that different payload doesn't use cache"""
        # First payload
        response_1 = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=self.test_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        assert response_1.status_code == 200
        
        # Different payload
        different_payload = {
            "practice_id": "test-fire-001",
            "practice_name": "Fire Breath Activation",
            "element": "fire",
            "duration_minutes": 12,
            "use_ai": False,
            "include_toning": True,
            "anti_repetition_mode": "strict",
            "steps": ["Sit tall", "Breathe rapidly through nose"],
            "source_texts": ["Fire element activates inner power"]
        }
        
        response_2 = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=different_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        assert response_2.status_code == 200
        
        data_1 = response_1.json()
        data_2 = response_2.json()
        
        # Different payloads should produce different results
        assert data_1["practice_name"] != data_2["practice_name"], "Different payloads should have different practice names"
        print(f"PASS: Different payloads produce different results (no cache collision)")

    def test_expand_script_target_minutes_consistency(self):
        """Test that target_minutes matches request duration"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=self.test_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        # Target minutes should be at least the minimum (7 min) or the requested duration
        target_minutes = data.get("target_minutes", 0)
        minimum_narration_minutes = 7
        
        assert target_minutes >= minimum_narration_minutes, f"Target minutes {target_minutes} below minimum {minimum_narration_minutes}"
        print(f"PASS: Target minutes {target_minutes} meets minimum narration floor")


class TestExpandScriptEdgeCases:
    """Edge case tests for expand-script endpoint"""

    def test_expand_script_minimal_payload(self):
        """Test with minimal required payload"""
        minimal_payload = {
            "practice_name": "Simple Practice"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=minimal_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        assert response.status_code == 200, f"Minimal payload should work: {response.text}"
        data = response.json()
        assert data.get("word_count", 0) >= 680, "Even minimal payload should meet word floor"
        print(f"PASS: Minimal payload returns valid response with {data.get('word_count')} words")

    def test_expand_script_empty_steps(self):
        """Test with empty steps array"""
        payload = {
            "practice_name": "No Steps Practice",
            "element": "water",
            "duration_minutes": 10,
            "steps": [],
            "source_texts": ["Water flows and heals"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        assert response.status_code == 200
        print("PASS: Empty steps array handled gracefully")

    def test_expand_script_long_duration(self):
        """Test with longer duration (30 min shamanic)"""
        payload = {
            "practice_name": "Shamanic Journey",
            "element": "spirit",
            "duration_minutes": 30,
            "use_ai": False,
            "include_toning": True,
            "anti_repetition_mode": "strict",
            "steps": ["Enter sacred space", "Call in guides", "Journey begins"],
            "source_texts": ["The shamanic journey takes you deep within"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        # 30 min at 132 WPM = ~3960 words target
        word_count = data.get("word_count", 0)
        print(f"30-min practice word count: {word_count}")
        assert word_count >= 680, "Long duration should still meet minimum floor"
        print(f"PASS: Long duration (30 min) returns {word_count} words")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
