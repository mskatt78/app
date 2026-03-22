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

### Sacred Temples (NEW - Feb/Mar 2026)
- [x] **Rose Temple** — 6 portals: Rose Lineage, Rose Meditations, Feminine Embodiment, Rose Ceremonies, Rose Rituals & Embodiment (5 full ceremonies), Ancient Women's Teachings
- [x] **Elemental Temples** — Earth, Water, Fire, Air, Spirit — 6 tabs each incl. Rituals 🙏 (2 ceremonies per element)
- [x] **Masculine Temple** — Warrior, King, Magician, Lover, Ancestral — 3-tab modal with full Ritual 🙏 ceremony per archetype
- [x] **Wheel of the Year** `/seasonal-temple` — 8 Sabbats (Samhain, Yule, Imbolc, Ostara, Beltane, Litha, Lughnasadh, Mabon) with full ritual, embodiment, crystals/herbs tabs; North/South hemisphere toggle; Earth Crafting section (5 practices)

### Daily Sacred Practice Widget (NEW - Mar 2026)
- [x] **Sacred Practice of the Day** on Main Menu — real-time date-aware widget:
  - Moon phase (calculated from actual date, hemisphere-aware mirror)
  - Element of the day (planetary day correspondences Sun→Fire, Mon→Water etc.)
  - Crystal of the day (matched to element, rotates daily)
  - Oracle message of the day (52 curated shamanic messages, rotates by day of year)
  - Practice recommendation linked to moon phase energy


### Partner & Accessible Yoga (NEW - Feb 2026)
- [x] **Partner Yoga** page with 8 partner poses, difficulty filter, detailed instructions
- [x] **Mobility Accessible Filter** in Yoga Library (Beginner-only filter for accessibility)
- [x] Partner Yoga banner in Yoga Library with direct link

### Moon Calendar & Timezone (Updated Feb 2026)
- [x] QLD time removed from nav (moved to proper context — Astrology/Moon Calendar)
- [x] **Hemisphere toggle** (Southern 🌿 / Northern ☀️) in AstrologyCalendar — auto-detects from browser timezone
- [x] **World timezone dropdown** — 43 timezones grouped by hemisphere with live local time display

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

### Completed This Session (Mar 2026)
- [x] **Healing Modalities** in Heart Practices:
  - Meridian Therapy Flow (35 min) - Traditional Chinese Medicine & Shamanic Integration
  - Trauma-Informed Somatic Shedding (40 min) - Somatic Experiencing & Indigenous Healing Practices
  - Shamanic Healing Journey (45 min) - Core Shamanism & Global Indigenous Traditions
  - Energy Sweeping & Aura Cleansing (25 min) - Curanderismo, Reiki & Shamanic Clearing
- [x] **Sunrise & Sunset Practices** - New dedicated page `/sunrise-sunset`:
  - 4 Sunrise Practices: Sun Salutation Awakening, Dawn Breathwork Ritual, Morning Earth Connection, Sacred Morning Pages
  - 5 Sunset Practices: Evening Gratitude Ceremony, Twilight Body Scan, Moon Water Blessing, Evening Star Meditation, Shedding Fire Ritual
  - All "release" language changed to "shed" (energy doesn't return)
  - Added to Main Menu under Sacred Temples
- [x] **Journal Types** - Enhanced Journal page with 3 specialized types:
  - Moon Journal: Track lunar cycles, moon phases, intentions
  - Dream Journal: Record dreams, symbols, subconscious messages
  - Personal Diary: Daily reflections, gratitude, insights
  - Filter tabs to view by journal type
- [x] **Custom Mantras** - "Write Your Own Mantras" feature:
  - Create, edit, delete personal mantras
  - Categories: Personal Power, Healing, Abundance, Protection, Love
  - Optional element association
  - Notes field for context
  - New "My Mantras" tab in Mantras Library

### P1 (High)
- Gifting Frontend UI — backend complete, needs purchase/redeem UI

### P2 (Medium)
- Audio state management refactor to React Context
- Additional content for new temples
- Session history sync across devices

### P3 (Future / Nice-to-Have)
- Seasonal/moon-aware content recommendations
- More Shamanic/Elemental content

---

## Features Verified Working (Mar 2026)
- ✅ World Timezone Converter (in Astrology Calendar)
- ✅ Hemisphere Toggle (Southern/Northern)
- ✅ Practice History logging (all practice pages)
- ✅ Audio cleanup on unmount (Breathwork, Meditations)
- ✅ All 4 Healing Modalities in Heart Practices
- ✅ All 9 Sunrise/Sunset Practices
- ✅ All Sacred Temples (Rose, Elemental, Masculine, Seasonal)
- ✅ Journal system (Moon, Dream, Personal)
- ✅ Mantras Library with audio
- ✅ Daily Practice Widget

---

## Deployment Notes
- **Custom Domain:** https://temple-soul-dev.emergent.host (KEEP THIS)
- Use "Replace Existing Deployment" in Emergent to push updates
- Do NOT create duplicate deployments — this confuses users testing on stale URLs
- Preview URL: https://shamanic-soul-temple.preview.emergentagent.com
