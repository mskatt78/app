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
- **Light Codes** (75 AI-generated sacred geometry) ✅

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
- [ ] Admin CMS improvements - full content upload capability
- [ ] Test Google OAuth end-to-end with actual browser redirect

### P2 (Medium Priority)
- [ ] Video integration for practices
- [ ] Workshops / Playshops with socials / retreats page
- [ ] Live & Recorded courses access portal

### P3 (Low Priority / Backlog)
- [ ] Playable audio samples for Sound Frequencies page
- [ ] More somatic practices with videos
- [ ] Community features (sharing journeys)

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
