#!/usr/bin/env python3
"""
Backend Regression Test Suite for Breathwork Sanctuary
Focus: Tiering consistency, pricing plans, retreats cleanup, narration floor, stability
"""

import requests
import json
from typing import Dict, List, Any
import sys

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

class TestResults:
    def __init__(self):
        self.passed = []
        self.failed = []
        self.warnings = []
    
    def add_pass(self, test_name: str, details: str = ""):
        self.passed.append(f"✅ {test_name}: {details}")
    
    def add_fail(self, test_name: str, details: str):
        self.failed.append(f"❌ {test_name}: {details}")
    
    def add_warning(self, test_name: str, details: str):
        self.warnings.append(f"⚠️  {test_name}: {details}")
    
    def print_summary(self):
        print("\n" + "="*80)
        print("BACKEND REGRESSION TEST SUMMARY")
        print("="*80)
        
        if self.failed:
            print("\n🔴 FAILED TESTS:")
            for fail in self.failed:
                print(f"  {fail}")
        
        if self.warnings:
            print("\n🟡 WARNINGS:")
            for warn in self.warnings:
                print(f"  {warn}")
        
        if self.passed:
            print("\n🟢 PASSED TESTS:")
            for pass_test in self.passed:
                print(f"  {pass_test}")
        
        print("\n" + "="*80)
        print(f"TOTAL: {len(self.passed)} passed, {len(self.failed)} failed, {len(self.warnings)} warnings")
        print("="*80)
        
        return len(self.failed) == 0

results = TestResults()

def test_tiering_consistency(endpoint: str, expected_total: int, expected_free: int, expected_premium: int):
    """Test tiering consistency for a given endpoint"""
    test_name = f"Tiering: {endpoint}"
    
    try:
        response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
        
        if response.status_code != 200:
            results.add_fail(test_name, f"HTTP {response.status_code} (expected 200)")
            return
        
        data = response.json()
        
        # Handle different response structures
        if isinstance(data, dict):
            items = data.get('items') or data.get('practices') or data.get('sessions') or []
        else:
            items = data
        
        total_count = len(items)
        free_count = sum(1 for item in items if not item.get('is_premium', False))
        premium_count = sum(1 for item in items if item.get('is_premium', False))
        
        # Check if counts match expectations
        issues = []
        if total_count != expected_total:
            issues.append(f"total={total_count} (expected {expected_total})")
        if free_count != expected_free:
            issues.append(f"free={free_count} (expected {expected_free})")
        if premium_count != expected_premium:
            issues.append(f"premium={premium_count} (expected {expected_premium})")
        
        if issues:
            results.add_fail(test_name, ", ".join(issues))
        else:
            results.add_pass(test_name, f"14 items: 4 free + 10 premium ✓")
    
    except requests.exceptions.RequestException as e:
        results.add_fail(test_name, f"Request error: {str(e)}")
    except Exception as e:
        results.add_fail(test_name, f"Unexpected error: {str(e)}")

def test_pricing_plans():
    """Test pricing plans endpoint"""
    test_name = "Pricing Plans"
    
    try:
        response = requests.get(f"{BASE_URL}/payments/plans", timeout=10)
        
        if response.status_code != 200:
            results.add_fail(test_name, f"HTTP {response.status_code} (expected 200)")
            return
        
        data = response.json()
        
        # Extract plans
        plans = data.get('plans', []) if isinstance(data, dict) else data
        
        if len(plans) != 2:
            results.add_fail(test_name, f"Found {len(plans)} plans (expected exactly 2)")
            return
        
        # Check for monthly and full_app_unlock plans
        plan_ids = [p.get('id') or p.get('plan_id') for p in plans]
        
        has_monthly = 'monthly' in plan_ids
        has_lifetime = 'full_app_unlock' in plan_ids
        
        if not has_monthly:
            results.add_fail(test_name, "Missing 'monthly' plan")
            return
        
        if not has_lifetime:
            results.add_fail(test_name, "Missing 'full_app_unlock' plan")
            return
        
        # Validate price values exist and are usable
        issues = []
        for plan in plans:
            plan_id = plan.get('id') or plan.get('plan_id')
            price = plan.get('price') or plan.get('amount')
            
            if price is None:
                issues.append(f"{plan_id} missing price")
            elif not isinstance(price, (int, float)):
                issues.append(f"{plan_id} price not numeric: {type(price)}")
        
        if issues:
            results.add_fail(test_name, ", ".join(issues))
        else:
            results.add_pass(test_name, "2 plans (monthly + full_app_unlock) with valid prices ✓")
    
    except requests.exceptions.RequestException as e:
        results.add_fail(test_name, f"Request error: {str(e)}")
    except Exception as e:
        results.add_fail(test_name, f"Unexpected error: {str(e)}")

