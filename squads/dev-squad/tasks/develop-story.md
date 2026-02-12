# Develop Story Task

> **Squad:** dev-squad
> **Skill:** @dev
> **Command:** `*develop {story-id} [mode]`

## Purpose

Execute story development with selectable automation modes to accommodate different developer preferences, skill levels, and story complexity.

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

**Usage**:
```
*develop {story-id}           # Uses interactive mode (default)
*develop {story-id} yolo      # Uses YOLO mode
*develop {story-id} preflight # Uses pre-flight planning mode
```

---

## Task Definition

```yaml
task: developStory
skill: "@dev"
squad: dev-squad
responsible: Dex (Builder)

inputs:
  - field: story_id
    type: string
    required: true
    validation: Must match existing story file

  - field: mode
    type: string
    required: false
    validation: yolo|interactive|preflight
    default: interactive

outputs:
  - field: execution_result
    type: object
    destination: Memory

  - field: decision_log
    type: markdown
    destination: docs/stories/{story_id}/decision-log.md
```

---

## Constitutional Gates

### Gate 1: Story-Driven Development

```yaml
constitutional_gate:
  name: Story-Driven Development
  severity: BLOCK

  validation:
    - Story file MUST exist at docs/stories/{storyId}
    - Story MUST have acceptance criteria defined
    - Story MUST have at least one task/subtask

  on_violation:
    action: BLOCK
    message: |
      Cannot develop without a valid story.
      Resolution: Create or update story via @sm or @po
```

### Gate 2: Skills-First

```yaml
constitutional_gate:
  name: Skills-First
  severity: WARN

  validation:
    - If story involves new functionality:
      - CLI/skill implementation SHOULD exist or be created first
      - UI components SHOULD NOT be created before core logic

  on_violation:
    action: WARN
    message: |
      Skills-First: Core logic should precede UI implementation.
      Continue anyway? (This will be logged)
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Constitutional gates passed
    blocker: true
  - [ ] Story file exists and has valid structure
    blocker: true
  - [ ] Required parameters provided
    blocker: true
```

---

## Mode: YOLO (Autonomous)

### Workflow

1. **Initialization**
   - Read story file completely
   - Identify all tasks and acceptance criteria
   - Analyze technical requirements

2. **Task Execution** (Autonomous loop)
   - Read next task
   - Make autonomous decisions and log rationale
   - Implement task and subtasks
   - Write tests
   - Execute validations
   - Mark task complete [x] only if ALL validations pass
   - Update File List

3. **Completion**
   - All tasks complete
   - All tests pass
   - Set status: "Ready for Review"

**User Prompts**: 0-1 (only if blocking issue requires approval)

---

## Mode: Interactive (Balanced) **[DEFAULT]**

### Workflow

1. **Story Analysis** (With User)
   - Read story file completely
   - Present summary of tasks and AC
   - Confirm understanding with user

2. **Task Execution** (Interactive loop)
   - Read next task
   - **Decision Checkpoints** (Prompt user at):
     - Architecture decisions
     - Library selections
     - Algorithm choices
     - Testing approaches
   - Implement task and subtasks
   - Write tests
   - Execute validations
   - Show results to user before marking [x]
   - Update File List

3. **Completion**
   - All tasks complete
   - All tests pass
   - Present completion summary to user
   - Set status: "Ready for Review"

**User Prompts**: 5-10 (balanced for control and speed)

---

## Mode: Pre-Flight Planning (Comprehensive)

### Workflow

1. **Story Analysis Phase**
   - Read story file completely
   - Identify all ambiguities

2. **Questionnaire Generation**
   - Generate comprehensive questions covering all decisions
   - Present all questions to user at once
   - Collect all responses in batch

3. **Execution Plan Creation**
   - Create detailed execution plan with all decisions documented
   - Present plan to user for approval

4. **Zero-Ambiguity Execution**
   - Execute tasks with full context from questionnaire
   - No additional decision points

5. **Completion**
   - All tasks complete, all tests pass
   - Present execution summary vs. plan
   - Set status: "Ready for Review"

**User Prompts**: All upfront (questionnaire phase), then 0 during execution

---

## Common Workflow (All Modes)

### Order of Execution

1. Read (first or next) task
2. Implement task and its subtasks
3. Write tests
4. Execute validations
5. **Only if ALL pass**: Mark task checkbox [x]
6. Update story File List
7. Repeat until all tasks complete

### Story File Updates (All Modes)

**CRITICAL**: ONLY update these sections:
- Tasks / Subtasks checkboxes
- Dev Agent Record section
- File List
- Change Log (add entry on completion)
- Status (set to "Ready for Review" when complete)

**DO NOT modify**: Story, Acceptance Criteria, Dev Notes, Testing sections

### Blocking Conditions (All Modes)

**HALT and ask user if**:
- Unapproved dependencies needed
- Ambiguous requirements after checking story
- 3 failures attempting to implement or fix something
- Missing configuration
- Failing regression tests

### Completion Checklist (All Modes)

1. All tasks and subtasks marked [x]
2. All have corresponding tests
3. All validations pass
4. Full regression test suite passes
5. File List is complete
6. Set story status: "Ready for Review"
7. HALT (do not proceed further)

---

## Error Handling

**Strategy:** abort

1. **Task Not Found** - Verify task name and registration
2. **Invalid Parameters** - Validate parameters against task definition
3. **Execution Timeout** - Optimize task or increase timeout

---

## Performance

```yaml
duration_expected: 5-15 min (estimated)
cost_estimated: $0.003-0.010
token_usage: ~3,000-10,000 tokens
```

---

## Metadata

```yaml
squad: dev-squad
version: 1.0.0
tags:
  - development
  - code
  - story
```
