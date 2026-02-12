# Scheduler Use Cases

## Development Automation

### Daily Morning Report
```
Name: morning-report
Schedule: 0 9 * * 1-5
Prompt: "Read the project status, check for failing tests, review open PRs, and generate a morning status report. Save to docs/reports/"
AllowedTools: Read, Bash(npm test), Bash(gh pr list)
```

### Nightly Test Suite
```
Name: nightly-tests
Schedule: 0 2 * * *
Prompt: "Run the full test suite with coverage. If any tests fail, create a report with details. Save results to docs/reports/test-coverage/"
AllowedTools: Read, Bash(npm test), Write
```

### Weekly Dependency Check
```
Name: weekly-deps
Schedule: 0 10 * * 1
Prompt: "Check for outdated npm dependencies, security vulnerabilities, and generate a dependency report"
AllowedTools: Read, Bash(npm audit), Bash(npm outdated)
```

## Business Automation

### Daily Performance Report (Media Buying)
```
Name: daily-performance
Schedule: 0 8 * * 1-5
Prompt: "Generate daily performance report for active campaigns"
AllowedTools: Read, Write
```

### Weekly Financial Review
```
Name: weekly-finance
Schedule: 0 9 * * 5
Prompt: "Generate weekly financial summary using Profit First methodology"
AllowedTools: Read, Write
```

## Personal Productivity

### Daily Journal Prompt
```
Name: daily-journal
Schedule: 0 20 * * *
Prompt: "Create today's daily note in the Obsidian vault with prompts for reflection"
AllowedTools: Read, Write
```

### Weekly Review
```
Name: weekly-review
Schedule: 0 18 * * 5
Prompt: "Generate weekly review template with this week's accomplishments and next week's goals"
AllowedTools: Read, Write
```
