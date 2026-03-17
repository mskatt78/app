# Shamanic Elemental Yoga App - PRD

## Status: ✅ READY FOR DEPLOYMENT

## Recent Updates (March 17, 2026)

### Enhanced Mantras & Shamanic Content - COMPLETED ✅
- ✅ **Mantras Enhanced** - All 12 mantras now include:
  - Pronunciation guide (e.g., "ohm (with resonance in chest)")
  - Frequency (Hz) with vibrational note (e.g., 432 Hz, Note A)
  - Music recommendations (e.g., "Tibetan singing bowls in A")
  - Practice tips for each mantra
- ✅ **Shamanic Ceremonies Expanded** - Now 16 ceremonies (was 8):
  - Original: Power Animal, Soul Retrieval, Ancestral Healing, Shadow Work, Upper World Journey, Death/Rebirth, Extraction, Nature Walk
  - **NEW**: Medicine Wheel, Sweat Lodge, Fire Ceremony, Despacho, Cord Cutting, Plant Spirit, Vision Quest, Womb/Hara Healing
- ✅ **Frontend Updated** - MantrasLibrary displays pronunciation, frequency, note, and music in dialog
- ✅ All tests passed (24/24 backend, 100% frontend)

### Timers & Rituals Enhancement - COMPLETED ✅
- ✅ **Grounding Practices Timer** - PracticeTimer integrated with segment tracking
  - Shows Step X of Y, countdown timer, play/pause, skip, background audio indicator
  - Bug fixed: API endpoint corrected from `/grounding/exercises` to `/grounding`
- ✅ **Crystal Audio Features** - All 12 crystals display:
  - Frequency (Hz), Vibrational Note, Music Recommendation, Pronunciation
- ✅ **Preset Rituals Expanded** - Now 14 rituals across all 5 elements:
  - Fire: Morning Sun Salutation, Quick Energy Reset, Inner Fire Activation
  - Water: Evening Wind Down, Full Moon Release, Ocean Breath Release
  - Air: Heart Opening Ceremony, Wind Clearing Ceremony
  - Earth: Grounding Earth Ritual, Deep Earth Connection
  - Spirit: New Moon Intention, Chakra Balancing, Ancestor Honoring, Sacred Self-Love
- ✅ **Admin Rituals CRUD** - POST/DELETE `/api/admin/preset-rituals`
- ✅ All tests passed (18/18 backend, 100% frontend)

### Admin CMS Expansion - COMPLETED ✅
New content types added for user-generated content management:
- ✅ **Retreats** - Multi-day retreat experiences with full details
  - Backend: `/api/retreats`, `/api/admin/retreats` CRUD
  - Frontend: `/retreats` page, Admin CMS tab
- ✅ **Books** - Book content with chapters, testimonials, purchase links
  - Backend: `/api/books`, `/api/admin/books` CRUD
  - Frontend: `/books` page, Admin CMS tab
- ✅ **Custom Oracle Cards** - User's own oracle card deck
  - Backend: `/api/custom-oracle-cards`, `/api/admin/custom-oracle-cards` CRUD
  - Frontend: Admin CMS "Oracle Deck" tab
- ✅ **Live Sessions** - Live interaction feature (YouTube Live, Zoom, etc.)
  - Backend: `/api/live-sessions`, `/api/admin/live-sessions` CRUD
  - Frontend: `/live` page, Admin CMS tab
- ✅ All tests passed (24/24 backend, 100% frontend)

### Email/Password Authentication - COMPLETED ✅
- ✅ Backend endpoints: `/api/auth/register`, `/api/auth/login`
- ✅ Password hashing with salt (SHA-256)
- ✅ Session management via HttpOnly cookies (30 days)
- ✅ Auth modal with Google OAuth + Email/Password options
- ✅ Login form with email/password fields
- ✅ Registration form with name/email/password fields
- ✅ Toggle between login/register modes
- ✅ Error handling for invalid credentials
- ✅ Error handling for duplicate email registration
- ✅ Automatic redirect to dashboard after login
- ✅ All tests passed (12/12 backend, 100% frontend E2E)

## Previous Updates (Dec 15, 2025)

### Safety & Legal
- ✅ **Warrior III image** - Replaced dangerous mountain image with safe indoor studio
- ✅ **Health Disclaimers** - Added to Crystal Guide, Footer, throughout app
- ✅ **AppFooter** - Legal disclaimer, Terms, Privacy links on all pages

### Crystal Enhancements
- ✅ **Pronunciation** - Added phonetic guides for all 12 crystals
- ✅ **Frequency (Hz)** - Vibrational frequency for each crystal
- ✅ **Musical Note** - Corresponding note for sound healing
- ✅ **Music Recommendation** - Suggested audio for each crystal
- ✅ **Affirmation** - Healing affirmation for each crystal

