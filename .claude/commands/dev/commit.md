---
name: commit
description: "Create a git commit with conventional commit format"
---

Invoke @devops (Gage) to create a git commit with conventional commit format.

## Instructions

1. Load the @devops skill from `squads/dev-squad/agents/devops.md`
2. Analyze all staged and unstaged changes using `git status` and `git diff`
3. Determine the appropriate conventional commit type:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `test:` for test additions/changes
   - `chore:` for maintenance tasks
   - `refactor:` for code refactoring
4. Generate a concise commit message summarizing the changes
5. If a story ID is referenced in recent work, include it: `feat: description [Story X.Y]`
6. Stage relevant files and create the commit
7. Display the commit hash and summary

**Authority note:** @devops can commit locally. Only git push requires the full quality gate workflow.
