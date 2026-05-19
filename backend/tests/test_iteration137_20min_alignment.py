"""
Iteration 137 - 20-Minute Duration Alignment Fix Verification
Tests specifically for the fix from iteration 136 where 20-minute guided script
with strict mode and minimal source content only reached 91.2% of target_word_count.

Expected: >=98% of target_word_count for 20-minute strict mode with minimal source content.
"""
import os
import pytest
import requests
from collections import Counter

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestIteration137_20MinAlignment:
    """Focused tests for 20-minute duration alignment fix"""

    def test_health_check(self):
        """Verify backend is healthy before running tests"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("Backend health check: PASS")

    def test_20min_strict_minimal_source_alignment(self):
        """
        CRITICAL TEST: 20-minute strict mode with minimal source content
        This is the exact scenario that failed in iteration 136 at 91.2%.
        Expected: >=98% of target_word_count
        """
        payload = {
            "practice_name": "Deep Air Meditation",
            "element": "air",
            "duration_minutes": 20,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Expand awareness", "Breathe freely"],  # Minimal steps
            "source_texts": ["Air element expansion"]  # Minimal source
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        target = data["target_word_count"]
        actual = data["word_count"]
        ratio = actual / target if target > 0 else 0
        percentage = ratio * 100
        
        print(f"20-min strict minimal source:")
        print(f"  target_word_count: {target}")
        print(f"  word_count: {actual}")
        print(f"  percentage: {percentage:.2f}%")
        
        # CRITICAL: Must be >=98% (the fix target)
        assert ratio >= 0.98, f"FAIL: Duration alignment {percentage:.2f}% < 98%"
        print(f"  RESULT: PASS ({percentage:.2f}% >= 98%)")

    def test_20min_strict_empty_source_alignment(self):
        """
        Test 20-minute strict mode with completely empty source content.
        This is an even more extreme case than the iteration 136 failure.
        """
        payload = {
            "practice_name": "Pure Spirit Journey",
            "element": "spirit",
            "duration_minutes": 20,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": [],  # No steps
            "source_texts": []  # No source texts
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        target = data["target_word_count"]
        actual = data["word_count"]
        ratio = actual / target if target > 0 else 0
        percentage = ratio * 100
        
        print(f"20-min strict empty source:")
        print(f"  target_word_count: {target}")
        print(f"  word_count: {actual}")
        print(f"  percentage: {percentage:.2f}%")
        
        # Should still achieve >=98%
        assert ratio >= 0.98, f"FAIL: Duration alignment {percentage:.2f}% < 98%"
        print(f"  RESULT: PASS ({percentage:.2f}% >= 98%)")

    def test_20min_strict_single_step_alignment(self):
        """
        Test 20-minute strict mode with single step and single source text.
        """
        payload = {
            "practice_name": "Water Flow Meditation",
            "element": "water",
            "duration_minutes": 20,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Flow with the breath"],  # Single step
            "source_texts": ["Water healing"]  # Single source
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        target = data["target_word_count"]
        actual = data["word_count"]
        ratio = actual / target if target > 0 else 0
        percentage = ratio * 100
        
        print(f"20-min strict single step/source:")
        print(f"  target_word_count: {target}")
        print(f"  word_count: {actual}")
        print(f"  percentage: {percentage:.2f}%")
        
        assert ratio >= 0.98, f"FAIL: Duration alignment {percentage:.2f}% < 98%"
        print(f"  RESULT: PASS ({percentage:.2f}% >= 98%)")

    def test_20min_no_repeated_stems_after_fix(self):
        """
        Verify that the 20-minute fix doesn't introduce repeated stems.
        The repetition guard should remain improved.
        """
        payload = {
            "practice_name": "Earth Grounding Extended",
            "element": "earth",
            "duration_minutes": 20,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Ground yourself", "Feel the earth"],
            "source_texts": ["Earth element connection"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data.get("paragraphs", [])
        
        # Extract 8-word stems
        stems = []
        for p in paragraphs:
            words = p.lower().split()[:8]
            stem = " ".join(words)
            if stem:
                stems.append(stem)
        
        stem_counts = Counter(stems)
        repeated = sum(1 for count in stem_counts.values() if count > 1)
        repeat_ratio = repeated / len(stems) if stems else 0
        
        print(f"20-min stem diversity check:")
        print(f"  total paragraphs: {len(paragraphs)}")
        print(f"  unique stems: {len(stem_counts)}")
        print(f"  repeated stems: {repeated}")
        print(f"  repeat ratio: {repeat_ratio*100:.2f}%")
        
        # Strict mode should have <12% repeated stems
        assert repeat_ratio < 0.12, f"FAIL: Too many repeated stems: {repeat_ratio*100:.2f}% >= 12%"
        print(f"  RESULT: PASS (repeat ratio {repeat_ratio*100:.2f}% < 12%)")

    def test_20min_trigger_phrases_not_over_repeated(self):
        """
        Verify that trigger phrases like 'notice what shifts' and 'let this guidance'
        are not over-repeated in 20-minute scripts.
        """
        payload = {
            "practice_name": "Fire Transformation Extended",
            "element": "fire",
            "duration_minutes": 20,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Ignite inner fire", "Transform energy"],
            "source_texts": ["Fire element activation"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        paragraphs = data.get("paragraphs", [])
        full_text = " ".join(paragraphs).lower()
        
        # Check problematic phrases from user report
        # Note: "continue with" is a common phrase in the phrase bank, allow more occurrences
        trigger_phrases = {
            "notice what shifts": 6,  # Max 6 times for 20-min
            "let this guidance": 6,
            "stay with": 10,  # More common phrase, allow more
            "continue with": 15,  # Very common in extension paragraphs
        }
        
        print(f"20-min trigger phrase check:")
        all_within_limits = True
        for phrase, max_count in trigger_phrases.items():
            count = full_text.count(phrase)
            status = "OK" if count <= max_count else "OVER"
            print(f"  '{phrase}': {count} (max {max_count}) - {status}")
            if count > max_count:
                all_within_limits = False
        
        assert all_within_limits, "Some trigger phrases exceeded limits"
        print(f"  RESULT: PASS (all phrases within limits)")

    def test_25min_strict_minimal_source_alignment(self):
        """
        Test 25-minute strict mode with minimal source content.
        Even longer duration to stress test the alignment loop.
        """
        payload = {
            "practice_name": "Extended Spirit Journey",
            "element": "spirit",
            "duration_minutes": 25,
            "use_ai": False,
            "anti_repetition_mode": "strict",
            "include_toning": True,
            "steps": ["Open to spirit", "Receive guidance"],
            "source_texts": ["Spiritual awakening"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        target = data["target_word_count"]
        actual = data["word_count"]
        ratio = actual / target if target > 0 else 0
        percentage = ratio * 100
        
        print(f"25-min strict minimal source:")
        print(f"  target_word_count: {target}")
        print(f"  word_count: {actual}")
        print(f"  percentage: {percentage:.2f}%")
        
        # Should achieve >=98%
        assert ratio >= 0.98, f"FAIL: Duration alignment {percentage:.2f}% < 98%"
        print(f"  RESULT: PASS ({percentage:.2f}% >= 98%)")


class TestFrontendPayloadUnchanged:
    """Verify frontend payload format still works correctly"""

    def test_frontend_payload_use_ai_false(self):
        """
        Verify frontend sends use_ai=false correctly.
        From useGuidedPracticeEngine.js line 266.
        """
        payload = {
            "practice_id": "test-practice-20min",
            "practice_name": "Frontend 20-Min Test",
            "element": "Spirit",
            "duration_minutes": 20,
            "use_ai": False,  # Frontend sends this
            "include_toning": True,
            "anti_repetition_mode": "strict",  # Frontend sends this
            "steps": ["Step 1", "Step 2"],
            "source_texts": ["Source text"]
        }
        response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["used_ai"] == False, "Expected used_ai=False"
        
        target = data["target_word_count"]
        actual = data["word_count"]
        ratio = actual / target if target > 0 else 0
        
        print(f"Frontend payload test:")
        print(f"  used_ai: {data['used_ai']}")
        print(f"  word_count: {actual} / {target} ({ratio*100:.2f}%)")
        
        assert ratio >= 0.98, f"FAIL: Duration alignment {ratio*100:.2f}% < 98%"
        print(f"  RESULT: PASS")

    def test_frontend_payload_anti_repetition_mode(self):
        """
        Verify frontend sends anti_repetition_mode correctly.
        From useGuidedPracticeEngine.js line 268.
        """
        for mode in ["strict", "balanced"]:
            payload = {
                "practice_name": f"Mode Test {mode}",
                "element": "water",
                "duration_minutes": 10,
                "use_ai": False,
                "include_toning": True,
                "anti_repetition_mode": mode,
                "steps": ["Flow"],
                "source_texts": ["Water"]
            }
            response = requests.post(f"{BASE_URL}/api/content/expand-script", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["word_count"] > 0
            print(f"  anti_repetition_mode={mode}: PASS")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
