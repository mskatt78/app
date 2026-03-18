"""
Backend API tests for Shamanic Elemental Yoga App - Enhanced Features
Tests for yoga poses with images/instructions, mudras with images, and breathwork with frequencies
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://shamanic-yoga-temple.preview.emergentagent.com').rstrip('/')


class TestYogaPosesEnhanced:
    """Tests for enhanced yoga poses with images, instructions, benefits, difficulty, contraindications"""

    def test_get_all_yoga_poses_returns_60(self):
        """Verify 60 yoga poses are returned"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        assert len(poses) == 60, f"Expected 60 poses, got {len(poses)}"

    def test_yoga_pose_has_image_url(self):
        """Verify yoga poses have image_url field"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        for pose in poses[:10]:  # Check first 10
            assert 'image_url' in pose, f"Pose {pose['name']} missing image_url"
            assert pose['image_url'] is not None, f"Pose {pose['name']} has null image_url"
            assert pose['image_url'].startswith('http'), f"Pose {pose['name']} has invalid image_url"

    def test_yoga_pose_has_8_instructions(self):
        """Verify yoga poses have 8 step-by-step instructions"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        for pose in poses[:10]:  # Check first 10
            assert 'instructions' in pose, f"Pose {pose['name']} missing instructions"
            assert isinstance(pose['instructions'], list), f"Pose {pose['name']} instructions not a list"
            assert len(pose['instructions']) == 8, f"Pose {pose['name']} has {len(pose['instructions'])} instructions, expected 8"

    def test_yoga_pose_has_6_benefits(self):
        """Verify yoga poses have 6 detailed benefits"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        for pose in poses[:10]:  # Check first 10
            assert 'benefits' in pose, f"Pose {pose['name']} missing benefits"
            assert isinstance(pose['benefits'], list), f"Pose {pose['name']} benefits not a list"
            assert len(pose['benefits']) >= 6, f"Pose {pose['name']} has {len(pose['benefits'])} benefits, expected at least 6"

    def test_yoga_pose_has_difficulty_level(self):
        """Verify yoga poses have difficulty level (Beginner, Intermediate, Advanced)"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        valid_difficulties = ['Beginner', 'Intermediate', 'Advanced']
        for pose in poses[:10]:  # Check first 10
            assert 'difficulty' in pose, f"Pose {pose['name']} missing difficulty"
            assert pose['difficulty'] in valid_difficulties, f"Pose {pose['name']} has invalid difficulty: {pose['difficulty']}"

    def test_yoga_pose_has_contraindications(self):
        """Verify yoga poses have contraindications"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        for pose in poses[:10]:  # Check first 10
            assert 'contraindications' in pose, f"Pose {pose['name']} missing contraindications"
            assert isinstance(pose['contraindications'], list), f"Pose {pose['name']} contraindications not a list"
            assert len(pose['contraindications']) >= 1, f"Pose {pose['name']} has no contraindications"

    def test_yoga_pose_by_id(self):
        """Verify can fetch individual yoga pose by ID"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses/1")
        assert response.status_code == 200
        pose = response.json()
        assert pose['id'] == '1'
        assert pose['name'] == 'Mountain Pose'
        assert len(pose['instructions']) == 8
        assert len(pose['benefits']) >= 6

    def test_yoga_poses_filter_by_element(self):
        """Verify can filter yoga poses by element"""
        for element in ['Earth', 'Water', 'Fire', 'Air', 'Spirit']:
            response = requests.get(f"{BASE_URL}/api/yoga/poses", params={'element': element})
            assert response.status_code == 200
            poses = response.json()
            assert len(poses) > 0, f"No poses found for element {element}"
            for pose in poses:
                assert pose['element'] == element, f"Pose {pose['name']} has element {pose['element']}, expected {element}"


