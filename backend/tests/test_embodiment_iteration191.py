"""
Iteration 191 - Backend Tests for Embodiment Protocol and Retreats Cleanup
Tests:
1. Retreats cleanup - /api/retreats returns empty (no seeded placeholders)
2. Content expand-script - returns >= 840 words for 7+ minute narration
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestRetreatsCleanup:
    """Verify retreats cleanup is effective - no seeded placeholders"""
    
    def test_retreats_returns_empty(self):
        """Retreats endpoint should return empty array after cleanup"""
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) == 0, f"Expected empty retreats, got {len(data)} items"
        print(f"✓ Retreats cleanup verified - 0 placeholder retreats")


class TestExpandScript:
    """Verify expand-script endpoint returns long-form output for narration integrity"""
    
    def test_expand_script_7_minute_narration(self):
        """Expand-script should return >= 840 words for 7+ minute narration"""
        payload = {
            "script": "Welcome to this sacred practice. Begin by grounding yourself. Feel your feet on the earth. Breathe deeply.",
            "target_duration_minutes": 7,
            "practice_name": "Grounding Meditation"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "word_count" in data, "Response should include word_count"
        assert "paragraphs" in data, "Response should include paragraphs"
        assert "segments" in data, "Response should include segments"
        
        word_count = data.get("word_count", 0)
        assert word_count >= 840, f"Expected >= 840 words for 7-min narration, got {word_count}"
        print(f"✓ Expand-script returned {word_count} words (>= 840 floor)")
    
    def test_expand_script_10_minute_narration(self):
        """Expand-script should return substantial content for 10+ minute narration"""
        payload = {
            "script": "Welcome to this shamanic journey. Close your eyes and breathe.",
            "target_duration_minutes": 10,
            "practice_name": "Shamanic Journey"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        word_count = data.get("word_count", 0)
        # Note: expand-script has a 1000 word cap, but should still return substantial content
        assert word_count >= 840, f"Expected >= 840 words for 10-min narration, got {word_count}"
        print(f"✓ Expand-script returned {word_count} words for 10-min narration (capped at 1000)")


class TestHealthCheck:
    """Basic health check"""
    
    def test_api_health(self):
        """API should be healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"✓ API health check passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
