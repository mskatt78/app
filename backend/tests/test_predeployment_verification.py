"""
Pre-deployment verification tests for Shamanic Elements Soul Temple 2.0
Tests all content endpoints to verify data counts and structure before deployment.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sacred-rites-deep.preview.emergentagent.com')


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """Verify API is healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["app"] == "Shamanic Elements Temple Of The Soul"
        assert data["version"] == "2.0.0"


class TestYogaContent:
    """Yoga poses endpoint tests - Expected: 78 poses across 5 elements"""
    
    def test_yoga_poses_count(self):
        """Verify 78 yoga poses are seeded"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        poses = response.json()
        assert len(poses) == 78, f"Expected 78 yoga poses, got {len(poses)}"
    
    def test_yoga_poses_have_elements(self):
        """Verify poses have element distribution (Earth, Water, Fire, Air, Spirit)"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        elements = set(p.get("element") for p in poses)
        expected_elements = {"Earth", "Water", "Fire", "Air", "Spirit"}
        assert expected_elements.issubset(elements), f"Missing elements: {expected_elements - elements}"
    
    def test_yoga_pose_structure(self):
        """Verify yoga pose has required fields"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = response.json()
        assert len(poses) > 0
        pose = poses[0]
        required_fields = ["id", "name", "element", "description"]
        for field in required_fields:
            assert field in pose, f"Missing field: {field}"


class TestMudrasContent:
    """Mudras endpoint tests - Expected: 12 mudras"""
    
    def test_mudras_count(self):
        """Verify 12 mudras are seeded"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        mudras = response.json()
        assert len(mudras) == 12, f"Expected 12 mudras, got {len(mudras)}"
    
    def test_mudras_have_images(self):
        """Verify mudras have image_url field"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        mudras = response.json()
        mudras_with_images = [m for m in mudras if m.get("image_url")]
        # At least some mudras should have images
        assert len(mudras_with_images) >= 6, f"Expected at least 6 mudras with images, got {len(mudras_with_images)}"
    
    def test_mudra_structure(self):
        """Verify mudra has required fields"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        mudras = response.json()
        assert len(mudras) > 0
        mudra = mudras[0]
        required_fields = ["id", "name", "element"]
        for field in required_fields:
            assert field in mudra, f"Missing field: {field}"


