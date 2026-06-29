#!/usr/bin/env python3
"""Backend API testing script for yoga restoration verification."""

import requests
import json
import sys
from typing import Any

# Base URL from frontend/.env
BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com/api"

def test_yoga_poses_endpoint():
    """
    Test GET /api/yoga/poses endpoint for yoga restoration.
    
    Requirements:
    1. Returns full list (expected >14 poses)
    2. Free/premium split with 4 free and rest premium
    3. Endpoint returns 200 and valid JSON
    4. Spot-check items for required fields (id, name, is_premium)
    """
    print("=" * 80)
    print("YOGA RESTORATION BACKEND VERIFICATION")
    print("=" * 80)
    print(f"\nBase URL: {BASE_URL}")
    print(f"Testing: GET /yoga/poses\n")
    
    # Test 1: Make the request
    url = f"{BASE_URL}/yoga/poses"
    try:
        response = requests.get(url, timeout=10)
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Request error - {e}")
        return False
    
    # Test 2: Check status code
    print(f"Status Code: {response.status_code}")
    if response.status_code != 200:
        print(f"❌ FAILED: Expected 200, got {response.status_code}")
        return False
    print("✅ PASSED: Status code is 200")
    
    # Test 3: Check valid JSON
    try:
        data = response.json()
    except json.JSONDecodeError as e:
        print(f"❌ FAILED: Invalid JSON response - {e}")
        return False
    print("✅ PASSED: Valid JSON response")
    
    # Test 4: Check if response is a list
    if not isinstance(data, list):
        print(f"❌ FAILED: Expected list, got {type(data)}")
        return False
    print(f"✅ PASSED: Response is a list")
    
    # Test 5: Check count (expected >14)
    total_count = len(data)
    print(f"\nTotal poses returned: {total_count}")
    if total_count <= 14:
        print(f"❌ FAILED: Expected >14 poses, got {total_count}")
        return False
    print(f"✅ PASSED: Pose count ({total_count}) is greater than 14")
    
    # Test 6: Check free/premium split
    free_poses = [pose for pose in data if not pose.get("is_premium", True)]
    premium_poses = [pose for pose in data if pose.get("is_premium", False)]
    
    free_count = len(free_poses)
    premium_count = len(premium_poses)
    
    print(f"\nFree poses: {free_count}")
    print(f"Premium poses: {premium_count}")
    
    if free_count != 4:
        print(f"❌ FAILED: Expected 4 free poses, got {free_count}")
        return False
    print(f"✅ PASSED: Free pose count is 4")
    
    if premium_count != (total_count - 4):
        print(f"❌ FAILED: Expected {total_count - 4} premium poses, got {premium_count}")
        return False
    print(f"✅ PASSED: Premium pose count is {premium_count} (rest of poses)")
    
    # Test 7: Spot-check required fields
    print("\n" + "=" * 80)
    print("SPOT-CHECK: Required fields (id, name, is_premium)")
    print("=" * 80)
    
    # Check first 5 poses for required fields
    spot_check_count = min(5, total_count)
    all_fields_present = True
    
    for i in range(spot_check_count):
        pose = data[i]
        pose_id = pose.get("id")
        pose_name = pose.get("name")
        is_premium = pose.get("is_premium")
        
        print(f"\nPose {i+1}:")
        print(f"  id: {pose_id}")
        print(f"  name: {pose_name}")
        print(f"  is_premium: {is_premium}")
        
        if not pose_id:
            print(f"  ❌ Missing 'id' field")
            all_fields_present = False
        if not pose_name:
            print(f"  ❌ Missing 'name' field")
            all_fields_present = False
        if is_premium is None:
            print(f"  ❌ Missing 'is_premium' field")
            all_fields_present = False
        
        if pose_id and pose_name and is_premium is not None:
            print(f"  ✅ All required fields present")
    
    if not all_fields_present:
        print(f"\n❌ FAILED: Some poses missing required fields")
        return False
    print(f"\n✅ PASSED: All spot-checked poses have required fields")
    
    # Test 8: Verify first 4 are free, rest are premium
    print("\n" + "=" * 80)
    print("VERIFICATION: First 4 poses should be free, rest premium")
    print("=" * 80)
    
    first_4_free = all(not data[i].get("is_premium", True) for i in range(min(4, total_count)))
    rest_premium = all(data[i].get("is_premium", False) for i in range(4, total_count))
    
    if not first_4_free:
        print("❌ FAILED: First 4 poses are not all free")
        for i in range(min(4, total_count)):
            print(f"  Pose {i+1} ({data[i].get('name')}): is_premium={data[i].get('is_premium')}")
        return False
    print("✅ PASSED: First 4 poses are free")
    
    if not rest_premium:
        print("❌ FAILED: Not all remaining poses are premium")
        for i in range(4, min(10, total_count)):
            print(f"  Pose {i+1} ({data[i].get('name')}): is_premium={data[i].get('is_premium')}")
        return False
    print("✅ PASSED: All remaining poses are premium")
    
    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"✅ GET /yoga/poses returns 200 OK")
    print(f"✅ Response is valid JSON")
    print(f"✅ Total poses: {total_count} (expected >14)")
    print(f"✅ Free poses: {free_count} (expected 4)")
    print(f"✅ Premium poses: {premium_count} (expected rest)")
    print(f"✅ All spot-checked poses have required fields (id, name, is_premium)")
    print(f"✅ Free/premium split working correctly")
    print("\n🎉 ALL TESTS PASSED - Yoga restoration verified!")
    print("=" * 80)
    
    return True


if __name__ == "__main__":
    success = test_yoga_poses_endpoint()
    sys.exit(0 if success else 1)
