"""
Backend Verification - User Router Auth Behavior & Timer Dependencies
Tests health endpoint, user router auth behavior, and timer-related endpoints.
"""
import os
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://breathwork-sanctuary.preview.emergentagent.com").rstrip("/")

def test_health_endpoint():
    """Test 1: /api/health returns 200"""
    print("\n=== Test 1: /api/health ===")
    
    response = requests.get(f"{BASE_URL}/api/health", timeout=10)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    assert "status" in data, "Expected 'status' field in response"
    assert data["status"] == "healthy", f"Expected status 'healthy', got {data['status']}"
    
    print(f"✅ PASS: /api/health returns 200")
    print(f"   - Status: {response.status_code}")
    print(f"   - Response: {data}")
    
    return True


def test_user_dashboard_daily_auth():
    """Test 2: /api/dashboard/daily requires auth (401 when unauthenticated)"""
    print("\n=== Test 2: /api/dashboard/daily auth behavior ===")
    
    response = requests.get(f"{BASE_URL}/api/dashboard/daily", timeout=10)
    
    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}: {response.text}"
    
    print(f"✅ PASS: /api/dashboard/daily returns 401 when unauthenticated")
    print(f"   - Status: {response.status_code}")
    
    return True


def test_user_favorites_post_auth():
    """Test 3: POST /api/favorites requires auth (401 when unauthenticated)"""
    print("\n=== Test 3: POST /api/favorites auth behavior ===")
    
    payload = {
        "item_type": "crystal",
        "item_id": "test_crystal"
    }
    
    response = requests.post(f"{BASE_URL}/api/favorites", json=payload, timeout=10)
    
    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}: {response.text}"
    
    print(f"✅ PASS: POST /api/favorites returns 401 when unauthenticated")
    print(f"   - Status: {response.status_code}")
    
    return True


def test_user_favorites_get_auth():
    """Test 4: GET /api/favorites requires auth (401 when unauthenticated)"""
    print("\n=== Test 4: GET /api/favorites auth behavior ===")
    
    response = requests.get(f"{BASE_URL}/api/favorites", timeout=10)
    
    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}: {response.text}"
    
    print(f"✅ PASS: GET /api/favorites returns 401 when unauthenticated")
    print(f"   - Status: {response.status_code}")
    
    return True


def test_user_practice_history_post_auth():
    """Test 5: POST /api/practice-history requires auth (401 when unauthenticated)"""
    print("\n=== Test 5: POST /api/practice-history auth behavior ===")
    
    payload = {
        "practice_type": "yoga",
        "duration_minutes": 30
    }
    
    response = requests.post(f"{BASE_URL}/api/practice-history", json=payload, timeout=10)
    
    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}: {response.text}"
    
    print(f"✅ PASS: POST /api/practice-history returns 401 when unauthenticated")
    print(f"   - Status: {response.status_code}")
    
    return True


def test_user_practice_history_get_auth():
    """Test 6: GET /api/practice-history requires auth (401 when unauthenticated)"""
    print("\n=== Test 6: GET /api/practice-history auth behavior ===")
    
    response = requests.get(f"{BASE_URL}/api/practice-history", timeout=10)
    
    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}: {response.text}"
    
    print(f"✅ PASS: GET /api/practice-history returns 401 when unauthenticated")
    print(f"   - Status: {response.status_code}")
    
    return True


def test_user_rituals_post_auth():
    """Test 7: POST /api/rituals requires auth (401 when unauthenticated)"""
    print("\n=== Test 7: POST /api/rituals auth behavior ===")
    
    payload = {
        "name": "Morning Ritual",
        "practices": [],
        "total_duration": 30
    }
    
    response = requests.post(f"{BASE_URL}/api/rituals", json=payload, timeout=10)
    
    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}: {response.text}"
    
    print(f"✅ PASS: POST /api/rituals returns 401 when unauthenticated")
    print(f"   - Status: {response.status_code}")
    
    return True


def test_user_rituals_get_auth():
    """Test 8: GET /api/rituals requires auth (401 when unauthenticated)"""
    print("\n=== Test 8: GET /api/rituals auth behavior ===")
    
    response = requests.get(f"{BASE_URL}/api/rituals", timeout=10)
    
    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}: {response.text}"
    
    print(f"✅ PASS: GET /api/rituals returns 401 when unauthenticated")
    print(f"   - Status: {response.status_code}")
    
    return True


