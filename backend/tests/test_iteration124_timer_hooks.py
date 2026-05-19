"""
Iteration 124 - Timer Hook Decomposition & Content Audit Tests
Tests:
1. User router endpoints (after type-hint additions)
2. PWA manifest validation
3. Backend health and content endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestUserRouterEndpoints:
    """Test user router endpoints after type-hint annotations"""
    
    def test_shared_ritual_endpoint_no_auth(self):
        """GET /api/rituals/shared/{code} - no auth required"""
        # Test with non-existent code - should return 404
        response = requests.get(f"{BASE_URL}/api/rituals/shared/nonexistent_code")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        print("✓ Shared ritual endpoint returns 404 for non-existent code")
    
    def test_favorites_requires_auth(self):
        """GET /api/favorites - requires authentication"""
        response = requests.get(f"{BASE_URL}/api/favorites")
        assert response.status_code == 401
        print("✓ Favorites endpoint requires auth (401)")
    
    def test_practice_history_requires_auth(self):
        """GET /api/practice-history - requires authentication"""
        response = requests.get(f"{BASE_URL}/api/practice-history")
        assert response.status_code == 401
        print("✓ Practice history endpoint requires auth (401)")
    
    def test_practice_stats_requires_auth(self):
        """GET /api/practice-history/stats - requires authentication"""
        response = requests.get(f"{BASE_URL}/api/practice-history/stats")
        assert response.status_code == 401
        print("✓ Practice stats endpoint requires auth (401)")
    
    def test_rituals_requires_auth(self):
        """GET /api/rituals - requires authentication"""
        response = requests.get(f"{BASE_URL}/api/rituals")
        assert response.status_code == 401
        print("✓ Rituals endpoint requires auth (401)")
    
    def test_achievements_requires_auth(self):
        """GET /api/achievements - requires authentication"""
        response = requests.get(f"{BASE_URL}/api/achievements")
        assert response.status_code == 401
        print("✓ Achievements endpoint requires auth (401)")
    
    def test_journal_requires_auth(self):
        """GET /api/journal - requires authentication"""
        response = requests.get(f"{BASE_URL}/api/journal")
        assert response.status_code == 401
        print("✓ Journal endpoint requires auth (401)")
    
    def test_custom_mantras_requires_auth(self):
        """GET /api/mantras/custom - requires authentication"""
        response = requests.get(f"{BASE_URL}/api/mantras/custom")
        assert response.status_code == 401
        print("✓ Custom mantras endpoint requires auth (401)")
    
    def test_reminder_settings_requires_auth(self):
        """GET /api/settings/reminders - requires authentication"""
        response = requests.get(f"{BASE_URL}/api/settings/reminders")
        assert response.status_code == 401
        print("✓ Reminder settings endpoint requires auth (401)")
    
    def test_dashboard_daily_requires_auth(self):
        """GET /api/dashboard/daily - requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/daily")
        assert response.status_code == 401
        print("✓ Dashboard daily endpoint requires auth (401)")
    
    def test_account_export_requires_auth(self):
        """GET /api/account/export - requires authentication"""
        response = requests.get(f"{BASE_URL}/api/account/export")
        assert response.status_code == 401
        print("✓ Account export endpoint requires auth (401)")
    
    def test_account_deletion_status_requires_auth(self):
        """GET /api/account/deletion-status - requires authentication"""
        response = requests.get(f"{BASE_URL}/api/account/deletion-status")
        assert response.status_code == 401
        print("✓ Account deletion status endpoint requires auth (401)")


