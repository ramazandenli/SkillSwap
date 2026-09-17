<p align="center">
  <img src="my-app/public/logo.png" alt="SkillSwap Logo" width="120" />
  <h1 align="center">🔄 SkillSwap</h1>
  <p align="center">
    <strong>Teach what you know. Learn what you don't.</strong>
  </p>
  <p align="center">
    A peer-to-peer skill exchange platform that intelligently matches users for mutual learning.
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#api-reference">API Reference</a> •
    <a href="#database-schema">Database Schema</a> •
    <a href="#project-structure">Project Structure</a> •
    <a href="#contributing">Contributing</a>
  </p>
</p>

---

## 📖 About

SkillSwap is a full-stack web application that connects people who want to exchange skills. Whether you're a guitarist who wants to learn programming, or a designer looking to pick up a new language — SkillSwap finds the **best mutual matches** for you.

Users list the skills they **have** and the skills they **need**, and the platform's smart matching algorithm finds people where both sides benefit. Coordinate through real-time messaging, schedule collaboration sessions, earn points, and build your reputation through reviews.

---

## ✨ Features

### 🧠 Smart Mutual Matching
Unlike simple search, SkillSwap finds users who **have** what you **need** AND **need** what you **have** — ensuring every match is mutually beneficial. Results can be sorted by match count or user points.

### 🤝 Collaboration Events
Two types of events:
- **Exchanges** — Mutual skill swaps where both users teach and learn
- **Teaches** — One-directional teaching sessions

Users propose events with start/end dates. The other party can accept or decline.

### 🏆 Gamification & Points
When a collaboration is accepted, both users automatically earn **+10 points** (enforced via a PostgreSQL trigger). Points reflect engagement and are visible on profiles.

### 💬 Real-Time Messaging
Socket.IO-powered instant messaging with:
- Persistent message history
- Live "typing..." indicators
- Automatic scroll and real-time delivery

### ⭐ Reviews & Ratings
After a collaboration's end date passes, users are prompted to rate their partner (1–5 stars) with an optional comment. Average ratings and review counts are displayed on profiles. Database constraints ensure one review per event per user and prevent self-reviews.

### 👥 Social Follow System
Follow other users, view follower/following lists, and manage your social connections.

### 🛡️ Admin Dashboard
Admin users get access to a dedicated panel with:
- Platform statistics (user count, skill count, top-rated user, most followed user, most popular skills, etc.)
- Skill catalog management (add/remove skills)
- User management (view/delete accounts)

### 🔐 Secure Authentication
- **HTTP-only cookie-based JWT** — Tokens are never exposed to JavaScript (`localStorage`/`sessionStorage`), preventing XSS token theft
- **bcrypt** password hashing with 10 salt rounds
- **Timing attack protection** — A dummy hash is used for non-existent usernames to prevent user enumeration via response timing
- **Socket.IO authentication** — WebSocket connections are authenticated at the handshake level using the same HTTP-only cookie

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 18** | Component-based UI library |
| **React Router v7** | Client-side routing with protected routes |
| **Axios** | HTTP client with credential support and interceptors |
| **Socket.IO Client** | Real-time WebSocket communication |
| **React-Bootstrap** | Modal dialog components |
| **Bootstrap 5** (CDN) | Base grid and modal CSS |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** (ES Modules) | Runtime environment |
| **Express 4** | RESTful API framework |
| **PostgreSQL** | Relational database with triggers, views & stored functions |
| **pg** (node-postgres) | PostgreSQL client with connection pooling |
| **Socket.IO** | Real-time bidirectional WebSocket server |
| **jsonwebtoken** | HTTP-only cookie-based JWT authentication |
| **bcrypt** | Secure password hashing |
| **dotenv** | Environment variable management |
| **nodemon** | Development auto-restart |

---

## 🏗 Architecture Highlights

