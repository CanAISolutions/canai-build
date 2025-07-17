#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';

const TYPES = [
  'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build', 'revert', 'security', 'canai'
] as const;
type Type = typeof TYPES[number];

const SCOPES = [
  'frontend', 'backend', 'api', 'auth', 'ui', 'db', 'config', 'deps', 'ci', 'docs', 'tests', 'security', 'performance',
  'llm', 'analytics', 'cortex', 'journey', 'supabase', 'memberstack', 'make', 'posthog', 'cursor', 'taskmaster'
] as const;
type Scope = typeof SCOPES[number];

const SUBJECT_MAX_LENGTH = 72;

function getCommitMessage(): string {
  if (process.argv[2]) return process.argv[2];
  const gitMsgPath = path.resolve('.git/COMMIT_EDITMSG');
  if (fs.existsSync(gitMsgPath)) {
    return fs.readFileSync(gitMsgPath, 'utf8').trim();
  }
  return '';
}

interface ValidationResult {
  valid: boolean;
  reason?: string;
}

function validate(msg: string): ValidationResult {
  // Format: type(scope): subject
  const regex = /^([a-z]+)\(([a-z]+)\): ([a-z0-9 ,\-_'"()\[\]/]+)$/;
  const match = msg.match(regex);
  if (!match) {
    return {
      valid: false,
      reason: 'Format must be: type(scope): subject (all lowercase, no trailing period)'
    };
  }
  const [, type, scope, subject] = match;
  if (!TYPES.includes(type as Type)) {
    return {
      valid: false,
      reason: `Type '${type}' is not allowed. Allowed: ${TYPES.join(', ')}`
    };
  }
  if (!SCOPES.includes(scope as Scope)) {
    return {
      valid: false,
      reason: `Scope '${scope}' is not allowed. Allowed: ${SCOPES.join(', ')}`
    };
  }
  if (!subject || subject.length > SUBJECT_MAX_LENGTH) {
    return {
      valid: false,
      reason: `Subject must be non-empty and <= ${SUBJECT_MAX_LENGTH} characters.`
    };
  }
  if (subject !== subject.toLowerCase()) {
    return {
      valid: false,
      reason: 'Subject must be all lowercase.'
    };
  }
  return { valid: true };
}

function main() {
  const msg = getCommitMessage();
  const result = validate(msg);
  if (!result.valid) {
    console.error(`\n❌ Invalid commit message!\nReason: ${result.reason}\n`);
    console.error('Correct format:');
    console.error('  <type>(<scope>): <subject>');
    console.error('Example:');
    console.error('  fix(auth): resolve login token expiration issue');
    process.exit(1);
  } else {
    console.log('✅ Commit message valid.');
    process.exit(0);
  }
}

main();