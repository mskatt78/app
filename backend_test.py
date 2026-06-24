#!/usr/bin/env python3
"""
Backend validation test for CSV bulk upload + safety notes
Tests:
1. POST /api/admin/tutorial-overrides/bulk-upload exists and enforces CSV validation
2. Supported collections include mantras, mudras, yoga_poses, breathwork_sessions, meditations
3. safety_notes field is accepted and persisted via bulk upload logic
4. Confirm no 500 errors in related admin/content endpoints
"""

import requests
import json
import io
import csv

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"
ADMIN_PASSWORD = "ShamanicAdmin2026!"

def get_admin_token():
    """Get admin token by logging in with password"""
    print("\n=== Getting Admin Token ===")
    try:
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Admin login failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return None
        
        # Get the admin_session cookie
        cookies = response.cookies
        admin_session = cookies.get("admin_session")
        
        if not admin_session:
            print(f"❌ FAIL: No admin_session cookie returned")
            return None
        
        print(f"✅ SUCCESS: Got admin token")
        return admin_session
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return None

def test_bulk_upload_csv_validation(admin_token):
    """Test 1: POST /api/admin/tutorial-overrides/bulk-upload enforces CSV validation"""
    print("\n=== Test 1: CSV Validation ===")
    
    # Test 1a: Non-CSV file should fail
    print("\n--- Test 1a: Non-CSV file rejection ---")
    try:
        files = {"file": ("test.txt", "not a csv", "text/plain")}
        cookies = {"admin_session": admin_token}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/tutorial-overrides/bulk-upload",
            files=files,
            cookies=cookies,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 400:
            print(f"❌ FAIL: Expected 400 for non-CSV file, got {response.status_code}")
            return False
        
        data = response.json()
        if "csv" not in data.get("detail", "").lower():
            print(f"❌ FAIL: Expected CSV validation error message")
            return False
        
        print(f"✅ PASS: Non-CSV file rejected with 400")
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False
    
    # Test 1b: Empty CSV should fail
    print("\n--- Test 1b: Empty CSV rejection ---")
    try:
        files = {"file": ("test.csv", "", "text/csv")}
        cookies = {"admin_session": admin_token}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/tutorial-overrides/bulk-upload",
            files=files,
            cookies=cookies,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 400:
            print(f"❌ FAIL: Expected 400 for empty CSV, got {response.status_code}")
            return False
        
        data = response.json()
        if "empty" not in data.get("detail", "").lower():
            print(f"❌ FAIL: Expected empty CSV error message")
            return False
        
        print(f"✅ PASS: Empty CSV rejected with 400")
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False
    
    # Test 1c: CSV with missing required columns should be handled gracefully
    print("\n--- Test 1c: CSV with missing required columns ---")
    try:
        # CSV with header but missing required columns
        csv_buffer = io.StringIO()
        writer = csv.DictWriter(csv_buffer, fieldnames=["wrong_column", "another_column"])
        writer.writeheader()
        writer.writerow({"wrong_column": "value1", "another_column": "value2"})
        csv_content = csv_buffer.getvalue()
        
        files = {"file": ("test.csv", csv_content, "text/csv")}
        cookies = {"admin_session": admin_token}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/tutorial-overrides/bulk-upload",
            files=files,
            cookies=cookies,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        
        # Should return 200 but skip the row due to missing required fields
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        if data.get("skipped", 0) != 1:
            print(f"❌ FAIL: Expected 1 skipped row for missing required columns")
            return False
        
        print(f"✅ PASS: CSV with missing required columns handled gracefully (row skipped)")
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False
    
    print("\n✅ Test 1 PASSED: CSV validation working correctly")
    return True

