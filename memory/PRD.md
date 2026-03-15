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

### Phase 4: Practice Log, Achievements & Shamanic Content (Dec 15, 2025)
- [x] **Practice Log System** - Full activity tracking:
  - Log yoga, breathwork, meditation, oracle, mantra, mudra, grounding, somatic, elemental practices
  - Detailed statistics with weekly activity chart
  - Elemental balance visualization
  - Recent practice history display
  - Practice streak tracking

- [x] **Enhanced Achievements System** - 24 achievements with badges:
  - Category-based filtering
  - Progress tracking with visual progress bars
  - Unlockable content rewards
  - Badge colors per achievement
  - Stats overview (unlocked, streak, hours practiced)

- [x] **New Shamanic Content Sections**:
  - **Earth Altars** (6 altars) - Sacred space creation guides for each element
  - **Creative Processes** (6 processes) - Shamanic art and creative expression
  - **Heart Practices** (6 practices) - Heart-opening ceremonies and exercises
  - **Shamanic Practices** (8 practices) - Deep journeys and ceremonial work
  - **Elemental Practices** (10 practices) - Element-specific connection exercises

- [x] **Admin CMS Extended** - Now manages all shamanic content:
  - Earth Altars CRUD
  - Creative Processes CRUD
  - Heart Practices CRUD
  - Shamanic Practices CRUD
  - Elemental Practices CRUD

- [x] **Refined Locked/Unlocked UI** - Enhanced visual experience:
  - Blur blend effect on locked content
  - Animated lock indicators with gradient backgrounds
  - Sparkle badge for unlocked premium content
  - Click-to-view achievements from locked items
  - New "Deeper Journeys" section on Dashboard
  - Progress section with Practice Log, Achievements, Favorites quick access

### Phase 3: Mantra Audio (March 15, 2026)
- [x] **Audio Player Implementation** - Full audio playback for mantras

### Phase 2: MongoDB Migration & CMS (March 15, 2026)
- [x] **Data Migration to MongoDB** - All content migrated to MongoDB collections
- [x] **Admin CMS Built** - Full content management system at `/admin`

### Phase 1: Content Enhancement (March 15, 2026)
- [x] **Yoga Poses Enhanced** - All 60 poses with images, 8-step instructions, 6 benefits
- [x] **Mudras Library Enhanced** - All 12 mudras with images and instructions
- [x] **Breathwork Enhanced** - All 6 sessions with frequency (Hz) and best time

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

### Public Endpoints (No Auth Required)
- `GET /api/yoga/poses` - List yoga poses
- `GET /api/mudras` - List mudras
- `GET /api/breathwork/sessions` - List breathwork sessions
- `GET /api/crystals` - List crystals
- `GET /api/mantras` - List mantras
- `GET /api/astrology/months` - List 13 lunar months
- `GET /api/astrology/current` - Get current lunar month
- `GET /api/elemental-practices` - List elemental practices
- `GET /api/earth-altars` - List earth altars
- `GET /api/creative-processes` - List creative processes
- `GET /api/heart-practices` - List heart practices
- `GET /api/shamanic-practices` - List shamanic practices

### Protected Endpoints (Require Auth)
- `GET /api/dashboard/daily` - Daily guidance data
- `GET /api/favorites` - User's favorites
- `GET /api/achievements` - User achievements with progress and unlocks
- `POST /api/practice-history` - Log a practice
- `GET /api/practice-history` - User's practice history
- `GET /api/practice-history/stats` - Basic practice statistics
- `GET /api/practice-history/detailed-stats` - Detailed stats with weekly data
- Admin CRUD endpoints for all content types

## Database Collections
- `users` - User accounts
- `user_sessions` - Auth sessions
- `favorites` - User favorites
- `oracle_readings` - Saved readings
- `rituals` - User rituals
- `practice_history` - User practice logs
- `achievement_definitions` - 24 achievement definitions
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
- `earth_altars` - 6 altars
- `creative_processes` - 6 processes
- `heart_practices` - 6 practices
- `shamanic_practices` - 8 practices
- `elemental_practices` - 10 practices

## Prioritized Backlog

### P2 - Nice to Have (Future Features)
- [ ] Audio guides for meditation and shamanic journeys
- [ ] Push notifications for daily practice reminders
- [ ] Community features / social feed for sharing practices
- [ ] Premium subscription tier with exclusive content
- [ ] More mantra audio files
- [ ] Journey recording feature (record and playback experiences)
- [ ] Guided audio meditations with voice-over
- [ ] Offline mode for saved practices
- [ ] Calendar integration for scheduling rituals
- [ ] Progress sharing to social media

## 3rd Party Integrations
- **Claude Sonnet 4.5** (Text Generation) — uses Emergent LLM Key
- **Emergent-managed Google Auth** — no User Key required

## Testing Status
- Backend: 100% pass rate (all tests)
- Frontend: 100% features verified
- Test files: 
  - `/app/backend/tests/test_admin_cms.py`
  - `/app/backend/tests/test_mantras_audio.py`
  - `/app/backend/tests/test_shamanic_content.py`

## Files Structure
```
/app/backend/
├── server.py           # Main FastAPI app with all endpoints
├── seed_database.py    # MongoDB seeding script
├── .env               # Environment variables
├── requirements.txt   # Python dependencies
├── tests/             # Test files
└── data/
    ├── __init__.py
    ├── yoga_poses.py   # 60 yoga poses data
    ├── all_content.py  # Core content data
    └── shamanic_content.py  # New shamanic content data

/app/frontend/src/
├── App.js              # Routes
├── pages/
│   ├── AdminCMS.jsx    # Admin CMS interface
│   ├── YogaLibrary.jsx # Enhanced yoga library
│   ├── MudrasLibrary.jsx # Enhanced mudras
│   ├── Breathwork.jsx  # Enhanced breathwork
│   ├── MantrasLibrary.jsx # Mantras with audio player
│   ├── Dashboard.jsx   # Main dashboard
│   ├── PracticeLog.jsx # Practice history & stats
│   ├── Achievements.jsx # Achievement badges
│   ├── ElementalPractices.jsx # Elemental practices
│   ├── EarthAltars.jsx # Earth altars
│   ├── CreativeProcesses.jsx # Creative processes
│   ├── HeartPractices.jsx # Heart practices
│   ├── ShamanicPractices.jsx # Shamanic practices
│   └── ...             # Other pages
└── components/ui/      # Shadcn components
```
