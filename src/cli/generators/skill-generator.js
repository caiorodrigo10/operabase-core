import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { logger } from '../../utils/logger.js';

/**
 * Generate SKILL.md files for a squad's agents into .claude/skills/.
 * @param {string} targetDir - Project root directory.
 * @param {object} options - { squad: string, agents: Array<{id, name, commands}> }
 */
export function generateSkills(targetDir, options = {}) {
  const { squad, agents = [] } = options;
  if (!squad || agents.length === 0) return;

  const skillsDir = resolve(targetDir, '.claude', 'skills');

  for (const agent of agents) {
    const skillDir = resolve(skillsDir, agent.id);
    const skillPath = resolve(skillDir, 'SKILL.md');

    if (existsSync(skillPath)) {
      logger.dim(`  skip ${agent.id}/SKILL.md (exists)`);
      continue;
    }

    if (!existsSync(skillDir)) {
      mkdirSync(skillDir, { recursive: true });
    }

    const commands = agent.commands || ['*help'];
    const content = `---
name: ${agent.id}
description: "${agent.description || `Use for ${agent.id} tasks`}"
---

# @${agent.id} -- ${agent.name}

Load and follow the agent definition at:
\`squads/${squad}/agents/${agent.id}.md\`

Quick commands: ${commands.join(', ')}
`;

    writeFileSync(skillPath, content, 'utf-8');
    logger.success(`  created .claude/skills/${agent.id}/SKILL.md`);
  }
}
