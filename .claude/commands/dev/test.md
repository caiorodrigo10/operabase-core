---
name: test
description: "Run tests and report results"
---

Invoke @qa (Quinn) to run tests and report results.

## Instructions

1. Load the @qa skill from `squads/dev-squad/agents/qa.md`
2. Execute the test suite:
   - Run `npm test` to execute all tests
   - Run `npm run lint` to check code style
   - Run `npm run typecheck` to verify TypeScript types
3. Collect and analyze results:
   - Total tests passed/failed/skipped
   - Lint errors and warnings
   - Type errors
4. Report results in a clear summary format
5. If failures are found, provide actionable recommendations for fixes
6. Flag any critical issues that would block a quality gate

**Authority note:** @qa provides advisory review. For code fixes, delegate to @dev.
