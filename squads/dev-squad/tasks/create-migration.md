# Create Migration

> Task for @data-engineer (Dara) | Database

## Purpose

Create database migration files for schema changes.

## Prerequisites

- Database schema change requirements
- Migration framework configured (Prisma, Drizzle, Knex, etc.)
- Current schema state understood

## Workflow

### Phase 1: Design

1. Understand the required schema change
2. Check current schema/models
3. Plan migration steps (create, alter, drop)
4. Consider rollback strategy

### Phase 2: Implementation

1. Generate migration file using framework CLI
2. Write up migration logic
3. Write down migration logic (rollback)
4. Add data migration if needed

### Phase 3: Verification

1. Run migration in development
2. Verify schema matches expectations
3. Test rollback works correctly
4. Update models/types if applicable

## Outputs

- Migration file(s)
- Updated schema/models
- Rollback tested

## Validation

- [ ] Migration runs without errors
- [ ] Rollback works correctly
- [ ] Schema matches requirements
- [ ] Types/models updated

---

_Task version: 1.0_
