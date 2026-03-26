"""
Comprehensive test for ALL content API endpoints
Tests: meditations, breathwork, shamanic-practices, sound-frequencies, mindfulness, grounding, 
       somatic, heart-practices, creative-processes, elemental-practices, yoga/poses, crystals, mantras, retreats
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestMeditations:
    """GET /api/meditations - should return 6 items with image_url"""
    
    def test_get_meditations(self):
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 6, f"Expected at least 6 meditations, got {len(data)}"
        # Check first item has required fields
        if data:
            item = data[0]
            assert "id" in item, "Meditation should have id"
            assert "name" in item, "Meditation should have name"
            assert "image_url" in item, "Meditation should have image_url"
            print(f"✓ Meditations: {len(data)} items, first has image_url: {item.get('image_url', 'N/A')[:50]}...")


class TestBreathwork:
    """GET /api/breathwork/sessions - should return 6 items with image_url"""
    
    def test_get_breathwork_sessions(self):
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 6, f"Expected at least 6 breathwork sessions, got {len(data)}"
        if data:
            item = data[0]
            assert "id" in item, "Session should have id"
            assert "name" in item, "Session should have name"
            assert "image_url" in item, "Session should have image_url"
            assert "pattern" in item, "Session should have pattern"
            print(f"✓ Breathwork: {len(data)} items, first has image_url: {item.get('image_url', 'N/A')[:50]}...")


class TestShamanicPractices:
    """GET /api/shamanic-practices - should return 21 items with image_url"""
    
    def test_get_shamanic_practices(self):
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 21, f"Expected at least 21 shamanic practices, got {len(data)}"
        if data:
            item = data[0]
            assert "id" in item, "Practice should have id"
            assert "name" in item, "Practice should have name"
            assert "image_url" in item, "Practice should have image_url"
            print(f"✓ Shamanic Practices: {len(data)} items, first has image_url: {item.get('image_url', 'N/A')[:50]}...")


class TestSoundFrequencies:
    """GET /api/sound-frequencies - should return 12 items with image_url and ambient_type"""
    
    def test_get_sound_frequencies(self):
        response = requests.get(f"{BASE_URL}/api/sound-frequencies")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 12, f"Expected at least 12 sound frequencies, got {len(data)}"
        if data:
            item = data[0]
            assert "id" in item, "Frequency should have id"
            assert "name" in item, "Frequency should have name"
            assert "image_url" in item, "Frequency should have image_url"
            assert "ambient_type" in item, f"Frequency should have ambient_type, got keys: {list(item.keys())}"
            print(f"✓ Sound Frequencies: {len(data)} items, first ambient_type: {item.get('ambient_type', 'N/A')}")


class TestMindfulness:
    """GET /api/mindfulness - should return 8 items with image_url"""
    
    def test_get_mindfulness_practices(self):
        response = requests.get(f"{BASE_URL}/api/mindfulness")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 8, f"Expected at least 8 mindfulness practices, got {len(data)}"
        if data:
            item = data[0]
            assert "id" in item, "Practice should have id"
            assert "name" in item, "Practice should have name"
            assert "image_url" in item, "Practice should have image_url"
            print(f"✓ Mindfulness: {len(data)} items, first has image_url: {item.get('image_url', 'N/A')[:50]}...")


class TestGrounding:
    """GET /api/grounding - should return 8 items with image_url, background_audio, timer_segments"""
    
    def test_get_grounding_exercises(self):
        response = requests.get(f"{BASE_URL}/api/grounding")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 8, f"Expected at least 8 grounding exercises, got {len(data)}"
        if data:
            item = data[0]
            assert "id" in item, "Exercise should have id"
            assert "name" in item, "Exercise should have name"
            assert "image_url" in item, "Exercise should have image_url"
            assert "background_audio" in item, f"Exercise should have background_audio, got keys: {list(item.keys())}"
            assert "timer_segments" in item, f"Exercise should have timer_segments, got keys: {list(item.keys())}"
            print(f"✓ Grounding: {len(data)} items, first has background_audio: {item.get('background_audio', 'N/A')}")


class TestSomatic:
    """GET /api/somatic - should return 39 items with image_url and instructions"""
    
    def test_get_somatic_practices(self):
        response = requests.get(f"{BASE_URL}/api/somatic")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 6, f"Expected at least 6 somatic practices, got {len(data)}"
        if data:
            item = data[0]
            assert "id" in item, "Practice should have id"
            assert "name" in item, "Practice should have name"
            assert "image_url" in item, "Practice should have image_url"
            assert "instructions" in item, f"Practice should have instructions, got keys: {list(item.keys())}"
            print(f"✓ Somatic: {len(data)} items, first has image_url: {item.get('image_url', 'N/A')[:50]}...")


class TestHeartPractices:
    """GET /api/heart-practices - should return 10 items with image_url"""
    
    def test_get_heart_practices(self):
        response = requests.get(f"{BASE_URL}/api/heart-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 10, f"Expected at least 10 heart practices, got {len(data)}"
        if data:
            item = data[0]
            assert "id" in item, "Practice should have id"
            assert "name" in item, "Practice should have name"
            assert "image_url" in item, "Practice should have image_url"
            print(f"✓ Heart Practices: {len(data)} items, first has image_url: {item.get('image_url', 'N/A')[:50]}...")


class TestCreativeProcesses:
    """GET /api/creative-processes - should return items"""
    
    def test_get_creative_processes(self):
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Creative Processes: {len(data)} items")


class TestElementalPractices:
    """GET /api/elemental-practices - should return 15 items with image_url"""
    
    def test_get_elemental_practices(self):
        response = requests.get(f"{BASE_URL}/api/elemental-practices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 15, f"Expected at least 15 elemental practices, got {len(data)}"
        if data:
            item = data[0]
            assert "id" in item, "Practice should have id"
            assert "name" in item, "Practice should have name"
            assert "image_url" in item, "Practice should have image_url"
            print(f"✓ Elemental Practices: {len(data)} items, first has image_url: {item.get('image_url', 'N/A')[:50]}...")


class TestYogaPoses:
    """GET /api/yoga/poses - should return 78 items"""
    
    def test_get_yoga_poses(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 78, f"Expected at least 78 yoga poses, got {len(data)}"
        if data:
            item = data[0]
            assert "id" in item, "Pose should have id"
            assert "name" in item, "Pose should have name"
            print(f"✓ Yoga Poses: {len(data)} items")


class TestCrystals:
    """GET /api/crystals - should return 42 items"""
    
    def test_get_crystals(self):
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 42, f"Expected at least 42 crystals, got {len(data)}"
        if data:
            item = data[0]
            assert "id" in item, "Crystal should have id"
            assert "name" in item, "Crystal should have name"
            print(f"✓ Crystals: {len(data)} items")


class TestMantras:
    """GET /api/mantras - should return 12 items"""
    
    def test_get_mantras(self):
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 12, f"Expected at least 12 mantras, got {len(data)}"
        if data:
            item = data[0]
            assert "id" in item, "Mantra should have id"
            assert "name" in item, "Mantra should have name"
            print(f"✓ Mantras: {len(data)} items")


class TestRetreats:
    """GET /api/retreats - should return 3 items"""
    
    def test_get_retreats(self):
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 3, f"Expected at least 3 retreats, got {len(data)}"
        if data:
            item = data[0]
            assert "id" in item, "Retreat should have id"
            assert "name" in item, "Retreat should have name"
            print(f"✓ Retreats: {len(data)} items")


class TestTTSMeditationPart:
    """POST /api/tts/meditation/{id}?part=1 - should return audio_base64"""
    
    def test_tts_meditation_part1(self):
        """Test TTS Part 1 returns audio (takes ~20s)"""
        response = requests.post(
            f"{BASE_URL}/api/tts/meditation/1",
            params={"voice": "nova", "part": 1},
            timeout=60
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "audio_base64" in data, "Response should have audio_base64"
        assert len(data["audio_base64"]) > 1000, "audio_base64 should be substantial"
        print(f"✓ TTS Meditation Part 1: audio_base64 length = {len(data['audio_base64'])}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
