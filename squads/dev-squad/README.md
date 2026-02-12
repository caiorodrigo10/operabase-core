# dev-squad

> Core development squad with 3 essential agents for everyday development workflows.

## Agents

| Agent | Persona | Domain |
|-------|---------|--------|
| @dev | Dex | Code implementation, debugging, testing |
| @qa | Quinn | Code review, quality gates, security |
| @devops | Gage | Git push (EXCLUSIVE), CI/CD, releases |

## Also Includes

| Agent | Persona | Domain |
|-------|---------|--------|
| @orchestrator | Opus | Pipeline coordination, workflow execution |
| @kairos | Kairos | Agent Teams parallel orchestration |
| @squad-creator | Craft | Create new squads |

## Quick Start

```
@dev *help          # Show dev commands
@qa *help           # Show QA commands
@devops *help       # Show DevOps commands
@orchestrator *help # Show orchestration commands
```

## Structure

```
squads/dev-squad/
├── agents/          # Agent definitions (6)
├── tasks/           # Task workflows (13)
├── workflows/       # Workflow YAML files (5)
├── templates/       # Output templates
├── config/          # Quality gates config
└── memory/          # Per-agent memory
```
