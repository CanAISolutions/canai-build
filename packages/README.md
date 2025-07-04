# CanAI Packages - Shared Libraries & Configurations

<div align="center">

**📦 Monorepo Shared Packages**

![Monorepo](https://img.shields.io/badge/monorepo-lerna-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.5-blue.svg)
![Shared](https://img.shields.io/badge/shared-configs-green.svg)

</div>

## 🌟 Overview

This directory contains shared packages, configurations, and utilities used across the CanAI
Emotional Sovereignty Platform monorepo. These packages ensure consistency, reduce duplication, and
provide common functionality for both frontend and backend applications.

## 📁 Directory Structure

```
packages/
├── 📝 config/                    # Shared configuration packages
│   ├── eslint-config/           # ESLint configuration
│   ├── prettier-config/         # Prettier configuration
│   ├── tsconfig/               # TypeScript configurations
│   └── jest-config/            # Jest testing configuration
├── 🛠️ utils/                    # Shared utility packages
│   ├── common/                 # Common utilities
│   ├── validation/             # Input validation schemas
│   └── types/                  # Shared TypeScript types
├── 🎨 ui/                       # Shared UI components (future)
└── 📖 README.md                # This documentation file
```

## 📝 Configuration Packages

### ESLint Configuration (`config/eslint-config/`)

Shared ESLint configuration for consistent code quality across the monorepo.

### TypeScript Configuration (`config/tsconfig/`)

Base TypeScript configurations for different environments:

- `base.json` - Base configuration
- `react.json` - React-specific configuration
- `node.json` - Node.js-specific configuration

## 🛠️ Utility Packages

### Common Utilities (`utils/common/`)

Shared utility functions used across frontend and backend:

- Date/time utilities
- String manipulation
- Data transformation helpers

### Validation (`utils/validation/`)

Shared validation schemas and utilities:

- Zod schemas for form validation
- API request/response validation
- Data sanitization utilities

### Types (`utils/types/`)

Shared TypeScript type definitions:

- User journey types
- API response types
- Database schema types

## 🚀 Usage

### Installing Packages

```bash
# Install all packages
npm install

# Install specific package
npm install @canai/eslint-config
```

### Using Configurations

```typescript
// Using shared TypeScript config
// tsconfig.json
{
  "extends": "@canai/tsconfig/react.json",
  "compilerOptions": {
    "baseUrl": "src"
  }
}

// Using shared ESLint config
// .eslintrc.js
module.exports = {
  extends: ['@canai/eslint-config'],
  rules: {
    // Project-specific overrides
  }
};
```

## 🤝 Contributing

### Adding New Packages

1. Create new directory under appropriate category
2. Initialize with `package.json`
3. Add to workspace configuration
4. Update this README

### Package Guidelines

- Use consistent naming: `@canai/package-name`
- Include comprehensive documentation
- Follow semantic versioning
- Add appropriate tests

---

<div align="center">

**Built with ❤️ for the CanAI Emotional Sovereignty Platform**

[🏠 Back to Root](../README.md) | [🔧 Backend](../backend/README.md) |
[🎨 Frontend](../frontend/README.md)

</div>
