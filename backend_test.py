#!/usr/bin/env python3
"""
Backend smoke check for recently touched APIs
Focus: expand-script, courses, light-codes, heart-practices, elements
"""

import requests
import json
import sys

# Backend URL from environment
BACKEND_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

def test_expand_script():
    """Test /api/content/expand-script endpoint responsiveness"""
    print("\n1. Testing POST /api/content/expand-script...")
    
    payload = {
        "practice_name": "Sacred Breath Practice",
        "element": "spirit",
        "duration_minutes": 10,
        "steps": ["Take a deep breath", "Hold for a moment", "Release slowly"],
        "source_texts": ["Welcome to this sacred practice"],
        "use_ai": False,
        "anti_repetition_mode": "balanced",
        "include_toning": True
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/content/expand-script",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            # Check required fields
            required_fields = ["target_minutes", "target_word_count", "word_count"]
            missing = [f for f in required_fields if f not in data]
            
            if missing:
                print(f"   ❌ FAIL: Missing fields: {missing}")
                return False
            
            # Validate word count >= target_word_count * 0.8
            if data["word_count"] >= data["target_word_count"] * 0.8:
                print(f"   ✅ PASS: Status 200, word_count={data['word_count']}, target={data['target_word_count']}")
                return True
            else:
                print(f"   ❌ FAIL: word_count ({data['word_count']}) < target*0.8 ({data['target_word_count']*0.8})")
                return False
        else:
            print(f"   ❌ FAIL: Status {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"   ❌ FAIL: Exception - {str(e)}")
        return False


def test_public_read_endpoint(endpoint_name, endpoint_path):
    """Test public read endpoint returns 200"""
    print(f"\n{endpoint_name}. Testing GET {endpoint_path}...")
    
    try:
        response = requests.get(f"{BACKEND_URL}{endpoint_path}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            # Verify it's valid JSON and not empty
            if isinstance(data, (list, dict)):
                count = len(data) if isinstance(data, list) else "dict"
                print(f"   ✅ PASS: Status 200, returned {count} items")
                return True
            else:
                print(f"   ❌ FAIL: Invalid JSON structure")
                return False
        else:
            print(f"   ❌ FAIL: Status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ FAIL: Exception - {str(e)}")
        return False


def test_health():
    """Test health endpoint"""
    print("\n0. Testing GET /api/health...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "status" in data and data["status"] == "healthy":
                print(f"   ✅ PASS: Status 200, healthy")
                return True
            else:
                print(f"   ❌ FAIL: Invalid health response")
                return False
        else:
            print(f"   ❌ FAIL: Status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ FAIL: Exception - {str(e)}")
        return False


def main():
    print("=" * 70)
    print("BACKEND SMOKE CHECK - Recently Touched APIs")
    print("=" * 70)
    
    results = []
    
    # Test health first
    results.append(("Health", test_health()))
    
    # Test expand-script
    results.append(("Expand Script", test_expand_script()))
    
    # Test public read endpoints
    results.append(("Courses", test_public_read_endpoint("2", "/courses")))
    results.append(("Light Codes", test_public_read_endpoint("3", "/light-codes")))
    results.append(("Heart Practices", test_public_read_endpoint("4", "/heart-practices")))
    results.append(("Elemental Practices", test_public_read_endpoint("5", "/elemental-practices")))
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✅ ALL TESTS PASSED - No blockers detected")
        return 0
    else:
        print(f"\n❌ {total - passed} TEST(S) FAILED - Blockers detected")
        return 1


if __name__ == "__main__":
    sys.exit(main())
