import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = resolve(__dirname, '../../templates');

// Agent registry for CLAUDE.md population
const DEV_SQUAD_AGENTS = [
  { id: 'dev', persona: 'Dex', scope: 'Code implementation, debugging, refactoring' },
  { id: 'qa', persona: 'Quinn', scope: 'Testing, code review, quality gates' },
  { id: 'devops', persona: 'Gage', scope: 'Git push, CI/CD, releases (exclusive push authority)' },
  { id: 'orchestrator', persona: 'Orchestrator', scope: 'Pipeline coordination, workflow execution' },
  { id: 'kairos', persona: 'Kairos', scope: 'Agent Teams orchestration (parallel execution)' },
  { id: 'squad-creator', persona: 'Craft', scope: 'Create new squads from scratch' },
];

const FULL_DEV_SQUAD_AGENTS = [
  { id: 'dev', persona: 'Dex', scope: 'Code implementation, debugging, refactoring' },
  { id: 'qa', persona: 'Quinn', scope: 'Testing, code review, quality gates' },
  { id: 'devops', persona: 'Gage', scope: 'Git push, CI/CD, releases (exclusive push authority)' },
  { id: 'architect', persona: 'Aria', scope: 'System architecture, API design, tech decisions' },
  { id: 'pm', persona: 'Morgan', scope: 'Product management, roadmap, stakeholders' },
  { id: 'po', persona: 'Pax', scope: 'Backlog management, stories, acceptance criteria' },
  { id: 'sm', persona: 'River', scope: 'Sprint planning, ceremonies, process' },
  { id: 'data-engineer', persona: 'Dara', scope: 'Database design, migrations, queries' },
  { id: 'ux-design-expert', persona: 'Uma', scope: 'UX/UI design, design tokens, accessibility' },
  { id: 'orchestrator', persona: 'Orchestrator', scope: 'Pipeline coordination, workflow execution' },
  { id: 'kairos', persona: 'Kairos', scope: 'Agent Teams orchestration (parallel execution)' },
  { id: 'squad-creator', persona: 'Craft', scope: 'Create new squads from scratch' },
];

/**
 * Generate or append Operabase section to .claude/CLAUDE.md.
 * Never overwrites existing CLAUDE.md — appends the Operabase section if not present.
 * @param {string} targetDir - Project root directory.
 * @param {object} config - { name, projectName, language, dev_squad, extra_squads }
 */
export function generateClaudeMd(targetDir, config = {}) {
  const claudeDir = resolve(targetDir, '.claude');
  const claudeMdPath = resolve(claudeDir, 'CLAUDE.md');
  const templatePath = resolve(TEMPLATES_DIR, 'claude-md-section.md');

  if (!existsSync(claudeDir)) {
    mkdirSync(claudeDir, { recursive: true });
  }

  // Read template from operabase source (not target project)
  let section;
  try {
    section = readFileSync(templatePath, 'utf-8');
  } catch {
    section = generateMinimalSection(config);
  }

  // Replace basic placeholders
  section = section
    .replace(/\{\{project_name\}\}/g, config.name || config.projectName || 'My Project')
    .replace(/\{\{language\}\}/g, config.language || 'en');

  // Populate squads table
  const squadName = config.dev_squad === 'basic' ? 'dev-squad' : config.dev_squad === 'complete' ? 'full-dev-squad' : null;
  if (squadName) {
    const agents = config.dev_squad === 'basic' ? DEV_SQUAD_AGENTS : FULL_DEV_SQUAD_AGENTS;
    const agentCount = agents.length;
    const squadsTable = `| ${squadName} | ${agentCount} agents | Core development squad |`;
    section = section.replace(
      /<!-- OPERABASE:SQUADS:START[\s\S]*?<!-- OPERABASE:SQUADS:END -->/,
      `<!-- OPERABASE:SQUADS:START -->\n| Squad | Agents | Description |\n|-------|--------|-------------|\n${squadsTable}\n<!-- OPERABASE:SQUADS:END -->`
    );

    // Populate agents table
    const agentRows = agents.map(a => `| \`@${a.id}\` | ${a.persona} | ${a.scope} |`).join('\n');
    section = section.replace(
      /<!-- OPERABASE:AGENTS:START[\s\S]*?<!-- OPERABASE:AGENTS:END -->/,
      `<!-- OPERABASE:AGENTS:START -->\n| Agent | Persona | Scope |\n|-------|---------|-------|\n${agentRows}\n<!-- OPERABASE:AGENTS:END -->`
    );
  }

  const marker = '<!-- operabase-section-start -->';
  const endMarker = '<!-- operabase-section-end -->';

  if (existsSync(claudeMdPath)) {
    const existing = readFileSync(claudeMdPath, 'utf-8');

    if (existing.includes(marker)) {
      const regex = new RegExp(`${marker}[\\s\\S]*?${endMarker}`, 'g');
      const updated = existing.replace(regex, `${marker}\n${section}\n${endMarker}`);
      writeFileSync(claudeMdPath, updated, 'utf-8');
      logger.success('  updated Operabase section in .claude/CLAUDE.md');
    } else {
      const appended = `${existing}\n\n${marker}\n${section}\n${endMarker}\n`;
      writeFileSync(claudeMdPath, appended, 'utf-8');
      logger.success('  appended Operabase section to .claude/CLAUDE.md');
    }
  } else {
    const content = `# CLAUDE.md\n\n${marker}\n${section}\n${endMarker}\n`;
    writeFileSync(claudeMdPath, content, 'utf-8');
    logger.success('  created .claude/CLAUDE.md with Operabase section');
  }
}

function generateMinimalSection(config) {
  return `## Operabase Framework

This project uses Operabase, a skills-first agent framework for Claude Code.

### Quick Reference

- \`npx operabase status\` — Show project status
- \`npx operabase gates\` — Run quality gates
- \`npx operabase doctor\` — Diagnostic checks
- \`npx operabase validate\` — Validate config

### Agent System

Agents are activated via skills in \`.claude/skills/\`. Each agent has a SKILL.md entry point.

### Constitution

See \`constitution.md\` for framework principles and rules.
`;
}
