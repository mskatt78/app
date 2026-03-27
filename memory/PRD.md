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
- 13 practices via /api/feminine-embodiment with comprehensive deep teachings
- **Sacred Rites Section** (Munay Ki 9 Rites, Nusta Karpay 7 Rites, 13th Womb Rite 3 Aspects)

### Masculine Embodiment
- 13 practices via /api/masculine-embodiment with comprehensive deep teachings

### Breathwork Sessions
- 6 elemental breathwork sessions with deep teachings

### Sound Healing (Updated March 2026)
- 17 sound frequency entries including 6 Shamanic Drum types:
  - Classic Shamanic Drums (280 BPM)
  - Gentle Grounding Journey (90 BPM)
  - Classic Theta Journey (240 BPM)
  - Awakening Activation (420 BPM)
  - Fire Ceremony Syncopated rhythm
  - Journey Return Call (4-beat + 3-beat pattern)
- New "Shamanic Drums" filter tab in Sound Frequencies page

### Creative Processes (Deep Content - March 2026)
- 9 comprehensive practices with deep healing content:
  - Vision Quest Journaling
  - Shamanic Art Medicine
  - Dream Weaving Circle
  - Sacred Sound Creation
  - Medicine Bundle Creation
  - Ancestral Story Weaving
  - Forest Bathing — Shinrin-Yoku
  - **Sacred Smudging & Space Clearing** (NEW — standalone deep guide with 6 herb profiles)
  - Stone People Medicine
- Each practice includes:
  - `why_this_heals` — deep explanation of healing mechanism
  - `safety_precautions` — comprehensive safety guidance
  - `preparation` — preparation instructions
  - `integration` — post-practice integration
  - `therapeutic_benefits` — list of benefits
  - `process_steps` — detailed step-by-step

### Sacred Geometry Drawing Guides (Updated March 2026)
- Safety preparation section now prominently displayed before how-to-draw instructions
- 6 grounding/safety principles shown before each drawing guide

### Practice Journal (Updated March 2026)
- Practice streak tracking with milestone badges:
  - 3-Day Seeker, 7-Day Guardian, 14-Day Fortnight Keeper, 21-Day Initiation, 40-Day Sacred 40
- **Share to Sacred Circle** button on each expanded journal entry
  - POSTs to /api/community/posts with reflection content
  - Linked to community page

### Video Tutorials (NEW - March 2026)
- 15 tutorial videos seeded across 8 categories (shamanic, somatic, breathwork, creative, sacred_rites, sound, meditation, movement)
- PracticeVideos component with YouTube/Vimeo/direct embed support
- Accessible via /api/videos with category filter

### Community (Sacred Circle)
- Community posts with like/comment functionality
- POST /api/community/posts endpoint (for journal sharing)
- POST /api/community/posts/{id}/like endpoint

### Other Features
- Yoga Library (78 poses, 5 elements)
- Mudras Library (12 mudras)
- Crystal Healing (42 crystals)
- Tarot/Oracle readings
- Runes, I Ching
- Ancient Wisdom library
- Sacred Guardians
- Elemental Temples
- Water Practices
- Seasonal Temple

## Key API Endpoints
- `GET /api/sound-frequencies?category=shamanic` — filter for shamanic drums
- `GET /api/creative-processes` — 9 deep processes with safety content
- `GET /api/videos?category=shamanic` — video tutorials by category
- `GET /api/community/posts` — community posts
- `POST /api/community/posts` — create new post (journal sharing)
- `POST /api/community/posts/{id}/like` — like a post
- `GET /api/courses` — Sacred Rites (Munay Ki, Nusta Karpay, Womb Rite)
- `GET /api/light-codes/sacred-geometry` — Sacred Geometry symbols with drawing guides

## Key DB Schema
- `sound_frequencies`: 17 entries (6 shamanic drums)
- `creative_processes`: 9 deep entries with safety content
- `videos`: 15 tutorial entries across 8 categories
- `courses`: 3 sacred rites (munay-ki, nusta-karpay, 13th-rite-womb)
- `community_posts`: community reflections
- `chakra_cleansing`, `feminine_embodiment`, `masculine_embodiment`
- `elemental_temples`, `water_practices`

## Architecture
```
/app/
├── backend/
│   ├── data/
│   │   ├── creative_processes_deep.py (NEW - 9 deep practices with safety)
│   │   ├── video_content.py (NEW - 15 video tutorials)
│   │   ├── sound_frequencies.py (UPDATED - 5 new drum types)
│   │   ├── sacred_rites_deep.py
│   │   ├── elemental_temples_data.py
│   │   ├── water_practices_data.py
│   ├── routers/
│   │   ├── content.py (UPDATED - POST /community/posts endpoint)
│   ├── server.py (UPDATED - always reseeds creative_processes, videos, sacred_rites)
├── frontend/
│   ├── src/components/
│   │   ├── AmbientSoundPlayer.jsx (UPDATED - 5 new drum functions)
│   ├── src/pages/
│   │   ├── SoundFrequencies.jsx (UPDATED - Shamanic Drums filter tab)
│   │   ├── CreativeProcesses.jsx (UPDATED - shows safety, why_heals, integration)
│   │   ├── LightCodes.jsx (UPDATED - safety section before drawing guide)
│   │   ├── PracticeJournal.jsx (UPDATED - share to community + streak milestones)
```

## Remaining Backlog
- P3: Deeper production deployment seeding (pending platform support resolution)
- P3: Video URLs need to be updated with real YouTube IDs (currently placeholder)
- P3: More video tutorials per category
