# Shamanic Elemental Yoga App - PRD

## Original Problem Statement
Build a Shamanic Elemental Yoga app with yoga, mindfulness, 13-month astrology calendar, Oracle Reads, Breathwork, somatic movement, crystals, health, energy, grounding, mantras, mudras.

## User Choices
- All core features (yoga, oracle, breathwork, astrology, crystals, mantras, mudras, somatic, grounding)
- Claude Sonnet 4.5 AI for personalized oracle readings
- Google social login (Emergent-managed)
- Custom + AI-generated content
- Shamanic design theme
- Realistic stock photos from Unsplash for images

## Architecture
- **Frontend**: React with Tailwind CSS, Framer Motion, Shadcn UI
- **Backend**: FastAPI with MongoDB (Motor async driver)
- **AI**: Claude Sonnet 4.5 via Emergent Integrations for oracle readings
- **Auth**: Emergent Google OAuth

## User Personas
1. **Spiritual Seekers**: Looking for daily guidance and connection to ancient wisdom
2. **Yoga Practitioners**: Want elemental yoga poses with chakra associations
3. **Astrology Enthusiasts**: Interested in 13-moon calendar and lunar cycles

## What's Been Implemented

### Content Enhancement (March 15, 2026)
- [x] **Yoga Poses Enhanced** - All 60 poses now include:
  - High-quality images from Unsplash
  - 8 step-by-step instructions for each pose
  - 6 detailed benefits per pose
  - Difficulty levels (Beginner/Intermediate/Advanced)
  - Contraindications and cautions
  - Chakra associations
  - Duration recommendations

- [x] **Mudras Library Enhanced** - All 12 mudras now include:
  - Images showing hand positions
  - Detailed how-to-form instructions
  - 5 benefits per mudra
  - Element associations

- [x] **Breathwork Enhanced** - All 6 sessions now include:
  - Frequency information (Hz values: 432, 528, 639, 741, 963, 396)
  - Best time to practice
  - Detailed instructions
  - Enhanced benefits list

### Previously Implemented (Jan 2026)
- [x] Landing page with shamanic design
- [x] Google OAuth authentication
- [x] Dashboard with daily guidance
- [x] Yoga library (60 poses, 5 elements) with Favorites
- [x] Oracle readings with Claude AI interpretation
- [x] Breathwork sessions with interactive timer
- [x] 13-month astrology calendar
- [x] Crystal guide (12 crystals)
- [x] Mantras library (12 mantras with chanting timer)
- [x] Mudras library (12 mudras)
- [x] Somatic movement practices (6 practices)
- [x] Grounding exercises (5 exercises)
- [x] User favorites system
- [x] Practice history tracking
- [x] Favorites page with stats
- [x] Daily Ritual Builder with timer
- [x] Achievement Badges System (10 achievements)
- [x] Shareable Rituals
- [x] Sacred Journal / Reflections
- [x] Settings page with daily reminders

## Current Feature Summary
- 60 yoga poses across 5 elements (Earth, Water, Fire, Air, Spirit)
- 22 oracle cards with AI interpretation
- 6 breathwork sessions with timer and frequency info
- 13-month lunar calendar
- 12 crystals with properties
- 12 mantras with chanting practice
- 12 mudras with images and descriptions
- 6 somatic movement practices
- 5 grounding exercises
- Ritual builder with sharing
- Journal with mood tracking
- Achievement badges
- Favorites & progress tracking
- Daily reminder settings

## Prioritized Backlog

### P0 - High Priority
- [ ] **Refactor Data to MongoDB** - Migrate hardcoded content from server.py to database collections (prerequisite for CMS)
- [ ] **Build Admin CMS** - Allow user to add/edit content

### P1 - Medium Priority
- [ ] **Implement Mantra Audio** - Add audio URLs and player for mantras

### P2 - Nice to Have
- [ ] Push notifications (requires service worker)
- [ ] Community features / social feed
- [ ] Premium subscription tier

## API Endpoints
- `/api/auth/google`, `/api/auth/google/callback`: Google OAuth flow
- `/api/auth/session`: Exchange session for token
- `/api/auth/me`: Get current user
- `/api/yoga/poses`: Get yoga poses (with images, instructions, benefits)
- `/api/yoga/poses/{id}`: Get specific pose
- `/api/yoga/favorites`: User's favorite poses
- `/api/mudras`: Get mudras (with images and instructions)
- `/api/breathwork/sessions`: Get breathwork sessions (with frequency)
- `/api/oracle/reading`: Create AI-powered oracle reading
- `/api/crystals`: Get crystals
- `/api/mantras`: Get mantras
- `/api/astrology/months`: Get 13-month calendar
- `/api/rituals`: User's rituals
- `/api/achievements`: User's achievements

## Database Schema
- **users**: User accounts from Google OAuth
- **user_sessions**: Session tokens
- **favorites**: User's favorited items
- **oracle_readings**: Saved oracle readings
- **rituals**: User-created rituals
- **achievements**: User achievements

## 3rd Party Integrations
- **Claude Sonnet 4.5** (Text Generation) — uses Emergent LLM Key
- **Emergent-managed Google Auth** — no User Key required

## Testing Status
- Backend: 100% pass rate (24/24 tests)
- Frontend: 100% features verified
- Test file: `/app/backend/tests/test_enhanced_features.py`
