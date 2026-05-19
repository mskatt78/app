"""Backend API testing for focused verification batch."""
import requests
import json
import sys

# Base URL from frontend/.env
BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

def test_health():
    """Test 1: /api/health returns 200"""
    print("\n" + "="*80)
    print("TEST 1: GET /api/health")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ PASS: Health endpoint returns 200")
            return True
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False


def test_tts_generate_base64():
    """Test 2: /api/tts/generate-base64 returns audio payload for valid text"""
    print("\n" + "="*80)
    print("TEST 2: POST /api/tts/generate-base64")
    print("="*80)
    
    payload = {
        "text": "Welcome to this sacred meditation practice. Take a deep breath and relax.",
        "voice": "nova",
        "speed": 0.85
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/tts/generate-base64",
            json=payload,
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "audio_base64" in data and "format" in data:
                audio_len = len(data["audio_base64"])
                print(f"✅ PASS: TTS generate-base64 returns valid response")
                print(f"   - audio_base64 length: {audio_len} chars")
                print(f"   - format: {data['format']}")
                return True
            else:
                print(f"❌ FAIL: Missing required fields in response")
                print(f"Response keys: {data.keys()}")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False


def test_meditation_parts():
    """Test 3: /api/tts/meditation/{id}/parts works for existing meditation"""
    print("\n" + "="*80)
    print("TEST 3: GET /api/tts/meditation/{id}/parts")
    print("="*80)
    
    # First, get a valid meditation ID
    try:
        meditations_response = requests.get(f"{BASE_URL}/meditations", timeout=10)
        if meditations_response.status_code != 200:
            print(f"❌ FAIL: Could not fetch meditations list")
            return False
        
        meditations = meditations_response.json()
        if not meditations or len(meditations) == 0:
            print(f"❌ FAIL: No meditations found in database")
            return False
        
        meditation_id = meditations[0].get("id")
        print(f"Using meditation ID: {meditation_id}")
        
        # Test the parts endpoint
        response = requests.get(
            f"{BASE_URL}/tts/meditation/{meditation_id}/parts",
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data}")
            
            if "meditation_id" in data and "total_parts" in data:
                print(f"✅ PASS: Meditation parts endpoint returns valid response")
                print(f"   - meditation_id: {data['meditation_id']}")
                print(f"   - total_parts: {data['total_parts']}")
                return True
            else:
                print(f"❌ FAIL: Missing required fields in response")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False


def test_meditation_audio_part():
    """Test 4: /api/tts/meditation/{id}?part=1 works for existing meditation"""
    print("\n" + "="*80)
    print("TEST 4: POST /api/tts/meditation/{id}?part=1")
    print("="*80)
    
    # First, get a valid meditation ID
    try:
        meditations_response = requests.get(f"{BASE_URL}/meditations", timeout=10)
        if meditations_response.status_code != 200:
            print(f"❌ FAIL: Could not fetch meditations list")
            return False
        
        meditations = meditations_response.json()
        if not meditations or len(meditations) == 0:
            print(f"❌ FAIL: No meditations found in database")
            return False
        
        meditation_id = meditations[0].get("id")
        meditation_name = meditations[0].get("name", "Unknown")
        print(f"Using meditation: {meditation_name} (ID: {meditation_id})")
        
        # Test the meditation audio endpoint with part=1
        response = requests.post(
            f"{BASE_URL}/tts/meditation/{meditation_id}?part=1",
            timeout=60  # Longer timeout for TTS generation
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if "audio_base64" in data and "format" in data:
                audio_len = len(data["audio_base64"])
                print(f"✅ PASS: Meditation audio endpoint returns valid response")
                print(f"   - audio_base64 length: {audio_len} chars")
                print(f"   - format: {data['format']}")
                return True
            else:
                print(f"❌ FAIL: Missing required fields in response")
                print(f"Response keys: {data.keys()}")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False


def test_expand_script():
    """Test 5: /api/content/expand-script returns stable structure and expected outputs"""
    print("\n" + "="*80)
    print("TEST 5: POST /api/content/expand-script")
    print("="*80)
    
    payload = {
        "practice_name": "Sacred Breath Journey",
        "element": "air",
        "duration_minutes": 10,
        "use_ai": False,
        "include_toning": True,
        "steps": [
            "Opening: Find your center and connect with your breath",
            "Breath Work: Deep rhythmic breathing with the air element",
            "Integration: Allow the energy to settle and integrate"
        ],
        "source_texts": [
            "Connect with your breath and find your center.",
            "Allow the air element to guide your practice.",
            "Feel the flow of energy through your body."
        ]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/content/expand-script",
            json=payload,
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            
            # Check for required fields
            required_fields = ["target_minutes", "target_word_count", "word_count", "segments"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                print(f"❌ FAIL: Missing required fields: {missing_fields}")
                return False
            
            target_minutes = data.get("target_minutes")
            target_word_count = data.get("target_word_count")
            word_count = data.get("word_count")
            segments = data.get("segments", [])
            
            print(f"   - target_minutes: {target_minutes}")
            print(f"   - target_word_count: {target_word_count}")
            print(f"   - word_count: {word_count}")
            print(f"   - segments count: {len(segments)}")
            
            # Validate word count meets threshold (80% of target)
            threshold = target_word_count * 0.8
            if word_count >= threshold:
                print(f"   - word_count validation: ✅ {word_count} >= {threshold:.0f} (80% of target)")
            else:
                print(f"   - word_count validation: ❌ {word_count} < {threshold:.0f} (80% of target)")
                return False
            
            # Check segments structure
            if segments and len(segments) > 0:
                sample_segment = segments[0]
                if isinstance(sample_segment, str):
                    print(f"   - sample segment (first 100 chars): {sample_segment[:100]}")
                else:
                    print(f"   - sample segment keys: {list(sample_segment.keys())}")
            
            print(f"✅ PASS: expand-script returns stable structure with expected outputs")
            return True
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False


def main():
    """Run all tests and report results."""
    print("\n" + "="*80)
    print("BACKEND API FOCUSED VERIFICATION")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    
    results = {
        "Health endpoint": test_health(),
        "TTS generate-base64": test_tts_generate_base64(),
        "Meditation parts info": test_meditation_parts(),
        "Meditation audio part": test_meditation_audio_part(),
        "Content expand-script": test_expand_script(),
    }
    
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED")
        return 0
    else:
        print(f"\n⚠️  {total - passed} TEST(S) FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())
