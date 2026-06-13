#!/usr/bin/env python3
"""
Backend sanity test for decomposition wave.
Tests:
1) GET /api/reviews
2) GET /api/reviews/stats
3) GET /api/light-codes
4) GET /api/heart-practices
5) GET /api/courses
6) GET /api/sound-frequencies
7) GET /api/numerology/life-paths
8) POST /api/numerology/calculate (valid date)
9) POST /api/numerology/calculate (invalid date)
"""

import requests
import json

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

def test_reviews():
    """Test 1: GET /api/reviews"""
    print("\n" + "="*80)
    print("TEST 1: GET /api/reviews")
    print("="*80)
    
    url = f"{BASE_URL}/reviews"
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ FAILED: Expected 200, got {response.status_code}")
        print(f"Response: {response.text[:200]}")
        return False
    
    data = response.json()
    
    if not isinstance(data, list):
        print(f"❌ FAILED: Expected list, got {type(data)}")
        return False
    
    print(f"✅ PASSED: Response is a list with {len(data)} reviews")
    
    # Check structure if reviews exist
    if len(data) > 0:
        first_review = data[0]
        required_fields = ['review_id', 'user_name', 'rating', 'text']
        for field in required_fields:
            if field not in first_review:
                print(f"⚠️  WARNING: Missing field '{field}' in review")
        print(f"Sample review: rating={first_review.get('rating')}, user={first_review.get('user_name')}")
    
    return True


def test_reviews_stats():
    """Test 2: GET /api/reviews/stats"""
    print("\n" + "="*80)
    print("TEST 2: GET /api/reviews/stats")
    print("="*80)
    
    url = f"{BASE_URL}/reviews/stats"
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ FAILED: Expected 200, got {response.status_code}")
        print(f"Response: {response.text[:200]}")
        return False
    
    data = response.json()
    
    required_fields = ['average', 'total', 'breakdown']
    for field in required_fields:
        if field not in data:
            print(f"❌ FAILED: Missing required field '{field}'")
            return False
    
    print(f"✅ PASSED: Stats returned successfully")
    print(f"Average: {data['average']}, Total: {data['total']}")
    print(f"Breakdown: {data['breakdown']}")
    return True


def test_light_codes():
    """Test 3: GET /api/light-codes"""
    print("\n" + "="*80)
    print("TEST 3: GET /api/light-codes")
    print("="*80)
    
    url = f"{BASE_URL}/light-codes"
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ FAILED: Expected 200, got {response.status_code}")
        print(f"Response: {response.text[:200]}")
        return False
    
    data = response.json()
    
    if not isinstance(data, dict):
        print(f"❌ FAILED: Expected dict, got {type(data)}")
        return False
    
    # Check for expected categories
    expected_categories = ['sacred_geometry', 'ancient_alphabets', 'light_language_symbols', 'galactic_codes', 'chakra_codes']
    found_categories = [cat for cat in expected_categories if cat in data]
    
    print(f"✅ PASSED: Light codes returned with {len(data)} categories")
    print(f"Found categories: {found_categories}")
    
    if len(found_categories) < len(expected_categories):
        missing = set(expected_categories) - set(found_categories)
        print(f"⚠️  WARNING: Missing categories: {missing}")
    
    return True


def test_heart_practices():
    """Test 4: GET /api/heart-practices"""
    print("\n" + "="*80)
    print("TEST 4: GET /api/heart-practices")
    print("="*80)
    
    url = f"{BASE_URL}/heart-practices"
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ FAILED: Expected 200, got {response.status_code}")
        print(f"Response: {response.text[:200]}")
        return False
    
    data = response.json()
    
    if not isinstance(data, list):
        print(f"❌ FAILED: Expected list, got {type(data)}")
        return False
    
    print(f"✅ PASSED: Heart practices returned with {len(data)} items")
    
    # Check structure if practices exist
    if len(data) > 0:
        first_practice = data[0]
        print(f"Sample practice: {first_practice.get('name', 'N/A')}")
        if 'content_integrity' in first_practice:
            print(f"Content integrity present: {first_practice['content_integrity']}")
    
    return True


