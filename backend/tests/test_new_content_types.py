"""
Tests for New Content Types: Retreats, Books, Oracle Cards, Live Sessions
Tests both public GET endpoints and admin CRUD endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "password123"


class TestAuthentication:
    """Login and get session for authenticated tests"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Get authenticated session"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        # Login
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 200:
            return session
        else:
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    def test_login_success(self):
        """Test login works"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "user_id" in data
        assert data["email"] == TEST_EMAIL


@pytest.fixture(scope="module")
def auth_session():
    """Module-level authenticated session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    
    response = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    
    if response.status_code == 200:
        return session
    pytest.skip("Authentication failed")


# ==================== RETREATS TESTS ====================

class TestRetreatsPublicAPI:
    """Test public Retreats GET endpoints"""
    
    def test_get_retreats_list(self, auth_session):
        """Test GET /api/retreats returns list"""
        response = auth_session.get(f"{BASE_URL}/api/retreats")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/retreats - Found {len(data)} retreats")
    
    def test_get_retreats_with_status_filter(self, auth_session):
        """Test GET /api/retreats?status=upcoming"""
        response = auth_session.get(f"{BASE_URL}/api/retreats", params={"status": "upcoming"})
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        # All returned items should have the filtered status
        for item in data:
            assert item.get("status") == "upcoming", "Filter didn't work properly"
        print(f"✓ GET /api/retreats?status=upcoming - Found {len(data)} upcoming retreats")


class TestRetreatsAdminCRUD:
    """Test Admin CRUD operations for Retreats"""
    
    def test_create_retreat(self, auth_session):
        """Test POST /api/admin/retreats - Create new retreat"""
        unique_id = str(uuid.uuid4())[:8]
        payload = {
            "title": f"TEST_Retreat_{unique_id}",
            "description": "A transformative shamanic retreat experience",
            "location": "Sedona, Arizona",
            "start_date": "2026-06-01",
            "end_date": "2026-06-05",
            "duration_days": 5,
            "price": 1200.0,
            "deposit": 300.0,
            "max_participants": 15,
            "image_url": "",
            "highlights": ["Shamanic journeying", "Nature immersion", "Sound healing"],
            "includes": ["Accommodation", "All meals", "Ceremony materials"],
            "schedule": [],
            "accommodation": "Eco-lodges with private bathrooms",
            "facilitator": "Spirit Guide",
            "registration_link": "https://example.com/register",
            "status": "upcoming"
        }
        
        response = auth_session.post(f"{BASE_URL}/api/admin/retreats", json=payload)
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain id"
        assert "message" in data, "Response should contain success message"
        
        # Store for cleanup and verification
        TestRetreatsAdminCRUD.created_retreat_id = data["id"]
        TestRetreatsAdminCRUD.created_retreat_title = payload["title"]
        print(f"✓ POST /api/admin/retreats - Created retreat: {data['id']}")
        return data["id"]
    
    def test_get_created_retreat(self, auth_session):
        """Test GET /api/retreats/{id} - Verify created retreat exists"""
        retreat_id = getattr(TestRetreatsAdminCRUD, 'created_retreat_id', None)
        if not retreat_id:
            pytest.skip("No retreat was created")
        
        response = auth_session.get(f"{BASE_URL}/api/retreats/{retreat_id}")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert data["id"] == retreat_id
        assert "title" in data
        # Verify the data was stored correctly
        expected_title = getattr(TestRetreatsAdminCRUD, 'created_retreat_title', None)
        if expected_title:
            assert data["title"] == expected_title, f"Title mismatch: {data['title']} != {expected_title}"
        print(f"✓ GET /api/retreats/{retreat_id} - Retreat data persisted correctly")
    
    def test_update_retreat(self, auth_session):
        """Test PUT /api/admin/retreats/{id} - Update retreat"""
        retreat_id = getattr(TestRetreatsAdminCRUD, 'created_retreat_id', None)
        if not retreat_id:
            pytest.skip("No retreat was created")
        
        update_payload = {
            "title": "TEST_Retreat_Updated",
            "description": "Updated description",
            "location": "Big Sur, California",
            "start_date": "2026-07-01",
            "end_date": "2026-07-07",
            "duration_days": 7,
            "price": 1500.0,
            "deposit": 400.0,
            "max_participants": 12,
            "status": "open"
        }
        
        response = auth_session.put(f"{BASE_URL}/api/admin/retreats/{retreat_id}", json=update_payload)
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        # Verify update persisted
        get_response = auth_session.get(f"{BASE_URL}/api/retreats/{retreat_id}")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["location"] == "Big Sur, California"
        assert data["status"] == "open"
        print(f"✓ PUT /api/admin/retreats/{retreat_id} - Retreat updated successfully")
    
    def test_delete_retreat(self, auth_session):
        """Test DELETE /api/admin/retreats/{id} - Delete retreat"""
        retreat_id = getattr(TestRetreatsAdminCRUD, 'created_retreat_id', None)
        if not retreat_id:
            pytest.skip("No retreat was created")
        
        response = auth_session.delete(f"{BASE_URL}/api/admin/retreats/{retreat_id}")
        assert response.status_code == 200, f"Delete failed: {response.text}"
        
        # Verify deletion
        get_response = auth_session.get(f"{BASE_URL}/api/retreats/{retreat_id}")
        assert get_response.status_code == 404, "Retreat should not exist after deletion"
        print(f"✓ DELETE /api/admin/retreats/{retreat_id} - Retreat deleted successfully")


