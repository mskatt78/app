#!/usr/bin/env python3
"""
Backend Deployment-Readiness Test
Tests the following endpoints:
1. GET /api/health
2. POST /api/content/expand-script
3. POST /api/tts/generate-base64
4. GET /api/tts/meditation/{id}/parts
5. POST /api/tts/meditation/{id}
"""

import requests
import json
import sys

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"

def test_health():
    """Test GET /api/health"""
    print("\n1. Testing GET /api/health...")
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"   ❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"   Response: {json.dumps(data, indent=2)}")
        
        # Verify required fields
        if "status" not in data or data["status"] != "healthy":
            print(f"   ❌ FAILED: Missing or invalid 'status' field")
            return False
        
        print(f"   ✅ PASSED")
        return True
    except Exception as e:
        print(f"   ❌ FAILED: {str(e)}")
        return False

def test_expand_script():
    """Test POST /api/content/expand-script"""
    print("\n2. Testing POST /api/content/expand-script...")
    try:
        payload = {
            "practice_name": "Sacred Breath Journey",
            "element": "air",
            "duration_minutes": 10,
            "use_ai": False,
            "include_toning": True,
            "steps": [
                "Opening: Ground yourself and set intention",
                "Main Practice: Deep breathing and visualization",
                "Closing: Integration and gratitude"
            ],
            "source_texts": ["Welcome to this sacred practice."]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=30
        )
        print(f"   Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"   ❌ FAILED: Expected 200, got {response.status_code}")
            print(f"   Response: {response.text[:500]}")
            return False
        
        data = response.json()
        
        # Verify required fields
        required_fields = ["target_minutes", "target_word_count", "word_count"]
        for field in required_fields:
            if field not in data:
                print(f"   ❌ FAILED: Missing required field '{field}'")
                return False
        
        # Verify word count threshold (>= 80% of target)
        target_word_count = data["target_word_count"]
        actual_word_count = data["word_count"]
        threshold = target_word_count * 0.8
        
        print(f"   Target minutes: {data['target_minutes']}")
        print(f"   Target word count: {target_word_count}")
        print(f"   Actual word count: {actual_word_count}")
        print(f"   Threshold (80%): {threshold}")
        
        if actual_word_count < threshold:
            print(f"   ❌ FAILED: Word count {actual_word_count} < threshold {threshold}")
            return False
        
        print(f"   ✅ PASSED")
        return True
    except Exception as e:
        print(f"   ❌ FAILED: {str(e)}")
        return False

def test_tts_generate_base64():
    """Test POST /api/tts/generate-base64"""
    print("\n3. Testing POST /api/tts/generate-base64...")
    try:
        payload = {
            "text": "Welcome to this sacred practice. Take a moment to center yourself and breathe deeply.",
            "voice": "nova",
            "speed": 0.85
        }
        
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json=payload,
            timeout=30
        )
        print(f"   Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"   ❌ FAILED: Expected 200, got {response.status_code}")
            print(f"   Response: {response.text[:500]}")
            return False
        
        data = response.json()
        
        # Verify required fields
        if "audio_base64" not in data:
            print(f"   ❌ FAILED: Missing 'audio_base64' field")
            return False
        
        if "format" not in data:
            print(f"   ❌ FAILED: Missing 'format' field")
            return False
        
        audio_length = len(data["audio_base64"])
        print(f"   Audio base64 length: {audio_length:,} chars")
        print(f"   Format: {data['format']}")
        
        # Verify audio data is substantial (at least 10KB base64)
        if audio_length < 10000:
            print(f"   ❌ FAILED: Audio data too small ({audio_length} chars)")
            return False
        
        print(f"   ✅ PASSED")
        return True
    except Exception as e:
        print(f"   ❌ FAILED: {str(e)}")
        return False

def test_tts_meditation_parts():
    """Test GET /api/tts/meditation/{id}/parts"""
    print("\n4. Testing GET /api/tts/meditation/{id}/parts...")
    try:
        meditation_id = "1"
        response = requests.get(
            f"{BASE_URL}/api/tts/meditation/{meditation_id}/parts",
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"   ❌ FAILED: Expected 200, got {response.status_code}")
            print(f"   Response: {response.text[:500]}")
            return False
        
        data = response.json()
        print(f"   Response: {json.dumps(data, indent=2)}")
        
        # Verify required fields
        if "meditation_id" not in data:
            print(f"   ❌ FAILED: Missing 'meditation_id' field")
            return False
        
        if "total_parts" not in data:
            print(f"   ❌ FAILED: Missing 'total_parts' field")
            return False
        
        print(f"   Meditation ID: {data['meditation_id']}")
        print(f"   Total parts: {data['total_parts']}")
        
        print(f"   ✅ PASSED")
        return True
    except Exception as e:
        print(f"   ❌ FAILED: {str(e)}")
        return False

def test_tts_meditation_audio():
    """Test POST /api/tts/meditation/{id}"""
    print("\n5. Testing POST /api/tts/meditation/{id}...")
    try:
        meditation_id = "1"
        part = 1
        response = requests.post(
            f"{BASE_URL}/api/tts/meditation/{meditation_id}?part={part}",
            timeout=60
        )
        print(f"   Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"   ❌ FAILED: Expected 200, got {response.status_code}")
            print(f"   Response: {response.text[:500]}")
            return False
        
        data = response.json()
        
        # Verify required fields
        if "audio_base64" not in data:
            print(f"   ❌ FAILED: Missing 'audio_base64' field")
            return False
        
        if "format" not in data:
            print(f"   ❌ FAILED: Missing 'format' field")
            return False
        
        audio_length = len(data["audio_base64"])
        print(f"   Audio base64 length: {audio_length:,} chars")
        print(f"   Format: {data['format']}")
        
        # Verify audio data is substantial (meditation parts should be large)
        if audio_length < 100000:
            print(f"   ⚠️  WARNING: Audio data seems small for meditation part ({audio_length} chars)")
        
        print(f"   ✅ PASSED")
        return True
    except Exception as e:
        print(f"   ❌ FAILED: {str(e)}")
        return False

def main():
    print("=" * 80)
    print("BACKEND DEPLOYMENT-READINESS TEST")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    
    results = {
        "health": test_health(),
        "expand_script": test_expand_script(),
        "tts_generate_base64": test_tts_generate_base64(),
        "tts_meditation_parts": test_tts_meditation_parts(),
        "tts_meditation_audio": test_tts_meditation_audio()
    }
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED - DEPLOYMENT READY")
        return 0
    else:
        print(f"\n⚠️  {total - passed} TEST(S) FAILED - BLOCKERS DETECTED")
        return 1

if __name__ == "__main__":
    sys.exit(main())
