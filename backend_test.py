"""
Backend Regression Sweep - Type Hint Updates & Birth Chart Endpoints
Tests admin auth behavior, birth chart endpoints, and core guided endpoints.
"""
import os
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://breathwork-sanctuary.preview.emergentagent.com").rstrip("/")

def test_admin_collections_auth():
    """Test 1: /api/admin/collections auth behavior unchanged (no 500 after type-hint updates)"""
    print("\n=== Test 1: /api/admin/collections auth behavior ===")
    
    response = requests.get(f"{BASE_URL}/api/admin/collections", timeout=10)
    
    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}: {response.text}"
    
    # Verify it's a proper auth error, not a 500
    assert response.status_code != 500, "Should not return 500 error"
    
    print(f"✅ PASS: /api/admin/collections returns 401 (not 500)")
    print(f"   - Status: {response.status_code}")
    print(f"   - Response: {response.json()}")
    
    return True


def test_admin_seed_status_auth():
    """Test 2: /api/admin/seed-status auth behavior unchanged (no 500 after type-hint updates)"""
    print("\n=== Test 2: /api/admin/seed-status auth behavior ===")
    
    response = requests.get(f"{BASE_URL}/api/admin/seed-status", timeout=10)
    
    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}: {response.text}"
    
    # Verify it's a proper auth error, not a 500
    assert response.status_code != 500, "Should not return 500 error"
    
    print(f"✅ PASS: /api/admin/seed-status returns 401 (not 500)")
    print(f"   - Status: {response.status_code}")
    print(f"   - Response: {response.json()}")
    
    return True


def test_birth_chart_zodiac_signs():
    """Test 3: /api/birth-chart/zodiac-signs returns expected status/data types"""
    print("\n=== Test 3: /api/birth-chart/zodiac-signs ===")
    
    response = requests.get(f"{BASE_URL}/api/birth-chart/zodiac-signs", timeout=10)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    
    # Verify it's a dict with zodiac sign data
    assert isinstance(data, dict), f"Expected dict, got {type(data)}"
    assert len(data) == 12, f"Expected 12 zodiac signs, got {len(data)}"
    
    # Verify structure of one sign
    assert "Aries" in data, "Expected Aries in zodiac signs"
    aries = data["Aries"]
    assert "element" in aries, "Expected 'element' field in Aries data"
    assert "quality" in aries, "Expected 'quality' field in Aries data"
    assert "ruler" in aries, "Expected 'ruler' field in Aries data"
    assert "symbol" in aries, "Expected 'symbol' field in Aries data"
    
    print(f"✅ PASS: /api/birth-chart/zodiac-signs")
    print(f"   - Status: 200")
    print(f"   - Zodiac signs count: {len(data)}")
    print(f"   - Sample (Aries): element={aries['element']}, quality={aries['quality']}, ruler={aries['ruler']}")
    
    return True


def test_birth_chart_planet_meanings():
    """Test 4: /api/birth-chart/planet-meanings returns expected status/data types"""
    print("\n=== Test 4: /api/birth-chart/planet-meanings ===")
    
    response = requests.get(f"{BASE_URL}/api/birth-chart/planet-meanings", timeout=10)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    
    # Verify it's a dict with planet data
    assert isinstance(data, dict), f"Expected dict, got {type(data)}"
    assert len(data) > 10, f"Expected at least 10 planets, got {len(data)}"
    
    # Verify structure of one planet
    assert "Sun" in data, "Expected Sun in planet meanings"
    sun = data["Sun"]
    assert "meaning" in sun, "Expected 'meaning' field in Sun data"
    assert "symbol" in sun, "Expected 'symbol' field in Sun data"
    assert "keywords" in sun, "Expected 'keywords' field in Sun data"
    assert isinstance(sun["keywords"], list), "Expected 'keywords' to be a list"
    
    print(f"✅ PASS: /api/birth-chart/planet-meanings")
    print(f"   - Status: 200")
    print(f"   - Planets count: {len(data)}")
    print(f"   - Sample (Sun): meaning={sun['meaning'][:50]}..., symbol={sun['symbol']}")
    
    return True


