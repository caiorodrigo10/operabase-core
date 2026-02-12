import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { logger } from '../../utils/logger.js';

/**
 * Generate or append Operabase section to .claude/CLAUDE.md.
 * Never overwrites existing CLAUDE.md -- appends the Operabase section if not present.
 * @param {string} targetDir - Project root directory.
 * @param {object} config - Parsed operabase.yaml config.
 */
export function generateClaudeMd(targetDir, config = {}) {
  const claudeMdPath = resolve(targetDir, '.claude', 'CLAUDE.md');
  const templatePath = resolve(targetDir, 'src', 'templates', 'claude-md-section.md');

  // Read template
  let section;
  try {
    section = readFileSync(templatePath, 'utf-8');
  } catch {
    // Fallback: generate minimal section
    section = generateMinimalSection(config);
  }

  // Replace placeholders in template
  section = section
    .replace(/\{\{project_name\}\}/g, config.name || 'My Project')
    .replace(/\{\{language\}\}/g, config.language || 'en');

  const marker = '<!-- operabase-section-start -->';
  const endMarker = '<!-- operabase-section-end -->';

  if (existsSync(claudeMdPath)) {
    const existing = readFileSync(claudeMdPath, 'utf-8');

    if (existing.includes(marker)) {
      // Replace existing Operabase section
      const regex = new RegExp(`${marker}[\\s\\S]*?${endMarker}`, 'g');
      const updated = existing.replace(regex, `${marker}\n${section}\n${endMarker}`);
      writeFileSync(claudeMdPath, updated, 'utf-8');
      logger.success('  updated Operabase section in .claude/CLAUDE.md');
    } else {
      // Append Operabase section
      const appended = `${existing}\n\n${marker}\n${section}\n${endMarker}\n`;
      writeFileSync(claudeMdPath, appended, 'utf-8');
      logger.success('  appended Operabase section to .claude/CLAUDE.md');
    }
  } else {
    // Create new CLAUDE.md
    const content = `# CLAUDE.md\n\n${marker}\n${section}\n${endMarker}\n`;
    writeFileSync(claudeMdPath, content, 'utf-8');
    logger.success('  created .claude/CLAUDE.md with Operabase section');
  }
}

function generateMinimalSection(config) {
  return `## Operabase Framework

This project uses Operabase, a skills-first agent framework for Claude Code.

### Quick Reference

- \`npx operabase status\` -- Show project status
- \`npx operabase gates\` -- Run quality gates
- \`npx operabase doctor\` -- Diagnostic checks
- \`npx operabase validate\` -- Validate config

### Agent System

Agents are activated via skills in \`.claude/skills/\`. Each agent has a SKILL.md entry point.

### Constitution

See \`constitution.md\` for framework principles and rules.
`;
}
