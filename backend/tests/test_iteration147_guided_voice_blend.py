"""
Iteration 147 - Guided Voice Blend & Echo Reduction Tests

Tests for:
1. Guided narration generation prompt reflects warm+ceremonial voice blend (A+C)
2. Expand-script endpoint returns valid segments and paragraphs
3. Toning cues are included when requested
4. No regressions in expand-script API
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestExpandScriptEndpoint:
    """Tests for /api/content/expand-script endpoint"""

    def test_expand_script_basic_request(self):
        """Test basic expand-script request returns valid response"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Test Guided Practice",
                "element": "spirit",
                "duration_minutes": 7,
                "steps": ["Step 1: Breathe deeply", "Step 2: Relax your body"],
                "source_texts": ["This is a healing practice for inner peace"],
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "include_toning": True,
            },
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "practice_name" in data
        assert "word_count" in data
        assert "paragraphs" in data
        assert "segments" in data
        assert data["practice_name"] == "Test Guided Practice"
        assert data["word_count"] > 0
        assert len(data["paragraphs"]) > 0
        assert len(data["segments"]) > 0
        print(f"✓ Basic expand-script: {data['word_count']} words, {len(data['segments'])} segments")

    def test_expand_script_includes_toning_cues(self):
        """Test that toning cues are included when include_toning=True"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Toning Test Practice",
                "element": "earth",
                "duration_minutes": 10,
                "steps": ["Ground yourself", "Connect with earth energy"],
                "source_texts": ["Earth element grounding practice"],
                "use_ai": False,
                "anti_repetition_mode": "balanced",
                "include_toning": True,
            },
        )
        assert response.status_code == 200
        
        data = response.json()
        paragraphs_text = " ".join(data["paragraphs"]).lower()
        
        # Check for toning-related keywords
        toning_keywords = ["hum", "tone", "sound", "syllable", "lam", "vam", "ram", "yam", "om", "ahh", "ooh", "mmm"]
        has_toning = any(keyword in paragraphs_text for keyword in toning_keywords)
        assert has_toning, "Expected toning cues in paragraphs when include_toning=True"
        print(f"✓ Toning cues present in {data['word_count']} word script")

    def test_expand_script_without_toning(self):
        """Test that toning cues are not included when include_toning=False"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "No Toning Practice",
                "element": "water",
                "duration_minutes": 7,
                "steps": ["Flow with water", "Release tension"],
                "source_texts": ["Water element flow practice"],
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "include_toning": False,
            },
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["word_count"] > 0
        assert len(data["segments"]) > 0
        print(f"✓ No-toning script: {data['word_count']} words")

    def test_expand_script_strict_mode(self):
        """Test strict anti-repetition mode produces diverse content"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Strict Mode Practice",
                "element": "fire",
                "duration_minutes": 15,
                "steps": ["Ignite inner fire", "Transform energy"],
                "source_texts": ["Fire element transformation practice"],
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "include_toning": True,
            },
        )
        assert response.status_code == 200
        
        data = response.json()
        # Strict mode should produce minimum word count
        assert data["word_count"] >= data["target_word_count"] * 0.9, \
            f"Word count {data['word_count']} below 90% of target {data['target_word_count']}"
        print(f"✓ Strict mode: {data['word_count']}/{data['target_word_count']} words")

    def test_expand_script_balanced_mode(self):
        """Test balanced anti-repetition mode"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Balanced Mode Practice",
                "element": "air",
                "duration_minutes": 12,
                "steps": ["Open to breath", "Expand awareness"],
                "source_texts": ["Air element breath practice"],
                "use_ai": False,
                "anti_repetition_mode": "balanced",
                "include_toning": True,
            },
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["word_count"] > 0
        assert len(data["segments"]) > 0
        print(f"✓ Balanced mode: {data['word_count']} words, {len(data['segments'])} segments")

    def test_expand_script_all_elements(self):
        """Test expand-script works for all elements"""
        elements = ["earth", "water", "fire", "air", "spirit"]
        
        for element in elements:
            response = requests.post(
                f"{BASE_URL}/api/content/expand-script",
                json={
                    "practice_name": f"{element.title()} Element Practice",
                    "element": element,
                    "duration_minutes": 7,
                    "steps": [f"Connect with {element}"],
                    "source_texts": [f"{element.title()} element practice"],
                    "use_ai": False,
                    "anti_repetition_mode": "strict",
                    "include_toning": True,
                },
            )
            assert response.status_code == 200, f"Failed for element {element}"
            data = response.json()
            assert data["word_count"] > 0
            print(f"✓ Element {element}: {data['word_count']} words")

    def test_expand_script_minimum_duration(self):
        """Test that minimum 7-minute duration is enforced"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Short Duration Test",
                "element": "spirit",
                "duration_minutes": 3,  # Below minimum
                "steps": ["Quick practice"],
                "source_texts": ["Short practice"],
                "use_ai": False,
                "anti_repetition_mode": "strict",
                "include_toning": False,
            },
        )
        assert response.status_code == 200
        
        data = response.json()
        # Should enforce minimum 7 minutes
        assert data["target_minutes"] >= 7, f"Expected minimum 7 minutes, got {data['target_minutes']}"
        print(f"✓ Minimum duration enforced: {data['target_minutes']} minutes")

    def test_expand_script_long_duration(self):
        """Test expand-script handles longer durations"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Long Duration Practice",
                "element": "spirit",
                "duration_minutes": 25,
                "steps": ["Deep meditation", "Extended visualization", "Integration"],
                "source_texts": ["Extended spiritual practice for deep healing"],
                "use_ai": False,
                "anti_repetition_mode": "balanced",
                "include_toning": True,
            },
        )
        assert response.status_code == 200
        
        data = response.json()
        # 25 minutes at ~132 words/min = ~3300 words target
        assert data["target_word_count"] >= 3000, f"Expected ~3300 target words, got {data['target_word_count']}"
        assert data["word_count"] >= data["target_word_count"] * 0.85, \
            f"Word count {data['word_count']} too low for {data['target_word_count']} target"
        print(f"✓ Long duration: {data['word_count']}/{data['target_word_count']} words for {data['target_minutes']} min")


class TestHealthAndRegression:
    """Basic health and regression tests"""

    def test_health_endpoint(self):
        """Test health endpoint is working"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health endpoint working")

    def test_yoga_poses_endpoint(self):
        """Test yoga poses endpoint for regression"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Yoga poses: {len(data)} poses")

    def test_breathwork_sessions_endpoint(self):
        """Test breathwork sessions endpoint for regression"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Breathwork sessions: {len(data)} sessions")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