def test_supported_collections(admin_token):
    """Test 2: Verify supported collections include mantras, mudras, yoga_poses, breathwork_sessions, meditations"""
    print("\n=== Test 2: Supported Collections ===")
    
    expected_collections = {"mantras", "mudras", "yoga_poses", "breathwork_sessions", "meditations"}
    
    # Create a valid CSV with unsupported collection
    print("\n--- Testing unsupported collection rejection ---")
    try:
        csv_buffer = io.StringIO()
        writer = csv.DictWriter(csv_buffer, fieldnames=["collection", "item_id", "safety_notes"])
        writer.writeheader()
        writer.writerow({
            "collection": "invalid_collection",
            "item_id": "test123",
            "safety_notes": "Test safety note"
        })
        csv_content = csv_buffer.getvalue()
        
        files = {"file": ("test.csv", csv_content, "text/csv")}
        cookies = {"admin_session": admin_token}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/tutorial-overrides/bulk-upload",
            files=files,
            cookies=cookies,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Check that unsupported collection was skipped
        if data.get("skipped", 0) != 1:
            print(f"❌ FAIL: Expected 1 skipped row for unsupported collection")
            return False
        
        # Check supported_collections in response
        supported = set(data.get("supported_collections", []))
        if supported != expected_collections:
            print(f"❌ FAIL: Expected collections {expected_collections}, got {supported}")
            return False
        
        print(f"✅ PASS: Unsupported collection rejected, supported collections verified")
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False
    
    # Test each supported collection
    print("\n--- Testing each supported collection ---")
    for collection in expected_collections:
        print(f"\nTesting collection: {collection}")
        try:
            csv_buffer = io.StringIO()
            writer = csv.DictWriter(csv_buffer, fieldnames=["collection", "item_name", "safety_notes"])
            writer.writeheader()
            writer.writerow({
                "collection": collection,
                "item_name": "NonExistentItem12345",
                "safety_notes": "Test safety note"
            })
            csv_content = csv_buffer.getvalue()
            
            files = {"file": ("test.csv", csv_content, "text/csv")}
            cookies = {"admin_session": admin_token}
            
            response = requests.post(
                f"{BASE_URL}/api/admin/tutorial-overrides/bulk-upload",
                files=files,
                cookies=cookies,
                timeout=10
            )
            
            if response.status_code != 200:
                print(f"❌ FAIL: Collection {collection} returned {response.status_code}")
                return False
            
            data = response.json()
            # Should be skipped because item doesn't exist, but collection should be accepted
            if data.get("processed", 0) != 1:
                print(f"❌ FAIL: Collection {collection} not processed")
                return False
            
            print(f"✅ Collection {collection} accepted")
            
        except Exception as e:
            print(f"❌ FAIL: Exception for collection {collection}: {e}")
            return False
    
    print("\n✅ Test 2 PASSED: All supported collections verified")
    return True

