# HelpImTooLazy Roadmap To-Do List

Based on `README.md` requirements and declared stack:
- Frontend: Next.js (App Router)
- Backend: Node.js (Express)
- API: REST
- Database: PostgreSQL + Prisma ORM
- Auth: Firebase Auth
- Infra: Docker + Docker Compose
- Security: JWT + validation + authorization controls

---

## Phase 0 — Project Setup & Alignment
- [x] Finalize feature scope for MVP (Smart Scheduling, Focus Timer, Progress Dashboard)
- [x] Define repository structure (current single app + shared docs)
- [x] Set up environment variable strategy (`.env.example`)
- [x] Add coding standards (linting, formatting, branch naming, PR checklist)
- [x] Define Definition of Done per feature (UI, API, tests, security checks)

## Phase 1 — UI Foundation (Next.js)
- [x] Build/clean core routes: login, dashboard, calendar, activities, settings
- [x] Connect reusable UI components consistently (cards, tabs, forms, buttons)
- [x] Add client-side state handling for temporary interactions
- [x] Add loading and empty states for each main page
- [x] Add basic responsive behavior for desktop/tablet/mobile

## Phase 2 — Authentication (Firebase Auth + App Session)
- [x] Implement Firebase email/password + Google sign-in flows cleanly
- [x] Add protected route handling for authenticated pages
- [x] Implement backend JWT issuance/verification strategy (if separate backend token is used) (N/A in current frontend-only architecture)
- [x] Add logout flow and session invalidation behavior
- [x] Add auth error handling and user-friendly messages

## Phase 3 — Backend API (Next.js Route Handlers)
- [x] Initialize modular route structure under `app/api/`
- [x] Implement `/api/auth/*` endpoints (register `POST`, session validation `GET`)
- [x] Implement `/api/tasks` CRUD endpoints (`GET`/`POST` + `GET`/`PUT`/`DELETE` by id)
- [x] Implement `/api/sessions` logging endpoint for focus timer data
- [x] Implement `/api/analytics` aggregation endpoint
- [x] Add centralized error handler (`lib/api-response.ts`) + consistent API response format

## Phase 4 — Database Layer (PostgreSQL + Prisma)
- [ ] Design Prisma schema (`User`, `Task`, `StudySession`, optional `Schedule`)
- [ ] Create and run initial migrations
- [ ] Implement repository/service layer for all data operations
- [ ] Enforce per-user data ownership in all queries
- [ ] Add seed data script for local development/demo

## Phase 5 — Smart Scheduling + AI Integration
- [ ] Define scheduling input/output contract (task list + constraints -> schedule)
- [ ] Implement deterministic scheduling baseline algorithm first
- [ ] Add AI prioritization endpoint (`/api/ai/prioritize`)
- [ ] Add burnout detection rule set + recommendation output
- [ ] Add fallback behavior when AI service is unavailable

## Phase 6 — Focus Timer + Progress Dashboard
- [ ] Implement timer start/pause/reset/complete flow
- [ ] Persist completed focus sessions to backend
- [ ] Build dashboard metrics (completion rate, hours studied, streak)
- [ ] Add weekly/monthly trend visualizations
- [ ] Ensure analytics are user-scoped and time-filtered

## Phase 7 — Security Hardening (WADS focus)
- [ ] Validate all request payloads using Zod
- [ ] Enforce auth middleware on protected routes
- [ ] Add authorization checks on all resource-level operations
- [ ] Add rate limiting and abuse protection on auth + critical endpoints
- [ ] Secure cookie/token handling strategy (HTTP-only where applicable)
- [ ] Add security test checklist (IDOR, injection, auth bypass, input fuzzing)

## Phase 8 — Testing & Quality
- [ ] Expand unit tests (components, utility functions)
- [ ] Add backend integration tests for key API paths
- [ ] Add end-to-end happy-path tests (login -> add task -> schedule -> complete session)
- [ ] Add lint/typecheck/test scripts to CI pipeline
- [ ] Add bug triage checklist and regression test matrix

## Phase 9 — Containerization & Deployment
- [ ] Create Dockerfiles for frontend and backend
- [ ] Create Docker Compose for local full-stack runs
- [ ] Configure production env variables and secrets handling
- [ ] Deploy frontend (e.g., Vercel) and backend (selected host)
- [ ] Run post-deploy smoke tests and rollback plan

## Phase 10 — Documentation & Final Delivery
- [ ] Update README with accurate run/setup instructions
- [ ] Document API endpoints with request/response examples
- [ ] Document architecture decisions and threat/security controls
- [ ] Prepare demo script (feature flow + technical explanation)
- [ ] Prepare final submission checklist (code, docs, evidence, test results)

---

## Suggested Milestone Order (MVP-first)
1. Phases 0–2 (foundation + auth)
2. Phases 3–4 (API + DB core)
3. Phase 6 (timer + dashboard with real data)
4. Phase 5 (smart scheduling + AI)
5. Phases 7–10 (security hardening, tests, deployment, final docs)
