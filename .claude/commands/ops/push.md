---
name: push
description: "Push to remote repository (ONLY @devops has this authority)"
---

Invoke @devops (Gage) to push changes to the remote repository.

## Instructions

1. Load the @devops skill from `squads/dev-squad/agents/devops.md`
2. **CRITICAL:** Only @devops (Gage) is authorized to push to remote. No other agent may perform this operation.
3. Execute the pre-push quality gate workflow (*pre-push):
   - Run `npm run lint` (must PASS)
   - Run `npm run typecheck` (must PASS)
   - Run `npm test` (must PASS)
   - Run `npm run build` (must PASS)
   - Verify no uncommitted changes
   - Verify no merge conflicts
4. Present the quality gate summary to the user
5. **Request user confirmation** before executing the push
6. Only after user approval, execute `git push`
7. Report the push result (success/failure, remote URL, branch)

**Authority note:** This is an EXCLUSIVE @devops operation. All other agents must delegate push operations here.
