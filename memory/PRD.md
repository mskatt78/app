# Shamanic Elements Soul Temple 2.0 — Product Requirements Document

## Overview
A comprehensive full-stack spiritual wellness application featuring yoga, somatic movements, oracle readings, breathwork, meditations, shamanic practices, elemental healing, and advanced healing modalities. Built with React, FastAPI, and MongoDB.

## Tech Stack
- **Frontend:** React, Framer Motion, Tailwind CSS, Shadcn/UI
- **Backend:** FastAPI, MongoDB (Motor Async)
- **Auth:** Google OAuth (Emergent-managed) + Custom JWT Admin Auth
- **Integrations:** OpenAI TTS, Gemini Image Gen (Nano Banana), Emergent Object Storage
- **PWA:** Full manifest with app store ready icons

## Core Features (All Implemented)

### Self-Healing & Energy Work (NEW)
- **Energy Healing** (/energy-healing) - 9 modalities with AI images:
  - Usui Reiki, Kundalini Reiki
  - Shamanic Energy Healing
  - Pranic Healing
  - **Sekhem Egyptian Healing** (Ancient Egyptian healing art)
  - **Aboriginal Dreamtime Healing** (Australian 65,000+ year tradition)
  - Crystal Healing Therapy
  - Sound Bath Healing
  - Quantum Healing
- **Chakra Cleansing** (/chakra-cleansing) - Full 13-chakra system:
  - Earth Star (below feet) - Gaia consciousness
  - Root, Sacral, Solar Plexus, Heart (main 4)
  - Higher Heart/Thymus - Unconditional love
  - Throat, Third Eye, Crown (upper 3)
  - Causal - Divine feminine, past lives
  - Soul Star - Higher Self connection
  - Stellar Gateway - Galactic origins
  - Universal Gateway - Source connection
- **Free Form Movement** (/free-form-movement) - 3 practices:
  - Ecstatic Dance Liberation
  - Primal Shake & Release
  - Intuitive Flow Journey
- **Somatic Yoga** (/somatic-yoga) - 5 body-centered practices:
  - Trauma Release Somatic Flow
  - Restorative Somatic Yoga
  - Grounding Somatic Flow
  - Hip Release & Emotional Freedom
  - Neck & Shoulder Stress Release

### Feminine Embodiment (Rose Temple)
- 5 practices via /api/feminine-embodiment:
  - Womb Awakening & Healing
  - Sacred Sensuality Awakening
  - Moon Cycle Attunement
  - Goddess Embodiment Ritual
  - Rose Lineage Meditation

### Masculine Embodiment (Masculine Temple)
- 5 practices via /api/masculine-embodiment:
  - Sacred Warrior Activation
  - Heart-Centered King Practice
  - Sacred Lover Embodiment
  - Inner Sage & Magician Practice
  - Healing & Embodying Father Energy

### Divination & Guidance
- Oracle Card Readings (with AI-generated images)
- 22 Major Arcana Tarot
- Rune Readings (Elder Futhark)
- I Ching (64 Hexagrams)
- Light Codes (Sacred Geometry, Ancient Alphabets, Light Language, Galactic Codes)

### Movement & Healing
- Yoga Library (78 poses by element)
- Somatic Movement (with practice videos support)
- Breathwork (6 guided sessions)
- Shamanic Practices (21 practices with drums, auto-start)
- Grounding Practices, Heart Practices, Creative Processes, Sunrise/Sunset Practices

### Sacred Spaces
- Elemental Temples (Earth, Water, Fire, Air, Spirit)
- Rose Temple (Feminine wisdom)
- Masculine Temple
- Water Practices (ceremonies & rituals)
- Sound Frequencies (whale songs, singing bowls, drums)
- Crystal Guide (42 crystals with AI images)
- Mantras Library (108 rep chanting timer)

### Discovery & Profiles
- Star Lineage Quiz, Birth Chart Calculator, Numerology
- Gene Keys, Human Design
- Sacred Guardians (37 spirit guides), Ancient Wisdom (108 teachings)

### Learn & Connect
- Courses Portal (/courses) - Nusta Karpay, Munay Ki, 13th Rite of the Womb
- Community Sacred Circle (/community)
- Retreats & Events

### Admin CMS
- JWT-based admin auth
- 29+ content collections manageable
- CRUD operations, Object Storage integration

## Key Pages & Routes
| Route | Page |
|-------|------|
| /energy-healing | Energy Healing Modalities |
| /chakra-cleansing | 13-Chakra Cleansing |
| /free-form-movement | Free Form Movement |
| /somatic-yoga | Somatic Yoga |
| /courses | Courses Portal |
| /community | Sacred Circle |
| /oracle | Oracle Readings |
| /tarot | Tarot Reading |
| /shamanic | Shamanic Practices |
| /yoga | Yoga Library |
| /meditations | Guided Meditations |
| /crystals | Crystal Guide |
| /admin | Admin Dashboard |

## API Endpoints (New)
- GET /api/energy-healing, /api/energy-healing/:id
- GET /api/chakra-cleansing, /api/chakra-cleansing/:id
- GET /api/free-form-movement
- GET /api/somatic-yoga, /api/somatic-yoga/:id
- GET /api/feminine-embodiment
- GET /api/masculine-embodiment

## Recent Changes
- **2026-03-26**: Added 13-chakra system (Earth Star → Universal Gateway)
- **2026-03-26**: Added Energy Healing with Egyptian Sekhem & Australian Aboriginal modalities
- **2026-03-26**: Created separate Somatic Yoga page & API (5 practices)
- **2026-03-26**: Added Free Form Movement practices (Ecstatic Dance, Primal Shake, Intuitive Flow)
- **2026-03-26**: Added Feminine Embodiment practices (Womb, Sensuality, Moon, Goddess, Rose)
- **2026-03-26**: Added Masculine Embodiment practices (Warrior, King, Lover, Sage, Father)
- **2026-03-26**: Updated chakra images with unique AI-generated visuals (throat, third eye)
- **2026-03-26**: Fixed React.lazy() code-splitting for 65+ routes (performance)

## Backlog / Future Tasks

### P1 (High Priority)
- [ ] Generate unique AI images for remaining chakras (Crown, Earth Star, Soul Star, Stellar, Universal, Causal, Higher Heart)
- [ ] Add more modalities to feminine embodiment (Priestess, Moon Lodge, etc.)
- [ ] Add more modalities to masculine embodiment (Wild Man, Mentor, etc.)

### P2 (Medium Priority)
- [ ] Migrate hardcoded frontend data (ElementalTemples, WaterPractices) to MongoDB
- [ ] Daily Sacred Practice feature on home dashboard
- [ ] Connect feminine embodiment to Rose Temple page
- [ ] Connect masculine embodiment to Masculine Temple page

### P3 (Low Priority / Backlog)
- [ ] Seed initial Sacred Geometry drawing guides into CMS
- [ ] Add video tutorials for somatic practices

## Technical Notes
- All pages use React.lazy() for code-splitting (CRITICAL for performance)
- AI images generated via Gemini Nano Banana (rate limited: 20/min)
- TTS uses OpenAI with 4-part chunking to avoid timeout
- Backend uses Motor async MongoDB driver

## Admin Access
- URL: /admin/login
- Password: Set via ADMIN_PASSWORD in backend .env
