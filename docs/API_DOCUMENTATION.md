# API Documentation

## API Design Table

| Aspect | Design |
| --- | --- |
| API Style | REST over HTTP using Next.js Route Handlers |
| Base URL | `http://localhost:3000` (development) |
| Data Format | JSON request and response bodies |
| Auth Mechanism | Firebase ID Token in `Authorization: Bearer <token>` header |
| Protected Resources | All routes except `POST /api/auth/register` require auth |
| Response Envelope | Success: `{ success: true, data, message? }` ; Error: `{ success: false, error }` |
| Status Code Pattern | `200` (OK), `201` (Created), `400` (Validation), `401` (Unauthorized), `403` (Forbidden), `404` (Not Found), `409` (Conflict), `500` (Server Error) |
| Resource Ownership | User-scoped access enforced in route handlers (`userId` match required) |
| Task Model (Core Fields) | `id`, `userId`, `title`, `description`, `status`, `priority`, `category`, `course`, `startTime`, `endTime`, `createdAt`, `updatedAt` |
| Focus Session Model (Core Fields) | `id`, `userId`, `taskId`, `durationMinutes`, `startedAt`, `completedAt`, `notes` |
| Persistence (Current) | In-memory store (`Map`) in `lib/store.ts` |

## API Endpoint Table

| Method | Endpoint | Auth | Request Body (Main Fields) | Success Response (`data`) | Common Error Codes |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | `email` (required), `password` (min 6, required), `displayName` (optional) | `{ uid, email, displayName }` | `400`, `409`, `500` |
| `GET` | `/api/auth/session` | Yes | None | `{ userId, email }` | `401` |
| `GET` | `/api/tasks` | Yes | None | `Task[]` | `401` |
| `POST` | `/api/tasks` | Yes | `title`, `startTime`, `endTime` (required), plus optional `description`, `status`, `priority`, `category`, `course` | `Task` (created record) | `400`, `401` |
| `GET` | `/api/tasks/{id}` | Yes | None | `Task` | `401`, `403`, `404` |
| `PUT` | `/api/tasks/{id}` | Yes | Partial task fields allowed (`title`, `description`, `status`, `priority`, `category`, `course`, `startTime`, `endTime`) | `Task` (updated record) | `400`, `401`, `403`, `404` |
| `DELETE` | `/api/tasks/{id}` | Yes | None | `{ deleted: true }` | `401`, `403`, `404` |
| `GET` | `/api/sessions` | Yes | None | `FocusSession[]` | `401` |
| `POST` | `/api/sessions` | Yes | `durationMinutes`, `startedAt`, `completedAt` (required), `taskId`, `notes` (optional) | `FocusSession` (created record) | `400`, `401` |
| `GET` | `/api/analytics` | Yes | None | `{ tasks, focusTime, byPriority }` aggregate object | `401` |

## Notes

- The interactive Swagger UI is available at `/api-docs` and reads from `public/openapi.json`.
- Route handlers under `app/api/**/route.ts` are the implementation source of truth.

## Screenshot Evidence Scenarios

Use this section as your screenshot checklist. For each scenario, capture at least:

- request URL + method
- request body (if any)
- response status code
- response JSON body

### Pre-test setup

1. Run app: `npm run dev`
2. Open Swagger UI: `http://localhost:3000/api-docs`
3. Prepare two users for ownership tests:
- `User A` token: `<TOKEN_A>`
- `User B` token: `<TOKEN_B>`
4. Create one task using `User A` and save its id as `<TASK_ID_A>`.

### Scenario Matrix (for screenshots)

