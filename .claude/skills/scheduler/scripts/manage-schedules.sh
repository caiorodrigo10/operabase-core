#!/bin/bash
# manage-schedules.sh - Manage Claude Code scheduled tasks
# Usage: manage-schedules.sh [list|status|remove|logs] [task-id]

ACTION="${1:-list}"
TASK_ID="$2"

case "$(uname -s)" in
    Darwin*) PLATFORM="macos" ;;
    Linux*)  PLATFORM="linux" ;;
    *) echo "Unsupported platform"; exit 1 ;;
esac

list_tasks() {
    echo "=== Claude Code Scheduled Tasks ==="
    if [ "$PLATFORM" = "macos" ]; then
        echo ""
        echo "Registered tasks:"
        launchctl list 2>/dev/null | grep "claude.schedule" || echo "  (none found)"
        echo ""
        echo "Plist files:"
        ls -la ~/Library/LaunchAgents/com.claude.schedule.* 2>/dev/null || echo "  (none found)"
    else
        echo ""
        echo "Cron entries:"
        crontab -l 2>/dev/null | grep "claude" || echo "  (none found)"
        echo ""
        echo "Scripts:"
        ls -la ~/.claude/scripts/*.sh 2>/dev/null || echo "  (none found)"
    fi
}

show_status() {
    if [ -z "$TASK_ID" ]; then
        echo "Usage: manage-schedules.sh status <task-id>"
        exit 1
    fi
    if [ "$PLATFORM" = "macos" ]; then
        launchctl list "com.claude.schedule.$TASK_ID" 2>/dev/null || echo "Task not found: $TASK_ID"
    else
        crontab -l 2>/dev/null | grep "$TASK_ID" || echo "Task not found: $TASK_ID"
    fi
}

remove_task() {
    if [ -z "$TASK_ID" ]; then
        echo "Usage: manage-schedules.sh remove <task-id>"
        exit 1
    fi
    if [ "$PLATFORM" = "macos" ]; then
        PLIST="$HOME/Library/LaunchAgents/com.claude.schedule.$TASK_ID.plist"
        if [ -f "$PLIST" ]; then
            launchctl unload "$PLIST" 2>/dev/null
            rm "$PLIST"
            echo "Removed task: $TASK_ID"
        else
            echo "Plist not found: $PLIST"
        fi
    else
        crontab -l 2>/dev/null | grep -v "$TASK_ID" | crontab -
        rm -f "$HOME/.claude/scripts/$TASK_ID.sh"
        echo "Removed task: $TASK_ID"
    fi
}

show_logs() {
    if [ -z "$TASK_ID" ]; then
        echo "Usage: manage-schedules.sh logs <task-id>"
        exit 1
    fi
    LOG_FILE="$HOME/.claude/logs/$TASK_ID.log"
    if [ -f "$LOG_FILE" ]; then
        echo "=== Logs for $TASK_ID ==="
        tail -50 "$LOG_FILE"
    else
        echo "No logs found for: $TASK_ID"
    fi
}

case "$ACTION" in
    list) list_tasks ;;
    status) show_status ;;
    remove) remove_task ;;
    logs) show_logs ;;
    *) echo "Usage: manage-schedules.sh [list|status|remove|logs] [task-id]" ;;
esac
