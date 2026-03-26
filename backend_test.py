#!/usr/bin/env python3
"""
Backend API Testing for Shamanic Elemental Yoga App
Tests all API endpoints and functionality
"""

import requests
import sys
import json
import time
from datetime import datetime

class ShamanicYogaAPITester:
    def __init__(self, base_url="https://energy-modalities.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        
    def log(self, message):
        """Log test messages"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")

    def run_test(self, name, method, endpoint, expected_status=200, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_base}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'
        
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
                return None

        except requests.exceptions.RequestException as e:
            self.log(f"❌ {name} - Request failed: {str(e)}")
            return None
        except Exception as e:
            self.log(f"❌ {name} - Unexpected error: {str(e)}")
            return None

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        self.log("\n=== HEALTH & STATUS TESTS ===")
        
        # Test root endpoint
        result = self.run_test("Root API", "GET", "/")
        if result:
            self.log(f"   Root response: {result}")
            
        # Test health endpoint
        result = self.run_test("Health Check", "GET", "/health")
        if result:
            self.log(f"   Health status: {result.get('status', 'unknown')}")

    def setup_test_session(self):
        """Create a test user session using MongoDB"""
        self.log("\n=== SETTING UP TEST SESSION ===")
        import subprocess
        import uuid
        
        try:
            timestamp = int(time.time())
            self.user_id = f"test-user-{timestamp}"
            self.session_token = f"test_session_{timestamp}"
            
            # MongoDB commands to create test user and session
            mongo_script = f"""
use('test_database');
db.users.insertOne({{
  user_id: '{self.user_id}',
  email: 'test.user.{timestamp}@example.com',
  name: 'Test Shaman',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
}});
db.user_sessions.insertOne({{
  user_id: '{self.user_id}',
  session_token: '{self.session_token}',
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
}});
"""
            
            # Execute MongoDB script
            process = subprocess.run(
                ['mongosh', '--eval', mongo_script],
                capture_output=True, text=True, timeout=30
            )
            
            if process.returncode == 0:
                self.log(f"✅ Test user created: {self.user_id}")
                self.log(f"✅ Session token: {self.session_token}")
                return True
            else:
                self.log(f"❌ Failed to create test user: {process.stderr}")
                return False
                
        except Exception as e:
            self.log(f"❌ Session setup failed: {str(e)}")
            return False

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        self.log("\n=== AUTH ENDPOINTS TESTS ===")
        
        # Test /auth/me with valid session
        result = self.run_test("Get Current User", "GET", "/auth/me")
        if result:
            self.log(f"   User: {result.get('name', 'N/A')} ({result.get('email', 'N/A')})")
            
        # Test logout
        result = self.run_test("Logout", "POST", "/auth/logout")

    def test_yoga_endpoints(self):
        """Test yoga poses endpoints"""
        self.log("\n=== YOGA ENDPOINTS TESTS ===")
        
        # Test get all poses
        result = self.run_test("Get All Yoga Poses", "GET", "/yoga/poses")
        if result:
            self.log(f"   Found {len(result)} yoga poses")
            
        # Test element filtering
        result = self.run_test("Filter Poses by Earth", "GET", "/yoga/poses?element=earth")
        if result:
            self.log(f"   Found {len(result)} earth element poses")
            
        # Test specific pose
        result = self.run_test("Get Specific Pose", "GET", "/yoga/poses/1")
        if result:
            self.log(f"   Pose: {result.get('name', 'N/A')}")

    def test_oracle_endpoints(self):
        """Test oracle reading endpoints"""
        self.log("\n=== ORACLE ENDPOINTS TESTS ===")
        
        # Test get oracle cards
        result = self.run_test("Get Oracle Cards", "GET", "/oracle/cards")
        if result:
            self.log(f"   Found {len(result)} oracle cards")
            
        # Test create oracle reading
        reading_data = {
            "question": "What guidance do I need for my spiritual journey?",
            "spread_type": "single"
        }
        result = self.run_test("Create Oracle Reading", "POST", "/oracle/reading", data=reading_data)
        if result:
            self.log(f"   Reading created with {len(result.get('cards', []))} cards")
            self.log(f"   Interpretation length: {len(result.get('interpretation', ''))}")
            
        # Test get readings history
        result = self.run_test("Get Oracle Readings History", "GET", "/oracle/readings")
        if result:
            self.log(f"   Found {len(result)} reading(s) in history")

    def test_breathwork_endpoints(self):
        """Test breathwork session endpoints"""
        self.log("\n=== BREATHWORK ENDPOINTS TESTS ===")
        
        # Test get all sessions
        result = self.run_test("Get Breathwork Sessions", "GET", "/breathwork/sessions")
        if result:
            self.log(f"   Found {len(result)} breathwork sessions")
            
        # Test element filtering
        result = self.run_test("Filter Sessions by Fire", "GET", "/breathwork/sessions?element=fire")
        if result:
            self.log(f"   Found {len(result)} fire element sessions")
            
        # Test specific session
        result = self.run_test("Get Specific Session", "GET", "/breathwork/sessions/1")
        if result:
            self.log(f"   Session: {result.get('name', 'N/A')}")

    def test_astrology_endpoints(self):
        """Test 13-month astrology endpoints"""
        self.log("\n=== ASTROLOGY ENDPOINTS TESTS ===")
        
        # Test get all months
        result = self.run_test("Get All Astrology Months", "GET", "/astrology/months")
        if result:
            self.log(f"   Found {len(result)} lunar months")
            
        # Test current month
        result = self.run_test("Get Current Moon", "GET", "/astrology/current")
        if result:
            self.log(f"   Current moon: {result.get('name', 'N/A')}")
            
        # Test specific month
        result = self.run_test("Get Specific Month", "GET", "/astrology/months/1")
        if result:
            self.log(f"   Month: {result.get('name', 'N/A')}")

    def test_crystals_endpoints(self):
        """Test crystal guide endpoints"""
        self.log("\n=== CRYSTALS ENDPOINTS TESTS ===")
        
        # Test get all crystals
        result = self.run_test("Get All Crystals", "GET", "/crystals")
        if result:
            self.log(f"   Found {len(result)} crystals")
            
        # Test element filtering
        result = self.run_test("Filter Crystals by Spirit", "GET", "/crystals?element=spirit")
        if result:
            self.log(f"   Found {len(result)} spirit element crystals")
            
        # Test chakra filtering
        result = self.run_test("Filter Crystals by Heart Chakra", "GET", "/crystals?chakra=heart")
        if result:
            self.log(f"   Found {len(result)} heart chakra crystals")

    def test_mantras_endpoints(self):
        """Test mantras library endpoints"""
        self.log("\n=== MANTRAS ENDPOINTS TESTS ===")
        
        # Test get all mantras
        result = self.run_test("Get All Mantras", "GET", "/mantras")
        if result:
            self.log(f"   Found {len(result)} mantras")
            
        # Test element filtering
        result = self.run_test("Filter Mantras by Spirit", "GET", "/mantras?element=spirit")
        if result:
            self.log(f"   Found {len(result)} spirit element mantras")

    def test_mudras_endpoints(self):
        """Test mudras library endpoints"""
        self.log("\n=== MUDRAS ENDPOINTS TESTS ===")
        
        # Test get all mudras
        result = self.run_test("Get All Mudras", "GET", "/mudras")
        if result:
            self.log(f"   Found {len(result)} mudras")
            
        # Test element filtering
        result = self.run_test("Filter Mudras by Earth", "GET", "/mudras?element=earth")
        if result:
            self.log(f"   Found {len(result)} earth element mudras")

    def test_somatic_grounding_endpoints(self):
        """Test somatic movement and grounding endpoints"""
        self.log("\n=== SOMATIC & GROUNDING ENDPOINTS TESTS ===")
        
        # Test somatic practices
        result = self.run_test("Get Somatic Practices", "GET", "/somatic/practices")
        if result:
            self.log(f"   Found {len(result)} somatic practices")
            
        # Test grounding exercises
        result = self.run_test("Get Grounding Exercises", "GET", "/grounding/exercises")
        if result:
            self.log(f"   Found {len(result)} grounding exercises")

    def test_dashboard_endpoints(self):
        """Test dashboard and user data endpoints"""
        self.log("\n=== DASHBOARD ENDPOINTS TESTS ===")
        
        # Test daily guidance
        result = self.run_test("Get Daily Guidance", "GET", "/dashboard/daily")
        if result:
            self.log(f"   Greeting: {result.get('greeting', 'N/A')}")
            self.log(f"   Current moon: {result.get('current_moon', {}).get('name', 'N/A')}")
            self.log(f"   Daily pose: {result.get('daily_pose', {}).get('name', 'N/A')}")

    def cleanup_test_data(self):
        """Clean up test user and session"""
        self.log("\n=== CLEANUP ===")
        try:
            import subprocess
            
            mongo_script = f"""
use('test_database');
db.users.deleteOne({{user_id: '{self.user_id}'}});
db.user_sessions.deleteOne({{user_id: '{self.user_id}'}});
db.oracle_readings.deleteMany({{user_id: '{self.user_id}'}});
"""
            
            subprocess.run(['mongosh', '--eval', mongo_script], 
                         capture_output=True, text=True, timeout=30)
            self.log("✅ Test data cleaned up")
        except Exception as e:
            self.log(f"⚠️  Cleanup warning: {str(e)}")

    def run_all_tests(self):
        """Run the complete test suite"""
        self.log("🌟 Starting Shamanic Elemental Yoga API Tests 🌟")
        start_time = time.time()
        
        try:
            # Basic health tests (no auth required)
            self.test_health_endpoints()
            
            # Setup authentication
            if not self.setup_test_session():
                self.log("❌ Cannot proceed without valid session")
                return 1
                
            # Test all endpoints
            self.test_auth_endpoints()
            self.test_yoga_endpoints()
            self.test_oracle_endpoints()
            self.test_breathwork_endpoints()
            self.test_astrology_endpoints()
            self.test_crystals_endpoints()
            self.test_mantras_endpoints()
            self.test_mudras_endpoints()
            self.test_somatic_grounding_endpoints()
            self.test_dashboard_endpoints()
            
        finally:
            self.cleanup_test_data()
            
        # Results
        duration = time.time() - start_time
        self.log(f"\n🏁 TESTING COMPLETE")
        self.log(f"Tests passed: {self.tests_passed}/{self.tests_run}")
        self.log(f"Duration: {duration:.1f}s")
        self.log(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    tester = ShamanicYogaAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())