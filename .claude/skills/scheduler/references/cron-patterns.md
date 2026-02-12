# Cron Patterns Reference

## Format

```
* * * * *
| | | | |
| | | | +-- Day of week (0-6, Sunday=0)
| | | +---- Month (1-12)
| | +------ Day of month (1-31)
| +-------- Hour (0-23)
+---------- Minute (0-59)
```

## Common Patterns

| Pattern | Cron | Description |
|---------|------|-------------|
| Daily at 9 AM | `0 9 * * *` | Every day |
| Weekdays at 9 AM | `0 9 * * 1-5` | Mon-Fri |
| Monday at 8:30 | `30 8 * * 1` | Weekly |
| Wednesday at 10 | `0 10 * * 3` | Weekly |
| Every 2 hours | `0 */2 * * *` | Bi-hourly |
| First of month | `0 0 1 * *` | Monthly |
| Every 30 min | `*/30 * * * *` | Half-hourly |

## Natural Language Mapping

| Portuguese | English | Cron |
|------------|---------|------|
| todo dia as 9h | daily at 9am | `0 9 * * *` |
| dias uteis as 10h | weekdays at 10am | `0 10 * * 1-5` |
| toda segunda as 8h30 | every monday at 8:30 | `30 8 * * 1` |
| toda quarta as 10h | every wednesday at 10 | `0 10 * * 3` |
| a cada 30 minutos | every 30 minutes | `*/30 * * * *` |
| a cada 2 horas | every 2 hours | `0 */2 * * *` |
| dia 1 de cada mes | first of each month | `0 0 1 * *` |

## Special Strings (cron only, not launchd)

| String | Equivalent |
|--------|-----------|
| @yearly | `0 0 1 1 *` |
| @monthly | `0 0 1 * *` |
| @weekly | `0 0 * * 0` |
| @daily | `0 0 * * *` |
| @hourly | `0 * * * *` |
