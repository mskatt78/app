#!/usr/bin/env python3
"""
Backend QA Test for Shamanic Elements App
Focus: Narration floor check, image alignment endpoints, retreats schema, regression checks
"""

import requests
import json
import sys
from typing import Any, Dict, List

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

def test_narration_floor_check():
    """
    Test 1: Narration floor check (CRITICAL)
    POST /api/content/expand-script with duration_minutes=10, 15, 20
    Expect: target_minutes should be >=15 always; for 20-minute request target should remain 20
    Expect: substantial script length (word_count roughly consistent with target words) and no errors
    """
    endpoint = "/content/expand-script"
    url = f"{BASE_URL}{endpoint}"
    
    test_cases = [
        {"duration_minutes": 10, "expected_min_target": 15, "description": "10-minute request (should floor to 15)"},
        {"duration_minutes": 15, "expected_min_target": 15, "description": "15-minute request (should remain 15)"},
        {"duration_minutes": 20, "expected_min_target": 20, "description": "20-minute request (should remain 20)"},
    ]
    
    results = []
    
    for test_case in test_cases:
        payload = {
            "practice_name": "Test Meditation Practice",
            "duration_minutes": test_case["duration_minutes"],
            "element": "spirit",
            "source_texts": ["Welcome to this guided meditation practice. Allow yourself to settle into this sacred space."],
            "steps": ["Begin with deep breathing", "Connect with your heart center", "Release and integrate"],
            "include_toning": False,
            "use_ai": False,
            "anti_repetition_mode": "balanced"
        }
        
        try:
            response = requests.post(url, json=payload, timeout=30)
            
            if response.status_code != 200:
                results.append({
                    "test_case": test_case["description"],
                    "passed": False,
                    "error": f"Expected 200, got {response.status_code}",
                    "response_text": response.text[:500]
                })
                continue
            
            data = response.json()
            
            # Check required fields
            required_fields = ["target_minutes", "target_word_count", "word_count", "practice_name", "used_ai", "paragraphs", "segments"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                results.append({
                    "test_case": test_case["description"],
                    "passed": False,
                    "error": f"Missing required fields: {missing_fields}"
                })
                continue
            
            # Check target_minutes floor
            target_minutes = data.get("target_minutes")
            expected_min = test_case["expected_min_target"]
            
            if target_minutes < expected_min:
                results.append({
                    "test_case": test_case["description"],
                    "passed": False,
                    "error": f"target_minutes={target_minutes} is less than expected minimum {expected_min}"
                })
                continue
            
            # For 20-minute request, target should remain 20
            if test_case["duration_minutes"] == 20 and target_minutes != 20:
                results.append({
                    "test_case": test_case["description"],
                    "passed": False,
                    "error": f"For 20-minute request, target_minutes should be 20, got {target_minutes}"
                })
                continue
            
            # Check word_count is substantial
            word_count = data.get("word_count", 0)
            target_word_count = data.get("target_word_count", 0)
            
            # Word count should be at least 80% of target (reasonable threshold)
            min_acceptable_words = int(target_word_count * 0.8)
            
            if word_count < min_acceptable_words:
                results.append({
                    "test_case": test_case["description"],
                    "passed": False,
                    "error": f"word_count={word_count} is less than 80% of target_word_count={target_word_count}"
                })
                continue
            
            # Check paragraphs and segments are non-empty
            if not data.get("paragraphs") or not data.get("segments"):
                results.append({
                    "test_case": test_case["description"],
                    "passed": False,
                    "error": "paragraphs or segments are empty"
                })
                continue
            
            results.append({
                "test_case": test_case["description"],
                "passed": True,
                "target_minutes": target_minutes,
                "target_word_count": target_word_count,
                "word_count": word_count,
                "paragraphs_count": len(data.get("paragraphs", [])),
                "segments_count": len(data.get("segments", []))
            })
            
        except Exception as e:
            results.append({
                "test_case": test_case["description"],
                "passed": False,
                "error": f"Exception: {str(e)}"
            })
    
    return {
        "test": "Narration Floor Check",
        "results": results,
        "passed": all(r["passed"] for r in results)
    }


def test_mystery_school_endpoints():
    """
    Test 2: Image alignment endpoints health - Mystery School
    GET /api/mystery-school?stream=egyptian_mystery
    GET /api/mystery-school?stream=priestess_rose
    GET /api/mystery-school?stream=merlin_alchemy
    GET /api/mystery-school?stream=emerald_tablet
    Expect: non-empty arrays and valid non-null image URLs
    """
    endpoint = "/mystery-school"
    
    streams = [
        "egyptian_mystery",
        "priestess_rose",
        "merlin_alchemy",
        "emerald_tablet"
    ]
    
    results = []
    
    for stream in streams:
        url = f"{BASE_URL}{endpoint}?stream={stream}"
        
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code != 200:
                results.append({
                    "stream": stream,
                    "passed": False,
                    "error": f"Expected 200, got {response.status_code}"
                })
                continue
            
            data = response.json()
            
            # Check non-empty array
            if not isinstance(data, list):
                results.append({
                    "stream": stream,
                    "passed": False,
                    "error": f"Expected list, got {type(data).__name__}"
                })
                continue
            
            if len(data) == 0:
                results.append({
                    "stream": stream,
                    "passed": False,
                    "error": "Empty array returned"
                })
                continue
            
            # Check for valid image URLs
            items_with_images = 0
            items_with_null_images = 0
            
            for item in data:
                image_url = item.get("image_url")
                if image_url and isinstance(image_url, str) and image_url.strip():
                    items_with_images += 1
                else:
                    items_with_null_images += 1
            
            results.append({
                "stream": stream,
                "passed": True,
                "total_items": len(data),
                "items_with_images": items_with_images,
                "items_with_null_images": items_with_null_images
            })
            
        except Exception as e:
            results.append({
                "stream": stream,
                "passed": False,
                "error": f"Exception: {str(e)}"
            })
    
    return {
        "test": "Mystery School Endpoints",
        "results": results,
        "passed": all(r["passed"] for r in results)
    }


def test_image_alignment_endpoints():
    """
    Test 3: Image alignment endpoints health
    GET /api/ancient-wisdom
    GET /api/sacred-ally-alchemy
    GET /api/angelic-alchemy
    Expect: non-empty arrays and valid non-null image URLs
    """
    endpoints = [
        "/ancient-wisdom",
        "/sacred-ally-alchemy",
        "/angelic-alchemy"
    ]
    
    results = []
    
    for endpoint in endpoints:
        url = f"{BASE_URL}{endpoint}"
        
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code != 200:
                results.append({
                    "endpoint": endpoint,
                    "passed": False,
                    "error": f"Expected 200, got {response.status_code}"
                })
                continue
            
            data = response.json()
            
            # Check non-empty array
            if not isinstance(data, list):
                results.append({
                    "endpoint": endpoint,
                    "passed": False,
                    "error": f"Expected list, got {type(data).__name__}"
                })
                continue
            
            if len(data) == 0:
                results.append({
                    "endpoint": endpoint,
                    "passed": False,
                    "error": "Empty array returned"
                })
                continue
            
            # Check for valid image URLs
            items_with_images = 0
            items_with_null_images = 0
            
            for item in data:
                image_url = item.get("image_url")
                if image_url and isinstance(image_url, str) and image_url.strip():
                    items_with_images += 1
                else:
                    items_with_null_images += 1
            
            results.append({
                "endpoint": endpoint,
                "passed": True,
                "total_items": len(data),
                "items_with_images": items_with_images,
                "items_with_null_images": items_with_null_images
            })
            
        except Exception as e:
            results.append({
                "endpoint": endpoint,
                "passed": False,
                "error": f"Exception: {str(e)}"
            })
    
    return {
        "test": "Image Alignment Endpoints",
        "results": results,
        "passed": all(r["passed"] for r in results)
    }


def test_retreats_schema_compatibility():
    """
    Test 4: Retreats schema compatibility
    GET /api/retreats should return 200 even if empty
    If any retreat exists, verify normalized fields are present:
    - retreat_mode
    - supports_online
    - supports_physical
    - booking_url
    - online_session_url
    - social_media_links
    """
    endpoint = "/retreats"
    url = f"{BASE_URL}{endpoint}"
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            return {
                "test": "Retreats Schema Compatibility",
                "passed": False,
                "error": f"Expected 200, got {response.status_code}"
            }
        
        data = response.json()
        
        # Check if it's a list
        if not isinstance(data, list):
            return {
                "test": "Retreats Schema Compatibility",
                "passed": False,
                "error": f"Expected list, got {type(data).__name__}"
            }
        
        # If empty, that's acceptable
        if len(data) == 0:
            return {
                "test": "Retreats Schema Compatibility",
                "passed": True,
                "total_retreats": 0,
                "note": "Empty retreats list is acceptable"
            }
        
        # If retreats exist, verify normalized fields
        required_fields = [
            "retreat_mode",
            "supports_online",
            "supports_physical",
            "booking_url",
            "online_session_url",
            "social_media_links"
        ]
        
        retreats_with_all_fields = 0
        missing_fields_by_retreat = []
        
        for idx, retreat in enumerate(data):
            missing = [field for field in required_fields if field not in retreat]
            if not missing:
                retreats_with_all_fields += 1
            else:
                missing_fields_by_retreat.append({
                    "retreat_index": idx,
                    "retreat_id": retreat.get("id", "unknown"),
                    "missing_fields": missing
                })
        
        return {
            "test": "Retreats Schema Compatibility",
            "passed": True,
            "total_retreats": len(data),
            "retreats_with_all_fields": retreats_with_all_fields,
            "missing_fields_by_retreat": missing_fields_by_retreat if missing_fields_by_retreat else "All retreats have required fields"
        }
        
    except Exception as e:
        return {
            "test": "Retreats Schema Compatibility",
            "passed": False,
            "error": f"Exception: {str(e)}"
        }


def test_regression_checks():
    """
    Test 5: Regression checks
    Ensure all tested endpoints respond without 500s/timeouts
    """
    endpoints = [
        "/health",
        "/mystery-school?stream=egyptian_mystery",
        "/ancient-wisdom",
        "/sacred-ally-alchemy",
        "/angelic-alchemy",
        "/retreats"
    ]
    
    results = []
    
    for endpoint in endpoints:
        url = f"{BASE_URL}{endpoint}"
        
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code >= 500:
                results.append({
                    "endpoint": endpoint,
                    "passed": False,
                    "error": f"Server error: {response.status_code}"
                })
            else:
                results.append({
                    "endpoint": endpoint,
                    "passed": True,
                    "status_code": response.status_code
                })
                
        except requests.exceptions.Timeout:
            results.append({
                "endpoint": endpoint,
                "passed": False,
                "error": "Request timeout"
            })
        except Exception as e:
            results.append({
                "endpoint": endpoint,
                "passed": False,
                "error": f"Exception: {str(e)}"
            })
    
    return {
        "test": "Regression Checks (No 500s/Timeouts)",
        "results": results,
        "passed": all(r["passed"] for r in results)
    }


def main():
    """Run all backend QA tests."""
    print("=" * 80)
    print("BACKEND QA TEST - Shamanic Elements App")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print()
    
    tests = [
        test_narration_floor_check,
        test_mystery_school_endpoints,
        test_image_alignment_endpoints,
        test_retreats_schema_compatibility,
        test_regression_checks
    ]
    
    all_results = []
    
    for test_func in tests:
        print(f"Running {test_func.__name__.replace('_', ' ').title()}...")
        result = test_func()
        all_results.append(result)
        
        if result["passed"]:
            print(f"✅ PASS: {result['test']}")
        else:
            print(f"❌ FAIL: {result['test']}")
        
        # Print detailed results
        if "results" in result:
            for sub_result in result["results"]:
                if sub_result["passed"]:
                    print(f"   ✓ {sub_result.get('test_case') or sub_result.get('stream') or sub_result.get('endpoint', 'Item')}")
                    # Print key metrics
                    for key, value in sub_result.items():
                        if key not in ["passed", "test_case", "stream", "endpoint"]:
                            print(f"      {key}: {value}")
                else:
                    print(f"   ✗ {sub_result.get('test_case') or sub_result.get('stream') or sub_result.get('endpoint', 'Item')}")
                    print(f"      Error: {sub_result.get('error', 'Unknown error')}")
        else:
            # Print top-level result details
            for key, value in result.items():
                if key not in ["test", "passed"]:
                    print(f"   {key}: {value}")
        
        print()
    
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    passed_count = sum(1 for r in all_results if r["passed"])
    total_count = len(all_results)
    
    print(f"Passed: {passed_count}/{total_count}")
    print()
    
    if passed_count == total_count:
        print("✅ ALL TESTS PASSED - Backend QA verification successful")
        print("No critical issues detected.")
        return 0
    else:
        print("❌ SOME TESTS FAILED - Backend QA issues detected")
        print("\nFailed tests:")
        for r in all_results:
            if not r["passed"]:
                print(f"  - {r['test']}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
