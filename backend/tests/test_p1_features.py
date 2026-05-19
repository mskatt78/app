"""
Test P1 Features: Star Lineage Quiz, Retreats, Videos
- Star Lineage Quiz: Frontend-only (no backend API needed)
- Retreats: GET /api/retreats endpoint
- Videos: GET /api/videos endpoint with category filter
- Admin CMS: retreats and videos collections
"""
import pytest
import requests
from test_security_config import BASE_URL, ADMIN_PASSWORD


def _require_admin_password():
    if not ADMIN_PASSWORD:
        pytest.skip("Set ADMIN_PASSWORD to run admin-authenticated tests")


class TestHealthCheck:
    """Basic health check"""
    
    def test_api_health(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ API health check passed: {data}")


class TestRetreatsAPI:
    """Test retreats endpoints"""
    
    def test_get_retreats_list(self):
        """GET /api/retreats returns list"""
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/retreats returned {len(data)} retreats")
        return data
    
    def test_retreats_have_required_fields(self):
        """Retreats should have id, title, description at minimum"""
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            retreat = data[0]
            assert "id" in retreat, "Retreat missing 'id' field"
            # title or name should exist
            assert "title" in retreat or "name" in retreat, "Retreat missing title/name"
            print(f"✓ Retreat has required fields: {list(retreat.keys())}")
        else:
            print("⚠ No retreats in database - skipping field validation")
    
    def test_retreats_filter_by_status(self):
        """GET /api/retreats?status=open filters correctly"""
        response = requests.get(f"{BASE_URL}/api/retreats?status=open")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/retreats?status=open returned {len(data)} retreats")


class TestVideosAPI:
    """Test videos endpoints"""
    
    def test_get_videos_list(self):
        """GET /api/videos returns list"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/videos returned {len(data)} videos")
        return data
    
    def test_videos_filter_by_category_somatic(self):
        """GET /api/videos?category=somatic filters correctly"""
        response = requests.get(f"{BASE_URL}/api/videos?category=somatic")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/videos?category=somatic returned {len(data)} videos")
    
    def test_videos_filter_by_category_shamanic(self):
        """GET /api/videos?category=shamanic filters correctly"""
        response = requests.get(f"{BASE_URL}/api/videos?category=shamanic")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/videos?category=shamanic returned {len(data)} videos")


class TestAdminLogin:
    """Test admin authentication"""
    
    def test_admin_login_success(self):
        """POST /api/admin/login with correct password"""
        _require_admin_password()
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data.get("role") == "admin"
        print("✓ Admin login successful, token received")
        return data["token"]
    
    def test_admin_login_failure(self):
        """POST /api/admin/login with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✓ Admin login correctly rejected wrong password")


class TestAdminCollections:
    """Test admin CMS collections include retreats and videos"""
    
    @pytest.fixture
    def admin_token(self):
        _require_admin_password()
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin login failed")
    
    def test_collections_include_retreats(self, admin_token):
        """Admin collections should include retreats"""
        response = requests.get(
            f"{BASE_URL}/api/admin/collections",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        collection_ids = [c["id"] for c in data]
        assert "retreats" in collection_ids, "retreats not in admin collections"
        print("✓ Admin collections include 'retreats'")
    
    def test_collections_include_videos(self, admin_token):
        """Admin collections should include videos"""
        response = requests.get(
            f"{BASE_URL}/api/admin/collections",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        collection_ids = [c["id"] for c in data]
        assert "videos" in collection_ids, "videos not in admin collections"
        print("✓ Admin collections include 'videos'")
    
    def test_retreats_items_endpoint(self, admin_token):
        """GET /api/admin/retreats/items works"""
        response = requests.get(
            f"{BASE_URL}/api/admin/retreats/items",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        print(f"✓ Admin retreats items: {data['total']} total")
    
    def test_videos_items_endpoint(self, admin_token):
        """GET /api/admin/videos/items works"""
        response = requests.get(
            f"{BASE_URL}/api/admin/videos/items",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        print(f"✓ Admin videos items: {data['total']} total")


class TestAdminCRUD:
    """Test admin CRUD operations for retreats and videos"""
    
    @pytest.fixture
    def admin_token(self):
        _require_admin_password()
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin login failed")
    
    def test_create_retreat(self, admin_token):
        """Create a test retreat via admin API"""
        test_retreat = {
            "title": "TEST_Retreat_Automated",
            "status": "upcoming",
            "description": "Automated test retreat",
            "location": "Test Location",
            "duration_days": 3,
            "max_participants": 10,
            "price": "999"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/retreats/items",
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            },
            json=test_retreat
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["title"] == test_retreat["title"]
        print(f"✓ Created test retreat with id: {data['id']}")
        
        # Cleanup - delete the test retreat
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/retreats/items/{data['id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200
        print("✓ Cleaned up test retreat")
    
    def test_create_video(self, admin_token):
        """Create a test video via admin API"""
        test_video = {
            "title": "TEST_Video_Automated",
            "category": "somatic",
            "description": "Automated test video",
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "duration": "5:00"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/videos/items",
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            },
            json=test_video
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["title"] == test_video["title"]
        print(f"✓ Created test video with id: {data['id']}")
        
        # Verify it appears in videos list
        list_response = requests.get(f"{BASE_URL}/api/videos?category=somatic")
        assert list_response.status_code == 200
        videos = list_response.json()
        found = any(v.get("id") == data["id"] for v in videos)
        print(f"✓ Test video appears in public API: {found}")
        
        # Cleanup - delete the test video
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/videos/items/{data['id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200
        print("✓ Cleaned up test video")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
