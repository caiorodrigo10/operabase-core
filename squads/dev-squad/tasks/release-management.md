# Release Management Task

> **Squad:** dev-squad
> **Skill:** @devops
> **Command:** `*version-check`

## Purpose

Analyze changes, recommend version bumps, and manage semantic versioning. Determines appropriate version number based on changes since last release.

---

## Task Definition

```yaml
task: releaseManagement
skill: "@devops"
squad: dev-squad
responsible: Gage (Automator)

inputs:
  - field: mode
    type: string
    required: false
    default: interactive

outputs:
  - field: version_recommendation
    type: object
    destination: Memory

  - field: changelog
    type: markdown
    destination: CHANGELOG.md
```

---

## Semantic Versioning Rules

- **MAJOR** (v4.0.0 -> v5.0.0): Breaking changes, API redesign
- **MINOR** (v4.31.0 -> v4.32.0): New features, backward compatible
- **PATCH** (v4.31.0 -> v4.31.1): Bug fixes only

## Keywords for Detection

**Breaking Changes** (MAJOR):
- `BREAKING CHANGE:`, `BREAKING:`, `!` in commit type (e.g., `feat!:`)

**New Features** (MINOR):
- `feat:`, `feature:`

**Bug Fixes** (PATCH):
- `fix:`, `bugfix:`, `hotfix:`

---

## Workflow Steps

### 1. Get Last Git Tag
```bash
git describe --tags --abbrev=0
```

### 2. Analyze Commits Since Last Tag
```bash
git log <last-tag>..HEAD --oneline
```
Parse each commit message for breaking changes, features, and fixes.

### 3. Recommend Version Bump
1. If `breakingChanges > 0` -> MAJOR bump
2. Else if `features > 0` -> MINOR bump
3. Else if `fixes > 0` -> PATCH bump
4. Else -> No version bump needed

### 4. User Confirmation
Present recommendation with change summary.

### 5. Update package.json
Write new version to package.json.

### 6. Create Git Tag
```bash
git tag -a v<newVersion> -m "Release v<newVersion>"
```

### 7. Generate Changelog
Extract commits since last tag and format as markdown changelog.

---

## Output Example

```
Version Analysis

Current version:  v4.31.0
Recommended:      v4.32.0 (MINOR)

Changes since v4.31.0:
  Breaking changes: 0
  New features:     3
  Bug fixes:        2

Reason: New features detected (backward compatible)
```

---

## Notes

- Works with ANY repository
- Respects conventional commits format
- User always has final approval
- Does NOT push to remote (that's done by *push command)

---

## Metadata

```yaml
squad: dev-squad
version: 1.0.0
tags:
  - devops
  - versioning
  - release
  - changelog
```
