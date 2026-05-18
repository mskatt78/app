"""
Backend API Verification for Guided Toning Implementation
Tests the new toning feature across expand-script and TTS endpoints.
"""
import os
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://breathwork-sanctuary.preview.emergentagent.com").rstrip("/")

def test_expand_script_with_toning_true():
    """Test 1: POST /api/content/expand-script with include_toning=true"""
    print("\n=== Test 1: expand-script with include_toning=true ===")
    
    response = requests.post(
        f"{BASE_URL}/api/content/expand-script",
        json={
            "practice_name": "Earth Grounding Practice",
            "element": "earth",
            "duration_minutes": 7,
            "use_ai": False,
            "include_toning": True,
            "steps": ["Ground your feet", "Feel the earth beneath you", "Breathe deeply"],
            "source_texts": ["This practice connects you to the earth element and its grounding energy"]
        },
        timeout=30
    )
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    
    # Verify required fields
    assert "paragraphs" in data, "Missing 'paragraphs' field"
    assert "segments" in data, "Missing 'segments' field"
    assert "word_count" in data, "Missing 'word_count' field"
    assert "target_word_count" in data, "Missing 'target_word_count' field"
    
    # Verify toning cues are present
    all_text = " ".join(data["paragraphs"])
    toning_indicators = ["tone", "hum", "ahh", "ooh", "mmm", "syllable", "LAM", "VAM", "RAM", "YAM", "OM"]
    has_toning = any(indicator in all_text for indicator in toning_indicators)
    
    assert has_toning, "Expected toning cues in paragraphs when include_toning=True"
    assert len(data["segments"]) > 0, "Expected at least one segment"
    assert len(data["paragraphs"]) > 0, "Expected at least one paragraph"
    
    print(f"✅ PASS: expand-script with toning=true")
    print(f"   - Status: 200")
    print(f"   - Word count: {data['word_count']}")
    print(f"   - Segments: {len(data['segments'])}")
    print(f"   - Paragraphs: {len(data['paragraphs'])}")
    print(f"   - Toning cues present: Yes")
    
    return data


def test_expand_script_with_toning_false():
    """Test 2: POST /api/content/expand-script with include_toning=false"""
    print("\n=== Test 2: expand-script with include_toning=false ===")
    
    response = requests.post(
        f"{BASE_URL}/api/content/expand-script",
        json={
            "practice_name": "Silent Meditation",
            "element": "spirit",
            "duration_minutes": 7,
            "use_ai": False,
            "include_toning": False,
            "steps": ["Sit quietly", "Observe breath", "Rest in stillness"],
            "source_texts": ["A silent practice for inner peace without vocal elements"]
        },
        timeout=30
    )
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    
    # Verify required fields
    assert "paragraphs" in data, "Missing 'paragraphs' field"
    assert "segments" in data, "Missing 'segments' field"
    
    # Verify toning cues are NOT injected (should be minimal or absent)
    all_text = " ".join(data["paragraphs"])
    
    # Check for explicit toning instruction phrases (not just words that might appear naturally)
    explicit_toning_phrases = [
        "seed syllable",
        "vocal tone",
        "add a soft vocal",
        "hum very softly",
        "weave in a light seed",
        "rounded tone for the length"
    ]
    
    has_explicit_toning = any(phrase in all_text.lower() for phrase in explicit_toning_phrases)
    
    assert not has_explicit_toning, "Expected NO explicit toning instruction cues when include_toning=False"
    
    print(f"✅ PASS: expand-script with toning=false")
    print(f"   - Status: 200")
    print(f"   - Word count: {data['word_count']}")
    print(f"   - Segments: {len(data['segments'])}")
    print(f"   - Explicit toning cues present: No")
    
    return data


def test_element_seed_syllables():
    """Test 3: Verify element seed syllables map correctly"""
    print("\n=== Test 3: Element seed syllable mapping ===")
    
    element_seed_map = {
        "earth": "LAM",
        "water": "VAM",
        "fire": "RAM",
        "air": "YAM",
        "spirit": "OM"
    }
    
    results = []
    
    for element, expected_seed in element_seed_map.items():
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": f"{element.title()} Element Practice",
                "element": element,
                "duration_minutes": 7,
                "use_ai": False,
                "include_toning": True,
                "steps": [f"Connect with {element} energy"],
                "source_texts": [f"A {element} element practice"]
            },
            timeout=30
        )
        
        assert response.status_code == 200, f"Failed for {element}: {response.status_code}"
        
        data = response.json()
        all_text = " ".join(data["paragraphs"])
        
        # Check if the expected seed syllable is present
        seed_present = expected_seed in all_text
        
        results.append({
            "element": element,
            "expected_seed": expected_seed,
            "seed_present": seed_present
        })
        
        assert seed_present, f"Expected seed syllable '{expected_seed}' for {element} element not found in text"
        
        print(f"   ✓ {element.ljust(8)} → {expected_seed.ljust(4)} (found in text)")
    
    print(f"✅ PASS: All element seed syllables map correctly")
    
    return results


