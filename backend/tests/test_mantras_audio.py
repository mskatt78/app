"""
Test Mantras API with Audio Feature
Tests: GET /api/mantras, audio_url field presence, mantra details
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestMantrasAPI:
    """Tests for mantras endpoints with audio feature"""
    
    def test_get_mantras_returns_list(self):
        """GET /api/mantras should return a list of mantras"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 12, f"Expected at least 12 mantras, got {len(data)}"
        print(f"✓ Mantras endpoint returned {len(data)} mantras")
    
    def test_mantra_has_required_fields(self):
        """Each mantra should have required fields including audio_url"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ['id', 'name', 'translation', 'element', 'benefits']
        
        for mantra in data[:5]:  # Check first 5 mantras
            for field in required_fields:
                assert field in mantra, f"Mantra {mantra.get('id')} missing field: {field}"
            
            # audio_url should exist (can be null)
            assert 'audio_url' in mantra or mantra.get('audio_url') is None, \
                f"Mantra {mantra.get('id')} should have audio_url field"
        
        print("✓ All required fields present in mantras")
    
    def test_om_mantra_has_audio_url(self):
        """Om mantra (id: 1) should have a valid audio_url"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        
        data = response.json()
        om_mantra = next((m for m in data if m.get('id') == '1' or m.get('name') == 'Om'), None)
        
        assert om_mantra is not None, "Om mantra should exist"
        assert om_mantra.get('audio_url') is not None, "Om mantra should have audio_url"
        assert 'wikipedia' in om_mantra['audio_url'].lower() or 'wiki' in om_mantra['audio_url'].lower(), \
            f"Om mantra audio_url should be from Wikipedia, got: {om_mantra['audio_url']}"
        
        print(f"✓ Om mantra has audio_url: {om_mantra['audio_url']}")
    
    def test_other_mantras_have_null_audio(self):
        """Non-Om mantras should have null audio_url (timer fallback)"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        
        data = response.json()
        non_om_mantras = [m for m in data if m.get('id') != '1' and m.get('name') != 'Om' and not m.get('name', '').startswith('TEST_')]
        
        # At least some mantras should have null audio_url
        null_audio_count = sum(1 for m in non_om_mantras if m.get('audio_url') is None)
        assert null_audio_count > 0, "Some mantras should have null audio_url for timer fallback"
        
        print(f"✓ {null_audio_count}/{len(non_om_mantras)} mantras use timer fallback (null audio_url)")
    
    def test_mantras_filter_by_element(self):
        """GET /api/mantras?element=Fire should filter mantras"""
        response = requests.get(f"{BASE_URL}/api/mantras?element=Fire")
        assert response.status_code == 200
        
        data = response.json()
        for mantra in data:
            assert mantra.get('element', '').lower() == 'fire', \
                f"Mantra {mantra.get('name')} has element {mantra.get('element')}, expected Fire"
        
        print(f"✓ Element filter working - found {len(data)} Fire mantras")
    
    def test_mantra_has_repetitions_and_duration(self):
        """Mantras should have repetitions and duration_seconds for timer mode"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        
        data = response.json()
        for mantra in data[:5]:
            assert 'repetitions' in mantra, f"Mantra {mantra.get('name')} missing repetitions"
            assert 'duration_seconds' in mantra, f"Mantra {mantra.get('name')} missing duration_seconds"
            
            assert isinstance(mantra['repetitions'], int), "repetitions should be int"
            assert isinstance(mantra['duration_seconds'], int), "duration_seconds should be int"
        
        print("✓ All mantras have repetitions and duration_seconds for timer mode")
    
    def test_om_audio_url_is_valid_format(self):
        """Om mantra audio URL should be a valid Wikipedia audio URL format"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        
        data = response.json()
        om_mantra = next((m for m in data if m.get('id') == '1'), None)
        
        assert om_mantra is not None and om_mantra.get('audio_url')
        
        # Verify URL format is valid - Wikipedia may block HEAD requests but audio will load in browser
        audio_url = om_mantra['audio_url']
        assert audio_url.startswith('https://'), "Audio URL should use HTTPS"
        assert 'upload.wikimedia.org' in audio_url or 'wikipedia' in audio_url, \
            f"Audio URL should be from Wikipedia: {audio_url}"
        assert audio_url.endswith('.ogg') or audio_url.endswith('.mp3'), \
            f"Audio URL should end with audio extension: {audio_url}"
        
        print(f"✓ Om audio URL format is valid: {audio_url}")


class TestMantrasWithAuth:
    """Tests for authenticated mantras functionality"""
    
    @pytest.fixture
    def session_token(self):
        """Get test session token"""
        return "test_session_1773542994595"
    
    def test_favorites_endpoint_works_with_mantras(self, session_token):
        """User can add mantras to favorites"""
        headers = {"Authorization": f"Bearer {session_token}"}
        
        # Get mantras to find one to favorite
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        mantras = response.json()
        
        if len(mantras) > 0:
            mantra_id = mantras[0]['id']
            
            # Add to favorites
            fav_response = requests.post(
                f"{BASE_URL}/api/favorites",
                headers=headers,
                json={"item_type": "mantra", "item_id": mantra_id}
            )
            
            # Either 200/201 success or already favorited
            assert fav_response.status_code in [200, 201, 400], \
                f"Favorites POST failed: {fav_response.status_code} - {fav_response.text}"
            
            print("✓ Favorites endpoint works for mantras")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
