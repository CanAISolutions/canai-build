module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/strict',
    '@typescript-eslint/stylistic',
    'plugin:@typescript-eslint/recommended',
    'plugin:security/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  plugins: ['@typescript-eslint', 'prettier', 'security', 'import'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    // CanAI TypeScript Development Rules Enforcement
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],

    // CanAI Performance Rules
    '@typescript-eslint/prefer-readonly': 'warn',
    '@typescript-eslint/prefer-readonly-parameter-types': 'off', // Too strict for CanAI

    // CanAI Naming Conventions
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'function',
        format: ['camelCase'],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      {
        selector: 'enumMember',
        format: ['UPPER_CASE'],
      },
    ],

    // CanAI Import Rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-default-export': 'error',
    'import/prefer-default-export': 'off',

    // CanAI Function Complexity
    'max-params': ['error', 4],
    'max-lines-per-function': ['warn', 20],
    complexity: ['warn', 5],

    // CanAI Security Rules
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',

    // General Code Quality
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    eqeqeq: 'error',
    curly: 'error',
  },
  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx'],
      rules: {
        'max-lines-per-function': ['warn', 40],
        'max-params': ['error', 5],
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['*.config.ts', '*.config.js', 'vite.config.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
};
