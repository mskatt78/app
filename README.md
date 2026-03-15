# Shamanic Elemental Yoga

A sacred yoga, breathwork, and shamanic practices app with AI-powered oracle readings.

## Features
- 🧘 60 Yoga Poses with AI-generated sacred imagery
- 🔮 Oracle Readings powered by Claude AI
- 🌬️ Breathwork Sessions with interactive timer
- 🌙 13-Month Lunar Astrology Calendar
- 💎 Crystal Guide
- 🕉️ Mantras with Audio
- 🙏 12 Sacred Mudras
- 🌍 Elemental Practices (Earth, Water, Fire, Air, Spirit)
- 📿 Shamanic Journeys & Practices
- 🏆 Achievement System
- 📔 Sacred Journal
- ⏱️ Daily Ritual Builder

## Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion
- **Backend:** FastAPI, Python
- **Database:** MongoDB
- **AI:** Claude Sonnet 4.5

## Quick Start

### Local Development
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend
cd frontend
yarn install
yarn start
```

### Docker
```bash
docker-compose up -d
```

## Deployment Options

| Platform | Type | Free Tier |
|----------|------|-----------|
| Vercel | Frontend | Yes |
| Railway | Backend + DB | $5 credit |
| Render | Full Stack | Yes |
| Netlify | Frontend | Yes |
| DigitalOcean | Full Stack | No |

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Environment Variables

### Backend
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=shamanic_yoga
EMERGENT_LLM_KEY=your_key
CORS_ORIGINS=http://localhost:3000
```

### Frontend
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## PWA Support
This app is a Progressive Web App. Users can install it on mobile:
- **iOS:** Safari → Share → Add to Home Screen
- **Android:** Chrome → Menu → Add to Home Screen

## License
MIT
