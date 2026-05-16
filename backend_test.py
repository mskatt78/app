#!/usr/bin/env python3
"""Backend API verification test for breathwork sanctuary app."""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Base URL from environment
BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(name: str):
    print(f"\n{Colors.BLUE}Testing: {name}{Colors.END}")

def print_pass(message: str):
    print(f"{Colors.GREEN}✓ PASS: {message}{Colors.END}")

def print_fail(message: str):
    print(f"{Colors.RED}✗ FAIL: {message}{Colors.END}")

def print_info(message: str):
    print(f"{Colors.YELLOW}ℹ INFO: {message}{Colors.END}")

# Test results tracking
test_results = {
    "passed": [],
    "failed": [],
    "warnings": []
}

def test_health_endpoint():
    """Test 1: GET /api/health returns 200 and valid JSON."""
    print_test("GET /api/health")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        
        # Check status code
        if response.status_code != 200:
            print_fail(f"Expected status 200, got {response.status_code}")
            test_results["failed"].append("Health endpoint - wrong status code")
            return False
        
        # Check valid JSON
        try:
            data = response.json()
            print_pass(f"Returns 200 with valid JSON: {json.dumps(data, indent=2)}")
            
            # Verify expected fields
            if "status" in data:
                print_pass(f"Contains 'status' field: {data['status']}")
            else:
                print_fail("Missing 'status' field in response")
                test_results["failed"].append("Health endpoint - missing status field")
                return False
            
            test_results["passed"].append("Health endpoint")
            return True
            
        except json.JSONDecodeError:
            print_fail("Response is not valid JSON")
            test_results["failed"].append("Health endpoint - invalid JSON")
            return False
            
    except Exception as e:
        print_fail(f"Request failed: {str(e)}")
        test_results["failed"].append(f"Health endpoint - {str(e)}")
        return False


