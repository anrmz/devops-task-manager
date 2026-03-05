# Technical Report — DevOps Task Manager

| Field | Value |
|---|---|
| **Student** | Anouar Mezgualli |
| **School** | ENSI Tanger |
| **Professor** | Pr. KOUISSI Mohamed |
| **Subject** | DevOps Mini Project |
| **Date** | March 2026 |

---

## 1. Introduction

This report documents the design and implementation of a **DevOps Task Manager** application. The goal is not to build a complex application, but to demonstrate proficiency in DevOps practices: containerization, continuous integration, continuous delivery, code quality analysis, and automated notifications.

The project applies industry-standard tools in a realistic workflow that mirrors professional software delivery pipelines.

---

## 2. Project Objective

Design and deploy a multi-container web application following DevOps best practices:

- Containerize all components with Docker
- Automate builds and tests with GitHub Actions
- Orchestrate the full CI/CD pipeline with Jenkins
- Enforce code quality using SonarQube
- Notify the team through Slack

---

## 3. Application Architecture

The application is a simple **Task Manager** with three operations: Add, List, and Delete tasks.

### Stack

| Layer | Technology | Port |
|---|---|---|
| Frontend | React + Nginx | 3000 |
| Backend | Node.js + Express | 5000 |
| Database | MongoDB | 27017 |

```
┌─────────────────────────────────────┐
│           Browser (User)            │
└──────────────┬──────────────────────┘
               │ HTTP :3000
┌──────────────▼──────────────────────┐
│     Frontend Container (Nginx)      │
│     React SPA served by Nginx       │
│     /tasks → proxy → backend:5000   │
└──────────────┬──────────────────────┘
               │ Internal Docker Network
┌──────────────▼──────────────────────┐
│     Backend Container (Node.js)     │
│     Express REST API                │
│     GET/POST/DELETE /tasks          │
└──────────────┬──────────────────────┘
               │ Internal Docker Network
┌──────────────▼──────────────────────┐
│     MongoDB Container               │
│     Persistent data volume          │
└─────────────────────────────────────┘
```

---

## 4. System Architecture — CI/CD Pipeline

```
Developer → Push to GitHub
              │
              ▼
    ┌─────────────────────┐
    │  GitHub Repository  │
    └───────┬─────────────┘
            │
     ┌──────┴───────┐
     │              │
     ▼              ▼
GitHub Actions   GitHub Webhook
(CI)             (trigger Jenkins)
     │              │
     ▼              ▼
  ┌─────┐      ┌──────────┐
  │Tests│      │ Jenkins  │
  │Build│      │ Pipeline │
  └─────┘      └────┬─────┘
                    │
          ┌─────────┼──────────┐
          ▼         ▼          ▼
       Install    Tests    SonarQube
          │         │          │
          └────┬────┘          │
               ▼               │
         Docker Build ◄────────┘
               │
               ▼
         Docker Compose Up
               │
               ▼
         Slack Notification
         ✅ Success / ❌ Failure
```

---

## 5. Tools Explained

### 5.1 GitHub
**Role**: Source code management and collaboration platform.

GitHub hosts the project repository, manages branches (main/develop), and acts as the central hub triggering all automation.

**Configuration**: A Webhook is configured under `Repository → Settings → Webhooks` to send a POST request to Jenkins on every `push` event.

---

### 5.2 GitHub Actions
**Role**: Continuous Integration (CI).

GitHub Actions runs automated checks on every push or pull request:

| Job | What it does |
|---|---|
| `backend-ci` | Installs dependencies, runs Jest tests against a real MongoDB container |
| `frontend-ci` | Installs React deps, runs the production build, uploads the artifact |
| `docker-build` | Builds both Docker images to validate Dockerfiles |

File: `.github/workflows/ci.yml`

---

### 5.3 Jenkins
**Role**: CI/CD Orchestration.

Jenkins is the primary pipeline engine. It is triggered automatically by the GitHub Webhook and runs the following stages:

| Stage | Description |
|---|---|
| 📥 Checkout | Pulls source code from GitHub |
| 📦 Install | Installs npm dependencies (parallel: frontend + backend) |
| 🧪 Tests | Runs Jest backend test suite |
| 🔍 SonarQube | Runs static code analysis |
| 🐳 Docker Build | Builds container images with `docker compose build` |
| 🚀 Deploy | Starts the full stack with `docker compose up -d` |
| 📣 Notify | Sends Slack message (success or failure) |

**Required Jenkins Plugins:**
- Git Plugin
- Pipeline Plugin
- GitHub Integration Plugin
- SonarQube Scanner Plugin

**Required Jenkins Credentials:**
| ID | Type | Value |
|---|---|---|
| `slack-webhook-url` | Secret text | Slack Incoming Webhook URL |
| `sonar-token` | Secret text | SonarQube authentication token |

---

### 5.4 Docker
**Role**: Application containerization.

Each service is packaged in an isolated Docker container, ensuring environment consistency.

**Backend Dockerfile** (`docker/Dockerfile.backend`):
- Base: `node:20-alpine` (minimal footprint)
- Non-root user for security
- Health check on `/health`

**Frontend Dockerfile** (`docker/Dockerfile.frontend`):
- **Multi-stage build**: Stage 1 = Node build, Stage 2 = Nginx serve
- Final image is ~25MB (no Node.js runtime in production)
- Nginx proxies `/tasks` to the backend container

---

### 5.5 Docker Compose
**Role**: Multi-container orchestration for local and production deployment.

`docker-compose.yml` defines three services with proper startup ordering:

```
MongoDB (healthy) → Backend (healthy) → Frontend
```

**One command to start the entire stack:**
```bash
docker compose up --build
```

---

### 5.6 SonarQube
**Role**: Static code quality analysis.

SonarQube scans the codebase for:
- Code smells
- Bugs
- Security vulnerabilities
- Test coverage metrics

**Setup:**
1. Run SonarQube with Docker: `docker run -d -p 9000:9000 sonarqube:community`
2. Access `http://localhost:9000` and create a project + token
3. Add token to Jenkins credential `sonar-token`
4. Configure SonarQube server in Jenkins under `Manage Jenkins → Configure System`

**Config file**: `sonar-project.properties`

---

### 5.7 Slack
**Role**: Real-time pipeline notifications.

The Jenkins pipeline sends a Slack message using an **Incoming Webhook** after every pipeline run.

**Setup:**
1. Go to `https://api.slack.com/apps` → Create App → Incoming Webhooks
2. Enable and add to a channel, copy the Webhook URL
3. Store URL in Jenkins credential `slack-webhook-url`

**Messages sent:**
- ✅ Green attachment when pipeline passes
- ❌ Red attachment when pipeline fails

---

## 6. Pipeline Execution Steps

```bash
# 1. Developer pushes to GitHub
git add .
git commit -m "feat: add new task endpoint"
git push origin main

# 2. GitHub Actions runs automatically
#    → Tests → Build → Docker validation

# 3. GitHub Webhook triggers Jenkins
#    → All 6 pipeline stages run

# 4. Application is deployed
curl http://localhost:3000   # Frontend
curl http://localhost:5000/health  # Backend API

# 5. Slack message received in channel
```

---

## 7. Conclusion

This project demonstrates a complete, industry-grade DevOps pipeline for a real multi-container application. All components — from source code to deployment — are automated:

- **Code quality** is enforced by SonarQube before deployment
- **Automated testing** runs on every commit via GitHub Actions and Jenkins
- **Containerization** with Docker ensures reproducible deployments
- **Slack notifications** provide instant feedback to the developer

The architecture follows the **Continuous Integration / Continuous Delivery (CI/CD)** best practices and is designed to be extensible for more complex applications.

---

*Report generated for ENSI Tanger — DevOps Course — Pr. KOUISSI Mohamed*