class TestContentEndpoints:
    """Test content endpoints that don't require auth"""
    
    def test_health_endpoint(self):
        """GET /api/health - should return 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("✓ Health endpoint returns 200")
    
    def test_breathwork_sessions(self):
        """GET /api/breathwork-sessions - should return list"""
        response = requests.get(f"{BASE_URL}/api/breathwork-sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Breathwork sessions returns {len(data)} items")
    
    def test_yoga_poses(self):
        """GET /api/yoga-poses - should return list"""
        response = requests.get(f"{BASE_URL}/api/yoga-poses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Yoga poses returns {len(data)} items")
    
    def test_mantras(self):
        """GET /api/mantras - should return list"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Mantras returns {len(data)} items")
    
    def test_crystals(self):
        """GET /api/crystals - should return list"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Crystals returns {len(data)} items")
    
    def test_expand_script_endpoint(self):
        """POST /api/content/expand-script - narration expansion"""
        response = requests.post(
            f"{BASE_URL}/api/content/expand-script",
            json={
                "practice_name": "Test Practice",
                "element": "Spirit",
                "duration_minutes": 5,
                "use_ai": False,
                "include_toning": True,
                "anti_repetition_mode": "balanced",
                "steps": ["Step 1: Breathe", "Step 2: Relax"],
                "source_texts": ["Breathe deeply", "Relax your body"]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "segments" in data
        assert isinstance(data["segments"], list)
        print(f"✓ Expand script returns {len(data['segments'])} segments")


class TestPWAManifest:
    """Test PWA manifest validity"""
    
    def test_manifest_accessible(self):
        """GET /manifest.json - should be accessible"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "name" in data
        assert "short_name" in data
        assert "icons" in data
        assert "start_url" in data
        assert "display" in data
        assert "theme_color" in data
        assert "background_color" in data
        
        print("✓ Manifest has all required fields")
        print(f"  - Name: {data['name']}")
        print(f"  - Short name: {data['short_name']}")
        print(f"  - Icons: {len(data['icons'])} defined")
        print(f"  - Display: {data['display']}")
    
    def test_manifest_icons_valid(self):
        """Verify manifest icon references"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        data = response.json()
        
        # Check each icon is accessible
        for icon in data.get("icons", [])[:5]:  # Check first 5 icons
            icon_url = f"{BASE_URL}/{icon['src']}"
            icon_response = requests.head(icon_url)
            assert icon_response.status_code == 200, f"Icon {icon['src']} not accessible"
            print(f"✓ Icon {icon['src']} ({icon['sizes']}) accessible")
    
    def test_manifest_screenshots_valid(self):
        """Verify manifest screenshot references"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        data = response.json()
        
        for screenshot in data.get("screenshots", []):
            screenshot_url = f"{BASE_URL}/{screenshot['src']}"
            screenshot_response = requests.head(screenshot_url)
            assert screenshot_response.status_code == 200, f"Screenshot {screenshot['src']} not accessible"
            print(f"✓ Screenshot {screenshot['src']} accessible")


class TestAuthenticatedUserEndpoints:
    """Test authenticated user endpoints with QA credentials"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token using QA credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "demoqa_740fefc1@example.com",
                "password": "DemoPass123!"
            }
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("token") or data.get("access_token")
        pytest.skip("QA user login failed - skipping authenticated tests")
    
    def test_dashboard_daily_authenticated(self, auth_token):
        """GET /api/dashboard/daily - with auth"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/dashboard/daily", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "greeting" in data
        assert "daily_pose" in data or "daily_crystal" in data
        print(f"✓ Dashboard daily returns greeting: {data.get('greeting', 'N/A')}")
    
    def test_favorites_authenticated(self, auth_token):
        """GET /api/favorites - with auth"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/favorites", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Favorites returns {len(data)} items")
    
    def test_practice_history_authenticated(self, auth_token):
        """GET /api/practice-history - with auth"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/practice-history", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Practice history returns {len(data)} items")
    
    def test_practice_stats_authenticated(self, auth_token):
        """GET /api/practice-history/stats - with auth"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/practice-history/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_sessions" in data
        assert "total_minutes" in data
        print(f"✓ Practice stats: {data.get('total_sessions', 0)} sessions, {data.get('total_minutes', 0)} minutes")
    
    def test_achievements_authenticated(self, auth_token):
        """GET /api/achievements - with auth"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/achievements", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        unlocked = [a for a in data if a.get("unlocked")]
        print(f"✓ Achievements: {len(unlocked)}/{len(data)} unlocked")
    
    def test_journal_authenticated(self, auth_token):
        """GET /api/journal - with auth"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/journal", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Journal returns {len(data)} entries")
    
    def test_rituals_authenticated(self, auth_token):
        """GET /api/rituals - with auth"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/rituals", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Rituals returns {len(data)} items")
    
    def test_reminder_settings_authenticated(self, auth_token):
        """GET /api/settings/reminders - with auth"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/settings/reminders", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "enabled" in data or "user_id" in data
        print("✓ Reminder settings retrieved")
    
    def test_account_export_authenticated(self, auth_token):
        """GET /api/account/export - with auth"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/account/export", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "exported_at" in data
        assert "profile" in data
        print("✓ Account export contains profile and exported_at")
    
    def test_account_deletion_status_authenticated(self, auth_token):
        """GET /api/account/deletion-status - with auth"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/account/deletion-status", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "status" in data or "message" in data
        print(f"✓ Account deletion status: {data.get('status', 'none')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