# ==================== BOOKS TESTS ====================

class TestBooksPublicAPI:
    """Test public Books GET endpoints"""
    
    def test_get_books_list(self, auth_session):
        """Test GET /api/books returns list"""
        response = auth_session.get(f"{BASE_URL}/api/books")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/books - Found {len(data)} books")


class TestBooksAdminCRUD:
    """Test Admin CRUD operations for Books"""
    
    def test_create_book(self, auth_session):
        """Test POST /api/admin/books - Create new book"""
        unique_id = str(uuid.uuid4())[:8]
        payload = {
            "title": f"TEST_Book_{unique_id}",
            "subtitle": "A Guide to Shamanic Practices",
            "description": "This book explores the ancient wisdom of shamanic traditions.",
            "author": "Test Author",
            "chapters": [
                {"number": 1, "title": "Introduction to Shamanism", "preview": "The journey begins..."},
                {"number": 2, "title": "The Medicine Wheel", "preview": "Understanding cycles..."}
            ],
            "cover_image": "",
            "price": 24.99,
            "purchase_link": "https://amazon.com/test-book",
            "sample_pdf": "https://example.com/sample.pdf",
            "publication_date": "2025-12-01",
            "isbn": "978-0-123456-78-9",
            "pages": 256,
            "testimonials": [
                {"name": "Reviewer One", "quote": "An inspiring read!"}
            ]
        }
        
        response = auth_session.post(f"{BASE_URL}/api/admin/books", json=payload)
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain id"
        assert "message" in data, "Response should contain success message"
        
        TestBooksAdminCRUD.created_book_id = data["id"]
        TestBooksAdminCRUD.created_book_title = payload["title"]
        print(f"✓ POST /api/admin/books - Created book: {data['id']}")
    
    def test_get_created_book(self, auth_session):
        """Test GET /api/books/{id} - Verify created book exists"""
        book_id = getattr(TestBooksAdminCRUD, 'created_book_id', None)
        if not book_id:
            pytest.skip("No book was created")
        
        response = auth_session.get(f"{BASE_URL}/api/books/{book_id}")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert data["id"] == book_id
        assert len(data.get("chapters", [])) == 2
        expected_title = getattr(TestBooksAdminCRUD, 'created_book_title', None)
        if expected_title:
            assert data["title"] == expected_title
        print(f"✓ GET /api/books/{book_id} - Book data persisted correctly")
    
    def test_update_book(self, auth_session):
        """Test PUT /api/admin/books/{id} - Update book"""
        book_id = getattr(TestBooksAdminCRUD, 'created_book_id', None)
        if not book_id:
            pytest.skip("No book was created")
        
        # Note: PUT requires all fields per BookCreate model
        update_payload = {
            "title": "TEST_Book_Updated",
            "subtitle": "Updated Subtitle",
            "description": "Updated description with more details",
            "author": "Updated Author",
            "chapters": [],
            "cover_image": "",
            "price": 29.99,
            "purchase_link": "",
            "sample_pdf": "",
            "publication_date": "2025-12-01",
            "isbn": "",
            "pages": 320,
            "testimonials": []
        }
        
        response = auth_session.put(f"{BASE_URL}/api/admin/books/{book_id}", json=update_payload)
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        get_response = auth_session.get(f"{BASE_URL}/api/books/{book_id}")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["price"] == 29.99
        assert data["pages"] == 320
        print(f"✓ PUT /api/admin/books/{book_id} - Book updated successfully")
    
    def test_delete_book(self, auth_session):
        """Test DELETE /api/admin/books/{id} - Delete book"""
        book_id = getattr(TestBooksAdminCRUD, 'created_book_id', None)
        if not book_id:
            pytest.skip("No book was created")
        
        response = auth_session.delete(f"{BASE_URL}/api/admin/books/{book_id}")
        assert response.status_code == 200, f"Delete failed: {response.text}"
        
        get_response = auth_session.get(f"{BASE_URL}/api/books/{book_id}")
        assert get_response.status_code == 404
        print(f"✓ DELETE /api/admin/books/{book_id} - Book deleted successfully")