### Timers Throughout App
- ✅ **Mindfulness Practices** (8) - Full timer with segments, silence indicators
- ✅ **Grounding Exercises** (8) - Timer segments with audio cues
- ✅ **Somatic Practices** (6) - Timer segments for movement practices
- ✅ **PracticeTimer Component** - Reusable timer with play/pause/skip/mute

### Grounding Practices Expanded
- ✅ Added 3 new practices (Tree Hugging, Stone Holding, Mountain Visualization)
- ✅ Total: 8 grounding practices (was 5)

### Ritual Practices
- ✅ **8 Preset Rituals** - Ready-to-use ritual templates:
  1. Morning Sun Salutation (20 min)
  2. Evening Wind Down (25 min)
  3. Grounding Earth Ritual (15 min)
  4. Heart Opening Ceremony (20 min)
  5. Full Moon Release (30 min)
  6. New Moon Intention Setting (25 min)
  7. Quick Energy Reset (10 min)
  8. Chakra Balancing Journey (35 min)

### Numerology Calendar Fix
- ✅ Replaced date input with Year/Month/Day dropdowns
- ✅ Easy year selection without clicking through months

### Category Filter Fixes
- ✅ Heart Practices - categories aligned with frontend
- ✅ Creative Processes - categories aligned with frontend
- ✅ Shamanic Practices - categories aligned with frontend

## API Endpoints Added
- `GET /api/preset-rituals` - Get preset ritual templates
- `GET /api/preset-rituals/{id}` - Get specific preset ritual
- **NEW (March 17, 2026):**
- `GET /api/retreats` - Get all retreats
- `POST/PUT/DELETE /api/admin/retreats` - Manage retreats
- `GET /api/books` - Get all books
- `POST/PUT/DELETE /api/admin/books` - Manage books
- `GET /api/custom-oracle-cards` - Get oracle cards
- `POST/PUT/DELETE /api/admin/custom-oracle-cards` - Manage oracle cards
- `GET /api/live-sessions` - Get live sessions
- `POST/PUT/DELETE /api/admin/live-sessions` - Manage live sessions

## All Content with AI Images (116 total)
- 60 Yoga Poses
- 12 Mudras
- 8 Shamanic Practices
- 6 Earth Altars
- 10 Elemental Practices
- 6 Creative Processes
- 6 Heart Practices

## PWA Ready
- manifest.json configured
- Service Worker for offline
- App icons (192px, 512px)
- iOS & Android install support

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Shadcn UI
- Backend: FastAPI, MongoDB
- Auth: Emergent Google OAuth + Email/Password (dual auth)
- AI: Claude Sonnet 4.5 (Oracle readings)
- Images: AI-generated via Imagen 4.0

## Links
- Preview: https://temple-login-test.preview.emergentagent.com
- Production: https://mindful-shamanic-app.emergent.host (after deploy)

## Files Updated This Session
- `/app/frontend/src/components/HealthDisclaimer.jsx` - NEW
- `/app/frontend/src/components/AppFooter.jsx` - NEW
- `/app/frontend/src/components/PracticeTimer.jsx` - NEW
- `/app/frontend/src/pages/CrystalGuide.jsx` - Enhanced
- `/app/frontend/src/pages/Mindfulness.jsx` - Timer added
- `/app/frontend/src/pages/Numerology.jsx` - Date picker fixed
- `/app/frontend/src/App.js` - Footer added
- `/app/backend/server.py` - Preset rituals endpoint

## Testing Status
- ✅ All APIs verified working
- ✅ Category filters all functioning
- ✅ Crystal data enhanced and verified
- ✅ Grounding practices expanded
- ✅ Build successful (warnings only)
- ✅ Email/Password Auth tested (12/12 tests passed)
- ✅ Frontend E2E auth flow verified
- ✅ Admin CMS expansion tested (24/24 tests passed)
- ✅ New content pages (Live, Retreats, Books) verified
- ✅ Grounding timer integration tested (18/18 tests passed)
- ✅ Crystal audio features verified
- ✅ 14 preset rituals verified
- ✅ Mantras enhanced with pronunciation/frequency (24/24 tests)
- ✅ 16 shamanic ceremonies verified

## Auth Test Credentials
- Email: test@example.com
- Password: password123

## Files Updated (March 17, 2026)
- `/app/frontend/src/pages/LandingPage.jsx` - Auth modal with email/password
- `/app/backend/server.py` - Email/Password auth + Admin CMS expansion
- `/app/backend/tests/test_email_auth.py` - Auth test suite
- `/app/backend/tests/test_new_content_types.py` - New content tests
- `/app/frontend/src/pages/AdminCMS.jsx` - New tabs and forms
- `/app/frontend/src/pages/LiveSessions.jsx` - NEW
- `/app/frontend/src/pages/Retreats.jsx` - NEW
- `/app/frontend/src/pages/Books.jsx` - NEW
- `/app/frontend/src/App.js` - New routes
- `/app/frontend/src/pages/Dashboard.jsx` - New nav items
