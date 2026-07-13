#!/usr/bin/env python3
"""
P1 Pass Backend Verification Script
Tests guided content depth data checks and critical endpoint regression
"""

import requests
import json
import sys
from typing import Dict, List, Any

# Backend URL from frontend/.env
BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def test_ancient_wisdom_depth():
    """Test 1: GET /api/ancient-wisdom - verify guided content depth fields"""
    print("\n" + "="*80)
    print("TEST 1: Ancient Wisdom API - Guided Content Depth Data Checks")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/ancient-wisdom", timeout=10)
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_error(f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if not isinstance(data, list):
            print_error(f"Expected list, got {type(data)}")
            return False
        
        print_info(f"Total records: {len(data)}")
        
        if len(data) == 0:
            print_error("No records returned")
            return False
        
        # Check required fields in all records
        required_fields = [
            'why_this_heals',
            'integration_guide',
            'master_embodiment_protocol',
            'best_for_tags',
            'youtube_tutorials'
        ]
        
        records_with_all_fields = 0
        records_with_non_empty_fields = 0
        field_stats = {field: {'present': 0, 'non_empty': 0} for field in required_fields}
        
        for idx, record in enumerate(data):
            has_all_fields = True
            has_all_non_empty = True
            
            for field in required_fields:
                if field in record:
                    field_stats[field]['present'] += 1
                    
                    # Check if non-empty
                    value = record[field]
                    if value:  # Not None, not empty string, not empty list
                        if isinstance(value, str) and value.strip():
                            field_stats[field]['non_empty'] += 1
                        elif isinstance(value, list) and len(value) > 0:
                            field_stats[field]['non_empty'] += 1
                        elif isinstance(value, dict) and len(value) > 0:
                            field_stats[field]['non_empty'] += 1
                    else:
                        has_all_non_empty = False
                else:
                    has_all_fields = False
                    has_all_non_empty = False
            
            if has_all_fields:
                records_with_all_fields += 1
            if has_all_non_empty:
                records_with_non_empty_fields += 1
        
        # Print field statistics
        print("\nField Statistics:")
        for field in required_fields:
            present = field_stats[field]['present']
            non_empty = field_stats[field]['non_empty']
            print(f"  {field}:")
            print(f"    Present: {present}/{len(data)} ({100*present/len(data):.1f}%)")
            print(f"    Non-empty: {non_empty}/{len(data)} ({100*non_empty/len(data):.1f}%)")
        
        print(f"\nRecords with all fields present: {records_with_all_fields}/{len(data)}")
        print(f"Records with all fields non-empty: {records_with_non_empty_fields}/{len(data)}")
        
        # Sample first record for detailed inspection
        if len(data) > 0:
            print("\nSample Record (first item):")
            sample = data[0]
            print(f"  ID: {sample.get('id', 'N/A')}")
            print(f"  Name: {sample.get('name', 'N/A')}")
            for field in required_fields:
                value = sample.get(field, 'MISSING')
                if isinstance(value, str):
                    preview = value[:100] + "..." if len(value) > 100 else value
                    print(f"  {field}: {preview}")
                elif isinstance(value, list):
                    print(f"  {field}: [{len(value)} items]")
                elif isinstance(value, dict):
                    print(f"  {field}: {{{len(value)} keys}}")
                else:
                    print(f"  {field}: {value}")
        
        # Check if all records have non-empty required fields
        if records_with_non_empty_fields == len(data):
            print_success(f"All {len(data)} records have non-empty required fields")
            return True
        else:
            missing_count = len(data) - records_with_non_empty_fields
            print_warning(f"{missing_count} records have empty or missing required fields")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {e}")
        return False
    except json.JSONDecodeError as e:
        print_error(f"JSON decode failed: {e}")
        return False
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        return False

def test_sound_frequencies_depth():
    """Test 2: GET /api/sound-frequencies - verify guided content depth fields and no Wikimedia audio_url"""
    print("\n" + "="*80)
    print("TEST 2: Sound Frequencies API - Guided Content Depth Data Checks")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/sound-frequencies", timeout=10)
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_error(f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if not isinstance(data, list):
            print_error(f"Expected list, got {type(data)}")
            return False
        
        print_info(f"Total records: {len(data)}")
        
        if len(data) == 0:
            print_error("No records returned")
            return False
        
        # Check required fields in all records
        required_fields = [
            'why_this_heals',
            'integration_guide',
            'master_embodiment_protocol',
            'best_for_tags'
        ]
        
        records_with_all_fields = 0
        records_with_non_empty_fields = 0
        field_stats = {field: {'present': 0, 'non_empty': 0} for field in required_fields}
        
        # Track Wikimedia audio_url issues
        wikimedia_audio_count = 0
        records_with_audio_url = 0
        
        for idx, record in enumerate(data):
            has_all_fields = True
            has_all_non_empty = True
            
            # Check audio_url for Wikimedia links
            if 'audio_url' in record and record['audio_url']:
                records_with_audio_url += 1
                if 'wikimedia' in record['audio_url'].lower() or 'wikipedia' in record['audio_url'].lower():
                    wikimedia_audio_count += 1
                    print_warning(f"Record '{record.get('name', 'unknown')}' has Wikimedia audio_url: {record['audio_url']}")
            
            for field in required_fields:
                if field in record:
                    field_stats[field]['present'] += 1
                    
                    # Check if non-empty
                    value = record[field]
                    if value:  # Not None, not empty string, not empty list
                        if isinstance(value, str) and value.strip():
                            field_stats[field]['non_empty'] += 1
                        elif isinstance(value, list) and len(value) > 0:
                            field_stats[field]['non_empty'] += 1
                        elif isinstance(value, dict) and len(value) > 0:
                            field_stats[field]['non_empty'] += 1
                    else:
                        has_all_non_empty = False
                else:
                    has_all_fields = False
                    has_all_non_empty = False
            
            if has_all_fields:
                records_with_all_fields += 1
            if has_all_non_empty:
                records_with_non_empty_fields += 1
        
        # Print field statistics
        print("\nField Statistics:")
        for field in required_fields:
            present = field_stats[field]['present']
            non_empty = field_stats[field]['non_empty']
            print(f"  {field}:")
            print(f"    Present: {present}/{len(data)} ({100*present/len(data):.1f}%)")
            print(f"    Non-empty: {non_empty}/{len(data)} ({100*non_empty/len(data):.1f}%)")
        
        print(f"\nRecords with all fields present: {records_with_all_fields}/{len(data)}")
        print(f"Records with all fields non-empty: {records_with_non_empty_fields}/{len(data)}")
        
        # Wikimedia audio_url check
        print(f"\nAudio URL Statistics:")
        print(f"  Records with audio_url: {records_with_audio_url}/{len(data)}")
        print(f"  Records with Wikimedia audio_url: {wikimedia_audio_count}/{len(data)}")
        
        # Sample first record for detailed inspection
        if len(data) > 0:
            print("\nSample Record (first item):")
            sample = data[0]
            print(f"  ID: {sample.get('id', 'N/A')}")
            print(f"  Name: {sample.get('name', 'N/A')}")
            print(f"  audio_url: {sample.get('audio_url', 'MISSING/EMPTY')}")
            for field in required_fields:
                value = sample.get(field, 'MISSING')
                if isinstance(value, str):
                    preview = value[:100] + "..." if len(value) > 100 else value
                    print(f"  {field}: {preview}")
                elif isinstance(value, list):
                    print(f"  {field}: [{len(value)} items]")
                elif isinstance(value, dict):
                    print(f"  {field}: {{{len(value)} keys}}")
                else:
                    print(f"  {field}: {value}")
        
        # Check results
        all_passed = True
        
        if records_with_non_empty_fields == len(data):
            print_success(f"All {len(data)} records have non-empty required fields")
        else:
            missing_count = len(data) - records_with_non_empty_fields
            print_error(f"{missing_count} records have empty or missing required fields")
            all_passed = False
        
        if wikimedia_audio_count == 0:
            print_success("No Wikimedia audio_url links detected (correct - should be absent/empty for fallback)")
        else:
            print_error(f"{wikimedia_audio_count} records still have Wikimedia audio_url links")
            all_passed = False
        
        return all_passed
            
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {e}")
        return False
    except json.JSONDecodeError as e:
        print_error(f"JSON decode failed: {e}")
        return False
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        return False

def test_critical_endpoints_regression():
    """Test 3: Verify critical endpoints return 200 + valid JSON"""
    print("\n" + "="*80)
    print("TEST 3: Critical Endpoints Regression Check")
    print("="*80)
    
    endpoints = [
        '/mantras',
        '/mudras',
        '/daily-practice'
    ]
    
    all_passed = True
    
    for endpoint in endpoints:
        try:
            print(f"\nTesting {endpoint}...")
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            print_info(f"  Status Code: {response.status_code}")
            
            if response.status_code != 200:
                print_error(f"  Expected 200, got {response.status_code}")
                all_passed = False
                continue
            
            data = response.json()
            
            if isinstance(data, list):
                print_info(f"  Response: List with {len(data)} items")
            elif isinstance(data, dict):
                print_info(f"  Response: Dict with {len(data)} keys")
            else:
                print_info(f"  Response: {type(data)}")
            
            print_success(f"  {endpoint} returned 200 + valid JSON")
            
        except requests.exceptions.RequestException as e:
            print_error(f"  Request failed: {e}")
            all_passed = False
        except json.JSONDecodeError as e:
            print_error(f"  JSON decode failed: {e}")
            all_passed = False
        except Exception as e:
            print_error(f"  Unexpected error: {e}")
            all_passed = False
    
    return all_passed

def test_narration_expand_script():
    """Test 4: POST /api/content/expand-script - verify 15-minute narration expansion"""
    print("\n" + "="*80)
    print("TEST 4: Narration Floor Sanity - Expand Script Endpoint")
    print("="*80)
    
    try:
        # 15-minute sample payload
        payload = {
            "practice_name": "Deep Healing Meditation",
            "duration_minutes": 15,
            "practice_type": "meditation",
            "intention": "Deep healing and restoration",
            "key_elements": [
                "Breath awareness",
                "Body scan",
                "Healing visualization",
                "Integration"
            ],
            "use_ai": False
        }
        
        print_info("Sending 15-minute sample payload...")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/content/expand-script",
            json=payload,
            timeout=30
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_error(f"Expected 200, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
        
        data = response.json()
        
        # Check required fields
        required_fields = ['target_minutes', 'target_word_count', 'word_count', 'segments']
        missing_fields = [f for f in required_fields if f not in data]
        
        if missing_fields:
            print_error(f"Missing required fields: {missing_fields}")
            return False
        
        print("\nResponse Summary:")
        print(f"  target_minutes: {data.get('target_minutes')}")
        print(f"  target_word_count: {data.get('target_word_count')}")
        print(f"  word_count: {data.get('word_count')}")
        print(f"  segments: {len(data.get('segments', []))} segments")
        
        # Verify meaningful word_count
        word_count = data.get('word_count', 0)
        target_word_count = data.get('target_word_count', 0)
        
        if word_count == 0:
            print_error("word_count is 0 - not meaningful")
            return False
        
        if target_word_count == 0:
            print_error("target_word_count is 0 - not meaningful")
            return False
        
        # Check if word_count is reasonable (at least 80% of target)
        min_expected = target_word_count * 0.8
        if word_count < min_expected:
            print_warning(f"word_count ({word_count}) is less than 80% of target ({target_word_count})")
        
        # Check segments
        segments = data.get('segments', [])
        if len(segments) == 0:
            print_error("No segments returned")
            return False
        
        print(f"\nSegment Details:")
        for idx, segment in enumerate(segments[:3]):  # Show first 3 segments
            print(f"  Segment {idx + 1}:")
            if isinstance(segment, dict):
                print(f"    text: {segment.get('text', '')[:100]}...")
                print(f"    duration: {segment.get('duration', 'N/A')}")
            elif isinstance(segment, str):
                print(f"    text: {segment[:100]}...")
            else:
                print(f"    segment: {str(segment)[:100]}...")
        
        if len(segments) > 3:
            print(f"  ... and {len(segments) - 3} more segments")
        
        print_success(f"Expand script returned meaningful response: {word_count} words, {len(segments)} segments")
        return True
        
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {e}")
        return False
    except json.JSONDecodeError as e:
        print_error(f"JSON decode failed: {e}")
        return False
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        return False

def main():
    """Run all backend tests"""
    print("\n" + "="*80)
    print("BACKEND P1 PASS VERIFICATION")
    print("Testing on: " + BASE_URL)
    print("="*80)
    
    results = {}
    
    # Run all tests
    results['ancient_wisdom'] = test_ancient_wisdom_depth()
    results['sound_frequencies'] = test_sound_frequencies_depth()
    results['critical_endpoints'] = test_critical_endpoints_regression()
    results['narration_expand'] = test_narration_expand_script()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    for test_name, passed in results.items():
        status = "PASS" if passed else "FAIL"
        color = Colors.GREEN if passed else Colors.RED
        print(f"{color}{status}{Colors.END} - {test_name}")
    
    all_passed = all(results.values())
    
    print("\n" + "="*80)
    if all_passed:
        print_success("ALL TESTS PASSED ✓")
    else:
        print_error("SOME TESTS FAILED ✗")
    print("="*80 + "\n")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
