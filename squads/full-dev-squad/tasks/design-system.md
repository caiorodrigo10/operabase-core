---
task: design-system
skill: ux-design-expert
squad: full-dev-squad
description: "Initialize and configure design system structure"
---

# Design System Setup

> Skill: @ux-design-expert (Uma)

## Purpose
Initialize design system structure for greenfield or brownfield projects. Configure tokens, Tailwind v4, Shadcn utilities, and component directory structure.

## Command
```
*setup-design-system [--greenfield|--brownfield] [--path <dir>]
```

## Steps

1. **Detect Starting Point**
   - Check for existing design tokens
   - Determine greenfield vs brownfield

2. **Load or Create Tokens**
   - If brownfield: load existing tokens
   - If greenfield: create token template or prompt for input
   - Validate token schema (color, spacing, typography required)

3. **Create Directory Structure**
   - `components/ui/` (atoms/molecules)
   - `components/composite/`
   - `components/layout/`
   - `lib/` (utilities, cn helper)
   - `tokens/` (YAML, JSON, DTCG exports)
   - `docs/` (component documentation)

4. **Configure Dependencies**
   - Verify React, TypeScript, Tailwind packages
   - Install: class-variance-authority, tailwind-merge, @radix-ui/react-slot
   - Optional: Storybook 8, testing libraries

5. **Generate Configuration**
   - Create/merge tsconfig.json, jest.config.js
   - Create app.css with @theme and base styles
   - Generate tokens/index.ts with typed exports

6. **Initialize State**
   - Record setup configuration
   - Set phase to "setup_complete"
   - Generate setup-summary.md

## Success Criteria
- [ ] Directory structure follows Atomic Design principles
- [ ] Tokens loaded and validated
- [ ] Tailwind v4 configured
- [ ] Dependencies installed
- [ ] Base styles created with dark mode support

## Error Handling
- No tokens found → offer to create template
- Directory exists → ask to overwrite or use different location
- Missing dependencies → auto-install with npm
