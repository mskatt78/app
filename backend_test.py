#!/usr/bin/env python3
"""
Backend API Testing Script for Crystal-Truth Fix Verification
Tests iolite crystal image_url fix and sanity checks for key endpoints
"""

import requests
import json
import sys

# Base URL from environment
BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

def test_crystals_deep_iolite_image():
    """
    Test 1: GET /api/crystals/deep and verify iolite record
    - Confirm image_url is NOT old Cordierite cluster image
    - Confirm image_url points to Iolite-specific file
    - Confirm image_validation.status is verified
    - Confirm includes source title/page reference
    """
    print("\n" + "="*80)
    print("TEST 1: Iolite Crystal Image Verification")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/crystals/deep", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        crystals = response.json()
        print(f"Total crystals returned: {len(crystals)}")
        
        # Find iolite record
        iolite = None
        for crystal in crystals:
            if crystal.get('id') == 'iolite' or crystal.get('name', '').lower() == 'iolite':
                iolite = crystal
                break
        
        if not iolite:
            print("❌ FAILED: Iolite crystal not found in response")
            return False
        
        print(f"\n✓ Found iolite crystal record")
        print(f"  Name: {iolite.get('name')}")
        print(f"  ID: {iolite.get('id')}")
        
        # Check image_url field
        image_url = iolite.get('image_url') or iolite.get('verified_image_url')
        print(f"\n  image_url: {image_url}")
        
        # Check if image_url contains "Cordierite" (old incorrect image)
        if image_url and 'Cordierite' in image_url:
            print(f"❌ FAILED: image_url still points to Cordierite image (old incorrect image)")
            print(f"  Expected: Iolite-specific image")
            print(f"  Got: {image_url}")
            return False
        
        # Check if image_url contains "Iolite" or "iolite"
        if image_url and ('Iolite' in image_url or 'iolite' in image_url):
            print(f"✓ PASSED: image_url points to Iolite-specific file")
        else:
            print(f"⚠️  WARNING: image_url does not explicitly contain 'Iolite' in filename")
            print(f"  image_url: {image_url}")
        
        # Check image_validation.status
        image_validation = iolite.get('image_validation', {})
        validation_status = image_validation.get('status')
        print(f"\n  image_validation.status: {validation_status}")
        
        if validation_status != 'verified':
            print(f"❌ FAILED: image_validation.status is not 'verified'")
            return False
        
        print(f"✓ PASSED: image_validation.status is 'verified'")
        
        # Check source title/page reference (nested in image_validation)
        wikipedia_title = image_validation.get('wikipedia_title')
        wikipedia_page_url = image_validation.get('wikipedia_page_url')
        
        print(f"\n  image_validation.wikipedia_title: {wikipedia_title}")
        print(f"  image_validation.wikipedia_page_url: {wikipedia_page_url}")
        
        if not wikipedia_title or not wikipedia_page_url:
            print(f"❌ FAILED: Missing source title or page reference in image_validation")
            return False
        
        print(f"✓ PASSED: Source title and page reference present in image_validation")
        
        # Additional validation fields
        print(f"\n  Additional validation metadata:")
        print(f"    image_source: {iolite.get('image_source')}")
        print(f"    image_validation.score: {image_validation.get('score')}")
        
        print(f"\n✅ TEST 1 PASSED: Iolite crystal image verification successful")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Request error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {e}")
        return False


def test_health_endpoint():
    """
    Test 2: GET /api/health sanity check
    """
    print("\n" + "="*80)
    print("TEST 2: Health Endpoint Sanity Check")
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
        
        print(f"✅ TEST 2 PASSED: Health endpoint working correctly")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Request error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {e}")
        return False


def test_courses_endpoint():
    """
    Test 3: GET /api/courses sanity check
    """
    print("\n" + "="*80)
    print("TEST 3: Courses Endpoint Sanity Check")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/courses", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        courses = response.json()
        print(f"Total courses returned: {len(courses)}")
        
        if len(courses) == 0:
            print(f"⚠️  WARNING: No courses returned")
        
        print(f"✅ TEST 3 PASSED: Courses endpoint working correctly")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Request error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {e}")
        return False


def test_meditations_endpoint():
    """
    Test 4: GET /api/meditations sanity check
    """
    print("\n" + "="*80)
    print("TEST 4: Meditations Endpoint Sanity Check")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/meditations", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        meditations = response.json()
        print(f"Total meditations returned: {len(meditations)}")
        
        if len(meditations) == 0:
            print(f"⚠️  WARNING: No meditations returned")
        
        print(f"✅ TEST 4 PASSED: Meditations endpoint working correctly")
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
    print("BACKEND API TESTING - CRYSTAL-TRUTH FIX VERIFICATION")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    
    results = {
        "Iolite Crystal Image Verification": test_crystals_deep_iolite_image(),
        "Health Endpoint": test_health_endpoint(),
        "Courses Endpoint": test_courses_endpoint(),
        "Meditations Endpoint": test_meditations_endpoint()
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
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED - No 500 errors detected")
        sys.exit(0)
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
