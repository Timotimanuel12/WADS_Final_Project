# Database Operations Guide

This document defines the database governance baseline for local/dev/staging/prod environments.

## 1. Migration Governance

### Naming convention
- Use lowercase snake case names for migration intents.
- Create migrations with:
  - `npm run prisma:migrate:new -- <migration_name>`
- Apply after review with:
  - `npx prisma migrate dev`

### Why we use `prisma:migrate:new`
- The repository has a non-standard initial migration folder name (`migrations1`), so migration folder ordering matters.
- The helper script renames newly created folders with a `zzzz_` prefix so they are applied after existing migrations in shadow DB checks.

### Pre-deploy migration checklist
- Confirm schema changes match roadmap/feature scope.
- Run `npx prisma migrate dev` locally against a clean developer DB.
- Run `npm run lint` and `npm test`.
- Review migration SQL for accidental destructive operations.
- Ensure rollback plan is prepared before production apply.

### Rollback strategy
- Prefer forward-fix migrations when possible.
- For emergency rollback in non-production: restore from backup.
- For production incidents: create a compensating migration and restore data from backup if needed.

## 2. Environment DB Strategy

### Database separation
- `dev`: local PostgreSQL instance.
- `staging`: isolated staging database with production-like schema.
- `prod`: dedicated production database with strict access controls.

### Connection management
- Keep connection strings in environment variables only.
- Do not commit real credentials into git.
- Required variable:
  - `DATABASE_URL`

## 3. Seed Policy

### Development
- Allowed to run seed for demo/testing:
  - `npm run prisma:seed`

### Staging
- Only run explicit, reviewed seed scripts for test fixtures.

### Production
- Do not run demo seed scripts.
- Use controlled data migration scripts if bootstrapping is required.

## 4. Backup and Restore Runbook

### Backup cadence
- Development: ad hoc before risky migration work.
- Staging: daily automated backup.
- Production: daily full backup + WAL/point-in-time strategy where available.

### Backup command (example)
- `pg_dump -h <host> -U <user> -d <db_name> -Fc -f backup.dump`

### Restore command (example)
- `pg_restore -h <host> -U <user> -d <db_name> --clean --if-exists backup.dump`

### Verification cadence
- Test restore at least once per month in a non-production environment.
- Verify table counts and critical query paths after restore.

## 5. Observability Baseline

### Prisma-level monitoring
- Optional query logging controls:
  - `PRISMA_LOG_QUERIES=true|false`
  - `PRISMA_SLOW_QUERY_MS=<milliseconds>`
- Slow queries are logged from `lib/prisma.ts` when enabled.

### Operational monitoring baseline
- Track DB auth failures and connection errors.
- Track migration failures.
- Track slow query frequency and p95 latency.
- Review logs regularly after each deployment.
