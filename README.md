# PrimeTrade AI — Scalable REST API with Auth & Role-Based Access

> **Backend Developer Intern Assignment** — Scalable REST API with JWT Authentication, Role-Based Access Control, Task Management CRUD, and a React frontend. Deployed live on Render.

---

## Live Demo

| Service   | URL |
|-----------|-----|
| Frontend  | https://primetradeai-1-zegb.onrender.com |
| API Base  | https://primetradeai-l00y.onrender.com/api/v1 |
| Swagger Docs | https://primetradeai-l00y.onrender.com/api-docs |
| Health Check | https://primetradeai-l00y.onrender.com/health |

**Demo credentials:**

| Role  | Email               | Password     |
|-------|---------------------|--------------|
| Admin | admin@primetrade.ai | Admin@123456 |
| User  | user@primetrade.ai  | User@123456  |

---

## Assignment Checklist

### Backend
- [x] User registration & login with bcrypt password hashing
- [x] JWT authentication (access token + rotating refresh token)
- [x] Role-based access control — `USER` vs `ADMIN`
- [x] CRUD APIs for Tasks (title, description, status, priority, due date)
- [x] API versioning (`/api/v1/`)
- [x] Request validation with Zod (all endpoints)
- [x] Centralised error handling with proper HTTP status codes
- [x] Swagger / OpenAPI 3.0 documentation
- [x] PostgreSQL database schema via Prisma ORM

### Frontend
- [x] Built with React 18 + Vite + TypeScript
- [x] Register & login pages with field-level validation messages
- [x] Protected dashboard (redirects to login if no JWT)
- [x] Full CRUD on Tasks — create, edit, delete, filter, search, paginate
- [x] Admin dashboard — manage users, change roles, activate/deactivate
- [x] Error and success messages from API responses

### Security & Scalability
- [x] Secure JWT handling — short-lived access tokens, rotating refresh tokens
- [x] Input sanitisation and validation (Zod schemas)
- [x] Rate limiting — global + stricter auth-endpoint limits
- [x] Security headers via Helmet.js
- [x] CORS restricted to frontend origin
- [x] Winston structured logging + Morgan HTTP logs
- [x] Scalable modular project structure
- [x] Deployed to Render (PostgreSQL + backend + frontend)

---

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Backend    | Node.js, Express, TypeScript                |
| Database   | PostgreSQL + Prisma ORM                     |
| Auth       | JWT (access + refresh tokens), bcrypt       |
| Validation | Zod                                         |
| API Docs   | Swagger / OpenAPI 3.0                       |
| Frontend   | React 18, Vite, React Router v6, Axios      |
| Security   | Helmet, CORS, express-rate-limit            |
| Logging    | Winston + Morgan                            |
| Deployment | Render (Node web service + static site + PostgreSQL) |

---

## Project Structure

```
PrimeTradeAI/
├── render.yaml                  # One-click Render deployment config
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # DB schema — User, Task, RefreshToken
│   │   └── seed.ts              # Seed admin + demo user
│   └── src/
│       ├── config/              # DB client, Winston logger, Swagger spec
│       ├── controllers/         # auth.controller, task.controller, admin.controller
│       ├── middleware/          # authenticate, requireRole, validate, errorHandler, rateLimiter
│       ├── routes/v1/           # Versioned routes — auth, tasks, admin, seed
│       ├── types/               # Shared TypeScript types (AuthRequest, ApiResponse)
│       ├── utils/               # jwt.ts, response.ts, AppError.ts
│       ├── validators/          # Zod schemas — auth.validator, task.validator
│       ├── app.ts               # Express app (middleware, routes, error handling)
│       └── server.ts            # Entry point with graceful shutdown
└── frontend/
    └── src/
        ├── components/          # Navbar, Sidebar, TaskCard, TaskModal
        ├── context/             # AuthContext — login, register, logout
        ├── hooks/               # useTasks — CRUD + pagination
        ├── pages/               # LoginPage, RegisterPage, DashboardPage, TasksPage, AdminUsersPage
        └── services/            # Axios instance with auto JWT refresh interceptor
```

---

## Database Schema

```
User
  id            String        @id @default(cuid())
  email         String        @unique
  username      String        @unique
  passwordHash  String
  role          Role          USER | ADMIN
  isActive      Boolean       default true
  createdAt     DateTime
  updatedAt     DateTime

Task
  id            String        @id @default(cuid())
  title         String
  description   String?
  status        TaskStatus    TODO | IN_PROGRESS | DONE
  priority      TaskPriority  LOW | MEDIUM | HIGH
  dueDate       DateTime?
  userId        String        FK → User (cascade delete)
  createdAt     DateTime
  updatedAt     DateTime

RefreshToken
  id            String        @id @default(cuid())
  token         String        @unique
  userId        String        FK → User (cascade delete)
  expiresAt     DateTime
  createdAt     DateTime
```

---

## API Reference

### Auth — `/api/v1/auth`

| Method | Endpoint    | Auth | Description                        |
|--------|-------------|------|------------------------------------|
| POST   | `/register` | No   | Register, returns JWT tokens       |
| POST   | `/login`    | No   | Login, returns JWT tokens          |
| POST   | `/refresh`  | No   | Rotate access + refresh tokens     |
| POST   | `/logout`   | Yes  | Revoke refresh token               |
| GET    | `/me`       | Yes  | Get current user profile           |

### Tasks — `/api/v1/tasks`