def test_user_rituals_shared_public_access():
    """Test 9: GET /api/rituals/shared/{share_code} is public (returns 404 for non-existent, not 401)"""
    print("\n=== Test 9: GET /api/rituals/shared/{share_code} public access ===")
    
    # Use a non-existent share code
    response = requests.get(f"{BASE_URL}/api/rituals/shared/nonexistent_code", timeout=10)
    
    # Should return 404 (not found) not 401 (unauthorized) - this proves it's a public endpoint
    assert response.status_code == 404, f"Expected 404 Not Found (public endpoint), got {response.status_code}: {response.text}"
    
    print(f"✅ PASS: GET /api/rituals/shared/{{share_code}} is public (returns 404, not 401)")
    print(f"   - Status: {response.status_code}")
    print(f"   - This confirms the endpoint is accessible without auth")
    
    return True


def test_user_journal_post_auth():
    """Test 10: POST /api/journal requires auth (401 when unauthenticated)"""
    print("\n=== Test 10: POST /api/journal auth behavior ===")
    
    payload = {
        "content": "Test journal entry"
    }
    
    response = requests.post(f"{BASE_URL}/api/journal", json=payload, timeout=10)
    
    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}: {response.text}"
    
    print(f"✅ PASS: POST /api/journal returns 401 when unauthenticated")
    print(f"   - Status: {response.status_code}")
    
    return True


def test_user_journal_get_auth():
    """Test 11: GET /api/journal requires auth (401 when unauthenticated)"""
    print("\n=== Test 11: GET /api/journal auth behavior ===")
    
    response = requests.get(f"{BASE_URL}/api/journal", timeout=10)
    
    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}: {response.text}"
    
    print(f"✅ PASS: GET /api/journal returns 401 when unauthenticated")
    print(f"   - Status: {response.status_code}")
    
    return True


def test_user_achievements_auth():
    """Test 12: GET /api/achievements requires auth (401 when unauthenticated)"""
    print("\n=== Test 12: GET /api/achievements auth behavior ===")
    
    response = requests.get(f"{BASE_URL}/api/achievements", timeout=10)
    
    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}: {response.text}"
    
    print(f"✅ PASS: GET /api/achievements returns 401 when unauthenticated")
    print(f"   - Status: {response.status_code}")
    
    return True


def test_user_account_export_auth():
    """Test 13: GET /api/account/export requires auth (401 when unauthenticated)"""
    print("\n=== Test 13: GET /api/account/export auth behavior ===")
    
    response = requests.get(f"{BASE_URL}/api/account/export", timeout=10)
    
    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}: {response.text}"
    
    print(f"✅ PASS: GET /api/account/export returns 401 when unauthenticated")
    print(f"   - Status: {response.status_code}")
    
    return True


def test_user_mantras_custom_post_auth():
    """Test 14: POST /api/mantras/custom requires auth (401 when unauthenticated)"""
    print("\n=== Test 14: POST /api/mantras/custom auth behavior ===")
    
    payload = {
        "text": "Test mantra"
    }
    
    response = requests.post(f"{BASE_URL}/api/mantras/custom", json=payload, timeout=10)
    
    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}: {response.text}"
    
    print(f"✅ PASS: POST /api/mantras/custom returns 401 when unauthenticated")
    print(f"   - Status: {response.status_code}")
    
    return True


def test_user_mantras_custom_get_auth():
    """Test 15: GET /api/mantras/custom requires auth (401 when unauthenticated)"""
    print("\n=== Test 15: GET /api/mantras/custom auth behavior ===")
    
    response = requests.get(f"{BASE_URL}/api/mantras/custom", timeout=10)
    
    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}: {response.text}"
    
    print(f"✅ PASS: GET /api/mantras/custom returns 401 when unauthenticated")
    print(f"   - Status: {response.status_code}")
    
    return True


def test_content_expand_script_regression():
    """Test 16: /api/content/expand-script - timer dependency regression check"""
    print("\n=== Test 16: /api/content/expand-script regression check ===")
    
    payload = {
        "practice_name": "Grounding Practice",
        "element": "earth",
        "duration_minutes": 7,
        "use_ai": False,
        "include_toning": True,
        "steps": ["Stand with feet hip-width apart", "Feel the earth beneath you", "Breathe deeply"],
        "source_texts": ["This practice connects you to the earth element"]
    }
    
    response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload, timeout=30)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    
    # Verify required fields
    assert "target_minutes" in data, "Expected 'target_minutes' field"
    assert "target_word_count" in data, "Expected 'target_word_count' field"
    assert "word_count" in data, "Expected 'word_count' field"
    assert "paragraphs" in data, "Expected 'paragraphs' field"
    assert "segments" in data, "Expected 'segments' field"
    
    # Verify word count meets threshold (>= 80% of target)
    target_word_count = data["target_word_count"]
    word_count = data["word_count"]
    threshold = target_word_count * 0.8
    
    assert word_count >= threshold, f"Word count {word_count} should be >= 80% of target {target_word_count} (threshold: {threshold})"
    
    print(f"✅ PASS: /api/content/expand-script regression check")
    print(f"   - Status: {response.status_code}")
    print(f"   - Target minutes: {data['target_minutes']}")
    print(f"   - Target word count: {target_word_count}")
    print(f"   - Actual word count: {word_count}")
    print(f"   - Word count threshold (80%): {threshold}")
    print(f"   - Paragraphs: {len(data['paragraphs'])}")
    print(f"   - Segments: {len(data['segments'])}")
    
    return True


