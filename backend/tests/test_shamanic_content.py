"""
Tests for new shamanic content API endpoints:
- Elemental Practices (10 expected)
- Earth Altars (6 expected)
- Creative Processes (6 expected)
- Heart Practices (6 expected)
- Shamanic Practices (8 expected)
- Achievements (24 enhanced achievements with unlockables)
- Practice History (log and retrieve)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
SESSION_TOKEN = os.environ.get('TEST_SESSION_TOKEN', '')

@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="module")
def auth_client(api_client):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {SESSION_TOKEN}"})
    return api_client

# ===========================================
# PUBLIC ENDPOINTS (No Auth Required)
# ===========================================

class TestElementalPractices:
    """Test /api/elemental-practices endpoint - should return 10 practices"""
    
    def test_get_all_elemental_practices(self, api_client):
        """GET /api/elemental-practices returns all elemental practices"""
        response = api_client.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 10, f"Expected 10 elemental practices, got {len(data)}"
        
        # Validate structure of first practice
        if data:
            practice = data[0]
            assert "id" in practice
            assert "name" in practice
            assert "element" in practice
            assert "description" in practice
            print(f"✓ Found {len(data)} elemental practices")
    
    def test_filter_by_element_earth(self, api_client):
        """GET /api/elemental-practices?element=Earth returns earth practices"""
        response = api_client.get(f"{BASE_URL}/api/elemental-practices?element=Earth")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        # All returned should have Earth element
        for practice in data:
            assert practice.get("element") == "Earth", f"Expected Earth, got {practice.get('element')}"
        print(f"✓ Earth filter returned {len(data)} practices")


class TestEarthAltars:
    """Test /api/earth-altars endpoint - should return 6 altars"""
    
    def test_get_all_earth_altars(self, api_client):
        """GET /api/earth-altars returns all altar guides"""
        response = api_client.get(f"{BASE_URL}/api/earth-altars")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 6, f"Expected 6 earth altars, got {len(data)}"
        
        # Validate structure
        if data:
            altar = data[0]
            assert "id" in altar
            assert "name" in altar
            assert "element" in altar
            assert "description" in altar
            assert "purpose" in altar
            print(f"✓ Found {len(data)} earth altars")
    
    def test_filter_by_element(self, api_client):
        """GET /api/earth-altars?element=Fire returns fire altars"""
        response = api_client.get(f"{BASE_URL}/api/earth-altars?element=Fire")
        assert response.status_code == 200
        
        data = response.json()
        for altar in data:
            assert altar.get("element") == "Fire"
        print(f"✓ Fire filter returned {len(data)} altars")


class TestCreativeProcesses:
    """Test /api/creative-processes endpoint - should return 6 processes"""
    
    def test_get_all_creative_processes(self, api_client):
        """GET /api/creative-processes returns all creative process guides"""
        response = api_client.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 6, f"Expected 6 creative processes, got {len(data)}"
        
        # Validate structure
        if data:
            process = data[0]
            assert "id" in process
            assert "name" in process
            assert "category" in process
            assert "description" in process
            print(f"✓ Found {len(data)} creative processes")


class TestHeartPractices:
    """Test /api/heart-practices endpoint - should return 6 practices"""
    
    def test_get_all_heart_practices(self, api_client):
        """GET /api/heart-practices returns all heart practices"""
        response = api_client.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 6, f"Expected 6 heart practices, got {len(data)}"
        
        # Validate structure
        if data:
            practice = data[0]
            assert "id" in practice
            assert "name" in practice
            assert "category" in practice
            assert "description" in practice
            print(f"✓ Found {len(data)} heart practices")


class TestShamanicPractices:
    """Test /api/shamanic-practices endpoint - should return 8 practices"""
    
    def test_get_all_shamanic_practices(self, api_client):
        """GET /api/shamanic-practices returns all shamanic practices"""
        response = api_client.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 8, f"Expected 8 shamanic practices, got {len(data)}"
        
        # Validate structure
        if data:
            practice = data[0]
            assert "id" in practice
            assert "name" in practice
            assert "category" in practice
            assert "description" in practice
            print(f"✓ Found {len(data)} shamanic practices")


# ===========================================
# PROTECTED ENDPOINTS (Auth Required)
# ===========================================

class TestAchievements:
    """Test /api/achievements endpoint - requires auth"""
    
    def test_get_achievements_without_auth(self, api_client):
        """GET /api/achievements without auth returns 401"""
        # Use a fresh session without auth
        response = requests.get(f"{BASE_URL}/api/achievements")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ Achievements endpoint correctly requires auth")
    
    def test_get_achievements_with_auth(self, auth_client):
        """GET /api/achievements with auth returns achievements list"""
        response = auth_client.get(f"{BASE_URL}/api/achievements")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "achievements" in data, "Response should have 'achievements' key"
        assert "stats" in data, "Response should have 'stats' key"
        
        achievements = data["achievements"]
        assert isinstance(achievements, list), "Achievements should be a list"
        
        # Check stats structure
        stats = data["stats"]
        assert "total_unlocked" in stats
        assert "total_achievements" in stats
        
        print(f"✓ Found {len(achievements)} achievements, {stats['total_unlocked']} unlocked")
        
        # Verify achievement structure
        if achievements:
            ach = achievements[0]
            assert "id" in ach
            assert "name" in ach
            assert "description" in ach
            assert "unlocked" in ach
            assert "progress" in ach
            assert "target" in ach


class TestPracticeHistory:
    """Test practice history logging and retrieval"""
    
    def test_practice_history_without_auth(self, api_client):
        """Practice history requires auth"""
        response = requests.get(f"{BASE_URL}/api/practice-history")
        assert response.status_code == 401
        print("✓ Practice history correctly requires auth")
    
    def test_log_practice(self, auth_client):
        """POST /api/practice-history logs a new practice"""
        payload = {
            "practice_type": "elemental",
            "practice_id": "1",
            "duration_minutes": 20,
            "notes": "Test elemental practice"
        }
        response = auth_client.post(f"{BASE_URL}/api/practice-history", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "log_id" in data, "Response should have log_id"
        assert data["practice_type"] == "elemental"
        assert data["duration_minutes"] == 20
        print(f"✓ Practice logged with id: {data['log_id']}")
        return data["log_id"]
    
    def test_get_practice_history(self, auth_client):
        """GET /api/practice-history returns user's history"""
        response = auth_client.get(f"{BASE_URL}/api/practice-history")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Found {len(data)} practice history entries")


