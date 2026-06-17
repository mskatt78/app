"""
Iteration 173 - Playstore Readiness Sanity Tests
Tests high-traffic backend routes after type-hint expansion and i-ching advisory handling.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndHighTrafficRoutes:
    """Test health and high-traffic backend routes"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        print(f"Health check passed: {data}")
    
    def test_books_endpoint(self):
        """Test /api/books returns book list"""
        response = requests.get(f"{BASE_URL}/api/books")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Books endpoint returned {len(data)} books")
    
    def test_sacred_rites_endpoint(self):
        """Test /api/sacred-rites returns sacred rites courses"""
        response = requests.get(f"{BASE_URL}/api/sacred-rites")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Sacred rites endpoint returned {len(data)} rites")


class TestIChingRoutes:
    """Test I-Ching routes after advisory-safe pattern implementation"""
    
    def test_iching_list(self):
        """Test /api/i-ching returns hexagram list"""
        response = requests.get(f"{BASE_URL}/api/i-ching")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify hexagram structure
        hexagram = data[0]
        assert "id" in hexagram or "number" in hexagram
        assert "name" in hexagram
        print(f"I-Ching endpoint returned {len(data)} hexagrams")
    
    def test_iching_cast_coins(self):
        """Test /api/i-ching/cast/coins returns valid hexagram"""
        response = requests.get(f"{BASE_URL}/api/i-ching/cast/coins")
        assert response.status_code == 200
        data = response.json()
        # Verify cast result structure
        assert "number" in data
        assert "name" in data
        assert "judgment" in data or "meaning" in data
        print(f"Cast coins returned hexagram {data['number']}: {data['name']}")
    
    def test_iching_single_hexagram(self):
        """Test /api/i-ching/{number} returns specific hexagram"""
        response = requests.get(f"{BASE_URL}/api/i-ching/1")
        assert response.status_code == 200
        data = response.json()
        assert data["number"] == 1
        assert "name" in data
        print(f"Single hexagram: {data['name']}")


class TestRuneRoutes:
    """Test Rune reading routes"""
    
    def test_runes_list(self):
        """Test /api/runes returns rune list"""
        response = requests.get(f"{BASE_URL}/api/runes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Runes endpoint returned {len(data)} runes")
    
    def test_runes_draw_single(self):
        """Test /api/runes/draw/single returns single rune"""
        response = requests.get(f"{BASE_URL}/api/runes/draw/single")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        print(f"Drew single rune: {data['name']}")
    
    def test_runes_draw_three(self):
        """Test /api/runes/draw/three returns three runes"""
        response = requests.get(f"{BASE_URL}/api/runes/draw/three")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3
        print(f"Drew three runes: {[r['name'] for r in data]}")


class TestExpandScriptRoute:
    """Test content expand-script route with type hints"""
    
    def test_expand_script_basic(self):
        """Test /api/content/expand-script with basic input"""
        payload = {
            "practice_name": "Test Breathwork",
            "steps": ["Inhale deeply", "Hold breath", "Exhale slowly"],
            "use_ai": False
        }
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        assert data["practice_name"] == "Test Breathwork"
        assert "paragraphs" in data
        assert "segments" in data
        assert "word_count" in data
        assert data["word_count"] > 0
        print(f"Expand script returned {data['word_count']} words in {len(data['paragraphs'])} paragraphs")
    
    def test_expand_script_with_element(self):
        """Test expand-script with element parameter"""
        payload = {
            "practice_name": "Fire Meditation",
            "element": "fire",
            "steps": ["Light candle", "Focus on flame", "Breathe with fire"],
            "use_ai": False
        }
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        assert data["practice_name"] == "Fire Meditation"
        assert data["word_count"] > 0
        print(f"Fire element script: {data['word_count']} words")


class TestContentRoutes:
    """Test various content routes for stability"""
    
    def test_yoga_poses(self):
        """Test /api/yoga/poses returns poses"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Yoga poses: {len(data)} poses")
    
    def test_breathwork_sessions(self):
        """Test /api/breathwork/sessions returns sessions"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Breathwork sessions: {len(data)} sessions")
    
    def test_crystals(self):
        """Test /api/crystals returns crystal list"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Crystals: {len(data)} crystals")
    
    def test_mantras(self):
        """Test /api/mantras returns mantra list"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Mantras: {len(data)} mantras")
    
    def test_meditations(self):
        """Test /api/meditations returns meditation list"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Meditations: {len(data)} meditations")


class TestOracleRoutes:
    """Test oracle and tarot routes"""
    
    def test_oracle_cards(self):
        """Test /api/oracle/cards returns card list"""
        response = requests.get(f"{BASE_URL}/api/oracle/cards")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Oracle cards: {len(data)} cards")
    
    def test_tarot_cards(self):
        """Test /api/tarot/cards returns tarot deck"""
        response = requests.get(f"{BASE_URL}/api/tarot/cards")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Tarot cards: {len(data)} cards")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
