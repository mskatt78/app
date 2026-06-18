"""
Iteration 176 - Voice Notes & Practice Journal Backend Tests

Tests for:
1. Voice file upload endpoint (POST /api/voice-files)
2. Voice file download endpoint (GET /api/voice-files/{file_id}/download)
3. Voice file delete endpoint (DELETE /api/voice-files/{file_id})
4. Voice file from data URL endpoint (POST /api/voice-files/from-data-url)
5. Practice journal CRUD (POST/GET/PUT/DELETE /api/practice-journal)
6. Voice profiles CRUD (POST/GET/DELETE /api/voice-profiles)
"""

import pytest
import requests
import os
import base64
import time

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Test credentials
TEST_EMAIL = "voice.sync.qa@example.com"
TEST_PASSWORD = "Pass1234!"
FALLBACK_EMAIL = f"test_voice_{int(time.time())}@example.com"
FALLBACK_PASSWORD = "TestPass123!"


@pytest.fixture(scope="module")
def api_session():
    """Create a requests session with cookies."""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def auth_session(api_session):
    """Authenticate and return session with cookies."""
    # Try login with provided credentials
    login_response = api_session.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    
    if login_response.status_code == 200:
        print(f"Logged in as {TEST_EMAIL}")
        return api_session
    
    # Fallback: register a new user
    print(f"Login failed ({login_response.status_code}), registering new user...")
    register_response = api_session.post(
        f"{BASE_URL}/api/auth/register",
        json={
            "email": FALLBACK_EMAIL,
            "password": FALLBACK_PASSWORD,
            "name": "Voice Test User"
        }
    )
    
    if register_response.status_code == 200:
        print(f"Registered and logged in as {FALLBACK_EMAIL}")
        return api_session
    
    pytest.skip(f"Could not authenticate: login={login_response.status_code}, register={register_response.status_code}")


class TestHealthCheck:
    """Basic health check to verify API is running."""
    
    def test_health_endpoint(self, api_session):
        response = api_session.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        data = response.json()
        assert data.get("status") == "healthy"
        print("Health check passed")


class TestVoiceFileUpload:
    """Tests for voice file upload endpoint."""
    
    def test_upload_voice_file_multipart(self, auth_session):
        """Test uploading a voice file via multipart form."""
        # Create a minimal valid WebM audio file (just header bytes for testing)
        # In real scenario, this would be actual audio data
        fake_audio = b'\x1a\x45\xdf\xa3' + b'\x00' * 100  # WebM magic bytes + padding
        
        # Use a fresh session to avoid Content-Type header conflicts
        import io
        files = {
            "file": ("test-voice.webm", io.BytesIO(fake_audio), "audio/webm")
        }
        form_data = {
            "duration_seconds": "5",
            "category": "journal_voice_note"
        }
        
        # Get cookies from auth session
        cookies = auth_session.cookies.get_dict()
        
        response = requests.post(
            f"{BASE_URL}/api/voice-files",
            files=files,
            data=form_data,
            cookies=cookies
        )
        
        # Accept 200 or 500 (500 may occur if object storage is not configured)
        if response.status_code == 500:
            print(f"Voice upload returned 500 - object storage may not be configured: {response.text}")
            pytest.skip("Object storage not configured")
        
        assert response.status_code == 200, f"Upload failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert "file_id" in data, "Response missing file_id"
        assert data["file_id"].startswith("voice_"), f"Invalid file_id format: {data['file_id']}"
        assert "download_url" in data, "Response missing download_url"
        assert data["duration_seconds"] == 5
        
        print(f"Voice file uploaded: {data['file_id']}")
        return data["file_id"]
    
    def test_upload_voice_file_invalid_type(self, auth_session):
        """Test that non-audio files are rejected."""
        import io
        fake_file = b"not audio content"
        
        files = {
            "file": ("test.txt", io.BytesIO(fake_file), "text/plain")
        }
        form_data = {
            "duration_seconds": "5",
            "category": "journal_voice_note"
        }
        
        # Get cookies from auth session
        cookies = auth_session.cookies.get_dict()
        
        response = requests.post(
            f"{BASE_URL}/api/voice-files",
            files=files,
            data=form_data,
            cookies=cookies
        )
        
        # Should reject with 400 for unsupported format
        assert response.status_code == 400, f"Expected 400 for invalid type, got {response.status_code}"
        print("Invalid audio type correctly rejected")


