#!/usr/bin/env python3
"""
Backend API Testing Script - Audio Router Verification
Tests audio endpoints after enabling audio router in server.py
"""

import requests
import json
import sys

# Base URL from environment
BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

def test_audio_voices():
    """
    Test 1: GET /api/audio/voices
    - Should return 200
    - Should return list of voice options
    - Should include default voice
    """
    print("\n" + "="*80)
    print("TEST 1: Audio Voices Endpoint")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/audio/voices", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response keys: {list(data.keys())}")
        
        # Check for voices list
        if 'voices' not in data:
            print(f"❌ FAILED: Response missing 'voices' key")
            return False
        
        voices = data['voices']
        print(f"Total voices available: {len(voices)}")
        
        if len(voices) == 0:
            print(f"❌ FAILED: No voices returned")
            return False
        
        # Check for default voice
        if 'default' not in data:
            print(f"❌ FAILED: Response missing 'default' key")
            return False
        
        print(f"Default voice: {data['default']}")
        
        # Print first few voices
        print(f"\nSample voices:")
        for voice in voices[:3]:
            print(f"  - {voice.get('name')} ({voice.get('id')}): {voice.get('description')}")
        
        print(f"\n✅ TEST 1 PASSED: Audio voices endpoint working correctly")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Request error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {e}")
        return False


def test_audio_meditation_scripts():
    """
    Test 2: GET /api/audio/meditation-scripts
    - Should return 200
    - Should return list of meditation scripts
    """
    print("\n" + "="*80)
    print("TEST 2: Audio Meditation Scripts Endpoint")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/audio/meditation-scripts", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response keys: {list(data.keys())}")
        
        # Check for scripts list
        if 'scripts' not in data:
            print(f"❌ FAILED: Response missing 'scripts' key")
            return False
        
        scripts = data['scripts']
        print(f"Total scripts available: {len(scripts)}")
        
        if len(scripts) == 0:
            print(f"❌ FAILED: No scripts returned")
            return False
        
        # Print all scripts
        print(f"\nAvailable meditation scripts:")
        for script in scripts:
            print(f"  - {script.get('name')} ({script.get('id')}): {script.get('duration_estimate')}")
        
        print(f"\n✅ TEST 2 PASSED: Audio meditation scripts endpoint working correctly")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Request error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {e}")
        return False


def test_health_endpoint():
    """
    Test 3: GET /api/health
    - Core health endpoint sanity check
    - Should return 200
    """
    print("\n" + "="*80)
    print("TEST 3: Health Endpoint Sanity Check")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('status') != 'healthy':
            print(f"❌ FAILED: Health status is not 'healthy'")
            return False
        
        print(f"✅ TEST 3 PASSED: Health endpoint working correctly")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Request error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {e}")
        return False


def main():
    """Run all backend tests"""
    print("\n" + "="*80)
    print("BACKEND API TESTING - AUDIO ROUTER VERIFICATION")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Testing after enabling audio router in server.py")
    
    results = {
        "Audio Voices Endpoint": test_audio_voices(),
        "Audio Meditation Scripts Endpoint": test_audio_meditation_scripts(),
        "Health Endpoint": test_health_endpoint()
    }
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    # Check for 500 errors
    has_500_errors = False
    for test_name, result in results.items():
        if not result:
            print(f"⚠️  Check if {test_name} returned 500 error")
            has_500_errors = True
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED - No 500 errors detected")
        print("✓ Audio router successfully enabled in server.py")
        print("✓ GET /api/audio/voices returns 200 with voice options")
        print("✓ GET /api/audio/meditation-scripts returns 200")
        print("✓ GET /api/health returns 200")
        sys.exit(0)
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        if has_500_errors:
            print("❌ Possible 500 errors detected - check backend logs")
        sys.exit(1)


if __name__ == "__main__":
    main()
