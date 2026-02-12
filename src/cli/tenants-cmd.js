import { resolve } from 'node:path';
import { readdir, access } from 'node:fs/promises';
import { parseYamlFile } from '../utils/yaml.js';
import { listTenants } from '../core/tenant-gate.js';
import { logger } from '../utils/logger.js';

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

export async function runTenants() {
  const cwd = process.cwd();

  // Check config
  let config;
  try {
    config = parseYamlFile(resolve(cwd, 'operabase.yaml'));
  } catch {
    logger.error('operabase.yaml not found. Run "npx operabase init" first.');
    return;
  }

  logger.heading('Tenants');

  if (!config.multi_tenant) {
    logger.info('Multi-tenant is disabled (multi_tenant: false in operabase.yaml).');
    logger.info('Enable it by setting multi_tenant: true and creating tenants/ directory.');
    return;
  }

  const tenants = await listTenants(cwd);

  if (tenants.length === 0) {
    logger.warn('No tenants found.');
    logger.info('Create a tenant: mkdir tenants/{tenant-id}');
    logger.info('Copy templates: cp tenants/_templates/*.yaml tenants/{tenant-id}/');
    return;
  }

  logger.info(`Found ${tenants.length} tenant(s):`);
  console.log('');

  for (const id of tenants) {
    const tenantDir = resolve(cwd, 'tenants', id);
    const files = await readdir(tenantDir);
    const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

    logger.success(`  ${id}  (${yamlFiles.length} config files)`);
    for (const f of yamlFiles) {
      logger.info(`    - ${f}`);
    }
  }

  // Check templates
  const templatesDir = resolve(cwd, 'tenants/_templates');
  if (await fileExists(templatesDir)) {
    console.log('');
    const templates = await readdir(templatesDir);
    const yamlTemplates = templates.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    logger.info(`Templates available: ${yamlTemplates.length}`);
    for (const t of yamlTemplates) {
      logger.info(`  - _templates/${t}`);
    }
  }
}
