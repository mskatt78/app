# Shamanic Elemental Yoga App - PRD

## Original Problem Statement
Build a Shamanic Elemental Yoga app with yoga, mindfulness, 13-month astrology calendar, Oracle Reads, Breathwork, somatic movement, crystals, health, energy, grounding, mantras, mudras.

## User Choices
- All core features (yoga, oracle, breathwork, astrology, crystals, mantras, mudras, somatic, grounding)
- Claude Sonnet 4.5 AI for personalized oracle readings
- Google social login (Emergent-managed)
- Custom + AI-generated content
- Shamanic design theme
- AI-generated images for all content (yoga poses, mudras, shamanic practices)

## Architecture
- **Frontend**: React with Tailwind CSS, Framer Motion, Shadcn UI
- **Backend**: FastAPI with MongoDB (Motor async driver)
- **Database**: MongoDB with collections for all content types
- **AI**: Claude Sonnet 4.5 via Emergent Integrations for oracle readings
- **Auth**: Emergent Google OAuth
- **Images**: AI-generated using Imagen 4.0 for all content

## What's Been Implemented

### Phase 5: Complete AI Image Generation (Dec 15, 2025)
- [x] **All 60 Yoga Poses** - Unique AI-generated images with sacred geometry, element-appropriate colors
- [x] **All 12 Mudras** - Hand gesture images with element-specific styling
- [x] **All 8 Shamanic Practices** - Visionary spiritual art for each practice
- [x] **All 6 Earth Altars** - Sacred altar arrangements for each element
- [x] **All 10 Elemental Practices** - Element-specific spiritual imagery
- [x] **All 6 Creative Processes** - Artistic shamanic process visualization
- [x] **All 6 Heart Practices** - Heart chakra and emotional healing imagery
- [x] **Image Upload Feature** - Admin CMS supports direct image uploads
  - Backend endpoint: `/api/upload/image`
  - Supports JPG, PNG, GIF, WebP (max 5MB)
  - Integrated into all Admin CMS forms

**Total AI Images Generated: 108 unique images**

### Phase 4: Practice Log, Achievements & Shamanic Content (Dec 15, 2025)
- [x] **Practice Log System** - Full activity tracking
- [x] **Enhanced Achievements System** - 24 achievements with badges
- [x] **New Shamanic Content Sections**:
  - Earth Altars (6), Creative Processes (6), Heart Practices (6)
  - Shamanic Practices (8), Elemental Practices (10)
- [x] **Admin CMS Extended** - Full CRUD for all content types
- [x] **Refined Locked/Unlocked UI**

### Phase 3: Mantra Audio (March 15, 2026)
- [x] **Audio Player Implementation** - Full audio playback for mantras

### Phase 2: MongoDB Migration & CMS (March 15, 2026)
- [x] **Data Migration to MongoDB**
- [x] **Admin CMS Built**

### Phase 1: Content Enhancement (March 15, 2026)
- [x] **Yoga Poses Enhanced** - 60 poses with AI images, instructions, benefits
- [x] **Mudras Library Enhanced** - 12 mudras with AI images
- [x] **Breathwork Enhanced** - 6 sessions

### Previously Implemented (Jan 2026)
- [x] Landing page, Google OAuth, Dashboard
- [x] Yoga library (60 poses, 5 elements) with Favorites
- [x] Oracle readings with Claude AI
- [x] Breathwork sessions with timer
- [x] 13-month astrology calendar
- [x] Crystal guide, Mantras, Mudras libraries
- [x] Somatic movement, Grounding exercises
- [x] Daily Ritual Builder, Achievements, Sacred Journal

## API Endpoints

### Public Endpoints
- `GET /api/yoga/poses`, `/api/mudras`, `/api/breathwork/sessions`
- `GET /api/crystals`, `/api/mantras`
- `GET /api/astrology/months`, `/api/astrology/current`
- `GET /api/elemental-practices`, `/api/earth-altars`
- `GET /api/creative-processes`, `/api/heart-practices`, `/api/shamanic-practices`

### Protected Endpoints
- `GET /api/dashboard/daily`, `/api/favorites`, `/api/achievements`
- `POST /api/practice-history`, `GET /api/practice-history`
- `POST /api/upload/image` - Image upload endpoint
- Admin CRUD endpoints for all content types

## Database Collections
All collections now have unique AI-generated images:
- `yoga_poses` (60), `mudras` (12), `breathwork_sessions` (6)
- `crystals` (12), `mantras` (12), `astrology_months` (13)
- `earth_altars` (6), `creative_processes` (6), `heart_practices` (6)
- `shamanic_practices` (8), `elemental_practices` (10)
- `users`, `favorites`, `practice_history`, `achievement_definitions`

## Prioritized Backlog

### P1 - Pending User Verification
- [ ] Test "Pose of the Day" click-through from Dashboard

### P2 - Nice to Have (Future Features)
- [ ] AI images for remaining content (crystals, breathwork, somatic)
- [ ] Audio guides for meditation and shamanic journeys
- [ ] Push notifications for daily practice reminders
- [ ] Community features / social feed
- [ ] Premium subscription tier
- [ ] Offline mode for saved practices

## 3rd Party Integrations
- **Claude Sonnet 4.5** — Emergent LLM Key
- **Emergent-managed Google Auth** — no User Key
- **Imagen 4.0** — AI image generation

## Files Structure
```
/app/backend/
├── server.py           # FastAPI with upload endpoint
├── seed_database.py    # MongoDB seeding
├── uploads/            # Uploaded images directory
└── data/
    ├── yoga_poses.py   # 60 poses with AI URLs
    ├── all_content.py  # Mudras, etc. with AI URLs
    └── shamanic_content.py  # Shamanic content with AI URLs

/app/frontend/src/
├── pages/
│   ├── AdminCMS.jsx    # With ImageUploadField component
│   ├── YogaLibrary.jsx
│   └── [all shamanic pages]
└── components/ui/
```

## Testing Status
- All 108 AI images verified via API
- Image upload endpoint functional
- All content types returning correct AI-generated URLs
