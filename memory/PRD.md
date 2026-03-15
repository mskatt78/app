# Shamanic Elemental Yoga App - PRD

## Original Problem Statement
Build a Shamanic Elemental Yoga app with yoga, mindfulness, 13-month astrology calendar, Oracle Reads, Breathwork, somatic movement, crystals, health, energy, grounding, mantras, mudras.

## Status: ✅ READY FOR DEPLOYMENT

## Links
- **Preview URL:** https://mindful-shamanic-app.preview.emergentagent.com
- **Production URL:** (Available after deployment)
- **Code:** Use "Save to GitHub" in chat interface to export

## What's Included

### AI-Generated Sacred Images (116 total)
- ✅ 60 Yoga Poses - Element-specific sacred imagery
- ✅ 12 Mudras - Hand gesture sacred art
- ✅ 8 Shamanic Practices - Visionary spiritual art
- ✅ 6 Earth Altars - Sacred altar arrangements
- ✅ 10 Elemental Practices - Element connection imagery
- ✅ 6 Creative Processes - Artistic shamanic visualization
- ✅ 6 Heart Practices - Heart chakra healing imagery
- ✅ App Icons (192px, 512px) - Sacred lotus design

### PWA (Progressive Web App) - Mobile Ready
- ✅ manifest.json configured
- ✅ Service Worker for offline capability
- ✅ App icons for home screen installation
- ✅ iOS & Android "Add to Home Screen" support

### Core Features
- ✅ Google OAuth authentication
- ✅ Dashboard with daily guidance & Pose of the Day
- ✅ Yoga library (60 poses, 5 elements) with Favorites
- ✅ Oracle readings with Claude AI interpretation
- ✅ Breathwork sessions with interactive timer
- ✅ 13-month astrology calendar
- ✅ Crystal guide (12 crystals)
- ✅ Mantras library with audio playback
- ✅ Mudras library (12 mudras)
- ✅ Somatic movement practices
- ✅ Grounding exercises
- ✅ Daily Ritual Builder with timer
- ✅ Practice Log with statistics
- ✅ Achievement Badges System (24 achievements)
- ✅ Sacred Journal
- ✅ Admin CMS with image upload

### Shamanic Content Sections
- ✅ Earth Altars (6) - Sacred space creation guides
- ✅ Creative Processes (6) - Shamanic art and expression
- ✅ Heart Practices (6) - Heart-opening ceremonies
- ✅ Shamanic Practices (8) - Deep journeys and ceremonies
- ✅ Elemental Practices (10) - Element connection exercises

## Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, Shadcn UI
- **Backend:** FastAPI, MongoDB
- **Auth:** Emergent Google OAuth
- **AI:** Claude Sonnet 4.5 (Oracle readings)
- **Images:** Imagen 4.0 AI-generated

## Deployment Instructions
1. Click **"Deploy"** button in Emergent interface
2. Follow the deployment wizard
3. Your app will get a permanent production URL

## Mobile Installation (PWA)
After deployment, users can:
- **iOS:** Open in Safari → Share → "Add to Home Screen"
- **Android:** Open in Chrome → Menu → "Add to Home Screen"

## Admin Access
- Navigate to `/admin` when logged in
- Full CRUD for all content types
- Image upload capability

## Files Structure
```
/app/
├── backend/
│   ├── server.py           # FastAPI endpoints
│   ├── seed_database.py    # Database seeding
│   └── data/               # Seed data with AI image URLs
└── frontend/
    ├── public/
    │   ├── manifest.json   # PWA config
    │   ├── service-worker.js
    │   ├── icon-192.png
    │   ├── icon-512.png
    │   └── favicon.ico
    └── src/
        ├── pages/          # All app pages
        └── components/     # UI components
```

## Future Enhancements (Backlog)
- Audio guides for meditation/shamanic journeys
- Push notifications for daily reminders
- Community features / social feed
- Premium subscription tier
- Native Play Store app (via Capacitor)
