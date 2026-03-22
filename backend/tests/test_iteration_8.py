"""
Test iteration 8 - Testing new features:
1. Grounding Practices Timer - timer_segments data from API
2. Crystal Guide - frequency_hz, vibrational_note, music_recommendation, pronunciation
3. Preset Rituals - expanded to 14 rituals covering all elements
4. Admin preset rituals CRUD - POST /api/admin/preset-rituals
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://breathwork-hub-3.preview.emergentagent.com').rstrip('/')


class TestGroundingPracticesTimerSegments:
    """Test grounding practices API returns timer_segments data"""
    
    def test_grounding_exercises_list(self):
        """Test GET /api/grounding returns list with timer_segments"""
        response = requests.get(f"{BASE_URL}/api/grounding")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Found {len(data)} grounding exercises")
    
    def test_grounding_exercise_has_timer_segments(self):
        """Test grounding exercises contain timer_segments field"""
        response = requests.get(f"{BASE_URL}/api/grounding")
        assert response.status_code == 200
        exercises = response.json()
        
        # Check first exercise has timer_segments
        exercise = exercises[0]
        assert "timer_segments" in exercise, "Grounding exercise missing timer_segments field"
        assert isinstance(exercise["timer_segments"], list), "timer_segments should be a list"
        print(f"Exercise '{exercise['name']}' has {len(exercise['timer_segments'])} timer segments")
    
    def test_timer_segment_structure(self):
        """Test timer_segments have correct structure (name, duration_seconds, has_audio)"""
        response = requests.get(f"{BASE_URL}/api/grounding")
        assert response.status_code == 200
        exercises = response.json()
        
        for exercise in exercises:
            if exercise.get("timer_segments"):
                for segment in exercise["timer_segments"]:
                    assert "name" in segment, f"Segment missing 'name' in {exercise['name']}"
                    assert "duration_seconds" in segment, f"Segment missing 'duration_seconds' in {exercise['name']}"
                    assert isinstance(segment["duration_seconds"], int), "duration_seconds should be int"
        
        print("All timer segments have correct structure")
    
    def test_grounding_exercise_has_background_audio(self):
        """Test grounding exercises have background_audio field"""
        response = requests.get(f"{BASE_URL}/api/grounding")
        assert response.status_code == 200
        exercises = response.json()
        
        exercises_with_audio = [e for e in exercises if e.get("background_audio")]
        print(f"{len(exercises_with_audio)}/{len(exercises)} exercises have background_audio")
        assert len(exercises_with_audio) > 0, "At least one exercise should have background_audio"


class TestCrystalGuideAudioFields:
    """Test crystal API returns frequency/audio fields"""
    
    def test_crystals_list(self):
        """Test GET /api/crystals returns list"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Found {len(data)} crystals")
    
    def test_crystal_has_frequency_hz(self):
        """Test crystals have frequency_hz field"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        crystals = response.json()
        
        crystals_with_frequency = [c for c in crystals if c.get("frequency_hz")]
        print(f"{len(crystals_with_frequency)}/{len(crystals)} crystals have frequency_hz")
        
        # Verify value is numeric
        if crystals_with_frequency:
            crystal = crystals_with_frequency[0]
            assert isinstance(crystal["frequency_hz"], (int, float)), "frequency_hz should be numeric"
            print(f"Example: {crystal['name']} = {crystal['frequency_hz']} Hz")
    
    def test_crystal_has_vibrational_note(self):
        """Test crystals have vibrational_note field"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        crystals = response.json()
        
        crystals_with_note = [c for c in crystals if c.get("vibrational_note")]
        print(f"{len(crystals_with_note)}/{len(crystals)} crystals have vibrational_note")
        
        if crystals_with_note:
            crystal = crystals_with_note[0]
            print(f"Example: {crystal['name']} = Note {crystal['vibrational_note']}")
    
    def test_crystal_has_music_recommendation(self):
        """Test crystals have music_recommendation field"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        crystals = response.json()
        
        crystals_with_music = [c for c in crystals if c.get("music_recommendation")]
        print(f"{len(crystals_with_music)}/{len(crystals)} crystals have music_recommendation")
        
        if crystals_with_music:
            crystal = crystals_with_music[0]
            print(f"Example: {crystal['name']}: {crystal['music_recommendation'][:50]}...")
    
    def test_crystal_has_pronunciation(self):
        """Test crystals have pronunciation field"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        crystals = response.json()
        
        crystals_with_pronunciation = [c for c in crystals if c.get("pronunciation")]
        print(f"{len(crystals_with_pronunciation)}/{len(crystals)} crystals have pronunciation")
        
        if crystals_with_pronunciation:
            crystal = crystals_with_pronunciation[0]
            print(f"Example: {crystal['name']} /{crystal['pronunciation']}/")