| Method | Endpoint | Auth       | Description                                |
|--------|----------|------------|--------------------------------------------|
| GET    | `/`      | User/Admin | List tasks (own tasks; admin sees all)     |
| POST   | `/`      | User/Admin | Create task                                |
| GET    | `/:id`   | User/Admin | Get task by ID                             |
| PATCH  | `/:id`   | User/Admin | Update task                                |
| DELETE | `/:id`   | User/Admin | Delete task                                |

Query params: `page`, `limit`, `status`, `priority`, `search`

### Admin — `/api/v1/admin` (ADMIN only)

| Method | Endpoint                   | Description              |
|--------|----------------------------|--------------------------|
| GET    | `/stats`                   | Platform statistics      |
| GET    | `/users`                   | List all users           |
| GET    | `/users/:id`               | Get user + their tasks   |
| PATCH  | `/users/:id/role`          | Change user role         |
| PATCH  | `/users/:id/toggle-status` | Activate / deactivate    |

---

## Security Implementation

| Practice | Implementation |
|---|---|
| Password hashing | bcrypt, salt rounds = 12 |
| Access tokens | JWT, 7-day expiry, signed with `JWT_SECRET` |
| Refresh tokens | JWT, 30-day expiry, rotated on every use (replay attack prevention) |
| Input validation | Zod schemas — every route, every field, with typed error messages |
| Auth middleware | `authenticate` verifies Bearer token; `requireRole()` checks RBAC |
| Rate limiting | Global: 100 req / 15 min · Auth endpoints: 10 req / 15 min |
| Security headers | Helmet.js — CSP, HSTS, X-Content-Type, XSS protection |
| CORS | Restricted to `FRONTEND_URL` env var only |
| Trust proxy | Enabled for accurate IP detection behind Render's load balancer |

---

## Scalability Design

### Current Architecture
```
Browser → Render CDN → Frontend (static) → Backend API → PostgreSQL
```

### Scaling Path

1. **Stateless JWT** — No server-side sessions. Any number of API replicas can handle any request. Drop in a load balancer (Nginx / AWS ALB) and scale horizontally immediately.

2. **Database connection pooling** — Add PgBouncer in front of PostgreSQL to handle connection limits across replicas. Promote to read replicas for read-heavy workloads.

3. **Redis caching layer** — Cache frequent reads (user profiles, task counts), store refresh tokens (faster than DB), and share rate-limit counters across all instances.

4. **Microservices decomposition** — Modules are already cleanly separated:
   - `auth-service` — registration, login, token lifecycle
   - `task-service` — task CRUD
   - `notification-service` — due-date reminders (future)

5. **Message queue** — BullMQ + Redis for background jobs (email notifications, report generation) without blocking the request thread.

6. **Containerisation** — Each service ships as a Docker image. Kubernetes HPA auto-scales based on CPU / memory thresholds.

7. **API versioning** — Already at `/api/v1/`. Breaking changes go to `/api/v2/` without affecting existing clients.

---

## Local Setup

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14

### Steps

```bash
# 1. Clone
git clone https://github.com/its-ss/primetradeai.git
cd primetradeai

# 2. Backend
cd backend
npm install
cp .env.example .env       # fill in DB credentials + JWT secrets
npx prisma db push         # create tables
npx ts-node prisma/seed.ts # seed demo users
npm run dev                # http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
npm install
# No .env needed locally — Vite proxy forwards /api → localhost:5000
# For production builds, copy and fill in the API URL:
# cp .env.example .env.local
npm run dev                # http://localhost:3000
```

**Swagger docs (local):** http://localhost:5000/api-docs

---

## Deploy to Render

A `render.yaml` at the root auto-provisions everything with one click.

1. Push repo to GitHub
2. Render dashboard → **New** → **Blueprint** → connect repo → **Apply**
3. Three services are created: PostgreSQL DB, backend web service, frontend web service
4. Add env vars to the backend service (see `backend/.env.example`)
5. Hit the seed endpoint once to populate demo data:
   ```
   https://<your-backend>.onrender.com/api/v1/seed?secret=<SEED_SECRET>
   ```
6. Set `SEED_DONE=true` in the backend env vars to disable the seed endpoint

### Environment Variables

| Variable               | Description                           | Default                 |
|------------------------|---------------------------------------|-------------------------|
| `DATABASE_URL`         | PostgreSQL connection string          | Required                |
| `JWT_SECRET`           | Access token signing secret           | Required                |
| `JWT_EXPIRES_IN`       | Access token lifetime                 | `7d`                    |
| `JWT_REFRESH_SECRET`   | Refresh token signing secret          | Required                |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime              | `30d`                   |
| `PORT`                 | Server port                           | `5000`                  |
| `NODE_ENV`             | Environment                           | `development`           |
| `FRONTEND_URL`         | CORS allowed origin (comma-separated) | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms               | `900000`                |
| `RATE_LIMIT_MAX`       | Max requests per window               | `100`                   |
| `SEED_SECRET`          | Secret key to trigger seed endpoint   | —                       |
| `SEED_DONE`            | Set to `true` to disable seed route   | `false`                 |

#### Frontend (`frontend/.env.example`)

| Variable        | Description                                        | Default |
|-----------------|----------------------------------------------------|---------|
| `VITE_API_URL`  | Backend API base URL (baked in at Vite build time) | *(uses Vite proxy in dev — no value needed locally)* |