class TestMudrasEnhanced:
    """Tests for enhanced mudras with images and instructions"""

    def test_get_all_mudras_returns_12(self):
        """Verify 12 mudras are returned"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        mudras = response.json()
        assert len(mudras) == 12, f"Expected 12 mudras, got {len(mudras)}"

    def test_mudra_has_image_url(self):
        """Verify mudras have image_url field"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        mudras = response.json()
        for mudra in mudras:
            assert 'image_url' in mudra, f"Mudra {mudra['name']} missing image_url"
            assert mudra['image_url'] is not None, f"Mudra {mudra['name']} has null image_url"
            assert mudra['image_url'].startswith('http'), f"Mudra {mudra['name']} has invalid image_url"

    def test_mudra_has_instructions(self):
        """Verify mudras have detailed instructions"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        mudras = response.json()
        for mudra in mudras:
            assert 'instructions' in mudra, f"Mudra {mudra['name']} missing instructions"
            assert mudra['instructions'] is not None, f"Mudra {mudra['name']} has null instructions"
            assert len(mudra['instructions']) > 20, f"Mudra {mudra['name']} instructions too short"

    def test_mudra_has_benefits(self):
        """Verify mudras have benefits list"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        mudras = response.json()
        for mudra in mudras:
            assert 'benefits' in mudra, f"Mudra {mudra['name']} missing benefits"
            assert isinstance(mudra['benefits'], list), f"Mudra {mudra['name']} benefits not a list"
            assert len(mudra['benefits']) >= 3, f"Mudra {mudra['name']} has {len(mudra['benefits'])} benefits, expected at least 3"

    def test_mudras_filter_by_element(self):
        """Verify can filter mudras by element"""
        response = requests.get(f"{BASE_URL}/api/mudras", params={'element': 'Earth'})
        assert response.status_code == 200
        mudras = response.json()
        for mudra in mudras:
            assert mudra['element'] == 'Earth'


class TestBreathworkEnhanced:
    """Tests for enhanced breathwork sessions with frequency and best_time"""

    def test_get_all_breathwork_sessions_returns_6(self):
        """Verify 6 breathwork sessions are returned"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        sessions = response.json()
        assert len(sessions) == 6, f"Expected 6 sessions, got {len(sessions)}"

    def test_breathwork_session_has_frequency(self):
        """Verify breathwork sessions have frequency field with Hz information"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        sessions = response.json()
        for session in sessions:
            assert 'frequency' in session, f"Session {session['name']} missing frequency"
            assert session['frequency'] is not None, f"Session {session['name']} has null frequency"
            assert 'Hz' in session['frequency'], f"Session {session['name']} frequency missing Hz"

    def test_breathwork_session_has_best_time(self):
        """Verify breathwork sessions have best_time field"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        sessions = response.json()
        for session in sessions:
            assert 'best_time' in session, f"Session {session['name']} missing best_time"
            assert session['best_time'] is not None, f"Session {session['name']} has null best_time"
            assert len(session['best_time']) > 10, f"Session {session['name']} best_time too short"

    def test_breathwork_session_has_instructions(self):
        """Verify breathwork sessions have detailed instructions"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        sessions = response.json()
        for session in sessions:
            assert 'instructions' in session, f"Session {session['name']} missing instructions"
            assert session['instructions'] is not None, f"Session {session['name']} has null instructions"
            assert len(session['instructions']) > 20, f"Session {session['name']} instructions too short"

    def test_breathwork_session_by_id(self):
        """Verify can fetch individual breathwork session by ID"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions/1")
        assert response.status_code == 200
        session = response.json()
        assert session['id'] == '1'
        assert session['name'] == 'Earth Grounding Breath'
        assert 'frequency' in session
        assert 'best_time' in session

    def test_breathwork_sessions_filter_by_element(self):
        """Verify can filter breathwork sessions by element"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions", params={'element': 'Water'})
        assert response.status_code == 200
        sessions = response.json()
        assert len(sessions) > 0
        for session in sessions:
            assert session['element'] == 'Water'


class TestAPIHealth:
    """Basic health checks for the API"""

    def test_yoga_endpoint_accessible(self):
        """Verify yoga poses endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200

    def test_mudras_endpoint_accessible(self):
        """Verify mudras endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200

    def test_breathwork_endpoint_accessible(self):
        """Verify breathwork sessions endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200

    def test_invalid_yoga_pose_returns_404(self):
        """Verify invalid yoga pose ID returns 404"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses/99999")
        assert response.status_code == 404

    def test_invalid_breathwork_session_returns_404(self):
        """Verify invalid breathwork session ID returns 404"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions/99999")
        assert response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__, '-v'])
