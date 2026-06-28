"""
Test suite for divination image completeness - Iteration 232
Tests: Oracle, Tarot, Runes, I Ching image_url fields
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestOracleImages:
    """Oracle cards image validation"""
    
    def test_oracle_cards_have_valid_images(self):
        """All oracle cards should have valid http/https image_url"""
        response = requests.get(f"{BASE_URL}/api/oracle/cards")
        assert response.status_code == 200
        
        cards = response.json()
        assert len(cards) > 0, "Oracle cards should not be empty"
        
        missing_images = []
        bad_images = []
        
        for card in cards:
            name = card.get('name', 'Unknown')
            image_url = card.get('image_url', '')
            
            if not image_url:
                missing_images.append(name)
            elif not image_url.startswith(('http://', 'https://')):
                bad_images.append((name, image_url[:50]))
        
        assert len(missing_images) == 0, f"Cards missing image_url: {missing_images}"
        assert len(bad_images) == 0, f"Cards with invalid image_url: {bad_images}"
        print(f"✓ All {len(cards)} oracle cards have valid image URLs")
    
    def test_coyote_card_has_coyote_image(self):
        """Coyote card should have a proper coyote image URL"""
        response = requests.get(f"{BASE_URL}/api/oracle/cards")
        assert response.status_code == 200
        
        cards = response.json()
        coyote_cards = [c for c in cards if 'coyote' in c.get('name', '').lower()]
        
        assert len(coyote_cards) > 0, "Coyote card should exist"
        
        coyote = coyote_cards[0]
        image_url = coyote.get('image_url', '')
        
        assert image_url.startswith(('http://', 'https://')), "Coyote should have valid image URL"
        # Check it's not a generic placeholder
        assert 'coyote' in image_url.lower() or 'wikimedia' in image_url.lower() or 'pexels' in image_url.lower(), \
            f"Coyote image URL should be relevant: {image_url}"
        print(f"✓ Coyote card has proper image: {image_url}")


class TestTarotImages:
    """Tarot cards image validation"""
    
    def test_tarot_cards_have_valid_images(self):
        """All tarot cards should have valid http/https image_url"""
        response = requests.get(f"{BASE_URL}/api/tarot/cards")
        assert response.status_code == 200
        
        cards = response.json()
        assert len(cards) > 0, "Tarot cards should not be empty"
        
        missing_images = []
        bad_images = []
        
        for card in cards:
            name = card.get('name', 'Unknown')
            image_url = card.get('image_url', '')
            
            if not image_url:
                missing_images.append(name)
            elif not image_url.startswith(('http://', 'https://')):
                bad_images.append((name, image_url[:50]))
        
        assert len(missing_images) == 0, f"Cards missing image_url: {missing_images}"
        assert len(bad_images) == 0, f"Cards with invalid image_url: {bad_images}"
        print(f"✓ All {len(cards)} tarot cards have valid image URLs")


class TestRuneImages:
    """Runes image validation"""
    
    def test_runes_have_valid_images(self):
        """All runes should have valid http/https image_url"""
        response = requests.get(f"{BASE_URL}/api/runes")
        assert response.status_code == 200
        
        runes = response.json()
        assert len(runes) > 0, "Runes should not be empty"
        
        missing_images = []
        bad_images = []
        
        for rune in runes:
            name = rune.get('name', 'Unknown')
            image_url = rune.get('image_url', '')
            
            if not image_url:
                missing_images.append(name)
            elif not image_url.startswith(('http://', 'https://')):
                bad_images.append((name, image_url[:50]))
        
        assert len(missing_images) == 0, f"Runes missing image_url: {missing_images}"
        assert len(bad_images) == 0, f"Runes with invalid image_url: {bad_images}"
        print(f"✓ All {len(runes)} runes have valid image URLs")


class TestIChingImages:
    """I Ching hexagrams image validation"""
    
    def test_iching_hexagrams_have_valid_images(self):
        """All I Ching hexagrams should have valid http/https image_url"""
        response = requests.get(f"{BASE_URL}/api/i-ching")
        assert response.status_code == 200
        
        hexagrams = response.json()
        assert len(hexagrams) > 0, "I Ching hexagrams should not be empty"
        
        missing_images = []
        bad_images = []
        
        for hex in hexagrams:
            name = hex.get('name', 'Unknown')
            image_url = hex.get('image_url', '')
            
            if not image_url:
                missing_images.append(name)
            elif not image_url.startswith(('http://', 'https://')):
                bad_images.append((name, image_url[:50]))
        
        assert len(missing_images) == 0, f"Hexagrams missing image_url: {missing_images}"
        assert len(bad_images) == 0, f"Hexagrams with invalid image_url: {bad_images}"
        print(f"✓ All {len(hexagrams)} I Ching hexagrams have valid image URLs")


class TestOracleReading:
    """Oracle reading functionality"""
    
    def test_guest_oracle_reading_returns_cards_with_images(self):
        """Guest oracle reading should return cards with valid images"""
        response = requests.post(
            f"{BASE_URL}/api/oracle/reading/guest",
            json={"spread_type": "single"}
        )
        assert response.status_code == 200
        
        reading = response.json()
        assert 'cards' in reading, "Reading should have cards"
        assert len(reading['cards']) > 0, "Reading should have at least one card"
        
        for card in reading['cards']:
            image_url = card.get('image_url', '')
            assert image_url.startswith(('http://', 'https://')), \
                f"Card {card.get('name')} should have valid image URL"
        
        print(f"✓ Guest oracle reading returned {len(reading['cards'])} cards with valid images")


class TestTarotReading:
    """Tarot reading functionality"""
    
    def test_tarot_reading_returns_cards_with_images(self):
        """Tarot reading should return cards with valid images"""
        response = requests.get(f"{BASE_URL}/api/tarot/reading?spread=single")
        assert response.status_code == 200
        
        reading = response.json()
        assert 'cards' in reading, "Reading should have cards"
        assert len(reading['cards']) > 0, "Reading should have at least one card"
        
        for item in reading['cards']:
            card = item.get('card', {})
            image_url = card.get('image_url', '')
            assert image_url.startswith(('http://', 'https://')), \
                f"Card {card.get('name')} should have valid image URL"
        
        print(f"✓ Tarot reading returned {len(reading['cards'])} cards with valid images")


class TestRuneReading:
    """Rune reading functionality"""
    
    def test_rune_draw_returns_rune_with_image(self):
        """Rune draw should return rune with valid image"""
        response = requests.get(f"{BASE_URL}/api/runes/draw/single")
        assert response.status_code == 200
        
        rune = response.json()
        image_url = rune.get('image_url', '')
        assert image_url.startswith(('http://', 'https://')), \
            f"Rune {rune.get('name')} should have valid image URL"
        
        print(f"✓ Rune draw returned {rune.get('name')} with valid image")


class TestIChingReading:
    """I Ching reading functionality"""
    
    def test_iching_cast_coins_returns_hexagram_with_image(self):
        """I Ching cast coins should return hexagram with valid image"""
        response = requests.get(f"{BASE_URL}/api/i-ching/cast/coins")
        assert response.status_code == 200
        
        hexagram = response.json()
        image_url = hexagram.get('image_url', '')
        assert image_url.startswith(('http://', 'https://')), \
            f"Hexagram {hexagram.get('name')} should have valid image URL"
        
        print(f"✓ I Ching cast returned {hexagram.get('name')} with valid image")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
