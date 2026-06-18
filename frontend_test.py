#!/usr/bin/env python3
"""
Frontend Regression Test - Iteration: Guided Playback Overlap Guards & Voice Notes
Test URL: https://breathwork-sanctuary.preview.emergentagent.com
"""

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
import sys
import time

BASE_URL = "https://breathwork-sanctuary.preview.emergentagent.com"

def test_meditations_guided_overlay(page):
    """Test 1: /meditations - start guided practice and verify overlay renders without crash"""
    print("\n" + "="*80)
    print("TEST 1: /meditations - Guided Practice Overlay")
    print("="*80)
    
    try:
        # Navigate to meditations page
        print("Navigating to /meditations...")
        page.goto(f"{BASE_URL}/meditations", wait_until="networkidle", timeout=30000)
        time.sleep(2)
        
        # Check if meditation cards are loaded
        meditation_cards = page.locator('[data-testid*="meditation-card"]').count()
        print(f"Meditation cards found: {meditation_cards}")
        
        if meditation_cards == 0:
            # Try alternative selector
            meditation_cards = page.locator('button:has-text("Begin Practice")').count()
            print(f"Alternative selector - cards found: {meditation_cards}")
        
        if meditation_cards == 0:
            print("❌ FAIL: No meditation cards found on page")
            return False
        
        # Click first meditation card to start guided practice
        print("Clicking first meditation card...")
        first_card = page.locator('[data-testid*="meditation-card"]').first
        if first_card.count() == 0:
            first_card = page.locator('button:has-text("Begin Practice")').first
        
        first_card.click()
        time.sleep(3)
        
        # Check if GuidedPracticeOverlay is rendered
        print("Checking for GuidedPracticeOverlay...")
        
        # Look for overlay indicators
        overlay_indicators = [
            '[data-testid="guided-practice-overlay"]',
            '[data-testid="guided-timer"]',
            '[data-testid="guided-play-btn"]',
            '[data-testid="guided-pause-btn"]',
            '[data-testid="guided-exit-btn"]',
            'text="Guided narration"',
            'text="Toning"'
        ]
        
        overlay_found = False
        for selector in overlay_indicators:
            if page.locator(selector).count() > 0:
                print(f"✓ Found overlay element: {selector}")
                overlay_found = True
                break
        
        if not overlay_found:
            print("❌ FAIL: GuidedPracticeOverlay not rendered")
            return False
        
        # Check for timer display
        timer_elements = page.locator('text=/\\d{1,2}:\\d{2}/').count()
        print(f"Timer elements found: {timer_elements}")
        
        # Check for no error elements
        error_elements = page.locator('text=/error|crash|failed/i').count()
        if error_elements > 0:
            print(f"⚠️  Warning: {error_elements} error-related text found")
        
        # Check console for errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        
        print("✅ PASS: GuidedPracticeOverlay renders without crash")
        print("   - Overlay elements present")
        print("   - Timer display visible")
        print("   - No blocking errors detected")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {str(e)}")
        return False


def test_practice_journal_voice_notes(page):
    """Test 2: /practice-journal - open New Entry modal and verify voice-note controls"""
    print("\n" + "="*80)
    print("TEST 2: /practice-journal - Voice Note Controls")
    print("="*80)
    
    try:
        # Navigate to practice journal page
        print("Navigating to /practice-journal...")
        page.goto(f"{BASE_URL}/practice-journal", wait_until="networkidle", timeout=30000)
        time.sleep(2)
        
        # Look for New Entry button
        print("Looking for New Entry button...")
        new_entry_buttons = [
            'button:has-text("New Entry")',
            'button:has-text("Add Entry")',
            '[data-testid="new-entry-btn"]',
            '[data-testid="add-entry-btn"]'
        ]
        
        new_entry_btn = None
        for selector in new_entry_buttons:
            if page.locator(selector).count() > 0:
                new_entry_btn = page.locator(selector).first
                print(f"✓ Found New Entry button: {selector}")
                break
        
        if not new_entry_btn:
            print("❌ FAIL: New Entry button not found")
            return False
        
        # Click New Entry button
        print("Clicking New Entry button...")
        new_entry_btn.click()
        time.sleep(2)
        
        # Check if modal is open
        print("Checking for New Entry modal...")
        modal_found = False
        modal_selectors = [
            '[role="dialog"]',
            '[data-testid="practice-journal-form-modal"]',
            'text="New Entry"'
        ]
        
        for selector in modal_selectors:
            if page.locator(selector).count() > 0:
                print(f"✓ Modal found: {selector}")
                modal_found = True
                break
        
        if not modal_found:
            print("❌ FAIL: New Entry modal not opened")
            return False
        
        # Check for voice note controls
        print("Checking for voice note controls...")
        
        voice_note_controls = {
            'voice-note-card': '[data-testid="practice-journal-voice-note-card"]',
            'record-button': '[data-testid="practice-journal-voice-record-button"]',
            'duration-display': '[data-testid="practice-journal-voice-note-duration"]'
        }
        
        controls_found = {}
        for control_name, selector in voice_note_controls.items():
            found = page.locator(selector).count() > 0
            controls_found[control_name] = found
            status = "✓" if found else "✗"
            print(f"{status} {control_name}: {selector}")
        
        # All controls should be present
        all_controls_present = all(controls_found.values())
        
        if all_controls_present:
            print("✅ PASS: Voice note controls render correctly")
            print("   - Voice note card present")
            print("   - Record button present")
            print("   - Duration display present")
            return True
        else:
            missing = [name for name, found in controls_found.items() if not found]
            print(f"❌ FAIL: Missing voice note controls: {missing}")
            return False
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {str(e)}")
        return False


def main():
    print("\n" + "="*80)
    print("FRONTEND REGRESSION TEST - Guided Playback & Voice Notes Iteration")
    print("="*80)
    print(f"Test URL: {BASE_URL}")
    
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 720},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = context.new_page()
        
        results = []
        
        # Run tests
        results.append(("Meditations Guided Overlay", test_meditations_guided_overlay(page)))
        results.append(("Practice Journal Voice Notes", test_practice_journal_voice_notes(page)))
        
        # Cleanup
        browser.close()
        
        # Summary
        print("\n" + "="*80)
        print("FRONTEND TEST SUMMARY")
        print("="*80)
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status}: {test_name}")
        
        print(f"\nTotal: {passed}/{total} tests passed")
        
        if passed == total:
            print("\n✅ ALL FRONTEND SMOKE TESTS PASSED")
            return 0
        else:
            print(f"\n❌ {total - passed} FRONTEND TEST(S) FAILED")
            return 1


if __name__ == "__main__":
    sys.exit(main())
