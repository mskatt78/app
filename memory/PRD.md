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
- 13 practices via /api/feminine-embodiment:
  - **Womb Wisdom**: Womb Awakening & Healing
  - **Sensuality**: Sacred Sensuality Awakening
  - **Lunar Wisdom**: Moon Cycle Attunement, Moon Lodge Retreat
  - **Divine Feminine**: Goddess Embodiment Ritual
  - **Rose Mysteries**: Rose Lineage Meditation
  - **Body Love**: Sacred Body Blessing, Breast & Heart Healing
  - **Sacred Sexuality**: Yoni Honoring Practice
  - **Self-Love**: Mirror of Love Practice
  - **Priestess**: Priestess Path Initiation
  - **Sisterhood**: Sisterhood Circle Practice
  - **Wild Feminine**: Wild Woman Awakening
- Temple intro: "Your Body is the Rose Temple" with 4 principles

### Masculine Embodiment (Masculine Temple)
- 13 practices via /api/masculine-embodiment:
  - **Warrior**: Sacred Warrior Activation
  - **King**: Heart-Centered King Practice
  - **Lover**: Sacred Lover Embodiment
  - **Sage**: Inner Sage & Magician Practice
  - **Father**: Healing & Embodying Father Energy
  - **Body Wisdom**: Body Honoring Practice
  - **Sacred Sexuality**: Sacred Masculine Sexuality
  - **Wild Man**: Wild Man Awakening
  - **Heart Warrior**: Tender Warrior Practice
  - **Brotherhood**: Brotherhood Circle Practice
  - **Elder**: Seeking the Elder Within
  - **Nature**: Wild Nature Immersion
  - **Shadow**: Men's Grief Ritual
- Temple intro: "Your Body is the Temple" with 4 principles

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
- **2026-03-26 (Session 2)**: ✅ COMPLETED - Practice Journal Feature:
  - New `/practice-journal` page with full journaling capabilities
  - Comprehensive entry fields: mood before/after, body sensations, spiritual downloads, intentions, key insights, reflection
  - Moon phase auto-tagging on all entries
  - Practice streak counter (consecutive days tracked)
  - LocalStorage persistence (no login required)
  - Filter by practice type + search functionality
  - "Journal This" button integrated in ChakraCleansing, RoseTemple, MasculineTemple modals
  - Added to Main Menu under Self-Healing section
  - Testing Agent verified: 100% frontend tests pass (15/15 features)

- **2026-03-26 (Session 2)**: ✅ COMPLETED - Deepened ALL remaining content:
  - Extended Chakras: Causal (3425 chars), Stellar Gateway (4762 chars), Universal Gateway (4544 chars) now have rich philosophical teachings including shadow work, somatic practices, and spiritual principles
  - All 13 Feminine Embodiment practices now have deeper_teaching content (Sacred Sensuality, Moon Cycle, Goddess Embodiment, Rose Lineage, Body Blessing, Breast/Heart Healing, Yoni Honoring, Mirror Love, Priestess Path, Moon Lodge, Sisterhood Circle, Wild Woman)
  - All 13 Masculine Embodiment practices now have deeper_teaching content (Heart King, Sacred Lover, Sage/Magician, Father Energy, Body Honoring, Sacred Sexuality, Wild Man, Tender Warrior, Brotherhood Circle, Elder, Nature Immersion)
  - Testing Agent verified: 100% backend tests pass, 100% frontend tests pass
- **2026-03-26 (Session 1)**: Built Daily Sacred Practice feature with moon phase + day of week themes
- **2026-03-26 (Session 1)**: Deepened primary chakras (Root, Sacral, Solar, Heart, Throat, Third Eye, Crown, Earth Star, Soul Star, Higher Heart)
- **2026-03-26 (Session 1)**: All 13 chakras now have unique images (AI + stock)
- **2026-03-26 (Session 1)**: Enhanced Rose Temple & Masculine Temple with "Body as Temple" philosophy

## Backlog / Future Tasks

### P1 (High Priority)
- [x] ~~Deepen all chakra and embodiment content~~ ✅ COMPLETED
- [x] ~~Practice Journal feature~~ ✅ COMPLETED
- [ ] Deploy application for stable URL (user has requested)

### P2 (Medium Priority)
- [ ] Generate unique AI images for extended chakras (Causal, Stellar Gateway, Universal Gateway - currently using placeholder images)
- [ ] Migrate hardcoded frontend data (ElementalTemples, WaterPractices) to MongoDB
- [ ] Add video tutorials for somatic practices

### P3 (Low Priority / Backlog)
- [ ] Community reflection sharing for embodiment practices
- [x] ~~Practice streaks/journaling integration~~ ✅ COMPLETED (Part of Practice Journal)
- [ ] Seed initial Sacred Geometry drawing guides into CMS
- [ ] Video tutorials for somatic practices

## Technical Notes
- All pages use React.lazy() for code-splitting (CRITICAL for performance)
- AI images generated via Gemini Nano Banana (rate limited: 20/min)
- TTS uses OpenAI with 4-part chunking to avoid timeout
- Backend uses Motor async MongoDB driver

## Admin Access
- URL: /admin/login
- Password: Set via ADMIN_PASSWORD in backend .env
