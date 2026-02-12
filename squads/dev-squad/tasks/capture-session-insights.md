# Capture Session Insights

> **Squad:** dev-squad
> **Skill:** @dev, @architect (any agent)
> **Command:** `*capture-insights {story-id} [--mode MODE]`

## Purpose

Capture insights from development sessions to enable persistent learning between sessions. Part of the Memory Layer.

---

## Task Definition

```yaml
task: captureSessionInsights
skill: "any"
squad: dev-squad
responsible: Any Agent (typically @dev, @architect)
elicit: true

inputs:
  - field: storyId
    type: string
    required: true
    validation: Valid story ID

  - field: complexity
    type: string
    required: false
    default: STANDARD
    validation: TRIVIAL|STANDARD|COMPLEX|EPIC

  - field: sessionDuration
    type: string
    required: false
    validation: Duration format (e.g., "2h", "4h30m")

  - field: mode
    type: string
    required: false
    default: interactive
    validation: yolo|interactive|comprehensive

outputs:
  - field: insights_file
    type: json
    destination: docs/stories/{storyId}/insights/session-{timestamp}.json

  - field: capture_summary
    type: markdown
    destination: Console output
```

---

## Execution Modes

### 1. YOLO Mode (0-1 prompts)
- Auto-capture with minimal interaction
- Uses session context to infer insights

### 2. Interactive Mode (3-5 prompts) **[DEFAULT]**
- Guided elicitation of insights
- Explicit validation of each category

### 3. Comprehensive Mode
- Deep exploration of all insight categories
- Detailed examples and code snippets

---

## Interactive Elicitation Process

### Step 1: Session Context
- Which story did this session work on?
- How long was this session?
- What was the complexity level? (TRIVIAL / STANDARD / COMPLEX / EPIC)

### Step 2: Discoveries
- What new things did you discover? (APIs, frameworks, tools, patterns)
- Category, description, relevance, related files

### Step 3: Patterns Learned
- What patterns or best practices did you learn or reinforce?
- Name, description, example location, applicability

### Step 4: Gotchas Found
- What pitfalls did you encounter?
- Wrong approach, right approach, reason, severity

### Step 5: Decisions Made
- What technical decisions were made?
- Decision, rationale, alternatives, reversibility

---

## Implementation Steps

1. Collect Session Context
2. Elicit Insights by Category
3. Validate Against Schema
4. Create Output Directory
5. Merge with Existing Insights (append-only, never overwrite)
6. Write Insights File

---

## Success Output

```
=== Session Insights Captured ===

Story: {storyId}
Session Duration: {sessionDuration}
Complexity: {complexity}

Captured:
  - Discoveries: {count}
  - Patterns Learned: {count}
  - Gotchas Found: {count}
  - Decisions Made: {count}

Output: docs/stories/{storyId}/insights/session-{timestamp}.json
```

---

## Error Handling

**Strategy:** graceful-degradation

1. **No Story ID** - Prompt user or use last active story
2. **Directory Creation Failed** - Attempt fallback location
3. **JSON Validation Failed** - Show errors, allow correction
4. **Merge Conflict** - Save as new file with suffix

---

## Notes

- Can be run multiple times per story (creates new timestamped file each time)
- Empty categories are allowed but at least one must have content
- Insights are append-only -- never delete or modify existing files

---

## Metadata

```yaml
squad: dev-squad
version: 1.0.0
tags:
  - memory-layer
  - learning
  - insights
  - session-capture
```
