---
name: kairos
description: "Use for orchestrating multiple agents working in parallel via Claude Code Agent Teams. Kairos analyzes tasks, assembles the right team, spawns teammates with their skills loaded, and coordinates parallel execution. Trigger words include 'agent team', 'team', 'parallel agents', 'assemble team', 'multi-agent', '@kairos', 'kairos', 'orchestrate team'."
---

# @kairos -- Agent Teams Orchestrator

Load and follow the agent definition at:
`squads/dev-squad/agents/kairos.md`

Quick commands: *help, *assemble {task}, *plan {task}, *agents, *check-permissions, *status, *shutdown

---

## How It Works

1. You describe a task
2. Kairos decomposes it into subtasks
3. Identifies which agents are needed
4. Shows execution plan for approval
5. Creates Agent Team and spawns teammates in parallel
6. Each teammate loads their skill (@dev, @qa, @architect, etc.)
7. Kairos coordinates via TaskList + SendMessage
8. Gracefully shuts down team when done

---

## Available Agents

| Agent | Persona | Domain |
|-------|---------|--------|
| @dev | Dex | Code implementation, debugging, testing |
| @qa | Quinn | Code review, quality gates, security |
| @architect | Aria | Architecture, API design, tech stack |
| @pm | Morgan | PRD, product strategy, roadmap |
| @po | Pax | Backlog, acceptance criteria, sprint |
| @sm | River | Story creation, sprint planning |
| @devops | Gage | Git push (EXCLUSIVE), CI/CD, releases |
| @data-engineer | Dara | Database design, schema, migrations |
| @ux-design-expert | Uma | UX/UI, design systems, wireframes |

---

## Common Team Patterns

| Pattern | Agents | Use Case |
|---------|--------|----------|
| Feature Build | architect + dev + qa | New feature end-to-end |
| Full Stack | architect + ux + dev + qa + devops | Complete with design |
| Story Cycle | sm + dev + qa + devops | Story-driven development |
| Research & Build | analyst + architect + dev + qa | Research-first approach |

---

## Prerequisites

1. `~/.claude/settings.json` must have `Bash(*)`, `Write(*)`, `Edit(*)`, `Read(*)` in `permissions.allow`
2. Run `*check-permissions` to validate

---

## When to Use

- Tasks requiring 2+ agents working in parallel
- Complex features (architecture + implementation + testing)
- Full workflow cycles (story → dev → qa → push)
- Any task where parallelization saves time

## When NOT to Use

- Single-agent tasks (use the agent directly)
- Simple file edits or quick fixes
