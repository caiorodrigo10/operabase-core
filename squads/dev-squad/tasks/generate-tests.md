# Generate Tests

> Task for @qa (Quinn) | Testing

## Purpose

Generate comprehensive test suites for new or existing code.

## Prerequisites

- Source code to test (file paths)
- Testing framework configured (vitest, jest, etc.)
- Understanding of expected behavior

## Workflow

### Phase 1: Analysis

1. Read the source code to understand functionality
2. Identify testable units (functions, methods, classes)
3. Map out happy paths, edge cases, and error scenarios
4. Check existing test patterns in the project

### Phase 2: Test Generation

1. Create test file following project naming conventions
2. Write tests for:
   - Happy path (expected inputs -> expected outputs)
   - Edge cases (empty, null, boundary values)
   - Error scenarios (invalid inputs, missing dependencies)
   - Integration points (if applicable)
3. Use describe/it blocks for clear organization
4. Add meaningful test descriptions

### Phase 3: Verification

1. Run generated tests: `npm test`
2. Check coverage: `npm run test:coverage`
3. Verify all tests pass
4. Review test quality (no false positives)

## Outputs

- Test file(s) in appropriate location
- All tests passing
- Coverage report

## Validation

- [ ] Tests cover happy paths
- [ ] Tests cover edge cases
- [ ] Tests cover error scenarios
- [ ] All tests pass
- [ ] No false positives

---

_Task version: 1.0_
