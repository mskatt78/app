"""Backend regression test for elemental temples endpoints and core content APIs."""
import requests
import json
import sys

# Backend URL from environment
BACKEND_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

def test_elements_vs_elemental_temples():
    """Test 1: Verify GET /api/elements returns same payload shape/count as GET /api/elemental-temples"""
    print("\n" + "="*80)
    print("TEST 1: GET /api/elements vs GET /api/elemental-temples")
    print("="*80)
    
    try:
        # Get both endpoints
        elements_response = requests.get(f"{BACKEND_URL}/elements", timeout=10)
        temples_response = requests.get(f"{BACKEND_URL}/elemental-temples", timeout=10)
        
        # Check status codes
        if elements_response.status_code != 200:
            print(f"❌ FAIL: GET /api/elements returned {elements_response.status_code}")
            return False
        
        if temples_response.status_code != 200:
            print(f"❌ FAIL: GET /api/elemental-temples returned {temples_response.status_code}")
            return False
        
        print(f"✅ Both endpoints returned 200 OK")
        
        # Parse JSON
        elements_data = elements_response.json()
        temples_data = temples_response.json()
        
        # Check if both are lists
        if not isinstance(elements_data, list):
            print(f"❌ FAIL: /api/elements returned {type(elements_data).__name__}, expected list")
            return False
        
        if not isinstance(temples_data, list):
            print(f"❌ FAIL: /api/elemental-temples returned {type(temples_data).__name__}, expected list")
            return False
        
        print(f"✅ Both endpoints returned list type")
        
        # Check count
        elements_count = len(elements_data)
        temples_count = len(temples_data)
        
        if elements_count != temples_count:
            print(f"❌ FAIL: Count mismatch - /api/elements: {elements_count}, /api/elemental-temples: {temples_count}")
            return False
        
        print(f"✅ Both endpoints returned same count: {elements_count} items")
        
        # Check payload shape (compare keys of first item if available)
        if elements_count > 0 and temples_count > 0:
            elements_keys = set(elements_data[0].keys())
            temples_keys = set(temples_data[0].keys())
            
            if elements_keys != temples_keys:
                print(f"❌ FAIL: Payload shape mismatch")
                print(f"   /api/elements keys: {sorted(elements_keys)}")
                print(f"   /api/elemental-temples keys: {sorted(temples_keys)}")
                return False
            
            print(f"✅ Both endpoints have same payload shape with keys: {sorted(elements_keys)}")
        
        # Check if payloads are identical
        if elements_data == temples_data:
            print(f"✅ Both endpoints return identical payloads")
        else:
            print(f"⚠️  WARNING: Payloads have same shape/count but different content")
        
        print(f"\n✅ TEST 1 PASSED: /api/elements and /api/elemental-temples return same payload shape and count")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred - {str(e)}")
        return False


