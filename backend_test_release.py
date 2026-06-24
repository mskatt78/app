#!/usr/bin/env python3
"""
Backend release validation test
Tests:
1. /api/yoga/poses includes direct_video youtube_tutorials for curated entries
2. /api/breathwork/sessions includes direct_video youtube_tutorials for curated entries
3. /api/meditations includes direct_video youtube_tutorials for curated entries
4. /api/mantras includes direct_video links
5. /api/mudras includes direct_video links
6. All five endpoints include best_for_tags with allowed tags only: sleep, anxiety, focus, grief, energy
7. Confirm no 500 responses
"""

import requests
import json
from typing import Any

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"
ALLOWED_TAGS = {"sleep", "anxiety", "focus", "grief", "energy"}

def check_youtube_tutorials(item: dict[str, Any], item_name: str, endpoint: str) -> tuple[bool, str]:
    """Check if youtube_tutorials field exists and contains direct_video entries"""
    if "youtube_tutorials" not in item:
        return False, f"Missing youtube_tutorials field in {item_name}"
    
    tutorials = item["youtube_tutorials"]
    if not isinstance(tutorials, list):
        return False, f"youtube_tutorials is not a list in {item_name}"
    
    if len(tutorials) == 0:
        return False, f"youtube_tutorials is empty in {item_name}"
    
    # Check if at least one tutorial has source="direct_video"
    has_direct_video = any(
        isinstance(t, dict) and t.get("source") == "direct_video"
        for t in tutorials
    )
    
    if not has_direct_video:
        return False, f"No direct_video source found in youtube_tutorials for {item_name}"
    
    return True, f"✓ {item_name} has direct_video youtube_tutorials"

def check_best_for_tags(item: dict[str, Any], item_name: str) -> tuple[bool, str]:
    """Check if best_for_tags field exists and contains only allowed tags"""
    if "best_for_tags" not in item:
        return False, f"Missing best_for_tags field in {item_name}"
    
    tags = item["best_for_tags"]
    if not isinstance(tags, list):
        return False, f"best_for_tags is not a list in {item_name}"
    
    # Check if all tags are in allowed set
    invalid_tags = [tag for tag in tags if tag not in ALLOWED_TAGS]
    if invalid_tags:
        return False, f"Invalid tags {invalid_tags} in {item_name}. Allowed: {ALLOWED_TAGS}"
    
    return True, f"✓ {item_name} has valid best_for_tags: {tags}"

