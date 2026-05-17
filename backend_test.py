"""Backend API verification for integrity metadata updates."""
import httpx
import os
import sys

# Get backend URL from environment
BACKEND_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://breathwork-sanctuary.preview.emergentagent.com")
BASE_URL = f"{BACKEND_URL}/api"

def test_courses_integrity_metadata():
    """Test GET /api/courses returns 200 list with content_integrity object."""
    print("\n" + "="*80)
    print("TEST 1: GET /api/courses - content_integrity metadata")
    print("="*80)
    
    try:
        response = httpx.get(f"{BASE_URL}/courses", timeout=10.0)
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
            print("⚠️  WARNING: No courses found in response")
            return True
        
        # Check first item for content_integrity
        first_item = data[0]
        if "content_integrity" not in first_item:
            print(f"❌ FAILED: content_integrity object missing from first item")
            print(f"Available keys: {list(first_item.keys())}")
            return False
        
        integrity = first_item["content_integrity"]
        required_fields = ["source_type", "verified", "references_count"]
        
        for field in required_fields:
            if field not in integrity:
                print(f"❌ FAILED: content_integrity.{field} missing")
                return False
        
        print(f"✓ content_integrity object present with all required fields")
        print(f"  - source_type: {integrity['source_type']}")
        print(f"  - verified: {integrity['verified']}")
        print(f"  - references_count: {integrity['references_count']}")
        
        # Check all items have content_integrity
        items_without_integrity = 0
        for idx, item in enumerate(data):
            if "content_integrity" not in item:
                items_without_integrity += 1
        
        if items_without_integrity > 0:
            print(f"⚠️  WARNING: {items_without_integrity}/{len(data)} items missing content_integrity")
        else:
            print(f"✓ All {len(data)} items have content_integrity object")
        
        print("✅ PASSED: GET /api/courses content_integrity verification")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {e}")
        return False


def test_meditations_integrity_metadata():
    """Test GET /api/meditations returns content_integrity object."""
    print("\n" + "="*80)
    print("TEST 2: GET /api/meditations - content_integrity metadata")
    print("="*80)
    
    try:
        response = httpx.get(f"{BASE_URL}/meditations", timeout=10.0)
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
            print("⚠️  WARNING: No meditations found in response")
            return True
        
        # Check first item for content_integrity
        first_item = data[0]
        if "content_integrity" not in first_item:
            print(f"❌ FAILED: content_integrity object missing from first item")
            print(f"Available keys: {list(first_item.keys())}")
            return False
        
        integrity = first_item["content_integrity"]
        required_fields = ["source_type", "verified", "references_count"]
        
        for field in required_fields:
            if field not in integrity:
                print(f"❌ FAILED: content_integrity.{field} missing")
                return False
        
        print(f"✓ content_integrity object present with all required fields")
        print(f"  - source_type: {integrity['source_type']}")
        print(f"  - verified: {integrity['verified']}")
        print(f"  - references_count: {integrity['references_count']}")
        
        # Check all items have content_integrity
        items_without_integrity = 0
        for idx, item in enumerate(data):
            if "content_integrity" not in item:
                items_without_integrity += 1
        
        if items_without_integrity > 0:
            print(f"⚠️  WARNING: {items_without_integrity}/{len(data)} items missing content_integrity")
        else:
            print(f"✓ All {len(data)} items have content_integrity object")
        
        print("✅ PASSED: GET /api/meditations content_integrity verification")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {e}")
        return False


def test_breathwork_sessions_integrity_metadata():
    """Test GET /api/breathwork/sessions returns content_integrity object."""
    print("\n" + "="*80)
    print("TEST 3: GET /api/breathwork/sessions - content_integrity metadata")
    print("="*80)
    
    try:
        response = httpx.get(f"{BASE_URL}/breathwork/sessions", timeout=10.0)
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
            print("⚠️  WARNING: No breathwork sessions found in response")
            return True
        
        # Check first item for content_integrity
        first_item = data[0]
        if "content_integrity" not in first_item:
            print(f"❌ FAILED: content_integrity object missing from first item")
            print(f"Available keys: {list(first_item.keys())}")
            return False
        
        integrity = first_item["content_integrity"]
        required_fields = ["source_type", "verified", "references_count"]
        
        for field in required_fields:
            if field not in integrity:
                print(f"❌ FAILED: content_integrity.{field} missing")
                return False
        
        print(f"✓ content_integrity object present with all required fields")
        print(f"  - source_type: {integrity['source_type']}")
        print(f"  - verified: {integrity['verified']}")
        print(f"  - references_count: {integrity['references_count']}")
        
        # Check all items have content_integrity
        items_without_integrity = 0
        for idx, item in enumerate(data):
            if "content_integrity" not in item:
                items_without_integrity += 1
        
        if items_without_integrity > 0:
            print(f"⚠️  WARNING: {items_without_integrity}/{len(data)} items missing content_integrity")
        else:
            print(f"✓ All {len(data)} items have content_integrity object")
        
        print("✅ PASSED: GET /api/breathwork/sessions content_integrity verification")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {e}")
        return False


