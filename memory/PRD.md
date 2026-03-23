# Shamanic Elements Temple Of The Soul — PRD

## Original Problem Statement
Build a comprehensive full-stack spiritual wellness application with yoga, somatic movements, oracle readings, breathwork, guided meditations, ambient frequencies, healing modalities, and divination tools.

**Tech Stack:** React + FastAPI + MongoDB (Motor Async)

---

## What's Been Implemented (as of March 23, 2026)

### ✅ P1 COMPLETE: Gene Keys ↔ Human Design Cross-Links
- Gene Keys "My Profile" tab now shows "View My Human Design Chart" button after calculation
- Human Design results show "Explore My Gene Keys" button with Profile number context
- Both pages explain how the Profile number connects the two systems

### ✅ TAROT READING (22 Major Arcana)
New page at `/tarot` with:
- **22 AI-generated Major Arcana cards** (stunning custom imagery)
- **3 Spread types:** Single Card, Past-Present-Future (3 cards), Celtic Cross (10 cards)
- **Complete card meanings:** Upright, Reversed, Love, Career, Spiritual interpretations
- **Yes/No answers** and **Card Advice** for each card
- Interactive gallery to explore all cards

### ✅ AVALON MYSTERIES (12 entries)
Added to Ancient Wisdom Traditions:
- Merlin, Lady of the Lake, Morgan Le Fay, Guinevere
- King Arthur, Nimue, Nine Priestesses, Viviane
- Sir Lancelot, The Holy Grail, Excalibur, Isle of Avalon
- All with stunning AI-generated Arthurian imagery

### ✅ SOUND & FREQUENCY HEALING (12 entries)
New page at `/sound-frequencies` with:
- **Cetacean:** Dolphin Frequencies, Whale Song Frequencies
- **Instruments:** Crystal Singing Bowls, Tibetan Bowls, Tuning Forks, Gong Bath, Shamanic Drums, Didgeridoo, Chimes/Bells, Harp
- **Frequencies:** Solfeggio Frequencies (174-963 Hz)
- **Nature:** Water Frequencies
- Complete healing properties, how-to-use, chakra associations, crystals

### ✅ SOMATIC MOVEMENT with Guided Audio
- TTS endpoint `/api/tts/somatic/{id}`
- Full guided practice mode with timer, audio, ambient soundscapes

### ✅ ANCIENT WISDOM EXPANDED to 108 entries
9 traditions × 12 entries each:
- Egyptian, Avalon, Aboriginal, Celtic, Peruvian
- International, Lemurian, Atlantean, Galactic

### Previous Sessions
- Sacred Guardians (37 entries)
- Gene Keys & Human Design calculators with Body Graph
- Partner Yoga with photos
- Light Codes (75 AI images)
- Meditations with TTS and Ambient Soundscapes
- Community Reviews system
- Oracle Cards, Rune Readings, I Ching

---

## Architecture
```
/app/
├── backend/
│   ├── data/
│   │   ├── tarot_cards.py (22 Major Arcana) ✅ NEW
│   │   ├── ancient_wisdom_avalon.py (12 Avalon entries) ✅ NEW
│   │   ├── sound_frequencies.py (12 entries) ✅ NEW
│   │   └── ... (all previous data files)
│   ├── routers/
│   │   └── content.py (tarot, sound-frequencies endpoints) ✅ UPDATED
│   └── server.py (seeding for new collections)
├── frontend/
│   └── src/pages/
│       ├── TarotReading.jsx ✅ NEW
│       ├── SoundFrequencies.jsx ✅ NEW
│       ├── GeneKeys.jsx (added HD link) ✅ UPDATED
│       ├── HumanDesign.jsx (added GK link) ✅ UPDATED
│       └── AncientWisdom.jsx (added Avalon tab) ✅ UPDATED
```

---

## Key API Endpoints (New)
- `GET /api/tarot/cards` — all 22 Major Arcana
- `GET /api/tarot/reading?spread=single|three|celtic_cross` — random reading
- `GET /api/sound-frequencies` — all 12 sound healing entries
- `GET /api/ancient-wisdom?tradition=avalon` — Avalon tradition

---

## Cancelled Tasks
- ❌ P2 Gifting UI (cancelled per user request)

---

## Future Backlog (User Requested)
- 📝 Admin CMS to add your own activations/recordings
- 📝 Video integration for practices
- 📝 Live & Recorded access courses
- 📝 Workshops/Playshops with socials/retreats

---

## Current Working URL
**https://chakra-guide-2.preview.emergentagent.com/menu**

---

## Database Collections (New)
- `tarot_cards`: 22 entries (Major Arcana with full meanings)
- `sound_frequencies`: 12 entries (healing frequencies)
- `ancient_wisdom`: 108 entries (9 traditions × 12)

---

## 3rd Party Integrations
- OpenAI TTS — Emergent LLM Key
- Gemini Image Generation — Emergent LLM Key
- Resend (emails) — user API key
- Google OAuth — Emergent-managed

---

## Admin Access
- skywatersacredembodiments@gmail.com
- mskatt78@gmail.com

---

## Testing Status
- Tarot Reading: ✅ 22 cards, 3 spreads verified
- Sound Frequencies: ✅ 12 entries verified
- Avalon Tradition: ✅ 12 entries verified  
- Gene Keys ↔ Human Design links: ✅ Working
- Ancient Wisdom Total: ✅ 108 entries
