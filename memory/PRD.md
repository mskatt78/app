# Shamanic Elements — Temple of the Soul
## Product Requirements Document

**App Name:** Shamanic Elements Temple Of The Soul  
**Stack:** React (frontend) · FastAPI (backend) · MongoDB (database)  
**Status:** Production-ready  

---

## Original Problem Statement
Build a full-stack spiritual wellness platform featuring yoga, somatic movements, oracle readings, breathwork, and meditations. The app serves both guest and authenticated users, with rich multimedia content and sacred feminine/masculine teachings.

---

## User Personas
- **Primary:** Women seeking sacred feminine wisdom, Rose Lineage teachings, embodiment practices
- **Secondary:** Men seeking embodied masculine practices and initiation wisdom
- **Tertiary:** General spiritual seekers wanting yoga, breathwork, meditation, crystals

---

## Core Requirements (All Implemented)

### Authentication
- [x] Google OAuth (Emergent-managed)
- [x] Email/password auth
- [x] Guest mode (no account required for most content)

### Content Library
- [x] 78 Yoga poses (auto-seeded from MongoDB)
- [x] 39 Somatic practices
- [x] 42 Crystals
- [x] Breathwork with Hz frequency Web Audio API
- [x] Oracle card readings (guest + authenticated)
- [x] Meditations with chunked TTS audio (OpenAI via Emergent LLM Key)

### Sacred Temples (NEW - Feb 2026)
- [x] **Rose Temple** — Ancient Rose Lineage, Mary Magdalene, Sophia, feminine embodiment practices
- [x] **Elemental Temples** — Earth, Water, Fire, Air, Spirit — each with embodiment, inner/outer, nature practices, affirmations
- [x] **Masculine Temple** — Warrior, King, Magician, Lover, Ancestral Connection archetypes

### Partner & Accessible Yoga (NEW - Feb 2026)
- [x] **Partner Yoga** page with 8 partner poses, difficulty filter, detailed instructions
- [x] **Mobility Accessible Filter** in Yoga Library (Beginner-only filter for accessibility)
- [x] Partner Yoga banner in Yoga Library with direct link

### Time Zone
- [x] **QLD AEST time** (UTC+10, no DST) shown in nav header for all users
- Shows "HH:MM QLD" with clock icon; tooltip shows user's local time

### PWA / App Store
- [x] manifest.json configured for PWABuilder/Google Play Store
- [x] PrivacyPolicy.jsx page for App Store submission
- [x] GOOGLE_PLAY_PUBLISHING.md guide

### Audio (Bug Fixes Feb 2026)
- [x] Breathwork: AudioContext fully closed on component unmount (stops Hz tones when navigating away)
- [x] Meditations: Audio paused and src cleared on component unmount

---

## Architecture

```
/app/
├── backend/
│   ├── .env
│   ├── requirements.txt
│   ├── server.py               # Auto-seeding on startup
│   ├── data/
│   │   └── all_content.py      # Master seed content
│   │   └── yoga_poses.py       # 78 yoga poses
│   └── routers/
│       ├── auth.py
│       ├── tts.py              # Chunked audio generation
│       ├── oracle.py           # Guest oracle endpoint
│       └── ...
└── frontend/
    ├── public/
    │   └── manifest.json       # PWA manifest
    └── src/
        ├── App.js              # Routes
        ├── pages/
        │   ├── MainMenu.jsx    # Central hub with all categories
        │   ├── Breathwork.jsx  # Web Audio API Hz frequencies
        │   ├── Meditations.jsx # TTS audio meditations
        │   ├── RoseTemple.jsx  # Women's sacred space [NEW]
        │   ├── ElementalTemples.jsx  # 5 element temples [NEW]
        │   ├── MasculineTemple.jsx   # Men's embodiment [NEW]
        │   ├── PartnerYoga.jsx       # Partner yoga poses [NEW]
        │   ├── YogaLibrary.jsx # + Mobility filter + Partner Yoga banner
        │   └── PrivacyPolicy.jsx
        └── components/
            └── TopNav.jsx      # + QLD time clock widget
```

---

## Key API Endpoints
- `POST /api/tts/meditation/{id}` — Chunked audio generation
- `GET /api/oracle/reading/guest` — Unauthenticated oracle
- `GET /api/breathwork/sessions` — Breathwork data with Hz frequencies
- `GET /api/yoga/poses` — 78 yoga poses
- `GET /api/crystals` — Crystal library
- `POST /api/auth/login` — Email/password login

---

## 3rd Party Integrations
| Service | Purpose | Key Type |
|---------|---------|----------|
| OpenAI TTS | Long-form meditation audio | Emergent LLM Key |
| Google OAuth | Authentication | Emergent-managed |
| Resend | Emails | User API Key (graceful fallback) |

---

## Prioritized Backlog

### P0 (Critical)
- None currently outstanding

### P1 (High)
- Gifting Frontend UI — backend complete, needs purchase/redeem UI
- Equinox Rituals content (seasonal)
- Earth Crafting content (seasonal)
- More Shamanic/Elemental content  

### P2 (Medium)
- Audio state management refactor to React Context
- Additional content for new temples

### P3 (Future / Nice-to-Have)
- World timezone converter (dropdown to see QLD time mapped to any timezone)
- Seasonal/moon-aware content recommendations
- Session history and favorites sync across devices

---

## Testing Status
- Last test run: `iteration_25.json` — 100% pass rate (all 11 features)
- Backend tests: iteration_24.json — 100% pass
- No known regressions

---

## Deployment Notes
- Use "Replace Existing Deployment" in Emergent to push to custom domain
- Do NOT create duplicate deployments — this confuses users testing on stale URLs
- Preview URL: https://breathwork-hub-3.preview.emergentagent.com