- **Repository Pattern** — Database queries are cleanly abstracted into repository modules, keeping controllers focused on business logic
- **Centralized Error Handling** — Custom `HttpError` classes with a middleware that maps PostgreSQL error codes (`23505` → 409, `23503` → 400, etc.) to appropriate HTTP status codes
- **Database-Level Logic** — Smart matching functions, point triggers, and review constraints are enforced at the PostgreSQL level for data integrity
- **Async Handler Wrapper** — Eliminates repetitive try/catch blocks in route handlers
- **Input Validation** — Server-side validation utilities with defined field limits

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/ramazandenli/SkillSwap.git
cd SkillSwap
```

### 2. Set Up the Database

Create a PostgreSQL database and run the schema file:

```bash
psql -U postgres -c "CREATE DATABASE skillswap;"
psql -U postgres -d skillswap -f backend/database.sql
```

This creates all tables, enum types, views, triggers, and stored functions.

### 3. Configure Environment Variables

**Backend** — Copy and edit the example file:

```bash
cp backend/.env.example backend/.env
```

```env
# Server
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=skillswap
DB_PASSWORD=your_db_password
DB_PORT=5432
```

**Frontend** — Copy and edit the example file:

```bash
cp my-app/.env.example my-app/.env
```

```env
REACT_APP_API_URL=http://localhost:4000
```

### 4. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../my-app
npm install
```

### 5. Start the Application

```bash
# Terminal 1 — Backend (with auto-reload)
cd backend
npm run dev

# Terminal 2 — React dev server
cd my-app
npm start
```

The app will be available at **http://localhost:3000** and the API at **http://localhost:4000**.

---

## 📡 API Reference

All protected endpoints use HTTP-only cookie authentication. No `Authorization` header is needed — cookies are sent automatically with `credentials: true`.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login (sets `skillswap_token` cookie) |
| `POST` | `/api/auth/logout` | ✅ | Logout (clears cookie) |
| `GET` | `/api/auth/me` | ✅ | Check current session |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users` | 🔑 Admin | List all non-admin users |
| `GET` | `/api/users/:id` | ✅ | Get user detail card |
| `GET` | `/api/users/:id/profile` | ✅ | Get full profile with stats & rating |
| `GET` | `/api/users/:id/counts` | ✅ | Get follower/following counts |
| `GET` | `/api/users/:id/followers` | ✅ | List followers |
| `GET` | `/api/users/:id/followings` | ✅ | List following |
| `DELETE` | `/api/users/:id` | 🔑 Admin | Delete a user account |

### Skills

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/skills` | ✅ | List all skills in the catalog |
| `POST` | `/api/skills` | 🔑 Admin | Add a new skill to the catalog |
| `DELETE` | `/api/skills/:id` | 🔑 Admin | Remove a skill from the catalog |
| `GET` | `/api/users/:id/skills?type=has\|needs` | ✅ | Get user's skills (owned or needed) |
| `POST` | `/api/users/:id/skills` | ✅ Self | Add a skill to your profile |
| `DELETE` | `/api/users/:id/skills/:skillId?type=has\|needs` | ✅ Self | Remove a skill from your profile |

### Smart Search

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/search?skillId=&sort=points\|count` | ✅ | Find mutual matches for a skill |

### Follows

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/follows` | ✅ | Follow a user |
| `DELETE` | `/api/follows?user=&direction=following\|follower` | ✅ | Unfollow or remove a follower |

### Collaboration Events

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/events/user/:id` | ✅ Self | Get user's events |
| `POST` | `/api/events` | ✅ | Propose a new collaboration |
| `POST` | `/api/events/:id/accept` | ✅ | Accept event (+10 points each) |
| `DELETE` | `/api/events/:id` | ✅ | Decline or cancel an event |

### Messages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/messages/contacts` | ✅ | List contacted users |
| `GET` | `/api/messages?peer=` | ✅ | Get message history with a user |

### Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/reviews/user/:id` | ✅ | Get reviews for a user |
| `GET` | `/api/reviews/pending` | ✅ | Get your pending reviews |
| `POST` | `/api/reviews` | ✅ | Submit a review (1–5 stars + comment) |

### Admin Statistics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/stats` | 🔑 Admin | Platform-wide statistics |

---

## 🔌 Real-Time Events (Socket.IO)

Socket.IO connections are authenticated at the handshake level using the HTTP-only JWT cookie.

| Event | Direction | Description |
|-------|-----------|-------------|
| `chat:join` | Client → Server | User joins their personal room |
| `chat:send` | Client → Server | Send a message (saved to DB, broadcast to both parties) |
| `chat:message` | Server → Client | Receive a new message in real-time |
| `chat:typing` | Bidirectional | Live "typing..." indicator with debouncing |
| `disconnect` | Client → Server | User disconnects |

---

## 🗄 Database Schema

The database uses PostgreSQL with custom enum types, views, triggers, and stored functions.

### Enum Types
- **`status`**: `'waiting'` | `'accepted'`
- **`type`**: `'exchanges'` | `'teaches'`

### Tables

```
┌─────────────────────┐
│       Users          │
├─────────────────────┤
│ User_Id (PK)        │ varchar(30)
│ Name                 │ varchar(30)
│ Surname              │ varchar(30)
│ Gender               │ char
│ Birthdate            │ date
│ Points               │ int (default 0)
│ Password             │ varchar(64) [bcrypt]
│ type                 │ varchar(5) ['user'|'admin']
└──────────┬──────────┘
           │
     ┌─────┼──────────────────────────────────┐
     │     │                                   │
     ▼     ▼                                   ▼
┌──────────────┐  ┌──────────────┐  ┌─────────────────┐
│     Has      │  │    Needs     │  │    Follows       │
├──────────────┤  ├──────────────┤  ├─────────────────┤
│ User_ID (FK) │  │ User_ID (FK) │  │ Follower_ID (FK)│
│ Skill_ID (FK)│  │ Skill_ID (FK)│  │ Followed_ID (FK)│
│ PK: both     │  │ PK: both     │  │ PK: both        │
└──────┬───────┘  └──────┬───────┘  └─────────────────┘
       │                 │
       ▼                 ▼
  ┌──────────────┐
  │    Skills     │
  ├──────────────┤
  │ Skill_ID (PK)│ serial
  │ Skill_Name   │ varchar(120)
  └──────────────┘

┌─────────────────────────────┐       ┌──────────────────────────┐
│     Collaborates_with       │       │        Reviews           │
├─────────────────────────────┤       ├──────────────────────────┤
│ event_id (PK)               │ ◄──── │ Event_ID (FK)            │
│ User1_Id (FK → Users)       │       │ Review_ID (PK)           │
│ Skill1_Id (FK → Skills)     │       │ Reviewer_ID (FK → Users) │
│ User2_Id (FK → Users)       │       │ Reviewed_ID (FK → Users) │
│ Start_Date                  │       │ Rating (1-5, CHECK)      │
│ End_Date                    │       │ Comment                  │
│ status (enum)               │       │ Created_At               │
│ type (enum)                 │       │ UNIQUE(Event_ID,Reviewer)│
└─────────────────────────────┘       │ CHECK(Reviewer≠Reviewed) │
                                      └──────────────────────────┘
┌──────────────────────┐
│       Texts          │
├──────────────────────┤
│ Text_ID (PK)         │ serial
│ From_ID (FK → Users) │
│ To_ID (FK → Users)   │
│ Date                 │ timestamp (default now())
│ Message              │ text
│ INDEX on (From,To,Date)
└──────────────────────┘
```

### Views
| View | Description |
|------|-------------|
| `follower_count` | Follower count per user |
| `following_count` | Following count per user |
| `user_rating` | Average rating and review count per user |
| `stats` | Admin dashboard metrics (user count, skill count, top users, popular skills, etc.) |

