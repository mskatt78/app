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
- **Database**: MongoDB with collections for all content types
- **AI**: Claude Sonnet 4.5 via Emergent Integrations for oracle readings
- **Auth**: Emergent Google OAuth

## What's Been Implemented

### Phase 1: Content Enhancement (March 15, 2026)
- [x] **Yoga Poses Enhanced** - All 60 poses with images, 8-step instructions, 6 benefits, difficulty, contraindications
- [x] **Mudras Library Enhanced** - All 12 mudras with images and instructions
- [x] **Breathwork Enhanced** - All 6 sessions with frequency (Hz) and best time

### Phase 2: MongoDB Migration & CMS (March 15, 2026)
- [x] **Data Migration to MongoDB** - All content migrated from hardcoded arrays to MongoDB collections:
  - `yoga_poses` (60 documents)
  - `mudras` (12 documents)
  - `breathwork_sessions` (6 documents)
  - `crystals` (12 documents)
  - `mantras` (12 documents)
  - `astrology_months` (13 documents)
  - `oracle_cards` (22 documents)
  - `somatic_practices` (6 documents)
  - `grounding_exercises` (5 documents)
  - `mindfulness_practices` (8 documents)
  - `meditations` (6 documents)

- [x] **Admin CMS Built** - Full content management system at `/admin`:
  - CRUD operations for all content types
  - Tabs: Yoga, Mudras, Breathwork, Crystals, Mantras, Workshops, Events, Courses
  - Form-based creation/editing with validation
  - List view with edit/delete actions

- [x] **New Content Types Added**:
  - Workshops (create/edit/delete)
  - Events (create/edit/delete)  
  - Courses (create/edit/delete)

### Previously Implemented (Jan 2026)
- [x] Landing page with shamanic design
- [x] Google OAuth authentication
- [x] Dashboard with daily guidance
- [x] Yoga library (60 poses, 5 elements) with Favorites
- [x] Oracle readings with Claude AI interpretation
- [x] Breathwork sessions with interactive timer
- [x] 13-month astrology calendar
- [x] Crystal guide (12 crystals)
- [x] Mantras library (12 mantras)
- [x] Mudras library (12 mudras)
- [x] Somatic movement practices (6 practices)
- [x] Grounding exercises (5 exercises)
- [x] User favorites system
- [x] Daily Ritual Builder with timer
- [x] Achievement Badges System
- [x] Shareable Rituals
- [x] Sacred Journal
- [x] Settings page

## API Endpoints

### Public Endpoints
- `GET /api/yoga/poses` - List yoga poses (with element/difficulty filter)
- `GET /api/yoga/poses/{id}` - Get specific pose
- `GET /api/mudras` - List mudras (with element filter)
- `GET /api/breathwork/sessions` - List breathwork sessions
- `GET /api/crystals` - List crystals
- `GET /api/mantras` - List mantras
- `GET /api/astrology/months` - List 13 lunar months
- `GET /api/astrology/current` - Get current lunar month
- `GET /api/workshops` - List workshops
- `GET /api/events` - List events
- `GET /api/courses` - List courses

### Protected Endpoints (Require Auth)
- `GET /api/dashboard/daily` - Daily guidance data
- `GET /api/favorites` - User's favorites
- `POST /api/admin/yoga/poses` - Create yoga pose
- `PUT /api/admin/yoga/poses/{id}` - Update yoga pose
- `DELETE /api/admin/yoga/poses/{id}` - Delete yoga pose
- Similar CRUD for: mudras, breathwork, crystals, mantras, workshops, events, courses

## Database Collections
- `users` - User accounts
- `user_sessions` - Auth sessions
- `favorites` - User favorites
- `oracle_readings` - Saved readings
- `rituals` - User rituals
- `achievements` - User achievements
- `yoga_poses` - 60 poses
- `mudras` - 12 mudras
- `breathwork_sessions` - 6 sessions
- `crystals` - 12 crystals
- `mantras` - 12 mantras
- `astrology_months` - 13 months
- `oracle_cards` - 22 cards
- `somatic_practices` - 6 practices
- `grounding_exercises` - 5 exercises
- `mindfulness_practices` - 8 practices
- `meditations` - 6 meditations
- `workshops` - User-created workshops
- `events` - User-created events
- `courses` - User-created courses

## Prioritized Backlog

### P1 - Medium Priority
- [ ] **Mantra Audio** - Add audio playback for mantras

### P2 - Nice to Have
- [ ] Push notifications
- [ ] Community features / social feed
- [ ] Premium subscription tier

## 3rd Party Integrations
- **Claude Sonnet 4.5** (Text Generation) — uses Emergent LLM Key
- **Emergent-managed Google Auth** — no User Key required

## Testing Status
- Backend: 100% pass rate (34/34 tests)
- Frontend: 100% features verified
- Test files: `/app/backend/tests/test_admin_cms.py`

## Files Structure
```
/app/backend/
├── server.py           # Main FastAPI app with all endpoints
├── seed_database.py    # MongoDB seeding script
├── .env               # Environment variables
├── requirements.txt   # Python dependencies
└── data/
    ├── __init__.py
    ├── yoga_poses.py   # 60 yoga poses data
    └── all_content.py  # All other content data

/app/frontend/src/
├── App.js              # Routes
├── pages/
│   ├── AdminCMS.jsx    # Admin CMS interface
│   ├── YogaLibrary.jsx # Enhanced yoga library
│   ├── MudrasLibrary.jsx # Enhanced mudras
│   ├── Breathwork.jsx  # Enhanced breathwork
│   ├── Dashboard.jsx   # Main dashboard
│   └── ...             # Other pages
└── components/ui/      # Shadcn components
```
