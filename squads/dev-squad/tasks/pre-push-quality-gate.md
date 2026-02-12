# Pre-Push Quality Gate Task

> **Squad:** dev-squad
> **Skill:** @devops
> **Command:** `*pre-push`

## Purpose

Execute comprehensive quality checks before pushing code to remote repository. Ensures code quality, tests, and security standards are met.

---

## Task Definition

```yaml
task: prePushQualityGate
skill: "@devops"
squad: dev-squad
responsible: Gage (Automator)

inputs:
  - field: story_id
    type: string
    required: false
    description: Optional story ID for story status check

  - field: mode
    type: string
    required: false
    default: interactive

outputs:
  - field: gate_status
    type: enum
    values: ["PASS", "CONCERNS", "FAIL"]

  - field: gate_report
    type: object
    destination: Memory
```

---

## Constitutional Gate: Quality First

```yaml
constitutional_gate:
  name: Quality First
  severity: BLOCK

  required_checks:
    - name: lint
      command: npm run lint
      must_pass: true
    - name: typecheck
      command: npm run typecheck
      must_pass: true
    - name: test
      command: npm test
      must_pass: true
    - name: build
      command: npm run build
      must_pass: true

  bypass:
    allowed: false
    reason: "Quality First is enforced by constitution"
```

---

## Quality Gate Checks

### 1. Check for Uncommitted Changes
```bash
git status --porcelain
```

### 2. Check for Merge Conflicts
```bash
git diff --check
```

### 3. Run npm run lint (if script exists)
Gracefully skip if script not found.

### 4. Run npm test (if script exists)

### 5. Run npm run typecheck (if script exists)

### 6. Run npm run build (if script exists)

### 7. Security Scan
- npm audit for dependency vulnerabilities
- Secret detection in codebase

### 8. Verify Story Status (Optional)
If story-driven workflow, check story status is "Done" or "Ready for Review".

---

## Summary Report

```
Pre-Push Quality Gate Summary

Quality Checks:
  [PASS/FAIL] No uncommitted changes
  [PASS/FAIL] No merge conflicts
  [PASS/FAIL] npm run lint
  [PASS/FAIL] npm test
  [PASS/FAIL] npm run typecheck
  [PASS/FAIL] npm run build
  [PASS/FAIL] Security scan

Overall Status: [READY TO PUSH / CONCERNS / BLOCKED]
```

---

## Gate Results

| Status | Action |
|--------|--------|
| PASS | All checks passed, proceed with push |
| CONCERNS | Warnings found, user decides |
| FAIL | Blocking issues, cannot push |

---

## User Approval

- **FAIL**: Cannot proceed, must fix issues
- **CONCERNS**: Present issues, ask user to confirm
- **PASS**: Ask user to confirm push

---

## Exit Codes

- `0` - All checks passed, user approved
- `1` - Quality gate failed (blocking)
- `2` - User declined to push

---

## Notes

- Works with ANY repository
- Gracefully handles missing npm scripts
- User always has final approval

---

## Metadata

```yaml
squad: dev-squad
version: 1.0.0
tags:
  - devops
  - quality-gate
  - pre-push
  - security
```