def test_tts_generate_base64():
    """Test 4: POST /api/tts/generate-base64 with expanded segment"""
    print("\n=== Test 4: TTS generate-base64 with expanded segment ===")
    
    # First get an expanded script
    expand_response = requests.post(
        f"{BASE_URL}/api/content/expand-script",
        json={
            "practice_name": "TTS Test Practice",
            "element": "spirit",
            "duration_minutes": 7,
            "use_ai": False,
            "include_toning": True,
            "steps": ["Breathe deeply", "Rest in stillness"],
            "source_texts": ["A calming practice for testing TTS"]
        },
        timeout=30
    )
    
    assert expand_response.status_code == 200, f"Expand-script failed: {expand_response.status_code}"
    
    expand_data = expand_response.json()
    assert len(expand_data["segments"]) > 0, "No segments returned from expand-script"
    
    # Use first segment for TTS
    first_segment = expand_data["segments"][0]
    
    print(f"   - Using segment (length: {len(first_segment)} chars)")
    
    # Generate TTS audio
    tts_response = requests.post(
        f"{BASE_URL}/api/tts/generate-base64",
        json={
            "text": first_segment,
            "voice": "nova",
            "speed": 0.82
        },
        timeout=60
    )
    
    assert tts_response.status_code == 200, f"Expected 200, got {tts_response.status_code}: {tts_response.text}"
    
    tts_data = tts_response.json()
    
    assert "audio_base64" in tts_data, "Missing 'audio_base64' field"
    assert len(tts_data["audio_base64"]) > 100, "Audio base64 data too short"
    
    print(f"✅ PASS: TTS generate-base64")
    print(f"   - Status: 200")
    print(f"   - Audio base64 length: {len(tts_data['audio_base64'])} chars")
    print(f"   - Format: {tts_data.get('format', 'mp3')}")
    
    return tts_data


def test_health_and_core_routes():
    """Test 5: Verify no 500s on health and core content routes"""
    print("\n=== Test 5: Health and core content route sanity ===")
    
    endpoints = [
        ("/api/health", "Health"),
        ("/api/yoga/poses", "Yoga Poses"),
        ("/api/breathwork/sessions", "Breathwork Sessions"),
        ("/api/meditations", "Meditations"),
        ("/api/courses", "Courses"),
    ]
    
    results = []
    
    for endpoint, name in endpoints:
        response = requests.get(f"{BASE_URL}{endpoint}", timeout=15)
        
        status = response.status_code
        is_success = status == 200
        
        assert status != 500, f"{name} endpoint returned 500 error"
        assert is_success, f"{name} endpoint returned {status}, expected 200"
        
        results.append({
            "endpoint": endpoint,
            "name": name,
            "status": status,
            "success": is_success
        })
        
        print(f"   ✓ {name.ljust(20)} → {status}")
    
    print(f"✅ PASS: All core routes healthy (no 500s)")
    
    return results


def main():
    """Run all backend API verification tests"""
    print("=" * 70)
    print("BACKEND API VERIFICATION - GUIDED TONING IMPLEMENTATION")
    print("=" * 70)
    print(f"Base URL: {BASE_URL}")
    
    try:
        # Run all tests
        test_expand_script_with_toning_true()
        test_expand_script_with_toning_false()
        test_element_seed_syllables()
        test_tts_generate_base64()
        test_health_and_core_routes()
        
        print("\n" + "=" * 70)
        print("✅ ALL TESTS PASSED")
        print("=" * 70)
        print("\nSUMMARY:")
        print("1. ✅ expand-script with include_toning=true returns segments/paragraphs with toning cues")
        print("2. ✅ expand-script with include_toning=false avoids toning cue injection")
        print("3. ✅ Element seed syllables map correctly (earth→LAM, water→VAM, fire→RAM, air→YAM, spirit→OM)")
        print("4. ✅ TTS generate-base64 generates audio for expanded segments")
        print("5. ✅ No backend 500s on /api/health and core content routes")
        print("\nBackend toning implementation verified successfully.")
        
        return 0
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        return 1
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
