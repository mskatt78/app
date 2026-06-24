"""
Iteration 193 - Direct Video Links & Master Embodiment Protocol Tests
Tests for:
1. Mantras API - direct YouTube video links for top 10 mantras
2. Mudras API - direct YouTube video links for top 10 mudras
3. Yoga Poses API - master_embodiment_protocol + youtube_tutorials
4. Breathwork Sessions API - master_embodiment_protocol + youtube_tutorials
5. Meditations API - master_embodiment_protocol + youtube_tutorials
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestMantrasDirectVideoLinks:
    """Tests for direct YouTube video links in mantras API"""

    def test_mantras_endpoint_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        print("PASSED: Mantras endpoint returns 200")

    def test_mantras_have_youtube_tutorials(self):
        response = requests.get(f"{BASE_URL}/api/mantras")
        mantras = response.json()
        assert len(mantras) > 0, "No mantras returned"
        
        for mantra in mantras[:10]:
            assert "youtube_tutorials" in mantra, f"Mantra {mantra.get('name')} missing youtube_tutorials"
            assert len(mantra["youtube_tutorials"]) > 0, f"Mantra {mantra.get('name')} has empty youtube_tutorials"
        print("PASSED: Top 10 mantras have youtube_tutorials")

    def test_mantras_have_direct_video_links(self):
        """Verify top 10 mantras have source=direct_video links"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        mantras = response.json()
        
        # Expected mantras with direct video links
        expected_direct_video_mantras = [
            "om", "om mani padme hum", "lokah samastah sukhino bhavantu",
            "so hum", "sat nam", "om namah shivaya", "gayatri mantra",
            "ham sa", "om gam ganapataye namaha", "ra ma da sa"
        ]
        
        direct_video_count = 0
        for mantra in mantras:
            name_lower = mantra.get("name", "").lower()
            tutorials = mantra.get("youtube_tutorials", [])
            
            has_direct = any(t.get("source") == "direct_video" for t in tutorials)
            if name_lower in expected_direct_video_mantras:
                assert has_direct, f"Mantra '{mantra.get('name')}' should have direct_video link"
                direct_video_count += 1
        
        assert direct_video_count >= 8, f"Expected at least 8 mantras with direct_video, got {direct_video_count}"
        print(f"PASSED: {direct_video_count} mantras have direct_video links")

    def test_mantra_direct_video_urls_are_valid_youtube(self):
        """Verify direct video URLs are actual YouTube watch links"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        mantras = response.json()
        
        for mantra in mantras[:10]:
            tutorials = mantra.get("youtube_tutorials", [])
            for tutorial in tutorials:
                if tutorial.get("source") == "direct_video":
                    url = tutorial.get("url", "")
                    assert "youtube.com/watch?v=" in url, f"Direct video URL should be watch link: {url}"
        print("PASSED: Direct video URLs are valid YouTube watch links")


class TestMudrasDirectVideoLinks:
    """Tests for direct YouTube video links in mudras API"""

    def test_mudras_endpoint_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        print("PASSED: Mudras endpoint returns 200")

    def test_mudras_have_youtube_tutorials(self):
        response = requests.get(f"{BASE_URL}/api/mudras")
        mudras = response.json()
        assert len(mudras) > 0, "No mudras returned"
        
        for mudra in mudras[:10]:
            assert "youtube_tutorials" in mudra, f"Mudra {mudra.get('name')} missing youtube_tutorials"
            assert len(mudra["youtube_tutorials"]) > 0, f"Mudra {mudra.get('name')} has empty youtube_tutorials"
        print("PASSED: Top 10 mudras have youtube_tutorials")

    def test_mudras_have_direct_video_links(self):
        """Verify top 10 mudras have source=direct_video links"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        mudras = response.json()
        
        # Expected mudras with direct video links
        expected_direct_video_mudras = [
            "gyan mudra", "anjali mudra", "dhyana mudra", "prithvi mudra",
            "varuna mudra", "agni mudra", "vayu mudra", "shuni mudra",
            "surya mudra", "prana mudra"
        ]
        
        direct_video_count = 0
        for mudra in mudras:
            name_lower = mudra.get("name", "").lower()
            tutorials = mudra.get("youtube_tutorials", [])
            
            has_direct = any(t.get("source") == "direct_video" for t in tutorials)
            if name_lower in expected_direct_video_mudras:
                assert has_direct, f"Mudra '{mudra.get('name')}' should have direct_video link"
                direct_video_count += 1
        
        assert direct_video_count >= 8, f"Expected at least 8 mudras with direct_video, got {direct_video_count}"
        print(f"PASSED: {direct_video_count} mudras have direct_video links")

    def test_mudra_direct_video_urls_are_valid_youtube(self):
        """Verify direct video URLs are actual YouTube watch links"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        mudras = response.json()
        
        for mudra in mudras[:10]:
            tutorials = mudra.get("youtube_tutorials", [])
            for tutorial in tutorials:
                if tutorial.get("source") == "direct_video":
                    url = tutorial.get("url", "")
                    assert "youtube.com/watch?v=" in url, f"Direct video URL should be watch link: {url}"
        print("PASSED: Direct video URLs are valid YouTube watch links")


class TestYogaPosesProtocol:
    """Tests for master_embodiment_protocol and youtube_tutorials in yoga poses"""

    def test_yoga_poses_endpoint_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        print("PASSED: Yoga poses endpoint returns 200")

    def test_yoga_poses_have_master_embodiment_protocol(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        assert len(poses) > 0, "No poses returned"
        
        for pose in poses[:10]:
            assert "master_embodiment_protocol" in pose, f"Pose {pose.get('name')} missing master_embodiment_protocol"
            protocol = pose["master_embodiment_protocol"]
            assert "preparation_phase" in protocol, f"Pose {pose.get('name')} missing preparation_phase"
            assert "embodiment_phase" in protocol, f"Pose {pose.get('name')} missing embodiment_phase"
            assert "integration_phase" in protocol, f"Pose {pose.get('name')} missing integration_phase"
            assert "seven_day_embodiment" in protocol, f"Pose {pose.get('name')} missing seven_day_embodiment"
        print("PASSED: Yoga poses have master_embodiment_protocol with all phases")

    def test_yoga_poses_have_youtube_tutorials(self):
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        
        for pose in poses[:10]:
            assert "youtube_tutorials" in pose, f"Pose {pose.get('name')} missing youtube_tutorials"
            assert len(pose["youtube_tutorials"]) > 0, f"Pose {pose.get('name')} has empty youtube_tutorials"
        print("PASSED: Yoga poses have youtube_tutorials")


class TestBreathworkSessionsProtocol:
    """Tests for master_embodiment_protocol and youtube_tutorials in breathwork sessions"""

    def test_breathwork_sessions_endpoint_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        print("PASSED: Breathwork sessions endpoint returns 200")

    def test_breathwork_sessions_have_master_embodiment_protocol(self):
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        sessions = response.json()
        assert len(sessions) > 0, "No sessions returned"
        
        for session in sessions[:10]:
            assert "master_embodiment_protocol" in session, f"Session {session.get('name')} missing master_embodiment_protocol"
            protocol = session["master_embodiment_protocol"]
            assert "preparation_phase" in protocol, f"Session {session.get('name')} missing preparation_phase"
            assert "embodiment_phase" in protocol, f"Session {session.get('name')} missing embodiment_phase"
            assert "integration_phase" in protocol, f"Session {session.get('name')} missing integration_phase"
            assert "seven_day_embodiment" in protocol, f"Session {session.get('name')} missing seven_day_embodiment"
        print("PASSED: Breathwork sessions have master_embodiment_protocol with all phases")

    def test_breathwork_sessions_have_youtube_tutorials(self):
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        sessions = response.json()
        
        for session in sessions[:10]:
            assert "youtube_tutorials" in session, f"Session {session.get('name')} missing youtube_tutorials"
            assert len(session["youtube_tutorials"]) > 0, f"Session {session.get('name')} has empty youtube_tutorials"
        print("PASSED: Breathwork sessions have youtube_tutorials")


class TestMeditationsProtocol:
    """Tests for master_embodiment_protocol and youtube_tutorials in meditations"""

    def test_meditations_endpoint_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        print("PASSED: Meditations endpoint returns 200")

    def test_meditations_have_master_embodiment_protocol(self):
        response = requests.get(f"{BASE_URL}/api/meditations")
        meditations = response.json()
        assert len(meditations) > 0, "No meditations returned"
        
        for meditation in meditations[:10]:
            assert "master_embodiment_protocol" in meditation, f"Meditation {meditation.get('name')} missing master_embodiment_protocol"
            protocol = meditation["master_embodiment_protocol"]
            assert "preparation_phase" in protocol, f"Meditation {meditation.get('name')} missing preparation_phase"
            assert "embodiment_phase" in protocol, f"Meditation {meditation.get('name')} missing embodiment_phase"
            assert "integration_phase" in protocol, f"Meditation {meditation.get('name')} missing integration_phase"
            assert "seven_day_embodiment" in protocol, f"Meditation {meditation.get('name')} missing seven_day_embodiment"
        print("PASSED: Meditations have master_embodiment_protocol with all phases")

    def test_meditations_have_youtube_tutorials(self):
        response = requests.get(f"{BASE_URL}/api/meditations")
        meditations = response.json()
        
        for meditation in meditations[:10]:
            assert "youtube_tutorials" in meditation, f"Meditation {meditation.get('name')} missing youtube_tutorials"
            assert len(meditation["youtube_tutorials"]) > 0, f"Meditation {meditation.get('name')} has empty youtube_tutorials"
        print("PASSED: Meditations have youtube_tutorials")


class TestYouTubeUrlValidity:
    """Tests to verify YouTube URLs are properly formatted"""

    def test_all_youtube_urls_are_valid(self):
        """Verify all YouTube URLs across all endpoints are valid"""
        endpoints = [
            "/api/mantras",
            "/api/mudras",
            "/api/yoga/poses",
            "/api/breathwork/sessions",
            "/api/meditations"
        ]
        
        for endpoint in endpoints:
            response = requests.get(f"{BASE_URL}{endpoint}")
            items = response.json()
            
            for item in items[:5]:
                tutorials = item.get("youtube_tutorials", [])
                for tutorial in tutorials:
                    url = tutorial.get("url", "")
                    assert url.startswith("https://www.youtube.com/"), f"Invalid YouTube URL in {endpoint}: {url}"
                    assert tutorial.get("platform") == "youtube", f"Platform should be youtube in {endpoint}"
        print("PASSED: All YouTube URLs are valid across all endpoints")
