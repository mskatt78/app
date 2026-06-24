#!/usr/bin/env python3
"""
Backend regression test for mantras and mudras endpoints
Tests:
1. GET /api/mantras returns 200 and each item includes master_embodiment_protocol + youtube_tutorials
2. GET /api/mudras returns 200 and each item includes master_embodiment_protocol + youtube_tutorials
3. Validate that youtube_tutorials contain valid youtube.com URLs
4. Confirm no 500 errors from these endpoints
"""

import requests
import json
from urllib.parse import urlparse

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"

def validate_youtube_url(url: str) -> bool:
    """Validate that URL is a valid youtube.com URL"""
    try:
        parsed = urlparse(url)
        return 'youtube.com' in parsed.netloc.lower()
    except:
        return False

def test_mantras_endpoint():
    """Test GET /api/mantras returns 200 with required fields"""
    print("\n=== Testing GET /api/mantras ===")
    try:
        response = requests.get(f"{BASE_URL}/api/mantras", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 500:
            print(f"❌ FAIL: Got 500 server error")
            print(f"Response: {response.text[:500]}")
            return False
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {len(data)} mantras returned")
        
        if not isinstance(data, list):
            print(f"❌ FAIL: Expected list, got {type(data)}")
            return False
        
        if len(data) == 0:
            print(f"❌ FAIL: Expected at least one mantra, got empty list")
            return False
        
        # Check each mantra has required fields
        missing_protocol = []
        missing_tutorials = []
        invalid_youtube_urls = []
        
        for idx, mantra in enumerate(data):
            mantra_name = mantra.get('name', f'mantra_{idx}')
            
            # Check master_embodiment_protocol
            if 'master_embodiment_protocol' not in mantra:
                missing_protocol.append(mantra_name)
            
            # Check youtube_tutorials
            if 'youtube_tutorials' not in mantra:
                missing_tutorials.append(mantra_name)
            else:
                tutorials = mantra['youtube_tutorials']
                if not isinstance(tutorials, list):
                    invalid_youtube_urls.append(f"{mantra_name}: youtube_tutorials is not a list")
                else:
                    for tutorial in tutorials:
                        if isinstance(tutorial, dict) and 'url' in tutorial:
                            if not validate_youtube_url(tutorial['url']):
                                invalid_youtube_urls.append(f"{mantra_name}: invalid URL {tutorial['url']}")
        
        # Report findings
        all_passed = True
        
        if missing_protocol:
            print(f"❌ FAIL: {len(missing_protocol)} mantras missing master_embodiment_protocol: {missing_protocol[:3]}")
            all_passed = False
        else:
            print(f"✅ All mantras have master_embodiment_protocol")
        
        if missing_tutorials:
            print(f"❌ FAIL: {len(missing_tutorials)} mantras missing youtube_tutorials: {missing_tutorials[:3]}")
            all_passed = False
        else:
            print(f"✅ All mantras have youtube_tutorials")
        
        if invalid_youtube_urls:
            print(f"❌ FAIL: {len(invalid_youtube_urls)} invalid YouTube URLs found: {invalid_youtube_urls[:3]}")
            all_passed = False
        else:
            print(f"✅ All youtube_tutorials contain valid youtube.com URLs")
        
        if all_passed:
            print(f"✅ PASS: All {len(data)} mantras have required fields with valid YouTube URLs")
        
        return all_passed
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_mudras_endpoint():
    """Test GET /api/mudras returns 200 with required fields"""
    print("\n=== Testing GET /api/mudras ===")
    try:
        response = requests.get(f"{BASE_URL}/api/mudras", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 500:
            print(f"❌ FAIL: Got 500 server error")
            print(f"Response: {response.text[:500]}")
            return False
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {len(data)} mudras returned")
        
        if not isinstance(data, list):
            print(f"❌ FAIL: Expected list, got {type(data)}")
            return False
        
        if len(data) == 0:
            print(f"❌ FAIL: Expected at least one mudra, got empty list")
            return False
        
        # Check each mudra has required fields
        missing_protocol = []
        missing_tutorials = []
        invalid_youtube_urls = []
        
        for idx, mudra in enumerate(data):
            mudra_name = mudra.get('name', f'mudra_{idx}')
            
            # Check master_embodiment_protocol
            if 'master_embodiment_protocol' not in mudra:
                missing_protocol.append(mudra_name)
            
            # Check youtube_tutorials
            if 'youtube_tutorials' not in mudra:
                missing_tutorials.append(mudra_name)
            else:
                tutorials = mudra['youtube_tutorials']
                if not isinstance(tutorials, list):
                    invalid_youtube_urls.append(f"{mudra_name}: youtube_tutorials is not a list")
                else:
                    for tutorial in tutorials:
                        if isinstance(tutorial, dict) and 'url' in tutorial:
                            if not validate_youtube_url(tutorial['url']):
                                invalid_youtube_urls.append(f"{mudra_name}: invalid URL {tutorial['url']}")
        
        # Report findings
        all_passed = True
        
        if missing_protocol:
            print(f"❌ FAIL: {len(missing_protocol)} mudras missing master_embodiment_protocol: {missing_protocol[:3]}")
            all_passed = False
        else:
            print(f"✅ All mudras have master_embodiment_protocol")
        
        if missing_tutorials:
            print(f"❌ FAIL: {len(missing_tutorials)} mudras missing youtube_tutorials: {missing_tutorials[:3]}")
            all_passed = False
        else:
            print(f"✅ All mudras have youtube_tutorials")
        
        if invalid_youtube_urls:
            print(f"❌ FAIL: {len(invalid_youtube_urls)} invalid YouTube URLs found: {invalid_youtube_urls[:3]}")
            all_passed = False
        else:
            print(f"✅ All youtube_tutorials contain valid youtube.com URLs")
        
        if all_passed:
            print(f"✅ PASS: All {len(data)} mudras have required fields with valid YouTube URLs")
        
        return all_passed
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("=" * 60)
    print("BACKEND REGRESSION TEST - MANTRAS & MUDRAS")
    print("=" * 60)
    
    results = {
        "mantras": test_mantras_endpoint(),
        "mudras": test_mudras_endpoint()
    }
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ ALL BACKEND TESTS PASSED")
    else:
        print("❌ SOME BACKEND TESTS FAILED")
    print("=" * 60)
    
    return all_passed

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
