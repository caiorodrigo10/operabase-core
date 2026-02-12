# Build Task

> **Squad:** dev-squad
> **Skill:** @dev
> **Command:** `*build {story-id} [flags]`

## Purpose

Execute a complete autonomous build for a story with a single command. This is the **main entry point** for autonomous development, orchestrating all build components.

---

## Task Definition

```yaml
task: build
skill: "@dev"
squad: dev-squad
responsible: Dex (Builder)

inputs:
  - field: story_id
    type: string
    required: true
    description: Story identifier (e.g., "story-8.5")

outputs:
  - field: build_report
    type: markdown
    destination: plan/build-report-{story-id}.md
```

---

## Usage

```bash
*build {story-id}
*build {story-id} --dry-run
*build {story-id} --verbose
*build {story-id} --no-merge --keep-worktree
```

### Flags

| Flag            | Description                                        |
| --------------- | -------------------------------------------------- |
| --dry-run       | Show what would happen without executing           |
| --no-merge      | Skip merge phase (keep changes in worktree branch) |
| --keep-worktree | Don't cleanup worktree after build                 |
| --no-worktree   | Execute in main directory (no isolation)           |
| --no-qa         | Skip QA phase                                      |
| --verbose, -v   | Enable verbose output                              |
| --timeout <ms>  | Global timeout (default: 2700000 = 45min)          |

---

## Pipeline

```
WORKTREE → PLAN → EXECUTE → QA → MERGE → CLEANUP
```

### Phase Details

1. **WORKTREE** - Creates isolated git worktree for the build
2. **PLAN** - Loads `plan/implementation.yaml` or generates from story ACs
3. **EXECUTE** - Runs each subtask with retry loop
4. **QA** - Runs lint, tests, typecheck
5. **MERGE** - Merges worktree branch to main
6. **CLEANUP** - Removes worktree and generates report

---

## Output

Final report generated at `plan/build-report-{story-id}.md`:

```markdown
# Build Report: story-8.5

> **Status:** SUCCESS
> **Duration:** 15m 32s

## Phases

| Phase    | Status    | Duration |
| -------- | --------- | -------- |
| worktree | completed | 1200ms   |
| plan     | completed | 500ms    |
| execute  | completed | 845000ms |
| qa       | completed | 32000ms  |
| merge    | completed | 2100ms   |
| cleanup  | completed | 800ms    |
```

---

## Related Commands

- `*build-resume {story-id}` - Resume failed build from checkpoint
- `*build-status {story-id}` - Check build progress

---

## Error Handling

**Strategy:** retry with checkpoints

1. **Worktree creation fails** - Check git state, clean stale worktrees
2. **Execute phase fails** - Retry subtask up to 3 times
3. **QA fails** - Report failures, allow --no-qa bypass
4. **Merge conflicts** - Report and halt for manual resolution

---

## Metadata

```yaml
squad: dev-squad
version: 1.0.0
tags:
  - build
  - autonomous
  - orchestration
```