def test_expand_script_endpoint():
    """Test 2: POST /api/content/expand-script with sample payload."""
    print_test("POST /api/content/expand-script")
    
    payload = {
        "practice_name": "Grounding Breath Practice",
        "element": "earth",
        "duration_minutes": 15,
        "steps": [
            "Find a comfortable seated position",
            "Close your eyes and take three deep breaths",
            "Notice the weight of your body on the earth",
            "Feel your connection to the ground beneath you"
        ],
        "source_texts": [
            "This practice helps you feel grounded and centered in your body.",
            "Earth element practices connect us with stability and presence."
        ],
        "use_ai": False,
        "anti_repetition_mode": "strict"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/content/expand-script",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        # Check for no 500 error
        if response.status_code == 500:
            print_fail(f"Server returned 500 error: {response.text[:200]}")
            test_results["failed"].append("Expand script - 500 error")
            return False
        
        # Check status code
        if response.status_code != 200:
            print_fail(f"Expected status 200, got {response.status_code}")
            print_info(f"Response: {response.text[:200]}")
            test_results["failed"].append(f"Expand script - status {response.status_code}")
            return False
        
        # Parse response
        try:
            data = response.json()
            print_pass(f"Returns 200 with valid JSON response")
            
            # Validate required fields
            required_fields = ["target_minutes", "target_word_count", "word_count"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                print_fail(f"Missing required fields: {missing_fields}")
                test_results["failed"].append(f"Expand script - missing fields: {missing_fields}")
                return False
            
            print_pass(f"Contains all required fields: {required_fields}")
            
            # Extract values
            target_minutes = data["target_minutes"]
            target_word_count = data["target_word_count"]
            word_count = data["word_count"]
            
            print_info(f"target_minutes: {target_minutes}")
            print_info(f"target_word_count: {target_word_count}")
            print_info(f"word_count: {word_count}")
            
            # Validate word_count >= target_word_count * 0.8
            min_word_count = target_word_count * 0.8
            if word_count >= min_word_count:
                print_pass(f"word_count ({word_count}) >= target_word_count*0.8 ({min_word_count:.0f})")
            else:
                print_fail(f"word_count ({word_count}) < target_word_count*0.8 ({min_word_count:.0f})")
                test_results["failed"].append("Expand script - word count below threshold")
                return False
            
            # Verify target_minutes matches request
            if target_minutes >= 7:  # MIN_NARRATION_MINUTES
                print_pass(f"target_minutes ({target_minutes}) meets minimum requirement (7)")
            else:
                print_fail(f"target_minutes ({target_minutes}) below minimum (7)")
                test_results["failed"].append("Expand script - target_minutes too low")
                return False
            
            test_results["passed"].append("Expand script endpoint")
            return True
            
        except json.JSONDecodeError:
            print_fail("Response is not valid JSON")
            test_results["failed"].append("Expand script - invalid JSON")
            return False
            
    except Exception as e:
        print_fail(f"Request failed: {str(e)}")
        test_results["failed"].append(f"Expand script - {str(e)}")
        return False


def test_gifts_create_endpoint():
    """Test 3: POST /api/gifts/create - validate payload shape and no 500 on valid request."""
    print_test("POST /api/gifts/create")
    
    payload = {
        "recipient_email": "test@example.com",
        "recipient_name": "Test Recipient",
        "gift_type": "subscription",
        "plan_id": "monthly",
        "message": "A gift for you!",
        "sender_name": "Test Sender"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/gifts/create",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        # Check for no 500 error
        if response.status_code == 500:
            print_fail(f"Server returned 500 error: {response.text[:200]}")
            test_results["failed"].append("Gifts create - 500 error")
            return False
        
        print_pass(f"No 500 error - returned status {response.status_code}")
        
        # Check if endpoint requires authentication (401/403 is acceptable)
        if response.status_code in [401, 403]:
            print_info(f"Endpoint requires authentication (status {response.status_code}) - this is acceptable")
            test_results["passed"].append("Gifts create endpoint (auth protected)")
            return True
        
        # If 200, validate response structure
        if response.status_code == 200:
            try:
                data = response.json()
                print_pass(f"Returns 200 with valid JSON")
                
                # Check for expected fields
                if "gift_code" in data:
                    print_pass(f"Response contains gift_code: {data['gift_code']}")
                
                test_results["passed"].append("Gifts create endpoint")
                return True
                
            except json.JSONDecodeError:
                print_fail("Response is not valid JSON")
                test_results["failed"].append("Gifts create - invalid JSON")
                return False
        
        # Other status codes
        print_info(f"Returned status {response.status_code}: {response.text[:200]}")
        test_results["passed"].append("Gifts create endpoint (no 500)")
        return True
        
    except Exception as e:
        print_fail(f"Request failed: {str(e)}")
        test_results["failed"].append(f"Gifts create - {str(e)}")
        return False


def test_admin_collections_unauthenticated():
    """Test 4: GET /api/admin/collections unauthenticated should return 401/403, not 500."""
    print_test("GET /api/admin/collections (unauthenticated)")
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/collections",
            timeout=10
        )
        
        # Check for no 500 error
        if response.status_code == 500:
            print_fail(f"Server returned 500 error (should return 401/403): {response.text[:200]}")
            test_results["failed"].append("Admin collections - 500 error instead of auth error")
            return False
        
        print_pass(f"No 500 error - returned status {response.status_code}")
        
        # Check for proper auth error (401 or 403)
        if response.status_code in [401, 403]:
            print_pass(f"Returns proper auth error (status {response.status_code})")
            test_results["passed"].append("Admin collections auth check")
            return True
        else:
            print_fail(f"Expected 401/403 auth error, got {response.status_code}")
            print_info(f"Response: {response.text[:200]}")
            test_results["warnings"].append(f"Admin collections - unexpected status {response.status_code}")
            return False
        
    except Exception as e:
        print_fail(f"Request failed: {str(e)}")
        test_results["failed"].append(f"Admin collections - {str(e)}")
        return False


def print_summary():
    """Print test summary."""
    print(f"\n{'='*60}")
    print(f"{Colors.BLUE}TEST SUMMARY{Colors.END}")
    print(f"{'='*60}")
    
    total_tests = len(test_results["passed"]) + len(test_results["failed"])
    
    print(f"\n{Colors.GREEN}PASSED: {len(test_results['passed'])}/{total_tests}{Colors.END}")
    for test in test_results["passed"]:
        print(f"  ✓ {test}")
    
    if test_results["failed"]:
        print(f"\n{Colors.RED}FAILED: {len(test_results['failed'])}/{total_tests}{Colors.END}")
        for test in test_results["failed"]:
            print(f"  ✗ {test}")
    
    if test_results["warnings"]:
        print(f"\n{Colors.YELLOW}WARNINGS: {len(test_results['warnings'])}{Colors.END}")
        for warning in test_results["warnings"]:
            print(f"  ⚠ {warning}")
    
    print(f"\n{'='*60}")
    
    # Return exit code
    return 0 if len(test_results["failed"]) == 0 else 1


def main():
    """Run all backend verification tests."""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}Backend API Verification - Breathwork Sanctuary{Colors.END}")
    print(f"{Colors.BLUE}Base URL: {BASE_URL}{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}")
    
    # Run all tests
    test_health_endpoint()
    test_expand_script_endpoint()
    test_gifts_create_endpoint()
    test_admin_collections_unauthenticated()
    
    # Print summary and exit
    exit_code = print_summary()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