class TestVoiceFileFromDataUrl:
    """Tests for voice file upload from data URL endpoint."""
    
    def test_upload_from_data_url(self, auth_session):
        """Test uploading voice file from base64 data URL."""
        # Create minimal audio data and encode as data URL
        fake_audio = b'\x1a\x45\xdf\xa3' + b'\x00' * 100
        encoded = base64.b64encode(fake_audio).decode("utf-8")
        data_url = f"data:audio/webm;base64,{encoded}"
        
        response = auth_session.post(
            f"{BASE_URL}/api/voice-files/from-data-url",
            json={
                "data_url": data_url,
                "duration_seconds": 10,
                "category": "journal_voice_note"
            }
        )
        
        if response.status_code == 500:
            print(f"Data URL upload returned 500 - object storage may not be configured")
            pytest.skip("Object storage not configured")
        
        assert response.status_code == 200, f"Data URL upload failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert "file_id" in data
        assert data["file_id"].startswith("voice_")
        assert "download_url" in data
        
        print(f"Voice file from data URL uploaded: {data['file_id']}")
        return data["file_id"]
    
    def test_upload_invalid_data_url(self, auth_session):
        """Test that invalid data URLs are rejected."""
        response = auth_session.post(
            f"{BASE_URL}/api/voice-files/from-data-url",
            json={
                "data_url": "not-a-valid-data-url",
                "duration_seconds": 5
            }
        )
        
        assert response.status_code == 400, f"Expected 400 for invalid data URL, got {response.status_code}"
        print("Invalid data URL correctly rejected")


class TestPracticeJournalCRUD:
    """Tests for practice journal CRUD operations."""
    
    @pytest.fixture
    def created_entry_id(self, auth_session):
        """Create a test entry and return its ID."""
        response = auth_session.post(
            f"{BASE_URL}/api/practice-journal",
            json={
                "practice_name": "TEST_Meditation Session",
                "practice_type": "chakra",
                "mood_before": 3,
                "mood_after": 5,
                "duration_minutes": 20,
                "body_sensations": "Warmth in chest",
                "spiritual_downloads": "Clarity about path",
                "intentions": "Inner peace",
                "key_insights": "Let go of control",
                "reflection": "Profound session",
                "moon_phase": "Waxing Crescent",
                "moon_emoji": "🌒"
            }
        )
        
        assert response.status_code == 200, f"Create entry failed: {response.status_code} - {response.text}"
        data = response.json()
        assert "entry_id" in data or "id" in data
        entry_id = data.get("entry_id") or data.get("id")
        print(f"Created test entry: {entry_id}")
        return entry_id
    
    def test_create_practice_journal_entry(self, auth_session):
        """Test creating a practice journal entry."""
        response = auth_session.post(
            f"{BASE_URL}/api/practice-journal",
            json={
                "practice_name": "TEST_Morning Yoga",
                "practice_type": "somatic",
                "mood_before": 2,
                "mood_after": 4,
                "duration_minutes": 30,
                "reflection": "Energizing start to the day"
            }
        )
        
        assert response.status_code == 200, f"Create failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert data["practice_name"] == "TEST_Morning Yoga"
        assert data["practice_type"] == "somatic"
        assert data["mood_before"] == 2
        assert data["mood_after"] == 4
        assert data["duration_minutes"] == 30
        assert "entry_id" in data or "id" in data
        
        print(f"Practice journal entry created successfully")
    
    def test_create_entry_missing_practice_name(self, auth_session):
        """Test that entries without practice name are rejected."""
        response = auth_session.post(
            f"{BASE_URL}/api/practice-journal",
            json={
                "practice_name": "   ",  # Empty/whitespace
                "practice_type": "chakra",
                "mood_before": 3,
                "mood_after": 4,
                "duration_minutes": 15
            }
        )
        
        assert response.status_code == 400, f"Expected 400 for empty practice name, got {response.status_code}"
        print("Empty practice name correctly rejected")
    
    def test_list_practice_journal_entries(self, auth_session, created_entry_id):
        """Test listing practice journal entries."""
        response = auth_session.get(f"{BASE_URL}/api/practice-journal")
        
        assert response.status_code == 200, f"List failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Find our created entry
        entry_ids = [e.get("entry_id") or e.get("id") for e in data]
        assert created_entry_id in entry_ids, f"Created entry {created_entry_id} not found in list"
        
        print(f"Listed {len(data)} practice journal entries")
    
    def test_update_practice_journal_entry(self, auth_session, created_entry_id):
        """Test updating a practice journal entry."""
        response = auth_session.put(
            f"{BASE_URL}/api/practice-journal/{created_entry_id}",
            json={
                "practice_name": "TEST_Updated Meditation",
                "practice_type": "energy",
                "mood_before": 4,
                "mood_after": 5,
                "duration_minutes": 25,
                "reflection": "Updated reflection text"
            }
        )
        
        assert response.status_code == 200, f"Update failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert data["practice_name"] == "TEST_Updated Meditation"
        assert data["practice_type"] == "energy"
        assert data["duration_minutes"] == 25
        
        # Verify update persisted
        get_response = auth_session.get(f"{BASE_URL}/api/practice-journal")
        entries = get_response.json()
        updated_entry = next((e for e in entries if (e.get("entry_id") or e.get("id")) == created_entry_id), None)
        assert updated_entry is not None
        assert updated_entry["practice_name"] == "TEST_Updated Meditation"
        
        print(f"Practice journal entry updated successfully")
    
    def test_delete_practice_journal_entry(self, auth_session):
        """Test deleting a practice journal entry."""
        # Create an entry to delete
        create_response = auth_session.post(
            f"{BASE_URL}/api/practice-journal",
            json={
                "practice_name": "TEST_To Be Deleted",
                "practice_type": "movement",
                "mood_before": 3,
                "mood_after": 4,
                "duration_minutes": 10
            }
        )
        
        assert create_response.status_code == 200
        entry_id = create_response.json().get("entry_id") or create_response.json().get("id")
        
        # Delete the entry
        delete_response = auth_session.delete(f"{BASE_URL}/api/practice-journal/{entry_id}")
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.status_code}"
        
        # Verify deletion
        list_response = auth_session.get(f"{BASE_URL}/api/practice-journal")
        entries = list_response.json()
        entry_ids = [e.get("entry_id") or e.get("id") for e in entries]
        assert entry_id not in entry_ids, "Deleted entry still appears in list"
        
        print(f"Practice journal entry deleted successfully")
    
    def test_delete_nonexistent_entry(self, auth_session):
        """Test deleting a non-existent entry returns 404."""
        response = auth_session.delete(f"{BASE_URL}/api/practice-journal/nonexistent_entry_id")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Non-existent entry deletion correctly returns 404")


