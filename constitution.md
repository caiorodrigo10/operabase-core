# Operabase Constitution

> **Version:** 1.0.0 | **Ratified:** 2026-02-12 | **Last Amended:** 2026-02-12

This document defines the fundamental and non-negotiable principles of Operabase. All agents, skills, tasks, and workflows MUST respect these principles. Violations are blocked automatically via gates.

---

## Core Principles

### I. Skills-First (NON-NEGOTIABLE)

All intelligence lives in Skills (SKILL.md files). The runtime only handles infrastructure — gates, manifest, validation, state management.

**Rules:**
- MUST: All agent logic, decision-making, and behavior MUST be defined in SKILL.md files
- MUST: The runtime MUST NOT contain business logic or agent intelligence
- MUST: New capabilities MUST be implemented as Skills before any runtime changes
- MUST: Skills are the source of truth for what agents can and cannot do

**Hierarchy:**
```
Skills (Intelligence) → Runtime (Infrastructure) → UI (Observation)
```

**Gate:** WARN if runtime code contains agent-level logic or decision-making

---

### II. Light Runtime (NON-NEGOTIABLE)

The Node.js runtime exists solely for infrastructure tasks. Skills are intelligence; Runtime is infrastructure.

**Rules:**
- MUST: Runtime handles ONLY: CLI commands, config validation, quality gates, state management, manifest tracking
- MUST: Runtime MUST NOT make decisions that belong to agents
- MUST: Runtime code MUST remain under 50KB total JavaScript
- MUST: All orchestration logic lives in the Orchestrator SKILL.md, not in runtime code
- SHOULD: Runtime commands are thin wrappers that invoke validation, not business logic

**What belongs where:**

| Concern | Where | Why |
|---------|-------|-----|
| Agent behavior | SKILL.md | Intelligence lives in prompts |
| Config validation | Runtime | Infrastructure concern |
| Quality gates execution | Runtime | Enforcement mechanism |
| Pipeline orchestration | Orchestrator SKILL.md | Intelligence |
| Manifest tracking | Runtime | File system infrastructure |
| State persistence | Runtime | I/O infrastructure |

**Gate:** BLOCK if runtime JS exceeds 50KB or contains orchestration logic

---

### III. Agent Authority (NON-NEGOTIABLE)

Each agent has exclusive authorities that cannot be violated by any other agent.

**Rules:**
- MUST: Only @devops can execute `git push` to remote
- MUST: Only @devops can create Pull Requests
- MUST: Only @devops can create releases and tags
- MUST: Agents MUST delegate to the appropriate agent when outside their scope
- MUST: No agent can assume another agent's authority

**Exclusivities:**

| Authority | Exclusive Agent |
|-----------|----------------|
| git push | @devops |
| PR creation | @devops |
| Release/Tag | @devops |
| Story creation | @sm, @po |
| Architecture decisions | @architect |
| Quality verdicts | @qa |

**Gate:** Enforced via agent SKILL.md definitions (CAN/CANNOT rules)

---

### IV. Story-Driven Development (MUST)

All development starts and ends with a story.

**Rules:**
- MUST: No code is written without an associated story
- MUST: Stories MUST have clear acceptance criteria before implementation
- MUST: Progress MUST be tracked via checkboxes in the story
- MUST: File List MUST be kept up-to-date in the story
- SHOULD: Stories follow the workflow: @po/@sm creates -> @dev implements -> @qa validates -> @devops pushes

**Gate:** BLOCK if no valid story exists when starting development

---

### V. No Invention (MUST)

Specifications do not invent — they derive from requirements only.

**Rules:**
- MUST: Every statement in a spec MUST trace to:
  - A functional requirement (FR-*)
  - A non-functional requirement (NFR-*)
  - A constraint (CON-*)
  - A verified research finding
- MUST NOT: Add features not present in requirements
- MUST NOT: Assume implementation details not researched
- MUST NOT: Specify technologies not validated

**Gate:** BLOCK if spec contains inventions or untraced statements

---

### VI. Quality First (MUST)

Quality is non-negotiable. All code passes through multiple gates before merge.

