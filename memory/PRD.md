# Shamanic Elements Soul Temple 2.0 — PRD

## Original Problem Statement
Build a comprehensive full-stack spiritual wellness application with yoga, somatic movements, oracle readings, breathwork, guided meditations, ambient frequencies, healing modalities, and divination tools.

**App Name:** Shamanic Elements Soul Temple 2.0 (renamed March 2026)
**Tech Stack:** React + FastAPI + MongoDB (Motor Async)

---

## Content & Image Status (Updated March 2026)

| Section | Total | With Images | Status |
|---------|-------|-------------|--------|
| Breathwork Sessions | 6 | 6 | ✅ |
| Meditations | 6 | 6 | ✅ |
| Oracle Cards | 22 | 22 | ✅ |
| Tarot Cards | 22 | 22 | ✅ |
| Sound Frequencies | 12 | 12 | ✅ |
| Ancient Wisdom | 108 | 108 | ✅ |
| Sacred Guardians | 37 | 37 | ✅ |
| Runes | 25 | 25 | ✅ |
| Somatic Practices | 39 | 39 | ✅ (Fixed March 2026) |
| Wheel of Year Sabbats | 8 | 8 | ✅ (Added March 2026) |

---

## Guided Audio / TTS Status

| Section | TTS Status | Component |
|---------|-----------|-----------|
| Meditations | ✅ Full guided narration | `/api/tts/meditation/{id}` |
| Somatic Movement | ✅ Full guided narration | `/api/tts/somatic/{id}` |
| Shamanic Practices | ✅ GuidedAudioButton added | `/api/tts/generate-base64` |
| Elemental Practices | ✅ GuidedAudioButton added | `/api/tts/generate-base64` |
| Heart Practices | ✅ GuidedAudioButton added | `/api/tts/generate-base64` |
| Rose Temple | ✅ GuidedAudioButton added | `/api/tts/generate-base64` |
| Masculine Temple | ✅ GuidedAudioButton added | `/api/tts/generate-base64` |
| Mantras Library | ✅ Web Audio + TTS | Web Audio API |

---

## What's Working (Full Feature List)

### Divination & Guidance
- **Tarot Reading** (22 Major Arcana with AI images, 3 spreads) ✅
- **Oracle Cards** (22 cards with images) ✅ - Fixed oracle.py to use all_content.py
- **Rune Readings** (25 Elder Futhark runes with AI images) ✅
- **I Ching** (64 hexagrams) ✅
- **Light Codes** (77 entries: Sacred Geometry 25, Ancient Alphabets 25, Light Language 25, Galactic Codes 15, Chakra Activation 12) ✅ Updated March 2026

### Calculations & Charts
- **Gene Keys Calculator** ✅
- **Human Design Calculator** ✅
- **Numerology Calculator** ✅
- **Birth Chart (Astrology)** ✅

### Body Wisdom
- **Somatic Movement** (39 practices, all with images) ✅
- **Yoga Poses** (78 poses) ✅

### Sacred Traditions (Ancient Wisdom)
- Egyptian Mystery Schools ✅
- Celtic / Druid / Avalon ✅
- Norse / Viking ✅
- Taoism / Confucianism ✅
- Hinduism / Vedic ✅
- Buddhism ✅
- Kabbalah ✅
- Greek Mystery Schools ✅
- Indigenous American ✅

### Healing & Practice
- **Breathwork** (6 sessions with images) ✅
- **Meditations** (6 meditations with guided TTS) ✅
- **Heart Practices** (with GuidedAudioButton) ✅
- **Elemental Practices** (with GuidedAudioButton) ✅
- **Shamanic Practices** (21 practices with GuidedAudioButton) ✅
- **Sound & Frequency Healing** (12 entries) ✅

### Sacred Spaces
- **Rose Temple** (with GuidedAudioButton) ✅
- **Masculine Temple** (with GuidedAudioButton) ✅
- **Wheel of the Year** (8 sabbats with AI images) ✅
- **Mantras Library** (with audio, cleanup fixed) ✅
- **Elemental Temples** (5 elements, 8 sections each: Embodiment, Within You, In Nature, Practices, Rituals, Ceremonies, Blessings, Affirmations) ✅ Expanded March 2026
- **Water Practices** (ceremonies, rituals, blessing categories) ✅ Expanded March 2026

### Other
- **Oracle Readings** (22 cards with images) ✅ - Fixed mutation bug
- **Achievements** ✅
- **Pricing** ✅
- **Admin CMS** ✅

---

## Authentication
- Google OAuth via Emergent Auth (`/session-data` callback) ✅
- JWT-based email/password ✅
- Session management via MongoDB `sessions` collection ✅

---

## 3rd Party Integrations
- OpenAI TTS (guided meditations/somatic) — Emergent LLM Key
- Gemini Image Generation — Emergent LLM Key
- Claude (Oracle AI interpretation) — Emergent LLM Key
- Emergent Google Auth

---