def test_birth_chart_house_meanings():
    """Test 5: /api/birth-chart/house-meanings returns expected status/data types"""
    print("\n=== Test 5: /api/birth-chart/house-meanings ===")
    
    response = requests.get(f"{BASE_URL}/api/birth-chart/house-meanings", timeout=10)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    
    # Verify it's a dict with house data (keys are integers as strings in JSON)
    assert isinstance(data, dict), f"Expected dict, got {type(data)}"
    assert len(data) == 12, f"Expected 12 houses, got {len(data)}"
    
    # Verify structure of one house
    assert "1" in data, "Expected house 1 in house meanings"
    house1 = data["1"]
    assert "name" in house1, "Expected 'name' field in house 1 data"
    assert "theme" in house1, "Expected 'theme' field in house 1 data"
    assert "description" in house1, "Expected 'description' field in house 1 data"
    assert "keywords" in house1, "Expected 'keywords' field in house 1 data"
    
    print(f"✅ PASS: /api/birth-chart/house-meanings")
    print(f"   - Status: 200")
    print(f"   - Houses count: {len(data)}")
    print(f"   - Sample (House 1): name={house1['name']}, theme={house1['theme']}")
    
    return True


def test_birth_chart_aspect_meanings():
    """Test 6: /api/birth-chart/aspect-meanings returns expected status/data types"""
    print("\n=== Test 6: /api/birth-chart/aspect-meanings ===")
    
    response = requests.get(f"{BASE_URL}/api/birth-chart/aspect-meanings", timeout=10)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    
    # Verify it's a dict with aspect data
    assert isinstance(data, dict), f"Expected dict, got {type(data)}"
    assert len(data) >= 5, f"Expected at least 5 aspects, got {len(data)}"
    
    # Verify structure of one aspect
    assert "Conjunction" in data, "Expected Conjunction in aspect meanings"
    conjunction = data["Conjunction"]
    assert "degrees" in conjunction, "Expected 'degrees' field in Conjunction data"
    assert "orb" in conjunction, "Expected 'orb' field in Conjunction data"
    assert "nature" in conjunction, "Expected 'nature' field in Conjunction data"
    assert "symbol" in conjunction, "Expected 'symbol' field in Conjunction data"
    assert "meaning" in conjunction, "Expected 'meaning' field in Conjunction data"
    
    print(f"✅ PASS: /api/birth-chart/aspect-meanings")
    print(f"   - Status: 200")
    print(f"   - Aspects count: {len(data)}")
    print(f"   - Sample (Conjunction): degrees={conjunction['degrees']}, orb={conjunction['orb']}, meaning={conjunction['meaning']}")
    
    return True


def test_birth_chart_calculate():
    """Test 7: /api/birth-chart/calculate returns expected status/data types"""
    print("\n=== Test 7: /api/birth-chart/calculate ===")
    
    payload = {
        "birth_date": "1990-05-15",
        "birth_time": "14:30",
        "birth_city": "New York",
        "birth_country": "USA"
    }
    
    response = requests.post(f"{BASE_URL}/api/birth-chart/calculate", json=payload, timeout=15)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    
    # Verify essential fields
    assert "sun_sign" in data, "Expected 'sun_sign' field"
    assert "moon_sign" in data, "Expected 'moon_sign' field"
    assert "rising_sign" in data, "Expected 'rising_sign' field"
    assert "planets" in data, "Expected 'planets' field"
    assert "houses" in data, "Expected 'houses' field"
    assert "aspects" in data, "Expected 'aspects' field"
    assert "birth_data" in data, "Expected 'birth_data' field"
    
    # Verify data types
    assert isinstance(data["planets"], list), "Expected 'planets' to be a list"
    assert isinstance(data["houses"], dict), "Expected 'houses' to be a dict"
    assert isinstance(data["aspects"], list), "Expected 'aspects' to be a list"
    
    print(f"✅ PASS: /api/birth-chart/calculate")
    print(f"   - Status: 200")
    print(f"   - Sun sign: {data['sun_sign']}")
    print(f"   - Moon sign: {data['moon_sign']}")
    print(f"   - Rising sign: {data['rising_sign']}")
    print(f"   - Planets count: {len(data['planets'])}")
    print(f"   - Houses count: {len(data['houses'])}")
    print(f"   - Aspects count: {len(data['aspects'])}")
    
    return True


