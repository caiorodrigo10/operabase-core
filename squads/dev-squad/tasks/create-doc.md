---
task: create-doc
skill: pm
squad: dev-squad
description: "Create documentation from template using interactive workflow"
---

# Create Document from Template

> Skill: @pm (Morgan)

## Purpose
Create structured documents using YAML-driven templates with interactive elicitation.

## Command
```
*create-doc [template-name] [--output <path>] [--mode yolo|interactive]
```

## Steps

1. **Template Discovery**
   - If template provided: load it
   - If not: list available templates from `src/templates/`
   - Confirm template selection with user

2. **Set Preferences**
   - Confirm execution mode (interactive by default)
   - Confirm output file path

3. **Process Sections**
   For each template section:
   - Draft content using section instructions
   - Present content with rationale
   - If `elicit: true`: present numbered options (1-9), wait for user response
   - Apply user feedback
   - Save progress incrementally

4. **Finalize Document**
   - Compile all sections
   - Write output file
   - Present summary

## Elicitation Format (when elicit: true)
1. Proceed to next section
2-9. Select from available elicitation methods
End with: "Select 1-9 or just type your question/feedback:"

## Modes
- **Interactive** (default): Step-by-step with user feedback
- **YOLO**: Process all sections at once, present final result

## Error Handling
- Template not found → list available templates
- File already exists → ask before overwriting
- Invalid input → validate and re-prompt
