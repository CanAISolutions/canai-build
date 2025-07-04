#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RULES_DIR = path.join(__dirname, '../.cursor/rules');
const IGNORED_FILES = ['README.md', 'cortex.md', 'canai-cortex-rules.mdc'];

function getRuleFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.mdc') && !IGNORED_FILES.includes(f));
}

function validateRuleFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Check for YAML frontmatter
  const frontmatterMatch = content.match(/^---[\s\S]*?---/);
  if (!frontmatterMatch) return 'Missing YAML frontmatter';
  const frontmatter = frontmatterMatch[0];
  if (!/description:/i.test(frontmatter))
    return 'Missing description in frontmatter';
  if (!/globs:/i.test(frontmatter)) return 'Missing globs in frontmatter';
  if (!/alwaysApply:/i.test(frontmatter))
    return 'Missing alwaysApply in frontmatter';
  // Check for at least one bullet point after frontmatter
  const afterFrontmatter = content.slice(frontmatter.length);
  if (!/^\s*- /m.test(afterFrontmatter))
    return 'No bullet points found after frontmatter';
  return null;
}

function main() {
  const ruleFiles = getRuleFiles(RULES_DIR);
  let failed = false;
  for (const file of ruleFiles) {
    const filePath = path.join(RULES_DIR, file);
    const error = validateRuleFile(filePath);
    if (error) {
      console.error(`❌ ${file}: ${error}`);
      failed = true;
    } else {
      console.log(`✅ ${file}: valid`);
    }
  }
  if (failed) {
    process.exit(1);
  } else {
    console.log('All cursor rules are valid.');
    process.exit(0);
  }
}

main();
