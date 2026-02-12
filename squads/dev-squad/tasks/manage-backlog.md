# Manage Backlog Task

> **Squad:** dev-squad
> **Skill:** @po
> **Command:** `*backlog {operation}`

## Purpose

Manage the STORY-BACKLOG.md file to track follow-up tasks, technical debt, and optimization opportunities identified during story reviews, development, and QA processes.

---

## Task Definition

```yaml
task: manageBacklog
skill: "@po"
squad: dev-squad
responsible: Pax (Balancer)

inputs:
  - field: operation
    type: enum
    options: ["add", "update", "review", "archive", "report"]
    required: true

  - field: story_id
    type: string
    required: false
    description: Source story for new items

  - field: item_id
    type: string
    required: false
    description: Item to update (for update operation)

  - field: mode
    type: string
    required: false
    default: interactive

outputs:
  - field: backlog_file
    type: markdown
    destination: docs/STORY-BACKLOG.md

  - field: operation_result
    type: object
    destination: Memory
```

---

## Backlog File Location

**Default**: `docs/STORY-BACKLOG.md`
**Format**: Markdown with structured sections

---

## Operations

### 1. Add New Backlog Item

**Trigger**: After QA review, during development, or PM prioritization

**Input Parameters**:
```yaml
required:
  - story_id: 'STORY-XXX'
  - item_type: 'F'  # F=followup, O=optimization, T=technical-debt
  - priority: 'HIGH|MEDIUM|LOW'
  - title: 'Brief title'
  - description: 'Detailed description'
  - effort: '1 hour'

optional:
  - source: 'QA Review'
  - assignee: 'Backend Developer'
  - sprint: 'Sprint 1'
  - risk: 'LOW|MEDIUM|HIGH'
  - success_criteria: []
  - acceptance: 'How to accept as done'
```

**Process**:
1. Read existing `STORY-BACKLOG.md`
2. Generate unique ID: `[{story_id}-{item_type}{sequential_number}]`
3. Determine priority section (HIGH, MEDIUM, LOW)
4. Create item using template
5. Insert into appropriate priority section
6. Update statistics section
7. Write updated backlog file

**Item Template**:
```markdown
#### [{story_id}-{type}{num}] {title}
- **Source**: {source}
- **Priority**: {priority}
- **Effort**: {effort}
- **Status**: TODO
- **Assignee**: {assignee}
- **Sprint**: {sprint}
- **Description**: {description}
- **Success Criteria**:
  {for each criterion}
  - [ ] {criterion}
- **Acceptance**: {acceptance}
```

### 2. Update Backlog Item Status

**Trigger**: Work started, completed, or blocked

**Input Parameters**:
```yaml
required:
  - item_id: '[STORY-XXX-FY]'
  - new_status: 'TODO|IN_PROGRESS|BLOCKED|DONE|CANCELLED'

optional:
  - blocker_reason: 'Why blocked'
  - completion_notes: 'Notes on completion'
```

**Process**:
1. Find item by ID in backlog file
2. Update status field
3. Add completion date if DONE
4. Move to appropriate section if priority changed
5. Update statistics
6. Write updated file

**Status Values**:
- **TODO**: Not started
- **IN PROGRESS**: Currently being worked on
- **BLOCKED**: Waiting on dependency
- **DONE**: Completed and verified
- **IDEA**: Proposed but not yet approved
- **CANCELLED**: Decided not to implement

### 3. Review Backlog

**Trigger**: Weekly backlog review

**Process**:
1. Read entire backlog file
2. Generate review report:
   - Items by status
   - Items by priority
   - Items by sprint
   - Overdue items
   - Blocked items
3. Suggest priority adjustments
4. Output review summary

**Review Questions**:
- Are all TODO items still relevant?
- Should any IDEA items be promoted to TODO?
- Are any items blocked for too long?
- Do priorities still make sense?
- Are effort estimates accurate?

### 4. Archive Completed Items

**Trigger**: Monthly or when backlog gets too large

**Process**:
1. Collect all DONE items
2. Create archive file: `docs/qa/backlog-archive-{date}.md`
3. Move DONE items to archive with completion metadata
4. Remove from main backlog
5. Update statistics

### 5. Generate Backlog Report

**Trigger**: Sprint planning, stakeholder requests

**Output Options**:
- **Summary**: Item counts by priority/status/sprint
- **Detailed**: Full item list with all fields
- **Sprint View**: Items grouped by sprint
- **Team View**: Items grouped by assignee
- **Risk View**: High-risk items requiring attention

---

## Backlog Item Lifecycle

```
IDEA → TODO → IN PROGRESS → DONE → ARCHIVED
                    ↓
                 BLOCKED
                    ↓
                CANCELLED
```

---

## Integration Points

### QA Integration
After completing story review, QA should:
1. Identify follow-ups, technical debt, optimizations
2. Call `*backlog add` for each item
3. Reference backlog items in QA Results section

### Dev Integration
During development, dev should:
1. Note technical debt incurred for speed
2. Identify optimization opportunities
3. Add items to backlog with `source: Development`

### PO Commands
- `*backlog review`: Generate review report for sprint planning
- `*backlog add`: Add new item to backlog
- `*backlog update`: Update item status
- `*backlog archive`: Archive completed items
- `*backlog report`: Generate summary report

---

## Best Practices

1. **Be Specific**: Clear, actionable descriptions
2. **Size Appropriately**: Break large items into smaller ones (< 8 hours)
3. **Link Context**: Reference source story, QA report, or decision doc
4. **Estimate Honestly**: Include effort estimates for planning
5. **Review Regularly**: Weekly reviews keep backlog healthy
6. **Archive Promptly**: Don't let backlog grow stale with old DONE items
7. **Track Dependencies**: Note blockers and dependencies

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Backlog file exists or can be created
    blocker: true
  - [ ] Valid operation specified
    blocker: true
```

---

## Error Handling

1. **Backlog File Not Found** - Create new backlog file with template
2. **Item Not Found** - Suggest fuzzy match or list recent items
3. **Duplicate Item** - Warn and suggest updating existing item
4. **Invalid Status Transition** - Warn about invalid state change

---

## Metadata

```yaml
squad: dev-squad
version: 1.0.0
tags:
  - product-management
  - backlog
  - planning
```
