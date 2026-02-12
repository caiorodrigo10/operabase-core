---
task: execute-checklist
skill: qa
squad: dev-squad
description: "Execute validation checklists against documentation or code"
---

# Execute Checklist

> Skill: @qa (Quinn)

## Purpose
Validate documentation or code against structured checklists. Systematic review with pass/fail/partial scoring.

## Command
```
*checklist [checklist-name] [--mode yolo|interactive]
```

## Steps

1. **Initial Assessment**
   - If checklist name provided: load from `squads/*/checklists/`
   - If not provided: list available checklists
   - Confirm execution mode:
     - Interactive: section by section (thorough)
     - YOLO: all at once (fast, recommended for checklists)

2. **Gather Artifacts**
   - Each checklist specifies required documents
   - Resolve document paths in `docs/` folder
   - If document not found: halt and ask user

3. **Process Checklist**
   For each checklist item:
   - Read and understand the requirement
   - Check against relevant documentation/code
   - Mark as:
     - PASS: Requirement clearly met
     - FAIL: Requirement not met
     - PARTIAL: Some aspects covered, needs improvement
     - N/A: Not applicable (with justification)

4. **Section Analysis**
   For each section:
   - Calculate pass rate
   - Identify common themes in failures
   - Provide specific recommendations

5. **Final Report**
   - Overall completion status
   - Pass rates by section
   - Failed items with context
   - Recommendations for improvement
   - N/A items with justification

## Error Handling
- Checklist not found → fuzzy match or list alternatives
- Document not found → halt and ask user
- Ambiguous requirement → note as PARTIAL with explanation
