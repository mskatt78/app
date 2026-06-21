"""
Iteration 179 - Dragon Chart History Feature Tests
Tests for authenticated dragon chart history persistence:
- POST /api/birth-chart/dragon-chart/save - auto-saves chart for authenticated user
- GET /api/birth-chart/dragon-chart/history - returns saved items sorted recent-first
- DELETE /api/birth-chart/dragon-chart/history/{chart_id} - soft-deletes history item
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
TEST_EMAIL = "voice.sync.qa@example.com"
TEST_PASSWORD = "Pass1234!"

# Test birth data
TEST_BIRTH_DATA = {
    "birth_date": "1990-06-15",
    "birth_time": "14:30",
    "birth_city": "London",
    "birth_country": "UK"
}

TEST_BIRTH_DATA_2 = {
    "birth_date": "1985-03-22",
    "birth_time": "09:15",
    "birth_city": "New York",
    "birth_country": "USA"
}


class TestDragonChartHistoryAuthenticated:
    """Tests for authenticated dragon chart history endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup session and authenticate"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get session
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if login_response.status_code != 200:
            pytest.skip(f"Authentication failed: {login_response.status_code} - {login_response.text}")
        
        # Store session token if returned in response
        login_data = login_response.json()
        if "session_token" in login_data:
            self.session.cookies.set("session_token", login_data["session_token"])
        
        yield
        
        # Cleanup: No explicit cleanup needed as we use soft delete
    
    def test_dragon_chart_save_returns_200(self):
        """POST /api/birth-chart/dragon-chart/save returns 200 for authenticated user"""
        response = self.session.post(
            f"{BASE_URL}/api/birth-chart/dragon-chart/save",
            json=TEST_BIRTH_DATA
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASSED: Dragon chart save returns 200")
    
    def test_dragon_chart_save_returns_required_fields(self):
        """POST /api/birth-chart/dragon-chart/save returns all required fields"""
        response = self.session.post(
            f"{BASE_URL}/api/birth-chart/dragon-chart/save",
            json=TEST_BIRTH_DATA
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check required top-level fields
        assert "chart_id" in data, "Missing chart_id"
        assert "birth_input" in data, "Missing birth_input"
        assert "natal_chart" in data, "Missing natal_chart"
        assert "dragon_head_tail_chart" in data, "Missing dragon_head_tail_chart"
        assert "chinese_dragon_chart" in data, "Missing chinese_dragon_chart"
        assert "generated_at" in data, "Missing generated_at"
        assert "saved_at" in data, "Missing saved_at"
        
        # Verify chart_id format
        assert data["chart_id"].startswith("dragon_"), f"chart_id should start with 'dragon_': {data['chart_id']}"
        
        print("PASSED: Dragon chart save returns all required fields")
    
    def test_dragon_chart_save_birth_input_preserved(self):
        """POST /api/birth-chart/dragon-chart/save preserves birth input data"""
        response = self.session.post(
            f"{BASE_URL}/api/birth-chart/dragon-chart/save",
            json=TEST_BIRTH_DATA
        )
        
        assert response.status_code == 200
        data = response.json()
        
        birth_input = data.get("birth_input", {})
        assert birth_input.get("birth_date") == TEST_BIRTH_DATA["birth_date"]
        assert birth_input.get("birth_time") == TEST_BIRTH_DATA["birth_time"]
        assert birth_input.get("birth_city") == TEST_BIRTH_DATA["birth_city"]
        assert birth_input.get("birth_country") == TEST_BIRTH_DATA["birth_country"]
        
        print("PASSED: Dragon chart save preserves birth input data")
    
    def test_dragon_chart_save_dragon_axis_present(self):
        """POST /api/birth-chart/dragon-chart/save includes dragon head/tail axis"""
        response = self.session.post(
            f"{BASE_URL}/api/birth-chart/dragon-chart/save",
            json=TEST_BIRTH_DATA
        )
        
        assert response.status_code == 200
        data = response.json()
        
        dragon_chart = data.get("dragon_head_tail_chart", {})
        assert "dragon_head" in dragon_chart, "Missing dragon_head"
        assert "dragon_tail" in dragon_chart, "Missing dragon_tail"
        assert "karmic_axis" in dragon_chart, "Missing karmic_axis"
        
        # Verify dragon head structure
        dragon_head = dragon_chart.get("dragon_head", {})
        assert "sign" in dragon_head, "Dragon head missing sign"
        assert "house" in dragon_head, "Dragon head missing house"
        assert "message" in dragon_head, "Dragon head missing message"
        
        print("PASSED: Dragon chart save includes dragon head/tail axis")
    
    def test_dragon_chart_save_chinese_profile_present(self):
        """POST /api/birth-chart/dragon-chart/save includes Chinese dragon profile"""
        response = self.session.post(
            f"{BASE_URL}/api/birth-chart/dragon-chart/save",
            json=TEST_BIRTH_DATA
        )
        
        assert response.status_code == 200
        data = response.json()
        
        chinese_chart = data.get("chinese_dragon_chart", {})
        assert "zodiac_animal" in chinese_chart, "Missing zodiac_animal"
        assert "zodiac_element" in chinese_chart, "Missing zodiac_element"
        assert "polarity" in chinese_chart, "Missing polarity"
        assert "dragon_cycle_message" in chinese_chart, "Missing dragon_cycle_message"
        
        print("PASSED: Dragon chart save includes Chinese dragon profile")
    
    def test_dragon_chart_history_returns_200(self):
        """GET /api/birth-chart/dragon-chart/history returns 200 for authenticated user"""
        response = self.session.get(f"{BASE_URL}/api/birth-chart/dragon-chart/history")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        assert isinstance(response.json(), list), "History should return a list"
        
        print("PASSED: Dragon chart history returns 200")
    
    def test_dragon_chart_history_sorted_recent_first(self):
        """GET /api/birth-chart/dragon-chart/history returns items sorted by saved_at descending"""
        # Save two charts with slight delay
        self.session.post(f"{BASE_URL}/api/birth-chart/dragon-chart/save", json=TEST_BIRTH_DATA)
        time.sleep(0.5)  # Small delay to ensure different timestamps
        self.session.post(f"{BASE_URL}/api/birth-chart/dragon-chart/save", json=TEST_BIRTH_DATA_2)
        
        # Get history
        response = self.session.get(f"{BASE_URL}/api/birth-chart/dragon-chart/history")
        assert response.status_code == 200
        
        history = response.json()
        if len(history) >= 2:
            # Most recent should be first (TEST_BIRTH_DATA_2)
            first_item = history[0]
            assert first_item.get("birth_input", {}).get("birth_city") == "New York", \
                "Most recent chart should be first"
        
        print("PASSED: Dragon chart history sorted recent-first")
    
    def test_dragon_chart_history_item_structure(self):
        """GET /api/birth-chart/dragon-chart/history items have correct structure"""
        # Ensure at least one chart exists
        self.session.post(f"{BASE_URL}/api/birth-chart/dragon-chart/save", json=TEST_BIRTH_DATA)
        
        response = self.session.get(f"{BASE_URL}/api/birth-chart/dragon-chart/history")
        assert response.status_code == 200
        
        history = response.json()
        assert len(history) > 0, "History should have at least one item"
        
        item = history[0]
        # Check required fields for history item summary
        assert "chart_id" in item, "History item missing chart_id"
        assert "birth_input" in item, "History item missing birth_input"
        assert "dragon_head_tail_chart" in item, "History item missing dragon_head_tail_chart"
        assert "chinese_dragon_chart" in item, "History item missing chinese_dragon_chart"
        
        print("PASSED: Dragon chart history items have correct structure")
    
    def test_dragon_chart_delete_returns_200(self):
        """DELETE /api/birth-chart/dragon-chart/history/{chart_id} returns 200"""
        # First save a chart
        save_response = self.session.post(
            f"{BASE_URL}/api/birth-chart/dragon-chart/save",
            json=TEST_BIRTH_DATA
        )
        assert save_response.status_code == 200
        chart_id = save_response.json().get("chart_id")
        
        # Delete the chart
        delete_response = self.session.delete(
            f"{BASE_URL}/api/birth-chart/dragon-chart/history/{chart_id}"
        )
        
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}: {delete_response.text}"
        
        print("PASSED: Dragon chart delete returns 200")
    
    def test_dragon_chart_delete_removes_from_history(self):
        """DELETE /api/birth-chart/dragon-chart/history/{chart_id} removes item from history list"""
        # Save a chart
        save_response = self.session.post(
            f"{BASE_URL}/api/birth-chart/dragon-chart/save",
            json=TEST_BIRTH_DATA
        )
        assert save_response.status_code == 200
        chart_id = save_response.json().get("chart_id")
        
        # Verify it's in history
        history_before = self.session.get(f"{BASE_URL}/api/birth-chart/dragon-chart/history").json()
        chart_ids_before = [item.get("chart_id") for item in history_before]
        assert chart_id in chart_ids_before, "Chart should be in history before delete"
        
        # Delete the chart
        delete_response = self.session.delete(
            f"{BASE_URL}/api/birth-chart/dragon-chart/history/{chart_id}"
        )
        assert delete_response.status_code == 200
        
        # Verify it's removed from history
        history_after = self.session.get(f"{BASE_URL}/api/birth-chart/dragon-chart/history").json()
        chart_ids_after = [item.get("chart_id") for item in history_after]
        assert chart_id not in chart_ids_after, "Chart should not be in history after delete"
        
        print("PASSED: Dragon chart delete removes item from history")
    
    def test_dragon_chart_delete_nonexistent_returns_404(self):
        """DELETE /api/birth-chart/dragon-chart/history/{chart_id} returns 404 for nonexistent chart"""
        response = self.session.delete(
            f"{BASE_URL}/api/birth-chart/dragon-chart/history/nonexistent_chart_id_12345"
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        print("PASSED: Dragon chart delete nonexistent returns 404")
    
    def test_dragon_chart_delete_already_deleted_returns_404(self):
        """DELETE /api/birth-chart/dragon-chart/history/{chart_id} returns 404 for already deleted chart"""
        # Save a chart
        save_response = self.session.post(
            f"{BASE_URL}/api/birth-chart/dragon-chart/save",
            json=TEST_BIRTH_DATA
        )
        assert save_response.status_code == 200
        chart_id = save_response.json().get("chart_id")
        
        # Delete once
        first_delete = self.session.delete(
            f"{BASE_URL}/api/birth-chart/dragon-chart/history/{chart_id}"
        )
        assert first_delete.status_code == 200
        
        # Try to delete again
        second_delete = self.session.delete(
            f"{BASE_URL}/api/birth-chart/dragon-chart/history/{chart_id}"
        )
        assert second_delete.status_code == 404, f"Expected 404 for already deleted, got {second_delete.status_code}"
        
        print("PASSED: Dragon chart delete already deleted returns 404")


class TestDragonChartUnauthenticated:
    """Tests for unauthenticated access to dragon chart endpoints"""
    
    def test_dragon_chart_calculate_works_without_auth(self):
        """POST /api/birth-chart/dragon-chart/calculate works without authentication"""
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/dragon-chart/calculate",
            json=TEST_BIRTH_DATA,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "natal_chart" in data
        assert "dragon_head_tail_chart" in data
        assert "chinese_dragon_chart" in data
        
        print("PASSED: Dragon chart calculate works without auth")
    
    def test_dragon_chart_save_requires_auth(self):
        """POST /api/birth-chart/dragon-chart/save requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/dragon-chart/save",
            json=TEST_BIRTH_DATA,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print("PASSED: Dragon chart save requires auth")
    
    def test_dragon_chart_history_requires_auth(self):
        """GET /api/birth-chart/dragon-chart/history requires authentication"""
        response = requests.get(
            f"{BASE_URL}/api/birth-chart/dragon-chart/history",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print("PASSED: Dragon chart history requires auth")
    
    def test_dragon_chart_delete_requires_auth(self):
        """DELETE /api/birth-chart/dragon-chart/history/{chart_id} requires authentication"""
        response = requests.delete(
            f"{BASE_URL}/api/birth-chart/dragon-chart/history/some_chart_id",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print("PASSED: Dragon chart delete requires auth")


class TestDragonChartDataIntegrity:
    """Tests for data integrity and cross-device sync capability"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup session and authenticate"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if login_response.status_code != 200:
            pytest.skip(f"Authentication failed: {login_response.status_code}")
        
        login_data = login_response.json()
        if "session_token" in login_data:
            self.session.cookies.set("session_token", login_data["session_token"])
        
        yield
    
    def test_saved_chart_can_be_retrieved_via_history(self):
        """Saved chart appears in history and can be viewed (cross-device sync)"""
        # Save a chart
        save_response = self.session.post(
            f"{BASE_URL}/api/birth-chart/dragon-chart/save",
            json=TEST_BIRTH_DATA
        )
        assert save_response.status_code == 200
        saved_chart = save_response.json()
        chart_id = saved_chart.get("chart_id")
        
        # Retrieve via history
        history_response = self.session.get(f"{BASE_URL}/api/birth-chart/dragon-chart/history")
        assert history_response.status_code == 200
        
        history = history_response.json()
        matching_charts = [c for c in history if c.get("chart_id") == chart_id]
        
        assert len(matching_charts) == 1, "Saved chart should appear in history"
        
        retrieved_chart = matching_charts[0]
        # Verify data integrity
        assert retrieved_chart.get("birth_input") == saved_chart.get("birth_input")
        assert retrieved_chart.get("dragon_head_tail_chart", {}).get("karmic_axis") == \
               saved_chart.get("dragon_head_tail_chart", {}).get("karmic_axis")
        
        print("PASSED: Saved chart can be retrieved via history (cross-device sync)")
    
    def test_history_shows_summary_data(self):
        """History items show birth data + dragon axis + chinese profile summary"""
        # Save a chart
        self.session.post(f"{BASE_URL}/api/birth-chart/dragon-chart/save", json=TEST_BIRTH_DATA)
        
        # Get history
        history_response = self.session.get(f"{BASE_URL}/api/birth-chart/dragon-chart/history")
        assert history_response.status_code == 200
        
        history = history_response.json()
        assert len(history) > 0
        
        item = history[0]
        
        # Verify summary data is present
        birth_input = item.get("birth_input", {})
        assert birth_input.get("birth_date"), "History should show birth date"
        assert birth_input.get("birth_city"), "History should show birth city"
        
        dragon_axis = item.get("dragon_head_tail_chart", {})
        assert dragon_axis.get("karmic_axis"), "History should show karmic axis"
        
        chinese = item.get("chinese_dragon_chart", {})
        assert chinese.get("zodiac_animal"), "History should show zodiac animal"
        assert chinese.get("zodiac_element"), "History should show zodiac element"
        
        print("PASSED: History shows summary data (birth + axis + chinese profile)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
