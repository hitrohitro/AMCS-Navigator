# AMCS Navigator

Interactive campus navigation and timetable assistant for university students.

**Find your way around campus and manage your schedule seamlessly.**

---

## Quick Start

### Option 1: Docker (Published Image / Server Deployment)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
cp .env.example .env
docker compose up -d
```

Backend runs on: `http://localhost:8000`

This starts the published GHCR image defined in [docker-compose.yml](docker-compose.yml).

For local backend and frontend development, use Option 2 below.

### Option 2: Traditional Setup

Open **two separate terminals** in the project root:

**Terminal 1 - Backend:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Then visit: **http://localhost:5173**

---

## 📋 What Does This App Do?

- **Interactive Campus Map** - Visualize your campus with interactive block selection
- **Smart Route Finding** - Get shortest path between two locations with visual directions
- **Timetable Integration** - View your class schedule by program and semester
- **Smart Suggestions** - Auto-suggest next class location based on your schedule
- **Mobile Optimized** - Beautiful on phones, tablets, and desktops

---

## 📁 Project Structure

```
AMCS Navigator/
├── backend/          # FastAPI server (Python)
│   ├── app/
│   ├── main.py
│   └── requirements.txt
├── frontend/         # React + Vite (JavaScript)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── Dockerfile        # Backend containerization
├── docker-compose.yml # Published image orchestration
└── README.md         # You are here!
```

---

## 🛠 Tech Stack

| Component   | Technology                          |
| ----------- | ----------------------------------- |
| Backend API | Python + FastAPI                    |
| Frontend UI | React + Vite                        |
| Styling     | Pure CSS (dark-first design)        |
| Database    | Supabase (PostgreSQL)               |
| Deployment  | Render (backend), Vercel (frontend) |

---

## 🎯 Core Features

### 1. Interactive Campus Map

- Select start and destination blocks
- Choose floor levels (0-4)
- View real-time shortest path visualization
- See text-based directions

### 2. Timetable Management

- Browse by program and semester
- View class schedules by day
- Filter by time periods
- See room locations

### 3. Smart Navigation

- Auto-suggest your next class location
- View previous/current/next class options
- Quick access from timetable

### 4. Help & Guidance

- In-app tutorial for first-time users
- Interactive hints on map elements
- Responsive help across all screen sizes

---

## 💻 Development

### Backend Only

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

API Docs: http://localhost:8000/docs

### Frontend Only

```bash
cd frontend
npm install
npm run dev
```

### With Docker

```bash
# Start services
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f
```

---

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env` from [backend/.env.example](backend/.env.example):

```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
CORS_ORIGINS=http://localhost:5173
CORS_ORIGIN_REGEX=^https://.*\.vercel\.app$
```

### Frontend Environment Variables

Create `frontend/.env` from [frontend/.env.example](frontend/.env.example):

```
VITE_API_BASE_URL=http://localhost:8000
```

### Published Image Environment Variables

Create the root `.env` from [.env.example](.env.example):

```bash
GITHUB_OWNER_LOWER=your-github-owner
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
CORS_ORIGINS=https://your-frontend-domain.com
CORS_ORIGIN_REGEX=^https://.*\.vercel\.app$
```

Use the root `.env` when running [docker-compose.yml](docker-compose.yml). The backend and frontend `.env` files are for local non-Docker development only.

---

## 📱 User Flow

1. **Open App** - Visit http://localhost:5173
2. **Select Start Location** - Choose building block and floor
3. **Select Destination** - Pick where you want to go
4. **View Route** - See path on map + text directions
5. **View Timetable** (Optional) - Check your schedule
6. **Smart Navigate** (Optional) - Auto-jump to next class

---

## Deployment

### Backend (Render)

This repo includes `render.yaml` for automatic deployment:

1. Create new Blueprint service in [Render](https://render.com/)
2. Connect your GitHub repository
3. Render auto-detects configuration from `render.yaml`
4. Set environment variables in Render dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `CORS_ORIGINS` (e.g., `https://your-frontend.vercel.app`)

**Health Check:** `/health` endpoint (UptimeRobot compatible)

### Frontend (Vercel)

This repo includes `frontend/vercel.json` for automatic deployment:

1. Import repository in [Vercel](https://vercel.com/)
2. Set Project Root to `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Set environment variable:
   - `VITE_API_BASE_URL=https://your-render-backend.onrender.com`

### Container CI/CD (GitHub Actions + GHCR)

This repo now includes automatic Docker image publishing on every push via:

- `.github/workflows/docker-publish.yml`

Published image name:

- `ghcr.io/<github-owner-lowercase>/amcs-navigator`

The published image is what [docker-compose.yml](docker-compose.yml) pulls for server deployment.

Tags generated automatically:

- `latest` on default branch
- branch tags (for example: `main`)
- commit SHA tags

Required GitHub secret:

- `GH_PAT`: Personal Access Token with at least these scopes:
  - `write:packages`
  - `read:packages`
  - `repo`

How to set it:

1. GitHub repo -> Settings -> Secrets and variables -> Actions.
2. Click "New repository secret".
3. Name: `GH_PAT`
4. Value: your PAT token.

### Auto-Update Running Container

This repo includes:

- `docker-compose.yml` (published image + auto-updater)
- `.env.example` (root template for Docker/server deployment)
- `backend/.env.example` (backend local development template)
- `frontend/.env.example` (frontend local development template)

The container is named `amcs-navigator` (Docker container names cannot contain spaces).

Steps on your server/VM:

1. Copy `.env.example` to `.env` and fill values.
2. Start services:

```bash
docker compose up -d
```

`watchtower` checks every 30 seconds and updates the `amcs-navigator` container when a new `latest` image is available.

If the GHCR package is private, run `docker login ghcr.io` on the server first with a token that has `read:packages`.

---

### Docker

| Issue                    | Solution                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| Port 8000 already in use | `docker compose down` then retry                                                                |
| `Connection refused`     | Wait 5-10s for container to start, check `docker ps`                                            |
| Changes not reflected    | Push code and wait for Watchtower, or run `docker compose pull backend && docker compose up -d` |

### Backend

| Issue                        | Solution                                          |
| ---------------------------- | ------------------------------------------------- |
| `ModuleNotFoundError`        | Ensure venv is activated: `venv\Scripts\activate` |
| Import errors                | Run `pip install -r requirements.txt`             |
| Connection to Supabase fails | Check `SUPABASE_URL` and `SUPABASE_KEY` in `.env` |

### Frontend

| Issue                | Solution                                        |
| -------------------- | ----------------------------------------------- |
| Port 5173 in use     | Kill process or change port in `vite.config.js` |
| API connection fails | Ensure `VITE_API_BASE_URL` is correct           |
| Blank screen         | Check browser console for errors (F12)          |

---

## API Endpoints

| Endpoint                 | Method    | Purpose                                    |
| ------------------------ | --------- | ------------------------------------------ |
| `/health`                | GET, HEAD | Health check                               |
| `/api/locations`         | GET       | List all campus locations                  |
| `/api/path`              | GET       | Find shortest route between locations      |
| `/api/timetable/options` | GET       | Get programs, semesters, filters           |
| `/api/timetable`         | GET       | Fetch timetable entries                    |
| `/docs`                  | GET       | Interactive API documentation (Swagger UI) |

---

## Contributing

1. Clone the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and test locally
4. Commit: `git commit -m "Add your feature"`
5. Push: `git push origin feature/your-feature`
6. Open a pull request

---

## Notes

- **Frontend & Backend are separate** - Easier to maintain and scale independently
- **Campus data** - Managed in `frontend/data/campusData.js`
- **Routing algorithm** - BFS-based shortest path in `backend/app/navigation.py`
- **Database** - All persistent data stored in Supabase (no local database needed)
- **Real-time updates** - Timetable and location data fetched on-demand

---

## Monitoring

**Keep your server warm:**

- UptimeRobot pings `/health` endpoint every 5 minutes
- Prevents Render free tier from cold starting
- Configure at https://uptimerobot.com

---

## License

This project is part of the AMCS Navigator initiative.

---

## Need Help?

- Run `docker-compose logs -f` to see live logs
- Run `docker compose logs -f` to see live logs
- Visit `/docs` endpoint for API documentation
- Open an issue on GitHub with error details
