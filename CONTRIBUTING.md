# Contributing to CanAI Platform

## Purpose

This guide ensures consistent, high-quality contributions to the CanAI Emotional Sovereignty
Platform, leveraging Cursor AI assistance and strict TypeScript development standards.

## Setup

### Prerequisites

- **Node.js**: Version 20+ (use `nvm install 20 && nvm use 20`)
- **Cursor**: Latest version with recommended extensions
- **Git**: Configured with your GitHub account

### Quick Setup

```bash
# Clone and setup
git clone <repository-url>
cd canai-build
npm run canai:setup
```

### Manual Setup

```bash
# Install dependencies
npm ci

# Setup git hooks
npm run prepare

# Validate setup
npm run validate:all
```

### Cursor Configuration

Install these Cursor extensions:

- ESLint (`cursor.extensions.eslint`)
- Prettier (`cursor.extensions.prettier`)
- markdownlint (`cursor.extensions.markdownlint`)

Enable in Cursor settings:

- Format on Save
- ESLint: Auto Fix On Save
- TypeScript: Strict Mode

## Standards

### Code Quality

- **TypeScript**: Strict mode with no `any` types
- **ESLint**: Zero warnings policy
- **Prettier**: Consistent formatting
- **Testing**: Minimum 80% coverage

### Commit Standards

Follow [Conventional Commits](https://conventionalcommits.org/):

```bash
# Format: type(scope): description
feat(auth): add OAuth integration
fix(api): resolve user validation error
docs(readme): update setup instructions
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`,
`revert`, `security`, `canai`

**Scopes**: `frontend`, `backend`, `api`, `auth`, `ui`, `db`, `config`, `deps`, `ci`, `docs`,
`tests`, `security`, `performance`, `llm`, `analytics`, `cortex`, `journey`, `supabase`,
`memberstack`, `make`, `posthog`, `cursor`, `taskmaster`

### TypeScript Rules

```typescript
// ✅ Good
interface UserProfile {
  readonly id: string;
  name: string;
  email: string;
}

export const validateUser = (user: UserProfile): boolean => {
  return user.email.includes('@');
};

// ❌ Bad
function validateUser(user: any) {
  return user.email.includes('@');
}
```

### Documentation Standards

All markdown files must include:

- `## Purpose` - What this does
- `## Usage` - How to use it
- `## Examples` - Code examples

## Process

### Development Workflow

1. **Create Branch**

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Development**

   ```bash
   # Make changes with Cursor AI assistance
   # Follow .cursor/ rules for optimal AI suggestions

   # Validate frequently
   npm run validate:all
   ```

3. **Pre-commit**

   ```bash
   # Automatic via husky hooks:
   # - ESLint fix
   # - Prettier format
   # - Type checking
   # - Tests
   ```

4. **Commit**

   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push & PR**

   ```bash
   git push origin feat/your-feature-name
   # Create PR via GitHub
   ```

### Testing Requirements

- Unit tests for all new functions
- Integration tests for API endpoints
- E2E tests for user journeys
- Performance tests for critical paths

```typescript
// Example test structure
describe('UserService', () => {
  it('should validate user email format', () => {
    const user = { id: '1', name: 'Test', email: 'test@example.com' };
    expect(validateUser(user)).toBe(true);
  });
});
```

### Code Review Checklist

- [ ] Follows TypeScript strict mode
- [ ] ESLint passes with zero warnings
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Performance impact considered
- [ ] Security implications reviewed
- [ ] Cursor rules compliance verified

### AI Assistance Guidelines

- Use Cursor's AI for code generation and refactoring
- Follow `.cursor/` rules for consistent suggestions
- Validate AI-generated code with our standards
- Document complex AI-assisted solutions

### Performance Standards

- Frontend: <2s page load times
- API: <500ms response times
- Database: Optimized queries with indexes
- Bundle: Monitor size with each PR

### Security Standards

- No hardcoded secrets
- Input validation on all endpoints
- SQL injection prevention
- XSS protection
- CORS properly configured

## Troubleshooting

### Common Issues

**ESLint Errors**

```bash
npm run lint:fix
```

**TypeScript Errors**

```bash
npm run typecheck
# Check tsconfig.json paths
```

**Formatting Issues**

```bash
npm run format
```

**Test Failures**

```bash
npm run test:watch
```

**Cursor AI Issues**

- Enable "Strict Mode" in settings
- Check `.cursor/` rules are loading
- Restart Cursor if completions seem off

### Getting Help

- Check existing issues and discussions
- Review `.cursor/rules/` for guidance
- Ask in team chat with context
- Create detailed issue reports

## Cross-Platform Notes

### Windows

- Use PowerShell or WSL2
- Git line endings: `git config core.autocrlf false`
- Node.js via nvm-windows or direct install

### macOS/Linux

- Use nvm for Node.js management
- Standard bash/zsh shells supported

## Useful Commands

```bash
# Development
npm run dev                 # Start all services
npm run test:watch         # Run tests in watch mode
npm run canai:fix          # Fix common issues

# Validation
npm run validate:all       # Full validation suite
npm run canai:rules:check-config  # Validate Cursor config
npm run canai:docs:validate       # Validate documentation

# Maintenance
npm run clean              # Clean build artifacts
npm outdated              # Check for updates
```

## Resources

- [CanAI Platform Documentation](./docs/)
- [TypeScript Handbook](https://typescriptlang.org/docs/)
- [Cursor AI Documentation](https://cursor.sh/docs)
- [Conventional Commits](https://conventionalcommits.org/)
- [ESLint Rules](https://eslint.org/docs/rules/)

## Environment Variables for Testing

- All tests (unit, integration, frontend) now load environment variables from the project root
  `.env` file using `dotenv`.
- Do **not** use `frontend/environment.txt` or any other ad-hoc env files for tests.
- Ensure `.env` is up to date with all required test variables (see `testEnvSetup.js` for required
  keys).
- `.env` must be listed in `.gitignore` and never committed to version control.

---

**Last Updated**: $(date) **Version**: 2.0.0
