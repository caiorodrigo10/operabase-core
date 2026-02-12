# {{squad_name}}

> {{squad_description}}

## Agents

| Agent | Persona | Domain |
|-------|---------|--------|
{{agents_table}}

## Quick Start

```
@{{master_agent}} *help          # Show available commands
{{quick_start_commands}}
```

## Structure

```
squads/{{squad_name}}/
├── agents/                # Agent definitions
├── tasks/                 # Task workflows
├── templates/             # Output templates
├── knowledge/             # Domain knowledge base
├── memory/                # Persistent squad memory
├── config/                # Configuration files
│   └── quality-gates.yaml # Squad-specific quality gates
├── commands/              # Namespace commands
└── .claude/
    └── skills/            # Claude Code skill entry points
```

## Commands

{{commands_documentation}}

---

_Squad created by @squad-creator (Craft) | Operabase_
