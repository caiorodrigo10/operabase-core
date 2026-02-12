---
name: pr
description: "Create a pull request (ONLY @devops has this authority)"
---

Invoke @devops (Gage) to create a pull request.

## Instructions

1. Load the @devops skill from `squads/dev-squad/agents/devops.md`
2. **CRITICAL:** Only @devops (Gage) is authorized to create pull requests. No other agent may perform this operation.
3. Detect the current branch and target branch (usually main)
4. Run the pre-push quality gates to ensure code quality:
   - Lint, typecheck, test, build must all PASS
5. Analyze the commits on the current branch (vs target) to generate:
   - PR title (concise, conventional format)
   - PR description with:
     - Summary of changes
     - Story reference (if applicable)
     - Testing notes
6. Create the PR using `gh pr create`
7. Report the PR URL and status

**Authority note:** This is an EXCLUSIVE @devops operation. All other agents must delegate PR creation here.
