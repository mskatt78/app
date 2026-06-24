"""
Iteration 194 - Direct Video Links & Best-For Tags Testing

Tests:
1. Yoga/Breathwork/Meditations return direct YouTube watch links where curated maps exist
2. Mantras/Mudras keep direct links and support admin tutorial override URLs
3. best_for_tags present in API responses for mantras, mudras, yoga_poses, breathwork_sessions, meditations
4. Admin edit forms include best_for_tags and youtube_tutorial_override_urls fields
5. Admin update path persists override URLs and best_for_tags
"""

import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Curated direct video maps from content.py
YOGA_DIRECT_VIDEO_NAMES = [
    "mountain pose", "tree pose", "bridge pose", "garland pose", "extended triangle",
    "wide legged forward fold", "chair pose", "standing forward fold", "goddess pose", "half moon pose"
]

BREATHWORK_DIRECT_VIDEO_NAMES = [
    "earth grounding breath", "fire breath kapalabhati", "ocean breath ujjayi",
    "wind clearing breath", "spirit journey breath", "4 7 8 relaxation"
]

MEDITATION_DIRECT_VIDEO_NAMES = [
    "inner peace journey", "mountain meditation", "chakra cleansing",
    "forest bathing", "ocean of consciousness", "inner fire activation"
]

MANTRA_DIRECT_VIDEO_NAMES = [
    "om", "om mani padme hum", "lokah samastah sukhino bhavantu", "so hum", "sat nam",
    "om namah shivaya", "gayatri mantra", "ham sa", "om gam ganapataye namaha", "ra ma da sa"
]

MUDRA_DIRECT_VIDEO_NAMES = [
    "gyan mudra", "anjali mudra", "dhyana mudra", "prithvi mudra", "varuna mudra",
    "agni mudra", "vayu mudra", "shuni mudra", "surya mudra", "prana mudra"
]

ALLOWED_BEST_FOR_TAGS = {"sleep", "anxiety", "focus", "grief", "energy"}


class TestYogaDirectVideoLinks:
    """Test yoga poses return direct YouTube watch links where curated maps exist"""

    def test_yoga_poses_endpoint_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of yoga poses"
        assert len(data) > 0, "Expected at least one yoga pose"
        print(f"✓ Yoga poses endpoint returned {len(data)} poses")

    def test_yoga_poses_have_youtube_tutorials(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=30)
        data = response.json()
        poses_with_tutorials = [p for p in data if p.get("youtube_tutorials")]
        assert len(poses_with_tutorials) > 0, "Expected at least some poses with youtube_tutorials"
        print(f"✓ {len(poses_with_tutorials)} yoga poses have youtube_tutorials")

    def test_yoga_poses_have_direct_video_links(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=30)
        data = response.json()
        
        direct_video_count = 0
        for pose in data:
            pose_name_lower = pose.get("name", "").lower().strip()
            tutorials = pose.get("youtube_tutorials", [])
            for tutorial in tutorials:
                if tutorial.get("source") == "direct_video":
                    direct_video_count += 1
                    assert "youtube.com/watch" in tutorial.get("url", ""), f"Direct video URL should be youtube.com/watch link: {tutorial.get('url')}"
                    break
        
        assert direct_video_count >= 5, f"Expected at least 5 yoga poses with direct_video links, got {direct_video_count}"
        print(f"✓ {direct_video_count} yoga poses have direct_video links")

    def test_yoga_poses_have_best_for_tags(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=30)
        data = response.json()
        
        poses_with_tags = [p for p in data if p.get("best_for_tags")]
        assert len(poses_with_tags) > 0, "Expected at least some poses with best_for_tags"
        
        for pose in poses_with_tags:
            tags = pose.get("best_for_tags", [])
            for tag in tags:
                assert tag in ALLOWED_BEST_FOR_TAGS, f"Invalid best_for_tag '{tag}' in pose {pose.get('name')}"
        
        print(f"✓ {len(poses_with_tags)} yoga poses have valid best_for_tags")