### Triggers & Functions
| Name | Description |
|------|-------------|
| `trigger_update_points_on_accept` | Awards +10 points to both users when a collaboration is accepted |
| `getSearchResultsByCount(id, skill_id)` | Mutual match search sorted by shared need count |
| `getSearchResultsByPoints(id, skill_id)` | Mutual match search sorted by user points |
| `get_pending_reviews(id)` | Finds completed events awaiting review |
| `get_contacted_users(id)` | Lists unique messaging contacts |
| `insert_user(...)` | User creation procedure |

---

## 📁 Project Structure

```
SkillSwap/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # PostgreSQL connection pool & query helpers
│   │   │   └── env.js                # Environment variable loader & validator
│   │   ├── middleware/
│   │   │   ├── errorHandler.js       # Centralized error handler (PG error code mapping)
│   │   │   └── requireAuth.js        # Auth, self-authorization & admin middleware
│   │   ├── repositories/
│   │   │   ├── userRepository.js     # User CRUD queries
│   │   │   ├── skillRepository.js    # Skill catalog queries
│   │   │   ├── eventRepository.js    # Collaboration event queries
│   │   │   ├── followRepository.js   # Follow relationship queries
│   │   │   ├── messageRepository.js  # Message history queries
│   │   │   ├── reviewRepository.js   # Review & rating queries
│   │   │   └── statsRepository.js    # Admin statistics queries
│   │   ├── controllers/
│   │   │   ├── authController.js     # Signup, login, logout, session check
│   │   │   ├── userController.js     # Profile, followers, skills management
│   │   │   ├── skillController.js    # Skill catalog CRUD
│   │   │   ├── eventController.js    # Collaboration lifecycle
│   │   │   ├── followController.js   # Follow/unfollow logic
│   │   │   ├── messageController.js  # Message retrieval
│   │   │   ├── reviewController.js   # Review submission & retrieval
│   │   │   └── statsController.js    # Platform statistics
│   │   ├── routes/
│   │   │   ├── index.js              # Route aggregator (/api/*)
│   │   │   ├── authRoutes.js         # /api/auth/*
│   │   │   ├── userRoutes.js         # /api/users/*
│   │   │   ├── skillRoutes.js        # /api/skills/*
│   │   │   ├── searchRoutes.js       # /api/search
│   │   │   ├── followRoutes.js       # /api/follows
│   │   │   ├── eventRoutes.js        # /api/events/*
│   │   │   ├── messageRoutes.js      # /api/messages/*
│   │   │   ├── reviewRoutes.js       # /api/reviews/*
│   │   │   └── statsRoutes.js        # /api/stats
│   │   ├── sockets/
│   │   │   └── chat.js               # Socket.IO handlers & auth
│   │   ├── utils/
│   │   │   ├── HttpError.js          # Custom HTTP error classes
│   │   │   ├── asyncHandler.js       # Express async wrapper
│   │   │   ├── cookies.js            # HTTP-only cookie management
│   │   │   ├── jwt.js                # Token signing & verification
│   │   │   ├── validate.js           # Input validation utilities
│   │   │   └── formatDate.js         # PostgreSQL date formatting
│   │   └── app.js                    # Express app configuration
│   ├── server.js                     # HTTP server + Socket.IO entry point
│   ├── database.sql                  # Full schema, views, triggers & functions
│   ├── package.json
│   └── .env.example
│
├── my-app/                           # React Frontend
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js             # Axios instance (withCredentials, interceptors)
│   │   │   ├── auth.js               # Auth API calls
│   │   │   ├── users.js              # User API calls
│   │   │   ├── skills.js             # Skill API calls
│   │   │   ├── events.js             # Event API calls
│   │   │   ├── follows.js            # Follow API calls
│   │   │   ├── messages.js           # Message API calls
│   │   │   ├── reviews.js            # Review API calls
│   │   │   └── stats.js              # Stats API calls
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── AppShell.js       # Top navigation bar
│   │   │   ├── home/
│   │   │   │   ├── ProfileCard.js    # User profile card (avatar, points, rating)
│   │   │   │   ├── SkillsPanel.js    # Has/Needs skill management
│   │   │   │   ├── SearchPanel.js    # Smart search with sort options
│   │   │   │   ├── UserResultCard.js # Search result card (follow, message, propose)
│   │   │   │   ├── EventRequestModal.js  # Collaboration proposal modal
│   │   │   │   ├── EventsPanel.js    # Active & pending events list
│   │   │   │   ├── EventCard.js      # Individual event card
│   │   │   │   └── FollowPanel.js    # Followers/following list
│   │   │   ├── reviews/
│   │   │   │   ├── PendingReviewsPanel.js  # Awaiting review notifications
│   │   │   │   ├── ReviewModal.js    # Star rating & comment form
│   │   │   │   └── ReviewList.js     # User review history
│   │   │   ├── chat/
│   │   │   │   ├── ContactList.js    # Conversation sidebar
│   │   │   │   ├── MessageList.js    # Message bubbles with auto-scroll
│   │   │   │   └── MessageComposer.js # Input with typing indicator
│   │   │   ├── ui/
│   │   │   │   ├── Avatar.js         # Dynamic HSL-colored avatar
│   │   │   │   ├── Panel.js          # Reusable panel wrapper
│   │   │   │   ├── SkillTag.js       # Skill badge component
│   │   │   │   ├── StarRating.js     # Interactive star rating
│   │   │   │   └── StateMessage.js   # Loading, Error, Empty states
│   │   │   └── ProtectedRoute.js     # Auth & admin route guard
│   │   ├── context/
│   │   │   └── AuthContext.js        # Auth state, session, login/logout
│   │   ├── hooks/
│   │   │   ├── useChat.js            # Real-time chat logic
│   │   │   └── useAsyncData.js       # Generic async data fetching
│   │   ├── lib/
│   │   │   └── socket.js            # Singleton Socket.IO connection
│   │   ├── pages/
│   │   │   ├── Landing.js            # Public landing page
│   │   │   ├── Login.js              # Login form
│   │   │   ├── Signup.js             # Registration form
│   │   │   ├── Home.js               # Main dashboard
│   │   │   ├── Messages.js           # Chat interface
│   │   │   └── Admin.js              # Admin dashboard
│   │   ├── styles/
│   │   │   ├── theme.css             # Design tokens & CSS variables
│   │   │   ├── auth.css              # Auth page styles
│   │   │   ├── home.css              # Dashboard styles
│   │   │   ├── chat.css              # Messaging styles
│   │   │   ├── admin.css             # Admin panel styles
│   │   │   ├── components.css        # Shared component styles
│   │   │   └── layout.css            # Layout styles
│   │   ├── App.js                    # Root component with routing
│   │   └── index.js                  # React DOM entry point
│   ├── public/
│   │   ├── index.html                # HTML template
│   │   └── logo.png                  # SkillSwap logo
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## 🔒 Security Considerations

| Aspect | Implementation |
|--------|---------------|
| **Token Storage** | HTTP-only cookies (never exposed to JS) |
| **Password Hashing** | bcrypt with 10 salt rounds |
| **XSS Protection** | Tokens inaccessible to `document.cookie` |
| **CSRF Mitigation** | `SameSite: lax` cookie attribute |
| **Timing Attacks** | Dummy hash comparison for non-existent users |
| **Socket Auth** | JWT verified at WebSocket handshake level |
| **Authorization** | `requireSelf` prevents cross-user actions |
| **Input Validation** | Server-side validation with defined field limits |
| **DB Constraints** | Foreign keys, unique constraints, check constraints |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

