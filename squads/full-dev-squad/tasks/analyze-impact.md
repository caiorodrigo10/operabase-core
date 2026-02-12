---
task: analyze-impact
skill: architect
squad: full-dev-squad
description: "Analyze impact of proposed modifications on the codebase"
---

# Analyze Impact

> Skill: @architect (Aria)

## Purpose
Analyze the potential impact of proposed component modifications on the broader system.

## Command
```
*analyze-impact <modification-type> <component-path> [--depth shallow|medium|deep]
```

## Parameters
- `modification-type`: modify, deprecate, remove, refactor
- `component-path`: Path to the component being modified
- `--depth`: Analysis depth (default: medium)
- `--include-tests`: Include test file impact analysis
- `--risk-threshold`: Risk threshold for warnings (low, medium, high, critical)

## Steps

1. **Validate Target Component**
   - Verify component exists
   - Determine component type (skill, task, workflow, util, etc.)

2. **Analyze Dependencies**
   - Find all files that import/reference the component
   - Trace dependency chain to specified depth
   - Identify breaking change potential

3. **Assess Risk**
   - Evaluate modification risks across dimensions
   - Score impact for each affected component (1-10)
   - Classify overall risk: low, medium, high, critical

4. **Generate Report**
   - List affected components with impact scores
   - Provide recommendations
   - If high/critical risk: request user approval before proceeding

## Output
- Impact summary with risk level
- Affected components list
- Recommendations for safe modification

## Error Handling
- Component not found → suggest similar paths
- Permission denied → escalate to user
- Timeout → reduce analysis depth and retry
