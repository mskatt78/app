#!/usr/bin/env python3
"""
Backend QA Test for Shamanic Depth Pass
Tests deep field presence in practice endpoints
"""

import requests
import json
import sys

# Base URL from frontend/.env
BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

# Required deep fields for practice endpoints
REQUIRED_DEEP_FIELDS = [
    "ritual",
    "ceremony",
    "guided_practice",
    "integration_actions",
    "why_this_heals",
    "safety_notes"
]

def test_endpoint_with_deep_fields(endpoint_path, endpoint_name):
    """
    Test an endpoint returns 200 and first item has required deep fields
    Returns: (success: bool, message: str, details: dict)
    """
    url = f"{BASE_URL}{endpoint_path}"
    print(f"\n{'='*80}")
    print(f"Testing: {endpoint_name}")
    print(f"URL: {url}")
    print(f"{'='*80}")
    
    try:
        response = requests.get(url, timeout=10)
        status_code = response.status_code
        
        print(f"Status Code: {status_code}")
        
        if status_code != 200:
            return False, f"❌ FAILED: Expected 200, got {status_code}", {
                "status_code": status_code,
                "endpoint": endpoint_path
            }
        
        # Parse JSON response
        try:
            data = response.json()
        except json.JSONDecodeError as e:
            return False, f"❌ FAILED: Invalid JSON response - {str(e)}", {
                "status_code": status_code,
                "error": "Invalid JSON"
            }
        
        # Check if response is a list
        if not isinstance(data, list):
            return False, f"❌ FAILED: Expected list response, got {type(data).__name__}", {
                "status_code": status_code,
                "response_type": type(data).__name__
            }
        
        # Check if list is not empty
        if len(data) == 0:
            return False, f"❌ FAILED: Empty list returned", {
                "status_code": status_code,
                "item_count": 0
            }
        
        print(f"✓ Response is valid list with {len(data)} items")
        
        # Get first item
        first_item = data[0]
        
        # Check for required deep fields
        missing_fields = []
        empty_fields = []
        present_fields = []
        
        for field in REQUIRED_DEEP_FIELDS:
            if field not in first_item:
                missing_fields.append(field)
            elif first_item[field] is None or first_item[field] == "" or first_item[field] == []:
                empty_fields.append(field)
            else:
                present_fields.append(field)
                # Show field preview (first 100 chars)
                field_value = str(first_item[field])
                preview = field_value[:100] + "..." if len(field_value) > 100 else field_value
                print(f"  ✓ {field}: {preview}")
        
        # Report results
        if missing_fields:
            print(f"\n❌ Missing fields: {', '.join(missing_fields)}")
        
        if empty_fields:
            print(f"⚠️  Empty fields: {', '.join(empty_fields)}")
        
        # Determine success
        if missing_fields:
            return False, f"❌ FAILED: Missing required fields: {', '.join(missing_fields)}", {
                "status_code": status_code,
                "item_count": len(data),
                "missing_fields": missing_fields,
                "empty_fields": empty_fields,
                "present_fields": present_fields,
                "first_item_id": first_item.get("id", "unknown")
            }
        
        # Success even if some fields are empty (non-empty where practical)
        success_msg = f"✅ PASSED: All required fields present"
        if empty_fields:
            success_msg += f" (Note: {len(empty_fields)} fields are empty but present)"
        
        return True, success_msg, {
            "status_code": status_code,
            "item_count": len(data),
            "missing_fields": missing_fields,
            "empty_fields": empty_fields,
            "present_fields": present_fields,
            "first_item_id": first_item.get("id", "unknown")
        }
        
    except requests.exceptions.Timeout:
        return False, f"❌ FAILED: Request timeout after 10 seconds", {
            "error": "Timeout"
        }
    except requests.exceptions.RequestException as e:
        return False, f"❌ FAILED: Request error - {str(e)}", {
            "error": str(e)
        }
    except Exception as e:
        return False, f"❌ FAILED: Unexpected error - {str(e)}", {
            "error": str(e)
        }