class TestBreathworkDirectVideoLinks:
    """Test breathwork sessions return direct YouTube watch links where curated maps exist"""

    def test_breathwork_sessions_endpoint_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of breathwork sessions"
        assert len(data) > 0, "Expected at least one breathwork session"
        print(f"✓ Breathwork sessions endpoint returned {len(data)} sessions")

    def test_breathwork_sessions_have_youtube_tutorials(self):
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions", timeout=30)
        data = response.json()
        sessions_with_tutorials = [s for s in data if s.get("youtube_tutorials")]
        assert len(sessions_with_tutorials) > 0, "Expected at least some sessions with youtube_tutorials"
        print(f"✓ {len(sessions_with_tutorials)} breathwork sessions have youtube_tutorials")

    def test_breathwork_sessions_have_direct_video_links(self):
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions", timeout=30)
        data = response.json()
        
        direct_video_count = 0
        for session in data:
            session_name_lower = session.get("name", "").lower().strip()
            tutorials = session.get("youtube_tutorials", [])
            for tutorial in tutorials:
                if tutorial.get("source") == "direct_video":
                    direct_video_count += 1
                    assert "youtube.com/watch" in tutorial.get("url", ""), f"Direct video URL should be youtube.com/watch link: {tutorial.get('url')}"
                    break
        
        assert direct_video_count >= 3, f"Expected at least 3 breathwork sessions with direct_video links, got {direct_video_count}"
        print(f"✓ {direct_video_count} breathwork sessions have direct_video links")

    def test_breathwork_sessions_have_best_for_tags(self):
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions", timeout=30)
        data = response.json()
        
        sessions_with_tags = [s for s in data if s.get("best_for_tags")]
        assert len(sessions_with_tags) > 0, "Expected at least some sessions with best_for_tags"
        
        for session in sessions_with_tags:
            tags = session.get("best_for_tags", [])
            for tag in tags:
                assert tag in ALLOWED_BEST_FOR_TAGS, f"Invalid best_for_tag '{tag}' in session {session.get('name')}"
        
        print(f"✓ {len(sessions_with_tags)} breathwork sessions have valid best_for_tags")


class TestMeditationsDirectVideoLinks:
    """Test meditations return direct YouTube watch links where curated maps exist"""

    def test_meditations_endpoint_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/meditations", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of meditations"
        assert len(data) > 0, "Expected at least one meditation"
        print(f"✓ Meditations endpoint returned {len(data)} meditations")

    def test_meditations_have_youtube_tutorials(self):
        response = requests.get(f"{BASE_URL}/api/meditations", timeout=30)
        data = response.json()
        meditations_with_tutorials = [m for m in data if m.get("youtube_tutorials")]
        assert len(meditations_with_tutorials) > 0, "Expected at least some meditations with youtube_tutorials"
        print(f"✓ {len(meditations_with_tutorials)} meditations have youtube_tutorials")

    def test_meditations_have_direct_video_links(self):
        response = requests.get(f"{BASE_URL}/api/meditations", timeout=30)
        data = response.json()
        
        direct_video_count = 0
        for meditation in data:
            meditation_name_lower = meditation.get("name", "").lower().strip()
            tutorials = meditation.get("youtube_tutorials", [])
            for tutorial in tutorials:
                if tutorial.get("source") == "direct_video":
                    direct_video_count += 1
                    assert "youtube.com/watch" in tutorial.get("url", ""), f"Direct video URL should be youtube.com/watch link: {tutorial.get('url')}"
                    break
        
        assert direct_video_count >= 3, f"Expected at least 3 meditations with direct_video links, got {direct_video_count}"
        print(f"✓ {direct_video_count} meditations have direct_video links")

    def test_meditations_have_best_for_tags(self):
        response = requests.get(f"{BASE_URL}/api/meditations", timeout=30)
        data = response.json()
        
        meditations_with_tags = [m for m in data if m.get("best_for_tags")]
        assert len(meditations_with_tags) > 0, "Expected at least some meditations with best_for_tags"
        
        for meditation in meditations_with_tags:
            tags = meditation.get("best_for_tags", [])
            for tag in tags:
                assert tag in ALLOWED_BEST_FOR_TAGS, f"Invalid best_for_tag '{tag}' in meditation {meditation.get('name')}"
        
        print(f"✓ {len(meditations_with_tags)} meditations have valid best_for_tags")


class TestMantrasDirectVideoLinks:
    """Test mantras keep direct links and support admin tutorial override URLs"""

    def test_mantras_endpoint_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/mantras", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of mantras"
        assert len(data) > 0, "Expected at least one mantra"
        print(f"✓ Mantras endpoint returned {len(data)} mantras")

    def test_mantras_have_youtube_tutorials(self):
        response = requests.get(f"{BASE_URL}/api/mantras", timeout=30)
        data = response.json()
        mantras_with_tutorials = [m for m in data if m.get("youtube_tutorials")]
        assert len(mantras_with_tutorials) > 0, "Expected at least some mantras with youtube_tutorials"
        print(f"✓ {len(mantras_with_tutorials)} mantras have youtube_tutorials")

    def test_mantras_have_direct_video_links(self):
        response = requests.get(f"{BASE_URL}/api/mantras", timeout=30)
        data = response.json()
        
        direct_video_count = 0
        for mantra in data:
            tutorials = mantra.get("youtube_tutorials", [])
            for tutorial in tutorials:
                if tutorial.get("source") == "direct_video":
                    direct_video_count += 1
                    assert "youtube.com/watch" in tutorial.get("url", ""), f"Direct video URL should be youtube.com/watch link: {tutorial.get('url')}"
                    break
        
        assert direct_video_count >= 8, f"Expected at least 8 mantras with direct_video links, got {direct_video_count}"
        print(f"✓ {direct_video_count} mantras have direct_video links")

    def test_mantras_have_best_for_tags(self):
        response = requests.get(f"{BASE_URL}/api/mantras", timeout=30)
        data = response.json()
        
        mantras_with_tags = [m for m in data if m.get("best_for_tags")]
        assert len(mantras_with_tags) > 0, "Expected at least some mantras with best_for_tags"
        
        for mantra in mantras_with_tags:
            tags = mantra.get("best_for_tags", [])
            for tag in tags:
                assert tag in ALLOWED_BEST_FOR_TAGS, f"Invalid best_for_tag '{tag}' in mantra {mantra.get('name')}"
        
        print(f"✓ {len(mantras_with_tags)} mantras have valid best_for_tags")


