import { resolve } from 'node:path';
import { readdir, access } from 'node:fs/promises';
import { select } from '@inquirer/prompts';
import { parseYamlFile } from '../utils/yaml.js';
import { logger } from '../utils/logger.js';

/**
 * Check if a path exists.
 */
async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

/**
 * Tenant Gate — resolves tenant context before operations.
 *
 * @param {string} cwd - Current working directory
 * @param {object} [options]
 * @param {string} [options.tenantId] - Pre-selected tenant ID (skip prompt)
 * @returns {Promise<{ multiTenant: boolean, tenant: object|null, tenantId: string|null }>}
 */
export async function resolveTenant(cwd, options = {}) {
  // 1. Read operabase.yaml
  const configPath = resolve(cwd, 'operabase.yaml');
  let config;
  try {
    config = parseYamlFile(configPath);
  } catch {
    logger.error('operabase.yaml not found. Run "npx operabase init" first.');
    return { multiTenant: false, tenant: null, tenantId: null };
  }

  // 2. Check multi_tenant setting
  if (!config.multi_tenant) {
    // Single-tenant mode — skip tenant selection
    return { multiTenant: false, tenant: null, tenantId: null };
  }

  // 3. Multi-tenant: discover tenants
  const tenantsDir = resolve(cwd, 'tenants');
  if (!(await exists(tenantsDir))) {
    logger.warn('multi_tenant is true but tenants/ directory not found.');
    return { multiTenant: true, tenant: null, tenantId: null };
  }

  const entries = await readdir(tenantsDir, { withFileTypes: true });
  const tenantIds = entries
    .filter(e => e.isDirectory() && !e.name.startsWith('_'))
    .map(e => e.name);

  if (tenantIds.length === 0) {
    logger.warn('No tenants found in tenants/ directory.');
    logger.info('Create a tenant folder: tenants/{tenant-id}/');
    return { multiTenant: true, tenant: null, tenantId: null };
  }

  // 4. If tenantId provided, use it directly
  let selectedId = options.tenantId;

  if (!selectedId) {
    // If only one tenant, use it without asking
    if (tenantIds.length === 1) {
      selectedId = tenantIds[0];
      logger.info(`Tenant: ${selectedId} (only tenant available)`);
    } else {
      // Multiple tenants — ask user
      selectedId = await select({
        message: 'Qual projeto/tenant?',
        choices: tenantIds.map(id => ({ name: id, value: id })),
      });
    }
  }

  // 5. Load tenant data (all YAML files in tenant dir)
  const tenantDir = resolve(tenantsDir, selectedId);
  const tenantData = { id: selectedId };

  try {
    const files = await readdir(tenantDir);
    for (const file of files) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        const key = file.replace(/\.ya?ml$/, '');
        try {
          tenantData[key] = parseYamlFile(resolve(tenantDir, file));
        } catch {
          // Skip invalid YAML files
        }
      }
    }
  } catch {
    // Directory might be empty
  }

  logger.success(`Contexto carregado: ${selectedId}`);

  return { multiTenant: true, tenant: tenantData, tenantId: selectedId };
}

/**
 * List all available tenants.
 */
export async function listTenants(cwd) {
  const tenantsDir = resolve(cwd, 'tenants');

  if (!(await exists(tenantsDir))) {
    return [];
  }

  const entries = await readdir(tenantsDir, { withFileTypes: true });
  return entries
    .filter(e => e.isDirectory() && !e.name.startsWith('_'))
    .map(e => e.name);
}
