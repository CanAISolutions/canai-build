# CanAI Development Documentation

## Overview

This directory contains development-specific documentation for the CanAI Emotional Sovereignty
Platform, including setup guides, architecture documentation, and development best practices.

## Contents

- **setup.md** - Development environment setup guide
- **architecture.md** - Technical architecture documentation
- Development workflows and best practices
- Debugging and troubleshooting guides
- Performance optimization guidelines

## Quick Start

1. **Environment Setup**

   ```bash
   # Clone the repository
   git clone <repository-url>
   cd canai-build

   # Run setup script
   ./scripts/development/setup.sh
   ```

2. **Development Servers**

   ```bash
   # Start all services
   npm run dev

   # Or start individually
   npm run dev:frontend  # Frontend on :3000
   npm run dev:backend   # Backend on :10000
   ```

3. **Validate Setup**

   ```bash
   # Run health checks
   npm run health:check

   # Run tests
   npm run test
   ```

## Architecture Overview

The CanAI platform follows a modern monorepo architecture:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL) with Row-Level Security
- **AI Services**: GPT-4o + Hume AI integration
- **Deployment**: Render.com with automated CI/CD

## Development Workflow

1. **Feature Development**
   - Create feature branch from `main`
   - Follow TaskMaster task specifications
   - Implement with comprehensive tests
   - Ensure accessibility compliance

2. **Code Quality**
   - ESLint and Prettier for code formatting
   - TypeScript strict mode for type safety
   - Comprehensive test coverage (>80%)
   - Security scanning and validation

3. **Review Process**
   - Pull request with detailed description
   - Automated quality checks
   - Code review by team members
   - Merge after approval

## Key Development Resources

- [Project Structure Mapping](../project-structure-mapping.md)
- [Technical Architecture Document](<../technical-architecture-document-(TAD).md>)
- [Coding Standards & Style Guide](../coding-standards-style-guide.md)
- [API Contract Specification](../api-contract-specification.md)

## Debugging & Troubleshooting

### Common Issues

1. **Environment Variables**
   - Verify all required variables are set
   - Check API key formats and permissions
   - Validate database connection strings

2. **Development Server Issues**
   - Clear node_modules and reinstall
   - Check port availability
   - Verify service dependencies

3. **Database Issues**
   - Check Supabase connection
   - Verify RLS policies
   - Run database migrations

### Debug Tools

- **Frontend**: React DevTools, Redux DevTools
- **Backend**: Node.js debugger, Postman for API testing
- **Database**: Supabase dashboard, pgAdmin
- **Performance**: Lighthouse, Chrome DevTools

## Performance Guidelines

### Frontend Performance

- Code splitting for route-based loading
- Image optimization and lazy loading
- Bundle size monitoring (<500KB initial)
- Core Web Vitals compliance

### Backend Performance

- API response times <200ms
- Database query optimization
- Caching strategies
- Rate limiting implementation

### Database Performance

- Proper indexing for query optimization
- Row-Level Security policy efficiency
- Connection pooling
- Query performance monitoring

## Testing Strategy

### Test Types

- **Unit Tests**: Individual component/function testing
- **Integration Tests**: API and service integration
- **E2E Tests**: Complete user journey validation
- **Performance Tests**: Load testing and optimization
- **Accessibility Tests**: WCAG 2.2 AA compliance

### Running Tests

```bash
# All tests
npm test

# Specific test types
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance
npm run test:accessibility
```

## Security Considerations

- Input validation and sanitization
- Authentication and authorization
- Data encryption and privacy
- OWASP security guidelines
- Regular security audits

## Deployment Process

1. **Staging Deployment**
   - Automated on `develop` branch pushes
   - Comprehensive testing and validation
   - Performance and security checks

2. **Production Deployment**
   - Manual trigger from `main` branch
   - Blue-green deployment strategy
   - Post-deployment health checks
   - Rollback procedures if needed

---

[🏠 Back to Docs](../README.md) | [🏗️ Architecture](./architecture.md) |
[⚙️ Setup Guide](./setup.md)