def test_retreats_cleanup():
    """Test retreats endpoint returns empty list"""
    test_name = "Retreats Cleanup"
    
    try:
        response = requests.get(f"{BASE_URL}/retreats", timeout=10)
        
        if response.status_code != 200:
            results.add_fail(test_name, f"HTTP {response.status_code} (expected 200)")
            return
        
        data = response.json()
        
        # Handle different response structures
        if isinstance(data, dict):
            retreats = data.get('retreats') or data.get('items') or []
        else:
            retreats = data
        
        if len(retreats) > 0:
            results.add_fail(test_name, f"Found {len(retreats)} retreats (expected empty list)")
        else:
            results.add_pass(test_name, "Empty list ✓")
    
    except requests.exceptions.RequestException as e:
        results.add_fail(test_name, f"Request error: {str(e)}")
    except Exception as e:
        results.add_fail(test_name, f"Unexpected error: {str(e)}")

def test_guided_narration_floor():
    """Test guided narration meets 7-minute floor"""
    test_name = "Guided Narration Floor (7 min)"
    
    try:
        payload = {
            "practice_name": "Test Practice",
            "target_minutes": 7,
            "use_ai": False
        }
        
        response = requests.post(
            f"{BASE_URL}/content/expand-script",
            json=payload,
            timeout=15
        )
        
        if response.status_code != 200:
            results.add_fail(test_name, f"HTTP {response.status_code} (expected 200)")
            return
        
        data = response.json()
        
        # Check required fields
        target_minutes = data.get('target_minutes')
        word_count = data.get('word_count')
        segments = data.get('segments', [])
        
        if target_minutes != 7:
            results.add_fail(test_name, f"target_minutes={target_minutes} (expected 7)")
            return
        
        # Calculate minimum word count for 7 minutes (120 words per minute)
        min_word_count = 7 * 120  # 840 words
        
        issues = []
        if word_count is None:
            issues.append("word_count missing")
        elif word_count < min_word_count:
            issues.append(f"word_count={word_count} < {min_word_count} (7min floor)")
        
        if not segments or len(segments) == 0:
            issues.append("segments empty")
        
        if issues:
            results.add_fail(test_name, ", ".join(issues))
        else:
            results.add_pass(test_name, f"word_count={word_count} >= {min_word_count}, segments non-empty ✓")
    
    except requests.exceptions.RequestException as e:
        results.add_fail(test_name, f"Request error: {str(e)}")
    except Exception as e:
        results.add_fail(test_name, f"Unexpected error: {str(e)}")

def test_general_stability():
    """Test general stability - no 500s on key endpoints"""
    test_name = "General Stability (No 500s)"
    
    endpoints_to_test = [
        "/health",
        "/meditations",
        "/breathwork/sessions",
        "/mantras",
        "/mindfulness-practices",
        "/heart-practices",
        "/shamanic-practices",
        "/creative-processes",
        "/energy-healing",
        "/water-practices",
        "/payments/plans",
        "/retreats"
    ]
    
    errors_500 = []
    
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            if response.status_code == 500:
                errors_500.append(f"{endpoint} returned 500")
        except requests.exceptions.RequestException as e:
            results.add_warning(test_name, f"{endpoint} request failed: {str(e)}")
    
    if errors_500:
        results.add_fail(test_name, ", ".join(errors_500))
    else:
        results.add_pass(test_name, f"All {len(endpoints_to_test)} endpoints returned non-500 status ✓")

def main():
    print("="*80)
    print("BACKEND REGRESSION TEST - BREATHWORK SANCTUARY")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print("="*80)
    
    # Test 1: Tiering consistency for key section endpoints
    print("\n[1/5] Testing tiering consistency...")
    test_tiering_consistency("/meditations", 14, 4, 10)
    test_tiering_consistency("/breathwork/sessions", 14, 4, 10)
    test_tiering_consistency("/mantras", 14, 4, 10)
    test_tiering_consistency("/mindfulness-practices", 14, 4, 10)
    test_tiering_consistency("/heart-practices", 14, 4, 10)
    test_tiering_consistency("/shamanic-practices", 14, 4, 10)
    test_tiering_consistency("/creative-processes", 14, 4, 10)
    test_tiering_consistency("/energy-healing", 14, 4, 10)
    test_tiering_consistency("/water-practices", 14, 4, 10)
    
    # Test 2: Pricing plans
    print("\n[2/5] Testing pricing plans...")
    test_pricing_plans()
    
    # Test 3: Retreats cleanup
    print("\n[3/5] Testing retreats cleanup...")
    test_retreats_cleanup()
    
    # Test 4: Guided narration floor
    print("\n[4/5] Testing guided narration floor...")
    test_guided_narration_floor()
    
    # Test 5: General stability
    print("\n[5/5] Testing general stability...")
    test_general_stability()
    
    # Print summary
    success = results.print_summary()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
