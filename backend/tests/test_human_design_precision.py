"""
Human Design Precision Tests - Iteration 215
Tests strict HD endpoint accuracy for sample profile: Projector/Splenic/6/2
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHumanDesignPrecision:
    """Test Human Design strict endpoint with source-of-truth sample profile"""
    
    def test_moonee_ponds_sample_profile(self):
        """Critical test: 1978-01-27 18:56 Moonee Ponds Australia = Projector/Splenic/6/2"""
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/human-design/calculate",
            json={
                "birth_date": "1978-01-27",
                "birth_time": "18:56",
                "birth_city": "Moonee Ponds",
                "birth_country": "Australia"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Core type/authority/profile assertions
        assert data.get("type_key") == "projector", f"Expected projector, got {data.get('type_key')}"
        assert data.get("authority") == "Splenic", f"Expected Splenic, got {data.get('authority')}"
        assert data.get("profile") == "6/2", f"Expected 6/2, got {data.get('profile')}"
        
        # Timezone resolution check
        audit = data.get("audit", {})
        assert audit.get("timezone_name") == "Australia/Melbourne", f"Expected Australia/Melbourne, got {audit.get('timezone_name')}"
        
        # Coordinates check (Moonee Ponds is near Melbourne)
        assert audit.get("latitude") is not None, "Latitude should be present"
        assert audit.get("longitude") is not None, "Longitude should be present"
        assert -38 < audit.get("latitude", 0) < -37, f"Latitude should be near Melbourne, got {audit.get('latitude')}"
        assert 144 < audit.get("longitude", 0) < 146, f"Longitude should be near Melbourne, got {audit.get('longitude')}"
        
        print(f"✓ Type: {data.get('type_key')}")
        print(f"✓ Authority: {data.get('authority')}")
        print(f"✓ Profile: {data.get('profile')}")
        print(f"✓ Timezone: {audit.get('timezone_name')}")
        print(f"✓ Coordinates: {audit.get('latitude')}, {audit.get('longitude')}")
    
    def test_response_includes_variables(self):
        """Test that variables (digestion, cognition, etc.) are returned"""
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/human-design/calculate",
            json={
                "birth_date": "1978-01-27",
                "birth_time": "18:56",
                "birth_city": "Moonee Ponds",
                "birth_country": "Australia"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        variables = data.get("variables", {})
        assert "digestion" in variables, "Variables should include digestion"
        assert "cognition" in variables, "Variables should include cognition"
        assert "environment" in variables, "Variables should include environment"
        assert "perspective" in variables, "Variables should include perspective"
        assert "motivation" in variables, "Variables should include motivation"
        
        print(f"✓ Digestion: {variables.get('digestion')}")
        print(f"✓ Cognition: {variables.get('cognition')}")
        print(f"✓ Environment: {variables.get('environment')}")
        print(f"✓ Perspective: {variables.get('perspective')}")
        print(f"✓ Motivation: {variables.get('motivation')}")
    
    def test_response_includes_incarnation_cross(self):
        """Test that incarnation cross is returned with gates"""
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/human-design/calculate",
            json={
                "birth_date": "1978-01-27",
                "birth_time": "18:56",
                "birth_city": "Moonee Ponds",
                "birth_country": "Australia"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        cross = data.get("incarnation_cross", {})
        assert "name" in cross, "Incarnation cross should have name"
        assert "gates" in cross, "Incarnation cross should have gates"
        
        gates = cross.get("gates", {})
        assert "personality_sun" in gates, "Cross gates should include personality_sun"
        assert "personality_earth" in gates, "Cross gates should include personality_earth"
        assert "design_sun" in gates, "Cross gates should include design_sun"
        assert "design_earth" in gates, "Cross gates should include design_earth"
        
        print(f"✓ Incarnation Cross: {cross.get('name')}")
        print(f"✓ Gates: {gates}")
    
    def test_response_includes_defined_centers_and_channels(self):
        """Test that defined centers and channels are returned"""
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/human-design/calculate",
            json={
                "birth_date": "1978-01-27",
                "birth_time": "18:56",
                "birth_city": "Moonee Ponds",
                "birth_country": "Australia"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        defined_centers = data.get("defined_centers", [])
        defined_channels = data.get("defined_channels", [])
        active_gates = data.get("active_gates", [])
        
        assert isinstance(defined_centers, list), "defined_centers should be a list"
        assert isinstance(defined_channels, list), "defined_channels should be a list"
        assert isinstance(active_gates, list), "active_gates should be a list"
        
        # For this profile, we expect Spleen and Heart to be defined
        assert "Spleen" in defined_centers, f"Expected Spleen in defined centers, got {defined_centers}"
        assert "Heart" in defined_centers, f"Expected Heart in defined centers, got {defined_centers}"
        
        print(f"✓ Defined Centers: {defined_centers}")
        print(f"✓ Defined Channels: {len(defined_channels)} channels")
        print(f"✓ Active Gates: {len(active_gates)} gates")
    
    def test_response_includes_gene_keys_profile(self):
        """Test that Gene Keys profile is derived from HD activations"""
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/human-design/calculate",
            json={
                "birth_date": "1978-01-27",
                "birth_time": "18:56",
                "birth_city": "Moonee Ponds",
                "birth_country": "Australia"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        gk_profile = data.get("gene_keys_profile", {})
        assert "lifesWork" in gk_profile, "Gene Keys should include lifesWork"
        assert "evolution" in gk_profile, "Gene Keys should include evolution"
        assert "radiance" in gk_profile, "Gene Keys should include radiance"
        assert "purpose" in gk_profile, "Gene Keys should include purpose"
        
        # Each sphere should have gate and line
        for sphere_name in ["lifesWork", "evolution", "radiance", "purpose"]:
            sphere = gk_profile.get(sphere_name, {})
            assert "gate" in sphere, f"{sphere_name} should have gate"
            assert "line" in sphere, f"{sphere_name} should have line"
        
        print(f"✓ Life's Work: Gate {gk_profile.get('lifesWork', {}).get('gate')}")
        print(f"✓ Evolution: Gate {gk_profile.get('evolution', {}).get('gate')}")
        print(f"✓ Radiance: Gate {gk_profile.get('radiance', {}).get('gate')}")
        print(f"✓ Purpose: Gate {gk_profile.get('purpose', {}).get('gate')}")
    
    def test_audit_includes_design_datetime(self):
        """Test that audit includes design local datetime"""
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/human-design/calculate",
            json={
                "birth_date": "1978-01-27",
                "birth_time": "18:56",
                "birth_city": "Moonee Ponds",
                "birth_country": "Australia"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        audit = data.get("audit", {})
        assert "design_local_datetime" in audit, "Audit should include design_local_datetime"
        assert "birth_julian_day" in audit, "Audit should include birth_julian_day"
        assert "design_julian_day" in audit, "Audit should include design_julian_day"
        
        print(f"✓ Design Local Datetime: {audit.get('design_local_datetime')}")
        print(f"✓ Birth Julian Day: {audit.get('birth_julian_day')}")
        print(f"✓ Design Julian Day: {audit.get('design_julian_day')}")


class TestBirthChartEndpoint:
    """Test standard birth chart endpoint still works"""
    
    def test_birth_chart_calculate(self):
        """Test /birth-chart/calculate endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/calculate",
            json={
                "birth_date": "1978-01-27",
                "birth_time": "18:56",
                "birth_city": "Moonee Ponds",
                "birth_country": "Australia"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "sun_sign" in data, "Response should include sun_sign"
        assert "moon_sign" in data, "Response should include moon_sign"
        assert "planets" in data, "Response should include planets"
        
        print(f"✓ Sun Sign: {data.get('sun_sign')}")
        print(f"✓ Moon Sign: {data.get('moon_sign')}")


class TestTimezoneResolution:
    """Test timezone resolution for various cities"""
    
    def test_sydney_timezone(self):
        """Test Sydney resolves to Australia/Sydney"""
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/human-design/calculate",
            json={
                "birth_date": "1990-06-15",
                "birth_time": "14:30",
                "birth_city": "Sydney",
                "birth_country": "Australia"
            }
        )
        assert response.status_code == 200
        data = response.json()
        audit = data.get("audit", {})
        assert audit.get("timezone_name") == "Australia/Sydney", f"Expected Australia/Sydney, got {audit.get('timezone_name')}"
        print(f"✓ Sydney timezone: {audit.get('timezone_name')}")
    
    def test_new_york_timezone(self):
        """Test New York resolves to America/New_York"""
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/human-design/calculate",
            json={
                "birth_date": "1990-06-15",
                "birth_time": "14:30",
                "birth_city": "New York",
                "birth_country": "USA"
            }
        )
        assert response.status_code == 200
        data = response.json()
        audit = data.get("audit", {})
        assert audit.get("timezone_name") == "America/New_York", f"Expected America/New_York, got {audit.get('timezone_name')}"
        print(f"✓ New York timezone: {audit.get('timezone_name')}")
    
    def test_london_timezone(self):
        """Test London resolves to Europe/London"""
        response = requests.post(
            f"{BASE_URL}/api/birth-chart/human-design/calculate",
            json={
                "birth_date": "1990-06-15",
                "birth_time": "14:30",
                "birth_city": "London",
                "birth_country": "UK"
            }
        )
        assert response.status_code == 200
        data = response.json()
        audit = data.get("audit", {})
        assert audit.get("timezone_name") == "Europe/London", f"Expected Europe/London, got {audit.get('timezone_name')}"
        print(f"✓ London timezone: {audit.get('timezone_name')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
