# Engineering Standards

This document defines baseline coding and collaboration standards.

## Code Quality

- Linting: ESLint is required before merging.
- Formatting: use consistent formatting via editor auto-format and lint fixes.
- Type safety: TypeScript strictness should be preserved; avoid `any` unless justified.
- Testing: add or update tests for meaningful behavior changes.

## Branch Naming

Use one of these patterns:
- `feat/<short-description>`
- `fix/<short-description>`
- `chore/<short-description>`
- `docs/<short-description>`
- `test/<short-description>`

Examples:
- `feat/focus-timer-session-logging`
- `fix/login-error-state`

## Commit Message Style

- Format: `<type>: <short summary>`
- Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`

Examples:
- `feat: add activities empty-state UI`
- `fix: handle firebase login error mapping`

## Pull Request Checklist

- [ ] Branch is up to date with target branch.
- [ ] Lint passes (`npm run lint`).
- [ ] Tests pass (`npm test`).
- [ ] New behavior includes tests or clear rationale when tests are not added.
- [ ] Security-sensitive paths reviewed (auth, validation, authorization).
- [ ] Documentation updated when behavior or setup changed.
- [ ] Screenshots or recordings attached for significant UI changes.