def test_content_expand_script():
    """Test 8: /api/content/expand-script returns 200 for valid payloads"""
    print("\n=== Test 8: /api/content/expand-script ===")
    
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
    assert "practice_name" in data, "Expected 'practice_name' field"
    assert "target_minutes" in data, "Expected 'target_minutes' field"
    assert "target_word_count" in data, "Expected 'target_word_count' field"
    assert "word_count" in data, "Expected 'word_count' field"
    assert "paragraphs" in data, "Expected 'paragraphs' field"
    assert "segments" in data, "Expected 'segments' field"
    
    # Verify data types
    assert isinstance(data["paragraphs"], list), "Expected 'paragraphs' to be a list"
    assert isinstance(data["segments"], list), "Expected 'segments' to be a list"
    assert isinstance(data["word_count"], int), "Expected 'word_count' to be an int"
    
    print(f"✅ PASS: /api/content/expand-script")
    print(f"   - Status: 200")
    print(f"   - Practice name: {data['practice_name']}")
    print(f"   - Target minutes: {data['target_minutes']}")
    print(f"   - Word count: {data['word_count']}")
    print(f"   - Paragraphs count: {len(data['paragraphs'])}")
    print(f"   - Segments count: {len(data['segments'])}")
    
    return True


def test_tts_generate_base64():
    """Test 9: /api/tts/generate-base64 returns 200 for valid payloads"""
    print("\n=== Test 9: /api/tts/generate-base64 ===")
    
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
    
    print(f"✅ PASS: /api/tts/generate-base64")
    print(f"   - Status: 200")
    print(f"   - Audio base64 length: {len(data['audio_base64'])} chars")
    print(f"   - Format: {data['format']}")
    
    return True


def main():
    """Run all backend regression tests"""
    print("=" * 80)
    print("BACKEND REGRESSION SWEEP - TYPE HINT UPDATES & BIRTH CHART ENDPOINTS")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    
    results = []
    
    try:
        # Admin auth behavior tests
        results.append(("Admin collections auth", test_admin_collections_auth()))
        results.append(("Admin seed-status auth", test_admin_seed_status_auth()))
        
        # Birth chart endpoints tests
        results.append(("Birth chart zodiac signs", test_birth_chart_zodiac_signs()))
        results.append(("Birth chart planet meanings", test_birth_chart_planet_meanings()))
        results.append(("Birth chart house meanings", test_birth_chart_house_meanings()))
        results.append(("Birth chart aspect meanings", test_birth_chart_aspect_meanings()))
        results.append(("Birth chart calculate", test_birth_chart_calculate()))
        
        # Core guided endpoints tests
        results.append(("Content expand-script", test_content_expand_script()))
        results.append(("TTS generate-base64", test_tts_generate_base64()))
        
        print("\n" + "=" * 80)
        print("✅ ALL TESTS PASSED")
        print("=" * 80)
        print("\nSUMMARY:")
        for name, passed in results:
            status = "✅" if passed else "❌"
            print(f"{status} {name}")
        
        print("\nCRITICAL FINDINGS:")
        print("1. ✅ Admin routes (/api/admin/collections, /api/admin/seed-status) return 401 (not 500) after type-hint updates")
        print("2. ✅ Birth chart endpoints return 200 with expected data structures:")
        print("   - /api/birth-chart/zodiac-signs: 12 zodiac signs with element, quality, ruler, symbol")
        print("   - /api/birth-chart/planet-meanings: 10+ planets with meaning, symbol, keywords")
        print("   - /api/birth-chart/house-meanings: 12 houses with name, theme, description, keywords")
        print("   - /api/birth-chart/aspect-meanings: 5+ aspects with degrees, orb, nature, symbol, meaning")
        print("   - /api/birth-chart/calculate: Full chart with sun/moon/rising signs, planets, houses, aspects")
        print("3. ✅ Core guided endpoints return 200 for valid payloads:")
        print("   - /api/content/expand-script: Returns paragraphs, segments, word counts")
        print("   - /api/tts/generate-base64: Returns base64 audio in mp3 format")
        
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
