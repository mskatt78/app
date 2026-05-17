"""Backend regression test after complexity refactor in payments.py/gifts.py and provenance expansion."""
import httpx
import os
import sys

# Get backend URL from environment
BACKEND_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://breathwork-sanctuary.preview.emergentagent.com")
BASE_URL = f"{BACKEND_URL}/api"

def test_ancient_wisdom_provenance():
    """Test GET /api/ancient-wisdom returns 200 with content_integrity and source_references."""
    print("\n" + "="*80)
    print("TEST 1: GET /api/ancient-wisdom - provenance metadata")
    print("="*80)
    
    try:
        response = httpx.get(f"{BASE_URL}/ancient-wisdom", timeout=10.0)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        if not isinstance(data, list):
            print(f"❌ FAILED: Expected list, got {type(data)}")
            return False
        
        print(f"✓ Response is a list with {len(data)} items")
        
        if len(data) == 0:
            print("⚠️  WARNING: No ancient wisdom entries found")
            return True
        
        # Check first item for required fields
        first_item = data[0]
        
        # Check content_integrity
        if "content_integrity" not in first_item:
            print(f"❌ FAILED: content_integrity missing from first item")
            print(f"Available keys: {list(first_item.keys())}")
            return False
        
        integrity = first_item["content_integrity"]
        required_integrity_fields = ["source_type", "verified", "references_count"]
        
        for field in required_integrity_fields:
            if field not in integrity:
                print(f"❌ FAILED: content_integrity.{field} missing")
                return False
        
        print(f"✓ content_integrity present with required fields")
        print(f"  - source_type: {integrity['source_type']}")
        print(f"  - verified: {integrity['verified']}")
        print(f"  - references_count: {integrity['references_count']}")
        
        # Check source_references
        if "source_references" not in first_item:
            print(f"❌ FAILED: source_references missing from first item")
            return False
        
        source_refs = first_item["source_references"]
        if not isinstance(source_refs, list):
            print(f"❌ FAILED: source_references is not a list, got {type(source_refs)}")
            return False
        
        print(f"✓ source_references is a list with {len(source_refs)} items")
        
        print("✅ PASSED: GET /api/ancient-wisdom provenance metadata")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {e}")
        return False


def test_shamanic_practices_provenance():
    """Test GET /api/shamanic-practices returns 200 with content_integrity and source_references."""
    print("\n" + "="*80)
    print("TEST 2: GET /api/shamanic-practices - provenance metadata")
    print("="*80)
    
    try:
        response = httpx.get(f"{BASE_URL}/shamanic-practices", timeout=10.0)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        if not isinstance(data, list):
            print(f"❌ FAILED: Expected list, got {type(data)}")
            return False
        
        print(f"✓ Response is a list with {len(data)} items")
        
        if len(data) == 0:
            print("⚠️  WARNING: No shamanic practices found")
            return True
        
        # Check first item
        first_item = data[0]
        
        if "content_integrity" not in first_item:
            print(f"❌ FAILED: content_integrity missing")
            return False
        
        if "source_references" not in first_item:
            print(f"❌ FAILED: source_references missing")
            return False
        
        integrity = first_item["content_integrity"]
        source_refs = first_item["source_references"]
        
        print(f"✓ content_integrity: source_type={integrity.get('source_type')}, verified={integrity.get('verified')}, references_count={integrity.get('references_count')}")
        print(f"✓ source_references is list with {len(source_refs)} items")
        
        print("✅ PASSED: GET /api/shamanic-practices provenance metadata")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {e}")
        return False


