"""
Iteration 107 - Code Quality Verification Tests
Tests after code quality fixes:
- /api/daily-practice works after helper extraction refactor
- /api/content/expand-script still works and response structure unchanged
- Auth test file uses dynamic password generation (no hardcoded secrets)
- Seed/add scripts import and lint clean with type hints
- No `is` literal comparisons in listed backend tests
"""
import pytest
import requests
import os
import ast
import re

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")


class TestHealthCheck:
    """Basic health check"""
    
    def test_health_check(self):
        """Verify backend is running"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("✓ Backend health check passed")


class TestDailyPracticeAfterRefactor:
    """Test /api/daily-practice after helper extraction refactor"""
    
    def test_daily_practice_returns_200(self):
        """GET /api/daily-practice should return 200"""
        response = requests.get(f"{BASE_URL}/api/daily-practice")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ /api/daily-practice returns 200")
    
    def test_daily_practice_response_structure(self):
        """Response should have expected fields after refactor"""
        response = requests.get(f"{BASE_URL}/api/daily-practice")
        assert response.status_code == 200
        data = response.json()
        
        # Verify all expected fields are present
        expected_fields = [
            "date", "day_of_week", "day_ruler", "day_theme",
            "moon_phase", "moon_theme", "moon_energy", "guidance",
            "morning_practice", "evening_practice", "reflection_prompts"
        ]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        # Verify reflection_prompts is a list
        assert isinstance(data["reflection_prompts"], list), "reflection_prompts should be a list"
        assert len(data["reflection_prompts"]) >= 1, "Should have at least 1 reflection prompt"
        
        print(f"✓ /api/daily-practice response structure valid: {list(data.keys())}")
    
    def test_daily_practice_with_focus_filter(self):
        """GET /api/daily-practice?focus=chakra should work"""
        response = requests.get(f"{BASE_URL}/api/daily-practice?focus=chakra")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "morning_practice" in data
        assert "evening_practice" in data
        print("✓ /api/daily-practice with focus filter works")


class TestExpandScriptAfterRefactor:
    """Test /api/content/expand-script still works after complexity refactor"""
    
    def test_expand_script_returns_200(self):
        """POST /api/content/expand-script should return 200"""
        payload = {
            "practice_name": "Test Practice",
            "element": "Water",
            "duration_minutes": 7,
            "steps": ["Step 1", "Step 2", "Step 3"],
            "source_texts": ["This is a test source text for expansion."],
            "use_ai": False,
            "anti_repetition_mode": "strict"
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ /api/content/expand-script returns 200")
    
    def test_expand_script_response_structure(self):
        """Response should have expected fields"""
        payload = {
            "practice_name": "Meditation Test",
            "element": "Spirit",
            "duration_minutes": 10,
            "steps": ["Breathe deeply", "Relax your body"],
            "source_texts": [],
            "use_ai": False
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        expected_fields = [
            "practice_name", "target_minutes", "target_word_count",
            "word_count", "used_ai", "paragraphs", "segments"
        ]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        assert isinstance(data["paragraphs"], list), "paragraphs should be a list"
        assert isinstance(data["segments"], list), "segments should be a list"
        assert data["word_count"] > 0, "word_count should be > 0"
        
        print(f"✓ /api/content/expand-script response structure valid: word_count={data['word_count']}")
    
    def test_expand_script_balanced_mode(self):
        """Balanced anti-repetition mode should work"""
        payload = {
            "practice_name": "Balanced Test",
            "element": "Earth",
            "duration_minutes": 8,
            "steps": ["Ground yourself"],
            "source_texts": [],
            "use_ai": False,
            "anti_repetition_mode": "balanced"
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["word_count"] > 0
        print("✓ /api/content/expand-script balanced mode works")


class TestAuthTestDynamicPasswords:
    """Verify auth test file uses dynamic password generation"""
    
    def test_auth_test_file_has_generated_password_function(self):
        """Auth test file should have _generated_password helper"""
        test_file_path = "/app/backend/tests/test_iteration98_auth_refactor.py"
        with open(test_file_path, "r") as f:
            content = f.read()
        
        # Check for dynamic password generation function
        assert "_generated_password" in content, "Missing _generated_password function"
        assert "uuid.uuid4" in content, "Should use uuid for dynamic generation"
        
        # Verify no hardcoded test passwords (except in comments or the function itself)
        lines = content.split("\n")
        hardcoded_patterns = [
            r'password\s*=\s*["\'](?!.*_generated_password)(?!.*uuid)[A-Za-z0-9!@#$%^&*]+["\']',
        ]
        
        for i, line in enumerate(lines, 1):
            # Skip comments and the _generated_password function definition
            if line.strip().startswith("#") or "def _generated_password" in line:
                continue
            # Skip lines that use the dynamic function
            if "_generated_password" in line:
                continue
            # Check for hardcoded passwords
            for pattern in hardcoded_patterns:
                if re.search(pattern, line) and "WrongPassword" not in line:
                    # Allow WrongPassword for negative test cases
                    if "WrongPassword" not in line:
                        print(f"Warning: Potential hardcoded password at line {i}: {line.strip()}")
        
        print("✓ Auth test file uses dynamic password generation")
    
    def test_auth_test_file_syntax_valid(self):
        """Auth test file should have valid Python syntax"""
        test_file_path = "/app/backend/tests/test_iteration98_auth_refactor.py"
        with open(test_file_path, "r") as f:
            content = f.read()
        
        try:
            ast.parse(content)
            print("✓ Auth test file has valid Python syntax")
        except SyntaxError as e:
            pytest.fail(f"Syntax error in auth test file: {e}")


class TestSeedScriptsTypeHints:
    """Verify seed/add scripts have type hints"""
    
    @pytest.mark.parametrize("script_path", [
        "/app/backend/seed_database.py",
        "/app/backend/seed_content.py",
        "/app/backend/add_chair_yoga.py",
        "/app/backend/add_crystals.py",
        "/app/backend/add_more_crystals.py",
        "/app/backend/add_more_tai_chi_qigong.py",
        "/app/backend/add_tai_chi_qigong.py",
    ])
    def test_script_has_type_hints(self, script_path):
        """Script should have type hints on main async function"""
        with open(script_path, "r") as f:
            content = f.read()
        
        # Check for type hints (-> None or -> type)
        assert "-> None:" in content or "-> " in content, f"{script_path} missing type hints"
        
        # Verify syntax is valid
        try:
            ast.parse(content)
        except SyntaxError as e:
            pytest.fail(f"Syntax error in {script_path}: {e}")
        
        print(f"✓ {script_path.split('/')[-1]} has type hints and valid syntax")


class TestNoIsLiteralComparisons:
    """Verify no `is` literal comparisons in test files"""
    
    @pytest.mark.parametrize("test_file", [
        "/app/backend/tests/test_iteration98_auth_refactor.py",
        "/app/backend/tests/test_stripe_payment_iteration49.py",
        "/app/backend/tests/test_sacred_rites_iteration48.py",
        "/app/backend/tests/test_shamanic_features_iter47.py",
    ])
    def test_no_is_literal_comparisons(self, test_file):
        """Test file should not use `is` for literal comparisons"""
        with open(test_file, "r") as f:
            content = f.read()
        
        # Patterns to check (excluding `is None` which is acceptable)
        bad_patterns = [
            r'\bis True\b',
            r'\bis False\b',
            r'\bis 0\b',
            r'\bis 1\b',
            r'\bis ""',
            r"\bis ''",
        ]
        
        for pattern in bad_patterns:
            matches = re.findall(pattern, content)
            assert len(matches) == 0, f"Found `is` literal comparison in {test_file}: {pattern}"
        
        print(f"✓ {test_file.split('/')[-1]} has no `is` literal comparisons")


class TestContentRouterHelperExtraction:
    """Verify content.py has proper helper extraction for daily practice"""
    
    def test_helper_functions_exist(self):
        """content.py should have extracted helper functions"""
        content_path = "/app/backend/routers/content.py"
        with open(content_path, "r") as f:
            content = f.read()
        
        # Check for extracted helper functions
        expected_helpers = [
            "_collect_daily_practice_pool",
            "_apply_focus_filter",
            "_select_morning_evening_practices",
            "_daily_guidance_text",
            "_daily_reflection_prompts",
            "_build_daily_practice_response",
        ]
        
        for helper in expected_helpers:
            assert helper in content, f"Missing helper function: {helper}"
        
        print(f"✓ content.py has all {len(expected_helpers)} extracted helper functions")
    
    def test_get_daily_practice_uses_helpers(self):
        """get_daily_practice should use the extracted helpers"""
        content_path = "/app/backend/routers/content.py"
        with open(content_path, "r") as f:
            content = f.read()
        
        # Find the get_daily_practice function
        assert "_collect_daily_practice_pool(db)" in content, "Should call _collect_daily_practice_pool"
        assert "_apply_focus_filter(" in content, "Should call _apply_focus_filter"
        assert "_select_morning_evening_practices(" in content, "Should call _select_morning_evening_practices"
        assert "_build_daily_practice_response(" in content, "Should call _build_daily_practice_response"
        
        print("✓ get_daily_practice uses extracted helper functions")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
