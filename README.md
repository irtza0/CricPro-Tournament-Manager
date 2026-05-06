# 🏏 Cricket Tournament & Statistics Manager

A full-stack web application for managing cricket tournaments, teams, players, scorecards, and statistics with role-based access control.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Database** | PostgreSQL 15 |
| **Backend** | Node.js + Express.js |
| **Frontend** | React 18 + Vite + Tailwind CSS 3 |
| **Auth** | JWT + bcryptjs |
| **Testing** | Jest + Supertest |
| **DevOps** | Docker + Docker Compose |

## 📁 Project Structure

```
├── database/
│   ├── schema.sql          # Complete DB schema (10 tables)
│   ├── seed.sql            # Sample data
│   └── queries.sql         # Analytical queries
├── backend/
│   ├── src/
│   │   ├── config/database.js    # PostgreSQL connection pool
│   │   ├── middleware/auth.js     # JWT + RBAC middleware
│   │   ├── routes/
│   │   │   ├── auth.js           # Register/Login/Me
│   │   │   ├── users.js          # User CRUD (Admin)
│   │   │   ├── teams.js          # Team CRUD
│   │   │   ├── players.js        # Player CRUD + Search
│   │   │   ├── tournaments.js    # Tournament management
│   │   │   ├── matches.js        # Match scheduling
│   │   │   ├── scorecards.js     # Score entry
│   │   │   └── stats.js          # Leaderboards & analytics
│   │   └── server.js             # Express entry point
│   ├── __tests__/api.test.js     # Backend tests
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/Layout.jsx  # Sidebar + navigation
│   │   ├── context/AuthContext.jsx # Auth state management
│   │   ├── services/api.js        # Axios API client
│   │   ├── pages/
│   │   │   ├── Login.jsx / Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Teams.jsx / TeamDetail.jsx
│   │   │   ├── Players.jsx
│   │   │   ├── Tournaments.jsx / TournamentDetail.jsx
│   │   │   ├── Matches.jsx / MatchDetail.jsx
│   │   │   ├── ScorecardEntry.jsx
│   │   │   └── Leaderboard.jsx
│   │   ├── App.jsx / main.jsx
│   │   └── index.css              # Design system
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### 1. Database Setup

```bash
# Create database
createdb cricket_tournament

# Run schema
psql -d cricket_tournament -f database/schema.sql

# Load seed data
psql -d cricket_tournament -f database/seed.sql
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env  # Edit with your DB credentials
npm install
npm run dev
```

The API will run at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The UI will run at `http://localhost:5173`

### Docker (Full Stack)

```bash
docker-compose up -d
# App at http://localhost:3000
# API at http://localhost:5000
```

## 🔐 User Roles

| Role | Permissions |
|------|------------|
| **Admin** | Full CRUD on all entities, user management |
| **Team Manager** | Manage own team players, enter scorecards |
| **Fan** | View-only access to all public data |

### Demo Credentials
- Admin: `admin@cricket.com` / `password123`
- Manager: `virat@cricket.com` / `password123`
- Fan: `fan@cricket.com` / `password123`

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login & get JWT |
| GET | `/api/auth/me` | Yes | Get current user |

### Teams
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/teams` | No | List all teams |
| GET | `/api/teams/:id` | No | Team detail + players |
| POST | `/api/teams` | Admin/Manager | Create team |
| PUT | `/api/teams/:id` | Admin/Manager | Update team |
| DELETE | `/api/teams/:id` | Admin | Soft delete team |

### Players
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/players` | No | List (filter by team/role) |
| GET | `/api/players/:id` | No | Player detail |
| POST | `/api/players` | Admin/Manager | Add player |
| PUT | `/api/players/:id` | Admin/Manager | Update player |

### Tournaments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tournaments` | No | List tournaments |
| GET | `/api/tournaments/:id` | No | Full detail |
| POST | `/api/tournaments` | Admin | Create tournament |
| POST | `/api/tournaments/:id/teams` | Admin | Add team |

### Matches
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/matches` | No | List (filter) |
| GET | `/api/matches/:id` | No | Match + scorecard |
| POST | `/api/matches` | Admin | Schedule match |
| PUT | `/api/matches/:id` | Admin/Manager | Update result |

### Scorecards
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/scorecards/batting` | Admin/Manager | Add batting entry |
| POST | `/api/scorecards/bowling` | Admin/Manager | Add bowling entry |
| POST | `/api/scorecards/innings` | Admin/Manager | Add innings summary |
| GET | `/api/scorecards/match/:id` | No | Get full scorecard |

### Statistics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stats/dashboard` | No | Overview counts |
| GET | `/api/stats/top-scorers` | No | Run leaderboard |
| GET | `/api/stats/top-wicket-takers` | No | Wicket leaderboard |
| GET | `/api/stats/points-table/:id` | No | Tournament standings |
| GET | `/api/stats/player/:id` | No | Player career stats |

## 🧪 Testing

```bash
cd backend
npm test
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Token-based stateless auth
- **Role-Based Access**: Admin > Manager > Fan
- **SQL Injection Prevention**: Parameterized queries only
- **Input Validation**: express-validator on all inputs
- **CORS**: Configured origin whitelist
- **Helmet**: Security headers

## Project Management
Jira: https://yahyasworkspace-41560610.atlassian.net/jira/software/projects/CTM/summary