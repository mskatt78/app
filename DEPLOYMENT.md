# Shamanic Elemental Yoga - Multi-Platform Deployment

## Quick Deploy Options

### 1. Vercel (Frontend) + Railway (Backend)
Best for: Production apps with good free tiers

### 2. Render
Best for: Simple full-stack deployment

### 3. DigitalOcean App Platform
Best for: Scalable production apps

### 4. Self-Hosted (Docker)
Best for: Full control, VPS hosting

---

## Environment Variables Required

### Backend (.env)
```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/shamanic_yoga
DB_NAME=shamanic_yoga
EMERGENT_LLM_KEY=your_key_here
CORS_ORIGINS=https://your-frontend-domain.com
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

---

## Platform-Specific Instructions

### Vercel (Frontend Only)
1. Push code to GitHub
2. Connect repo to Vercel
3. Set build settings:
   - Framework: Create React App
   - Root Directory: frontend
   - Build Command: yarn build
   - Output Directory: build
4. Add environment variable: REACT_APP_BACKEND_URL

### Railway (Backend + MongoDB)
1. Create new project
2. Add MongoDB from Railway's database options
3. Deploy backend from GitHub (select /backend folder)
4. Set environment variables from Railway's MongoDB
5. Your backend URL will be: https://your-app.up.railway.app

### Render
1. Create Web Service for backend
2. Create Static Site for frontend
3. Add MongoDB Atlas connection string
4. Set environment variables

### DigitalOcean App Platform
1. Create App from GitHub
2. Configure as monorepo (frontend + backend)
3. Add managed MongoDB or use Atlas
4. Set environment variables

### Docker Self-Hosted
```bash
docker-compose up -d
```
Access at: http://localhost:3000

---

## MongoDB Atlas Setup (Free Tier)
1. Go to mongodb.com/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP (0.0.0.0/0 for all)
5. Get connection string
6. Replace in MONGO_URL
