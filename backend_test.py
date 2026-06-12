#!/usr/bin/env python3
"""
Backend test for numerology endpoints after date validation fix.
Tests:
1) GET /api/numerology/life-paths non-empty
2) POST /api/numerology/calculate valid date still works
3) POST /api/numerology/calculate invalid date (e.g. 2025-13-45) now returns 400
4) Name payload still returns expression + soul_urge
"""

import requests
import json

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

def test_life_paths_non_empty():
    """Test 1: GET /api/numerology/life-paths returns non-empty data"""
    print("\n" + "="*80)
    print("TEST 1: GET /api/numerology/life-paths non-empty")
    print("="*80)
    
    url = f"{BASE_URL}/numerology/life-paths"
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ FAILED: Expected 200, got {response.status_code}")
        return False
    
    data = response.json()
    
    if not data or len(data) == 0:
        print(f"❌ FAILED: Response is empty")
        return False
    
    print(f"✅ PASSED: Response contains {len(data)} life paths")
    print(f"Sample life paths: {list(data.keys())[:5]}")
    
    # Verify structure of first life path
    first_key = list(data.keys())[0]
    first_path = data[first_key]
    required_fields = ['number', 'name', 'description', 'traits']
    
    for field in required_fields:
        if field not in first_path:
            print(f"❌ FAILED: Missing required field '{field}' in life path data")
            return False
    
    print(f"✅ Life path structure verified with required fields: {required_fields}")
    return True


def test_calculate_valid_date():
    """Test 2: POST /api/numerology/calculate with valid date works"""
    print("\n" + "="*80)
    print("TEST 2: POST /api/numerology/calculate with valid date")
    print("="*80)
    
    url = f"{BASE_URL}/numerology/calculate"
    payload = {
        "birth_date": "1990-06-15"
    }
    
    print(f"Payload: {json.dumps(payload, indent=2)}")
    response = requests.post(url, json=payload)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ FAILED: Expected 200, got {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    data = response.json()
    
    # Verify required fields
    required_fields = ['birth_date', 'life_path_number', 'life_path', 'personal_year']
    for field in required_fields:
        if field not in data:
            print(f"❌ FAILED: Missing required field '{field}'")
            return False
    
    print(f"✅ PASSED: Valid date calculation successful")
    print(f"Life Path Number: {data['life_path_number']}")
    print(f"Life Path Name: {data['life_path'].get('name', 'N/A')}")
    print(f"Personal Year: {data['personal_year'].get('number', 'N/A')} - {data['personal_year'].get('theme', 'N/A')}")
    return True


def test_calculate_invalid_date():
    """Test 3: POST /api/numerology/calculate with invalid date returns 400"""
    print("\n" + "="*80)
    print("TEST 3: POST /api/numerology/calculate with invalid date (2025-13-45)")
    print("="*80)
    
    url = f"{BASE_URL}/numerology/calculate"
    payload = {
        "birth_date": "2025-13-45"
    }
    
    print(f"Payload: {json.dumps(payload, indent=2)}")
    response = requests.post(url, json=payload)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print(f"❌ FAILED: Invalid date was accepted (returned 200)")
        print(f"Response: {response.text[:200]}")
        return False
    
    if response.status_code == 400:
        print(f"✅ PASSED: Invalid date correctly rejected with 400")
        try:
            error_data = response.json()
            print(f"Error message: {error_data.get('detail', 'No detail provided')}")
        except:
            print(f"Response text: {response.text[:200]}")
        return True
    
    print(f"⚠️  UNEXPECTED: Got status code {response.status_code} (expected 400)")
    print(f"Response: {response.text[:200]}")
    return False


def test_calculate_with_name():
    """Test 4: POST /api/numerology/calculate with name returns expression + soul_urge"""
    print("\n" + "="*80)
    print("TEST 4: POST /api/numerology/calculate with name (expression + soul_urge)")
    print("="*80)
    
    url = f"{BASE_URL}/numerology/calculate"
    payload = {
        "birth_date": "1985-03-20",
        "full_name": "Sarah Elizabeth Johnson"
    }
    
    print(f"Payload: {json.dumps(payload, indent=2)}")
    response = requests.post(url, json=payload)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ FAILED: Expected 200, got {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    data = response.json()
    
    # Verify expression and soul_urge fields
    if 'expression' not in data:
        print(f"❌ FAILED: Missing 'expression' field")
        return False
    
    if 'soul_urge' not in data:
        print(f"❌ FAILED: Missing 'soul_urge' field")
        return False
    
    # Verify expression structure
    expression = data['expression']
    if 'number' not in expression or 'description' not in expression:
        print(f"❌ FAILED: Expression missing required fields (number, description)")
        return False
    
    # Verify soul_urge structure
    soul_urge = data['soul_urge']
    if 'number' not in soul_urge or 'description' not in soul_urge:
        print(f"❌ FAILED: Soul urge missing required fields (number, description)")
        return False
    
    print(f"✅ PASSED: Name calculation successful with expression and soul_urge")
    print(f"Expression Number: {expression['number']}")
    print(f"Soul Urge Number: {soul_urge['number']}")
    return True


def main():
    """Run all tests and report results"""
    print("\n" + "="*80)
    print("NUMEROLOGY BACKEND RE-TEST AFTER DATE VALIDATION FIX")
    print("="*80)
    
    results = {
        "Test 1: GET /api/numerology/life-paths non-empty": test_life_paths_non_empty(),
        "Test 2: POST /api/numerology/calculate valid date": test_calculate_valid_date(),
        "Test 3: POST /api/numerology/calculate invalid date returns 400": test_calculate_invalid_date(),
        "Test 4: POST /api/numerology/calculate with name (expression + soul_urge)": test_calculate_with_name()
    }
    
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED - Date validation fix verified!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    exit(main())
