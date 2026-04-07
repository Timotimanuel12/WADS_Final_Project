# Definition of Done (Per Feature)

A feature is considered done only when all categories below are satisfied.

## UI Criteria

- User flow is implemented and accessible through intended routes.
- Loading, empty, and error states are present where relevant.
- Responsive behavior works on mobile, tablet, and desktop.
- Reusable UI components are used consistently.

## API Criteria

- Endpoint contract is documented (request, response, error format).
- Inputs are validated and invalid payloads are rejected cleanly.
- Protected endpoints enforce authentication and user-scoped access.
- Logs and error handling are consistent with project conventions.

## Test Criteria

- Unit tests cover core logic or component behavior.
- Integration tests exist for critical API paths (when backend path exists).
- Happy-path behavior is verifiable end-to-end for major workflows.

## Security Criteria

- Authentication and authorization checks are enforced.
- Input validation is implemented for all external input.
- Sensitive data and secrets are not exposed to client code.
- Known abuse paths (IDOR, auth bypass, malformed input) are reviewed.

## Documentation Criteria

- README or relevant docs updated for setup/behavior changes.
- Any new env variables are reflected in env example templates.
