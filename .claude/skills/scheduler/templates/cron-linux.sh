#!/bin/bash
# Claude Code Scheduled Task: {NAME}
# ID: {ID}
# Schedule: {CRON_EXPRESSION}
# Created: {CREATED_AT}

export PATH="/usr/local/bin:/usr/bin:/bin:$HOME/.local/bin"
export HOME="{HOME}"

cd "{WORKING_DIR}"

claude -p "{PROMPT}" {FLAGS} >> "$HOME/.claude/logs/{ID}.log" 2>&1
