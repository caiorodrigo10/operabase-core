# Knowledge Base

The knowledge base stores domain expertise, benchmarks, research, and reference material that agents use to make informed decisions. Knowledge files are structured Markdown documents that agents load on demand when they need context for a task.

---

## Structure

Knowledge is organized at two levels:

```
docs/knowledge/                         # Global knowledge (shared across all squads)
squads/{squad-name}/knowledge/          # Squad-specific knowledge
```

### Global Knowledge (`docs/knowledge/`)

Shared reference material available to all agents regardless of squad:

- Industry benchmarks and standards
- Company-wide guidelines and policies
- Cross-domain research findings
- Architecture decision records (ADRs)
- Technology evaluations

### Squad-Specific Knowledge (`squads/{squad}/knowledge/`)

Domain expertise scoped to a particular squad:

- Domain-specific benchmarks (e.g., ad performance targets)
- Data source documentation (e.g., API schemas, database tables)
- Strategy playbooks and frameworks
- Tool configuration guides
- Competitive analysis and market research

---

## How Agents Use Knowledge

1. **Referenced in SKILL.md** — A skill's instructions can reference knowledge files for the agent to load when activated
2. **Loaded on demand** — Agents read knowledge files when they need context for a specific task
3. **Cited in analysis** — Agents reference knowledge entries when making recommendations or decisions

### Example: Skill referencing knowledge

```markdown
## Knowledge Base
When analyzing campaign performance, load:
- `squads/media-buying/knowledge/data-sources.md` — Available data tables and query patterns
- `squads/media-buying/knowledge/bidcap-strategy-reference.md` — Bidding strategy guidelines
```

---

## Best Practices

### Content Structure
- Use clear headings and tables for scanability
- Include practical examples (queries, code snippets, configurations)
- Keep entries focused on one topic per file
- Use the `_template.md` as a starting point

### Sources and Accuracy
- Always cite sources (URLs, documents, dates)
- Include the date information was last verified
- Mark any data that may become stale with a review date
- Prefer primary sources over secondary

### Maintenance
- Review knowledge files periodically for accuracy
- Update benchmark data when new information is available
- Archive outdated entries rather than deleting them
- Track the `Last Updated` date in the frontmatter

### Naming Convention

```
{topic-slug}.md
```

**Examples:**
- `data-sources.md`
- `bidding-strategy-reference.md`
- `audience-targeting-playbook.md`
- `api-rate-limits.md`

Keep filenames lowercase, kebab-case, and descriptive.

---

## Knowledge vs Other Content

| Content Type | Where It Lives | Purpose |
|-------------|---------------|---------|
| **Knowledge** | `knowledge/` | Reference material agents consult |
| **Stories** | `docs/stories/` | Units of work to implement |
| **Tasks** | `squads/{squad}/tasks/` | Step-by-step agent instructions |
| **Templates** | `squads/{squad}/templates/` | Boilerplate for generating artifacts |
| **Memory** | `memory/` | Persistent learnings from past sessions |

Knowledge is **read-only reference material**. Unlike memory (which agents write to during sessions), knowledge files are authored deliberately and reviewed for accuracy.

---

*Knowledge base system — powered by Operabase*
