# Apply QA Fixes Task

> **Squad:** dev-squad
> **Skill:** @dev
> **Command:** `*apply-qa-fixes {story-id}`

## Purpose

Apply fixes based on QA feedback and gate review comments. Systematically address all quality issues identified during QA review.

---

## Task Definition

```yaml
task: applyQaFixes
skill: "@dev"
squad: dev-squad
responsible: Dex (Builder)

inputs:
  - field: story_id
    type: string
    required: true

  - field: gate_file
    type: string
    required: false
    description: Path to QA gate report file

  - field: mode
    type: string
    required: false
    default: interactive

outputs:
  - field: fixes_applied
    type: object
    destination: Memory

  - field: validation_results
    type: object
    destination: Memory
```

---

## Instructions

1. **Load QA Gate Report**
   - If user provides a gate file path, load it directly
   - Otherwise, check the story file for `gate_file` reference in `qa_results` section
   - If no gate file specified, ask user for the QA gate file path

2. **Review Findings**
   - Read through all issues identified in the QA gate report
   - Note the quality score and gate status
   - Categorize issues by type:
     - BLOCKING: Must fix before approval
     - WARNING: Should fix, impacts quality score
     - RECOMMENDATION: Nice to have improvements
   - Prioritize issues by severity and impact

3. **Create Fix Plan**
   - For each BLOCKING issue:
     - Identify affected files
     - Determine root cause
     - Plan specific fix approach
   - Group related issues that can be fixed together
   - Estimate effort for each fix

4. **Apply Fixes Systematically**
   For each issue:
   - Make the necessary code or documentation changes
   - Follow coding standards and best practices
   - Update tests if needed
   - Verify the fix resolves the specific issue
   - Update story file list if new files created/modified

5. **Validation**
   After applying all fixes:
   - Run linting: `npm run lint`
   - Run tests: `npm test`
   - Run type checking if applicable: `npm run typecheck`
   - Verify all BLOCKING issues are resolved

6. **Update Story Record**
   - Add completion note about QA fixes applied
   - Update file list with any new/modified files
   - Do NOT modify the qa_results section

7. **Re-submission**
   - Confirm all BLOCKING issues resolved
   - Verify regression tests still pass
   - Inform user that story is ready for QA re-review

---

## Best Practices

- **Address root causes**: Don't just fix symptoms
- **Maintain test coverage**: Update or add tests when modifying code
- **Follow patterns**: Use existing codebase patterns for consistency
- **Validate thoroughly**: Run full test suite, not just affected tests

---

## Exit Criteria

- All BLOCKING issues from QA gate are resolved
- All tests pass (linting, unit, integration)
- Story file is updated with changes
- Code is ready for QA re-review

---

## Error Handling

**Strategy:** retry

1. **Gate File Not Found** - Ask user for correct path
2. **Fix Introduces Regression** - Revert and try alternative approach
3. **Ambiguous Issue** - Ask user for clarification

---

## Metadata

```yaml
squad: dev-squad
version: 1.0.0
tags:
  - qa-fixes
  - quality
  - development
```