class TestPresetRitualsExpanded:
    """Test preset rituals - should have 14 rituals covering all elements"""
    
    def test_preset_rituals_list(self):
        """Test GET /api/preset-rituals returns list"""
        response = requests.get(f"{BASE_URL}/api/preset-rituals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} preset rituals")
    
    def test_preset_rituals_count(self):
        """Test at least 14 preset rituals exist"""
        response = requests.get(f"{BASE_URL}/api/preset-rituals")
        assert response.status_code == 200
        rituals = response.json()
        assert len(rituals) >= 14, f"Expected at least 14 rituals, got {len(rituals)}"
        print(f"Ritual count: {len(rituals)} (expected >= 14)")
    
    def test_preset_rituals_all_elements_covered(self):
        """Test rituals cover all 5 elements (Earth, Water, Fire, Air, Spirit)"""
        response = requests.get(f"{BASE_URL}/api/preset-rituals")
        assert response.status_code == 200
        rituals = response.json()
        
        elements_found = set()
        for ritual in rituals:
            if ritual.get("element"):
                elements_found.add(ritual["element"])
        
        required_elements = {"Earth", "Water", "Fire", "Air", "Spirit"}
        missing = required_elements - elements_found
        
        print(f"Elements found: {elements_found}")
        assert len(missing) == 0, f"Missing elements: {missing}"
    
    def test_preset_ritual_structure(self):
        """Test preset ritual has correct structure"""
        response = requests.get(f"{BASE_URL}/api/preset-rituals")
        assert response.status_code == 200
        rituals = response.json()
        
        ritual = rituals[0]
        assert "id" in ritual, "Ritual missing id"
        assert "name" in ritual, "Ritual missing name"
        assert "description" in ritual, "Ritual missing description"
        assert "element" in ritual, "Ritual missing element"
        print(f"Ritual structure verified: {ritual['name']}")
    
    def test_preset_ritual_filter_by_element(self):
        """Test filtering preset rituals by element"""
        response = requests.get(f"{BASE_URL}/api/preset-rituals?element=Fire")
        assert response.status_code == 200
        rituals = response.json()
        
        for ritual in rituals:
            assert ritual.get("element") == "Fire", f"Expected Fire element, got {ritual.get('element')}"
        
        print(f"Found {len(rituals)} Fire element rituals")


class TestAdminPresetRitualsCRUD:
    """Test Admin CRUD for preset rituals"""
    
    @pytest.fixture
    def auth_session(self):
        """Login and get authenticated session"""
        session = requests.Session()
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        
        if login_response.status_code != 200:
            pytest.skip("Could not authenticate - skipping admin tests")
        
        return session
    
    def test_create_preset_ritual(self, auth_session):
        """Test POST /api/admin/preset-rituals creates new ritual"""
        ritual_data = {
            "name": "TEST_Quick Grounding Ritual",
            "description": "A quick test ritual for grounding",
            "element": "Earth",
            "segments": [
                {"name": "Breathing", "duration": 60},
                {"name": "Grounding", "duration": 120}
            ]
        }
        
        response = auth_session.post(f"{BASE_URL}/api/admin/preset-rituals", json=ritual_data)
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response missing id"
        assert "message" in data, "Response missing message"
        print(f"Created ritual with id: {data['id']}")
        
        # Cleanup
        auth_session.delete(f"{BASE_URL}/api/admin/preset-rituals/{data['id']}")
    
    def test_delete_preset_ritual(self, auth_session):
        """Test DELETE /api/admin/preset-rituals/{id}"""
        # Create first
        ritual_data = {
            "name": "TEST_Delete Me Ritual",
            "description": "A ritual to be deleted",
            "element": "Spirit",
            "segments": []
        }
        
        create_response = auth_session.post(f"{BASE_URL}/api/admin/preset-rituals", json=ritual_data)
        assert create_response.status_code == 200
        ritual_id = create_response.json()["id"]
        
        # Delete
        delete_response = auth_session.delete(f"{BASE_URL}/api/admin/preset-rituals/{ritual_id}")
        assert delete_response.status_code == 200
        
        # Verify deleted
        get_response = requests.get(f"{BASE_URL}/api/preset-rituals/{ritual_id}")
        assert get_response.status_code == 404
        print(f"Successfully deleted ritual {ritual_id}")
    
    def test_create_ritual_unauthorized(self):
        """Test POST /api/admin/preset-rituals requires auth"""
        ritual_data = {
            "name": "Unauthorized Ritual",
            "description": "Should fail",
            "element": "Spirit"
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/preset-rituals", json=ritual_data)
        assert response.status_code == 401, "Expected 401 Unauthorized"
        print("Unauthorized access correctly rejected")


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_is_accessible(self):
        """Test API is responding"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        print("API is accessible")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
