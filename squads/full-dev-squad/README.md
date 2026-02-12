# full-dev-squad

> Complete development squad with 9 specialized agents for comprehensive development workflows.

## Agents

| Agent | Persona | Domain |
|-------|---------|--------|
| @dev | Dex | Code implementation, debugging, testing |
| @qa | Quinn | Code review, quality gates, security |
| @devops | Gage | Git push (EXCLUSIVE), CI/CD, releases |
| @architect | Aria | Architecture, API design, tech stack |
| @pm | Morgan | PRD, product strategy, roadmap |
| @po | Pax | Backlog, acceptance criteria, sprint |
| @sm | River | Story creation, sprint planning |
| @data-engineer | Dara | Database design, schema, migrations |
| @ux-design-expert | Uma | UX/UI, design systems, wireframes |

## Quick Start

```
@architect *help     # Architecture decisions
@pm *create-prd      # Create product requirements
@po *backlog-review  # Review backlog
@sm *create-story    # Create user story
```

## Structure

```
squads/full-dev-squad/
├── agents/          # Agent definitions (9)
├── tasks/           # Task workflows (2)
├── config/          # Quality gates config
└── memory/          # Per-agent memory
```
