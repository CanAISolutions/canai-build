// IMPORTANT: This file must use ES module syntax for compatibility with commitlint and Node.js hooks.

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce a consistent commit message format
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation change
        'style', // Code style change (formatting, missing semi-colons, etc.)
        'refactor', // A code change that neither fixes a bug nor adds a feature
        'perf', // A code change that improves performance
        'test', // Adding missing tests or correcting existing tests
        'chore', // Changes to the build process or auxiliary tools
        'ci', // Changes to our CI configuration files and scripts
        'build', // Changes that affect the build system or external dependencies
        'revert', // Reverts a previous commit
        'security', // A code change that improves security
        'canai', // CanAI platform specific changes
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
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
      ],
    ],
    'subject-max-length': [2, 'always', 72], // Max 72 characters
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'header-max-length': [2, 'always', 100], // Enforce a maximum header length
  },
};
