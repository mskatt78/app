#!/usr/bin/env python3
"""
Deep Backend Verification Script
Tests all critical backend APIs for Breathwork Sanctuary
"""

import requests
import json
import sys
from typing import Dict, List, Any

# Backend URL from environment
BACKEND_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

class BackendVerifier:
    def __init__(self):
        self.results = []
        self.blocking_issues = []
        self.non_blocking_issues = []
        
    def log_result(self, test_name: str, passed: bool, details: str, blocking: bool = False):
        """Log a test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        self.results.append({
            "test": test_name,
            "passed": passed,
            "details": details,
            "blocking": blocking
        })
        
        if not passed:
            if blocking:
                self.blocking_issues.append(f"{test_name}: {details}")
            else:
                self.non_blocking_issues.append(f"{test_name}: {details}")
        
        print(f"{status} - {test_name}")
        print(f"  {details}\n")
    
    def test_health_endpoint(self):
        """Test 1: Health endpoint returns 200"""
        try:
            response = requests.get(f"{BACKEND_URL}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result(
                    "Health Endpoint",
                    True,
                    f"Returns 200 OK with status: {data.get('status', 'N/A')}"
                )
            else:
                self.log_result(
                    "Health Endpoint",
                    False,
                    f"Expected 200, got {response.status_code}",
                    blocking=True
                )
        except Exception as e:
            self.log_result(
                "Health Endpoint",
                False,
                f"Exception: {str(e)}",
                blocking=True
            )
    
    def test_yoga_poses(self):
        """Test 2: Yoga poses endpoint - list, image_url, premium split"""
        try:
            response = requests.get(f"{BACKEND_URL}/yoga/poses", timeout=10)
            
            if response.status_code != 200:
                self.log_result(
                    "Yoga Poses API",
                    False,
                    f"Expected 200, got {response.status_code}",
                    blocking=True
                )
                return
            
            data = response.json()
            
            # Check non-empty list
            if not isinstance(data, list) or len(data) == 0:
                self.log_result(
                    "Yoga Poses API",
                    False,
                    f"Expected non-empty list, got {type(data)} with length {len(data) if isinstance(data, list) else 'N/A'}",
                    blocking=True
                )
                return
            
            # Check image_url presence
            missing_images = [i for i, pose in enumerate(data) if not pose.get('image_url')]
            
            # Check premium split (4 free, rest premium)
            free_poses = [p for p in data if not p.get('is_premium', True)]
            premium_poses = [p for p in data if p.get('is_premium', False)]
            
            issues = []
            if missing_images:
                issues.append(f"{len(missing_images)} poses missing image_url")
            
            if len(free_poses) != 4:
                issues.append(f"Expected 4 free poses, got {len(free_poses)}")
            
            if len(premium_poses) == 0:
                issues.append("No premium poses found")
            
            if issues:
                self.log_result(
                    "Yoga Poses API",
                    False,
                    f"Total: {len(data)} poses. Issues: {', '.join(issues)}",
                    blocking=True
                )
            else:
                self.log_result(
                    "Yoga Poses API",
                    True,
                    f"Total: {len(data)} poses. Free: {len(free_poses)}, Premium: {len(premium_poses)}. All have image_url."
                )
        except Exception as e:
            self.log_result(
                "Yoga Poses API",
                False,
                f"Exception: {str(e)}",
                blocking=True
            )
    
    def test_chair_yoga(self):
        """Test 3: Chair yoga endpoint - list and image_url"""
        try:
            response = requests.get(f"{BACKEND_URL}/chair-yoga", timeout=10)
            
            if response.status_code != 200:
                self.log_result(
                    "Chair Yoga API",
                    False,
                    f"Expected 200, got {response.status_code}",
                    blocking=True
                )
                return
            
            data = response.json()
            
            if not isinstance(data, list) or len(data) == 0:
                self.log_result(
                    "Chair Yoga API",
                    False,
                    f"Expected non-empty list, got {type(data)} with length {len(data) if isinstance(data, list) else 'N/A'}",
                    blocking=True
                )
                return
            
            missing_images = [i for i, item in enumerate(data) if not item.get('image_url')]
            
            if missing_images:
                self.log_result(
                    "Chair Yoga API",
                    False,
                    f"Total: {len(data)} items. {len(missing_images)} missing image_url",
                    blocking=True
                )
            else:
                self.log_result(
                    "Chair Yoga API",
                    True,
                    f"Total: {len(data)} items. All have image_url."
                )
        except Exception as e:
            self.log_result(
                "Chair Yoga API",
                False,
                f"Exception: {str(e)}",
                blocking=True
            )
    
    def test_fascia_stretching(self):
        """Test 4: Fascia stretching endpoint - list and image_url"""
        try:
            response = requests.get(f"{BACKEND_URL}/fascia-stretching", timeout=10)
            
            if response.status_code != 200:
                self.log_result(
                    "Fascia Stretching API",
                    False,
                    f"Expected 200, got {response.status_code}",
                    blocking=True
                )
                return
            
            data = response.json()
            
            if not isinstance(data, list) or len(data) == 0:
                self.log_result(
                    "Fascia Stretching API",
                    False,
                    f"Expected non-empty list, got {type(data)} with length {len(data) if isinstance(data, list) else 'N/A'}",
                    blocking=True
                )
                return
            
            missing_images = [i for i, item in enumerate(data) if not item.get('image_url')]
            
            if missing_images:
                self.log_result(
                    "Fascia Stretching API",
                    False,
                    f"Total: {len(data)} items. {len(missing_images)} missing image_url",
                    blocking=True
                )
            else:
                self.log_result(
                    "Fascia Stretching API",
                    True,
                    f"Total: {len(data)} items. All have image_url."
                )
        except Exception as e:
            self.log_result(
                "Fascia Stretching API",
                False,
                f"Exception: {str(e)}",
                blocking=True
            )
    
    def test_shamanic_practices(self):
        """Test 5: Shamanic practices endpoint - list and image_url"""
        try:
            response = requests.get(f"{BACKEND_URL}/shamanic-practices", timeout=10)
            
            if response.status_code != 200:
                self.log_result(
                    "Shamanic Practices API",
                    False,
                    f"Expected 200, got {response.status_code}",
                    blocking=True
                )
                return
            
            data = response.json()
            
            if not isinstance(data, list) or len(data) == 0:
                self.log_result(
                    "Shamanic Practices API",
                    False,
                    f"Expected non-empty list, got {type(data)} with length {len(data) if isinstance(data, list) else 'N/A'}",
                    blocking=True
                )
                return
            
            missing_images = [i for i, item in enumerate(data) if not item.get('image_url')]
            
            if missing_images:
                self.log_result(
                    "Shamanic Practices API",
                    False,
                    f"Total: {len(data)} items. {len(missing_images)} missing image_url",
                    blocking=True
                )
            else:
                self.log_result(
                    "Shamanic Practices API",
                    True,
                    f"Total: {len(data)} items. All have image_url."
                )
        except Exception as e:
            self.log_result(
                "Shamanic Practices API",
                False,
                f"Exception: {str(e)}",
                blocking=True
            )
    
    def test_sacred_guardians(self):
        """Test 6: Sacred guardians endpoint - 14 items and premium split"""
        try:
            response = requests.get(f"{BACKEND_URL}/sacred-guardians", timeout=10)
            
            if response.status_code != 200:
                self.log_result(
                    "Sacred Guardians API",
                    False,
                    f"Expected 200, got {response.status_code}",
                    blocking=True
                )
                return
            
            data = response.json()
            
            if not isinstance(data, list):
                self.log_result(
                    "Sacred Guardians API",
                    False,
                    f"Expected list, got {type(data)}",
                    blocking=True
                )
                return
            
            # Check for 14 items
            if len(data) != 14:
                self.log_result(
                    "Sacred Guardians API",
                    False,
                    f"Expected 14 items, got {len(data)}",
                    blocking=True
                )
                return
            
            # Check premium split (4 free, 10 premium expected)
            free_items = [p for p in data if not p.get('is_premium', True)]
            premium_items = [p for p in data if p.get('is_premium', False)]
            
            # Check image_url presence
            missing_images = [i for i, item in enumerate(data) if not item.get('image_url')]
            
            issues = []
            if missing_images:
                issues.append(f"{len(missing_images)} items missing image_url")
            
            if len(free_items) != 4:
                issues.append(f"Expected 4 free items, got {len(free_items)}")
            
            if len(premium_items) != 10:
                issues.append(f"Expected 10 premium items, got {len(premium_items)}")
            
            if issues:
                self.log_result(
                    "Sacred Guardians API",
                    False,
                    f"Total: {len(data)} items. Issues: {', '.join(issues)}",
                    blocking=True
                )
            else:
                self.log_result(
                    "Sacred Guardians API",
                    True,
                    f"Total: 14 items. Free: {len(free_items)}, Premium: {len(premium_items)}. All have image_url."
                )
        except Exception as e:
            self.log_result(
                "Sacred Guardians API",
                False,
                f"Exception: {str(e)}",
                blocking=True
            )
    
    def test_expand_script_7min(self):
        """Test 7: Expand script endpoint - 7 minute duration"""
        try:
            payload = {
                "practice_name": "Deep Breathwork Journey",
                "duration_minutes": 7,
                "use_ai": False,
                "practice_type": "breathwork",
                "elements": ["breath", "grounding"]
            }
            
            response = requests.post(
                f"{BACKEND_URL}/content/expand-script",
                json=payload,
                timeout=15
            )
            
            if response.status_code != 200:
                self.log_result(
                    "Expand Script 7min",
                    False,
                    f"Expected 200, got {response.status_code}",
                    blocking=True
                )
                return
            
            data = response.json()
            
            # Check required fields
            required_fields = ['target_minutes', 'target_word_count', 'word_count']
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                self.log_result(
                    "Expand Script 7min",
                    False,
                    f"Missing fields: {', '.join(missing_fields)}",
                    blocking=True
                )
                return
            
            # Verify word count supports minimum duration floor (7 min = ~840 words minimum)
            target_word_count = data.get('target_word_count', 0)
            word_count = data.get('word_count', 0)
            min_expected = 840  # 7 minutes * 120 words/min
            
            if word_count < min_expected * 0.8:  # Allow 80% threshold
                self.log_result(
                    "Expand Script 7min",
                    False,
                    f"Word count {word_count} below minimum floor {min_expected * 0.8}",
                    blocking=True
                )
            else:
                self.log_result(
                    "Expand Script 7min",
                    True,
                    f"Duration: {data.get('target_minutes')}min, Word count: {word_count} (>= {min_expected * 0.8})"
                )
        except Exception as e:
            self.log_result(
                "Expand Script 7min",
                False,
                f"Exception: {str(e)}",
                blocking=True
            )
    
    def test_expand_script_15min(self):
        """Test 8: Expand script endpoint - 15 minute duration"""
        try:
            payload = {
                "practice_name": "Extended Meditation",
                "duration_minutes": 15,
                "use_ai": False,
                "practice_type": "meditation",
                "elements": ["mindfulness", "body scan"]
            }
            
            response = requests.post(
                f"{BACKEND_URL}/content/expand-script",
                json=payload,
                timeout=15
            )
            
            if response.status_code != 200:
                self.log_result(
                    "Expand Script 15min",
                    False,
                    f"Expected 200, got {response.status_code}",
                    blocking=True
                )
                return
            
            data = response.json()
            
            # Verify word count supports minimum duration floor (15 min = ~1800 words minimum)
            word_count = data.get('word_count', 0)
            min_expected = 1800  # 15 minutes * 120 words/min
            
            if word_count < min_expected * 0.8:  # Allow 80% threshold
                self.log_result(
                    "Expand Script 15min",
                    False,
                    f"Word count {word_count} below minimum floor {min_expected * 0.8}",
                    blocking=True
                )
            else:
                self.log_result(
                    "Expand Script 15min",
                    True,
                    f"Duration: {data.get('target_minutes')}min, Word count: {word_count} (>= {min_expected * 0.8})"
                )
        except Exception as e:
            self.log_result(
                "Expand Script 15min",
                False,
                f"Exception: {str(e)}",
                blocking=True
            )
    
    def test_tts_generate(self):
        """Test 9: TTS generate endpoint - smoke test"""
        try:
            payload = {
                "text": "Welcome to this sacred breathwork journey. Take a deep breath in, and slowly release.",
                "voice": "alloy"
            }
            
            response = requests.post(
                f"{BACKEND_URL}/tts/generate-base64",
                json=payload,
                timeout=20
            )
            
            if response.status_code != 200:
                self.log_result(
                    "TTS Generate",
                    False,
                    f"Expected 200, got {response.status_code}",
                    blocking=False  # Non-blocking as TTS is supplementary
                )
                return
            
            data = response.json()
            
            # Check for audio_base64 field
            audio_base64 = data.get('audio_base64', '')
            
            if not audio_base64:
                self.log_result(
                    "TTS Generate",
                    False,
                    "Response missing audio_base64 field or empty",
                    blocking=False
                )
            elif len(audio_base64) < 1000:
                self.log_result(
                    "TTS Generate",
                    False,
                    f"Audio payload suspiciously small: {len(audio_base64)} chars",
                    blocking=False
                )
            else:
                self.log_result(
                    "TTS Generate",
                    True,
                    f"Audio payload size: {len(audio_base64)} chars (~{len(audio_base64) * 0.75 / 1024:.1f}KB)"
                )
        except Exception as e:
            self.log_result(
                "TTS Generate",
                False,
                f"Exception: {str(e)}",
                blocking=False
            )
    
    def print_summary(self):
        """Print final summary"""
        print("\n" + "="*80)
        print("BACKEND VERIFICATION SUMMARY")
        print("="*80 + "\n")
        
        passed = sum(1 for r in self.results if r['passed'])
        failed = sum(1 for r in self.results if not r['passed'])
        
        print(f"Total Tests: {len(self.results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print()
        
        if self.blocking_issues:
            print("🚨 BLOCKING ISSUES:")
            for issue in self.blocking_issues:
                print(f"  - {issue}")
            print()
        
        if self.non_blocking_issues:
            print("⚠️  NON-BLOCKING ISSUES:")
            for issue in self.non_blocking_issues:
                print(f"  - {issue}")
            print()
        
        if failed == 0:
            print("✅ VERDICT: Backend is READY for production")
            return 0
        elif len(self.blocking_issues) == 0:
            print("⚠️  VERDICT: Backend is READY with minor issues")
            return 0
        else:
            print("❌ VERDICT: Backend has BLOCKING issues - NOT READY")
            return 1

def main():
    print("="*80)
    print("DEEP BACKEND VERIFICATION")
    print("Target: https://breathwork-sanctuary.preview.emergentagent.com")
    print("="*80 + "\n")
    
    verifier = BackendVerifier()
    
    # Run all tests
    print("1. HEALTH AND CORE APIs")
    print("-" * 80)
    verifier.test_health_endpoint()
    verifier.test_yoga_poses()
    verifier.test_chair_yoga()
    verifier.test_fascia_stretching()
    verifier.test_shamanic_practices()
    verifier.test_sacred_guardians()
    
    print("\n2. NARRATION/TIMER BACKEND SUPPORT")
    print("-" * 80)
    verifier.test_expand_script_7min()
    verifier.test_expand_script_15min()
    
    print("\n3. GUIDED/TTS BACKEND SMOKE")
    print("-" * 80)
    verifier.test_tts_generate()
    
    # Print summary
    exit_code = verifier.print_summary()
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
