#!/usr/bin/env python3
"""
Backend Smoke Check - Final Verification
Tests 5 critical endpoints before closure.
"""
import requests
import json
import sys

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

def test_elements():
    """Test /api/elements endpoint"""
    print("\n1. Testing GET /api/elements...")
    try:
        response = requests.get(f"{BASE_URL}/elements", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ PASS - Returns {type(data).__name__}")
            if isinstance(data, list):
                print(f"   ✓ PASS - List with {len(data)} items")
            elif isinstance(data, dict):
                print(f"   ✓ PASS - Dict with keys: {list(data.keys())[:5]}")
            return True
        elif response.status_code == 404:
            print(f"   ❌ FAIL - Endpoint not found (404)")
            print(f"   BLOCKER: /api/elements endpoint does not exist")
            return False
        else:
            print(f"   ❌ FAIL - Unexpected status: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"   ❌ FAIL - Exception: {e}")
        return False


def test_light_codes():
    """Test /api/light-codes endpoint"""
    print("\n2. Testing GET /api/light-codes...")
    try:
        response = requests.get(f"{BASE_URL}/light-codes", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ PASS - Returns {type(data).__name__}")
            if isinstance(data, dict):
                categories = list(data.keys())
                print(f"   ✓ PASS - {len(categories)} categories: {categories[:3]}")
            return True
        else:
            print(f"   ❌ FAIL - Status: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"   ❌ FAIL - Exception: {e}")
        return False


def test_heart_practices():
    """Test /api/heart-practices endpoint"""
    print("\n3. Testing GET /api/heart-practices...")
    try:
        response = requests.get(f"{BASE_URL}/heart-practices", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ PASS - Returns list with {len(data)} items")
            return True
        else:
            print(f"   ❌ FAIL - Status: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"   ❌ FAIL - Exception: {e}")
        return False


def test_courses():
    """Test /api/courses endpoint"""
    print("\n4. Testing GET /api/courses...")
    try:
        response = requests.get(f"{BASE_URL}/courses", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ PASS - Returns list with {len(data)} items")
            return True
        else:
            print(f"   ❌ FAIL - Status: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"   ❌ FAIL - Exception: {e}")
        return False


def test_expand_script():
    """Test /api/content/expand-script endpoint"""
    print("\n5. Testing POST /api/content/expand-script...")
    try:
        payload = {
            "practice_name": "Sacred Heart Opening",
            "duration_minutes": 10,
            "steps": ["Welcome to this sacred practice", "Take a deep breath", "Feel your heart center"],
            "use_ai": False
        }
        response = requests.post(
            f"{BASE_URL}/content/expand-script",
            json=payload,
            timeout=15
        )
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["target_minutes", "target_word_count", "word_count"]
            missing = [f for f in required_fields if f not in data]
            
            if missing:
                print(f"   ❌ FAIL - Missing fields: {missing}")
                return False
            
            print(f"   ✓ PASS - All required fields present")
            print(f"   target_minutes: {data['target_minutes']}")
            print(f"   target_word_count: {data['target_word_count']}")
            print(f"   word_count: {data['word_count']}")
            
            # Validate word count meets threshold
            threshold = data['target_word_count'] * 0.8
            if data['word_count'] >= threshold:
                print(f"   ✓ PASS - word_count ({data['word_count']}) >= 0.8 * target ({threshold:.0f})")
                return True
            else:
                print(f"   ❌ FAIL - word_count ({data['word_count']}) < 0.8 * target ({threshold:.0f})")
                return False
        else:
            print(f"   ❌ FAIL - Status: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"   ❌ FAIL - Exception: {e}")
        return False


def main():
    print("=" * 60)
    print("BACKEND SMOKE CHECK - FINAL VERIFICATION")
    print("=" * 60)
    
    results = {
        "elements": test_elements(),
        "light-codes": test_light_codes(),
        "heart-practices": test_heart_practices(),
        "courses": test_courses(),
        "expand-script": test_expand_script()
    }
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for endpoint, result in results.items():
        status = "✓ PASS" if result else "❌ FAIL"
        print(f"{status} - /api/{endpoint}")
    
    print(f"\nTotal: {passed}/{total} endpoints passed")
    
    if passed == total:
        print("\n✅ ALL TESTS PASSED - No blockers detected")
        sys.exit(0)
    else:
        print("\n❌ SOME TESTS FAILED - See blockers above")
        sys.exit(1)


if __name__ == "__main__":
    main()