def test_tts_generate_base64_regression():
    """Test 17: /api/tts/generate-base64 - timer dependency regression check"""
    print("\n=== Test 17: /api/tts/generate-base64 regression check ===")
    
    payload = {
        "text": "Welcome to this guided practice. Take a deep breath in, and slowly exhale.",
        "voice": "nova",
        "speed": 0.85
    }
    
    response = requests.post(f"{BASE_URL}/api/tts/generate-base64", json=payload, timeout=60)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    
    # Verify required fields
    assert "audio_base64" in data, "Expected 'audio_base64' field"
    assert "format" in data, "Expected 'format' field"
    
    # Verify data types and content
    assert isinstance(data["audio_base64"], str), "Expected 'audio_base64' to be a string"
    assert len(data["audio_base64"]) > 100, f"Expected audio_base64 to be substantial, got {len(data['audio_base64'])} chars"
    assert data["format"] == "mp3", f"Expected format to be 'mp3', got {data['format']}"
    
    print(f"✅ PASS: /api/tts/generate-base64 regression check")
    print(f"   - Status: {response.status_code}")
    print(f"   - Audio base64 length: {len(data['audio_base64'])} chars")
    print(f"   - Format: {data['format']}")
    
    return True


def main():
    """Run all backend verification tests"""
    print("=" * 80)
    print("BACKEND VERIFICATION - USER ROUTER AUTH & TIMER DEPENDENCIES")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    
    results = []
    
    try:
        # Health endpoint
        results.append(("Health endpoint", test_health_endpoint()))
        
        # User router auth behavior tests
        results.append(("Dashboard daily auth", test_user_dashboard_daily_auth()))
        results.append(("Favorites POST auth", test_user_favorites_post_auth()))
        results.append(("Favorites GET auth", test_user_favorites_get_auth()))
        results.append(("Practice history POST auth", test_user_practice_history_post_auth()))
        results.append(("Practice history GET auth", test_user_practice_history_get_auth()))
        results.append(("Rituals POST auth", test_user_rituals_post_auth()))
        results.append(("Rituals GET auth", test_user_rituals_get_auth()))
        results.append(("Rituals shared public access", test_user_rituals_shared_public_access()))
        results.append(("Journal POST auth", test_user_journal_post_auth()))
        results.append(("Journal GET auth", test_user_journal_get_auth()))
        results.append(("Achievements auth", test_user_achievements_auth()))
        results.append(("Account export auth", test_user_account_export_auth()))
        results.append(("Mantras custom POST auth", test_user_mantras_custom_post_auth()))
        results.append(("Mantras custom GET auth", test_user_mantras_custom_get_auth()))
        
        # Timer-related backend dependencies regression
        results.append(("Content expand-script regression", test_content_expand_script_regression()))
        results.append(("TTS generate-base64 regression", test_tts_generate_base64_regression()))
        
        print("\n" + "=" * 80)
        print("✅ ALL TESTS PASSED")
        print("=" * 80)
        print("\nSUMMARY:")
        for name, passed in results:
            status = "✅" if passed else "❌"
            print(f"{status} {name}")
        
        print("\nCRITICAL FINDINGS:")
        print("1. ✅ /api/health returns 200 with valid JSON")
        print("2. ✅ User router endpoints maintain expected auth behavior:")
        print("   - All authenticated endpoints return 401 when unauthenticated")
        print("   - Public endpoint /api/rituals/shared/{share_code} accessible without auth (returns 404 for non-existent)")
        print("3. ✅ Timer-related backend dependencies working correctly:")
        print("   - /api/content/expand-script: Returns valid response with word count >= 80% of target")
        print("   - /api/tts/generate-base64: Returns valid base64 audio in mp3 format")
        
        return 0
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        print("\nPARTIAL RESULTS:")
        for name, passed in results:
            status = "✅" if passed else "❌"
            print(f"{status} {name}")
        return 1
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
