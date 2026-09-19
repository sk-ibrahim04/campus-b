# CAMPUSSYNAPSE DEPLOYMENT GUIDE

## 1. Architecture Overview
- **Frontend**: Static React bundle hosted on Vercel / Netlify / Cloudflare Pages.
- **Backend API & WebSockets**: Node.js service hosted on Render / Railway / AWS ECS.
- **Optimization Service**: Python FastAPI + OR-Tools on Render / Railway / Google Cloud Run.
- **Database**: Managed MongoDB Atlas M0/M10 cluster.

---

## 2. Environment Variables

### Backend API (`apps/api/.env`)
```bash
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/campussynapse?retryWrites=true&w=majority
JWT_SECRET=production_strong_secret_key_sih2026
OPTIMIZER_URL=https://campussynapse-optimizer.onrender.com
CLIENT_URL=https://campussynapse.vercel.app
GEMINI_API_KEY=AIzaSy...
```

### Frontend Web (`apps/web/.env`)
```bash
VITE_API_URL=https://campussynapse-api.onrender.com/api
VITE_SOCKET_URL=https://campussynapse-api.onrender.com
```

---

## 3. Deployment Steps

### Vercel (Frontend)
1. Link GitHub repository `sk-ibrahim04/campus-f`.
2. Root Directory: `apps/web` (or root of repository if pushed to campus-f).
3. Build Command: `npm run build`
4. Output Directory: `dist`

### Render (Backend API)
1. Link GitHub repository `sk-ibrahim04/campus-b`.
2. Environment: Node
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run start`

### Render / Cloud Run (Python Optimizer)
1. Dockerfile or Python runtime: `services/optimizer`
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
