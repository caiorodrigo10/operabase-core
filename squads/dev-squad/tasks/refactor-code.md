# Refactor Code

> Task for @dev (Dex) | Code Quality

## Purpose

Systematic code refactoring following established patterns and best practices.

## Prerequisites

- Identified code to refactor (file paths or module names)
- Clear refactoring goal (extract method, rename, simplify, etc.)
- Tests exist for the code being refactored

## Workflow

### Phase 1: Analysis

1. Read the target code thoroughly
2. Identify code smells (duplication, long methods, deep nesting, unclear names)
3. Document current behavior and test coverage
4. Plan the refactoring approach

### Phase 2: Refactoring

1. Make small, incremental changes
2. Run tests after each change to verify behavior preservation
3. Follow existing codebase patterns and conventions
4. Keep commits atomic (one logical change per commit)

### Phase 3: Verification

1. Run full test suite: `npm test`
2. Run lint: `npm run lint`
3. Run typecheck: `npm run typecheck`
4. Compare behavior before/after

## Outputs

- Refactored code with preserved behavior
- All tests passing
- Updated story checkboxes

## Validation

- [ ] No behavior changes (tests still pass)
- [ ] Code is cleaner and more maintainable
- [ ] Follows existing codebase patterns
- [ ] Lint and typecheck pass

---

_Task version: 1.0_