def test_endpoint_no_500(endpoint_path, endpoint_name):
    """
    Test an endpoint returns non-500 status (200 or other valid status)
    Returns: (success: bool, message: str, details: dict)
    """
    url = f"{BASE_URL}{endpoint_path}"
    print(f"\n{'='*80}")
    print(f"Testing: {endpoint_name}")
    print(f"URL: {url}")
    print(f"{'='*80}")
    
    try:
        response = requests.get(url, timeout=10)
        status_code = response.status_code
        
        print(f"Status Code: {status_code}")
        
        if status_code >= 500:
            return False, f"❌ FAILED: Server error {status_code}", {
                "status_code": status_code,
                "endpoint": endpoint_path
            }
        
        # Try to parse response
        try:
            data = response.json()
            if isinstance(data, list):
                print(f"✓ Response is valid list with {len(data)} items")
            elif isinstance(data, dict):
                print(f"✓ Response is valid dict with {len(data)} keys")
            else:
                print(f"✓ Response is valid JSON ({type(data).__name__})")
        except json.JSONDecodeError:
            print(f"⚠️  Response is not JSON")
        
        return True, f"✅ PASSED: No 500 error (status {status_code})", {
            "status_code": status_code,
            "endpoint": endpoint_path
        }
        
    except requests.exceptions.Timeout:
        return False, f"❌ FAILED: Request timeout after 10 seconds", {
            "error": "Timeout"
        }
    except requests.exceptions.RequestException as e:
        return False, f"❌ FAILED: Request error - {str(e)}", {
            "error": str(e)
        }
    except Exception as e:
        return False, f"❌ FAILED: Unexpected error - {str(e)}", {
            "error": str(e)
        }


def main():
    print("\n" + "="*80)
    print("SHAMANIC DEPTH PASS - BACKEND QA TEST")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Required deep fields: {', '.join(REQUIRED_DEEP_FIELDS)}")
    
    results = []
    
    # Test endpoints with deep field requirements
    deep_field_endpoints = [
        ("/elemental-practices", "Elemental Practices"),
        ("/shamanic-practices", "Shamanic Practices"),
        ("/feminine-embodiment", "Feminine Embodiment"),
        ("/sacred-rites", "Sacred Rites"),
        ("/masculine-embodiment", "Masculine Embodiment")
    ]
    
    print("\n" + "="*80)
    print("PHASE 1: Testing endpoints with deep field requirements")
    print("="*80)
    
    for endpoint_path, endpoint_name in deep_field_endpoints:
        success, message, details = test_endpoint_with_deep_fields(endpoint_path, endpoint_name)
        results.append({
            "endpoint": endpoint_path,
            "name": endpoint_name,
            "success": success,
            "message": message,
            "details": details,
            "test_type": "deep_fields"
        })
        print(f"\n{message}")
    
    # Test endpoints for no 500 errors
    no_500_endpoints = [
        ("/elemental-temples", "Elemental Temples"),
        ("/seasonal-temples", "Seasonal Temples"),
        ("/mystery-school?stream=priestess_rose", "Mystery School - Priestess Rose")
    ]
    
    print("\n" + "="*80)
    print("PHASE 2: Testing endpoints for no 500 errors")
    print("="*80)
    
    for endpoint_path, endpoint_name in no_500_endpoints:
        success, message, details = test_endpoint_no_500(endpoint_path, endpoint_name)
        results.append({
            "endpoint": endpoint_path,
            "name": endpoint_name,
            "success": success,
            "message": message,
            "details": details,
            "test_type": "no_500"
        })
        print(f"\n{message}")
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for r in results if r["success"])
    failed = sum(1 for r in results if not r["success"])
    total = len(results)
    
    print(f"\nTotal Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    print("\n" + "-"*80)
    print("DETAILED RESULTS:")
    print("-"*80)
    
    for result in results:
        status_icon = "✅" if result["success"] else "❌"
        print(f"\n{status_icon} {result['name']} ({result['endpoint']})")
        print(f"   {result['message']}")
        
        if not result["success"]:
            print(f"   Details: {json.dumps(result['details'], indent=6)}")
    
    # Exit with appropriate code
    if failed > 0:
        print(f"\n❌ TEST SUITE FAILED: {failed} test(s) failed")
        sys.exit(1)
    else:
        print(f"\n✅ TEST SUITE PASSED: All {passed} tests passed")
        sys.exit(0)


if __name__ == "__main__":
    main()
