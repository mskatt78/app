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

### Sacred Rites — Premium Courses (Updated March 2026)
- **3 Sacred Rite courses** (Munay Ki, Nusta Karpay, 13th Womb Rite)
- Each course has **7 tabs**: The Rites | Rituals | Embodiment | Prepare & Integrate | Daily Practice | 40-Day Journey | Safety
- **Premium badge** ("Sacred Course") visible on course cards
- `is_premium: True` flag on all 3 courses (ready for Stripe lock)
- **40-Day Integration Calendar** with phased journey, daily focus, journaling prompts
- **Daily Practice** - named ceremony with full step-by-step (Morning Mesa Activation, Goddess Body Prayer, 13-Minute Womb Meditation)
- **Ceremony Preparation Guide** with altar items + preparation steps
- **Safety Precautions** comprehensive for each tradition

### Dashboard (Updated March 2026)
- **Practice Streak Widget**: Flame + streak count + week dots (Mon-Sun) + milestone badges
  - Milestones: 3-Day Seeker, 7-Day Guardian, 14-Day Fortnight Keeper, 21-Day Initiation, Sacred 40
  - Reads from localStorage journal entries
  - Quick "Journal" CTA button

### Sound Healing (Updated March 2026)
- 17 sound frequency entries including 6 Shamanic Drum types:
  - Classic Shamanic Drums (280 BPM)
  - Gentle Grounding Journey (90 BPM)
  - Classic Theta Journey (240 BPM)
  - Awakening Activation (420 BPM)
  - Fire Ceremony Syncopated rhythm
  - Journey Return Call (4-beat + 3-beat pattern)
- **"Shamanic Drums" filter tab** in Sound Frequencies page

### Creative Processes (Deep Content — March 2026)
- 9 comprehensive practices with safety, why_this_heals, preparation, integration
- **Sacred Smudging & Space Clearing** — standalone deep guide with 6 herb profiles
- "ceremony" category filter tab added

### Practice Journal (Updated March 2026)
- Streak milestones: 3, 7, 14, 21, 40-day badges
- **Share to Sacred Circle** → POST /api/community/posts

### Community Sacred Circle
- POST /api/community/posts — create posts (from journal sharing)
- POST /api/community/posts/{id}/like
- GET /api/community/posts

### Video Tutorials (NEW)
- 15 tutorial entries seeded across 8 categories
- Placeholder YouTube URLs (needs real IDs)

### Sacred Geometry Drawing Guides
- Safety preparation section before every drawing guide

## Key API Endpoints
- `GET /api/courses` — 3 Sacred Rites with all new deep fields
- `GET /api/courses/{id}` — Full course: is_premium, forty_day_integration, daily_practice, ceremony_preparation_guide, safety_precautions
- `GET /api/sound-frequencies?category=shamanic` — 5 drum journeys
- `GET /api/creative-processes` — 9 deep processes with safety content
- `GET /api/videos?category=<type>` — video tutorials
- `POST /api/community/posts` — share reflections to community

## Key DB Schema
- `courses`: 3 sacred rites, all with new deep fields
- `sound_frequencies`: 17 entries (6 shamanic drums, 5 with new BPM types)
- `creative_processes`: 9 deep entries with safety content
- `videos`: 15 tutorial entries

## Remaining Backlog
- **P1**: Update video tutorial URLs with real YouTube educational video IDs
- **P1**: Stripe payment integration to lock premium Sacred Rite courses
- **P2**: Community page improvements (reply threading, post filtering)
- **P2**: Chakra Cleansing deeper embodiment + safety precautions
- **P2**: Elemental Temples full ceremony guides
- **P3**: Yoga poses spiritual purpose + energetic effects
- **P3**: Production deployment fix (awaiting Emergent platform support)
- **P3**: More video tutorials per category

## Architecture
```
/app/
├── backend/
│   ├── data/
│   │   ├── creative_processes_deep.py — 9 deep practices with safety
│   │   ├── video_content.py — 15 video tutorials
│   │   ├── sound_frequencies.py — 17 entries (6 drums)
│   │   ├── sacred_rites_deep.py — 3 rites with 40-day calendar, daily practice, safety
│   ├── routers/
│   │   ├── content.py — POST /community/posts + like endpoint
│   ├── server.py — reseeds creative_processes, videos, sacred_rites on every startup
├── frontend/
│   ├── src/pages/
│   │   ├── Dashboard.jsx — StreakWidget component
│   │   ├── Courses.jsx — 7-tab modal, premium badge, new tabs
│   │   ├── SoundFrequencies.jsx — Shamanic Drums filter
│   │   ├── CreativeProcesses.jsx — ceremony filter, safety/why_heals UI
│   │   ├── LightCodes.jsx — safety section before drawing guide
│   │   ├── PracticeJournal.jsx — share + streak milestones
│   ├── src/components/
│   │   ├── AmbientSoundPlayer.jsx — 5 new drum functions
```
