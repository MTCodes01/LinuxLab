# 🐧 LinuxLab

**Self-hosted disposable Linux environments for learning.**

LinuxLab allows administrators to provision isolated Linux containers that feel like real VPS machines. Users get a full Linux experience with browser-based terminal access, while the host server remains completely secure.

---

## ✨ Features

- **Admin Dashboard** — Beautiful dark-mode dashboard with glassmorphism design
- **Container Management** — Create, start, stop, restart, reset, delete containers
- **Browser Terminal** — Full xterm.js terminal via WebSocket (low-latency)
- **8 Linux Templates** — Ubuntu, Debian, Fedora, Alpine, Arch, Python Lab, C Dev Lab, Docker Lab
- **Resource Limits** — CPU, RAM, storage, PID limits per container
- **Security Hardened** — `--cap-drop ALL`, `no-new-privileges`, isolated networking
- **Activity Logs** — Full audit trail of all container actions
- **Session Tracking** — Track active terminal and SSH sessions
- **SSH Access** — Optional SSH port mapping per container
- **Live Monitoring** — Real-time CPU/RAM/Network stats via WebSocket

## 🛡️ Security

Every container is hardened with:
- `--cap-drop ALL` + selective `--cap-add`
- `--security-opt no-new-privileges:true`
- PID limits (256 max)
- CPU + RAM limits enforced
- Dedicated bridge network
- No Docker socket access from containers
- No host filesystem mounts
- No `--privileged` flag

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TailwindCSS v4, xterm.js, anime.js |
| Backend | FastAPI, Docker SDK for Python, SQLAlchemy (async) |
| Database | SQLite (dev) / PostgreSQL (production) |
| Auth | JWT (python-jose + bcrypt) |
| Infra | Docker, Docker Compose, Nginx |

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Setup

```bash
# Clone
git clone https://github.com/yourusername/LinuxLab.git
cd LinuxLab

# Configure
cp .env.example .env
# Edit .env with your settings (especially SECRET_KEY)

# Start
docker-compose up -d

# Access
open http://localhost
```

Default credentials: `admin` / `changeme`

### Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
LinuxLab/
├── backend/
│   ├── app/
│   │   ├── auth/          # JWT authentication
│   │   ├── containers/    # Container CRUD + Docker SDK
│   │   ├── templates/     # Environment templates
│   │   ├── terminal/      # WebSocket terminal bridge
│   │   ├── monitoring/    # Resource monitoring
│   │   ├── logs/          # Activity logging
│   │   └── sessions/      # Session tracking
│   └── templates/         # Dockerfiles for each distro
├── frontend/
│   └── src/
│       ├── auth/          # Login + auth context
│       ├── components/    # UI + layout components
│       └── pages/         # Dashboard, Containers, Terminal, etc.
├── nginx/                 # Reverse proxy config
├── docker-compose.yml     # Production orchestration
└── .env.example           # Configuration template
```

## 📋 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Admin login |
| `/api/auth/me` | GET | Current user |
| `/api/containers` | GET/POST | List/create containers |
| `/api/containers/{id}` | GET/DELETE | Get/delete container |
| `/api/containers/{id}/start` | POST | Start container |
| `/api/containers/{id}/stop` | POST | Stop container |
| `/api/containers/{id}/restart` | POST | Restart container |
| `/api/containers/{id}/reset` | POST | Reset to fresh state |
| `/api/containers/{id}/stats` | GET | Resource stats |
| `/api/templates` | GET/POST | List/create templates |
| `/api/logs` | GET | Activity logs |
| `/api/sessions` | GET | Session history |
| `/api/monitoring/overview` | GET | System overview |
| `/ws/terminal/{id}` | WS | Terminal WebSocket |
| `/ws/monitoring/{id}` | WS | Live stats WebSocket |

## 📄 License

MIT
