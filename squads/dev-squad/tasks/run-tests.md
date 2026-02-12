# Run Tests Task

> **Squad:** dev-squad
> **Skill:** @qa
> **Command:** `*run-tests {story-id}`

## Purpose

Execute comprehensive test suite for a story implementation. Validates code quality, test coverage, and acceptance criteria compliance.

---

## Task Definition

```yaml
task: runTests
skill: "@qa"
squad: dev-squad
responsible: Quinn (Guardian)

inputs:
  - field: story_id
    type: string
    required: true

  - field: test_scope
    type: enum
    options: ["unit", "integration", "e2e", "all"]
    required: false
    default: "all"

  - field: coverage_threshold
    type: number
    required: false
    default: 80

outputs:
  - field: test_results
    type: object
    destination: Memory

  - field: coverage_report
    type: object
    destination: Memory
```

---

## Test Execution Steps

### 1. Pre-Flight Checks
- Verify test framework is installed
- Check for test configuration files
- Identify test files related to the story

### 2. Run Test Suites

```bash
# Unit tests
npm test

# With coverage
npm run test:coverage

# Specific test files
npm test -- --testPathPattern={story-related-files}
```

### 3. Validate Results
- All tests must pass
- Coverage must meet threshold
- No flaky tests detected
- Performance within acceptable limits

### 4. Generate Report

```yaml
test_report:
  total_tests: N
  passed: N
  failed: N
  skipped: N
  coverage:
    statements: N%
    branches: N%
    functions: N%
    lines: N%
  duration: Nms
```

---

## Quality Checks

| Check | Requirement |
|-------|------------|
| All tests pass | BLOCKING |
| Coverage >= threshold | WARNING |
| No console.log in tests | WARNING |
| Tests are deterministic | BLOCKING |
| Test isolation verified | WARNING |

---

## Error Handling

1. **Test Framework Not Found** - Suggest installation
2. **Tests Fail** - Report failures with context
3. **Coverage Below Threshold** - Warn and suggest areas to cover
4. **Timeout** - Report which tests are slow

---

## Metadata

```yaml
squad: dev-squad
version: 1.0.0
tags:
  - testing
  - qa
  - quality
```
