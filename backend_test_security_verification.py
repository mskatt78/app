#!/usr/bin/env python3
"""
Backend API Security & Quality Verification for Breathwork Sanctuary
Tests specific endpoints for latest quality/security pass
"""

import requests
import sys
import json
import time
import base64
from datetime import datetime

class BreathworkSanctuarySecurityTester:
    def __init__(self, base_url="https://breathwork-sanctuary.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
    def log(self, message):
        """Log test messages"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")

    def run_test(self, name, method, endpoint, expected_status=200, data=None, headers=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_base}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=timeout)
            else:
                response = requests.request(method, url, json=data, headers=test_headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return response.json() if response.content else {}
                except:
                    return response.text
            else:
                self.failed_tests.append({
                    "name": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:500]
                })
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                self.log(f"   Response: {response.text[:200]}")
                return None

        except requests.exceptions.RequestException as e:
            self.failed_tests.append({
                "name": name,
                "error": str(e),
                "type": "request_exception"
            })
            self.log(f"❌ {name} - Request failed: {str(e)}")
            return None
        except Exception as e:
            self.failed_tests.append({
                "name": name,
                "error": str(e),
                "type": "unexpected_error"
            })
            self.log(f"❌ {name} - Unexpected error: {str(e)}")
            return None

    def test_narration_expansion_duration_safety(self):
        """Test 1: Narration expansion duration safety"""
        self.log("\n=== NARRATION EXPANSION DURATION SAFETY ===")
        
        # Test POST /content/expand-script with 15-minute request and use_ai=false
        request_data = {
            "practice_name": "15-Minute Security Test Practice",
            "element": "spirit",
            "duration_minutes": 15.0,
            "steps": [
                "Begin with three deep breaths",
                "Scan your body from head to toe",
                "Focus on your heart center",
                "Expand awareness to your surroundings",
                "Return to breath awareness"
            ],
            "source_texts": [
                "This is a comprehensive practice for deep relaxation and inner peace.",
                "Allow yourself to settle into stillness and presence."
            ],
            "use_ai": False
        }
        
        result = self.run_test(
            "Narration Expansion - 15 minute duration safety",
            "POST",
            "/content/expand-script",
            data=request_data,
            timeout=45
        )
        
        if result:
            word_count = result.get("word_count", 0)
            target_minutes = result.get("target_minutes", 0)
            used_ai = result.get("used_ai", True)
            
            # Verify word count maps to >=7 minute spoken script minimum
            # At 120 words per minute, 7 minutes = 840 words minimum
            min_words_for_7_minutes = 7 * 120  # 840 words
            
            self.log(f"   Word count: {word_count}")
            self.log(f"   Target minutes: {target_minutes}")
            self.log(f"   Used AI: {used_ai}")
            self.log(f"   Minimum words for 7 minutes: {min_words_for_7_minutes}")
            
            if word_count >= min_words_for_7_minutes:
                self.log(f"✅ Word count safety check PASSED - {word_count} >= {min_words_for_7_minutes}")
            else:
                self.failed_tests.append({
                    "name": "Word count safety check",
                    "expected": f">= {min_words_for_7_minutes} words",
                    "actual": f"{word_count} words",
                    "issue": "Insufficient word count for 7+ minute spoken script"
                })
                self.log(f"❌ Word count safety check FAILED - {word_count} < {min_words_for_7_minutes}")
            
            if not used_ai:
                self.log("✅ AI usage check PASSED - use_ai=false respected")
            else:
                self.failed_tests.append({
                    "name": "AI usage check",
                    "expected": "use_ai=false",
                    "actual": f"used_ai={used_ai}",
                    "issue": "AI was used despite use_ai=false"
                })
                self.log(f"❌ AI usage check FAILED - AI was used despite use_ai=false")

    def test_tts_endpoint_health(self):
        """Test 2: TTS endpoint health"""
        self.log("\n=== TTS ENDPOINT HEALTH ===")
        
        # Test POST /tts/generate-base64 with short text
        request_data = {
            "text": "Welcome to this peaceful meditation. Take a deep breath and relax.",
            "voice": "nova",
            "speed": 0.85
        }
        
        result = self.run_test(
            "TTS Generate Base64 - Short text",
            "POST",
            "/tts/generate-base64",
            data=request_data,
            timeout=30
        )
        
        if result:
            audio_base64 = result.get("audio_base64", "")
            format_type = result.get("format", "")
            
            self.log(f"   Audio format: {format_type}")
            self.log(f"   Base64 length: {len(audio_base64)} characters")
            
            # Verify valid audio_base64 payload
            if audio_base64 and len(audio_base64) > 100:
                try:
                    # Try to decode base64 to verify it's valid
                    decoded = base64.b64decode(audio_base64)
                    self.log(f"✅ Valid base64 audio payload - {len(decoded)} bytes")
                    
                    # Check if it looks like MP3 (starts with ID3 or has MP3 frame sync)
                    if decoded.startswith(b'ID3') or b'\xff\xfb' in decoded[:100]:
                        self.log("✅ Audio appears to be valid MP3 format")
                    else:
                        self.log("⚠️  Audio format verification inconclusive")
                        
                except Exception as e:
                    self.failed_tests.append({
                        "name": "TTS Base64 decode check",
                        "error": str(e),
                        "issue": "Invalid base64 audio payload"
                    })
                    self.log(f"❌ Invalid base64 audio payload: {e}")
            else:
                self.failed_tests.append({
                    "name": "TTS audio payload check",
                    "expected": "Valid audio_base64 with >100 chars",
                    "actual": f"audio_base64 length: {len(audio_base64)}",
                    "issue": "Empty or too short audio payload"
                })
                self.log(f"❌ Invalid audio payload - length: {len(audio_base64)}")

    def test_retreat_seeding_cleanup(self):
        """Test 3: Retreat seeding cleanup"""
        self.log("\n=== RETREAT SEEDING CLEANUP ===")
        
        # Test GET /retreats
        result = self.run_test(
            "Retreats - No default placeholders",
            "GET",
            "/retreats"
        )
        
        if result:
            retreats = result if isinstance(result, list) else []
            self.log(f"   Found {len(retreats)} retreats")
            
            # Check for placeholder retreats
            placeholder_indicators = [
                "test", "placeholder", "default", "sample", "demo",
                "sacred journey retreat"  # Specific placeholder mentioned in code
            ]
            
            placeholder_retreats = []
            for retreat in retreats:
                title = str(retreat.get("title", "")).lower().strip()
                description = str(retreat.get("description", "")).lower().strip()
                
                is_placeholder = any(
                    indicator in title or indicator in description
                    for indicator in placeholder_indicators
                )
                
                if is_placeholder:
                    placeholder_retreats.append({
                        "title": retreat.get("title", ""),
                        "id": retreat.get("id", ""),
                        "reason": "Contains placeholder indicators"
                    })
            
            if not placeholder_retreats:
                self.log("✅ No default placeholder retreats found")
            else:
                self.failed_tests.append({
                    "name": "Retreat placeholder cleanup",
                    "expected": "No placeholder retreats",
                    "actual": f"{len(placeholder_retreats)} placeholder retreats found",
                    "placeholders": placeholder_retreats
                })
                self.log(f"❌ Found {len(placeholder_retreats)} placeholder retreats:")
                for placeholder in placeholder_retreats:
                    self.log(f"   - {placeholder['title']} (ID: {placeholder['id']})")

    def test_security_randomness_spot_check(self):
        """Test 4: Security randomness spot-check"""
        self.log("\n=== SECURITY RANDOMNESS SPOT-CHECK ===")
        
        # Test archangel oracle randomness (using guest endpoint)
        self.log("Testing archangel oracle randomness...")
        oracle_results = []
        for i in range(5):
            result = self.run_test(
                f"Oracle Reading #{i+1}",
                "POST",
                "/oracle/reading/guest",
                data={
                    "question": f"Test question {i+1} for randomness verification",
                    "spread_type": "single"
                }
            )
            if result:
                cards = result.get("cards", [])
                if cards:
                    oracle_results.append(cards[0].get("id", "unknown"))
        
        if oracle_results:
            unique_results = len(set(oracle_results))
            self.log(f"   Oracle randomness: {unique_results}/{len(oracle_results)} unique results")
            if unique_results > 1:
                self.log("✅ Oracle shows randomness variation")
            else:
                self.log("⚠️  Oracle results appear deterministic")
        
        # Test rune drawing randomness
        self.log("Testing rune drawing randomness...")
        rune_results = []
        for i in range(5):
            result = self.run_test(
                f"Rune Draw #{i+1}",
                "GET",
                "/runes/draw/single"
            )
            if result:
                rune_results.append(result.get("id", "unknown"))
        
        if rune_results:
            unique_runes = len(set(rune_results))
            self.log(f"   Rune randomness: {unique_runes}/{len(rune_results)} unique results")
            if unique_runes > 1:
                self.log("✅ Rune drawing shows randomness variation")
            else:
                self.log("⚠️  Rune drawing appears deterministic")
        
        # Test I Ching casting randomness
        self.log("Testing I Ching casting randomness...")
        iching_results = []
        for i in range(5):
            result = self.run_test(
                f"I Ching Cast #{i+1}",
                "GET",
                "/i-ching/cast/coins"
            )
            if result:
                iching_results.append(result.get("number", 0))
        
        if iching_results:
            unique_hexagrams = len(set(iching_results))
            self.log(f"   I Ching randomness: {unique_hexagrams}/{len(iching_results)} unique results")
            if unique_hexagrams > 1:
                self.log("✅ I Ching casting shows randomness variation")
            else:
                self.log("⚠️  I Ching casting appears deterministic")

    def test_general_endpoint_health(self):
        """Test general endpoint health for non-200s and schema breaks"""
        self.log("\n=== GENERAL ENDPOINT HEALTH ===")
        
        # Test critical endpoints for 200 responses
        critical_endpoints = [
            ("/health", "Health Check"),
            ("/yoga/poses", "Yoga Poses"),
            ("/crystals", "Crystals"),
            ("/mantras", "Mantras"),
            ("/mudras", "Mudras"),
            ("/meditations", "Meditations"),
            ("/breathwork/sessions", "Breathwork Sessions"),
            ("/light-codes", "Light Codes"),
            ("/sacred-guardians", "Sacred Guardians"),
            ("/ancient-wisdom", "Ancient Wisdom"),
            ("/sound-frequencies", "Sound Frequencies"),
            ("/tarot/cards", "Tarot Cards"),
            ("/community/posts", "Community Posts")
        ]
        
        for endpoint, name in critical_endpoints:
            result = self.run_test(
                f"Health Check - {name}",
                "GET",
                endpoint
            )
            
            # Basic schema validation for list endpoints
            if result is not None and endpoint != "/health":
                if isinstance(result, list):
                    self.log(f"   {name}: {len(result)} items returned")
                elif isinstance(result, dict):
                    if "status" in result:  # Health endpoint
                        self.log(f"   {name}: {result.get('status', 'unknown')}")
                    else:
                        self.log(f"   {name}: Dictionary response with {len(result)} keys")
                else:
                    self.log(f"   {name}: Unexpected response type: {type(result)}")

    def run_all_tests(self):
        """Run the complete security verification test suite"""
        self.log("🔒 Starting Breathwork Sanctuary Security & Quality Verification 🔒")
        start_time = time.time()
        
        try:
            # Run all security verification tests
            self.test_narration_expansion_duration_safety()
            self.test_tts_endpoint_health()
            self.test_retreat_seeding_cleanup()
            self.test_security_randomness_spot_check()
            self.test_general_endpoint_health()
            
        except Exception as e:
            self.log(f"❌ Test suite error: {str(e)}")
            
        # Results
        duration = time.time() - start_time
        self.log(f"\n🏁 SECURITY VERIFICATION COMPLETE")
        self.log(f"Tests passed: {self.tests_passed}/{self.tests_run}")
        self.log(f"Duration: {duration:.1f}s")
        self.log(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            self.log(f"\n❌ FAILED TESTS ({len(self.failed_tests)}):")
            for i, failure in enumerate(self.failed_tests, 1):
                self.log(f"{i}. {failure['name']}")
                if 'expected' in failure and 'actual' in failure:
                    self.log(f"   Expected: {failure['expected']}")
                    self.log(f"   Actual: {failure['actual']}")
                if 'error' in failure:
                    self.log(f"   Error: {failure['error']}")
                if 'issue' in failure:
                    self.log(f"   Issue: {failure['issue']}")
                self.log("")
        
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    tester = BreathworkSanctuarySecurityTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())