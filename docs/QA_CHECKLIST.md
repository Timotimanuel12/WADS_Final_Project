# QA Checklist

## Bug Triage
- Reproduce the issue on the current branch before changing code.
- Confirm whether the problem is UI-only, API-only, or data-related.
- Capture the exact route, payload, user role, and browser state.
- Note severity, frequency, and whether the issue blocks a primary workflow.
- Verify the fix with the smallest targeted test or manual smoke check.

## Regression Matrix
- Login and registration: email/password, Google sign-in, profile completion, session expiry.
- Tasks: create, update, delete, priority changes, attachments, ownership checks.
- Focus timer: start, pause, reset, complete, session persistence, task linking.
- Dashboard and analytics: task totals, completion rate, focus minutes, streaks, monthly trends.
- Security: unauthorized access, IDOR, invalid payloads, rate limiting, error sanitization.
- Chat: encouragement after wins, task-start guidance, casual conversation, response limits.

## Release Smoke
- Sign in successfully and confirm redirect behavior.
- Complete profile setup and confirm protected routes open.
- Start and finish a focus session and confirm it appears in history.
- Load dashboard metrics without console or API errors.
- Confirm the app still enforces rate limits on critical endpoints.