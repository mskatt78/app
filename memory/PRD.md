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
│   │   ├── divination_content.py (runes, I Ching, light codes — AI-generated images)
│   │   ├── shamanic_content.py  (earth altars, heart practices, creative, elemental, shamanic journeys)
│   │   ├── somatic_practices.py
│   │   ├── yoga_poses.py
│   │   ├── guardians_content.py  (37 sacred guardians)
│   │   ├── ancient_wisdom_content.py (Base ancient wisdom - 25 entries)
│   │   ├── ancient_wisdom_extended.py (Extended - 54 entries)
│   │   └── ancient_wisdom_final.py (Final expansion - 17 entries = 96 total)
│   ├── routers/
│   │   ├── auth.py, payments.py, birth_chart.py, content.py
│   │   ├── oracle.py, numerology.py, user.py, admin.py
│   │   ├── gifts.py, tts.py (includes meditation + somatic audio), reviews.py
│   └── server.py (startup seeding for all collections)
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── AmbientSoundPlayer.jsx (procedural audio: binaural + crystal bowls)
│       │   ├── TopNav, BottomNav, AppFooter
│       │   └── ...
│       └── pages/
│           ├── SacredGuardians.jsx
│           ├── AncientWisdom.jsx
│           ├── SomaticMovement.jsx (NOW WITH GUIDED AUDIO)
│           ├── Meditations.jsx (with TTS + ambient soundscapes)
│           └── (50+ pages)
```

---

## What's Been Implemented (as of March 23, 2026)

### Phase 1 — Core App (previous sessions)
- Sacred Temples, Healing Modalities, Sunrise/Sunset practices
- Journaling, Mantras, Mudras, Divination (Oracle, Runes, I Ching)
- Water Practices, Gene Keys, Human Design, Profile Calculator, Progress Dashboard
- Breathwork, Grounding, Mindfulness, Crystals

### Phase 2 — Recent Sessions
- **Partner Yoga** with photos for all 8 poses
- **Light Codes Overhaul** — 75 authentic AI-generated images
- **Meditations UX Overhaul** — instant timer, background TTS, banner images
- **Community Reviews** — full-stack POST/GET with ratings

### Phase 3 — Latest Session (March 23, 2026)
- **Somatic Movement with Guided Audio** ✅
  - Added TTS endpoint `/api/tts/somatic/{id}` for guided practice audio
  - Updated SomaticMovement.jsx with full guided practice mode:
    - Timer with progress bar
    - TTS audio generation (preparing → playing)
    - Ambient Soundscapes (Ocean, Forest Rain, Tibetan Bowls, Crystal Bowls, Binaural Tones)
    - Movement Instructions display
    - Play/Pause, Reset, Volume controls
  
- **Ancient Wisdom Traditions Expanded to 96 entries (12 per tradition)** ✅
  - Egyptian: 12 (Isis, Ra, Thoth, Sekhmet, Osiris, Horus, Hathor, Bastet, Anubis, Nephthys, Nut, Ma'at)
  - Aboriginal Australian: 12 (Rainbow Serpent, Wandjina, Songlines, Biame, Bunjil, Yhi, + 6 more)
  - Celtic: 12 (Morrigan, Brigid, Cernunnos, Lugh, Danu, Cerridwen, Dagda, Rhiannon, Aengus + more)
  - Peruvian: 12 (Pachamama, Inti, Viracocha, Mama Quilla, Qero, Supay, Illapa + more)
  - International: 12 (Shiva, Lakshmi, Ganesha, Odin, Yemoja, Poseidon, White Tara, Hecate + more)
  - Lemurian: 12 (Crystal Temples, Priests, Violet Flame Priestess, Dolphin Consciousness + more)
  - Atlantean: 12 (High Priests, Crystal Skulls, Crystal Master, Mermaid Priestess + more)
  - Galactic: 12 (Pleiadian, Sirian, Arcturian, Lyran, Andromedan, Blue Avian, Mantis + more)
  - All with AI-generated images using Gemini imagen-4.0

- **Sacred Guardians** — 37 beings with AI-generated images
- **Gene Keys Calculator** with DOB-based profile calculation
- **Human Design Calculator** with Body Graph SVG generation
- **Ambient Soundscapes** integrated into Meditations and Somatic pages

### 3rd Party Integrations
- OpenAI TTS (Meditations + Somatic audio) — Emergent LLM Key
- Gemini Image Generation — Emergent LLM Key
- Resend (emails) — user API key
- Google OAuth — Emergent-managed

---

## Key API Endpoints
- `GET /api/sacred-guardians` — all 37 guardians
- `GET /api/ancient-wisdom` — all 96 traditions (with ?tradition= filter)
- `POST /api/tts/meditation/{id}` — meditation audio generation
- `POST /api/tts/somatic/{id}` — somatic practice audio generation ✅ NEW
- `GET /api/somatic` — all 39 somatic practices
- `POST /api/reviews`, `GET /api/reviews`

---

## DB Schema (key collections)
- `sacred_guardians`: id, name, category, element, description, symbolism[], spiritual_gifts[], message, how_to_connect[], chakra, image_url
- `ancient_wisdom`: id, name, tradition, type, title, element, description, teachings[], sacred_tools[], invocation, message, practice[], crystals[], chakra, color, image_url
- `somatic_practices`: id, name, element, description, duration_minutes, benefits[], instructions[], category, has_audio
- `reviews`: author, rating, comment, created_at
- `meditations`: id, name, category, element, duration_minutes, image_url, visualization, benefits[]

---

## Prioritized Backlog

### P1 — Link Gene Keys ↔ Human Design
- Add navigation bridge between Gene Keys Profile and Human Design Chart (share Profile number)

### P2 — Gifting UI
- Backend complete; frontend to purchase & redeem gifts still pending

### P3 — Refactoring
- `divination_content.py` is very large — could be split into JSON files per category
- Clean up `data/` folder organization

---

## Current Working URL
**https://chakra-guide-2.preview.emergentagent.com/menu**

---

## Admin Access
- skywatersacredembodiments@gmail.com
- mskatt78@gmail.com

---

## Testing Status
- Somatic Guided Audio: ✅ Tested and working
- Ancient Wisdom 96 entries: ✅ Verified (12 per tradition)
- Sacred Guardians: ✅ 37 entries verified
- TTS Endpoints: ✅ Both meditation and somatic working