class TestDetailedStats:
    """Test detailed practice statistics endpoint"""
    
    def test_detailed_stats_without_auth(self, api_client):
        """Detailed stats requires auth"""
        response = requests.get(f"{BASE_URL}/api/practice-history/detailed-stats")
        assert response.status_code == 401
        print("✓ Detailed stats correctly requires auth")
    
    def test_get_detailed_stats(self, auth_client):
        """GET /api/practice-history/detailed-stats returns detailed stats"""
        response = auth_client.get(f"{BASE_URL}/api/practice-history/detailed-stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Validate required fields
        assert "total_sessions" in data
        assert "total_minutes" in data
        assert "total_hours" in data
        assert "current_streak" in data
        assert "by_element" in data
        assert "weekly_data" in data
        
        # Validate by_element has all 5 elements
        by_element = data["by_element"]
        assert "Earth" in by_element
        assert "Water" in by_element
        assert "Fire" in by_element
        assert "Air" in by_element
        assert "Spirit" in by_element
        
        # Validate weekly_data has 7 days
        weekly_data = data["weekly_data"]
        assert len(weekly_data) == 7, f"Expected 7 days in weekly_data, got {len(weekly_data)}"
        
        print(f"✓ Detailed stats: {data['total_sessions']} sessions, {data['total_hours']} hours, {data['current_streak']} streak")


# ===========================================
# SPECIFIC ITEM ENDPOINTS
# ===========================================

class TestSpecificItemEndpoints:
    """Test GET by ID endpoints"""
    
    def test_get_elemental_practice_by_id(self, api_client):
        """GET /api/elemental-practices/1 returns specific practice"""
        response = api_client.get(f"{BASE_URL}/api/elemental-practices/1")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == "1"
        print(f"✓ Got elemental practice: {data['name']}")
    
    def test_get_earth_altar_by_id(self, api_client):
        """GET /api/earth-altars/1 returns specific altar"""
        response = api_client.get(f"{BASE_URL}/api/earth-altars/1")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == "1"
        print(f"✓ Got earth altar: {data['name']}")
    
    def test_get_creative_process_by_id(self, api_client):
        """GET /api/creative-processes/1 returns specific process"""
        response = api_client.get(f"{BASE_URL}/api/creative-processes/1")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == "1"
        print(f"✓ Got creative process: {data['name']}")
    
    def test_get_heart_practice_by_id(self, api_client):
        """GET /api/heart-practices/1 returns specific practice"""
        response = api_client.get(f"{BASE_URL}/api/heart-practices/1")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == "1"
        print(f"✓ Got heart practice: {data['name']}")
    
    def test_get_shamanic_practice_by_id(self, api_client):
        """GET /api/shamanic-practices/1 returns specific practice"""
        response = api_client.get(f"{BASE_URL}/api/shamanic-practices/1")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == "1"
        print(f"✓ Got shamanic practice: {data['name']}")
    
    def test_not_found_returns_404(self, api_client):
        """Non-existent ID returns 404"""
        response = api_client.get(f"{BASE_URL}/api/elemental-practices/999")
        assert response.status_code == 404
        print("✓ Non-existent ID correctly returns 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
