# Shamanic Elements Temple Of The Soul — PRD

## Original Problem Statement
Build a comprehensive full-stack spiritual wellness application with yoga, somatic movements, oracle readings, breathwork, guided meditations, ambient frequencies, healing modalities, and divination tools.

**Tech Stack:** React + FastAPI + MongoDB (Motor Async)

---

## Architecture
```
/app/
├── backend/
│   ├── .env (MONGO_URL, DB_NAME, EMERGENT_LLM_KEY)
│   ├── data/
│   │   ├── all_content.py       (crystals, mantras, mudras, breathwork, oracle, meditations)
│   │   ├── divination_content.py (runes, I Ching, light codes)
│   │   ├── shamanic_content.py  (earth altars, heart practices, creative, elemental, journeys)
│   │   ├── somatic_practices.py
│   │   ├── yoga_poses.py
│   │   ├── guardians_content.py  (37 sacred guardians)
│   │   ├── ancient_wisdom_content.py (Base ancient wisdom)
│   │   ├── ancient_wisdom_extended.py (Extended entries)
│   │   ├── ancient_wisdom_final.py (Final expansion)
│   │   ├── ancient_wisdom_avalon.py (12 Avalon/Arthurian entries) ✅ NEW
│   │   └── sound_frequencies.py (12 sound healing entries) ✅ NEW
│   ├── routers/
│   │   ├── content.py (includes /sound-frequencies endpoint) ✅ UPDATED
│   │   └── tts.py (includes /somatic/{id} endpoint)
│   └── server.py (seeding for all collections)
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── SoundFrequencies.jsx ✅ NEW
│       │   ├── AncientWisdom.jsx (now includes Avalon tab) ✅ UPDATED
│       │   ├── SomaticMovement.jsx (with guided audio)
│       │   └── (50+ pages)
```

---

## What's Been Implemented (as of March 23, 2026)

### Phase 1-2 — Previous Sessions
- Core app features, Sacred Temples, Healing Modalities
- Gene Keys & Human Design calculators
- Partner Yoga, Light Codes, Meditations overhaul
- Sacred Guardians (37 entries)

### Phase 3 — Current Session (March 23, 2026)

#### ✅ Somatic Movement with Guided Audio
- TTS endpoint `/api/tts/somatic/{id}` 
- Full guided practice mode with timer, audio, ambient soundscapes

#### ✅ Ancient Wisdom Expanded to 108 entries (9 traditions × 12 each)
- Egyptian: 12 (Isis, Ra, Thoth, Sekhmet, Osiris, Horus, Hathor, Bastet, Anubis, Nephthys, Nut, Ma'at)
- **Avalon: 12 (Merlin, Lady of the Lake, Morgan Le Fay, Guinevere, King Arthur, Nimue, Nine Priestesses, Viviane, Lancelot, Holy Grail, Excalibur, Isle of Avalon)** ✅ NEW
- Aboriginal: 12
- Celtic: 12
- Peruvian: 12
- International: 12
- Lemurian: 12
- Atlantean: 12
- Galactic: 12

#### ✅ Sound & Frequency Healing (NEW SECTION)
12 comprehensive entries covering:
- **Cetacean:** Dolphin Frequencies, Whale Song Frequencies
- **Instruments:** Crystal Singing Bowls, Tibetan Singing Bowls, Tuning Forks, Gong Bath, Shamanic Drumming, Didgeridoo, Chimes/Bells/Tingsha, Harp
- **Frequencies:** Solfeggio Frequencies
- **Nature:** Water Frequencies

Each entry includes:
- AI-generated images
- Frequency ranges (Hz)
- Healing properties
- How to use instructions
- Best for recommendations
- Chakra associations
- Supporting crystals
- Duration recommendations

---

## Key API Endpoints
- `GET /api/sound-frequencies` — all 12 sound healing entries ✅ NEW
- `GET /api/sound-frequencies?category=cetacean` — filter by category
- `GET /api/ancient-wisdom?tradition=avalon` — Avalon tradition ✅ NEW
- `GET /api/sacred-guardians` — all 37 guardians
- `POST /api/tts/somatic/{id}` — somatic practice audio

---

## DB Schema (new collections)

### sound_frequencies
```javascript
{
  id: "freq-dolphin",
  name: "Dolphin Frequencies",
  category: "cetacean", // cetacean, instrument, frequency, nature
  element: "Water",
  frequency_range: "0.25 - 150 kHz",
  description: "...",
  healing_properties: [],
  how_to_use: [],
  best_for: [],
  frequency_hz: 528,
  chakra: "Heart & Throat",
  crystals: [],
  duration_recommendation: "15-30 minutes",
  image_url: "..."
}
```

---

## Prioritized Backlog

### P1 — Link Gene Keys ↔ Human Design
- Navigation bridge between pages (share Profile number)

### P2 — Gifting UI
- Backend complete; frontend pending

### P3 — User-uploaded content
- Allow users to add their own activations/recordings (admin CMS)

---

## Current Working URL
**https://chakra-guide-2.preview.emergentagent.com/menu**

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
- Sound Frequencies: ✅ 12 entries verified
- Avalon Tradition: ✅ 12 entries verified
- Ancient Wisdom Total: ✅ 108 entries (9 × 12)
- Somatic Guided Audio: ✅ Working
