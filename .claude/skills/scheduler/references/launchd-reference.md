# launchd Reference (macOS)

## Overview

launchd is macOS's native service manager. For user tasks, use LaunchAgents.

## Paths

| Type | Path | Scope |
|------|------|-------|
| User agents | `~/Library/LaunchAgents/` | Current user |
| Global agents | `/Library/LaunchAgents/` | All users |
| System daemons | `/Library/LaunchDaemons/` | System-level |

**For Claude Code tasks, always use:** `~/Library/LaunchAgents/`

## Naming Convention

```
com.claude.schedule.<task-id>.plist
com.claude.schedule.once.<task-id>.plist  # For one-time tasks
```

## Key Plist Elements

### Label (Required)
```xml
<key>Label</key>
<string>com.claude.schedule.my-task</string>
```

### ProgramArguments (Required)
```xml
<key>ProgramArguments</key>
<array>
    <string>/bin/bash</string>
    <string>-c</string>
    <string>your command here</string>
</array>
```

### StartCalendarInterval (Recurring)
```xml
<key>StartCalendarInterval</key>
<dict>
    <key>Hour</key><integer>9</integer>
    <key>Minute</key><integer>0</integer>
</dict>
```

Available keys: Minute (0-59), Hour (0-23), Day (1-31), Weekday (0-6, Sunday=0), Month (1-12)

### StartInterval (Polling)
```xml
<key>StartInterval</key>
<integer>60</integer>
```
Runs every N seconds. Used for one-time tasks with timestamp comparison.

### EnvironmentVariables
```xml
<key>EnvironmentVariables</key>
<dict>
    <key>PATH</key>
    <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$HOME/.local/bin</string>
    <key>HOME</key>
    <string>{HOME}</string>
</dict>
```

**Important:** Do NOT use `~` in paths. Always include full PATH.

## Common Mistakes to Avoid

- DON'T use WorkingDirectory plist key (causes permission errors) -- DO use `cd` in command
- DON'T use tilde (~) -- DO use full path or $HOME in bash -c
- DON'T forget XML escaping -- DO escape ampersands (`&amp;&amp;`)

## launchctl Commands

```bash
# Load/Unload
launchctl load ~/Library/LaunchAgents/com.claude.schedule.my-task.plist
launchctl unload ~/Library/LaunchAgents/com.claude.schedule.my-task.plist

# Status
launchctl list | grep claude
launchctl list com.claude.schedule.my-task

# Debug
plutil -lint ~/Library/LaunchAgents/com.claude.schedule.my-task.plist
log show --predicate 'subsystem == "com.apple.xpc.launchd"' --last 5m | grep claude
launchctl start com.claude.schedule.my-task
```

## Weekday Mapping

| launchd | Day |
|---------|-----|
| 0 | Sunday |
| 1 | Monday |
| 2 | Tuesday |
| 3 | Wednesday |
| 4 | Thursday |
| 5 | Friday |
| 6 | Saturday |