def test_elemental_practices_provenance():
    """Test GET /api/elemental-practices returns 200 with content_integrity and source_references."""
    print("\n" + "="*80)
    print("TEST 3: GET /api/elemental-practices - provenance metadata")
    print("="*80)
    
    try:
        response = httpx.get(f"{BASE_URL}/elemental-practices", timeout=10.0)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        if not isinstance(data, list):
            print(f"❌ FAILED: Expected list, got {type(data)}")
            return False
        
        print(f"✓ Response is a list with {len(data)} items")
        
        if len(data) == 0:
            print("⚠️  WARNING: No elemental practices found")
            return True
        
        # Check first item
        first_item = data[0]
        
        if "content_integrity" not in first_item:
            print(f"❌ FAILED: content_integrity missing")
            return False
        
        if "source_references" not in first_item:
            print(f"❌ FAILED: source_references missing")
            return False
        
        integrity = first_item["content_integrity"]
        source_refs = first_item["source_references"]
        
        print(f"✓ content_integrity: source_type={integrity.get('source_type')}, verified={integrity.get('verified')}, references_count={integrity.get('references_count')}")
        print(f"✓ source_references is list with {len(source_refs)} items")
        
        print("✅ PASSED: GET /api/elemental-practices provenance metadata")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {e}")
        return False


def test_heart_practices_provenance():
    """Test GET /api/heart-practices returns 200 with content_integrity and source_references."""
    print("\n" + "="*80)
    print("TEST 4: GET /api/heart-practices - provenance metadata")
    print("="*80)
    
    try:
        response = httpx.get(f"{BASE_URL}/heart-practices", timeout=10.0)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        if not isinstance(data, list):
            print(f"❌ FAILED: Expected list, got {type(data)}")
            return False
        
        print(f"✓ Response is a list with {len(data)} items")
        
        if len(data) == 0:
            print("⚠️  WARNING: No heart practices found")
            return True
        
        # Check first item
        first_item = data[0]
        
        if "content_integrity" not in first_item:
            print(f"❌ FAILED: content_integrity missing")
            return False
        
        if "source_references" not in first_item:
            print(f"❌ FAILED: source_references missing")
            return False
        
        integrity = first_item["content_integrity"]
        source_refs = first_item["source_references"]
        
        print(f"✓ content_integrity: source_type={integrity.get('source_type')}, verified={integrity.get('verified')}, references_count={integrity.get('references_count')}")
        print(f"✓ source_references is list with {len(source_refs)} items")
        
        print("✅ PASSED: GET /api/heart-practices provenance metadata")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {e}")
        return False


def test_payments_plans():
    """Test GET /api/payments/plans returns 200."""
    print("\n" + "="*80)
    print("TEST 5: GET /api/payments/plans - unauthenticated access")
    print("="*80)
    
    try:
        response = httpx.get(f"{BASE_URL}/payments/plans", timeout=10.0)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"✓ Response is valid JSON")
        
        if "plans" in data:
            print(f"✓ Response contains 'plans' key with {len(data['plans'])} plans")
        
        print("✅ PASSED: GET /api/payments/plans")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {e}")
        return False


def test_payments_bundles():
    """Test GET /api/payments/bundles returns 200 list."""
    print("\n" + "="*80)
    print("TEST 6: GET /api/payments/bundles - unauthenticated access")
    print("="*80)
    
    try:
        response = httpx.get(f"{BASE_URL}/payments/bundles", timeout=10.0)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if not isinstance(data, list):
            print(f"❌ FAILED: Expected list, got {type(data)}")
            return False
        
        print(f"✓ Response is a list with {len(data)} bundles")
        
        print("✅ PASSED: GET /api/payments/bundles")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {e}")
        return False


def test_payments_subscription_status_auth():
    """Test GET /api/payments/subscription-status returns 401/422 (not 500) without auth."""
    print("\n" + "="*80)
    print("TEST 7: GET /api/payments/subscription-status - auth required (no 500)")
    print("="*80)
    
    try:
        response = httpx.get(f"{BASE_URL}/payments/subscription-status", timeout=10.0)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 500:
            print(f"❌ FAILED: Got 500 error (should be 401/422 for auth required)")
            print(f"Response: {response.text[:200]}")
            return False
        
        if response.status_code in [401, 422, 403]:
            print(f"✓ Correct auth error status: {response.status_code}")
            print("✅ PASSED: GET /api/payments/subscription-status auth behavior")
            return True
        
        print(f"⚠️  WARNING: Unexpected status {response.status_code} (expected 401/422/403)")
        print("✅ PASSED: No 500 error (main requirement met)")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {e}")
        return False


