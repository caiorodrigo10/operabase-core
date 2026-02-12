---
name: lint
description: "Run linting and fix issues"
---

Invoke @dev (Dex) to run linting and fix issues.

## Instructions

1. Load the @dev skill from `squads/dev-squad/agents/dev.md`
2. Run the linter: `npm run lint`
3. Analyze the output for errors and warnings
4. For auto-fixable issues, run `npm run lint -- --fix`
5. For remaining issues that require manual fixes:
   - List each issue with file path and line number
   - Apply fixes following the project's code standards
6. Re-run the linter to confirm all issues are resolved
7. Report the final status: number of issues found, fixed, and remaining

**Authority note:** @dev handles all code implementation and fixes.
