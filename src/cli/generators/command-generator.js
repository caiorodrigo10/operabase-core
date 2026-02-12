import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { logger } from '../../utils/logger.js';

/**
 * Generate namespace command files into .claude/commands/.
 * @param {string} targetDir - Project root directory.
 * @param {object} options - { namespaces: Array<{ns, commands: Array<{name, agent, description}>}> }
 */
export function generateCommands(targetDir, options = {}) {
  const { namespaces = [] } = options;
  if (namespaces.length === 0) return;

  const commandsDir = resolve(targetDir, '.claude', 'commands');

  for (const namespace of namespaces) {
    const nsDir = resolve(commandsDir, namespace.ns);

    for (const cmd of namespace.commands) {
      const cmdPath = resolve(nsDir, `${cmd.name}.md`);

      if (existsSync(cmdPath)) {
        logger.dim(`  skip ${namespace.ns}/${cmd.name}.md (exists)`);
        continue;
      }

      if (!existsSync(nsDir)) {
        mkdirSync(nsDir, { recursive: true });
      }

      const content = `# /${namespace.ns}:${cmd.name}

${cmd.description || `Execute ${cmd.name} via @${cmd.agent}`}

Use the Skill tool to invoke skill '${cmd.agent}', then execute the *${cmd.name} command.
`;

      writeFileSync(cmdPath, content, 'utf-8');
      logger.success(`  created .claude/commands/${namespace.ns}/${cmd.name}.md`);
    }
  }
}