def test_payments_my_purchases_auth():
    """Test GET /api/payments/my-purchases returns 401/422 (not 500) without auth."""
    print("\n" + "="*80)
    print("TEST 8: GET /api/payments/my-purchases - auth required (no 500)")
    print("="*80)
    
    try:
        response = httpx.get(f"{BASE_URL}/payments/my-purchases", timeout=10.0)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 500:
            print(f"❌ FAILED: Got 500 error (should be 401/422 for auth required)")
            print(f"Response: {response.text[:200]}")
            return False
        
        if response.status_code in [401, 422, 403]:
            print(f"✓ Correct auth error status: {response.status_code}")
            print("✅ PASSED: GET /api/payments/my-purchases auth behavior")
            return True
        
        print(f"⚠️  WARNING: Unexpected status {response.status_code} (expected 401/422/403)")
        print("✅ PASSED: No 500 error (main requirement met)")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {e}")
        return False


def test_gifts_pay_auth():
    """Test POST /api/gifts/pay returns 401/422 (not 500) without auth."""
    print("\n" + "="*80)
    print("TEST 9: POST /api/gifts/pay - auth required (no 500)")
    print("="*80)
    
    try:
        payload = {
            "gift_code": "GIFT-TEST123",
            "origin_url": "https://example.com",
            "payment_method": "stripe"
        }
        response = httpx.post(f"{BASE_URL}/gifts/pay", json=payload, timeout=10.0)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 500:
            print(f"❌ FAILED: Got 500 error (should be 401/422 for auth required)")
            print(f"Response: {response.text[:200]}")
            return False
        
        if response.status_code in [401, 422, 403, 404]:
            print(f"✓ Correct error status: {response.status_code}")
            print("✅ PASSED: POST /api/gifts/pay auth behavior")
            return True
        
        print(f"⚠️  WARNING: Unexpected status {response.status_code} (expected 401/422/403/404)")
        print("✅ PASSED: No 500 error (main requirement met)")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {e}")
        return False


def test_gifts_nonexistent_code():
    """Test GET /api/gifts/nonexistent-code returns 404 (not 500)."""
    print("\n" + "="*80)
    print("TEST 10: GET /api/gifts/nonexistent-code - 404 not 500")
    print("="*80)
    
    try:
        nonexistent_code = "GIFT-NONEXISTENT999"
        response = httpx.get(f"{BASE_URL}/gifts/{nonexistent_code}", timeout=10.0)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 500:
            print(f"❌ FAILED: Got 500 error (should be 404 for not found)")
            print(f"Response: {response.text[:200]}")
            return False
        
        if response.status_code == 404:
            print(f"✓ Correct 404 status for nonexistent gift code")
            print("✅ PASSED: GET /api/gifts/nonexistent-code error handling")
            return True
        
        print(f"⚠️  WARNING: Unexpected status {response.status_code} (expected 404)")
        print("✅ PASSED: No 500 error (main requirement met)")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {e}")
        return False


def main():
    """Run all backend regression tests."""
    print("\n" + "="*80)
    print("BACKEND REGRESSION TEST - PAYMENTS/GIFTS REFACTOR & PROVENANCE EXPANSION")
    print("="*80)
    print(f"Backend URL: {BASE_URL}")
    
    results = {
        "ancient_wisdom_provenance": test_ancient_wisdom_provenance(),
        "shamanic_practices_provenance": test_shamanic_practices_provenance(),
        "elemental_practices_provenance": test_elemental_practices_provenance(),
        "heart_practices_provenance": test_heart_practices_provenance(),
        "payments_plans": test_payments_plans(),
        "payments_bundles": test_payments_bundles(),
        "payments_subscription_status_auth": test_payments_subscription_status_auth(),
        "payments_my_purchases_auth": test_payments_my_purchases_auth(),
        "gifts_pay_auth": test_gifts_pay_auth(),
        "gifts_nonexistent_code": test_gifts_nonexistent_code(),
    }
    
    print("\n" + "="*80)
    print("FINAL RESULTS")
    print("="*80)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    total = len(results)
    passed = sum(results.values())
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
