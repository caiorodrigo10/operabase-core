# Review Story Task

> **Squad:** dev-squad
> **Skill:** @qa
> **Command:** `*review-story {story-id}`

## Purpose

Execute comprehensive QA review of a story implementation. Acts as a senior dev reviewer with refactoring ability -- fixes small issues directly, documents larger ones for dev to resolve.

---

## Task Definition

```yaml
task: reviewStory
skill: "@qa"
squad: dev-squad
responsible: Quinn (Guardian)

inputs:
  - field: story_id
    type: string
    required: true

  - field: mode
    type: string
    required: false
    default: interactive

outputs:
  - field: qa_report
    type: object
    destination: docs/qa/gates/

  - field: verdict
    type: enum
    values: ["APPROVE", "REJECT", "BLOCKED"]

  - field: quality_score
    type: number
    description: 0-100 quality score
```

---

## Review Process

### 1. Story Context Analysis
- Read story file completely
- Understand acceptance criteria
- Review file list for scope

### 2. Code Review

**Quality Dimensions:**

| Dimension | Weight | Checks |
|-----------|--------|--------|
| Correctness | 30% | AC compliance, logic errors, edge cases |
| Code Quality | 25% | Readability, patterns, naming, DRY |
| Testing | 20% | Coverage, test quality, edge cases |
| Security | 15% | OWASP basics, input validation, auth |
| Performance | 10% | Obvious bottlenecks, N+1 queries |

### 3. Run Quality Gates

```bash
npm run lint        # Code style
npm run typecheck   # Type safety
npm test            # Tests pass
npm run build       # Build succeeds
```

### 4. Issue Classification

| Severity | Action | Examples |
|----------|--------|---------|
| BLOCKING | Must fix before approval | Security vuln, broken AC, failing tests |
| WARNING | Should fix, impacts score | Code smell, missing test, poor naming |
| RECOMMENDATION | Nice to have | Optimization, refactoring suggestion |

### 5. Direct Fixes
- Fix small issues directly (typos, imports, formatting)
- Document what was changed
- Leave checklist for larger items

### 6. Generate Verdict

- **APPROVE**: Quality score >= 80, no BLOCKING issues
- **REJECT**: BLOCKING issues found, needs dev fixes
- **BLOCKED**: Fundamental issues requiring architectural changes

---

## Gate Report Format

```yaml
gate:
  story_id: "{story_id}"
  reviewer: "@qa"
  date: "{date}"
  verdict: "APPROVE|REJECT|BLOCKED"
  quality_score: N
  issues:
    blocking: []
    warning: []
    recommendation: []
  fixes_applied: []
  checklist_remaining: []
```

---

## Error Handling

1. **Story Not Found** - Ask for correct story ID
2. **Missing Files** - Note in report, continue review
3. **Build Failures** - Document as BLOCKING issue

---

## Metadata

```yaml
squad: dev-squad
version: 1.0.0
tags:
  - qa
  - review
  - quality-gate
```
