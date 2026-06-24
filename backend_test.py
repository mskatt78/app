#!/usr/bin/env python3
"""
Backend regression test for final pass
Tests:
1. GET /api/retreats returns 200 and empty list
2. POST /api/content/expand-script with target_minutes=7, use_ai=false returns word_count >= 840
3. GET /api/health returns 200
"""

import requests
import json

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"

def test_retreats_endpoint():
    """Test GET /api/retreats returns 200 and empty list"""
    print("\n=== Testing GET /api/retreats ===")
    try:
        response = requests.get(f"{BASE_URL}/api/retreats", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {data}")
        
        if not isinstance(data, list):
            print(f"❌ FAIL: Expected list, got {type(data)}")
            return False
        
        if len(data) != 0:
            print(f"❌ FAIL: Expected empty list, got {len(data)} items")
            return False
        
        print("✅ PASS: Returns 200 and empty list")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def test_expand_script_endpoint():
    """Test POST /api/content/expand-script with target_minutes=7, use_ai=false"""
    print("\n=== Testing POST /api/content/expand-script ===")
    try:
        payload = {
            "practice_name": "Test Practice",
            "duration_minutes": 7,
            "use_ai": False,
            "steps": [
                "Welcome to this practice",
                "Take a deep breath",
                "Feel the energy flowing"
            ],
            "source_texts": [
                "This is a grounding practice to connect with the earth",
                "Feel your body rooted and stable"
            ]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json=payload,
            timeout=15
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response keys: {data.keys()}")
        
        # Check for word_count field
        if "word_count" not in data:
            print(f"❌ FAIL: Missing 'word_count' field in response")
            return False
        
        word_count = data["word_count"]
        target_minutes = data.get("target_minutes", 0)
        print(f"Target minutes: {target_minutes}")
        print(f"Word count: {word_count}")
        
        # Check if word_count >= 840 (7 minutes * 120 words/minute)
        if word_count < 840:
            print(f"❌ FAIL: word_count {word_count} < 840")
            return False
        
        print(f"✅ PASS: Returns 200 with word_count={word_count} >= 840")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def test_health_endpoint():
    """Test GET /api/health returns 200"""
    print("\n=== Testing GET /api/health ===")
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {data}")
        
        print("✅ PASS: Returns 200")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def main():
    print("=" * 60)
    print("BACKEND REGRESSION TEST - FINAL PASS")
    print("=" * 60)
    
    results = {
        "retreats": test_retreats_endpoint(),
        "expand_script": test_expand_script_endpoint(),
        "health": test_health_endpoint()
    }
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ ALL BACKEND TESTS PASSED")
    else:
        print("❌ SOME BACKEND TESTS FAILED")
    print("=" * 60)
    
    return all_passed

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
