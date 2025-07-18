#!/usr/bin/env ts-node
'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
var fs_1 = __importDefault(require('fs'));
var path_1 = __importDefault(require('path'));
var TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'chore',
  'ci',
  'build',
  'revert',
  'security',
  'canai',
];
var SCOPES = [
  'frontend',
  'backend',
  'api',
  'auth',
  'ui',
  'db',
  'config',
  'deps',
  'ci',
  'docs',
  'tests',
  'security',
  'performance',
  'llm',
  'analytics',
  'cortex',
  'journey',
  'supabase',
  'memberstack',
  'make',
  'posthog',
  'cursor',
  'taskmaster',
];
var SUBJECT_MAX_LENGTH = 72;
function getCommitMessage() {
  if (process.argv[2]) return process.argv[2];
  var gitMsgPath = path_1.default.resolve('.git/COMMIT_EDITMSG');
  if (fs_1.default.existsSync(gitMsgPath)) {
    return fs_1.default.readFileSync(gitMsgPath, 'utf8').trim();
  }
  return '';
}
function validate(msg) {
  // Format: type(scope): subject
  var regex = /^([a-z]+)\(([a-z]+)\): ([a-z0-9 ,\-_'"()\[\]/]+)$/;
  var match = msg.match(regex);
  if (!match) {
    return {
      valid: false,
      reason:
        'Format must be: type(scope): subject (all lowercase, no trailing period)',
    };
  }
  var type = match[1],
    scope = match[2],
    subject = match[3];
  if (!TYPES.includes(type)) {
    return {
      valid: false,
      reason: "Type '"
        .concat(type, "' is not allowed. Allowed: ")
        .concat(TYPES.join(', ')),
    };
  }
  if (!SCOPES.includes(scope)) {
    return {
      valid: false,
      reason: "Scope '"
        .concat(scope, "' is not allowed. Allowed: ")
        .concat(SCOPES.join(', ')),
    };
  }
  if (!subject || subject.length > SUBJECT_MAX_LENGTH) {
    return {
      valid: false,
      reason: 'Subject must be non-empty and <= '.concat(
        SUBJECT_MAX_LENGTH,
        ' characters.'
      ),
    };
  }
  if (subject !== subject.toLowerCase()) {
    return {
      valid: false,
      reason: 'Subject must be all lowercase.',
    };
  }
  return { valid: true };
}
function main() {
  var msg = getCommitMessage();
  var result = validate(msg);
  if (!result.valid) {
    console.error(
      '\n\u274C Invalid commit message!\nReason: '.concat(result.reason, '\n')
    );
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
