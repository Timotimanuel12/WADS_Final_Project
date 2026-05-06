# Regression Matrix

| Area | Scenario | Expected Result |
| --- | --- | --- |
| Authentication | Expired session on protected page | Redirects to login with a session-expired notice |
| Authentication | Repeated failed login attempts | User sees throttling guidance and the request path stays protected |
| Authentication | Google/password conflict | User gets a clear account-linking explanation |
| Tasks | Create/update/delete task | Task persists only for the signed-in user |
| Focus Timer | Start and complete focus session | Session is saved and appears in history |
| Analytics | Monthly trend and streak load | Dashboard shows trend bars and streak values |
| Security | Missing/invalid token | API rejects request with a safe error |
| Security | Rate limit exceeded | Endpoint returns 429 and does not process the write |