def test_elemental_temple_by_id():
    """Test 2: Verify GET /api/elemental-temples/{id} remains unchanged"""
    print("\n" + "="*80)
    print("TEST 2: GET /api/elemental-temples/{id}")
    print("="*80)
    
    # Test with common element IDs
    test_ids = ["earth", "water", "fire", "air", "spirit"]
    
    try:
        # First get all temples to see what IDs exist
        temples_response = requests.get(f"{BACKEND_URL}/elemental-temples", timeout=10)
        if temples_response.status_code != 200:
            print(f"❌ FAIL: Could not fetch temples list")
            return False
        
        temples = temples_response.json()
        available_ids = [t.get("id") for t in temples if "id" in t]
        print(f"Available temple IDs: {available_ids}")
        
        if not available_ids:
            print(f"❌ FAIL: No temples found with 'id' field")
            return False
        
        # Test first available ID
        test_id = available_ids[0]
        print(f"\nTesting with ID: {test_id}")
        
        response = requests.get(f"{BACKEND_URL}/elemental-temples/{test_id}", timeout=10)
        
        if response.status_code != 200:
            print(f"❌ FAIL: GET /api/elemental-temples/{test_id} returned {response.status_code}")
            return False
        
        print(f"✅ GET /api/elemental-temples/{test_id} returned 200 OK")
        
        # Parse and validate response
        temple_data = response.json()
        
        if not isinstance(temple_data, dict):
            print(f"❌ FAIL: Response is {type(temple_data).__name__}, expected dict")
            return False
        
        print(f"✅ Response is dict type")
        
        # Check for expected fields
        expected_fields = ["id", "name"]
        missing_fields = [f for f in expected_fields if f not in temple_data]
        
        if missing_fields:
            print(f"⚠️  WARNING: Missing expected fields: {missing_fields}")
        else:
            print(f"✅ Response contains expected fields: {expected_fields}")
        
        # Display response keys
        print(f"Response keys: {sorted(temple_data.keys())}")
        
        # Test 404 for non-existent ID
        print(f"\nTesting 404 for non-existent ID...")
        not_found_response = requests.get(f"{BACKEND_URL}/elemental-temples/nonexistent-temple-xyz", timeout=10)
        
        if not_found_response.status_code == 404:
            print(f"✅ Non-existent ID correctly returns 404")
        else:
            print(f"⚠️  WARNING: Non-existent ID returned {not_found_response.status_code}, expected 404")
        
        print(f"\n✅ TEST 2 PASSED: GET /api/elemental-temples/{{id}} endpoint working correctly")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred - {str(e)}")
        return False


def test_core_content_endpoints():
    """Test 3: Verify core content endpoints still healthy"""
    print("\n" + "="*80)
    print("TEST 3: Core content endpoints health check")
    print("="*80)
    
    endpoints = [
        "/light-codes",
        "/courses",
        "/heart-practices"
    ]
    
    all_passed = True
    
    for endpoint in endpoints:
        try:
            print(f"\nTesting {endpoint}...")
            response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=10)
            
            if response.status_code != 200:
                print(f"❌ FAIL: {endpoint} returned {response.status_code}")
                all_passed = False
                continue
            
            print(f"✅ {endpoint} returned 200 OK")
            
            # Parse JSON
            data = response.json()
            
            # Check data type and content
            if endpoint == "/light-codes":
                if not isinstance(data, dict):
                    print(f"❌ FAIL: {endpoint} returned {type(data).__name__}, expected dict")
                    all_passed = False
                else:
                    print(f"✅ {endpoint} returned dict with {len(data)} categories")
            else:
                if not isinstance(data, list):
                    print(f"❌ FAIL: {endpoint} returned {type(data).__name__}, expected list")
                    all_passed = False
                else:
                    print(f"✅ {endpoint} returned list with {len(data)} items")
            
        except Exception as e:
            print(f"❌ FAIL: {endpoint} - Exception occurred - {str(e)}")
            all_passed = False
    
    if all_passed:
        print(f"\n✅ TEST 3 PASSED: All core content endpoints healthy")
    else:
        print(f"\n❌ TEST 3 FAILED: Some core content endpoints have issues")
    
    return all_passed


def main():
    """Run all backend regression tests."""
    print("\n" + "="*80)
    print("BACKEND REGRESSION TEST - ELEMENTAL TEMPLES & CORE CONTENT")
    print("="*80)
    print(f"Target: {BACKEND_URL}")
    
    results = {
        "test_1_elements_vs_temples": test_elements_vs_elemental_temples(),
        "test_2_temple_by_id": test_elemental_temple_by_id(),
        "test_3_core_content": test_core_content_endpoints()
    }
    
    print("\n" + "="*80)
    print("FINAL RESULTS")
    print("="*80)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n✅ ALL TESTS PASSED - No blockers detected")
        return 0
    else:
        print("\n❌ SOME TESTS FAILED - Blockers detected")
        return 1


if __name__ == "__main__":
    sys.exit(main())
