"""
Backend validation for weekly reflection endpoint on preview base URL.
Focus endpoint: GET /api/practice-journal/weekly-reflection

Test cases:
1) GET /api/practice-journal/weekly-reflection without auth => 401
2) Login with voice.sync.qa@example.com / Pass1234! then GET endpoint => 200
3) Validate schema fields:
   - period_start, period_end, days_considered, entries_analyzed, total_minutes,
   - average_mood_shift, top_practice_types, key_themes,
   - energetic_summary, alchemy_focus, integration_vow,
   - weekly_alchemy_plan (len 7), source, generated_at
4) Validate each weekly_alchemy_plan item has day/focus/practice/journal_prompt.
5) Validate days query param normalization: try days=2 and days=20 and confirm days_considered clamps to 3..14.
"""

import requests
import json
from typing import Dict, Any, Optional

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"
WEEKLY_REFLECTION_ENDPOINT = f"{BASE_URL}/api/practice-journal/weekly-reflection"
LOGIN_ENDPOINT = f"{BASE_URL}/api/auth/login"

# Test credentials from test_credentials.md
TEST_EMAIL = "voice.sync.qa@example.com"
TEST_PASSWORD = "Pass1234!"

def print_section(title: str):
    """Print a formatted section header."""
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}\n")

def print_result(test_name: str, passed: bool, details: str = ""):
    """Print test result."""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {test_name}")
    if details:
        print(f"  {details}")

