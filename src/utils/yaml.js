import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

/**
 * Parse a YAML file and return its contents as a JS object.
 * @param {string} filePath - Absolute or relative path to the YAML file.
 * @returns {object} Parsed YAML content.
 */
export function parseYamlFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  return yaml.load(content);
}

/**
 * Parse a YAML string and return its contents as a JS object.
 * @param {string} content - YAML string.
 * @returns {object} Parsed YAML content.
 */
export function parseYaml(content) {
  return yaml.load(content);
}
