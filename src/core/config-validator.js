import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import { parseYamlFile } from '../utils/yaml.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(__dirname, '../../schemas/operabase.schema.json');

/**
 * Validate an operabase.yaml file against the JSON Schema.
 * @param {string} configPath - Path to operabase.yaml
 * @returns {{ valid: boolean, errors: Array|null, config: object|null }}
 */
export function validateConfig(configPath) {
  if (!existsSync(configPath)) {
    return {
      valid: false,
      errors: [{ message: `Config file not found: ${configPath}` }],
      config: null,
    };
  }

  let config;
  try {
    config = parseYamlFile(configPath);
  } catch (err) {
    return {
      valid: false,
      errors: [{ message: `YAML parse error: ${err.message}` }],
      config: null,
    };
  }

  if (!config || typeof config !== 'object') {
    return {
      valid: false,
      errors: [{ message: 'Config file is empty or not a valid YAML object.' }],
      config: null,
    };
  }

  const schemaContent = readFileSync(SCHEMA_PATH, 'utf-8');
  const schema = JSON.parse(schemaContent);

  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  const valid = validate(config);

  return {
    valid,
    errors: valid ? null : validate.errors,
    config: valid ? config : null,
  };
}