def login_and_get_token() -> Optional[str]:
    """Login with test credentials and return auth token."""
    try:
        response = requests.post(
            LOGIN_ENDPOINT,
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ Login failed with status {response.status_code}: {response.text[:200]}")
            return None
        
        data = response.json()
        token = data.get("token") or data.get("session_token")
        
        if not token:
            print(f"❌ Login response missing token/session_token: {json.dumps(data, indent=2)[:200]}")
            return None
        
        print(f"✅ Login successful for {TEST_EMAIL}")
        return token
        
    except Exception as e:
        print(f"❌ Login exception: {str(e)}")
        return None

def test_case_1_unauthenticated_access():
    """
    Test Case 1: GET /api/practice-journal/weekly-reflection without auth => 401
    """
    print_section("TEST CASE 1: Unauthenticated Access")
    
    try:
        response = requests.get(WEEKLY_REFLECTION_ENDPOINT, timeout=10)
        
        if response.status_code == 401:
            print_result("Unauthenticated Access", True, 
                       f"Correctly returned 401 Unauthorized")
            return True
        else:
            print_result("Unauthenticated Access", False, 
                       f"Expected 401, got {response.status_code}: {response.text[:200]}")
            return False
            
    except Exception as e:
        print_result("Unauthenticated Access", False, f"Exception: {str(e)}")
        return False

def validate_weekly_reflection_schema(data: Dict[str, Any]) -> tuple[bool, str]:
    """Validate weekly reflection response schema."""
    required_fields = {
        "period_start": str,
        "period_end": str,
        "days_considered": int,
        "entries_analyzed": int,
        "total_minutes": int,
        "average_mood_shift": (int, float),
        "top_practice_types": list,
        "key_themes": list,
        "energetic_summary": str,
        "alchemy_focus": str,
        "integration_vow": str,
        "weekly_alchemy_plan": list,
        "source": str,
        "generated_at": str,
    }
    
    for field, expected_type in required_fields.items():
        if field not in data:
            return False, f"Missing field: {field}"
        
        if isinstance(expected_type, tuple):
            if not isinstance(data[field], expected_type):
                return False, f"Field {field} has wrong type: expected {expected_type}, got {type(data[field]).__name__}"
        else:
            if not isinstance(data[field], expected_type):
                return False, f"Field {field} has wrong type: expected {expected_type.__name__}, got {type(data[field]).__name__}"
    
    return True, "Schema valid"

def validate_weekly_alchemy_plan(plan: list) -> tuple[bool, str]:
    """Validate weekly_alchemy_plan structure."""
    if len(plan) != 7:
        return False, f"Expected 7 days in plan, got {len(plan)}"
    
    required_day_fields = ["day", "focus", "practice", "journal_prompt"]
    
    for i, day_item in enumerate(plan):
        if not isinstance(day_item, dict):
            return False, f"Day {i+1} is not a dict: {type(day_item).__name__}"
        
        for field in required_day_fields:
            if field not in day_item:
                return False, f"Day {i+1} missing field: {field}"
            if not isinstance(day_item[field], str):
                return False, f"Day {i+1} field {field} is not string: {type(day_item[field]).__name__}"
            if not day_item[field].strip():
                return False, f"Day {i+1} field {field} is empty"
    
    return True, "Weekly alchemy plan valid"

def test_case_2_authenticated_access(token: str):
    """
    Test Case 2: Login with voice.sync.qa@example.com / Pass1234! then GET endpoint => 200
    """
    print_section("TEST CASE 2: Authenticated Access")
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(WEEKLY_REFLECTION_ENDPOINT, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print_result("Authenticated Access", False, 
                       f"Expected 200, got {response.status_code}: {response.text[:200]}")
            return False, None
        
        data = response.json()
        print_result("Authenticated Access", True, 
                   f"Successfully retrieved weekly reflection (200 OK)")
        return True, data
        
    except Exception as e:
        print_result("Authenticated Access", False, f"Exception: {str(e)}")
        return False, None

def test_case_3_schema_validation(data: Dict[str, Any]):
    """
    Test Case 3: Validate schema fields
    """
    print_section("TEST CASE 3: Schema Validation")
    
    schema_valid, schema_msg = validate_weekly_reflection_schema(data)
    
    if not schema_valid:
        print_result("Schema Validation", False, schema_msg)
        return False
    
    print("✓ All required fields present with correct types:")
    print(f"  - period_start: {data['period_start']}")
    print(f"  - period_end: {data['period_end']}")
    print(f"  - days_considered: {data['days_considered']}")
    print(f"  - entries_analyzed: {data['entries_analyzed']}")
    print(f"  - total_minutes: {data['total_minutes']}")
    print(f"  - average_mood_shift: {data['average_mood_shift']}")
    print(f"  - top_practice_types: {len(data['top_practice_types'])} items")
    print(f"  - key_themes: {len(data['key_themes'])} items")
    print(f"  - energetic_summary: {len(data['energetic_summary'])} chars")
    print(f"  - alchemy_focus: {len(data['alchemy_focus'])} chars")
    print(f"  - integration_vow: {len(data['integration_vow'])} chars")
    print(f"  - weekly_alchemy_plan: {len(data['weekly_alchemy_plan'])} days")
    print(f"  - source: {data['source']}")
    print(f"  - generated_at: {data['generated_at']}")
    
    print_result("Schema Validation", True, "All required fields present and valid")
    return True

def test_case_4_weekly_plan_structure(data: Dict[str, Any]):
    """
    Test Case 4: Validate each weekly_alchemy_plan item has day/focus/practice/journal_prompt
    """
    print_section("TEST CASE 4: Weekly Alchemy Plan Structure")
    
    plan = data.get("weekly_alchemy_plan", [])
    plan_valid, plan_msg = validate_weekly_alchemy_plan(plan)
    
    if not plan_valid:
        print_result("Weekly Plan Structure", False, plan_msg)
        return False
    
    print("✓ Weekly alchemy plan structure valid:")
    for i, day_item in enumerate(plan):
        print(f"  Day {i+1} ({day_item['day']}):")
        print(f"    - focus: {day_item['focus'][:50]}...")
        print(f"    - practice: {day_item['practice'][:50]}...")
        print(f"    - journal_prompt: {day_item['journal_prompt'][:50]}...")
    
    print_result("Weekly Plan Structure", True, 
               "All 7 days have day/focus/practice/journal_prompt fields")
    return True

def test_case_5_days_param_normalization(token: str):
    """
    Test Case 5: Validate days query param normalization: 
    try days=2 and days=20 and confirm days_considered clamps to 3..14
    """
    print_section("TEST CASE 5: Days Parameter Normalization")
    
    test_cases = [
        {"days": 2, "expected_min": 3, "expected_max": 3},
        {"days": 20, "expected_min": 14, "expected_max": 14},
        {"days": 7, "expected_min": 7, "expected_max": 7},
    ]
    
    all_passed = True
    headers = {"Authorization": f"Bearer {token}"}
    
    for test_case in test_cases:
        days_param = test_case["days"]
        expected_min = test_case["expected_min"]
        expected_max = test_case["expected_max"]
        
        try:
            response = requests.get(
                WEEKLY_REFLECTION_ENDPOINT,
                headers=headers,
                params={"days": days_param},
                timeout=10
            )
            
            if response.status_code != 200:
                print_result(f"Days={days_param} normalization", False, 
                           f"HTTP {response.status_code}: {response.text[:200]}")
                all_passed = False
                continue
            
            data = response.json()
            days_considered = data.get("days_considered")
            
            if days_considered is None:
                print_result(f"Days={days_param} normalization", False, 
                           "Missing days_considered field")
                all_passed = False
                continue
            
            if expected_min <= days_considered <= expected_max:
                print_result(f"Days={days_param} normalization", True, 
                           f"Correctly normalized to {days_considered} (expected {expected_min}-{expected_max})")
            else:
                print_result(f"Days={days_param} normalization", False, 
                           f"Got {days_considered}, expected {expected_min}-{expected_max}")
                all_passed = False
                
        except Exception as e:
            print_result(f"Days={days_param} normalization", False, f"Exception: {str(e)}")
            all_passed = False
    
    return all_passed

def main():
    """Run all test cases and provide summary."""
    print("\n" + "="*80)
    print("  BACKEND VALIDATION: Weekly Reflection Endpoint")
    print("  Endpoint: GET /api/practice-journal/weekly-reflection")
    print("  Base URL: https://breathwork-sanctuary.preview.emergentagent.com")
    print("="*80)
    
    results = {}
    
    # Test Case 1: Unauthenticated access
    results['Test Case 1: Unauthenticated Access'] = test_case_1_unauthenticated_access()
    
    # Login to get token for authenticated tests
    print_section("LOGIN")
    token = login_and_get_token()
    
    if not token:
        print("\n❌ Cannot proceed with authenticated tests - login failed")
        print_section("TEST SUMMARY")
        print("✅ PASS - Test Case 1: Unauthenticated Access")
        print("❌ FAIL - Remaining tests (login failed)")
        return False
    
    # Test Case 2: Authenticated access
    test_2_passed, reflection_data = test_case_2_authenticated_access(token)
    results['Test Case 2: Authenticated Access'] = test_2_passed
    
    if not test_2_passed or not reflection_data:
        print("\n❌ Cannot proceed with schema validation - authenticated access failed")
        print_section("TEST SUMMARY")
        for test_name, passed in results.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{status} - {test_name}")
        return False
    
    # Test Case 3: Schema validation
    results['Test Case 3: Schema Validation'] = test_case_3_schema_validation(reflection_data)
    
    # Test Case 4: Weekly plan structure
    results['Test Case 4: Weekly Plan Structure'] = test_case_4_weekly_plan_structure(reflection_data)
    
    # Test Case 5: Days parameter normalization
    results['Test Case 5: Days Parameter Normalization'] = test_case_5_days_param_normalization(token)
    
    # Print summary
    print_section("TEST SUMMARY")
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    all_passed = all(results.values())
    
    print(f"\n{'='*80}")
    if all_passed:
        print("  🎉 ALL TESTS PASSED")
    else:
        print("  ⚠️  SOME TESTS FAILED")
    print(f"{'='*80}\n")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
