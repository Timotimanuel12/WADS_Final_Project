# HelpImTooLazy Roadmap To-Do List

Based on `README.md` requirements and declared stack:
- Frontend: Next.js (App Router)
- Backend: Next.js Route Handlers (Node.js runtime)
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
- [x] Design Prisma schema (`User`, `Task`, `FocusSession`, optional `Schedule`)
- [x] Create and run initial migrations
- [x] Implement repository/service layer for all data operations
- [x] Enforce per-user data ownership in all queries
- [x] Add seed data script for local development/demo
- [x] Add DB-level constraints (time ordering, non-negative durations, enum-like constraints)
- [x] Add composite indexes for common query paths (`Task.userId + updatedAt`, `FocusSession.userId + completedAt`)
- [x] Use transactions for multi-step write flows where partial failure is risky
- [x] Add pagination/filtering for list endpoints to avoid unbounded scans
- [x] Define migration governance (naming convention, rollback plan, pre-deploy checklist)
- [x] Separate dev/staging/prod database strategy and seed policy per environment
- [x] Document backup/restore runbook (pg_dump/restore) and verification cadence
- [x] Add database observability baseline (slow-query logging + DB error monitoring)

## Phase 5 — Smart Scheduling + AI Integration
- [ ] Define scheduling input/output contract (task list + constraints -> schedule)
- [x] Implement deterministic scheduling baseline algorithm first
- [x] Surface deterministic schedule in AI Plan page and calendar AI toggle
- [ ] Add AI prioritization endpoint (`/api/ai/prioritize`)
- [ ] Add burnout detection rule set + recommendation output
- [ ] Add fallback behavior when AI service is unavailable
- [ ] Add AI planning preferences (preferred hours, max sessions/day, break cadence) (SETTINGS)

## Phase 6 — Focus Timer + Progress Dashboard
- [x] Implement timer start/pause/reset/complete flow
- [x] Persist completed focus sessions to backend
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

## Phase 8 — UX/Auth/API Hardening (Post-MVP)
- [ ] Run accessibility pass (keyboard navigation, focus order, ARIA labels)
- [ ] Polish responsive UI consistency (spacing, typography, empty/error states)
- [ ] Improve session-expiry/token-refresh UX handling across protected pages
- [ ] Add login-throttling UX messaging for repeated auth failures
- [ ] Add account-linking conflict handling notes (Google + email/password)
- [ ] Standardize paginated API response metadata (`page`, `pageSize`, `total`)
- [ ] Add consistent API error envelope + error-code mapping across all endpoints

## Phase 9 — Testing & Quality
- [ ] Expand unit tests (components, utility functions)
- [ ] Add backend integration tests for key API paths
- [ ] Add end-to-end happy-path tests (login -> add task -> schedule -> complete session)
- [ ] Add lint/typecheck/test scripts to CI pipeline
- [ ] Add bug triage checklist and regression test matrix

## Phase 10 — Containerization & Deployment
- [ ] Create Dockerfiles for frontend and backend
- [ ] Create Docker Compose for local full-stack runs
- [ ] Configure production env variables and secrets handling
- [ ] Deploy frontend (e.g., Vercel) and backend (selected host)
- [ ] Run post-deploy smoke tests and rollback plan

## Phase 11 — Documentation & Final Delivery
- [ ] Update README with accurate run/setup instructions
- [ ] Document API endpoints with request/response examples
- [ ] Document architecture decisions and threat/security controls
- [ ] Prepare demo script (feature flow + technical explanation)
- [ ] Prepare final submission checklist (code, docs, evidence, test results)

## Post-Delivery Backlog (Optional)

### Phase 12 — Settings Expansion
- [ ] Add notification rules settings (deadline reminders, daily planning reminder, quiet hours)
- [ ] Add calendar behavior settings (default view, week-start preference, show completed toggle)
- [ ] Add focus timer defaults (focus/break duration presets, auto-start toggle)
- [ ] Add account/privacy controls (data export, retention options, visibility summary)
- [ ] Add appearance/accessibility settings (density, font size, reduced motion, contrast)

### Phase 13 — Dashboard Enhancements
- [ ] Add Today Snapshot panel (due today count, urgent count, next planned item)
- [ ] Add Quick Actions panel (add task, start focus, open AI plan, quick capture)
- [ ] Add progress widgets (daily completion %, weekly streak, focus minutes today)
- [ ] Add Smart Recommendation card (suggested next task from AI plan)
- [ ] Add Overdue shortcut section for immediate triage
- [ ] Add collapsible dashboard sections to keep layout clean at scale

---

## Suggested Milestone Order (MVP + Hardening)
1. Phases 0–2 (foundation + auth)
2. Phases 3–4 (API + DB core)
3. Phases 5–6 (MVP completion: scheduling, timer, dashboard)
4. Phases 7–8 (security and UX/API hardening)
5. Phases 9–11 (tests, deployment, final docs)
6. Post-delivery backlog (Phases 12–13)
