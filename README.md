# SkillSwap

A skill-exchange platform where people trade the skills they have for the ones they want. List what you can teach, list what you want to learn, get matched, chat in real time, schedule sessions, and rate each other afterwards.

> **This is the v2 rewrite.** The original 3rd-year university project lives in [`legacy/`](./legacy) for reference.

## Feature tour

- Auth — email/username + password with Argon2id and a 7-day JWT.
- Profiles — editable name / bio, avatar upload (2 MB, jpeg/png/webp), points, follower / following counts, star rating.
- Skills & matching — every user maintains a *Have* and *Need* list. A search returns people who teach a skill *and* want something you already offer, ranked by points or by best fit.
- Follow — mutual status badges, optimistic follower / following counters, tabbed followers/following lists.
- Events (exchange / teach) — request a swap picking one of your skills for one of theirs. Accept awards +10 points to both sides in a single transaction. Cancel, complete and review flows are separate states.
- Reviews — 1–5 star rating with an optional comment after an event is completed. One review per event per user.
- Real-time chat — Socket.IO messaging with unread counts and read receipts.
- Dark mode, responsive layout, keyboard-friendly modals.

## Stack

**Backend** — TypeScript · Express 4 · Prisma 6 · PostgreSQL 16 · Socket.IO · JWT · Zod · Argon2 · Pino · Multer · Vitest

**Frontend** — Vite 6 · React 18 · TypeScript · Tailwind CSS · TanStack Query · React Router 7 · React Hook Form · Zod · socket.io-client

**Tooling** — pnpm workspaces monorepo · Docker Compose · Prettier · ESLint · Vitest

## Repo layout

```
skillswap/
├── apps/
│   ├── api/          Express + Prisma backend + Socket.IO
│   └── web/          Vite + React frontend
├── packages/
│   └── shared/       Zod schemas & shared types used by both apps
├── legacy/           Original 3rd-year project (kept for reference)
├── docker-compose.yml
└── package.json
```

## Quick start

Prerequisites: **Node 20+**, **pnpm 9.15+**, **Docker Desktop**.

```bash
# 1. install deps
pnpm install

# 2. start Postgres (host port 5434) and Adminer (http://localhost:8080)
pnpm db:up

# 3. configure env
cp apps/api/.env.example apps/api/.env

# 4. push schema + seed skills
pnpm --filter @skillswap/api exec prisma db push
pnpm --filter @skillswap/api exec prisma db seed

# 5. start api + web in parallel (api on :4000, web on :5173)
pnpm dev
```

Then open http://localhost:5173.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Runs `api` and `web` in parallel |
| `pnpm build` | Builds all workspaces |
| `pnpm typecheck` | Runs `tsc --noEmit` across workspaces |
| `pnpm --filter @skillswap/api test` | Runs Vitest unit tests |
| `pnpm db:up` / `pnpm db:down` | Manage the Postgres container |
| `pnpm db:reset` | Wipe volumes and recreate the DB container |

> Dev Postgres is exposed on host port **5434** (mapped to container `5432`) to avoid colliding with any native Postgres installs on the host.

## Architecture notes

- JWT (7 d) is stored in `localStorage` and sent as a Bearer header. On 401 the client clears it and the router redirects to `/login`.
- Socket.IO shares the HTTP server, authenticates with the same JWT via the handshake, and joins the user into a `user:<id>` room. New messages fan out to both sides in real time.
- Prisma schema keeps snake_case table/column names via `@@map` / `@map`.
- Matching (`GET /matches`) uses a single raw Prisma query with `ARRAY_AGG(skill_id)` so the frontend can surface which of your skills each candidate wants.
- Avatar uploads land on the local disk under `apps/api/uploads/` (git-ignored).
