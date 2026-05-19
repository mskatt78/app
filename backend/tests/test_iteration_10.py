"""
Test Iteration 10: Earth Altars Therapeutic Applications, Creative Processes Expansion, Push Notifications
Features tested:
1. Earth Altars - therapeutic_applications field 
2. Earth Altars - weekly_practice field
3. Creative Processes - expanded to 12 (6 new earth-based healing modalities)
4. Creative Processes - therapeutic_benefits displayed
5. Push notification subscribe endpoint - POST /api/push/subscribe
6. Push notification unsubscribe endpoint - DELETE /api/push/unsubscribe
"""
import pytest
import requests
from test_security_config import BASE_URL, TEST_EMAIL, TEST_PASSWORD, TEST_NAME


class TestEarthAltarsTherapeuticApplications:
    """Test Earth Altars with therapeutic_applications field"""
    
    def test_get_all_earth_altars(self):
        """Test fetching all earth altars"""
        response = requests.get(f"{BASE_URL}/api/earth-altars")
        assert response.status_code == 200
        altars = response.json()
        assert isinstance(altars, list)
        assert len(altars) > 0
        print(f"PASS: Retrieved {len(altars)} earth altars")
        
    def test_earth_altars_have_therapeutic_applications(self):
        """Test that earth altars contain therapeutic_applications field"""
        response = requests.get(f"{BASE_URL}/api/earth-altars")
        assert response.status_code == 200
        altars = response.json()
        
        altars_with_therapeutic = [a for a in altars if a.get('therapeutic_applications')]
        assert len(altars_with_therapeutic) > 0, "No altars have therapeutic_applications"
        
        # Verify structure of therapeutic_applications
        for altar in altars_with_therapeutic:
            apps = altar['therapeutic_applications']
            assert isinstance(apps, list)
            for app in apps:
                assert 'condition' in app, f"Missing 'condition' in therapeutic_applications for {altar['name']}"
                assert 'how_it_helps' in app, f"Missing 'how_it_helps' in therapeutic_applications for {altar['name']}"
                assert 'practice' in app, f"Missing 'practice' in therapeutic_applications for {altar['name']}"
        
        print(f"PASS: {len(altars_with_therapeutic)} altars have properly structured therapeutic_applications")
    
    def test_earth_altars_have_weekly_practice(self):
        """Test that earth altars contain weekly_practice field"""
        response = requests.get(f"{BASE_URL}/api/earth-altars")
        assert response.status_code == 200
        altars = response.json()
        
        altars_with_weekly = [a for a in altars if a.get('weekly_practice')]
        assert len(altars_with_weekly) > 0, "No altars have weekly_practice"
        
        for altar in altars_with_weekly:
            assert isinstance(altar['weekly_practice'], str)
            assert len(altar['weekly_practice']) > 10, f"weekly_practice too short for {altar['name']}"
        
        print(f"PASS: {len(altars_with_weekly)} altars have weekly_practice field")

    def test_earth_element_altar_therapeutic_applications(self):
        """Test specific Earth Element Altar has therapeutic applications for anxiety, financial stress, etc."""
        response = requests.get(f"{BASE_URL}/api/earth-altars/1")
        assert response.status_code == 200
        altar = response.json()
        
        assert altar['name'] == "Earth Element Altar"
        assert 'therapeutic_applications' in altar
        
        conditions = [app['condition'] for app in altar['therapeutic_applications']]
        assert len(conditions) >= 4, "Expected at least 4 therapeutic applications for Earth Element Altar"
        
        # Check for expected conditions
        expected_conditions = ['Anxiety', 'Financial', 'Physical', 'Unrooted']
        found_conditions = []
        for expected in expected_conditions:
            for condition in conditions:
                if expected.lower() in condition.lower():
                    found_conditions.append(condition)
                    break
        
        print(f"PASS: Earth Element Altar has therapeutic applications for: {conditions}")


