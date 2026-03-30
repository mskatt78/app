#!/usr/bin/env python3
"""
Backend API Testing for Light Codes API - Spiritual Wellness App
Focused testing for the review request requirements
"""

import requests
import sys
import json
from datetime import datetime

class LightCodesAPITester:
    def __init__(self, base_url="https://breathwork-sanctuary.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.issues_found = []
        
    def log(self, message):
        """Log test messages"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")

    def run_test(self, name, method, endpoint, expected_status=200, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_base}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            else:
                response = requests.request(method, url, json=data, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return response.json() if response.content else {}
                except:
                    return response.text
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                self.log(f"   Response: {response.text[:200]}")
                self.issues_found.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                return None

        except requests.exceptions.RequestException as e:
            self.log(f"❌ {name} - Request failed: {str(e)}")
            self.issues_found.append(f"{name}: Request failed - {str(e)}")
            return None
        except Exception as e:
            self.log(f"❌ {name} - Unexpected error: {str(e)}")
            self.issues_found.append(f"{name}: Unexpected error - {str(e)}")
            return None

    def test_health_endpoint(self):
        """Test basic health endpoint"""
        self.log("\n=== HEALTH CHECK TEST ===")
        
        result = self.run_test("Health Check", "GET", "/health")
        if result:
            status = result.get('status', 'unknown')
            self.log(f"   Health status: {status}")
            if status != 'healthy':
                self.issues_found.append(f"Health endpoint returned status: {status} (expected: healthy)")
        return result

    def test_light_codes_api(self):
        """Test Light Codes API depth and structure"""
        self.log("\n=== LIGHT CODES API TESTS ===")
        
        # Test main light codes endpoint
        result = self.run_test("Get All Light Codes", "GET", "/light-codes")
        if not result:
            self.issues_found.append("Light Codes API failed to respond")
            return None
            
        # Verify expected categories exist
        expected_categories = [
            "sacred_geometry", 
            "ancient_alphabets", 
            "light_language_symbols", 
            "galactic_codes", 
            "chakra_codes"
        ]
        
        missing_categories = []
        for category in expected_categories:
            if category not in result:
                missing_categories.append(category)
        
        if missing_categories:
            self.issues_found.append(f"Missing categories in Light Codes: {missing_categories}")
            self.log(f"❌ Missing categories: {missing_categories}")
        else:
            self.log(f"✅ All expected categories found: {expected_categories}")
        
        # Test DNA Activation Helix (ll3) specifically
        self.test_dna_activation_helix(result)
        
        # Test deep fields across categories
        self.test_deep_fields(result)
        
        # Test JSON safety
        self.test_json_safety(result)
        
        return result

    def test_dna_activation_helix(self, light_codes_data):
        """Test DNA Activation Helix (ll3) specifically"""
        self.log("\n--- Testing DNA Activation Helix (ll3) ---")
        
        # Find ll3 in light_language_symbols
        ll_symbols = light_codes_data.get("light_language_symbols", [])
        dna_helix = None
        
        for symbol in ll_symbols:
            if symbol.get("id") == "ll3":
                dna_helix = symbol
                break
        
        if not dna_helix:
            self.issues_found.append("DNA Activation Helix (ll3) not found in light_language_symbols")
            self.log("❌ DNA Activation Helix (ll3) not found")
            return
        
        self.log(f"✅ Found DNA Activation Helix: {dna_helix.get('name', 'Unknown')}")
        
        # Check for deep fields
        deep_fields = [
            "why_this_heals", 
            "ancient_traditions", 
            "extended_teachings", 
            "practice_guide", 
            "lineage", 
            "healing_lens"
        ]
        
        missing_deep_fields = []
        empty_deep_fields = []
        
        for field in deep_fields:
            if field not in dna_helix:
                missing_deep_fields.append(field)
            elif not dna_helix[field] or len(str(dna_helix[field]).strip()) < 10:
                empty_deep_fields.append(field)
        
        if missing_deep_fields:
            self.issues_found.append(f"DNA Activation Helix missing deep fields: {missing_deep_fields}")
            self.log(f"❌ Missing deep fields: {missing_deep_fields}")
        
        if empty_deep_fields:
            self.issues_found.append(f"DNA Activation Helix has empty/minimal deep fields: {empty_deep_fields}")
            self.log(f"❌ Empty/minimal deep fields: {empty_deep_fields}")
        
        if not missing_deep_fields and not empty_deep_fields:
            self.log("✅ DNA Activation Helix has rich, non-empty deep fields")
            
        # Log field lengths for verification
        for field in deep_fields:
            if field in dna_helix:
                content_length = len(str(dna_helix[field]).strip())
                self.log(f"   {field}: {content_length} characters")

    def test_deep_fields(self, light_codes_data):
        """Test that representative entries have deep fields"""
        self.log("\n--- Testing Deep Fields Across Categories ---")
        
        deep_fields = [
            "why_this_heals", 
            "ancient_traditions", 
            "extended_teachings", 
            "practice_guide", 
            "lineage", 
            "healing_lens"
        ]
        
        categories_tested = 0
        categories_with_deep_fields = 0
        
        for category_name, entries in light_codes_data.items():
            if not isinstance(entries, list) or not entries:
                continue
                
            categories_tested += 1
            
            # Test first entry in each category
            first_entry = entries[0]
            has_deep_fields = any(field in first_entry and 
                                str(first_entry[field]).strip() 
                                for field in deep_fields)
            
            if has_deep_fields:
                categories_with_deep_fields += 1
                self.log(f"✅ {category_name}: Has deep fields")
            else:
                self.log(f"⚠️  {category_name}: No deep fields found")
        
        if categories_with_deep_fields == 0:
            self.issues_found.append("No categories have deep fields (why_this_heals, ancient_traditions, etc.)")
        else:
            self.log(f"✅ {categories_with_deep_fields}/{categories_tested} categories have deep fields")

    def test_json_safety(self, light_codes_data):
        """Test that data is JSON-safe and doesn't leak MongoDB ObjectIds"""
        self.log("\n--- Testing JSON Safety ---")
        
        try:
            # Try to serialize to JSON
            json_str = json.dumps(light_codes_data)
            self.log("✅ Data is JSON serializable")
            
            # Check for MongoDB ObjectId patterns
            if "ObjectId(" in json_str:
                self.issues_found.append("Data contains MongoDB ObjectId references")
                self.log("❌ Found MongoDB ObjectId references in response")
            else:
                self.log("✅ No MongoDB ObjectId leaks detected")
                
            # Check for _id fields
            def check_for_id_fields(obj, path=""):
                if isinstance(obj, dict):
                    if "_id" in obj:
                        self.issues_found.append(f"Found _id field at {path}")
                        self.log(f"❌ Found _id field at {path}")
                    for key, value in obj.items():
                        check_for_id_fields(value, f"{path}.{key}" if path else key)
                elif isinstance(obj, list):
                    for i, item in enumerate(obj):
                        check_for_id_fields(item, f"{path}[{i}]" if path else f"[{i}]")
            
            check_for_id_fields(light_codes_data)
            
        except (TypeError, ValueError) as e:
            self.issues_found.append(f"Data is not JSON serializable: {str(e)}")
            self.log(f"❌ JSON serialization failed: {str(e)}")

    def run_all_tests(self):
        """Run the complete test suite"""
        self.log("🌟 Starting Light Codes API Backend Tests 🌟")
        start_time = datetime.now()
        
        # Test health endpoint
        health_result = self.test_health_endpoint()
        
        # Test light codes API
        light_codes_result = self.test_light_codes_api()
        
        # Results summary
        duration = (datetime.now() - start_time).total_seconds()
        self.log(f"\n🏁 TESTING COMPLETE")
        self.log(f"Tests passed: {self.tests_passed}/{self.tests_run}")
        self.log(f"Duration: {duration:.1f}s")
        self.log(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.issues_found:
            self.log(f"\n❌ ISSUES FOUND ({len(self.issues_found)}):")
            for i, issue in enumerate(self.issues_found, 1):
                self.log(f"  {i}. {issue}")
        else:
            self.log("\n✅ NO CRITICAL ISSUES FOUND")
        
        return 0 if not self.issues_found else 1

def main():
    tester = LightCodesAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())