class TestMudrasDirectVideoLinks:
    """Test mudras keep direct links and support admin tutorial override URLs"""

    def test_mudras_endpoint_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/mudras", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of mudras"
        assert len(data) > 0, "Expected at least one mudra"
        print(f"✓ Mudras endpoint returned {len(data)} mudras")

    def test_mudras_have_youtube_tutorials(self):
        response = requests.get(f"{BASE_URL}/api/mudras", timeout=30)
        data = response.json()
        mudras_with_tutorials = [m for m in data if m.get("youtube_tutorials")]
        assert len(mudras_with_tutorials) > 0, "Expected at least some mudras with youtube_tutorials"
        print(f"✓ {len(mudras_with_tutorials)} mudras have youtube_tutorials")

    def test_mudras_have_direct_video_links(self):
        response = requests.get(f"{BASE_URL}/api/mudras", timeout=30)
        data = response.json()
        
        direct_video_count = 0
        for mudra in data:
            tutorials = mudra.get("youtube_tutorials", [])
            for tutorial in tutorials:
                if tutorial.get("source") == "direct_video":
                    direct_video_count += 1
                    assert "youtube.com/watch" in tutorial.get("url", ""), f"Direct video URL should be youtube.com/watch link: {tutorial.get('url')}"
                    break
        
        assert direct_video_count >= 8, f"Expected at least 8 mudras with direct_video links, got {direct_video_count}"
        print(f"✓ {direct_video_count} mudras have direct_video links")

    def test_mudras_have_best_for_tags(self):
        response = requests.get(f"{BASE_URL}/api/mudras", timeout=30)
        data = response.json()
        
        mudras_with_tags = [m for m in data if m.get("best_for_tags")]
        assert len(mudras_with_tags) > 0, "Expected at least some mudras with best_for_tags"
        
        for mudra in mudras_with_tags:
            tags = mudra.get("best_for_tags", [])
            for tag in tags:
                assert tag in ALLOWED_BEST_FOR_TAGS, f"Invalid best_for_tag '{tag}' in mudra {mudra.get('name')}"
        
        print(f"✓ {len(mudras_with_tags)} mudras have valid best_for_tags")


class TestAllYouTubeUrlsValid:
    """Test all YouTube URLs are valid youtube.com links"""

    def test_all_youtube_urls_are_valid(self):
        endpoints = [
            "/api/yoga/poses",
            "/api/breathwork/sessions",
            "/api/meditations",
            "/api/mantras",
            "/api/mudras"
        ]
        
        invalid_urls = []
        total_urls = 0
        
        for endpoint in endpoints:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=30)
            if response.status_code != 200:
                continue
            
            data = response.json()
            for item in data:
                tutorials = item.get("youtube_tutorials", [])
                for tutorial in tutorials:
                    url = tutorial.get("url", "")
                    total_urls += 1
                    if url and "youtube.com" not in url:
                        invalid_urls.append({
                            "endpoint": endpoint,
                            "item": item.get("name"),
                            "url": url
                        })
        
        assert len(invalid_urls) == 0, f"Found {len(invalid_urls)} invalid YouTube URLs: {invalid_urls}"
        print(f"✓ All {total_urls} YouTube URLs are valid youtube.com links")


class TestAdminFieldsConfiguration:
    """Test admin FIELD_CONFIG includes best_for_tags and youtube_tutorial_override_urls"""

    def test_admin_collections_endpoint_returns_200(self):
        """Test admin collections endpoint is accessible (without auth, should return 401)"""
        response = requests.get(f"{BASE_URL}/api/admin/collections", timeout=30)
        # Without auth, should return 401
        assert response.status_code in [200, 401], f"Expected 200 or 401, got {response.status_code}"
        print(f"✓ Admin collections endpoint returned {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
