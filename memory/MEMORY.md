# Project Memory

> Auto-maintained by Claude Code. Updated as patterns emerge across sessions.
> Keep this file concise — under 200 lines. Create topic files for details.

## Project Info

- **Name:** (project name)
- **Stack:** (main technologies)
- **Language:** (en/pt/es — matches operabase.yaml)
- **Squads:** (installed squads)

## Patterns & Conventions

<!-- Stable patterns confirmed across multiple interactions -->
<!-- Examples: naming conventions, file organization, preferred libraries -->

## Architecture Decisions

<!-- Key decisions with brief rationale -->
<!-- Format: Decision — Rationale (date) -->

## Debugging Notes

<!-- Solutions to recurring problems -->
<!-- Format: Problem — Solution -->

## Squad-Specific Notes

<!-- Notes that apply to specific squads but are relevant globally -->
<!-- For detailed squad memory, use: squads/{squad}/memory/{agent}.md -->

---

### Memory Guidelines

**What to save here:**
- Stable patterns confirmed across multiple interactions
- Key architectural decisions with rationale
- User preferences for workflow and communication
- Solutions to recurring problems

**What NOT to save here:**
- Session-specific context (current task, in-progress work)
- Unverified or speculative conclusions
- Information that duplicates CLAUDE.md or operabase.yaml
- Detailed squad knowledge (use squad-specific memory instead)

**Squad-specific memory pattern:**
```
squads/{squad}/memory/{agent}.md
```
Each agent can maintain its own memory file within its squad directory. This keeps domain knowledge close to the agents that use it.
