# Shamanic Elemental Yoga App - PRD

## Status: ✅ READY FOR DEPLOYMENT

## Recent Updates (March 18, 2026)

### Professional Astrology / Birth Chart - COMPLETED ✅
- ✅ **Swiss Ephemeris Integration** - Professional-grade birth chart calculations:
  - Using pyswisseph library (0.0001° precision based on NASA JPL data)
  - Replaces basic free API with professional astronomical calculations
  - No external API dependencies - all calculations done locally
- ✅ **Full Planetary Positions** - 12 celestial bodies calculated:
  - Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn
  - Uranus, Neptune, Pluto, North Node, South Node
  - Each with: sign, degree, minute, house, retrograde status
- ✅ **Rising Sign (Ascendant)** - Accurate calculation with exact time
  - Sign, degree, minute, longitude
  - Meaning and keywords displayed
- ✅ **Midheaven (MC)** - Career/public image point calculated
- ✅ **Planetary Aspects** - 7 aspect types detected:
  - Conjunction, Sextile, Square, Trine, Opposition
  - Quincunx, Semi-sextile (minor aspects)
  - Orb values, applying/separating status
- ✅ **House System** - Placidus house cusps (12 houses)
  - Each house with sign, degree, theme, description
- ✅ **Element Balance** - Fire/Earth/Air/Water percentages
  - Weighted by planet importance (Sun, Moon, Ascendant = 3x weight)
  - Dominant element with interpretation
- ✅ **Quality Balance** - Cardinal/Fixed/Mutable percentages
  - Dominant quality with interpretation
- ✅ **Frontend UI Enhanced**:
  - Big Three display (Sun, Moon, Rising)
  - Color-coded element backgrounds for each planet
  - Collapsible Aspects and Houses sections
  - Swiss Ephemeris attribution shown
  - Retrograde indicator (Rx badge)
- ✅ **City Coordinates Database** - 40+ major cities worldwide
- ✅ All tests passed (14/14 backend, 100% frontend)

### API Endpoints Added:
- `GET /api/birth-chart/zodiac-signs` - All zodiac sign data
- `GET /api/birth-chart/planet-meanings` - Planet meanings/symbols
- `GET /api/birth-chart/house-meanings` - 12 house meanings
- `GET /api/birth-chart/aspect-meanings` - Aspect definitions
- `POST /api/birth-chart/calculate` - Calculate full birth chart
- `POST /api/birth-chart/save` - Save chart (authenticated)
- `GET /api/birth-chart/my-chart` - Get saved chart (authenticated)

### Files Updated:
- `/app/backend/routers/birth_chart.py` - Complete Swiss Ephemeris implementation
- `/app/frontend/src/pages/BirthChart.jsx` - Enhanced UI with Big Three, aspects, houses

---

### Audio Playback & Guided Visualizations - COMPLETED ✅
- ✅ **Web Audio API Sound Generation** - Full procedural audio:
  - Shamanic Drums: 80-40Hz oscillator pattern at ~280 BPM (theta-inducing)
  - Singing Bowls: 528Hz (love frequency) with harmonics
  - Ocean Waves: Layered filtered noise (200Hz + 800Hz)
  - Wind/Rain/Fire/Nature: Filtered brown noise variations
  - No external audio URLs (fixes CDN hotlinking issues)
- ✅ **Meditation Visualizations** - Animated effects for each practice type:
  - Aurora: Flowing northern lights for Shamanic practices
  - Mandala: Rotating sacred geometry for Heart practices
  - Element: Fire/Water/Air/Earth specific animations
  - Particles: Floating particles for Creative practices
  - Chakra: Energy rising through chakra points
- ✅ **Enhanced Timer Controls**:
  - Eye icon: Toggle visualizations on/off
  - Volume slider: Adjust audio level
  - Mute button: Silence audio
  - All working correctly (100% test verified)
- ✅ **Power Animal Journey Image Fixed** - Replaced 404 URL with working wolf image