**Rules:**
- MUST: `npm run lint` passes without errors
- MUST: `npm run typecheck` passes without errors
- MUST: `npm test` passes without failures
- MUST: `npm run build` completes successfully
- MUST: Story status is "Done" or "Ready for Review"
- SHOULD: Test coverage does not decrease

**Gate:** BLOCK if any quality check fails at pre-push

---

### VII. Tenant Context (MUST — when multi-tenant enabled)

When multi-tenant is enabled, agents MUST always operate within the context of a specific tenant.

**Rules:**
- MUST: Relevant agents MUST ask which tenant before any operation (when multiple tenants exist)
- MUST: Single-tenant projects execute directly without prompting
- MUST: Tenant data is isolated per tenant directory (`tenants/{tenant-id}/`)
- MUST: Agent memory per tenant stays within the tenant scope
- MUST NOT: Mix data from different tenants in a single operation
- MUST NOT: Assume a default tenant — always ask explicitly

**Gate:** BLOCK if multi-tenant is enabled and no tenant is selected before data operations

---

### VIII. i18n Respect (MUST)

All user-facing output must respect the configured language.

**Rules:**
- MUST: Agent greetings, responses, and reports use the language defined in `operabase.yaml`
- MUST: Error messages from the runtime use the configured language
- MUST: Stories, tasks, and documentation follow the project language setting
- SHOULD: Support at minimum: English (en), Portuguese (pt), Spanish (es)
- MUST NOT: Mix languages within a single output unless quoting external content

**Gate:** WARN if agent output does not match configured language

---

## Enforcement

Operabase enforces the Constitution through three complementary mechanisms:

### Prompt-Driven Enforcement

The constitution is referenced in every SKILL.md file. Agents are aware of all principles and self-enforce during execution.

- Every SKILL.md includes: "Follow the Operabase Constitution (constitution.md)"
- Agents read and apply principles during every operation
- The Orchestrator verifies compliance before and after each phase

### Runtime-Driven Enforcement

The Node.js runtime executes quality gates that programmatically verify compliance.

- `npx operabase gates --stage pre_commit` — runs pre-commit quality checks
- `npx operabase gates --stage pre_push` — runs pre-push quality checks
- `npx operabase validate` — validates config against JSON Schema
- `npx operabase doctor` — comprehensive health check including constitution checks

### Hooks-Driven Enforcement

Claude Code hooks automatically trigger gates at key moments.

- **pre-commit hook**: Runs `npx operabase gates --stage pre_commit` (lint, typecheck)
- **pre-push hook**: Runs `npx operabase gates --stage pre_push` (test, build, full quality)
- Hooks are generated by the installer and placed in `.claude/hooks/`

---

## Gate Severity Levels

| Severity | Behavior | Usage |
|----------|----------|-------|
| BLOCK | Prevents execution, requires correction | NON-NEGOTIABLE principles, critical MUST rules |
| WARN | Allows continuation with alert | Non-critical MUST rules |
| INFO | Reports only | SHOULD rules |

---

## Governance

### Amendment Process

1. Change proposal documented with justification
2. Review by @architect and @po
3. Approval requires consensus
4. Change implemented with version update
5. Propagation to dependent templates and tasks

### Versioning

- **MAJOR:** Removal or incompatible redefinition of a principle
- **MINOR:** New principle or significant expansion
- **PATCH:** Clarifications, text corrections, refinements

### Compliance

- All PRs MUST verify compliance with the Constitution
- Automatic gates BLOCK violations of NON-NEGOTIABLE principles
- Automatic gates WARN on violations of MUST principles
- SHOULD violations are reported but do not block

---

## References

- **Derived from:** Synkra AIOS Constitution v1.0.0
- **Spec reference:** operabase-spec.md (Sections 2, 12, 13)
- **Gates implemented via:** Runtime (`npx operabase gates`) + Claude Code hooks
- **Skills reference:** `.claude/skills/*/SKILL.md`

---

*Operabase Constitution v1.0.0*
*Skills-First | Light Runtime | Quality First*
