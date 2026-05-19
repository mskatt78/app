"""
Iteration 66 - Guided Script Repetition Quality Tests
Tests the fixes for repetition issues identified in iteration 65:
- Source text repetition (was 11-22x, should be <=4x)
- New stems 'As this journey continues', 'Let this round nourish', 'Keep awareness near' (was 10-29x, should be 0x)
- Paragraph template variety (should use 4 structure variants)
"""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestExpandScriptRepetitionQuality:
    """Test repetition quality improvements from iteration 66 fix"""
    
    @pytest.fixture
    def api_client(self):
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        return session
    
    def count_occurrences(self, text, phrase):
        """Count occurrences of a phrase in text (case-insensitive)"""
        return text.lower().count(phrase.lower())
    
    def get_paragraph_openers(self, paragraphs, word_count=6):
        """Extract first N words of each paragraph as opener"""
        openers = []
        for p in paragraphs:
            words = p.split()[:word_count]
            opener = ' '.join(words).lower()
            openers.append(opener)
        return openers
    
    def test_iteration65_stems_removed_pendulation(self, api_client):
        """Test that iteration 65 problematic stems are removed from Pendulation practice"""
        response = api_client.post(f"{BASE_URL}/api/content/expand-script", json={
            "practice_name": "Pendulation Practice",
            "element": "water",
            "duration_minutes": 10,
            "use_ai": False,
            "steps": ["Begin by finding a comfortable position", "Notice the sensations in your body"],
            "source_texts": ["Pendulation is a somatic technique that helps regulate the nervous system"]
        })
        
        assert response.status_code == 200
        data = response.json()
        full_text = ' '.join(data['paragraphs']).lower()
        
        # Iteration 65 problematic stems should be 0x
        assert self.count_occurrences(full_text, "as this journey continues") == 0, "Stem 'as this journey continues' should be 0x"
        assert self.count_occurrences(full_text, "let this round nourish") == 0, "Stem 'let this round nourish' should be 0x"
        assert self.count_occurrences(full_text, "keep awareness near") == 0, "Stem 'keep awareness near' should be 0x"
        
        print(f"PASS: Iteration 65 stems removed - Pendulation ({data['word_count']} words)")
    
    def test_iteration65_stems_removed_shake_release(self, api_client):
        """Test that iteration 65 problematic stems are removed from Shake and Release practice"""
        response = api_client.post(f"{BASE_URL}/api/content/expand-script", json={
            "practice_name": "Shake and Release",
            "element": "fire",
            "duration_minutes": 8,
            "use_ai": False,
            "steps": ["Stand with feet hip-width apart", "Begin shaking from your feet upward"],
            "source_texts": ["Shaking is a primal way to release tension from the body"]
        })
        
        assert response.status_code == 200
        data = response.json()
        full_text = ' '.join(data['paragraphs']).lower()
        
        # Iteration 65 problematic stems should be 0x
        assert self.count_occurrences(full_text, "as this journey continues") == 0
        assert self.count_occurrences(full_text, "let this round nourish") == 0
        assert self.count_occurrences(full_text, "keep awareness near") == 0
        
        print(f"PASS: Iteration 65 stems removed - Shake and Release ({data['word_count']} words)")
    
    def test_iteration65_stems_removed_root_chakra(self, api_client):
        """Test that iteration 65 problematic stems are removed from Root Chakra practice"""
        response = api_client.post(f"{BASE_URL}/api/content/expand-script", json={
            "practice_name": "Root Chakra Grounding",
            "element": "earth",
            "duration_minutes": 12,
            "use_ai": False,
            "steps": ["Sit comfortably with spine straight", "Visualize roots growing from your base"],
            "source_texts": ["The root chakra governs our sense of safety and security", "Grounding practices help stabilize the nervous system"]
        })
        
        assert response.status_code == 200
        data = response.json()
        full_text = ' '.join(data['paragraphs']).lower()
        
        # Iteration 65 problematic stems should be 0x
        assert self.count_occurrences(full_text, "as this journey continues") == 0
        assert self.count_occurrences(full_text, "let this round nourish") == 0
        assert self.count_occurrences(full_text, "keep awareness near") == 0
        
        print(f"PASS: Iteration 65 stems removed - Root Chakra ({data['word_count']} words)")
    
    def test_iteration65_stems_removed_om_mani(self, api_client):
        """Test that iteration 65 problematic stems are removed from Om Mani Padme Hum practice"""
        response = api_client.post(f"{BASE_URL}/api/content/expand-script", json={
            "practice_name": "Om Mani Padme Hum Meditation",
            "element": "spirit",
            "duration_minutes": 15,
            "use_ai": False,
            "steps": ["Find a comfortable seated position", "Begin chanting Om Mani Padme Hum"],
            "source_texts": ["Om Mani Padme Hum is the mantra of compassion", "Each syllable carries sacred meaning"]
        })
        
        assert response.status_code == 200
        data = response.json()
        full_text = ' '.join(data['paragraphs']).lower()
        
        # Iteration 65 problematic stems should be 0x
        assert self.count_occurrences(full_text, "as this journey continues") == 0
        assert self.count_occurrences(full_text, "let this round nourish") == 0
        assert self.count_occurrences(full_text, "keep awareness near") == 0
        
        print(f"PASS: Iteration 65 stems removed - Om Mani Padme Hum ({data['word_count']} words)")
    
    def test_source_text_repetition_reduced(self, api_client):
        """Test that source text repetition is reduced to <=4x (was 11-22x in iteration 65)"""
        response = api_client.post(f"{BASE_URL}/api/content/expand-script", json={
            "practice_name": "Test Practice",
            "element": "earth",
            "duration_minutes": 10,
            "use_ai": False,
            "steps": ["Step one instruction", "Step two instruction"],
            "source_texts": [
                "This is a unique source text that should not repeat excessively",
                "Another source text for testing repetition limits"
            ]
        })
        
        assert response.status_code == 200
        data = response.json()
        full_text = ' '.join(data['paragraphs']).lower()
        
        # Source texts should appear <=4x each (was 11-22x in iteration 65)
        source1_count = self.count_occurrences(full_text, "unique source text")
        source2_count = self.count_occurrences(full_text, "another source text")
        
        assert source1_count <= 4, f"Source text 1 repeated {source1_count}x (should be <=4x)"
        assert source2_count <= 4, f"Source text 2 repeated {source2_count}x (should be <=4x)"
        
        print(f"PASS: Source text repetition reduced - source1: {source1_count}x, source2: {source2_count}x")
    
    def test_paragraph_template_variety(self, api_client):
        """Test that 4 structure variants are used in paragraph generation"""
        response = api_client.post(f"{BASE_URL}/api/content/expand-script", json={
            "practice_name": "Variety Test Practice",
            "element": "air",
            "duration_minutes": 10,
            "use_ai": False,
            "steps": ["Test step one", "Test step two"],
            "source_texts": ["Test source text for variety check"]
        })
        
        assert response.status_code == 200
        data = response.json()
        full_text = ' '.join(data['paragraphs']).lower()
        
        # Check for 4 structure variants from the fix
        variant_patterns = [
            "keep attention on",
            "track what changes",
            "stay oriented to",
            "let your awareness stay anchored"
        ]
        
        variants_found = 0
        for pattern in variant_patterns:
            count = self.count_occurrences(full_text, pattern)
            if count > 0:
                variants_found += 1
                print(f"  Variant '{pattern}': {count}x")
        
        # At least 3 of 4 variants should be used
        assert variants_found >= 3, f"Only {variants_found}/4 structure variants found"
        
        print(f"PASS: Paragraph template variety - {variants_found}/4 variants used")
    
    def test_paragraph_opener_variety(self, api_client):
        """Test that paragraph openers have good variety (>60% unique)"""
        response = api_client.post(f"{BASE_URL}/api/content/expand-script", json={
            "practice_name": "Opener Variety Test",
            "element": "water",
            "duration_minutes": 10,
            "use_ai": False,
            "steps": ["Test step"],
            "source_texts": ["Test source"]
        })
        
        assert response.status_code == 200
        data = response.json()
        paragraphs = data['paragraphs']
        
        openers = self.get_paragraph_openers(paragraphs)
        unique_openers = len(set(openers))
        total_openers = len(openers)
        variety_ratio = unique_openers / max(total_openers, 1) * 100
        
        # At least 60% of openers should be unique
        assert variety_ratio >= 60, f"Opener variety {variety_ratio:.1f}% is below 60%"
        
        print(f"PASS: Paragraph opener variety - {unique_openers}/{total_openers} unique ({variety_ratio:.1f}%)")
    
    def test_word_count_meets_minimum(self, api_client):
        """Test that word count meets the 7-minute minimum (840 words at 120 wpm)"""
        response = api_client.post(f"{BASE_URL}/api/content/expand-script", json={
            "practice_name": "Word Count Test",
            "element": "spirit",
            "duration_minutes": 7,
            "use_ai": False,
            "steps": ["Test step"],
            "source_texts": ["Test source"]
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # 7 minutes * 120 wpm = 840 words minimum
        assert data['word_count'] >= 840, f"Word count {data['word_count']} is below 840 minimum"
        assert data['target_word_count'] >= 840, f"Target word count {data['target_word_count']} is below 840"
        
        print(f"PASS: Word count meets minimum - {data['word_count']}/{data['target_word_count']} words")
    
    def test_no_duplicate_paragraphs(self, api_client):
        """Test that there are no duplicate paragraphs in the output"""
        response = api_client.post(f"{BASE_URL}/api/content/expand-script", json={
            "practice_name": "Duplicate Test",
            "element": "fire",
            "duration_minutes": 12,
            "use_ai": False,
            "steps": ["Step one", "Step two", "Step three"],
            "source_texts": ["Source text one", "Source text two"]
        })
        
        assert response.status_code == 200
        data = response.json()
        paragraphs = data['paragraphs']
        
        # Normalize paragraphs for comparison
        normalized = [re.sub(r'\s+', ' ', p.lower().strip()) for p in paragraphs]
        unique_paragraphs = len(set(normalized))
        total_paragraphs = len(normalized)
        
        # All paragraphs should be unique
        assert unique_paragraphs == total_paragraphs, f"Found {total_paragraphs - unique_paragraphs} duplicate paragraphs"
        
        print(f"PASS: No duplicate paragraphs - {total_paragraphs} unique paragraphs")
    
    def test_segments_generated_correctly(self, api_client):
        """Test that segments are generated correctly for TTS"""
        response = api_client.post(f"{BASE_URL}/api/content/expand-script", json={
            "practice_name": "Segment Test",
            "element": "earth",
            "duration_minutes": 10,
            "use_ai": False,
            "steps": ["Test step"],
            "source_texts": ["Test source"]
        })
        
        assert response.status_code == 200
        data = response.json()
        
        assert 'segments' in data, "Response should include segments"
        assert len(data['segments']) > 0, "Should have at least one segment"
        
        # Each segment should have content
        for i, segment in enumerate(data['segments']):
            assert len(segment.strip()) > 0, f"Segment {i} is empty"
        
        print(f"PASS: Segments generated - {len(data['segments'])} segments")


class TestExpandScriptEndpointBasics:
    """Basic endpoint functionality tests"""
    
    @pytest.fixture
    def api_client(self):
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        return session
    
    def test_endpoint_returns_200(self, api_client):
        """Test that endpoint returns 200 status"""
        response = api_client.post(f"{BASE_URL}/api/content/expand-script", json={
            "practice_name": "Basic Test",
            "element": "spirit",
            "duration_minutes": 7,
            "use_ai": False,
            "steps": [],
            "source_texts": []
        })
        
        assert response.status_code == 200
        print("PASS: Endpoint returns 200")
    
    def test_response_structure(self, api_client):
        """Test that response has correct structure"""
        response = api_client.post(f"{BASE_URL}/api/content/expand-script", json={
            "practice_name": "Structure Test",
            "element": "water",
            "duration_minutes": 8,
            "use_ai": False,
            "steps": ["Test step"],
            "source_texts": ["Test source"]
        })
        
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ['practice_name', 'target_minutes', 'target_word_count', 'word_count', 'used_ai', 'paragraphs', 'segments']
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        assert isinstance(data['paragraphs'], list), "paragraphs should be a list"
        assert isinstance(data['segments'], list), "segments should be a list"
        
        print(f"PASS: Response structure correct - {len(required_fields)} fields present")
    
    def test_use_ai_false_returns_fallback(self, api_client):
        """Test that use_ai=false returns fallback content"""
        response = api_client.post(f"{BASE_URL}/api/content/expand-script", json={
            "practice_name": "Fallback Test",
            "element": "fire",
            "duration_minutes": 7,
            "use_ai": False,
            "steps": [],
            "source_texts": []
        })
        
        assert response.status_code == 200
        data = response.json()
        
        assert not data['used_ai'], "used_ai should be False"
        assert len(data['paragraphs']) > 0, "Should have fallback paragraphs"
        
        print(f"PASS: Fallback content generated - {len(data['paragraphs'])} paragraphs")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
