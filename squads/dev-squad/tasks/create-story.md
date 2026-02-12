# Create Story Task

> **Squad:** dev-squad
> **Skill:** @sm, @po
> **Command:** `*create-story`

## Purpose

Identify the next logical story based on project progress and epic definitions, then prepare a comprehensive, self-contained, and actionable story file. Ensures the story is enriched with all necessary technical context, requirements, and acceptance criteria.

---

## Task Definition

```yaml
task: createStory
skill: "@sm"
squad: dev-squad
responsible: River (Facilitator)

inputs:
  - field: epic_id
    type: string
    required: false
    description: Epic to create story for (auto-detected if not provided)

  - field: mode
    type: string
    required: false
    default: interactive

outputs:
  - field: story_file
    type: markdown
    destination: docs/stories/{epicNum}.{storyNum}.story.md

  - field: story_id
    type: string
```

---

## Sequential Task Execution

### 0. Load Configuration
- Load project configuration
- Extract key paths: story location, PRD, architecture

### 1. Identify Next Story

1. Locate epic files and review existing stories
2. Find the highest numbered story file
3. If highest story exists:
   - Verify status is 'Done'
   - If not done, alert user
   - If epic is complete, prompt user for next action
4. If no story files exist: Next story is 1.1

### 2. Gather Story Requirements
- Extract story requirements from the identified epic
- If previous story exists, review Dev Agent Record for:
  - Completion Notes and Debug Log References
  - Implementation deviations and technical decisions
  - Challenges encountered and lessons learned

### 3. Gather Architecture Context
- Read relevant architecture documents based on story type
- Extract story-specific technical details
- ALWAYS cite source documents

### 4. Verify Project Structure Alignment
- Cross-reference story requirements with project structure
- Document any structural conflicts

### 5. Populate Story Template
- Create new story file using Story Template
- Fill in: Title, Status (Draft), Story statement, Acceptance Criteria
- Populate Dev Notes with architecture context
- Generate detailed task list linked to ACs

### 6. Story Draft Completion
- Review all sections for completeness
- Verify all source references included
- Update status to "Draft"
- Provide summary to user

---

## Story Template Sections

- **Title and Status**
- **Story Statement** (As a... I want... So that...)
- **Acceptance Criteria** (Given/When/Then)
- **Dev Notes** (Technical context from architecture)
- **Tasks / Subtasks** (Detailed implementation steps)
- **File List** (Files to create/modify)
- **Change Log**

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Epic or PRD documentation exists
    blocker: true
  - [ ] Story does not already exist
    blocker: true
  - [ ] Required inputs provided
    blocker: true
```

---

## Error Handling

1. **Epic Not Found** - Ask user to specify epic
2. **Previous Story Incomplete** - Warn user, allow override
3. **Architecture Docs Missing** - Note in Dev Notes, continue

---

## Metadata

```yaml
squad: dev-squad
version: 1.0.0
tags:
  - story-creation
  - planning
  - scrum
```
