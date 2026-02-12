---
name: scheduler
description: "Use when user wants to schedule tasks, create cron jobs, automate Claude Code executions, set up recurring tasks, or mentions 'agendar', 'schedule', 'cron', 'todo dia', 'toda semana', 'automatizar', 'launchd', 'recurring', 'agendamento'."
---

# Scheduler

Skill para agendamento automatizado de tarefas do Claude Code.

**Announce at start:** "Vou usar a skill scheduler para configurar o agendamento."

## Overview

Esta skill automatiza a criacao de tarefas agendadas usando:
- **launchd** (macOS)
- **cron** (Linux)
- **Task Scheduler** (Windows)

Scheduled tasks are registered in `.operabase/state.json` under the `scheduled_tasks` key for tracking.

---

## When to Use

- User quer agendar execucao do Claude Code
- Mentions "schedule", "cron", "agendar", "automatizar"
- Wants "todo dia as X", "toda semana", "recurring"
- Needs "launchd", "crontab" configuration
- Don't use for immediate one-time executions

---

## Task Types

### 1. One-Time (Unica)
Executa uma vez e auto-remove.

**Indicadores:**
- "hoje as 15h"
- "amanha as 10h"
- "proxima terca as 14h"
- Data/hora especifica sem "todo/toda/every"

### 2. Recurring (Recorrente)
Executa repetidamente conforme cron.

**Indicadores:**
- "todo dia as 9h"
- "toda segunda as 10h"
- "every weekday at 9am"
- "a cada 2 horas"
- Expressao cron explicita

---

## Information Gathering

### Required (Sempre perguntar)
| Campo | Descricao | Exemplo |
|-------|-----------|---------|
| `name` | Nome da tarefa | "daily-report" |
| `schedule` | Quando executar | "todo dia as 9h" ou "0 9 * * *" |
| `prompt` | O que Claude deve fazer | "Gere um relatorio do projeto" |

### Optional (Perguntar se relevante)
| Campo | Default | Quando perguntar |
|-------|---------|------------------|
| `working_dir` | Projeto atual | Se pode variar |
| `allowedTools` | "Read" | Se precisa escrever/executar |
| `autonomous` | false | Se precisa editar arquivos |
| `worktree` | false | Se precisa branch isolada |

---

## Cron Quick Reference

```
* * * * *
| | | | |
| | | | +-- Dia da semana (0-6, Dom=0)
| | | +---- Mes (1-12)
| | +------ Dia do mes (1-31)
| +-------- Hora (0-23)
+---------- Minuto (0-59)
```

### Common Patterns
| Expressao | Significado |
|-----------|-------------|
| `0 9 * * *` | Todo dia as 9h |
| `0 9 * * 1-5` | Dias uteis as 9h |
| `30 8 * * 1` | Segunda as 8:30 |
| `0 10 * * 3` | Quarta as 10h |
| `0 */2 * * *` | A cada 2 horas |
| `0 0 1 * *` | Dia 1 de cada mes |

### Natural Language -> Cron
| Input | Cron |
|-------|------|
| "todo dia as 9h" | `0 9 * * *` |
| "dias uteis as 10h" | `0 10 * * 1-5` |
| "toda segunda as 8h30" | `30 8 * * 1` |
| "toda quarta as 10h" | `0 10 * * 3` |
| "a cada 30 minutos" | `*/30 * * * *` |

---

## Platform Detection

```bash
case "$(uname -s)" in
    Darwin*) PLATFORM="macos" ;;
    Linux*)  PLATFORM="linux" ;;
    MINGW*|CYGWIN*) PLATFORM="windows" ;;
esac
```

---

## macOS Implementation (launchd)

### Paths
- **Plist location:** `~/Library/LaunchAgents/`
- **Logs:** `~/.claude/logs/`
- **Naming:** `com.claude.schedule.<id>.plist`

### Recurring Task Template

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.claude.schedule.{ID}</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-c</string>
        <string>cd "{WORKING_DIR}" &amp;&amp; {CLAUDE_PATH} -p "{PROMPT}" {FLAGS}</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:{HOME}/.local/bin</string>
        <key>HOME</key>
        <string>{HOME}</string>
    </dict>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key><integer>{HOUR}</integer>
        <key>Minute</key><integer>{MINUTE}</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>{HOME}/.claude/logs/{ID}.log</string>
    <key>StandardErrorPath</key>
    <string>{HOME}/.claude/logs/{ID}.error.log</string>
    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>
