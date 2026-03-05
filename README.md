<div align="center">

# 🚀 DevOps Task Manager

**A full-stack Task Manager application built for a university DevOps mini project**

[![CI Pipeline](https://github.com/anrmz/devops-task-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/anrmz/devops-task-manager/actions)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)
![Jenkins](https://img.shields.io/badge/Jenkins-pipeline-D33833?logo=jenkins)
![SonarQube](https://img.shields.io/badge/SonarQube-configured-4E9BCD?logo=sonarqube)

**Student:** Anouar Mezgualli · **School:** ENSI Tanger · **Prof.:** Pr. KOUISSI Mohamed

</div>

---

## 📋 Project Description

A simple but professionally structured **Task Manager** web application demonstrating a complete DevOps workflow with:

- Multi-container Docker architecture
- Full CI/CD pipeline (GitHub Actions + Jenkins)
- Code quality analysis with SonarQube
- Slack notifications on pipeline events

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────┐
│                      docker-compose                        │
│                                                            │
│   ┌─────────────┐   ┌─────────────┐   ┌───────────────┐   │
│   │  Frontend   │──▶│   Backend   │──▶│   MongoDB     │   │
│   │ React+Nginx │   │ Node+Express│   │   Database    │   │
│   │  :3000      │   │   :5000     │   │   :27017      │   │
│   └─────────────┘   └─────────────┘   └───────────────┘   │
│                                                            │
│              [taskmanager-net bridge network]              │
└────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | React 18, Axios, React-Toastify, Nginx |
| Backend | Node.js 20, Express 4, Mongoose |
| Database | MongoDB 7.0 |
| Containerization | Docker + Docker Compose |
| CI | GitHub Actions |
| CD & Orchestration | Jenkins |
| Code Quality | SonarQube |
| Notifications | Slack Incoming Webhooks |

---

## 🚦 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Run the application

```bash
# 1. Clone the repository
git clone https://github.com/anrmz/devops-task-manager.git
cd devops-task-manager

# 2. Start all containers
docker compose up --build

# 3. Open in browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Health check: http://localhost:5000/health
```

### Stop the application

```bash
docker compose down
```

### Reset data (remove MongoDB volume)

```bash
docker compose down -v
```

---

## 📁 Project Structure

```
devops-task-manager/
├── frontend/                  # React application
│   ├── src/
│   │   ├── App.js             # Main component
│   │   ├── App.css            # Global styles
│   │   └── components/
│   │       ├── TaskCard.js    # Task display component
│   │       └── AddTask.js     # Task creation form
│   ├── public/index.html
│   └── package.json
│
├── backend/                   # Node.js REST API
│   ├── src/
│   │   ├── server.js          # Express entry point
│   │   ├── models/Task.js     # Mongoose schema
│   │   ├── routes/tasks.js    # Route definitions
│   │   └── controllers/       # Business logic
│   ├── tests/api.test.js      # Jest tests
│   └── package.json
│
├── docker/
│   ├── Dockerfile.backend     # Backend container
│   ├── Dockerfile.frontend    # Multi-stage frontend build
│   └── nginx.conf             # Nginx SPA config + proxy
│
├── .github/
│   └── workflows/ci.yml       # GitHub Actions CI
│
├── docker-compose.yml         # Docker orchestration
├── Jenkinsfile                # Jenkins pipeline
├── sonar-project.properties   # SonarQube config
├── docs/report.md             # Technical report
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasks` | Get all tasks |
| `POST` | `/tasks` | Create a new task |
| `DELETE` | `/tasks/:id` | Delete a task by ID |
| `GET` | `/health` | Health check |

**Example:**
```bash
# Create a task
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Configure Jenkins pipeline"}'

# Get all tasks
curl http://localhost:5000/tasks
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Automatic on push)

```
Push to GitHub
    │
    ▼
[backend-ci]        [frontend-ci]
  └── npm install     └── npm install
  └── Jest tests      └── npm run build
                      └── Upload artifact
    │                   │
    └───────┬───────────┘
            ▼
    [docker-build]
      └── Build backend image
      └── Build frontend image
```

### Jenkins Pipeline (Triggered via GitHub Webhook)

```
[Checkout] → [Install Deps*] → [Tests] → [SonarQube] → [Docker Build] → [Deploy] → [Slack Notify]
                  * parallel frontend + backend
```

### Configuring the GitHub Webhook → Jenkins

1. In your Jenkins server, install: **GitHub Integration Plugin**
2. Create a Pipeline job pointing to this repository
3. In GitHub: `Repository → Settings → Webhooks → Add webhook`
   - **URL**: `http://YOUR_JENKINS_SERVER/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Just the push event

---

## 🔍 SonarQube Setup

```bash
# Start SonarQube locally (one-time setup)
docker run -d --name sonarqube -p 9000:9000 sonarqube:community

# Access at http://localhost:9000
# Default credentials: admin / admin

# Run analysis manually
sonar-scanner \
  -Dsonar.projectKey=devops-task-manager \
  -Dsonar.token=YOUR_SONAR_TOKEN
```

In Jenkins: `Manage Jenkins → Configure System → SonarQube Servers` → add your server URL and token credential.

---

## 📣 Slack Notifications

1. Go to https://api.slack.com/apps → **Create New App** → **From Scratch**
2. Enable **Incoming Webhooks** → Add to Workspace → Select channel
3. Copy the Webhook URL
4. In Jenkins: `Manage Jenkins → Credentials → Add` → Secret text, ID: `slack-webhook-url`

The Jenkins pipeline sends:
- ✅ **Green** message on pipeline success
- ❌ **Red** message on pipeline failure

---

## 📄 Documentation

Full technical report: [`docs/report.md`](docs/report.md)

---

<div align="center">
  <sub>ENSI Tanger ·  DevOps Course · Pr. KOUISSI Mohamed · March 2026</sub>
</div>
