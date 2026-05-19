"""
Iteration 9 Tests - Mantras with audio/pronunciation fields and expanded Shamanic Practices
Tests:
- Mantras API: pronunciation, frequency_hz, vibrational_note, music_recommendation, practice_tips fields
- Shamanic Practices API: 16 ceremonies including 8 new ones
- Grounding Practices Timer integration
"""
import pytest
import requests
from test_security_config import BASE_URL, TEST_EMAIL, TEST_PASSWORD, TEST_NAME


class TestMantrasEnhancedFields:
    """Test Mantras API returns all enhanced audio/pronunciation fields"""
    
    def test_mantras_endpoint_returns_data(self):
        """Test mantras endpoint returns list of mantras"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 12, f"Expected at least 12 mantras, got {len(data)}"
        print(f"✓ Mantras endpoint returns {len(data)} mantras")
    
    def test_mantra_has_pronunciation_field(self):
        """Test mantras have pronunciation field"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        
        # Check first mantra (Om)
        om_mantra = next((m for m in data if m['name'] == 'Om'), None)
        assert om_mantra is not None, "Om mantra not found"
        assert 'pronunciation' in om_mantra, "pronunciation field missing"
        assert om_mantra['pronunciation'] == "ohm (with resonance in chest)"
        print(f"✓ Om mantra has pronunciation: {om_mantra['pronunciation']}")
    
    def test_mantra_has_frequency_hz_field(self):
        """Test mantras have frequency_hz field"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        
        om_mantra = next((m for m in data if m['name'] == 'Om'), None)
        assert om_mantra is not None
        assert 'frequency_hz' in om_mantra, "frequency_hz field missing"
        assert om_mantra['frequency_hz'] == 432
        print(f"✓ Om mantra has frequency_hz: {om_mantra['frequency_hz']} Hz")
    
    def test_mantra_has_vibrational_note_field(self):
        """Test mantras have vibrational_note field"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        
        om_mantra = next((m for m in data if m['name'] == 'Om'), None)
        assert om_mantra is not None
        assert 'vibrational_note' in om_mantra, "vibrational_note field missing"
        assert om_mantra['vibrational_note'] == "A"
        print(f"✓ Om mantra has vibrational_note: {om_mantra['vibrational_note']}")
    
    def test_mantra_has_music_recommendation_field(self):
        """Test mantras have music_recommendation field"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        
        om_mantra = next((m for m in data if m['name'] == 'Om'), None)
        assert om_mantra is not None
        assert 'music_recommendation' in om_mantra, "music_recommendation field missing"
        assert "Tibetan singing bowls" in om_mantra['music_recommendation']
        print(f"✓ Om mantra has music_recommendation: {om_mantra['music_recommendation']}")
    
    def test_mantra_has_practice_tips_field(self):
        """Test mantras have practice_tips field"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        
        om_mantra = next((m for m in data if m['name'] == 'Om'), None)
        assert om_mantra is not None
        assert 'practice_tips' in om_mantra, "practice_tips field missing"
        assert len(om_mantra['practice_tips']) > 0
        print(f"✓ Om mantra has practice_tips: {om_mantra['practice_tips'][:50]}...")
    
    def test_all_mantras_have_enhanced_fields(self):
        """Test all mantras have the new enhanced fields"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ['pronunciation', 'frequency_hz', 'vibrational_note', 'music_recommendation', 'practice_tips']
        
        for mantra in data:
            for field in required_fields:
                assert field in mantra, f"Mantra '{mantra['name']}' missing field: {field}"
        
        print(f"✓ All {len(data)} mantras have enhanced fields: {required_fields}")
    
    def test_mantras_have_varying_frequencies(self):
        """Test mantras have different frequency values"""
        response = requests.get(f"{BASE_URL}/api/mantras")
        assert response.status_code == 200
        data = response.json()
        
        frequencies = [m['frequency_hz'] for m in data]
        unique_frequencies = set(frequencies)
        assert len(unique_frequencies) > 3, f"Expected variety in frequencies, got only {len(unique_frequencies)} unique values"
        print(f"✓ Mantras have {len(unique_frequencies)} different frequency values: {sorted(unique_frequencies)}")


class TestShamanicPracticesExpanded:
    """Test Shamanic Practices API returns 16 ceremonies (8 original + 8 new)"""
    
    def test_shamanic_practices_count(self):
        """Test shamanic practices endpoint returns 16 practices"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 16, f"Expected 16 shamanic practices, got {len(data)}"
        print(f"✓ Shamanic Practices endpoint returns {len(data)} practices")
    
    def test_original_practices_exist(self):
        """Test original 8 shamanic practices still exist"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        
        original_practices = [
            "Power Animal Journey",
            "Soul Retrieval Visualization",
            "Ancestral Healing Ritual",
            "Shadow Integration Ceremony",
            "Drum Journey to Upper World",
            "Death and Rebirth Ritual",
            "Shamanic Extraction",
            "Nature Communion Walk"
        ]
        
        practice_names = [p['name'] for p in data]
        for original in original_practices:
            assert original in practice_names, f"Original practice '{original}' missing"
        print("✓ All 8 original shamanic practices present")
    
    def test_new_medicine_wheel_ceremony(self):
        """Test Medicine Wheel Ceremony is present with correct data"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        
        medicine_wheel = next((p for p in data if p['name'] == 'Medicine Wheel Ceremony'), None)
        assert medicine_wheel is not None, "Medicine Wheel Ceremony not found"
        assert medicine_wheel['id'] == '9'
        assert medicine_wheel['category'] == 'ceremony'
        assert medicine_wheel['element'] == 'Spirit'
        assert 'directional_prayers' in medicine_wheel
        print(f"✓ Medicine Wheel Ceremony present (ID: {medicine_wheel['id']}, category: {medicine_wheel['category']})")
    
    def test_new_sweat_lodge_visualization(self):
        """Test Sweat Lodge Visualization is present"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        
        sweat_lodge = next((p for p in data if p['name'] == 'Sweat Lodge Visualization'), None)
        assert sweat_lodge is not None, "Sweat Lodge Visualization not found"
        assert sweat_lodge['id'] == '10'
        assert sweat_lodge['element'] == 'Fire'
        assert 'rounds_meaning' in sweat_lodge
        print(f"✓ Sweat Lodge Visualization present (ID: {sweat_lodge['id']})")
    
    def test_new_fire_ceremony(self):
        """Test Fire Ceremony is present"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        
        fire_ceremony = next((p for p in data if p['name'] == 'Fire Ceremony'), None)
        assert fire_ceremony is not None, "Fire Ceremony not found"
        assert fire_ceremony['id'] == '11'
        assert fire_ceremony['element'] == 'Fire'
        assert 'fire_prayers' in fire_ceremony
        print(f"✓ Fire Ceremony present (ID: {fire_ceremony['id']})")
    
    def test_new_despacho_ceremony(self):
        """Test Despacho Offering Ceremony is present"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        
        despacho = next((p for p in data if p['name'] == 'Despacho Offering Ceremony'), None)
        assert despacho is not None, "Despacho Offering Ceremony not found"
        assert despacho['id'] == '12'
        assert despacho['element'] == 'Earth'
        assert 'despacho_elements' in despacho
        print(f"✓ Despacho Offering Ceremony present (ID: {despacho['id']})")
    
    def test_new_cord_cutting_ceremony(self):
        """Test Cord Cutting Ceremony is present"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        
        cord_cutting = next((p for p in data if p['name'] == 'Cord Cutting Ceremony'), None)
        assert cord_cutting is not None, "Cord Cutting Ceremony not found"
        assert cord_cutting['id'] == '13'
        assert cord_cutting['category'] == 'healing'
        assert cord_cutting['element'] == 'Air'
        assert 'after_care' in cord_cutting
        print(f"✓ Cord Cutting Ceremony present (ID: {cord_cutting['id']}, category: {cord_cutting['category']})")
    
    def test_new_plant_spirit_ceremony(self):
        """Test Plant Spirit Medicine Ceremony is present"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        
        plant_spirit = next((p for p in data if p['name'] == 'Plant Spirit Medicine Ceremony'), None)
        assert plant_spirit is not None, "Plant Spirit Medicine Ceremony not found"
        assert plant_spirit['id'] == '14'
        assert plant_spirit['element'] == 'Earth'
        assert 'common_plant_medicines' in plant_spirit
        print(f"✓ Plant Spirit Medicine Ceremony present (ID: {plant_spirit['id']})")
    
    def test_new_vision_quest_preparation(self):
        """Test Vision Quest Preparation is present"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        
        vision_quest = next((p for p in data if p['name'] == 'Vision Quest Preparation'), None)
        assert vision_quest is not None, "Vision Quest Preparation not found"
        assert vision_quest['id'] == '15'
        assert vision_quest['category'] == 'journey'
        assert vision_quest['element'] == 'Spirit'
        assert 'vision_quest_principles' in vision_quest
        print(f"✓ Vision Quest Preparation present (ID: {vision_quest['id']}, category: {vision_quest['category']})")
    
    def test_new_womb_healing_ceremony(self):
        """Test Womb/Hara Healing Ceremony is present"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        
        womb_healing = next((p for p in data if 'Womb' in p['name']), None)
        assert womb_healing is not None, "Womb/Hara Healing Ceremony not found"
        assert womb_healing['id'] == '16'
        assert womb_healing['category'] == 'healing'
        assert womb_healing['element'] == 'Water'
        assert 'healing_affirmations' in womb_healing
        print(f"✓ Womb/Hara Healing Ceremony present (ID: {womb_healing['id']}, category: {womb_healing['category']})")
    
    def test_all_new_ceremonies_have_required_fields(self):
        """Test all 8 new ceremonies have required fields"""
        response = requests.get(f"{BASE_URL}/api/shamanic-practices")
        assert response.status_code == 200
        data = response.json()
        
        new_practice_ids = ['9', '10', '11', '12', '13', '14', '15', '16']
        # Common required fields (steps may be 'ceremony_steps' or 'journey_steps')
        required_fields = ['id', 'name', 'category', 'element', 'description', 'duration_minutes', 'preparation']
        
        for practice in data:
            if practice['id'] in new_practice_ids:
                for field in required_fields:
                    assert field in practice, f"Practice '{practice['name']}' missing field: {field}"
                # Check for either ceremony_steps or journey_steps
                has_steps = 'ceremony_steps' in practice or 'journey_steps' in practice
                assert has_steps, f"Practice '{practice['name']}' missing steps field"
        
        print("✓ All 8 new ceremonies have required fields")


class TestGroundingPracticesTimer:
    """Test Grounding Practices API for timer integration"""
    
    def test_grounding_endpoint_works(self):
        """Test grounding endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/grounding")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Grounding endpoint returns {len(data)} exercises")
    
    def test_grounding_has_duration(self):
        """Test grounding exercises have duration field"""
        response = requests.get(f"{BASE_URL}/api/grounding")
        assert response.status_code == 200
        data = response.json()
        
        for exercise in data:
            assert 'duration_minutes' in exercise, f"Exercise '{exercise.get('name', 'unknown')}' missing duration_minutes"
        print("✓ All grounding exercises have duration_minutes field")
    
    def test_grounding_has_instructions(self):
        """Test grounding exercises have instructions for timer"""
        response = requests.get(f"{BASE_URL}/api/grounding")
        assert response.status_code == 200
        data = response.json()
        
        for exercise in data:
            assert 'instructions' in exercise, f"Exercise '{exercise.get('name', 'unknown')}' missing instructions"
            assert isinstance(exercise['instructions'], list)
        print("✓ All grounding exercises have instructions array")


class TestAuthenticationFlow:
    """Test authentication endpoints work correctly (session-based auth)"""
    
    def test_login_with_valid_credentials(self):
        """Test login with test credentials"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 401:
            register_response = session.post(f"{BASE_URL}/api/auth/register", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "name": TEST_NAME
            })
            assert register_response.status_code in [200, 201, 400]
            response = session.post(f"{BASE_URL}/api/auth/login", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            })
        assert response.status_code == 200
        data = response.json()
        assert data['message'] == 'Login successful'
        assert 'user_id' in data
        assert data['email'] == TEST_EMAIL
        print(f"✓ Login successful for {data['email']}")
    
    def test_get_user_with_session(self):
        """Test authenticated request using session cookies"""
        session = requests.Session()
        # First login to get session cookie
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_response.status_code == 401:
            register_response = session.post(f"{BASE_URL}/api/auth/register", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "name": TEST_NAME
            })
            assert register_response.status_code in [200, 201, 400]
            login_response = session.post(f"{BASE_URL}/api/auth/login", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            })
        assert login_response.status_code == 200
        
        # Then get user (using same session with cookies)
        response = session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        user = response.json()
        assert user['email'] == 'test@example.com'
        print(f"✓ Authenticated user info retrieved: {user['email']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
