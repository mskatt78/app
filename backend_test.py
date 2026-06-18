#!/usr/bin/env python3
"""
Backend Regression Test - Iteration: Guided Playback Overlap Guards & Voice Notes
Test URL: https://breathwork-sanctuary.preview.emergentagent.com
"""

import requests
import json
import sys

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"

def test_health_endpoint():
    """Test 1: GET /api/health should return 200"""
    print("\n" + "="*80)
    print("TEST 1: GET /api/health")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify expected fields
            if 'status' in data and data['status'] == 'healthy':
                print("✅ PASS: Health endpoint returns 200 with 'healthy' status")
                return True
            else:
                print("❌ FAIL: Health endpoint missing 'status' field or not 'healthy'")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {str(e)}")
        return False


def test_expand_script_endpoint():
    """Test 2: POST /api/content/expand-script with guided payload"""
    print("\n" + "="*80)
    print("TEST 2: POST /api/content/expand-script")
    print("="*80)
    
    payload = {
        "practice_type": "meditation",
        "practice_name": "Peaceful Breath Meditation",
        "target_minutes": 5,
        "segments": [
            {
                "name": "Opening",
                "duration_minutes": 1,
                "brief_guidance": "Begin by finding a comfortable seated position"
            },
            {
                "name": "Breath Awareness",
                "duration_minutes": 3,
                "brief_guidance": "Focus on the natural rhythm of your breath"
            },
            {
                "name": "Closing",
                "duration_minutes": 1,
                "brief_guidance": "Gently return your awareness to the room"
            }
        ],
        "use_ai": False
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            
            # Verify expected fields
            required_fields = ['target_minutes', 'target_word_count', 'word_count', 'paragraphs']
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                print(f"❌ FAIL: Missing required fields: {missing_fields}")
                return False
            
            print(f"Target Minutes: {data['target_minutes']}")
            print(f"Target Word Count: {data['target_word_count']}")
            print(f"Actual Word Count: {data['word_count']}")
            print(f"Paragraphs/Segments: {len(data['paragraphs'])} segments")
            
            # Verify word count meets threshold (>= 80% of target)
            threshold = data['target_word_count'] * 0.8
            if data['word_count'] >= threshold:
                print(f"✅ PASS: Expand-script returns valid response with paragraphs/segments")
                print(f"   Word count {data['word_count']} >= threshold {threshold:.0f}")
                return True
            else:
                print(f"❌ FAIL: Word count {data['word_count']} < threshold {threshold:.0f}")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {str(e)}")
        return False


def test_tts_endpoint():
    """Test 3: POST /api/tts/generate-base64 with short text"""
    print("\n" + "="*80)
    print("TEST 3: POST /api/tts/generate-base64")
    print("="*80)
    
    payload = {
        "text": "Welcome to your guided meditation practice. Take a deep breath and relax.",
        "voice": "alloy"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/tts/generate-base64",
            json=payload,
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            
            # Verify audio_base64 field exists
            if 'audio_base64' not in data:
                print("❌ FAIL: Missing 'audio_base64' field in response")
                return False
            
            audio_base64 = data['audio_base64']
            audio_length = len(audio_base64)
            print(f"Audio Base64 Length: {audio_length} characters")
            
            # Verify audio_base64 is not empty and looks valid
            if audio_length > 1000:  # Should be substantial for the given text
                print(f"✅ PASS: TTS endpoint returns audio_base64 ({audio_length} chars)")
                return True
            else:
                print(f"❌ FAIL: audio_base64 too short ({audio_length} chars)")
                return False
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {str(e)}")
        return False


def main():
    print("\n" + "="*80)
    print("BACKEND REGRESSION TEST - Guided Playback & Voice Notes Iteration")
    print("="*80)
    print(f"Test URL: {BASE_URL}")
    
    results = []
    
    # Run all tests
    results.append(("Health Endpoint", test_health_endpoint()))
    results.append(("Expand Script Endpoint", test_expand_script_endpoint()))
    results.append(("TTS Endpoint", test_tts_endpoint()))
    
    # Summary
    print("\n" + "="*80)
    print("BACKEND TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✅ ALL BACKEND SMOKE TESTS PASSED")
        return 0
    else:
        print(f"\n❌ {total - passed} BACKEND TEST(S) FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())
