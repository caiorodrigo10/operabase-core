# Operabase

**Skills-first agent framework for Claude Code.**

Operabase turns Claude Code into a full development team. Instead of one AI assistant, you get specialized agents — each with their own expertise, authority boundaries, and workflows — all orchestrated through native Claude Code Skills.

> **Beta** — v0.1.0-beta | [Constitution](./constitution.md) | MIT License

---

## Why Operabase?

| Problem | Operabase Solution |
|---------|-------------------|
| Claude Code is powerful but generic | Specialized agents with defined roles and boundaries |
| No structure for team workflows | Story-driven development with quality gates |
| Agent behavior buried in code | All intelligence in `SKILL.md` files (prompt engineering) |
| Heavy runtimes with complex dependencies | Light Node.js runtime (~46KB JS) for infrastructure only |
| Hard to extend with new capabilities | Drop-in squads with plug-and-play agents |

### The Core Idea

```
Skills (Intelligence) → Runtime (Infrastructure) → UI (Observation)
```

All agent intelligence lives in **SKILL.md** files — pure markdown that Claude Code reads natively. The Node.js runtime only handles infrastructure: CLI commands, config validation, quality gates, state tracking. No magic. No hidden layers.

---

## Quick Start

```bash
# Install
npx operabase init

# Verify setup
npx operabase doctor

# Check what's installed
npx operabase status
```

The `init` wizard walks you through:
- Language selection (English, Portuguese, Spanish)
- Squad configuration (Basic 3-agent or Complete 9-agent team)
- Optional integrations (Composio, Obsidian)
- Multi-tenant support

### Requirements

- **Node.js** >= 18
- **Claude Code** (Claude CLI)
- **Git**

---

## How It Works

### 1. Activate an Agent

In Claude Code, use any agent as a slash command:

```
/dev          → Dex, your developer
/qa           → Quinn, quality assurance
/architect    → Aria, system architect
/devops       → Gage, operations (only one who can push)
/pm           → Morgan, product manager
/po           → Pax, product owner
/sm           → River, scrum master
/data-engineer → Dara, database specialist
/ux-design-expert → Uma, UX/UI designer
```

### 2. Use Agent Commands

Each agent responds to `*` commands:

```
/po *create-story       → Create a development story
/dev *task develop-story → Start implementing
/qa *task run-tests      → Run the test suite
/devops *task push       → Push to remote (only devops can)
```

### 3. Run Quality Gates

```bash
npx operabase gates                    # Run all gates
npx operabase gates --stage pre_commit # Specific stage
npx operabase gates --squad dev-squad  # Squad-specific gates
```

---

## Architecture

```
operabase-core/
├── .claude/
│   ├── skills/              # 13 SKILL.md files (agent intelligence)
│   └── commands/            # Namespace commands (dev/, ops/)
├── bin/
│   └── operabase.js         # CLI entry point
├── src/
│   ├── cli/                 # Command handlers + generators
│   ├── core/                # Config validator, state, tenant gate
│   ├── templates/           # Init wizard templates
│   └── utils/               # Logger, YAML parser
├── squads/
│   ├── dev-squad/           # Core: dev + qa + devops (+ orchestrator, kairos, squad-creator)
│   └── full-dev-squad/      # Extended: all 9 specialized agents
├── schemas/                 # JSON Schema for operabase.yaml
├── docs/                    # Stories, integrations
├── constitution.md          # 8 non-negotiable principles
├── operabase.yaml           # Central project config
└── package.json
```

### Skills vs Runtime

| Layer | What it does | Examples |
|-------|-------------|----------|
| **Skills** (SKILL.md) | Agent behavior, decisions, workflows | "How to review code", "When to escalate" |
| **Runtime** (Node.js) | Infrastructure, validation, I/O | Config parsing, gate execution, state persistence |

The runtime is intentionally minimal (~46KB JS). If you need new agent behavior, create a SKILL.md — don't touch the runtime.

---

## Squads

Squads are teams of agents that work together. Operabase ships with two dev squads (pick one):

### dev-squad (Basic)

3 core agents + 3 support agents for small-to-medium projects:

| Agent | Role | Key Capability |
|-------|------|---------------|
| `@dev` (Dex) | Developer | Code implementation |
| `@qa` (Quinn) | QA Engineer | Testing, code review |
| `@devops` (Gage) | DevOps | Git push, CI/CD, releases |
| `@orchestrator` | Coordinator | Pipeline orchestration |
| `@kairos` | Team Builder | Agent Teams (parallel execution) |
| `@squad-creator` | Factory | Creates new squads |