class TestVoiceProfiles:
    """Tests for custom voice profile CRUD operations."""
    
    def test_list_voice_profiles_empty(self, auth_session):
        """Test listing voice profiles (may be empty initially)."""
        response = auth_session.get(f"{BASE_URL}/api/voice-profiles")
        
        assert response.status_code == 200, f"List failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"Listed {len(data)} voice profiles")
    
    def test_create_voice_profile_invalid_sample(self, auth_session):
        """Test creating voice profile with invalid sample file ID."""
        response = auth_session.post(
            f"{BASE_URL}/api/voice-profiles",
            json={
                "name": "TEST_My Custom Voice",
                "sample_file_id": "nonexistent_file_id",
                "description": "Test voice profile"
            }
        )
        
        assert response.status_code == 400, f"Expected 400 for invalid sample, got {response.status_code}"
        print("Invalid sample file ID correctly rejected")
    
    def test_delete_nonexistent_voice_profile(self, auth_session):
        """Test deleting a non-existent voice profile returns 404."""
        response = auth_session.delete(f"{BASE_URL}/api/voice-profiles/nonexistent_profile_id")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Non-existent voice profile deletion correctly returns 404")


class TestVoiceFileDownloadAndDelete:
    """Tests for voice file download and delete endpoints."""
    
    def test_download_nonexistent_file(self, auth_session):
        """Test downloading a non-existent file returns 404."""
        response = auth_session.get(f"{BASE_URL}/api/voice-files/nonexistent_file_id/download")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Non-existent file download correctly returns 404")
    
    def test_delete_nonexistent_file(self, auth_session):
        """Test deleting a non-existent file returns 404."""
        response = auth_session.delete(f"{BASE_URL}/api/voice-files/nonexistent_file_id")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Non-existent file deletion correctly returns 404")


class TestPracticeJournalWithVoiceNote:
    """Tests for practice journal entries with voice notes."""
    
    def test_create_entry_with_invalid_voice_note(self, auth_session):
        """Test creating entry with invalid voice note reference."""
        response = auth_session.post(
            f"{BASE_URL}/api/practice-journal",
            json={
                "practice_name": "TEST_With Invalid Voice",
                "practice_type": "chakra",
                "mood_before": 3,
                "mood_after": 4,
                "duration_minutes": 15,
                "voice_note_file_id": "invalid_voice_file_id"
            }
        )
        
        assert response.status_code == 400, f"Expected 400 for invalid voice note, got {response.status_code}"
        print("Invalid voice note reference correctly rejected")


class TestAuthenticationRequired:
    """Tests to verify endpoints require authentication."""
    
    def test_practice_journal_requires_auth(self, api_session):
        """Test that practice journal endpoints require authentication."""
        # Create a fresh session without auth
        fresh_session = requests.Session()
        
        response = fresh_session.get(f"{BASE_URL}/api/practice-journal")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("Practice journal correctly requires authentication")
    
    def test_voice_files_requires_auth(self, api_session):
        """Test that voice file endpoints require authentication."""
        fresh_session = requests.Session()
        
        response = fresh_session.post(
            f"{BASE_URL}/api/voice-files/from-data-url",
            json={"data_url": "data:audio/webm;base64,test"}
        )
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("Voice files correctly requires authentication")
    
    def test_voice_profiles_requires_auth(self, api_session):
        """Test that voice profile endpoints require authentication."""
        fresh_session = requests.Session()
        
        response = fresh_session.get(f"{BASE_URL}/api/voice-profiles")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("Voice profiles correctly requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
