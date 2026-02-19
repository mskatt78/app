# Shamanic Elemental Yoga App - PRD

## Original Problem Statement
Build a Shamanic Elemental Yoga app with yoga, mindfulness, 13-month astrology calendar, Oracle Reads, Breathwork, somatic movement, crystals, health, energy, grounding, mantras, mudras.

## User Choices
- All core features (yoga, oracle, breathwork, astrology, crystals, mantras, mudras, somatic, grounding)
- Claude Sonnet 4.5 AI for personalized oracle readings
- Google social login (Emergent-managed)
- Custom + AI-generated content
- Shamanic design theme

## Architecture
- **Frontend**: React with Tailwind CSS, Framer Motion, Shadcn UI
- **Backend**: FastAPI with MongoDB (Motor async driver)
- **AI**: Claude Sonnet 4.5 via Emergent Integrations for oracle readings
- **Auth**: Emergent Google OAuth

## User Personas
1. **Spiritual Seekers**: Looking for daily guidance and connection to ancient wisdom
2. **Yoga Practitioners**: Want elemental yoga poses with chakra associations
3. **Astrology Enthusiasts**: Interested in 13-moon calendar and lunar cycles

## Core Requirements (Static)
- User authentication via Google OAuth
- Yoga pose library with element filtering
- AI-powered oracle card readings
- Interactive breathwork timer
- 13-month lunar astrology calendar
- Crystal healing guide
- Mantras and mudras libraries
- Somatic movement practices
- Grounding exercises
- User favorites/bookmarks
- Practice history tracking
- Daily ritual builder
- Achievement badges

## What's Been Implemented (Jan 2026)
- [x] Landing page with shamanic design
- [x] Google OAuth authentication
- [x] Dashboard with daily guidance
- [x] Yoga library (60 poses, 5 elements)
- [x] Oracle readings with Claude AI interpretation
- [x] Breathwork sessions with interactive timer
- [x] 13-month astrology calendar
- [x] Crystal guide (12 crystals)
- [x] Mantras library (12 mantras with chanting timer) - ENHANCED
- [x] Mudras library (12 mudras)
- [x] Somatic movement practices (6 practices)
- [x] Grounding exercises (5 exercises)
- [x] User favorites system
- [x] Practice history tracking
- [x] Favorites page with stats
- [x] Daily Ritual Builder - NEW
- [x] Achievement Badges System (10 achievements) - NEW

## Prioritized Backlog
### P0 - Done
- All core features implemented
- Expanded yoga library (60 poses)
- Favorites & bookmarks
- Practice history & stats
- Ritual builder with timer
- Achievement badges

### P1 - Future Enhancements
- Audio recordings for mantras (external audio files)
- Push notifications for daily practice reminders
- Export practice journal

### P2 - Nice to Have
- Custom yoga sequences
- Community features
- Share rituals with friends
- Premium content/subscription