# ==================== CUSTOM ORACLE CARDS TESTS ====================

class TestOracleCardsPublicAPI:
    """Test public Custom Oracle Cards GET endpoints"""
    
    def test_get_oracle_cards_list(self, auth_session):
        """Test GET /api/custom-oracle-cards returns list"""
        response = auth_session.get(f"{BASE_URL}/api/custom-oracle-cards")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/custom-oracle-cards - Found {len(data)} cards")
    
    def test_get_oracle_cards_by_element(self, auth_session):
        """Test GET /api/custom-oracle-cards?element=Spirit"""
        response = auth_session.get(f"{BASE_URL}/api/custom-oracle-cards", params={"element": "Spirit"})
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        for card in data:
            assert card.get("element", "").lower() == "spirit", f"Card element mismatch: {card.get('element')}"
        print(f"✓ GET /api/custom-oracle-cards?element=Spirit - Found {len(data)} Spirit cards")


class TestOracleCardsAdminCRUD:
    """Test Admin CRUD operations for Custom Oracle Cards"""
    
    def test_create_oracle_card(self, auth_session):
        """Test POST /api/admin/custom-oracle-cards - Create new card"""
        unique_id = str(uuid.uuid4())[:8]
        payload = {
            "name": f"TEST_Card_{unique_id}",
            "element": "Spirit",
            "meaning": "Connection to the divine, universal wisdom",
            "reversed_meaning": "Spiritual disconnection, seeking meaning",
            "keywords": ["wisdom", "divine", "connection"],
            "affirmation": "I am connected to the infinite wisdom of the universe",
            "image_url": "",
            "guidance": "Trust your inner knowing and divine guidance",
            "ritual_suggestion": "Light a white candle and meditate on your connection to source"
        }
        
        response = auth_session.post(f"{BASE_URL}/api/admin/custom-oracle-cards", json=payload)
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain id"
        assert "message" in data, "Response should contain success message"
        
        TestOracleCardsAdminCRUD.created_card_id = data["id"]
        TestOracleCardsAdminCRUD.created_card_name = payload["name"]
        print(f"✓ POST /api/admin/custom-oracle-cards - Created card: {data['id']}")
    
    def test_get_created_oracle_card(self, auth_session):
        """Test GET /api/custom-oracle-cards/{id} - Verify created card exists"""
        card_id = getattr(TestOracleCardsAdminCRUD, 'created_card_id', None)
        if not card_id:
            pytest.skip("No card was created")
        
        response = auth_session.get(f"{BASE_URL}/api/custom-oracle-cards/{card_id}")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert data["id"] == card_id
        assert "keywords" in data
        expected_name = getattr(TestOracleCardsAdminCRUD, 'created_card_name', None)
        if expected_name:
            assert data["name"] == expected_name
        print(f"✓ GET /api/custom-oracle-cards/{card_id} - Card data persisted correctly")
    
    def test_update_oracle_card(self, auth_session):
        """Test PUT /api/admin/custom-oracle-cards/{id} - Update card"""
        card_id = getattr(TestOracleCardsAdminCRUD, 'created_card_id', None)
        if not card_id:
            pytest.skip("No card was created")
        
        update_payload = {
            "name": "TEST_Card_Updated",
            "meaning": "Updated meaning - deeper wisdom",
            "element": "Fire",
            "keywords": ["transformation", "power", "rebirth"]
        }
        
        response = auth_session.put(f"{BASE_URL}/api/admin/custom-oracle-cards/{card_id}", json=update_payload)
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        get_response = auth_session.get(f"{BASE_URL}/api/custom-oracle-cards/{card_id}")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["element"] == "Fire"
        assert "transformation" in data["keywords"]
        print(f"✓ PUT /api/admin/custom-oracle-cards/{card_id} - Card updated successfully")
    
    def test_delete_oracle_card(self, auth_session):
        """Test DELETE /api/admin/custom-oracle-cards/{id} - Delete card"""
        card_id = getattr(TestOracleCardsAdminCRUD, 'created_card_id', None)
        if not card_id:
            pytest.skip("No card was created")
        
        response = auth_session.delete(f"{BASE_URL}/api/admin/custom-oracle-cards/{card_id}")
        assert response.status_code == 200, f"Delete failed: {response.text}"
        
        get_response = auth_session.get(f"{BASE_URL}/api/custom-oracle-cards/{card_id}")
        assert get_response.status_code == 404
        print(f"✓ DELETE /api/admin/custom-oracle-cards/{card_id} - Card deleted successfully")