def test_safety_notes_persistence(admin_token):
    """Test 3: Verify safety_notes field is accepted and persisted"""
    print("\n=== Test 3: Safety Notes Persistence ===")
    
    # First, get a real item from mantras collection to update
    print("\n--- Getting real mantra item ---")
    try:
        response = requests.get(f"{BASE_URL}/api/mantras", timeout=10)
        if response.status_code != 200:
            print(f"❌ FAIL: Could not fetch mantras, status {response.status_code}")
            return False
        
        mantras = response.json()
        if not mantras or len(mantras) == 0:
            print(f"❌ FAIL: No mantras found in database")
            return False
        
        test_mantra = mantras[0]
        mantra_id = test_mantra.get("id")
        mantra_name = test_mantra.get("name")
        
        print(f"Using mantra: {mantra_name} (id: {mantra_id})")
        
    except Exception as e:
        print(f"❌ FAIL: Exception getting mantras: {e}")
        return False
    
    # Create CSV with safety_notes
    print("\n--- Uploading CSV with safety_notes ---")
    try:
        test_safety_note = f"TEST SAFETY NOTE - Automated test at {requests.get(f'{BASE_URL}/api/health').json().get('status', 'unknown')}"
        
        csv_buffer = io.StringIO()
        writer = csv.DictWriter(csv_buffer, fieldnames=["collection", "item_id", "safety_notes"])
        writer.writeheader()
        writer.writerow({
            "collection": "mantras",
            "item_id": mantra_id,
            "safety_notes": test_safety_note
        })
        csv_content = csv_buffer.getvalue()
        
        files = {"file": ("test.csv", csv_content, "text/csv")}
        cookies = {"admin_session": admin_token}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/tutorial-overrides/bulk-upload",
            files=files,
            cookies=cookies,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Bulk upload failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get("updated", 0) != 1:
            print(f"❌ FAIL: Expected 1 updated item, got {data.get('updated', 0)}")
            return False
        
        print(f"✅ PASS: Bulk upload successful, 1 item updated")
        
    except Exception as e:
        print(f"❌ FAIL: Exception during bulk upload: {e}")
        return False
    
    # Verify safety_notes was persisted by fetching the item via admin API
    print("\n--- Verifying safety_notes persistence ---")
    try:
        cookies = {"admin_session": admin_token}
        response = requests.get(
            f"{BASE_URL}/api/admin/mantras/items?limit=100",
            cookies=cookies,
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ FAIL: Could not fetch admin mantras, status {response.status_code}")
            return False
        
        data = response.json()
        items = data.get("items", [])
        
        # Find our test mantra
        test_item = None
        for item in items:
            if item.get("id") == mantra_id:
                test_item = item
                break
        
        if not test_item:
            print(f"❌ FAIL: Could not find test mantra in admin API response")
            return False
        
        persisted_safety_note = test_item.get("safety_notes", "")
        print(f"Persisted safety_notes: {persisted_safety_note}")
        
        if test_safety_note not in persisted_safety_note:
            print(f"❌ FAIL: safety_notes not persisted correctly")
            print(f"Expected: {test_safety_note}")
            print(f"Got: {persisted_safety_note}")
            return False
        
        print(f"✅ PASS: safety_notes persisted correctly")
        
    except Exception as e:
        print(f"❌ FAIL: Exception verifying persistence: {e}")
        return False
    
    print("\n✅ Test 3 PASSED: safety_notes accepted and persisted")
    return True

def test_no_500_errors(admin_token):
    """Test 4: Confirm no 500 errors in related admin/content endpoints"""
    print("\n=== Test 4: No 500 Errors in Related Endpoints ===")
    
    endpoints_to_test = [
        ("GET", "/api/health", None, None),
        ("GET", "/api/mantras", None, None),
        ("GET", "/api/mudras", None, None),
        ("GET", "/api/yoga/poses", None, None),
        ("GET", "/api/breathwork/sessions", None, None),
        ("GET", "/api/meditations", None, None),
        ("GET", "/api/admin/collections", {"admin_session": admin_token}, None),
        ("GET", "/api/admin/mantras/items", {"admin_session": admin_token}, None),
        ("GET", "/api/admin/mudras/items", {"admin_session": admin_token}, None),
    ]
    
    all_passed = True
    
    for method, endpoint, cookies, json_data in endpoints_to_test:
        print(f"\n--- Testing {method} {endpoint} ---")
        try:
            if method == "GET":
                response = requests.get(
                    f"{BASE_URL}{endpoint}",
                    cookies=cookies,
                    timeout=10
                )
            elif method == "POST":
                response = requests.post(
                    f"{BASE_URL}{endpoint}",
                    json=json_data,
                    cookies=cookies,
                    timeout=10
                )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 500:
                print(f"❌ FAIL: Got 500 error")
                print(f"Response: {response.text}")
                all_passed = False
            elif response.status_code >= 400:
                # 4xx errors are acceptable (auth errors, etc.)
                print(f"✅ PASS: No 500 error (got {response.status_code})")
            else:
                print(f"✅ PASS: Success response {response.status_code}")
            
        except Exception as e:
            print(f"❌ FAIL: Exception occurred: {e}")
            all_passed = False
    
    if all_passed:
        print("\n✅ Test 4 PASSED: No 500 errors detected")
    else:
        print("\n❌ Test 4 FAILED: Some endpoints returned 500 errors")
    
    return all_passed

def main():
    print("=" * 80)
    print("BACKEND VALIDATION - CSV BULK UPLOAD + SAFETY NOTES")
    print("=" * 80)
    
    # Get admin token
    admin_token = get_admin_token()
    if not admin_token:
        print("\n❌ CRITICAL: Could not get admin token, aborting tests")
        return False
    
    # Run all tests
    results = {
        "CSV Validation": test_bulk_upload_csv_validation(admin_token),
        "Supported Collections": test_supported_collections(admin_token),
        "Safety Notes Persistence": test_safety_notes_persistence(admin_token),
        "No 500 Errors": test_no_500_errors(admin_token),
    }
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print("\n" + "=" * 80)
    if all_passed:
        print("✅ ALL BACKEND VALIDATION TESTS PASSED")
    else:
        print("❌ SOME BACKEND VALIDATION TESTS FAILED")
    print("=" * 80)
    
    return all_passed

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