| ID | Endpoint | Scenario | Expected Code |
| --- | --- | --- | --- |
| S01 | `POST /api/auth/register` | Valid new email + password >= 6 | `201` |
| S02 | `POST /api/auth/register` | Missing/invalid body (e.g., no email) | `400` |
| S03 | `POST /api/auth/register` | Email already exists | `409` |
| S04 | `POST /api/auth/register` | Firebase Admin failure (misconfigured credentials) | `500` |
| S05 | `GET /api/auth/session` | Valid bearer token | `200` |
| S06 | `GET /api/auth/session` | Missing/invalid bearer token | `401` |
| S07 | `GET /api/tasks` | Valid token | `200` |
| S08 | `GET /api/tasks` | Missing/invalid bearer token | `401` |
| S09 | `POST /api/tasks` | Valid payload (`title`, `startTime`, `endTime`) | `201` |
| S10 | `POST /api/tasks` | Invalid payload (e.g., `endTime` before `startTime`) | `400` |
| S11 | `POST /api/tasks` | Missing/invalid bearer token | `401` |
| S12 | `GET /api/tasks/{id}` | User A gets own task | `200` |
| S13 | `GET /api/tasks/{id}` | Missing/invalid bearer token | `401` |
| S14 | `GET /api/tasks/{id}` | User B tries to read User A task | `403` |
| S15 | `GET /api/tasks/{id}` | Non-existent id | `404` |
| S16 | `PUT /api/tasks/{id}` | User A updates own task | `200` |
| S17 | `PUT /api/tasks/{id}` | Invalid payload (e.g., bad date / end before start) | `400` |
| S18 | `PUT /api/tasks/{id}` | Missing/invalid bearer token | `401` |
| S19 | `PUT /api/tasks/{id}` | User B tries to update User A task | `403` |
| S20 | `PUT /api/tasks/{id}` | Non-existent id | `404` |
| S21 | `DELETE /api/tasks/{id}` | User A deletes own task | `200` |
| S22 | `DELETE /api/tasks/{id}` | Missing/invalid bearer token | `401` |
| S23 | `DELETE /api/tasks/{id}` | User B tries to delete User A task | `403` |
| S24 | `DELETE /api/tasks/{id}` | Non-existent id | `404` |
| S25 | `GET /api/sessions` | Valid token | `200` |
| S26 | `GET /api/sessions` | Missing/invalid bearer token | `401` |
| S27 | `POST /api/sessions` | Valid payload | `201` |
| S28 | `POST /api/sessions` | Invalid payload (e.g., `durationMinutes <= 0`) | `400` |
| S29 | `POST /api/sessions` | Missing/invalid bearer token | `401` |
| S30 | `GET /api/analytics` | Valid token | `200` |
| S31 | `GET /api/analytics` | Missing/invalid bearer token | `401` |

### Ready-to-use request bodies

`POST /api/auth/register` valid body:

```json
{
	"email": "evidence-user-a@example.com",
	"password": "secret123",
	"displayName": "Evidence User A"
}
```

`POST /api/tasks` valid body:

```json
{
	"title": "Prepare WADS report",
	"description": "Draft section 1-3",
	"status": "pending",
	"priority": "high",
	"category": "Academic",
	"course": "WADS",
	"startTime": "2026-03-11T09:00:00Z",
	"endTime": "2026-03-11T11:00:00Z"
}
```

`POST /api/tasks` invalid body (`400`) example:

```json
{
	"title": "Invalid time range",
	"startTime": "2026-03-11T11:00:00Z",
	"endTime": "2026-03-11T09:00:00Z"
}
```

`PUT /api/tasks/{id}` valid body:

```json
{
	"status": "in-progress",
	"priority": "urgent"
}
```

`PUT /api/tasks/{id}` invalid body (`400`) example:

```json
{
	"startTime": "not-a-date"
}
```

`POST /api/sessions` valid body:

```json
{
	"taskId": null,
	"durationMinutes": 25,
	"startedAt": "2026-03-11T09:00:00Z",
	"completedAt": "2026-03-11T09:25:00Z",
	"notes": "Good focus"
}
```

`POST /api/sessions` invalid body (`400`) example:

```json
{
	"durationMinutes": 0,
	"startedAt": "2026-03-11T09:00:00Z",
	"completedAt": "2026-03-11T09:25:00Z"
}
```

### How to trigger specific codes quickly

- `401`: send no `Authorization` header, or use `Authorization: Bearer invalid-token`
- `403`: use `<TOKEN_B>` on `<TASK_ID_A>`
- `404`: use a random UUID not present in store, e.g. `00000000-0000-0000-0000-000000000000`
- `409`: call register twice with the same email
- `500` (register): temporary test by breaking Firebase Admin credentials/config, then revert immediately after screenshot