```

### One-Time Task Template

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.claude.schedule.once.{ID}</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-c</string>
        <string>TARGET={TIMESTAMP}; NOW=$(date +%s); if [ $NOW -ge $TARGET ]; then cd "{WORKING_DIR}" &amp;&amp; {CLAUDE_PATH} -p "{PROMPT}" {FLAGS} >> "$HOME/.claude/logs/once.{ID}.log" 2>&amp;1; rm "$HOME/Library/LaunchAgents/com.claude.schedule.once.{ID}.plist" 2>/dev/null; launchctl bootout gui/$(id -u)/com.claude.schedule.once.{ID} 2>/dev/null; fi</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:{HOME}/.local/bin</string>
        <key>HOME</key>
        <string>{HOME}</string>
    </dict>
    <key>StartInterval</key>
    <integer>30</integer>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/claude-schedule-once.{ID}.out</string>
    <key>StandardErrorPath</key>
    <string>/tmp/claude-schedule-once.{ID}.err</string>
</dict>
</plist>
```

### Commands

```bash
# Load task
launchctl load ~/Library/LaunchAgents/com.claude.schedule.{ID}.plist

# Unload task
launchctl unload ~/Library/LaunchAgents/com.claude.schedule.{ID}.plist

# List tasks
launchctl list | grep claude

# Check status
launchctl list com.claude.schedule.{ID}

# View logs
tail -f ~/.claude/logs/{ID}.log
```

---

## Linux Implementation (cron)

### Script Template

```bash
#!/bin/bash
# ~/.claude/scripts/{ID}.sh

export PATH="/usr/local/bin:/usr/bin:/bin:$HOME/.local/bin"
export HOME="{HOME}"

cd "{WORKING_DIR}"

claude -p "{PROMPT}" {FLAGS} >> "$HOME/.claude/logs/{ID}.log" 2>&1
```

### Crontab Entry

```cron
# {NAME} - {DESCRIPTION}
{CRON_EXPRESSION} /bin/bash ~/.claude/scripts/{ID}.sh
```

---

## Workflow

### Step 1: Gather Information
1. Nome da tarefa?
2. Quando deve executar? (horario/frequencia)
3. O que o Claude deve fazer? (prompt)
4. Precisa fazer modificacoes (arquivos, git)?

### Step 2: Confirm Configuration
Show configuration summary for user approval.

### Step 3: Create and Register
1. Generate unique ID: `{name}-{short_hash}`
2. Create plist/script from template
3. Register with system scheduler
4. Register in `.operabase/state.json` under `scheduled_tasks`
5. Verify registration
6. Show confirmation with management commands

### Step 4: Confirm Success
Show success message with file paths and useful commands.

---

## State Tracking

Scheduled tasks are tracked in `.operabase/state.json`:

```json
{
  "scheduled_tasks": [
    {
      "id": "daily-report-a1b2",
      "name": "daily-report",
      "type": "recurring",
      "schedule": "0 9 * * *",
      "prompt": "Generate project report",
      "platform": "macos",
      "plist": "~/Library/LaunchAgents/com.claude.schedule.daily-report-a1b2.plist",
      "created_at": "2026-02-12T10:00:00Z",
      "status": "active"
    }
  ]
}
```

---

## Flags Reference

| Flag | Quando usar |
|------|-------------|
| `--allowedTools "Read"` | Apenas leitura |
| `--allowedTools "Read,Write,Edit"` | Criar/editar arquivos |
| `--allowedTools "Read,Bash"` | Executar comandos |
| `--allowedTools "Read,Bash(git *)"` | Apenas comandos git |
| `--dangerously-skip-permissions` | Modo totalmente autonomo |
| `--output-format json` | Saida estruturada |

---

## Error Handling

| Problema | Solucao |
|----------|---------|
| "No such file" | Verificar PATH no plist |
| "Permission denied" | `chmod +x` no script |
| Task nao executa | Verificar logs em `/tmp/` |
| launchctl error | Remover e recriar plist |

---

## Checklist

- [ ] Announced skill usage
- [ ] Gathered: name, schedule, prompt
- [ ] Detected task type (one-time vs recurring)
- [ ] Converted schedule to cron (if needed)
- [ ] Asked about autonomous mode (if relevant)
- [ ] Showed configuration for confirmation
- [ ] Created plist/script with correct template
- [ ] Registered with system scheduler
- [ ] Registered in .operabase/state.json
- [ ] Verified registration
- [ ] Showed success message with commands
