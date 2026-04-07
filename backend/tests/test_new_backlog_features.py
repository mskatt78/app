"""
Test new backlog features for Shamanic Elements Soul Temple 2.0:
- Courses portal with Admin CMS integration
- Community features (Sacred Circle) with journey/insight/gratitude sharing
- Sacred Geometry collection manageable via CMS
- Expanded Admin CMS (25 collections total)
- Sound Frequencies audio_url support
"""
import pytest
import requests
import os
import uuid
from test_security_config import BASE_URL, ADMIN_PASSWORD


class TestPublicEndpoints:
    """Test public endpoints for new features - should return empty lists initially"""
    
    def test_courses_endpoint_returns_list(self):
        """GET /api/courses should return empty list (CMS-managed)"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/courses returns {len(data)} items")
    
    def test_community_posts_endpoint_returns_list(self):
        """GET /api/community/posts should return empty list (CMS-managed)"""
        response = requests.get(f"{BASE_URL}/api/community/posts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/community/posts returns {len(data)} items")
    
    def test_sacred_geometry_endpoint_returns_list(self):
        """GET /api/sacred-geometry should return empty list (CMS-managed)"""
        response = requests.get(f"{BASE_URL}/api/sacred-geometry")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/sacred-geometry returns {len(data)} items")
    
    def test_courses_with_filters(self):
        """GET /api/courses with category and level filters"""
        response = requests.get(f"{BASE_URL}/api/courses?category=meditation&level=beginner")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/courses with filters returns {len(data)} items")
    
    def test_community_posts_with_type_filter(self):
        """GET /api/community/posts with type filter"""
        response = requests.get(f"{BASE_URL}/api/community/posts?type=journey")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/community/posts with type filter returns {len(data)} items")


class TestAdminAuthentication:
    """Test admin login and token generation"""
    
    def test_admin_login_success(self):
        """POST /api/admin/login with correct password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data.get("role") == "admin"
        print("✓ Admin login successful, token received")
        return data["token"]
    
    def test_admin_login_invalid_password(self):
        """POST /api/admin/login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": "wrongpassword"})
        assert response.status_code == 401
        print("✓ Admin login correctly rejects invalid password")


class TestAdminCollections:
    """Test admin collections endpoint - should return 25 collections"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_get_collections_returns_25(self, admin_token):
        """GET /api/admin/collections should return 25 collections"""
        response = requests.get(
            f"{BASE_URL}/api/admin/collections",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        collection_ids = [c["id"] for c in data]
        print(f"✓ GET /api/admin/collections returns {len(data)} collections")
        print(f"  Collections: {collection_ids}")
        
        # Verify new collections are present
        expected_new = ["courses", "community_posts", "sacred_geometry"]
        for coll in expected_new:
            assert coll in collection_ids, f"Missing collection: {coll}"
        print(f"✓ All new collections present: {expected_new}")
        
        # Verify total count is 25
        assert len(data) == 25, f"Expected 25 collections, got {len(data)}"
        print("✓ Total collections count: 25")


class TestAdminCoursesCRUD:
    """Test Admin CMS CRUD for courses collection"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_create_course_full_fields(self, admin_token):
        """POST /api/admin/courses/items creates a course with all fields"""
        test_id = f"TEST_course_{uuid.uuid4().hex[:6]}"
        course_data = {
            "id": test_id,
            "title": "Sacred Breathwork Mastery",
            "category": "breathwork",
            "level": "intermediate",
            "description": "A comprehensive course on pranayama and sacred breathing techniques",
            "instructor": "Maya Lightweaver",
            "duration": "8 weeks",
            "lessons": "24",
            "format": "hybrid",
            "price": "$297",
            "status": "active",
            "highlights": "Learn 12 breathing techniques\nDaily practice routines\nLive Q&A sessions",
            "image_url": "https://example.com/breathwork-course.jpg",
            "video_url": "https://youtube.com/watch?v=example123",
            "registration_link": "https://example.com/register"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/courses/items",
            json=course_data,
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        )
        assert response.status_code == 200
        created = response.json()
        assert created["id"] == test_id
        assert created["title"] == course_data["title"]
        assert created["category"] == course_data["category"]
        assert created["level"] == course_data["level"]
        assert created["instructor"] == course_data["instructor"]
        assert created["registration_link"] == course_data["registration_link"]
        print(f"✓ Course created with all fields: {test_id}")
        
        # Verify via GET
        get_response = requests.get(f"{BASE_URL}/api/courses")
        assert get_response.status_code == 200
        courses = get_response.json()
        found = next((c for c in courses if c["id"] == test_id), None)
        assert found is not None, "Created course not found in public endpoint"
        print("✓ Course visible in public /api/courses endpoint")
        
        # Cleanup
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/courses/items/{test_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200
        print(f"✓ Course deleted: {test_id}")


class TestAdminCommunityPostsCRUD:
    """Test Admin CMS CRUD for community_posts collection"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_create_community_post_journey(self, admin_token):
        """POST /api/admin/community_posts/items creates a journey post"""
        test_id = f"TEST_post_{uuid.uuid4().hex[:6]}"
        post_data = {
            "id": test_id,
            "author_name": "Spirit Walker",
            "title": "My First Shamanic Journey",
            "type": "journey",
            "content": "Today I experienced a profound connection with my power animal...",
            "element": "Spirit",
            "tags": "shamanic,journey,power-animal",
            "status": "published",
            "image_url": "https://example.com/journey.jpg"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/community_posts/items",
            json=post_data,
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        )
        assert response.status_code == 200
        created = response.json()
        assert created["id"] == test_id
        assert created["type"] == "journey"
        assert created["author_name"] == post_data["author_name"]
        print(f"✓ Community post (journey) created: {test_id}")
        
        # Verify via GET
        get_response = requests.get(f"{BASE_URL}/api/community/posts")
        assert get_response.status_code == 200
        posts = get_response.json()
        found = next((p for p in posts if p["id"] == test_id), None)
        assert found is not None, "Created post not found in public endpoint"
        print("✓ Post visible in public /api/community/posts endpoint")
        
        # Cleanup
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/community_posts/items/{test_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200
        print(f"✓ Community post deleted: {test_id}")
    
    def test_create_community_post_insight(self, admin_token):
        """POST /api/admin/community_posts/items creates an insight post"""
        test_id = f"TEST_insight_{uuid.uuid4().hex[:6]}"
        post_data = {
            "id": test_id,
            "author_name": "Wisdom Seeker",
            "title": "Understanding the Fire Element",
            "type": "insight",
            "content": "Fire teaches us about transformation and passion...",
            "element": "Fire",
            "status": "published"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/community_posts/items",
            json=post_data,
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        )
        assert response.status_code == 200
        created = response.json()
        assert created["type"] == "insight"
        print(f"✓ Community post (insight) created: {test_id}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/community_posts/items/{test_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_create_community_post_gratitude(self, admin_token):
        """POST /api/admin/community_posts/items creates a gratitude post"""
        test_id = f"TEST_gratitude_{uuid.uuid4().hex[:6]}"
        post_data = {
            "id": test_id,
            "author_name": "Grateful Heart",
            "type": "gratitude",
            "content": "I am grateful for this sacred community and the healing it brings...",
            "element": "Water",
            "status": "published"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/community_posts/items",
            json=post_data,
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        )
        assert response.status_code == 200
        created = response.json()
        assert created["type"] == "gratitude"
        print(f"✓ Community post (gratitude) created: {test_id}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/community_posts/items/{test_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )


class TestAdminSacredGeometryCRUD:
    """Test Admin CMS CRUD for sacred_geometry collection"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_create_sacred_geometry_guide(self, admin_token):
        """POST /api/admin/sacred_geometry/items creates a sacred geometry guide"""
        test_id = f"TEST_geometry_{uuid.uuid4().hex[:6]}"
        geometry_data = {
            "id": test_id,
            "name": "Flower of Life",
            "element": "Spirit",
            "description": "The Flower of Life is a sacred geometric pattern consisting of overlapping circles...",
            "symbolism": "Represents the interconnectedness of all life and the fundamental forms of space and time",
            "how_to_draw": "1. Draw a central circle\n2. Draw 6 circles around it\n3. Continue the pattern outward",
            "image_url": "https://example.com/flower-of-life.jpg"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/sacred_geometry/items",
            json=geometry_data,
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        )
        assert response.status_code == 200
        created = response.json()
        assert created["id"] == test_id
        assert created["name"] == geometry_data["name"]
        assert created["element"] == geometry_data["element"]
        print(f"✓ Sacred geometry guide created: {test_id}")
        
        # Verify via GET
        get_response = requests.get(f"{BASE_URL}/api/sacred-geometry")
        assert get_response.status_code == 200
        guides = get_response.json()
        found = next((g for g in guides if g["id"] == test_id), None)
        assert found is not None, "Created guide not found in public endpoint"
        print("✓ Guide visible in public /api/sacred-geometry endpoint")
        
        # Cleanup
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/sacred_geometry/items/{test_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200
        print(f"✓ Sacred geometry guide deleted: {test_id}")


class TestAdminBreathworkMindfulnessCRUD:
    """Test Admin CMS CRUD for breathwork_sessions and mindfulness_practices"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_create_breathwork_session(self, admin_token):
        """POST /api/admin/breathwork_sessions/items creates a breathwork session"""
        test_id = f"TEST_breath_{uuid.uuid4().hex[:6]}"
        session_data = {
            "id": test_id,
            "name": "Ocean Breath Meditation",
            "element": "Water",
            "description": "A calming breathwork practice inspired by ocean waves",
            "duration_minutes": "15",
            "frequency": "432",
            "benefits": "Reduces stress, calms the nervous system",
            "instructions": "1. Sit comfortably\n2. Breathe in like a wave rising\n3. Breathe out like a wave receding",
            "image_url": "https://example.com/ocean-breath.jpg"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/breathwork_sessions/items",
            json=session_data,
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        )
        assert response.status_code == 200
        created = response.json()
        assert created["id"] == test_id
        assert created["name"] == session_data["name"]
        print(f"✓ Breathwork session created: {test_id}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/breathwork_sessions/items/{test_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_create_mindfulness_practice(self, admin_token):
        """POST /api/admin/mindfulness_practices/items creates a mindfulness practice"""
        test_id = f"TEST_mindful_{uuid.uuid4().hex[:6]}"
        practice_data = {
            "id": test_id,
            "name": "Body Scan Awareness",
            "category": "awareness",
            "element": "Earth",
            "description": "A grounding practice to connect with your physical body",
            "duration_minutes": "20",
            "benefits": "Increases body awareness, reduces tension",
            "instructions": "1. Lie down comfortably\n2. Start at your feet\n3. Slowly scan upward",
            "image_url": "https://example.com/body-scan.jpg"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/mindfulness_practices/items",
            json=practice_data,
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        )
        assert response.status_code == 200
        created = response.json()
        assert created["id"] == test_id
        assert created["name"] == practice_data["name"]
        print(f"✓ Mindfulness practice created: {test_id}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/mindfulness_practices/items/{test_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )


class TestSoundFrequenciesAudioUrl:
    """Test sound frequencies with audio_url field support"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["token"]
    
    def test_create_sound_frequency_with_audio_url(self, admin_token):
        """POST /api/admin/sound_frequencies/items with audio_url field"""
        test_id = f"TEST_freq_{uuid.uuid4().hex[:6]}"
        freq_data = {
            "id": test_id,
            "name": "Custom Crystal Bowl Recording",
            "frequency": "528",
            "element": "Spirit",
            "category": "instrument",
            "ambient_type": "crystal_bowls",
            "description": "A custom recording of crystal singing bowls at 528 Hz",
            "benefits": "DNA repair, transformation, miracles",
            "practice": "Listen with headphones for best effect",
            "audio_url": "https://example.com/crystal-bowl-528.mp3",
            "image_url": "https://example.com/crystal-bowl.jpg"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/sound_frequencies/items",
            json=freq_data,
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        )
        assert response.status_code == 200
        created = response.json()
        assert created["id"] == test_id
        assert created["audio_url"] == freq_data["audio_url"]
        print(f"✓ Sound frequency with audio_url created: {test_id}")
        
        # Verify via GET
        get_response = requests.get(f"{BASE_URL}/api/sound-frequencies/{test_id}")
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["audio_url"] == freq_data["audio_url"]
        print("✓ audio_url field persisted and retrievable")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/sound_frequencies/items/{test_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )


class TestExistingEndpointsStillWork:
    """Verify existing endpoints still work after new features added"""
    
    def test_retreats_endpoint(self):
        """GET /api/retreats should still work"""
        response = requests.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/retreats returns {len(data)} items")
    
    def test_meditations_endpoint(self):
        """GET /api/meditations should still work"""
        response = requests.get(f"{BASE_URL}/api/meditations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/meditations returns {len(data)} items")
    
    def test_sound_frequencies_endpoint(self):
        """GET /api/sound-frequencies should still work"""
        response = requests.get(f"{BASE_URL}/api/sound-frequencies")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/sound-frequencies returns {len(data)} items")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