## API Endpoints
| Route | Description |
|-------|-------------|
| `POST /api/auth/google` | Google OAuth login |
| `POST /api/auth/session` | Process OAuth callback |
| `GET /api/meditations` | List meditations |
| `POST /api/tts/meditation/{id}` | Generate guided meditation audio |
| `POST /api/tts/somatic/{id}` | Generate guided somatic audio |
| `POST /api/tts/generate-base64` | Generic TTS (used by GuidedAudioButton) |
| `POST /api/oracle/reading` | Create oracle reading (authenticated) |
| `POST /api/oracle/reading/guest` | Create oracle reading (guest) |
| `GET /api/somatic` | List somatic practices |
| `GET /api/shamanic-practices` | List shamanic practices |

---

## Backlog / Future Tasks

### P0 (Critical)
- [ ] Investigate if TTS guided meditations actually play for users (browser autoplay policies)

### P1 (High Priority)
- [x] Star Lineage Quiz — 12 questions, 8 lineage results (DONE March 2026)
- [x] Retreats page redesign — elemental/womb healing modalities, CMS-managed retreats (DONE March 2026)
- [x] Video Integration — Admin CMS video uploads, PracticeVideos component on Somatic/Shamanic pages (DONE March 2026)
- [ ] Test Google OAuth end-to-end with actual browser redirect

### P2 (Medium Priority)
- [ ] Migrate hardcoded frontend data (ElementalTemples, WaterPractices) to MongoDB
- [ ] Daily Sacred Practice feature on home dashboard
- [ ] Live & Recorded courses access portal

### P3 (Low Priority / Backlog)
- [ ] Playable audio samples for Sound Frequencies page
- [ ] Community features (sharing journeys, member profiles)

---

## Architecture

```
/app/
├── backend/
│   ├── data/
│   │   ├── all_content.py (CRYSTALS, MANTRAS, ORACLE_CARDS, SOMATIC_PRACTICES)
│   │   ├── somatic_practices.py (39 somatic practices with images)
│   │   ├── ancient_wisdom_*.py (Multiple files for traditions)
│   │   ├── divination_content.py (Runes, I-Ching, Light Codes)
│   │   ├── tarot_cards.py
│   │   └── sound_frequencies.py
│   ├── routers/
│   │   ├── auth.py (Emergent OAuth integration)
│   │   ├── content.py
│   │   ├── oracle.py (Uses ORACLE_CARDS from all_content.py)
│   │   └── tts.py (OpenAI TTS integration)
│   └── server.py (DB seeding on startup)
├── frontend/
│   ├── src/
│   │   ├── pages/ (40+ pages)
│   │   ├── components/
│   │   │   ├── GuidedAudioButton.jsx (NEW - reusable TTS component)
│   │   │   └── PracticeTimer.jsx (Timer with volume control)
│   │   └── App.js
```

## Key Notes for Developers
1. **Database Seeding**: Backend drops + re-inserts collections on startup. Always restart backend after data changes.
2. **Somatic Practices**: Data is in `/app/backend/data/somatic_practices.py` (NOT all_content.py)
3. **Oracle Cards**: `oracle.py` imports `ORACLE_CARDS` from `data/all_content.py`
4. **TTS Delays**: Audio generation can take 10-20+ seconds. Always show loading indicator.
5. **GuidedAudioButton**: Drop-in component for any page needing TTS. Needs `api` prop (axios instance).

---

## CHANGELOG — March 2026 Session 2

### Star Beings & Ancient Wisdom
- Added **Cassiopeian Star Beings** and **Hydian Star People** to Galactic tradition (now 14 beings)
- Added **"Listen to Sacred Invocation"** audio button to every Ancient Wisdom entry
- Added **"Listen to Ceremony Steps"** audio button for ritual/practice sections
- Renamed "Sacred Practice" to **"Ceremony / Ritual Steps"**
- Fixed React AnimatePresence duplicate key bug that crashed the page

### Sound Healing Frequencies
- Extended AmbientSoundPlayer with 14 new synthesised sound types:
  - Dolphin chirps, Whale songs, Bird chorus, Leaves rustling
  - Harp (Karplus-Strong), Gong bath, Bells & Chimes
  - Solfeggio 528Hz, 432Hz, 396Hz, 741Hz, 852Hz
  - Didgeridoo drone, Tuning fork
- Every sound frequency now has a **Play** button in its detail view
- All sounds generated live in browser (no external audio files needed)

### Guided Audio Expansion
- Added **GuidedAudioButton** to Creative Processes (guided narration via TTS)
- Fixed label: "Sacred Practice" → "Ceremony / Ritual Steps" in Ancient Wisdom

### Images
- All 39 Somatic Practices now have images
- All 8 Wheel of Year Sabbats have images
- Oracle Cards now show images (fixed oracle.py import bug)

