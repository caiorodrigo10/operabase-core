# Stories System

Stories are the primary unit of work in Operabase. All development is story-driven — every feature, bugfix, or improvement starts as a story before any code is written.

---

## How Stories Work

A story describes **what** needs to be built, **why** it matters, and **how** to verify it is done. Stories live in the `docs/stories/` directory of your project, organized into two folders:

```
docs/stories/
├── active/           # Stories currently being worked on
├── completed/        # Stories that are done and verified
└── _template.md      # Template for new stories
```

### Story Lifecycle

1. **Draft** — Story is created with description and acceptance criteria
2. **In Progress** — Development has started, tasks are being checked off
3. **Review** — Implementation is complete, awaiting QA validation
4. **Done** — All acceptance criteria met, QA passed, story moved to `completed/`

---

## Workflow

The standard story workflow follows this agent pipeline:

```
@po creates story → @dev implements → @qa validates → @devops pushes
```

| Phase | Agent | What Happens |
|-------|-------|-------------|
| **Create** | @po or @sm | Writes the story with acceptance criteria and tasks |
| **Implement** | @dev | Builds the feature, checks off tasks, updates file list |
| **Validate** | @qa | Runs tests, verifies acceptance criteria, reports issues |
| **Ship** | @devops | Pushes code, creates PR, moves story to `completed/` |

The **orchestrator** can automate this entire pipeline with:
```
@orchestrator *develop STORY-42-user-auth
```

---

## Naming Convention

Stories follow this naming pattern:

```
STORY-{number}-{slug}.md
```

| Part | Description | Example |
|------|-------------|---------|
| `STORY` | Fixed prefix | `STORY` |
| `{number}` | Sequential number | `42` |
| `{slug}` | Kebab-case summary | `user-auth` |

**Examples:**
- `STORY-1-project-setup.md`
- `STORY-12-add-login-page.md`
- `STORY-42-refactor-api-client.md`

---

## Active vs Completed

| Folder | Purpose | When to move |
|--------|---------|-------------|
| `active/` | Stories currently in progress or in review | Story is created here |
| `completed/` | Stories that are fully done | After QA passes and code is pushed |

Moving a story from `active/` to `completed/` signals that all work is finished. This is typically done by @devops or @sm after the final push.

---

## Writing Good Stories

### Acceptance Criteria
- Be specific and testable
- Each criterion should be independently verifiable
- Use checkboxes so agents can track progress

### Tasks
- Break work into small, atomic tasks
- Each task should be completable in a single session
- Order tasks by dependency (prerequisites first)

### File List
- Update as you create or modify files
- Helps @qa know what to review
- Helps @devops know what changed

### Technical Notes
- Document architecture decisions made during implementation
- Note any dependencies or constraints
- Flag anything that deviates from the original plan

---

*Stories system — powered by Operabase*