class TestBreathworkContent:
    """Breathwork sessions endpoint tests - Expected: 6 sessions"""
    
    def test_breathwork_sessions_count(self):
        """Verify 6 breathwork sessions are seeded"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        sessions = response.json()
        assert len(sessions) == 6, f"Expected 6 breathwork sessions, got {len(sessions)}"
    
    def test_breathwork_session_structure(self):
        """Verify breathwork session has required fields"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        sessions = response.json()
        assert len(sessions) > 0
        session = sessions[0]
        required_fields = ["id", "name", "description", "pattern"]
        for field in required_fields:
            assert field in session, f"Missing field: {field}"
    
    def test_breathwork_pattern_structure(self):
        """Verify breathwork pattern has inhale/exhale"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        sessions = response.json()
        for session in sessions:
            pattern = session.get("pattern", {})
            assert "inhale" in pattern, f"Session {session.get('name')} missing inhale in pattern"
            assert "exhale" in pattern, f"Session {session.get('name')} missing exhale in pattern"


class TestChakraContent:
    """Chakra cleansing endpoint tests - Expected: 13 chakras (7 base + 6 extended)"""
    
    def test_chakra_count(self):
        """Verify 13 chakras are seeded"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        assert response.status_code == 200
        chakras = response.json()
        assert len(chakras) == 13, f"Expected 13 chakras, got {len(chakras)}"
    
    def test_chakra_has_cleansing_guide(self):
        """Verify chakras have cleansing_guide content"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        chakras = response.json()
        chakras_with_guide = [c for c in chakras if c.get("cleansing_guide")]
        assert len(chakras_with_guide) == 13, f"Expected all 13 chakras with cleansing_guide, got {len(chakras_with_guide)}"
    
    def test_chakra_structure(self):
        """Verify chakra has required fields"""
        response = requests.get(f"{BASE_URL}/api/chakra-cleansing")
        chakras = response.json()
        assert len(chakras) > 0
        chakra = chakras[0]
        required_fields = ["id", "name", "chakra", "description"]
        for field in required_fields:
            assert field in chakra, f"Missing field: {field}"


class TestFeminineEmbodimentContent:
    """Feminine embodiment (Rose Temple) endpoint tests - Expected: 13 practices"""
    
    def test_feminine_embodiment_count(self):
        """Verify 13 feminine embodiment practices are seeded"""
        response = requests.get(f"{BASE_URL}/api/feminine-embodiment")
        assert response.status_code == 200
        practices = response.json()
        assert len(practices) == 13, f"Expected 13 feminine embodiment practices, got {len(practices)}"
    
    def test_feminine_has_practice_guide(self):
        """Verify practices have practice_guide content"""
        response = requests.get(f"{BASE_URL}/api/feminine-embodiment")
        practices = response.json()
        practices_with_guide = [p for p in practices if p.get("practice_guide")]
        assert len(practices_with_guide) >= 10, f"Expected at least 10 practices with practice_guide, got {len(practices_with_guide)}"
    
    def test_feminine_structure(self):
        """Verify feminine embodiment practice has required fields"""
        response = requests.get(f"{BASE_URL}/api/feminine-embodiment")
        practices = response.json()
        assert len(practices) > 0
        practice = practices[0]
        required_fields = ["id", "name", "category", "description"]
        for field in required_fields:
            assert field in practice, f"Missing field: {field}"


class TestMasculineEmbodimentContent:
    """Masculine embodiment (Masculine Temple) endpoint tests - Expected: 13 practices"""
    
    def test_masculine_embodiment_count(self):
        """Verify 13 masculine embodiment practices are seeded"""
        response = requests.get(f"{BASE_URL}/api/masculine-embodiment")
        assert response.status_code == 200
        practices = response.json()
        assert len(practices) == 13, f"Expected 13 masculine embodiment practices, got {len(practices)}"
    
    def test_masculine_has_practice_guide(self):
        """Verify practices have practice_guide content"""
        response = requests.get(f"{BASE_URL}/api/masculine-embodiment")
        practices = response.json()
        practices_with_guide = [p for p in practices if p.get("practice_guide")]
        assert len(practices_with_guide) >= 10, f"Expected at least 10 practices with practice_guide, got {len(practices_with_guide)}"
    
    def test_masculine_structure(self):
        """Verify masculine embodiment practice has required fields"""
        response = requests.get(f"{BASE_URL}/api/masculine-embodiment")
        practices = response.json()
        assert len(practices) > 0
        practice = practices[0]
        required_fields = ["id", "name", "category", "description"]
        for field in required_fields:
            assert field in practice, f"Missing field: {field}"


class TestMeditationsContent:
    """Meditations endpoint tests - Expected: 6 meditations"""
    
    def test_meditations_count(self):
        """Verify 6 meditations are seeded"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        meditations = response.json()
        assert len(meditations) == 6, f"Expected 6 meditations, got {len(meditations)}"
    
    def test_meditation_structure(self):
        """Verify meditation has required fields"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        meditations = response.json()
        assert len(meditations) > 0
        meditation = meditations[0]
        required_fields = ["id", "name", "description"]
        for field in required_fields:
            assert field in meditation, f"Missing field: {field}"


class TestAllContentSummary:
    """Summary test to verify all content counts in one place"""
    
    def test_all_content_counts(self):
        """Verify all content counts match expected values"""
        expected_counts = {
            "/api/yoga/poses": 78,
            "/api/mudras": 12,
            "/api/breathwork/sessions": 6,
            "/api/chakra-cleansing": 13,
            "/api/feminine-embodiment": 13,
            "/api/masculine-embodiment": 13,
            "/api/meditations": 6,
        }
        
        results = {}
        all_pass = True
        
        for endpoint, expected in expected_counts.items():
            response = requests.get(f"{BASE_URL}{endpoint}")
            assert response.status_code == 200, f"Endpoint {endpoint} returned {response.status_code}"
            actual = len(response.json())
            results[endpoint] = {"expected": expected, "actual": actual, "pass": actual == expected}
            if actual != expected:
                all_pass = False
        
        # Print summary
        print("\n=== Content Count Summary ===")
        for endpoint, result in results.items():
            status = "✅" if result["pass"] else "❌"
            print(f"{status} {endpoint}: {result['actual']}/{result['expected']}")
        
        assert all_pass, f"Some content counts don't match: {results}"