### New Components Created:
- `/components/AmbientSoundPlayer.jsx` - Web Audio API sound generation
- `/components/MeditationVisualizer.jsx` - Canvas/CSS visual effects
- `/components/BreathingVisualizer.jsx` - Animated breathing guide
- `/components/AdminFormFields.jsx` - Reusable admin form fields

### PayPal Integration & Backend Refactoring - COMPLETED ✅
- ✅ **PayPal Integration** - Full PayPal payment support added:
  - Create order endpoint via PayPal REST API
  - Capture payment endpoint for completing transactions
  - Supports both subscriptions and one-time purchases
  - Graceful error handling when not configured
  - Sandbox mode ready (requires PAYPAL_CLIENT_ID, PAYPAL_SECRET in .env)
- ✅ **Backend Refactoring** - Modular router architecture:
  - `/routers/auth.py` - Google OAuth and email/password auth
  - `/routers/payments.py` - Stripe + PayPal payment routes
  - `/routers/dependencies.py` - Shared db access and auth helpers
  - Main server.py imports and includes routers
- ✅ **Frontend Updated** - Pricing page with payment method selector:
  - Toggle between Stripe and PayPal
  - Visual feedback for selected payment method
  - PayPal order capture on return
- ✅ All tests passed (14/14 backend, 100% frontend)

### Guided Practice Mode Fix - COMPLETED ✅
- ✅ **Bug Fixed**: "Begin Practice" buttons now launch guided practice mode with timer instead of just logging the practice
- ✅ **HeartPractices** - Added PracticeTimer integration with step-by-step guidance
- ✅ **ShamanicPractices** - Added PracticeTimer integration with drums background indicator
- ✅ **ElementalPractices** - Added PracticeTimer integration with element-themed visuals
- ✅ **CreativeProcesses** - Added PracticeTimer integration with spiritual purpose display
- ✅ **Timer Features**: Countdown display, step progress (Step X of Y), play/pause/skip/reset controls, volume toggle, exit button
- ✅ All tests passed (100% frontend verified on mobile viewport)

## Previous Updates (March 17, 2026)

### Payment Integration - COMPLETED ✅
- ✅ **Stripe Integration** - Full checkout system implemented:
  - Subscription plans: Monthly ($19.99) and Yearly ($149.99)
  - One-time payments for Retreats, Courses, Live Sessions, Books
  - Payment status tracking and webhook support
  - Customer subscription management
- ✅ **Payment Frontend** - Complete UI:
  - `/pricing` - Membership plans page with features
  - `/payment/success` - Payment confirmation
  - `/payment/cancel` - Cancellation handling
  - Dashboard "Membership" nav link added
- ✅ **Database Collections**: `payment_transactions`, `user_subscriptions`, `user_purchases`

### Complete Backlog Implementation - COMPLETED ✅
1. **Earth Altars Enhanced** - All 6 altars now include:
   - `therapeutic_applications` - Conditions they help with (Anxiety, Grief, Depression, etc.)
   - Each with: condition, how_it_helps, practice instructions
   - `weekly_practice` - Regular maintenance guidance
2. **Creative Processes Expanded** - Now 12 processes (was 6):
   - NEW: Forest Bathing, Earth Acupuncture, Stone People Medicine
   - NEW: Herbal Smoke Ceremony, Water Blessing, Ancestral Clay Working
   - Each with `therapeutic_benefits` array
3. **Push Notifications Backend** - Ready for production:
   - Subscribe/Unsubscribe endpoints implemented
   - Service worker push handler added
   - Requires VAPID keys in production
4. **App Store Guide** - Complete submission guide at `/app/APP_STORE_GUIDE.md`:
   - Google Play Store (TWA/PWABuilder)
   - Apple App Store (Capacitor/PWABuilder)
   - Screenshots, descriptions, keywords
   - Privacy policy requirements
- ✅ All tests passed (14/14 backend, 100% frontend)

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
- Preview: https://shamanic-yoga-temple.preview.emergentagent.com
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
- ✅ Earth Altars therapeutic applications (14/14 tests)
- ✅ Creative Processes expanded to 12 with benefits
- ✅ Push notifications backend ready

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