## CHANGELOG — March 2026 Session 3
- Password-protected portal at `/admin/login` (password: stored in ADMIN_PASSWORD env var)
- Dashboard shows all 11 content collections with live counts
- Per-section: list all entries, search, add new, edit, delete
- File upload (audio MP3, images) via object storage → public URLs
- Media Library at `/admin/manage/audio_files` — upload, preview, copy URL, delete
- Collections managed: Oracle Cards, Tarot, Ancient Wisdom, Somatic Practices, Sound Frequencies, Crystals, Mantras, Meditations, Mudras, Runes, Sacred Guardians
- Admin password: `ShamanicAdmin2026!`

### Light Codes Expansion
- Added **Galactic Codes** category (15 entries): Pleiadian, Sirian, Arcturian, Lyran, Andromedan, Venusian, Cassiopeian, Hydian, Orion, Antares, Galactic Center, Mintaka, Vegan, Spica, Galactic Federation
- Added **Chakra Activation** category (12 entries): Earth Star through Stellar Gateway — all major and transpersonal chakras
- Each new entry has rich: description, activation practice, healing purpose, daily practice, image
- Updated LightCodes.jsx modal to show "Activation Practice", "Healing Purpose", "Daily Practice" labels more richly
- Total Light Codes: 77 entries across 5 categories

### Elemental Temples Deep Expansion
- All 5 elements (Earth, Water, Fire, Air, Spirit) now have 8 section tabs:
  - Embodiment, Within You, In Nature, Practices (8 each), Rituals (4 each), **Ceremonies (2 each)**, **Blessings (5 each)**, Affirmations (8 each)
- Added **Ceremonies** section: 2 communal ceremonies per element with flow steps and closing prayers
- Added **Blessings** section: 5 sacred blessings/prayers per element with timing guidance
- Expanded **Practices** from 4 to 8 per element (added Shinrin-yoku, Stone Circle, Swimming Meditation, Kite Flying, Inner Sun visualization, etc.)
- Expanded **Affirmations** from 4 to 8 per element
- Added 2 more **Rituals** per element (Earth: Crystal Grid, Ancestral; Water: Ancestors, New Moon; Fire: Shadow Burning, Passion; Air: Dawn Awakening, Truth Speaking; Spirit: Vigil, Five Element Integration)


## CHANGELOG — March 2026 Session 4 (P1 Features)

### Star Lineage Quiz
- 12-question quiz at `/star-lineage` to discover your star lineage
- 8 possible results: Pleiadian, Sirian, Arcturian, Lyran, Andromedan, Venusian, Cassiopeian, Hydian
- Each result includes: description, gifts, mission, recommended practices, sacred challenge, secondary lineage
- Scoring system tallies lineage points across all answers
- Retake Quiz functionality to try again

### Retreats Page Redesign
- Redesigned `/retreats` page with hero section and healing modality showcase
- **Elemental Healing** section: 5-element healing work descriptions with expandable practice details
- **Womb Healing** section: sacred feminine restoration work with practice descriptions
- Retreat cards now fetched dynamically from MongoDB via Admin CMS
- Detail modal with rich information display (location, dates, price, highlights, includes, accommodation)
- Admin CMS: `retreats` collection added with full field config (title, status, location, dates, price, highlights, includes, healing_modalities, registration_link, etc.)

### Video Integration
- New `videos` collection in Admin CMS for managing practice videos
- Admin can add videos with: title, category (somatic/shamanic), video_url (YouTube/Vimeo/direct), thumbnail, duration
- **PracticeVideos** reusable component (`/app/frontend/src/components/PracticeVideos.jsx`)
- Supports YouTube embeds, Vimeo embeds, and direct .mp4 video URLs
- Auto-generates YouTube thumbnails from video ID
- Video player modal with autoplay
- Added to Somatic Movement page (category: somatic)
- Added to Shamanic Practices page (category: shamanic)
- Videos section automatically hides when no videos exist in category

### Backend API Additions
- `GET /api/retreats` — list all retreats (optional `?status=` filter)
- `GET /api/retreats/{id}` — get single retreat
- `GET /api/videos` — list all videos (optional `?category=` filter)
- `GET /api/videos/{id}` — get single video
- Admin CRUD for both `retreats` and `videos` collections

### Enhancements (Session 4 continued)

#### Share Your Star Lineage
- Shareable URL: `/star-lineage/result/:lineageId` (e.g. `/star-lineage/result/pleiadian`)
- Share modal with WhatsApp, Twitter/X, Facebook, Email, Copy link
- Shared result shows CTA: "Discover Your Own Star Lineage" → takes quiz
- Each of 8 lineages has a unique shareable link

#### Links Page (Linktree-style)
- `/links` — Beautiful organized page with all app sections
- 5 sections: Discover Your Path, Divination & Guidance, Movement & Healing, Sacred Spaces, Sacred Journeys
- 23 total links to all major features

#### App Store Ready (PWA)
- Generated icons in all required sizes: 16, 32, 72, 96, 128, 144, 152, 167, 180, 192, 384, 512, 1024
- Sacred geometry lotus icon (golden on dark blue)
- Updated `manifest.json` with full icon set, shortcuts, and metadata
- Apple touch icons for iOS, Open Graph tags for social sharing
- App Store guide at `/app/APP_STORE_GUIDE.md`