def test_courses():
    """Test 5: GET /api/courses"""
    print("\n" + "="*80)
    print("TEST 5: GET /api/courses")
    print("="*80)
    
    url = f"{BASE_URL}/courses"
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ FAILED: Expected 200, got {response.status_code}")
        print(f"Response: {response.text[:200]}")
        return False
    
    data = response.json()
    
    if not isinstance(data, list):
        print(f"❌ FAILED: Expected list, got {type(data)}")
        return False
    
    print(f"✅ PASSED: Courses returned with {len(data)} items")
    
    # Check structure if courses exist
    if len(data) > 0:
        first_course = data[0]
        print(f"Sample course: {first_course.get('name', 'N/A')}")
        if 'content_integrity' in first_course:
            print(f"Content integrity present: {first_course['content_integrity']}")
    
    return True


def test_sound_frequencies():
    """Test 6: GET /api/sound-frequencies"""
    print("\n" + "="*80)
    print("TEST 6: GET /api/sound-frequencies")
    print("="*80)
    
    url = f"{BASE_URL}/sound-frequencies"
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ FAILED: Expected 200, got {response.status_code}")
        print(f"Response: {response.text[:200]}")
        return False
    
    data = response.json()
    
    if not isinstance(data, list):
        print(f"❌ FAILED: Expected list, got {type(data)}")
        return False
    
    print(f"✅ PASSED: Sound frequencies returned with {len(data)} items")
    
    # Check structure if frequencies exist
    if len(data) > 0:
        first_freq = data[0]
        print(f"Sample frequency: {first_freq.get('name', 'N/A')} - {first_freq.get('frequency', 'N/A')} Hz")
    
    return True


def test_numerology_life_paths():
    """Test 7: GET /api/numerology/life-paths"""
    print("\n" + "="*80)
    print("TEST 7: GET /api/numerology/life-paths")
    print("="*80)
    
    url = f"{BASE_URL}/numerology/life-paths"
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ FAILED: Expected 200, got {response.status_code}")
        print(f"Response: {response.text[:200]}")
        return False
    
    data = response.json()
    
    if not isinstance(data, dict):
        print(f"❌ FAILED: Expected dict, got {type(data)}")
        return False
    
    if len(data) == 0:
        print(f"❌ FAILED: Response is empty")
        return False
    
    print(f"✅ PASSED: Life paths returned with {len(data)} entries")
    print(f"Sample life paths: {list(data.keys())[:5]}")
    
    return True


def test_numerology_calculate_valid():
    """Test 8: POST /api/numerology/calculate with valid date"""
    print("\n" + "="*80)
    print("TEST 8: POST /api/numerology/calculate with valid date")
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
        print(f"Response: {response.text[:200]}")
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
    return True


def test_numerology_calculate_invalid():
    """Test 9: POST /api/numerology/calculate with invalid date"""
    print("\n" + "="*80)
    print("TEST 9: POST /api/numerology/calculate with invalid date")
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


def main():
    """Run all tests and report results"""
    print("\n" + "="*80)
    print("BACKEND SANITY TEST - DECOMPOSITION WAVE")
    print("="*80)
    
    results = {
        "Test 1: GET /api/reviews": test_reviews(),
        "Test 2: GET /api/reviews/stats": test_reviews_stats(),
        "Test 3: GET /api/light-codes": test_light_codes(),
        "Test 4: GET /api/heart-practices": test_heart_practices(),
        "Test 5: GET /api/courses": test_courses(),
        "Test 6: GET /api/sound-frequencies": test_sound_frequencies(),
        "Test 7: GET /api/numerology/life-paths": test_numerology_life_paths(),
        "Test 8: POST /api/numerology/calculate (valid date)": test_numerology_calculate_valid(),
        "Test 9: POST /api/numerology/calculate (invalid date)": test_numerology_calculate_invalid(),
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
        print("\n🎉 ALL TESTS PASSED - Decomposition wave sanity check complete!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    exit(main())
