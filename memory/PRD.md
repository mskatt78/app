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

### Self-Healing & Energy Work
- **Energy Healing** (/energy-healing) - 9 modalities with AI images
- **Chakra Cleansing** (/chakra-cleansing) - Full 13-chakra system with deep teachings
- **Free Form Movement** (/free-form-movement) - 3 practices
- **Somatic Yoga** (/somatic-yoga) - 5 body-centered practices

### Feminine Embodiment (Rose Temple)
- 13 practices via /api/feminine-embodiment with comprehensive deep teachings:
  - Each practice now includes "Why This Heals", "Practice Guide", "Extended Teachings", and "Benefits"
  - Full spiritual wisdom explaining the healing purpose of each practice
- **Sacred Rites Section** (NEW - March 2026):
  - Munay Ki — The 9 Great Rites of Initiation
  - Nusta Karpay — The 7 Goddess Rites of the Divine Feminine
  - The 13th Rite of the Womb — The Rite of the Womb
- Temple intro: "Your Body is the Rose Temple" with 4 principles

### Masculine Embodiment (Masculine Temple)
- 13 practices via /api/masculine-embodiment with comprehensive deep teachings:
  - Each practice now includes "Why This Heals", "Practice Guide", "Extended Teachings", and "Benefits"
  - Archetypes: Warrior, King, Magician/Sage, Lover, Wild Man, Elder
- Temple intro: "Your Body is the Temple" with sacred masculine principles

### Breathwork Sessions
- 6 elemental breathwork sessions via /api/breathwork/sessions
- Each session now includes "Why This Heals", "Full Instructions", and "Best Time"
- Interactive breathing circle with sound frequencies
- Pattern-based timing (inhale, hold, exhale, hold_empty)

### Practice Journal (NEW - Previous Session)
- Moon phase tracking
- Practice streak tracking
- Quick-add buttons on practice modals
- Local storage for offline access

### Meditations & Guided Audio
- TTS audio generation using OpenAI
- Optimized streaming: Part 1 plays instantly while Parts 2-4 load in background
- Multiple meditation types across all temple sections

### Other Features
- Yoga Library (78 poses, 5 elements)
- Mudras Library (12 mudras, 90% opacity images)
- Crystal Healing (42 crystals)
- Tarot/Oracle readings
- Sacred Geometry
- Sound Frequencies

## Recent Updates (March 2026)

### Bug Fixes (Latest)
- **Mudra Images Fixed**: All 12 mudras now have unique verified Pexels/Unsplash images. DB reseeded.
- **Heart Practices Black Screen Fixed**: Replaced complex PracticeTimer+GuidedAudioButton combo with simple clean step-by-step guided view. Also fixed field name normalization (steps/ceremony_steps/meditation_steps/journey_steps/ritual_steps/visualization_steps) and affirmation/affirmations plural handling.
- **Sacred Rites Now in Courses**: Munay Ki, Nusta Karpay, 13th Womb Rite confirmed visible at /courses page with full content.
- **Sacred Circle Awakening Populated**: 5 community posts added covering Munay Ki, 13th Womb Rite, Nusta Karpay, Welcome message, and Shamanic Calling.
- **server.py Bug Fixed**: Undefined `minimal_seed()` replaced with `seed_all_content()`. Community posts added to startup seeding.


### P2 Features Complete (Latest)
- **All 13 Chakra Images Unique**: All chakra images replaced with unique stock photos. Updated seed_healing_modalities.py and seed_extended_modalities.py.
- **Elemental Temples Migrated**: 853 lines of hardcoded JSX → MongoDB `elemental_temples` + `/api/elemental-temples`. Frontend fetches API with STATIC_ELEMENTS fallback.
- **Water Practices Migrated**: 473 lines of hardcoded JSX → MongoDB `water_practices` + `/api/water-practices`. Frontend shows loading skeleton while fetching.
- New data files: `/app/backend/data/elemental_temples_data.py`, `/app/backend/data/water_practices_data.py`


### Deep Content Enhancement
All practices throughout the app have been enhanced with comprehensive spiritual teachings that explain WHY each practice heals:

1. **Feminine Embodiment** (13 practices) - Full "Why This Heals", extended teachings, practice guides
2. **Masculine Embodiment** (13 practices) - Full "Why This Heals", extended teachings, practice guides
3. **Chakra Cleansing** (13 chakras) - "Why This Heals", deeper teachings, healing practices, affirmations
4. **Breathwork** (6 sessions) - "Why This Heals", full instructions, best time recommendations

### Sacred Rites Restored
The Munay Ki, Nusta Karpay, and 13th Womb Rite are now visible in Rose Temple with their full detailed teachings. These were present in the database but not displayed - now they have a dedicated "Sacred Rites & Initiations" section.

### Database Seeding
All deep teachings are now included in the server.py startup seeding, ensuring production deployments have full content.

## API Endpoints

### Core Content
- GET /api/yoga/poses - 78 yoga poses
- GET /api/mudras - 12 mudras
- GET /api/chakra-cleansing - 13 chakras with deep teachings
- GET /api/breathwork/sessions - 6 sessions with deep teachings
- GET /api/feminine-embodiment - 13 practices with deep teachings
- GET /api/masculine-embodiment - 13 practices with deep teachings
- GET /api/sacred-rites - Munay Ki, Nusta Karpay, 13th Womb Rite

### TTS Audio
- POST /api/tts/meditation/{id} - Generates chunked base64 audio

### Other
- GET /api/meditations
- GET /api/crystals
- GET /api/oracle/tarot

## Files of Reference

### Data Files (Deep Teachings)
- `/app/backend/data/deep_teachings_complete.py` - Feminine & Masculine embodiment deep teachings
- `/app/backend/data/deep_teachings_chakras_breath.py` - Chakra & Breathwork deep teachings
- `/app/backend/data/complete_embodiment_data.py` - Base embodiment practice data

### Frontend Pages
- `/app/frontend/src/pages/RoseTemple.jsx` - Feminine embodiment with Sacred Rites
- `/app/frontend/src/pages/MasculineTemple.jsx` - Masculine embodiment
- `/app/frontend/src/pages/ChakraCleansing.jsx` - 13 chakras
- `/app/frontend/src/pages/Breathwork.jsx` - Breathwork sessions

### Backend
- `/app/backend/server.py` - Startup seeding with deep teachings
- `/app/backend/routers/content.py` - API endpoints including /sacred-rites

## Deployment Notes

### Database Seeding
The server automatically seeds all content on startup including:
1. Base content (yoga, mudras, chakras, breathwork, meditations)
2. Deep teachings (why_this_heals, practice_guide, extended_teachings)
3. Sacred rites (Munay Ki, Nusta Karpay, 13th Womb Rite)

### Preview vs Production
- Preview and production use DIFFERENT databases
- After deployment, the production server restarts and seeds the production database
- All content should appear after successful deployment

## Upcoming Tasks (P2)
- Migrate Elemental Temples & Water Practices from frontend to MongoDB
- Generate unique AI images for extended chakras (Causal, Stellar Gateway, Universal Gateway)

## Future Tasks (P3)
- Video tutorials for somatic practices
- Community Reflection Sharing for Practice Journal
- Practice streaks gamification
- Sacred Geometry drawing guides
