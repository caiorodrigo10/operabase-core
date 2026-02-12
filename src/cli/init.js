import { select, checkbox, confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../utils/logger.js';
import { generateFolders } from './generators/folder-generator.js';
import { generateConfig } from './generators/config-generator.js';
import { generateHooks } from './generators/hook-generator.js';
import { generateManifest } from './generators/manifest-generator.js';
import { generateSkills } from './generators/skill-generator.js';
import { generateCommands } from './generators/command-generator.js';
import { generateClaudeMd } from './generators/claude-md-generator.js';
import { copySquads } from './generators/squad-copier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = resolve(__dirname, '../templates');

// --- Agent name maps for uniqueness enforcement (T2.3) ---

const BASIC_DEV_AGENTS = ['dev', 'qa', 'devops'];

const COMPLETE_DEV_AGENTS = [
  'dev', 'qa', 'devops', 'architect', 'pm', 'po', 'sm', 'data-engineer', 'ux-designer',
];

const EXTRA_SQUAD_AGENTS = {
  finance: ['fin'],
  'media-buying': ['mb', 'strategist', 'analyst', 'executor', 'creative'],
  'business-architect': ['biz'],
  'life-journal': ['journal', 'sage'],
  copywriting: ['copy'],
  'landing-page': ['lp'],
};

/**
 * Validate that extra squad agent names do not conflict with dev squad agent names (T2.3.2).
 * @param {string} devSquadType - "basic" | "complete" | "none"
 * @param {string[]} extraSquads - Selected extra squad keys
 * @returns {{ valid: boolean, conflicts: string[] }}
 */
function validateAgentUniqueness(devSquadType, extraSquads) {
  if (devSquadType === 'none' || extraSquads.length === 0) {
    return { valid: true, conflicts: [] };
  }

  const devAgents = devSquadType === 'basic' ? BASIC_DEV_AGENTS : COMPLETE_DEV_AGENTS;

  const conflicts = [];
  for (const squad of extraSquads) {
    const squadAgents = EXTRA_SQUAD_AGENTS[squad] || [];
    for (const agent of squadAgents) {
      if (devAgents.includes(agent)) {
        conflicts.push(`"${agent}" (from ${squad} squad conflicts with dev squad)`);
      }
    }
  }

  return { valid: conflicts.length === 0, conflicts };
}

/**
 * Run the interactive init wizard.
 */
export async function runInit() {
  console.log();
  console.log(chalk.bold.cyan('  Operabase — Skills-first Agent Framework'));
  console.log(chalk.dim('  Interactive project setup wizard'));
  console.log();

  const answers = {};

  // Get current directory name as default project name
  const cwd = process.cwd();
  const defaultName = cwd.split('/').pop() || 'my-project';

  // Project name
  answers.projectName = await input({
    message: 'Project name:',
    default: defaultName,
  });

  // ── Step 1: Language (T2.1.2) ──
  answers.language = await select({
    message: 'Which language? / Qual idioma? / Que idioma?',
    choices: [
      { name: 'English', value: 'en' },
      { name: 'Portugues', value: 'pt' },
      { name: 'Espanol', value: 'es' },
    ],
    default: 'en',
  });

  // ── Step 2: Dev squad type (T2.1.3) ──
  // T2.3.1 — basic and complete are mutually exclusive (select enforces this)
  answers.dev_squad = await select({
    message: 'Development squad:',
    choices: [
      {
        name: 'Basic (dev + qa + devops)',
        value: 'basic',
        description: '3 agents — ideal for small projects or personal use',
      },
      {
        name: 'Complete (dev + qa + architect + pm + po + sm + data + ux + devops)',
        value: 'complete',
        description: '9 agents — ideal for teams and complex projects',
      },
      {
        name: 'None (extra squads only)',
        value: 'none',
        description: 'No dev agents, only domain squads (finance, ads, etc.)',
      },
    ],
    default: 'basic',
  });

  // ── Step 3: Extra squads (T2.1.4) ──
  let extraSquadsValid = false;
  while (!extraSquadsValid) {
    answers.extra_squads = await checkbox({
      message: 'Extra squads to install (select with space, enter to confirm):',
      choices: [
        {
          name: 'Finance Squad (@fin)',
          value: 'finance',
          description: 'Financial management, Profit First, TAPs, burn rate',
        },
        {
          name: 'Media Buying Squad (@mb)',
          value: 'media-buying',
          description: 'Meta Ads, Google Ads, campaigns, performance analysis',
        },
        {
          name: 'Business Architect (@biz)',
          value: 'business-architect',
          description: 'Business plan, Lean Canvas, First Principles',
        },
        {
          name: 'Life Journal (@journal)',
          value: 'life-journal',
          description: 'Personal diary, mood tracking, Obsidian vault',
        },
        {
          name: 'Copywriting (@copy)',
          value: 'copywriting',
          description: 'Copy for landing pages, headlines, CTAs',
        },
        {
          name: 'Landing Page Builder (@lp)',
          value: 'landing-page',
          description: 'Landing page creation with design tokens',
        },
      ],
    });

    // T2.3.2 / T2.3.3 — Validate agent uniqueness
    const validation = validateAgentUniqueness(answers.dev_squad, answers.extra_squads);
    if (validation.valid) {
      extraSquadsValid = true;
    } else {
      logger.error('Agent name conflict detected:');
      for (const conflict of validation.conflicts) {
        logger.error(`  - ${conflict}`);
      }
      logger.info('Please re-select extra squads to avoid conflicts.');
      console.log();
    }
  }

  // ── Step 4: Composio (T2.1.5) ──
  answers.composio = await confirm({
    message: 'Use Composio for external integrations (Notion, Meta Ads, Drive)?',
    default: false,
  });

  // ── Step 5: Obsidian (T2.1.6) ──
  answers.obsidian = await confirm({
    message: 'Use Obsidian as a knowledge base (local Markdown vault)?',
    default: false,
  });

  if (answers.obsidian) {
    answers.obsidian_vault_path = await input({
      message: 'Vault path (relative to project root):',
      default: './vault',
    });

    // ── Step 5b: Vault in Git (T2.1.7) ──
    answers.obsidian_vault_git = await select({
      message: 'Include the vault in Git?',
      choices: [
        { name: 'Yes — version the entire vault', value: true },
        { name: 'No — keep vault out of Git (.gitignore)', value: false },
        {
          name: 'Partial — version knowledge/templates, ignore daily/journal',
          value: 'partial',
        },
      ],
      default: false,
    });
  }

  // ── Step 6: Multi-tenant (T2.1.8) ──
  answers.multi_tenant = await confirm({
    message: 'Does this project manage multiple businesses/clients (multi-tenant)?',
    default: false,
  });

  // ── Step 7: Summary (T2.1.10) ──
  console.log();
  logger.heading('Installation Summary');
  console.log();
  logger.label('Project', answers.projectName);
  logger.label('Language', answers.language);
  logger.label('Dev Squad', answers.dev_squad === 'none' ? 'None' : answers.dev_squad === 'basic' ? 'Basic (3 agents)' : 'Complete (9 agents)');
  logger.label('Extra Squads', answers.extra_squads.length > 0 ? answers.extra_squads.join(', ') : 'None');
  logger.label('Composio', answers.composio ? 'Yes' : 'No');
  logger.label('Obsidian', answers.obsidian ? `Yes (${answers.obsidian_vault_path})` : 'No');
  if (answers.obsidian) {
    const gitLabel = answers.obsidian_vault_git === 'partial' ? 'Partial' : answers.obsidian_vault_git ? 'Yes' : 'No';
    logger.label('Vault in Git', gitLabel);
  }
  logger.label('Multi-Tenant', answers.multi_tenant ? 'Yes' : 'No');
  console.log();

  // Confirm before proceeding
  const proceed = await confirm({
    message: 'Proceed with installation?',
    default: true,
  });

  if (!proceed) {
    logger.info('Installation cancelled.');
    return;
  }

  // ── Generate everything (T2.1.9, T2.1.11) ──
  const targetDir = process.cwd();
  const allCreatedPaths = [];

  // 1. Generate folder structure (dirs, constitution.md, MEMORY.md)
  const folderPaths = await generateFolders(targetDir, answers);
  allCreatedPaths.push(...folderPaths);

  // 2. Generate operabase.yaml
  const configPath = await generateConfig(targetDir, answers);
  if (configPath) allCreatedPaths.push(configPath);

  // 3. Generate hooks (from templates with exit code handling)
  const hookPaths = await generateHooks(targetDir);
  allCreatedPaths.push(...hookPaths);

  // 4. Copy squad content (agents, tasks, workflows, templates, config)
  if (answers.dev_squad !== 'none') {
    const squadPaths = copySquads(targetDir, { dev_squad: answers.dev_squad });
    allCreatedPaths.push(...squadPaths);
  }

  // 5. Generate SKILL.md files for all agents in the selected squad
  if (answers.dev_squad !== 'none') {
    const agents = getAgentsForSquad(answers.dev_squad);
    const squadName = answers.dev_squad === 'basic' ? 'dev-squad' : 'full-dev-squad';
    generateSkills(targetDir, { squad: squadName, agents });
  }

  // 6. Generate namespace command files
  if (answers.dev_squad !== 'none') {
    const namespaces = getNamespacesForSquad(answers.dev_squad);
    generateCommands(targetDir, { namespaces });
  }

  // 7. Generate .claude/CLAUDE.md with populated squads/agents tables
  generateClaudeMd(targetDir, {
    name: answers.projectName,
    projectName: answers.projectName,
    language: answers.language,
    dev_squad: answers.dev_squad,
    extra_squads: answers.extra_squads,
  });

  // 8. Copy story and knowledge templates
  copyTemplateDir('stories', targetDir);
  copyTemplateDir('knowledge', targetDir);

  // 9. Generate Obsidian vault structure if configured
  if (answers.obsidian && answers.obsidian_vault_path) {
    const vaultDir = resolve(targetDir, answers.obsidian_vault_path);
    try {
      const vaultStructure = JSON.parse(readFileSync(resolve(TEMPLATES_DIR, 'obsidian/vault-structure.json'), 'utf-8'));

      // Create directories
      for (const dir of vaultStructure.directories || []) {
        const dirPath = resolve(vaultDir, dir);
        if (!existsSync(dirPath)) {
          mkdirSync(dirPath, { recursive: true });
        }
      }

      // Create .gitkeep files in empty directories
      for (const dir of vaultStructure.gitkeep || []) {
        const gitkeepPath = resolve(vaultDir, dir, '.gitkeep');
        if (!existsSync(gitkeepPath)) {
          mkdirSync(resolve(vaultDir, dir), { recursive: true });
          writeFileSync(gitkeepPath, '');
        }
      }

      // Copy Home.md
      const homeSrc = resolve(TEMPLATES_DIR, 'obsidian/Home.md');
      const homeDest = resolve(vaultDir, 'Home.md');
      if (!existsSync(homeDest) && existsSync(homeSrc)) {
        writeFileSync(homeDest, readFileSync(homeSrc, 'utf-8'));
      }
      logger.success('  Created Obsidian vault structure');
    } catch (e) {
      logger.warn(`  Could not create vault structure: ${e.message}`);
    }
  }

  // 10. Generate .mcp.json if Composio enabled
  if (answers.composio) {
    const mcpPath = resolve(targetDir, '.mcp.json');
    if (!existsSync(mcpPath)) {
      try {
        const mcpTemplate = readFileSync(resolve(TEMPLATES_DIR, 'mcp-json.json'), 'utf-8');
        writeFileSync(mcpPath, mcpTemplate);
        logger.success('  Created .mcp.json for Composio');
      } catch (e) {
        logger.warn(`  Could not create .mcp.json: ${e.message}`);
      }
    }
  }

  // 11. Copy tenant templates if multi-tenant enabled
  if (answers.multi_tenant) {
    const tenantTemplatesDir = resolve(TEMPLATES_DIR, 'tenants');
    const targetTemplatesDir = resolve(targetDir, 'tenants/_templates');
    if (existsSync(tenantTemplatesDir)) {
      mkdirSync(targetTemplatesDir, { recursive: true });
      const files = readdirSync(tenantTemplatesDir);
      for (const file of files) {
        const dest = resolve(targetTemplatesDir, file);
        if (!existsSync(dest)) {
          writeFileSync(dest, readFileSync(resolve(tenantTemplatesDir, file), 'utf-8'));
          allCreatedPaths.push(`tenants/_templates/${file}`);
        }
      }
      logger.success(`  Copied ${files.length} tenant templates`);
    }
  }

  // 12. Generate manifest (must be LAST — hashes all created files)
  await generateManifest(targetDir, allCreatedPaths);

  // Final message
  console.log();
  logger.heading('Operabase initialized successfully!');
  logger.blank();
  logger.info(`${allCreatedPaths.length} files/directories created.`);
  logger.info('Next steps:');
  logger.dim('  1. Review operabase.yaml');
  logger.dim('  2. Run: npx operabase doctor');
  logger.dim('  3. Run: npx operabase status');
  logger.dim('  4. Activate an agent: /dev *help');
  logger.blank();
}

// ── Helper: agent definitions per squad type ──

function getAgentsForSquad(squadType) {
  const base = [
    { id: 'dev', name: 'Dex', description: 'Code implementation, debugging, refactoring', commands: ['*help', '*task'] },
    { id: 'qa', name: 'Quinn', description: 'Testing, code review, quality gates', commands: ['*help', '*task'] },
    { id: 'devops', name: 'Gage', description: 'Git push, CI/CD, releases. ONLY agent authorized to push.', commands: ['*help', '*task'] },
    { id: 'orchestrator', name: 'Orchestrator', description: 'Pipeline coordination and workflow execution', commands: ['*help', '*run'] },
    { id: 'kairos', name: 'Kairos', description: 'Agent Teams orchestration for parallel execution', commands: ['*help', '*assemble'] },
    { id: 'squad-creator', name: 'Craft', description: 'Create new Operabase squads from scratch', commands: ['*help', '*create'] },
  ];

  if (squadType === 'complete') {
    return [
      ...base,
      { id: 'architect', name: 'Aria', description: 'System architecture, API design, tech decisions', commands: ['*help', '*task'] },
      { id: 'pm', name: 'Morgan', description: 'Product management, roadmap, stakeholders', commands: ['*help', '*task'] },
      { id: 'po', name: 'Pax', description: 'Backlog management, stories, acceptance criteria', commands: ['*help', '*create-story'] },
      { id: 'sm', name: 'River', description: 'Sprint planning, ceremonies, process', commands: ['*help', '*task'] },
      { id: 'data-engineer', name: 'Dara', description: 'Database design, migrations, queries', commands: ['*help', '*task'] },
      { id: 'ux-design-expert', name: 'Uma', description: 'UX/UI design, design tokens, accessibility', commands: ['*help', '*task'] },
      { id: 'scheduler', name: 'Scheduler', description: 'Schedule tasks, cron jobs, recurring automation', commands: ['*help', '*schedule'] },
    ];
  }

  // Basic squad also gets scheduler
  return [
    ...base,
    { id: 'scheduler', name: 'Scheduler', description: 'Schedule tasks, cron jobs, recurring automation', commands: ['*help', '*schedule'] },
  ];
}

function getNamespacesForSquad(squadType) {
  const namespaces = [
    {
      ns: 'dev',
      commands: [
        { name: 'help', agent: 'dev', description: 'Show dev agent commands and capabilities' },
        { name: 'commit', agent: 'devops', description: 'Create a well-formatted commit with quality gates' },
        { name: 'lint', agent: 'qa', description: 'Run linting via quality gates' },
        { name: 'test', agent: 'qa', description: 'Run tests via quality gates' },
      ],
    },
    {
      ns: 'ops',
      commands: [
        { name: 'push', agent: 'devops', description: 'Push to remote (devops authority required)' },
        { name: 'pr', agent: 'devops', description: 'Create a pull request' },
      ],
    },
  ];

  if (squadType === 'complete') {
    namespaces.push({
      ns: 'product',
      commands: [
        { name: 'story', agent: 'po', description: 'Create a new development story' },
        { name: 'backlog', agent: 'po', description: 'View and manage the product backlog' },
        { name: 'sprint', agent: 'sm', description: 'Plan or review a sprint' },
      ],
    });
  }

  return namespaces;
}

/**
 * Copy template README and _template.md into target directory.
 */
function copyTemplateDir(dirName, targetDir) {
  const srcDir = resolve(TEMPLATES_DIR, dirName);
  if (!existsSync(srcDir)) return;

  const targetPath = dirName === 'stories' ? resolve(targetDir, 'docs/stories') : resolve(targetDir, `docs/${dirName}`);

  // Copy README.md
  const readmeSrc = resolve(srcDir, 'README.md');
  const readmeDest = resolve(targetPath, 'README.md');
  if (existsSync(readmeSrc) && !existsSync(readmeDest)) {
    mkdirSync(targetPath, { recursive: true });
    writeFileSync(readmeDest, readFileSync(readmeSrc, 'utf-8'));
  }

  // Copy _template.md
  const tmplSrc = resolve(srcDir, '_template.md');
  const tmplDest = resolve(targetPath, '_template.md');
  if (existsSync(tmplSrc) && !existsSync(tmplDest)) {
    mkdirSync(targetPath, { recursive: true });
    writeFileSync(tmplDest, readFileSync(tmplSrc, 'utf-8'));
  }
}