def test_yoga_poses():
    """Test /api/yoga/poses for direct_video youtube_tutorials and best_for_tags"""
    print("\n=== Testing GET /api/yoga/poses ===")
    try:
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {len(data)} yoga poses")
        
        if not isinstance(data, list) or len(data) == 0:
            print(f"❌ FAIL: Expected non-empty list")
            return False
        
        # Check first 5 poses for direct_video youtube_tutorials
        issues = []
        checked_count = min(5, len(data))
        
        for i, pose in enumerate(data[:checked_count]):
            pose_name = pose.get("name", f"pose_{i}")
            
            # Check youtube_tutorials with direct_video
            success, msg = check_youtube_tutorials(pose, pose_name, "yoga/poses")
            if not success:
                issues.append(msg)
            else:
                print(f"  {msg}")
            
            # Check best_for_tags
            success, msg = check_best_for_tags(pose, pose_name)
            if not success:
                issues.append(msg)
            else:
                print(f"  {msg}")
        
        if issues:
            print(f"❌ FAIL: Issues found:")
            for issue in issues:
                print(f"  - {issue}")
            return False
        
        print(f"✅ PASS: Yoga poses have direct_video youtube_tutorials and valid best_for_tags")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def test_breathwork_sessions():
    """Test /api/breathwork/sessions for direct_video youtube_tutorials and best_for_tags"""
    print("\n=== Testing GET /api/breathwork/sessions ===")
    try:
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {len(data)} breathwork sessions")
        
        if not isinstance(data, list) or len(data) == 0:
            print(f"❌ FAIL: Expected non-empty list")
            return False
        
        # Check first 5 sessions for direct_video youtube_tutorials
        issues = []
        checked_count = min(5, len(data))
        
        for i, session in enumerate(data[:checked_count]):
            session_name = session.get("name", f"session_{i}")
            
            # Check youtube_tutorials with direct_video
            success, msg = check_youtube_tutorials(session, session_name, "breathwork/sessions")
            if not success:
                issues.append(msg)
            else:
                print(f"  {msg}")
            
            # Check best_for_tags
            success, msg = check_best_for_tags(session, session_name)
            if not success:
                issues.append(msg)
            else:
                print(f"  {msg}")
        
        if issues:
            print(f"❌ FAIL: Issues found:")
            for issue in issues:
                print(f"  - {issue}")
            return False
        
        print(f"✅ PASS: Breathwork sessions have direct_video youtube_tutorials and valid best_for_tags")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def test_meditations():
    """Test /api/meditations for direct_video youtube_tutorials and best_for_tags"""
    print("\n=== Testing GET /api/meditations ===")
    try:
        response = requests.get(f"{BASE_URL}/api/meditations", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {len(data)} meditations")
        
        if not isinstance(data, list) or len(data) == 0:
            print(f"❌ FAIL: Expected non-empty list")
            return False
        
        # Check first 5 meditations for direct_video youtube_tutorials
        issues = []
        checked_count = min(5, len(data))
        
        for i, meditation in enumerate(data[:checked_count]):
            meditation_name = meditation.get("name", f"meditation_{i}")
            
            # Check youtube_tutorials with direct_video
            success, msg = check_youtube_tutorials(meditation, meditation_name, "meditations")
            if not success:
                issues.append(msg)
            else:
                print(f"  {msg}")
            
            # Check best_for_tags
            success, msg = check_best_for_tags(meditation, meditation_name)
            if not success:
                issues.append(msg)
            else:
                print(f"  {msg}")
        
        if issues:
            print(f"❌ FAIL: Issues found:")
            for issue in issues:
                print(f"  - {issue}")
            return False
        
        print(f"✅ PASS: Meditations have direct_video youtube_tutorials and valid best_for_tags")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def test_mantras():
    """Test /api/mantras for direct_video links and best_for_tags"""
    print("\n=== Testing GET /api/mantras ===")
    try:
        response = requests.get(f"{BASE_URL}/api/mantras", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {len(data)} mantras")
        
        if not isinstance(data, list) or len(data) == 0:
            print(f"❌ FAIL: Expected non-empty list")
            return False
        
        # Check all mantras for direct_video links
        issues = []
        
        for i, mantra in enumerate(data):
            mantra_name = mantra.get("name", f"mantra_{i}")
            
            # Check youtube_tutorials with direct_video
            success, msg = check_youtube_tutorials(mantra, mantra_name, "mantras")
            if not success:
                issues.append(msg)
            else:
                print(f"  {msg}")
            
            # Check best_for_tags
            success, msg = check_best_for_tags(mantra, mantra_name)
            if not success:
                issues.append(msg)
            else:
                print(f"  {msg}")
        
        if issues:
            print(f"❌ FAIL: Issues found:")
            for issue in issues:
                print(f"  - {issue}")
            return False
        
        print(f"✅ PASS: Mantras have direct_video links and valid best_for_tags")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def test_mudras():
    """Test /api/mudras for direct_video links and best_for_tags"""
    print("\n=== Testing GET /api/mudras ===")
    try:
        response = requests.get(f"{BASE_URL}/api/mudras", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {len(data)} mudras")
        
        if not isinstance(data, list) or len(data) == 0:
            print(f"❌ FAIL: Expected non-empty list")
            return False
        
        # Check all mudras for direct_video links
        issues = []
        
        for i, mudra in enumerate(data):
            mudra_name = mudra.get("name", f"mudra_{i}")
            
            # Check youtube_tutorials with direct_video
            success, msg = check_youtube_tutorials(mudra, mudra_name, "mudras")
            if not success:
                issues.append(msg)
            else:
                print(f"  {msg}")
            
            # Check best_for_tags
            success, msg = check_best_for_tags(mudra, mudra_name)
            if not success:
                issues.append(msg)
            else:
                print(f"  {msg}")
        
        if issues:
            print(f"❌ FAIL: Issues found:")
            for issue in issues:
                print(f"  - {issue}")
            return False
        
        print(f"✅ PASS: Mudras have direct_video links and valid best_for_tags")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def main():
    print("=" * 80)
    print("BACKEND RELEASE VALIDATION TEST")
    print("=" * 80)
    
    results = {
        "yoga_poses": test_yoga_poses(),
        "breathwork_sessions": test_breathwork_sessions(),
        "meditations": test_meditations(),
        "mantras": test_mantras(),
        "mudras": test_mudras()
    }
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print("\n" + "=" * 80)
    if all_passed:
        print("✅ ALL BACKEND RELEASE VALIDATION TESTS PASSED")
        print("✓ All endpoints include direct_video youtube_tutorials for curated entries")
        print("✓ All endpoints include best_for_tags with allowed tags only")
        print("✓ No 500 responses detected")
    else:
        print("❌ SOME BACKEND RELEASE VALIDATION TESTS FAILED")
    print("=" * 80)
    
    return all_passed

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