def test_crystals_deep_image_verification():
    """Test GET /api/crystals/deep returns 27 records with verified images."""
    print("\n" + "="*80)
    print("TEST 4: GET /api/crystals/deep - image verification (27 records)")
    print("="*80)
    
    try:
        response = httpx.get(f"{BASE_URL}/crystals/deep", timeout=30.0)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        if not isinstance(data, list):
            print(f"❌ FAILED: Expected list, got {type(data)}")
            return False
        
        print(f"✓ Response is a list with {len(data)} items")
        
        # Check for 27 records
        if len(data) != 27:
            print(f"⚠️  WARNING: Expected 27 records, got {len(data)}")
        else:
            print(f"✓ Correct count: 27 records")
        
        if len(data) == 0:
            print("❌ FAILED: No crystals found in response")
            return False
        
        # Count verified images
        verified_count = 0
        wikipedia_verified_count = 0
        
        for crystal in data:
            image_source = crystal.get("image_source", "")
            image_validation = crystal.get("image_validation", {})
            validation_status = image_validation.get("status", "")
            
            if image_source == "wikipedia_verified" and validation_status == "verified":
                verified_count += 1
                wikipedia_verified_count += 1
        
        print(f"\nImage Verification Results:")
        print(f"  - Total crystals: {len(data)}")
        print(f"  - image_source=wikipedia_verified AND image_validation.status=verified: {verified_count}")
        
        if verified_count == 27:
            print(f"✅ PASSED: All 27 records have verified Wikipedia images")
        elif verified_count > 0:
            print(f"⚠️  PARTIAL: {verified_count}/{len(data)} records have verified images")
            
            # Show breakdown
            source_breakdown = {}
            status_breakdown = {}
            for crystal in data:
                source = crystal.get("image_source", "unknown")
                status = crystal.get("image_validation", {}).get("status", "unknown")
                source_breakdown[source] = source_breakdown.get(source, 0) + 1
                status_breakdown[status] = status_breakdown.get(status, 0) + 1
            
            print(f"\n  Image Source Breakdown:")
            for source, count in sorted(source_breakdown.items()):
                print(f"    - {source}: {count}")
            
            print(f"\n  Validation Status Breakdown:")
            for status, count in sorted(status_breakdown.items()):
                print(f"    - {status}: {count}")
        else:
            print(f"❌ FAILED: No verified images found")
            return False
        
        print("\n✅ PASSED: GET /api/crystals/deep image verification")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_iolite_spot_check():
    """Test GET /api/crystals/deep/iolite for verified image metadata."""
    print("\n" + "="*80)
    print("TEST 5: GET /api/crystals/deep/iolite - spot check")
    print("="*80)
    
    try:
        response = httpx.get(f"{BASE_URL}/crystals/deep/iolite", timeout=15.0)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        if not isinstance(data, dict):
            print(f"❌ FAILED: Expected dict, got {type(data)}")
            return False
        
        print(f"✓ Response is a dictionary")
        
        # Check image_source
        image_source = data.get("image_source", "")
        print(f"\nImage Source: {image_source}")
        
        if image_source != "wikipedia_verified":
            print(f"⚠️  WARNING: image_source is '{image_source}', expected 'wikipedia_verified'")
        else:
            print(f"✓ image_source = wikipedia_verified")
        
        # Check image_validation
        image_validation = data.get("image_validation", {})
        if not image_validation:
            print(f"❌ FAILED: image_validation object missing")
            return False
        
        print(f"\nImage Validation:")
        print(f"  - status: {image_validation.get('status', 'N/A')}")
        print(f"  - score: {image_validation.get('score', 'N/A')}")
        print(f"  - source_type: {image_validation.get('source_type', 'N/A')}")
        print(f"  - wikipedia_title: {image_validation.get('wikipedia_title', 'N/A')}")
        print(f"  - wikipedia_page_url: {image_validation.get('wikipedia_page_url', 'N/A')}")
        
        validation_status = image_validation.get("status", "")
        if validation_status != "verified":
            print(f"⚠️  WARNING: image_validation.status is '{validation_status}', expected 'verified'")
        else:
            print(f"✓ image_validation.status = verified")
        
        # Check wikipedia_title is non-empty
        wikipedia_title = image_validation.get("wikipedia_title", "")
        if not wikipedia_title:
            print(f"❌ FAILED: wikipedia_title is empty")
            return False
        else:
            print(f"✓ wikipedia_title is non-empty: '{wikipedia_title}'")
        
        # Additional checks
        verified_image_url = data.get("verified_image_url", "")
        if verified_image_url:
            print(f"✓ verified_image_url present: {verified_image_url[:80]}...")
        else:
            print(f"⚠️  WARNING: verified_image_url is empty")
        
        print("\n✅ PASSED: GET /api/crystals/deep/iolite spot check")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception occurred: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all backend verification tests."""
    print("\n" + "="*80)
    print("BACKEND INTEGRITY METADATA VERIFICATION")
    print("="*80)
    print(f"Backend URL: {BASE_URL}")
    
    results = {
        "courses_integrity": test_courses_integrity_metadata(),
        "meditations_integrity": test_meditations_integrity_metadata(),
        "breathwork_integrity": test_breathwork_sessions_integrity_metadata(),
        "crystals_deep_images": test_crystals_deep_image_verification(),
        "iolite_spot_check": test_iolite_spot_check(),
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