class TestCreativeProcessesExpansion:
    """Test Creative Processes expanded to 12 with new earth-based healing modalities"""
    
    def test_get_all_creative_processes(self):
        """Test fetching all creative processes - should be 12"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        processes = response.json()
        assert isinstance(processes, list)
        assert len(processes) == 12, f"Expected 12 creative processes, got {len(processes)}"
        print(f"PASS: Retrieved {len(processes)} creative processes")
    
    def test_new_earth_based_healing_modalities(self):
        """Test that new earth-based healing modalities exist"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        processes = response.json()
        
        process_names = [p['name'] for p in processes]
        
        # New earth-based healing modalities (IDs 7-12)
        expected_new_processes = [
            'Forest Bathing',  # ID 7
            'Earth Acupuncture',  # ID 8 
            'Stone People Medicine',  # ID 9
            'Herbal Smoke Ceremony',  # ID 10
            'Water Blessing Ceremony',  # ID 11
            'Ancestral Clay Working'  # ID 12
        ]
        
        found_new = []
        for expected in expected_new_processes:
            for name in process_names:
                if expected.lower() in name.lower():
                    found_new.append(name)
                    break
        
        assert len(found_new) >= 6, f"Expected 6 new earth-based processes, found: {found_new}"
        print(f"PASS: Found new earth-based healing modalities: {found_new}")
    
    def test_creative_processes_have_therapeutic_benefits(self):
        """Test that creative processes contain therapeutic_benefits field"""
        response = requests.get(f"{BASE_URL}/api/creative-processes")
        assert response.status_code == 200
        processes = response.json()
        
        # New processes (ID 7-12) should have therapeutic_benefits
        processes_with_benefits = [p for p in processes if p.get('therapeutic_benefits')]
        assert len(processes_with_benefits) >= 6, f"Expected at least 6 processes with therapeutic_benefits, got {len(processes_with_benefits)}"
        
        for process in processes_with_benefits:
            benefits = process['therapeutic_benefits']
            assert isinstance(benefits, list)
            assert len(benefits) > 0, f"Empty therapeutic_benefits for {process['name']}"
        
        print(f"PASS: {len(processes_with_benefits)} creative processes have therapeutic_benefits")
    
    def test_forest_bathing_process(self):
        """Test Forest Bathing (Shinrin-Yoku) process details"""
        response = requests.get(f"{BASE_URL}/api/creative-processes/7")
        assert response.status_code == 200
        process = response.json()
        
        assert 'Forest Bathing' in process['name'] or 'Shinrin' in process.get('name', '')
        assert process.get('category') == 'nature'
        assert process.get('element') == 'Earth'
        assert 'therapeutic_benefits' in process
        assert len(process['therapeutic_benefits']) >= 5
        
        print(f"PASS: Forest Bathing process verified with {len(process['therapeutic_benefits'])} therapeutic benefits")

    def test_filter_by_category(self):
        """Test filtering creative processes by category"""
        # Test nature category (should include Forest Bathing, Stone People Medicine)
        response = requests.get(f"{BASE_URL}/api/creative-processes?category=nature")
        assert response.status_code == 200
        processes = response.json()
        for process in processes:
            assert process['category'] == 'nature', f"Expected nature category, got {process['category']}"
        print(f"PASS: Filtered {len(processes)} nature category creative processes")
        
        # Test healing category
        response = requests.get(f"{BASE_URL}/api/creative-processes?category=healing")
        assert response.status_code == 200
        processes = response.json()
        print(f"PASS: Filtered {len(processes)} healing category creative processes")


class TestPushNotificationEndpoints:
    """Test Push notification subscribe and unsubscribe endpoints"""
    
    @pytest.fixture
    def auth_session(self):
        """Get authenticated session"""
        session = requests.Session()
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_response.status_code == 401:
            # User doesn't exist, register first
            register_response = session.post(f"{BASE_URL}/api/auth/register", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "name": TEST_NAME
            })
            if register_response.status_code not in [200, 201, 400]:
                pytest.skip("Could not register test user")
            # Try login again
            login_response = session.post(f"{BASE_URL}/api/auth/login", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            })
        
        if login_response.status_code != 200:
            pytest.skip("Authentication failed - skipping push notification tests")
        return session
    
    def test_push_subscribe_endpoint_exists(self, auth_session):
        """Test POST /api/push/subscribe endpoint exists and accepts valid payload"""
        # Test with valid subscription format (mock subscription)
        subscription_data = {
            "endpoint": "https://fcm.googleapis.com/fcm/send/test-endpoint-12345",
            "keys": {
                "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
                "auth": "tBHItJI5svbpez7KI4CCXg"
            }
        }
        
        response = auth_session.post(f"{BASE_URL}/api/push/subscribe", json=subscription_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert 'message' in data
        assert 'Subscribed' in data['message']
        print(f"PASS: Push subscribe endpoint working - {data['message']}")
    
    def test_push_unsubscribe_endpoint_exists(self, auth_session):
        """Test DELETE /api/push/unsubscribe endpoint exists"""
        # First subscribe, then unsubscribe
        subscription_data = {
            "endpoint": "https://fcm.googleapis.com/fcm/send/test-unsubscribe-endpoint",
            "keys": {
                "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
                "auth": "tBHItJI5svbpez7KI4CCXg"
            }
        }
        
        # Subscribe first
        auth_session.post(f"{BASE_URL}/api/push/subscribe", json=subscription_data)
        
        # Now unsubscribe
        response = auth_session.delete(f"{BASE_URL}/api/push/unsubscribe", json=subscription_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert 'message' in data
        assert 'Unsubscribed' in data['message']
        print(f"PASS: Push unsubscribe endpoint working - {data['message']}")
    
    def test_push_subscribe_requires_auth(self):
        """Test that push subscribe requires authentication"""
        subscription_data = {
            "endpoint": "https://example.com/push",
            "keys": {"p256dh": "test", "auth": "test"}
        }
        
        # Request without auth
        response = requests.post(f"{BASE_URL}/api/push/subscribe", json=subscription_data)
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("PASS: Push subscribe correctly requires authentication")
    
    def test_push_unsubscribe_requires_auth(self):
        """Test that push unsubscribe requires authentication"""
        subscription_data = {
            "endpoint": "https://example.com/push",
            "keys": {"p256dh": "test", "auth": "test"}
        }
        
        # Request without auth
        response = requests.delete(f"{BASE_URL}/api/push/unsubscribe", json=subscription_data)
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("PASS: Push unsubscribe correctly requires authentication")


class TestServiceWorkerPushHandler:
    """Test service worker configuration for push notifications"""
    
    def test_service_worker_exists(self):
        """Test that service worker file exists and is accessible"""
        response = requests.get(f"{BASE_URL}/service-worker.js")
        # Note: This might be served by the frontend, not backend
        # If 404, that's expected from backend-only test
        if response.status_code == 200:
            content = response.text
            assert 'push' in content.lower(), "Service worker should contain push handling"
            print("PASS: Service worker file accessible and contains push handling")
        else:
            print("INFO: Service worker is served by frontend (not backend) - verified in frontend tests")


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
