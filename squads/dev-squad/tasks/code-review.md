# Code Review

> Task for @qa (Quinn) | Quality

## Purpose

Comprehensive code review for quality, correctness, and maintainability.

## Prerequisites

- Code to review (file paths or diff)
- Understanding of project standards

## Workflow

### Phase 1: Read & Understand

1. Read the full changeset
2. Understand the intent and requirements
3. Check story/ticket for acceptance criteria

### Phase 2: Review

1. **Correctness** -- Does it do what it should?
2. **Error handling** -- Are errors caught and handled?
3. **Edge cases** -- Are boundary conditions covered?
4. **Security** -- Any vulnerabilities introduced?
5. **Performance** -- Any obvious bottlenecks?
6. **Readability** -- Is the code clear and well-named?
7. **Tests** -- Are changes tested? Are tests meaningful?
8. **Standards** -- Does it follow project conventions?

### Phase 3: Verdict

Provide one of:
- **APPROVED** -- Ready to merge
- **NEEDS_REVISION** -- Changes required (list specific items)
- **BLOCKED** -- Cannot proceed (explain blocker)

## Outputs

- Review verdict (APPROVED/NEEDS_REVISION/BLOCKED)
- List of issues (if any)
- Suggestions for improvement

---

_Task version: 1.0_
