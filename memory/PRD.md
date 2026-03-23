# Shamanic Elements Temple Of The Soul — PRD

## Original Problem Statement
Build a comprehensive full-stack spiritual wellness application with yoga, somatic movements, oracle readings, breathwork, guided meditations, ambient frequencies, healing modalities, and divination tools.

**Tech Stack:** React + FastAPI + MongoDB (Motor Async)

---

## Architecture
```
/app/
├── backend/
│   ├── .env (MONGO_URL, DB_NAME)
│   ├── data/
│   │   ├── all_content.py       (crystals, mantras, mudras, breathwork, oracle, meditations)
│   │   ├── divination_content.py (runes, I Ching, light codes — AI-generated images)
│   │   ├── shamanic_content.py  (earth altars, heart practices, creative, elemental, shamanic journeys)
│   │   ├── somatic_practices.py
│   │   ├── yoga_poses.py
│   │   └── guardians_content.py  [NEW] 37 sacred guardians
│   ├── routers/
│   │   ├── auth.py, payments.py, birth_chart.py, content.py
│   │   ├── oracle.py, numerology.py, user.py, admin.py
│   │   ├── gifts.py, tts.py, reviews.py
│   │   └── (sacred-guardians API in content.py)
│   └── server.py (startup seeding for all collections)
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── AmbientSoundPlayer.jsx  [UPDATED] + binaural + crystal bowls
│       │   ├── MainMenu.jsx [in pages/], TopNav, BottomNav, AppFooter
│       │   └── ...
│       └── pages/
│           ├── SacredGuardians.jsx  [NEW]
│           ├── Meditations.jsx      [UPDATED] ambient soundscapes integrated
│           └── (40+ pages)
```

---

## What's Been Implemented

### Phase 1 — Core App (previous sessions)
- Sacred Temples, Healing Modalities, Sunrise/Sunset practices
- Journaling, Mantras, Mudras, Divination (Oracle, Runes, I Ching)
- Water Practices, Gene Keys, Human Design, Profile Calculator, Progress Dashboard
- Breathwork, Somatic, Grounding, Mindfulness, Crystals

### Phase 2 — Recent Sessions
- **Partner Yoga** with photos for all 8 poses (DONE)
- **Light Codes Overhaul** — 75 authentic AI-generated images (DONE)
- **Meditations UX Overhaul** — instant timer, background TTS, banner images (DONE)
- **Community Reviews** — full-stack POST/GET with ratings (DONE)
- **Ancient Wisdom Traditions** (DONE - 2026-03-23)
  - 25 entries across 8 traditions: Egyptian (8), Celtic (3), Aboriginal Australian (3), Peruvian (2), International (4), Lemurian/Mu (1), Atlantean (1), Galactic (3)
  - Each entry: AI-generated image, description, sacred message, invocation, teachings, sacred tools, practice steps, crystals, chakra
  - Filter tabs for each tradition, detail modal with full content
  - New page `/ancient-wisdom` added to Main Menu under "Shamanic Wisdom"
  - Backend API: GET /api/ancient-wisdom (with ?tradition= filter)
  - New "My Chart" tab added as default tab on Human Design page
  - Phase 1: DOB input → calculates Profile (1/5 Investigator/Heretic, etc.) + Conscious/Design Sun Gates
  - Phase 2: Type self-assessment — 5 types listed with descriptions to choose from
  - Phase 3: Full results — SVG BodyGraph with colored defined centers, Strategy, Aura, Signature, Not-Self, Key Traits, Deconditioning Path, Affirmation
  - New "My Profile" tab added as default tab on Gene Keys page
  - DOB input (Year/Month/Day selects, same pattern as Numerology)
  - Solar wheel calculation: Life's Work, Evolution, Radiance, Purpose keys
  - Profile line calculation (e.g. 2/6 Hermit/Role Model)
  - Clickable key cards that open the full Gene Key detail modal
  - Personalized contemplation prompt based on Life's Work key
  - 37 beings: Power Animals (8), Spirit Animals (6), Dragon Energy (6), Angels (5), Familiars (6), Messengers (6)
  - Each with AI-generated authentic image, description, sacred message, symbolism, spiritual gifts, how-to-connect, chakra
  - Full frontend page with hero banner, category filter tabs, grid, detail modal
  - Backend API: GET /api/sacred-guardians (with ?category= filter)
  - Added to MainMenu under "Shamanic Wisdom"
- **Ambient Soundscapes for Meditations** (DONE - 2026-03-22)
  - 6 sounds: Ocean Waves, Forest Rain, Tibetan Bowls, Crystal Bowls, Binaural Tones, Silence
  - Web Audio API (no CDN, works offline), integrated in Meditations player
  - AmbientSoundPlayer component enhanced with crystal bowls + binaural tones

### 3rd Party Integrations
- OpenAI TTS (Meditations audio) — Emergent LLM Key
- Gemini Image Generation — Emergent LLM Key
- Resend (emails) — user API key
- Google OAuth — Emergent-managed

---

## Key API Endpoints
- GET /api/sacred-guardians — all 37 guardians
- GET /api/sacred-guardians?category=dragon_energy — filtered
- GET /api/sacred-guardians/{id} — single guardian
- POST /api/reviews, GET /api/reviews
- POST /api/tts/meditation/{id} — audio generation

---

## DB Schema (key collections)
- `sacred_guardians`: id, name, category, element, description, symbolism[], spiritual_gifts[], message, how_to_connect[], chakra, image_url
- `reviews`: author, rating, comment, created_at
- `meditations`: id, name, category, element, duration_minutes, image_url, visualization, benefits[]

---

## Prioritized Backlog

### P2 — Gifting UI
- Backend complete; frontend to purchase & redeem gifts still pending

### P3 — Birth Chart Visualization
- Current page shows text data; needs visual bodygraph/mandala rendering

### P3 — Refactoring
- `divination_content.py` is very large — could be split into JSON files per category

---

## Admin Access
- skywatersacredembodiments@gmail.com
- mskatt78@gmail.com
