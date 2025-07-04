// IMPORTANT: This file must use CommonJS syntax for compatibility with commitlint and Node.js hooks.
if (typeof require !== 'undefined' && typeof module !== 'undefined') {
  // OK: running in CommonJS mode
} else {
  throw new Error('commitlint.config.js must be loaded as CommonJS. If you see this error, rename to commitlint.config.cjs or check your Node.js setup.');
}

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // CanAI Platform Specific Rules
    'type-enum': [
      2,
      'always',
      [
        'feat', // New features
        'fix', // Bug fixes
        'docs', // Documentation changes
        'style', // Code style changes (formatting, etc.)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'chore', // Maintenance tasks
        'ci', // CI/CD changes
        'build', // Build system changes
        'revert', // Reverting changes
        'security', // Security fixes
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
    'subject-max-length': [2, 'always', 72],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
  },
};
