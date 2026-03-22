# Shamanic Elements — Temple of the Soul
## Product Requirements Document

**App Name:** Shamanic Elements Temple Of The Soul  
**Stack:** React (frontend) · FastAPI (backend) · MongoDB (database)  
**Status:** Production-ready  
**Last Updated:** March 22, 2026

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
- [x] **Water Practices** `/water-practices` — 4 categories: Water Blessing, Crystalline Activation, Energy Cleansing, Moon Water with 12+ practices based on Dr. Emoto's research

### Wisdom Systems (NEW - Mar 2026)
- [x] **Gene Keys** `/gene-keys` — Complete 64 Gene Keys library with Shadow/Gift/Siddhi, Golden Path sequences (Activation, Venus, Pearl), contemplation tools, searchable grid
- [x] **Human Design** `/human-design` — 5 Energy Types (Generator, Manifesting Generator, Projector, Manifestor, Reflector), 9 Centers, key Gates, experiment guide
- [x] **Profile Calculator** `/profile-calculator` — Birth data input calculates personal Gene Keys Activation Sequence and Human Design type with full astrological calculations

### Daily Sacred Practice Widget (NEW - Mar 2026)
- [x] **Sacred Practice of the Day** on Main Menu — real-time date-aware widget:
  - Moon phase (calculated from actual date, hemisphere-aware mirror)
  - Element of the day (planetary day correspondences Sun→Fire, Mon→Water etc.)
  - Crystal of the day (matched to element, rotates daily)
  - Oracle message of the day (52 curated shamanic messages, rotates by day of year)
  - Practice recommendation linked to moon phase energy


### Partner & Accessible Yoga (Updated Mar 22, 2026)
- [x] **Partner Yoga** page with 8 partner poses, difficulty filter, detailed instructions
- [x] **Real yoga pose images** on every Partner Yoga card and modal (authentic Pexels/Unsplash photos)
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
│   │   └── divination_content.py # Runes, I Ching, Light Codes
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
        │   ├── RoseTemple.jsx  # Women's sacred space
        │   ├── ElementalTemples.jsx  # 5 element temples
        │   ├── MasculineTemple.jsx   # Men's embodiment
        │   ├── PartnerYoga.jsx       # Partner yoga poses
        │   ├── WaterPractices.jsx    # Water blessing & crystalline [NEW]
        │   ├── GeneKeys.jsx          # 64 Gene Keys system [NEW]
        │   ├── HumanDesign.jsx       # Human Design system [NEW]
        │   ├── YogaLibrary.jsx # + Mobility filter + Partner Yoga banner
        │   └── PrivacyPolicy.jsx
        └── components/
            └── TopNav.jsx      # Navigation component
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
- [x] **Water Practices** `/water-practices` - NEW comprehensive water wisdom page:
  - 4 Categories: Water Blessing, Crystalline Activation, Energy Cleansing, Moon Water
  - 12+ practices including Intention Water Blessing, Gratitude Water Ritual, Prayer Over Water
  - Crystalline Water Activation with sacred geometry and frequencies (528Hz, 432Hz, etc.)
  - Chakra Cleansing Water with 7 chakra correspondences
  - Full Moon, New Moon, and Eclipse Water rituals
  - Based on Dr. Masaru Emoto's water memory research
  - Added to Main Menu under Sacred Temples
- [x] **Gene Keys** `/gene-keys` - NEW wisdom system page:
  - Complete 64 Gene Keys library with Shadow/Gift/Siddhi for each key
  - 4 Tabs: Overview, 64 Gene Keys (searchable grid), Golden Path, Contemplation
  - Three Sequences (Activation, Venus, Pearl) with sphere explanations
  - Draw Today's Gene Key random selection feature
  - DNA codon information for each key
  - Based on Richard Rudd's Gene Keys system
- [x] **Human Design** `/human-design` - NEW wisdom system page:
  - 5 Energy Types: Generator, Manifesting Generator, Projector, Manifestor, Reflector
  - Detailed info: Strategy, Aura, Signature, Not-Self Theme, Key Traits, Deconditioning
  - 9 Centers with defined/undefined explanations
  - 13 Key Gates with meanings
  - Your Experiment guide for living your design
  - Based on Ra Uru Hu's Human Design System
- [x] **Previous Session Work** (preserved):
  - Healing Modalities in Heart Practices (4 modalities)
  - Sunrise & Sunset Practices (9 practices)
  - Journal Types (Moon, Dream, Personal)
  - Custom Mantras feature

### P1 (High)
- Gifting Frontend UI — backend complete, needs purchase/redeem UI

### P2 (Medium)
- Session history sync across devices
- Additional content for new temples

### P3 (Future / Nice-to-Have)
- More Shamanic/Elemental content

---

## Features Verified Working (Mar 22, 2026)
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
- ✅ Water Practices (4 categories, 12+ practices, TTS guided audio)
- ✅ Gene Keys (64 keys with Shadow/Gift/Siddhi, Golden Path, Contemplation)
- ✅ Human Design (5 types, 9 centers, 64 gates, detailed modals)
- ✅ Profile Calculator (Gene Keys Activation Sequence + Human Design type from birth data)
- ✅ Progress Dashboard (visual tracking, element balance, achievements)
- ✅ Share to Social Media (Twitter, Facebook, WhatsApp, Email, Copy Link)
- ✅ Notification System (Moon phase alerts, daily wisdom, practice reminders, browser push)
- ✅ Offline Mode (Service worker caching for offline access)
- ✅ **Partner Yoga** — 8 poses with real yoga photos on cards & modal (NEW Mar 22)
- ✅ **Light Codes** — 75 symbols with authentic thematic images (no generic placeholders) (UPDATED Mar 22)

---

## Deployment Notes
- **Custom Domain:** https://temple-soul-dev.emergent.host (KEEP THIS)
- Use "Replace Existing Deployment" in Emergent to push updates
- Do NOT create duplicate deployments — this confuses users testing on stale URLs
- Preview URL: https://sacred-elements.preview.emergentagent.com