# ==================== LIVE SESSIONS TESTS ====================

class TestLiveSessionsPublicAPI:
    """Test public Live Sessions GET endpoints"""
    
    def test_get_live_sessions_list(self, auth_session):
        """Test GET /api/live-sessions returns list"""
        response = auth_session.get(f"{BASE_URL}/api/live-sessions")
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/live-sessions - Found {len(data)} sessions")
    
    def test_get_live_sessions_by_status(self, auth_session):
        """Test GET /api/live-sessions?status=scheduled"""
        response = auth_session.get(f"{BASE_URL}/api/live-sessions", params={"status": "scheduled"})
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        for session in data:
            assert session.get("status") == "scheduled"
        print(f"✓ GET /api/live-sessions?status=scheduled - Found {len(data)} scheduled sessions")


class TestLiveSessionsAdminCRUD:
    """Test Admin CRUD operations for Live Sessions"""
    
    def test_create_live_session(self, auth_session):
        """Test POST /api/admin/live-sessions - Create new session"""
        unique_id = str(uuid.uuid4())[:8]
        payload = {
            "title": f"TEST_Session_{unique_id}",
            "description": "Full Moon Meditation Circle - Join us for sacred practice",
            "session_type": "youtube_live",
            "scheduled_date": "2026-02-15",
            "scheduled_time": "19:00",
            "duration_minutes": 90,
            "stream_url": "https://youtube.com/live/test123",
            "registration_required": False,
            "max_participants": None,
            "price": 0,
            "image_url": "",
            "topics": ["Full moon ritual", "Guided meditation", "Energy clearing"],
            "status": "scheduled"
        }
        
        response = auth_session.post(f"{BASE_URL}/api/admin/live-sessions", json=payload)
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain id"
        assert "message" in data, "Response should contain success message"
        
        TestLiveSessionsAdminCRUD.created_session_id = data["id"]
        TestLiveSessionsAdminCRUD.created_session_title = payload["title"]
        print(f"✓ POST /api/admin/live-sessions - Created session: {data['id']}")
    
    def test_get_created_live_session(self, auth_session):
        """Test GET /api/live-sessions/{id} - Verify created session exists"""
        session_id = getattr(TestLiveSessionsAdminCRUD, 'created_session_id', None)
        if not session_id:
            pytest.skip("No session was created")
        
        response = auth_session.get(f"{BASE_URL}/api/live-sessions/{session_id}")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert data["id"] == session_id
        assert "topics" in data
        expected_title = getattr(TestLiveSessionsAdminCRUD, 'created_session_title', None)
        if expected_title:
            assert data["title"] == expected_title
        print(f"✓ GET /api/live-sessions/{session_id} - Session data persisted correctly")
    
    def test_update_live_session(self, auth_session):
        """Test PUT /api/admin/live-sessions/{id} - Update session"""
        session_id = getattr(TestLiveSessionsAdminCRUD, 'created_session_id', None)
        if not session_id:
            pytest.skip("No session was created")
        
        # Note: PUT requires all fields per LiveSessionCreate model
        update_payload = {
            "title": "TEST_Session_Updated",
            "description": "Updated session description",
            "session_type": "youtube_live",
            "scheduled_date": "2026-02-20",
            "scheduled_time": "20:00",
            "duration_minutes": 120,
            "stream_url": "https://youtube.com/live/updated123",
            "registration_required": True,
            "max_participants": 100,
            "price": 0,
            "image_url": "",
            "topics": ["Updated topic"],
            "status": "live"
        }
        
        response = auth_session.put(f"{BASE_URL}/api/admin/live-sessions/{session_id}", json=update_payload)
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        get_response = auth_session.get(f"{BASE_URL}/api/live-sessions/{session_id}")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["status"] == "live"
        print(f"✓ PUT /api/admin/live-sessions/{session_id} - Session updated successfully")
    
    def test_delete_live_session(self, auth_session):
        """Test DELETE /api/admin/live-sessions/{id} - Delete session"""
        session_id = getattr(TestLiveSessionsAdminCRUD, 'created_session_id', None)
        if not session_id:
            pytest.skip("No session was created")
        
        response = auth_session.delete(f"{BASE_URL}/api/admin/live-sessions/{session_id}")
        assert response.status_code == 200, f"Delete failed: {response.text}"
        
        get_response = auth_session.get(f"{BASE_URL}/api/live-sessions/{session_id}")
        assert get_response.status_code == 404
        print(f"✓ DELETE /api/admin/live-sessions/{session_id} - Session deleted successfully")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
