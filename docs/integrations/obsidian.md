# Obsidian Integration

> Use Obsidian as your "segundo cerebro" with Operabase.

## Setup

### During installation

```bash
npx operabase init
# Select "Yes" when asked about Obsidian
# Provide vault path (or let Operabase create one)
```

### Configuration in operabase.yaml

```yaml
obsidian:
  enabled: true
  vault_path: "./segundocerebro"  # Relative to project root
  vault_git: false                # Track vault in git?
```

## Vault Structure

```
{vault_path}/
├── 00-Inbox/           # Quick capture
├── 01-Projects/        # Active projects
├── 03-Resources/       # References and resources
│   ├── til/            # Today I Learned
│   └── links/          # Saved links
├── 04-Archive/         # Archived notes
├── 05-Daily/           # Daily notes (DD-MM-YYYY.md)
├── 08-Journal/         # Mood tracking, weekly reviews
└── Home.md             # Main index
```

## Date Format

**ALWAYS use DD-MM-YYYY** for all dates:
- File names: `05-Daily/12-02-2026.md`
- Headers: `# Wednesday, 12 February 2026`
- Frontmatter: `date: "12-02-2026"`

**NEVER use ISO format (YYYY-MM-DD).**

## Agent → Vault Mapping

| Agent | What they write | Where in vault |
|-------|----------------|----------------|
| @journal | Diary, mood, brain dump | 05-Daily/, 08-Journal/ |
| @dev | TILs, debugging solutions | 03-Resources/til/ |
| @architect | Architecture decisions | 01-Projects/{project}/ |
| @analyst | Research summaries | 03-Resources/ |
| @pm | Meeting notes, decisions | 01-Projects/{project}/ |

## Rules for Writing to Vault

1. **ALWAYS check if daily note exists** before writing (append, never overwrite)
2. Daily notes may be created by Obsidian Daily Notes plugin — respect existing content
3. Knowledge entries: add `## Conexoes` section with `[[Home]]` + relevant `[[links]]`
4. Diary/personal entries: preserve EXACT user words, never inject links
5. Use wikilink syntax: `[[Page Name]]` for internal links

## Multi-Tenant + Obsidian

In multi-tenant mode, each tenant has its area in the vault:

```
{vault_path}/
├── 01-Projects/
│   ├── {tenant-1}/
│   └── {tenant-2}/
```
