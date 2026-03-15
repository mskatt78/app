"""
Test suite for Admin CMS functionality and MongoDB migration
Tests: CRUD operations for yoga, mudras, breathwork, crystals, mantras, workshops, events, courses
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
SESSION_TOKEN = "admin_session_1773542315182"

class TestPublicEndpoints:
    """Test public endpoints that serve content from MongoDB"""
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")
    
    def test_yoga_poses_from_mongodb(self):
        """Test yoga poses are served from MongoDB"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 60, f"Expected at least 60 yoga poses, got {len(data)}"
        # Verify pose structure
        first_pose = data[0]
        assert "id" in first_pose
        assert "name" in first_pose
        assert "element" in first_pose
        print(f"✓ Yoga poses: {len(data)} poses from MongoDB")
    
    def test_mudras_from_mongodb(self):
        """Test mudras are served from MongoDB"""
        response = requests.get(f"{BASE_URL}/api/mudras")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 12, f"Expected at least 12 mudras, got {len(data)}"
        print(f"✓ Mudras: {len(data)} mudras from MongoDB")
    
    def test_breathwork_from_mongodb(self):
        """Test breathwork sessions are served from MongoDB"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 6, f"Expected at least 6 breathwork sessions, got {len(data)}"
        print(f"✓ Breathwork: {len(data)} sessions from MongoDB")
    
    def test_crystals_from_mongodb(self):
        """Test crystals are served from MongoDB"""
        response = requests.get(f"{BASE_URL}/api/crystals")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 12, f"Expected at least 12 crystals, got {len(data)}"
        print(f"✓ Crystals: {len(data)} crystals from MongoDB")
    
    def test_mantras_from_mongodb(self):
        """Test mantras are served from MongoDB"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 10, f"Expected at least 10 mantras, got {len(data)}"
        print(f"✓ Mantras: {len(data)} mantras from MongoDB")
    
    def test_workshops_public_empty(self):
        """Test workshops endpoint returns empty array (no content yet)"""
        response = requests.get(f"{BASE_URL}/api/workshops")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Workshops public endpoint: {len(data)} items")
    
    def test_events_public_empty(self):
        """Test events endpoint returns empty array (no content yet)"""
        response = requests.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Events public endpoint: {len(data)} items")
    
    def test_courses_public_empty(self):
        """Test courses endpoint returns empty array (no content yet)"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Courses public endpoint: {len(data)} items")
    
    def test_astrology_months_from_mongodb(self):
        """Test astrology months are served from MongoDB"""
        response = requests.get(f"{BASE_URL}/api/astrology/months")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 13, f"Expected at least 13 months, got {len(data)}"
        print(f"✓ Astrology months: {len(data)} months from MongoDB")


class TestAdminAuthentication:
    """Test that admin endpoints require authentication"""
    
    def test_admin_yoga_requires_auth(self):
        """Test that admin yoga endpoint requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/admin/yoga/poses",
            json={"name": "Test", "sanskrit_name": "Test", "element": "Earth", "description": "Test"}
        )
        assert response.status_code == 401
        print("✓ Admin yoga endpoint requires authentication")
    
    def test_admin_workshops_requires_auth(self):
        """Test that admin workshops endpoint requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/admin/workshops",
            json={"title": "Test", "description": "Test", "instructor": "Test", 
                  "date": "2026-04-01", "duration_minutes": 60, "location": "Test"}
        )
        assert response.status_code == 401
        print("✓ Admin workshops endpoint requires authentication")


class TestAdminCRUDOperations:
    """Test CRUD operations for Admin CMS with authentication"""
    
    @pytest.fixture
    def auth_headers(self):
        return {"Authorization": f"Bearer {SESSION_TOKEN}"}
    
    # --- Workshop CRUD ---
    def test_create_workshop(self, auth_headers):
        """Test creating a workshop"""
        workshop_data = {
            "title": "TEST_Shamanic Sound Healing",
            "description": "A deep dive into sound healing with shamanic practices",
            "instructor": "Test Shaman",
            "date": "2026-05-15",
            "duration_minutes": 120,
            "location": "Online",
            "max_participants": 30,
            "price": 50.0,
            "topics": ["Sound Healing", "Shamanic Journeys"],
            "requirements": ["Meditation experience"]
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/workshops",
            json=workshop_data,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "id" in data
        print(f"✓ Created workshop: {data.get('id')}")
        return data.get("id")
    
    def test_get_workshops_after_create(self, auth_headers):
        """Test retrieving workshops after creation"""
        # First create one
        workshop_data = {
            "title": "TEST_Verify Workshop",
            "description": "Test description",
            "instructor": "Test",
            "date": "2026-06-01",
            "duration_minutes": 60,
            "location": "Online"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/admin/workshops",
            json=workshop_data,
            headers=auth_headers
        )
        created_id = create_response.json().get("id")
        
        # Then get all
        response = requests.get(f"{BASE_URL}/api/workshops")
        assert response.status_code == 200
        data = response.json()
        assert any(w.get("id") == created_id for w in data)
        print(f"✓ Workshop verified in list: {created_id}")
    
    def test_delete_workshop(self, auth_headers):
        """Test deleting a workshop"""
        # First create one
        workshop_data = {
            "title": "TEST_Delete Workshop",
            "description": "To be deleted",
            "instructor": "Test",
            "date": "2026-07-01",
            "duration_minutes": 60,
            "location": "Online"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/admin/workshops",
            json=workshop_data,
            headers=auth_headers
        )
        workshop_id = create_response.json().get("id")
        
        # Then delete
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/workshops/{workshop_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        
        # Verify deleted
        get_response = requests.get(f"{BASE_URL}/api/workshops")
        data = get_response.json()
        assert not any(w.get("id") == workshop_id for w in data)
        print(f"✓ Workshop deleted: {workshop_id}")
    
    # --- Event CRUD ---
    def test_create_event(self, auth_headers):
        """Test creating an event"""
        event_data = {
            "title": "TEST_Full Moon Ceremony",
            "description": "Monthly full moon gathering",
            "date": "2026-04-15",
            "time": "20:00",
            "location": "Sacred Circle Space",
            "event_type": "ceremony",
            "price": 25.0,
            "capacity": 50
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/events",
            json=event_data,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "id" in data
        print(f"✓ Created event: {data.get('id')}")
    
    def test_delete_event(self, auth_headers):
        """Test deleting an event"""
        event_data = {
            "title": "TEST_Delete Event",
            "description": "To be deleted",
            "date": "2026-08-01",
            "time": "10:00",
            "location": "Test",
            "event_type": "workshop"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/admin/events",
            json=event_data,
            headers=auth_headers
        )
        event_id = create_response.json().get("id")
        
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/events/{event_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        print(f"✓ Event deleted: {event_id}")
    
    # --- Course CRUD ---
    def test_create_course(self, auth_headers):
        """Test creating a course"""
        course_data = {
            "title": "TEST_Shamanic Foundations",
            "description": "8-week journey into shamanic practices",
            "instructor": "Master Shaman",
            "duration_weeks": 8,
            "modules": [
                {"title": "Week 1: Introduction", "description": "Basics"},
                {"title": "Week 2: Elements", "description": "Elemental work"}
            ],
            "price": 299.0,
            "level": "Beginner"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/courses",
            json=course_data,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "id" in data
        print(f"✓ Created course: {data.get('id')}")
    
    def test_delete_course(self, auth_headers):
        """Test deleting a course"""
        course_data = {
            "title": "TEST_Delete Course",
            "description": "To be deleted",
            "instructor": "Test",
            "duration_weeks": 4,
            "level": "Beginner"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/admin/courses",
            json=course_data,
            headers=auth_headers
        )
        course_id = create_response.json().get("id")
        
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/courses/{course_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        print(f"✓ Course deleted: {course_id}")
    
    # --- Yoga Pose CRUD ---
    def test_create_yoga_pose(self, auth_headers):
        """Test creating a yoga pose"""
        pose_data = {
            "name": "TEST_Custom Pose",
            "sanskrit_name": "Testasana",
            "element": "Spirit",
            "description": "A custom test pose",
            "instructions": ["Step 1", "Step 2", "Step 3"],
            "benefits": ["Benefit 1", "Benefit 2"],
            "chakras": ["Heart", "Crown"],
            "duration_minutes": 5,
            "difficulty": "Intermediate",
            "contraindications": ["Back injury"]
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/yoga/poses",
            json=pose_data,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "id" in data
        print(f"✓ Created yoga pose: {data.get('id')}")
    
    def test_update_yoga_pose(self, auth_headers):
        """Test updating a yoga pose"""
        # First create
        pose_data = {
            "name": "TEST_Update Pose",
            "sanskrit_name": "Updateasana",
            "element": "Earth",
            "description": "Original description"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/admin/yoga/poses",
            json=pose_data,
            headers=auth_headers
        )
        pose_id = create_response.json().get("id")
        
        # Update
        updated_data = {
            "name": "TEST_Updated Pose",
            "sanskrit_name": "Updatedasana",
            "element": "Water",
            "description": "Updated description"
        }
        update_response = requests.put(
            f"{BASE_URL}/api/admin/yoga/poses/{pose_id}",
            json=updated_data,
            headers=auth_headers
        )
        assert update_response.status_code == 200
        print(f"✓ Updated yoga pose: {pose_id}")
    
    def test_delete_yoga_pose(self, auth_headers):
        """Test deleting a yoga pose"""
        pose_data = {
            "name": "TEST_Delete Pose",
            "sanskrit_name": "Deleteasana",
            "element": "Fire",
            "description": "To be deleted"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/admin/yoga/poses",
            json=pose_data,
            headers=auth_headers
        )
        pose_id = create_response.json().get("id")
        
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/yoga/poses/{pose_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        print(f"✓ Deleted yoga pose: {pose_id}")
    
    # --- Mudra CRUD ---
    def test_create_mudra(self, auth_headers):
        """Test creating a mudra"""
        mudra_data = {
            "name": "TEST_Custom Mudra",
            "sanskrit_name": "Testamudra",
            "element": "Air",
            "description": "A test mudra",
            "instructions": "Hold fingers in test position",
            "benefits": ["Test benefit 1", "Test benefit 2"]
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/mudras",
            json=mudra_data,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print(f"✓ Created mudra: {response.json().get('id')}")
    
    # --- Breathwork CRUD ---
    def test_create_breathwork(self, auth_headers):
        """Test creating a breathwork session"""
        breathwork_data = {
            "name": "TEST_Custom Breathwork",
            "element": "Water",
            "description": "Test breathing pattern",
            "duration_minutes": 15,
            "pattern": {"inhale": 5, "hold": 5, "exhale": 5, "hold_empty": 2},
            "benefits": ["Test benefit"],
            "frequency": "500 Hz",
            "best_time": "Evening"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/breathwork",
            json=breathwork_data,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print(f"✓ Created breathwork: {response.json().get('id')}")
    
    # --- Crystal CRUD ---
    def test_create_crystal(self, auth_headers):
        """Test creating a crystal"""
        crystal_data = {
            "name": "TEST_Custom Crystal",
            "element": "Spirit",
            "chakras": ["Third Eye", "Crown"],
            "properties": ["Test property"],
            "description": "A test crystal"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/crystals",
            json=crystal_data,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print(f"✓ Created crystal: {response.json().get('id')}")
    
    # --- Mantra CRUD ---
    def test_create_mantra(self, auth_headers):
        """Test creating a mantra"""
        mantra_data = {
            "name": "TEST_Custom Mantra",
            "sanskrit": "Test Sanskrit",
            "translation": "Test translation",
            "element": "Fire",
            "benefits": ["Test benefit"]
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/mantras",
            json=mantra_data,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        print(f"✓ Created mantra: {response.json().get('id')}")


class TestExistingFeatures:
    """Test that existing features still work after MongoDB migration"""
    
    def test_yoga_filter_by_element(self):
        """Test filtering yoga poses by element"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses?element=Earth")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        for pose in data:
            assert pose["element"].lower() == "earth"
        print(f"✓ Yoga element filter works: {len(data)} Earth poses")
    
    def test_yoga_filter_by_difficulty(self):
        """Test filtering yoga poses by difficulty"""
        response = requests.get(f"{BASE_URL}/api/yoga/poses?difficulty=Beginner")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        print(f"✓ Yoga difficulty filter works: {len(data)} Beginner poses")
    
    def test_get_single_pose(self):
        """Test getting a single yoga pose by ID"""
        # First get all poses
        all_response = requests.get(f"{BASE_URL}/api/yoga/poses")
        poses = all_response.json()
        if poses:
            pose_id = poses[0]["id"]
            response = requests.get(f"{BASE_URL}/api/yoga/poses/{pose_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == pose_id
            print(f"✓ Single pose retrieval works: {pose_id}")
    
    def test_mudras_filter_by_element(self):
        """Test filtering mudras by element"""
        response = requests.get(f"{BASE_URL}/api/mudras?element=Earth")
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Mudras element filter: {len(data)} Earth mudras")
    
    def test_breathwork_filter_by_element(self):
        """Test filtering breathwork by element"""
        response = requests.get(f"{BASE_URL}/api/breathwork/sessions?element=Fire")
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Breathwork element filter: {len(data)} Fire sessions")
    
    def test_crystals_filter_by_element(self):
        """Test filtering crystals by element"""
        response = requests.get(f"{BASE_URL}/api/crystals?element=Spirit")
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Crystals element filter: {len(data)} Spirit crystals")
    
    def test_astrology_current_month(self):
        """Test getting current lunar month"""
        response = requests.get(f"{BASE_URL}/api/astrology/current")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "element" in data
        print(f"✓ Current lunar month: {data.get('name')}")


class TestCleanup:
    """Cleanup test data created during testing"""
    
    @pytest.fixture
    def auth_headers(self):
        return {"Authorization": f"Bearer {SESSION_TOKEN}"}
    
    def test_cleanup_test_data(self, auth_headers):
        """Clean up TEST_ prefixed data"""
        # Clean workshops
        workshops = requests.get(f"{BASE_URL}/api/workshops").json()
        for w in workshops:
            if w.get("title", "").startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/admin/workshops/{w['id']}", headers=auth_headers)
        
        # Clean events
        events = requests.get(f"{BASE_URL}/api/events").json()
        for e in events:
            if e.get("title", "").startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/admin/events/{e['id']}", headers=auth_headers)
        
        # Clean courses
        courses = requests.get(f"{BASE_URL}/api/courses").json()
        for c in courses:
            if c.get("title", "").startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/admin/courses/{c['id']}", headers=auth_headers)
        
        print("✓ Test data cleanup complete")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
