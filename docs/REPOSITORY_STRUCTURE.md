# Repository Structure

This project currently uses a single Next.js app at repository root.

## Active Layout

- `app/`
  - App Router pages and layouts
- `components/`
  - Reusable UI and feature components
- `lib/`
  - Firebase and utility modules
- `public/`
  - Static assets
- `docs/`
  - Roadmap, standards, and project planning docs

## Future Option (If Service Split Is Needed)

- If the project later introduces a separate Express backend, a dedicated service folder can be added at that time.

## Rule For Now

- Keep all active implementation in the current root structure unless a formal migration plan is approved.