### full-dev-squad (Complete)

All 9 specialized agents for complex projects:

| Agent | Role |
|-------|------|
| `@dev` | Implementation |
| `@qa` | Quality |
| `@devops` | Operations |
| `@architect` | System design |
| `@pm` | Product management |
| `@po` | Product ownership |
| `@sm` | Scrum master |
| `@data-engineer` | Database |
| `@ux-design-expert` | UX/UI |

### Creating Custom Squads

Use the Squad Creator to generate a complete squad from scratch:

```
/squad-creator *create my-squad
```

This generates the full structure: agents, tasks, templates, SKILL.md files, quality gates, and namespace commands.

---

## CLI Commands

| Command | Description |
|---------|-------------|
| `npx operabase init` | Interactive setup wizard |
| `npx operabase validate` | Validate operabase.yaml against schema |
| `npx operabase status` | Show installed squads, version, state |
| `npx operabase doctor` | Run 13 diagnostic checks |
| `npx operabase gates` | Execute quality gates (lint, test, build) |
| `npx operabase test` | Run 7 smoke tests |
| `npx operabase events` | View recent event stream |
| `npx operabase state` | Show/manage pipeline state |
| `npx operabase tenants` | List configured tenants |
| `npx operabase upgrade` | Upgrade project (preview) |

---

## Configuration

Everything is configured in `operabase.yaml`:

```yaml
version: "1.0"
name: "My Project"
language: en                          # en | pt | es

squads:
  core:
    - dev-squad                       # or full-dev-squad
  extras: []                          # finance-squad, media-buying-squad, etc.

gates:
  pre_commit:
    - "npm run lint"
    - "npm run typecheck"
    - "npm test"
  pre_push:
    - "npm run build"

authority:
  git_push: [devops]                  # Only devops can push
  create_stories: [pm, po, sm]       # Story creators
  architecture_decisions: [architect]  # Architecture authority
  quality_verdicts: [qa]              # QA has final say
```

---

## Quality Gates

Gates run automatically at defined stages and block on failure:

```
pre_commit → lint + typecheck + test
pre_push   → build
```

Squad-specific gates can **extend** or **override** global gates:

```yaml
# squads/dev-squad/config/quality-gates.yaml
gates:
  additional:
    pre_commit:
      - command: "npm run test:coverage"
        description: "Minimum 80% coverage"
  override: {}
```

---

## Agent Teams (Parallel Execution)

For complex tasks, Kairos orchestrates multiple agents working in parallel via Claude Code Agent Teams:

```
/kairos

# Kairos analyzes the task, selects the right agents,
# spawns them as teammates, and coordinates execution.
```

**Workflow:** ANALYZE → VALIDATE → ASSEMBLE → MONITOR → VERIFY → CLEANUP

---

## Integrations

### Composio

Connect to external services (Notion, Google Drive, Meta Ads) via MCP:

```yaml
# operabase.yaml
composio:
  enabled: true
```

### Obsidian

Use a local Obsidian vault as your knowledge base:

```yaml
# operabase.yaml
obsidian:
  enabled: true
  vault_path: "./vault"
  date_format: "DD-MM-YYYY"
```

### Multi-Tenant

Manage multiple businesses/clients from a single installation:

```yaml
# operabase.yaml
multi_tenant: true
tenant_discovery: filesystem    # or env
tenant_gate: mandatory          # Must select tenant before operations
```

---

## Constitution

Operabase follows [8 constitutional articles](./constitution.md) that are enforced automatically:

| Article | Principle | Severity |
|---------|-----------|----------|
| I | Skills-First | NON-NEGOTIABLE |
| II | Light Runtime | NON-NEGOTIABLE |
| III | Agent Authority | NON-NEGOTIABLE |
| IV | Story-Driven Development | MUST |
| V | No Invention | MUST |
| VI | Quality First | MUST |
| VII | Tenant Context | SHOULD |
| VIII | i18n Respect | SHOULD |

---

## Development

```bash
# Clone
git clone https://github.com/caiorodrigo10/operabase-core.git
cd operabase-core

# Install dependencies
npm install

# Run CLI locally
node bin/operabase.js --help

# Run smoke tests
node bin/operabase.js test

# Run diagnostics
node bin/operabase.js doctor
```

---

## License

MIT
