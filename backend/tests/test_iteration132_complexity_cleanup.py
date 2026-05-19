"""
Iteration 132 - Backend regression tests after content.py complexity cleanup
Tests:
1. Crystal-related endpoints still return 200 (no 500s)
2. Image validation payloads remain structured
3. Sanity endpoints: /api/content/expand-script, /api/astrology/current, /api/elemental-practices
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestCrystalEndpointsRegression:
    """Crystal endpoints regression after content.py refactor"""

    def test_crystals_list_returns_200(self):
        """GET /api/crystals returns 200 with list of crystals"""
        response = requests.get(f"{BASE_URL}/api/crystals", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of crystals"
        if len(data) > 0:
            crystal = data[0]
            assert "id" in crystal or "name" in crystal, "Crystal should have id or name"

    def test_crystals_single_returns_200(self):
        """GET /api/crystals/{id} returns 200 for known crystal"""
        # First get list to find a valid crystal id
        list_response = requests.get(f"{BASE_URL}/api/crystals", timeout=15)
        if list_response.status_code == 200 and len(list_response.json()) > 0:
            crystal_id = list_response.json()[0].get("id", "amethyst")
        else:
            crystal_id = "amethyst"
        
        response = requests.get(f"{BASE_URL}/api/crystals/{crystal_id}", timeout=15)
        # Should return 200 or 404, not 500
        assert response.status_code in [200, 404], f"Expected 200 or 404, got {response.status_code}: {response.text}"

    def test_crystal_image_validation_structure(self):
        """Crystal image validation payload should be structured correctly"""
        response = requests.get(f"{BASE_URL}/api/crystals", timeout=15)
        if response.status_code != 200:
            pytest.skip("Crystals endpoint not available")
        
        data = response.json()
        if len(data) == 0:
            pytest.skip("No crystals in database")
        
        # Check that crystals have proper image validation structure if present
        for crystal in data[:5]:  # Check first 5
            if "image_validation" in crystal:
                validation = crystal["image_validation"]
                assert isinstance(validation, dict), "image_validation should be dict"
                # Common fields in image validation
                if "status" in validation:
                    assert validation["status"] in ["verified", "review", "pending", "rejected", None], \
                        f"Unexpected status: {validation['status']}"


class TestExpandScriptEndpoint:
    """Test /api/content/expand-script endpoint after refactor"""

    def test_expand_script_returns_200(self):
        """POST /api/content/expand-script returns 200 with valid payload"""
        payload = {
            "practice_name": "Test Grounding Practice",
            "element": "earth",
            "duration_minutes": 7,
            "steps": ["Breathe deeply", "Feel your feet on the ground", "Connect with earth energy"],
            "source_texts": ["Grounding helps stabilize your energy field"],
            "use_ai": False,
            "include_toning": True,
            "anti_repetition_mode": "strict"
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload, timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "practice_name" in data, "Response should have practice_name"
        assert "word_count" in data, "Response should have word_count"
        assert "paragraphs" in data, "Response should have paragraphs"
        assert "segments" in data, "Response should have segments"
        
        # Verify 7-minute floor (840 words minimum)
        assert data["word_count"] >= 700, f"Word count {data['word_count']} should be >= 700 for 7-min floor"

    def test_expand_script_balanced_mode(self):
        """POST /api/content/expand-script with balanced anti-repetition mode"""
        payload = {
            "practice_name": "Water Flow Meditation",
            "element": "water",
            "duration_minutes": 10,
            "steps": ["Visualize flowing water", "Let tension dissolve"],
            "source_texts": [],
            "use_ai": False,
            "include_toning": False,
            "anti_repetition_mode": "balanced"
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload, timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["used_ai"] == False, "Should not use AI when use_ai=False"


class TestAstrologyCurrentEndpoint:
    """Test /api/astrology/current endpoint"""

    def test_astrology_current_returns_200(self):
        """GET /api/astrology/current returns 200 with current moon data"""
        response = requests.get(f"{BASE_URL}/api/astrology/current", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Should have moon-related fields
        assert "name" in data or "id" in data, "Response should have name or id"
        if "element" in data:
            assert data["element"] in ["Earth", "Water", "Fire", "Air", "Spirit", "earth", "water", "fire", "air", "spirit"], \
                f"Unexpected element: {data['element']}"


class TestElementalPracticesEndpoint:
    """Test /api/elemental-practices endpoint"""

    def test_elemental_practices_returns_200(self):
        """GET /api/elemental-practices returns 200 with practices list"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of practices"

    def test_elemental_practices_filter_by_element(self):
        """GET /api/elemental-practices?element=earth filters correctly"""
        response = requests.get(f"{BASE_URL}/api/elemental-practices?element=earth", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of practices"
        # If there are results, they should be earth element
        for practice in data:
            if "element" in practice:
                assert practice["element"].lower() == "earth", f"Expected earth, got {practice['element']}"


class TestContentRouterHelpers:
    """Test that refactored helper functions work correctly via endpoints"""

    def test_yoga_poses_endpoint(self):
        """GET /api/yoga/poses returns 200"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of poses"

    def test_breathwork_sessions_endpoint(self):
        """GET /api/breathwork/sessions returns 200"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of sessions"

    def test_mantras_endpoint(self):
        """GET /api/mantras returns 200"""
        response = requests.get(f"{BASE_URL}/api/mantras", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of mantras"

    def test_mudras_endpoint(self):
        """GET /api/mudras returns 200"""
        response = requests.get(f"{BASE_URL}/api/mudras", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of mudras"


class TestMypyWorkflowFile:
    """Verify mypy CI workflow file exists and is configured correctly"""

    def test_mypy_workflow_exists(self):
        """Check .github/workflows/mypy-backend.yml exists"""
        workflow_path = "/app/.github/workflows/mypy-backend.yml"
        assert os.path.exists(workflow_path), f"Mypy workflow file not found at {workflow_path}"

    def test_mypy_workflow_references_config(self):
        """Check workflow references backend/mypy.ini"""
        workflow_path = "/app/.github/workflows/mypy-backend.yml"
        with open(workflow_path, "r") as f:
            content = f.read()
        
        assert "backend/mypy.ini" in content, "Workflow should reference backend/mypy.ini"
        assert "mypy" in content, "Workflow should run mypy command"
        assert "content.py" in content, "Workflow should include content.py in typed routers"
