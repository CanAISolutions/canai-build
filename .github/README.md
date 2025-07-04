# CanAI GitHub Automation & CI/CD

<div align="center">

**🚀 Continuous Integration & Deployment Pipeline**

![GitHub Actions](https://img.shields.io/badge/github%20actions-enabled-brightgreen.svg)
![CI/CD](https://img.shields.io/badge/CI%2FCD-automated-blue.svg)
![Quality Gates](https://img.shields.io/badge/quality%20gates-enforced-orange.svg)
![Security](https://img.shields.io/badge/security-scanned-red.svg)

</div>

## 🌟 Overview

This directory contains all GitHub-specific automation, including comprehensive CI/CD workflows,
custom actions, and issue/PR templates for the CanAI Emotional Sovereignty Platform. Our automation
ensures code quality, security, performance, and reliable deployments while supporting the complete
9-stage user journey development lifecycle.

### 🎯 Key Features

- **🔄 Comprehensive CI/CD**: 16+ automated workflows covering all aspects of development
- **🛡️ Security-First**: Automated vulnerability scanning and dependency auditing
- **⚡ Performance Testing**: Load testing and Core Web Vitals monitoring
- **🧪 Quality Assurance**: Code quality, linting, and comprehensive testing
- **🚀 Automated Deployment**: Blue-green deployment with rollback capabilities
- **📊 Monitoring Integration**: Post-deployment health checks and alerting
- **🔄 TaskMaster Validation**: Automated task tracking and milestone validation

## 📁 Directory Structure

```
.github/
├── 🔄 workflows/                  # GitHub Actions workflows
│   ├── ci.yml                     # Main CI/CD pipeline
│   ├── test.yml                   # Comprehensive test suite
│   ├── lint.yml                   # Code quality and linting
│   ├── security.yml               # Security scanning and validation
│   ├── performance.yml            # Performance testing and monitoring
│   ├── deploy-production.yml      # Production deployment
│   ├── deploy-staging.yml         # Staging deployment
│   ├── pr.yml                     # PR validation and quality gates
│   ├── observability.yml          # Health checks and monitoring
│   ├── validate-analytics.yml     # Analytics validation and GDPR compliance
│   ├── structure.yml              # Project structure validation
│   ├── cortex-validation.yml      # Cortex memory and milestone tracking
│   ├── flags.yml                  # Feature flags management
│   ├── make.yml                   # Make.com integration testing
│   ├── sync.yml                   # Memberstack synchronization testing
│   ├── supabase.yml               # Database integration validation
│   ├── prompts.yml                # LLM prompt validation and quality
│   ├── llm.yml                    # LLM integration testing (GPT-4o, Hume AI)
│   └── rules-validation.yml       # Cursor rules validation
├── 🎬 actions/                    # Custom GitHub Actions
│   ├── setup-canai/               # CanAI platform setup action
│   ├── deploy-render/             # Render deployment action
│   └── validate-journey/          # User journey validation action
├── 📝 templates/                  # Issue and PR templates
│   ├── bug_report.md              # Bug report template
│   ├── feature_request.md         # Feature request template
│   ├── pull_request_template.md   # PR template with checklist
│   ├── deployment.md              # Deployment checklist (200+ items)
│   └── rollback.md                # Emergency rollback procedures
└── 📖 README.md                   # This documentation file
```

## 🔄 CI/CD Workflows

### Main CI Pipeline (`ci.yml`)

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-canai

  lint-and-format:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - name: Run ESLint
        run: npm run lint:strict
      - name: Check Prettier formatting
        run: npm run format:check
      - name: TypeScript type checking
        run: npm run typecheck:strict

  test:
    needs: setup
    strategy:
      matrix:
        test-type: [unit, integration, e2e]
    runs-on: ubuntu-latest
    steps:
      - name: Run ${{ matrix.test-type }} tests
        run: npm run test:${{ matrix.test-type }}
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  security:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - name: Run security audit
        run: npm audit --audit-level=moderate
      - name: OWASP ZAP scan
        uses: zaproxy/action-full-scan@v0.7.0
      - name: Semgrep scan
        uses: returntocorp/semgrep-action@v1

  performance:
    needs: [lint-and-format, test]
    runs-on: ubuntu-latest
    steps:
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
      - name: Load testing
        run: npm run test:load

  deploy-staging:
    needs: [security, performance]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: ./.github/actions/deploy-render
        with:
          environment: staging

  deploy-production:
    needs: [security, performance]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: ./.github/actions/deploy-render
        with:
          environment: production
```

### Security Workflow (`security.yml`)

```yaml
name: Security Scanning
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1' # Weekly security scan

jobs:
  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      - name: Check for known vulnerabilities
        run: npx audit-ci --moderate

  code-scanning:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript, typescript
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  owasp-zap:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.7.0
        with:
          target: 'https://canai-staging.onrender.com'

  semgrep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit p/secrets p/owasp-top-ten

  docker-security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t canai-backend -f Dockerfile.backend .
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'canai-backend'
          format: 'sarif'
          output: 'trivy-results.sarif'
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

### Performance Testing (`performance.yml`)

```yaml
name: Performance Testing
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 4 * * *' # Daily performance monitoring

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build application
        run: npm run build
      - name: Start server
        run: npm start &
      - name: Wait for server
        run: npx wait-on http://localhost:3000
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true
          temporaryPublicStorage: true

  load-testing:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Install Locust
        run: pip install locust
      - name: Run load tests
        run: |
          locust -f tests/load/locustfile.py \
            --host https://canai-staging.onrender.com \
            --users 100 \
            --spawn-rate 10 \
            --run-time 300s \
            --headless \
            --html load-test-report.html
      - name: Upload load test results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: load-test-report.html

  core-web-vitals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Measure Core Web Vitals
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './lighthouserc.json'
          budgetPath: './budget.json'
      - name: Check performance budget
        run: |
          if [ -f "budget-results.json" ]; then
            node scripts/check-performance-budget.js
          fi
```

### TaskMaster Validation (`cortex-validation.yml`)

```yaml
name: TaskMaster & Cortex Validation
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate-cortex:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate Cortex memory format
        run: |
          if [ -f ".cursor/rules/cortex.md" ]; then
            node scripts/validate-cortex-format.js
          else
            echo "Cortex file not found, skipping validation"
          fi

  validate-taskmaster:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate TaskMaster tasks
        run: |
          if [ -f "Taskmaster-Tasks.md" ]; then
            node scripts/validate-taskmaster-tasks.js
          else
            echo "TaskMaster tasks file not found"
          fi
      - name: Check task dependencies
        run: node scripts/check-task-dependencies.js

  validate-rules:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate Cursor rules
        run: npm run canai:rules:validate
      - name: Check rule completeness
        run: |
          REQUIRED_RULES=(
            "canai-typescript-rules.mdc"
            "canai-structure-rules.mdc"
            "canai-api-rules.mdc"
            "canai-supabase-rules.mdc"
            "canai-user-journey.mdc"
          )
          for rule in "${REQUIRED_RULES[@]}"; do
            if [ ! -f ".cursor/rules/$rule" ]; then
              echo "Missing required rule: $rule"
              exit 1
            fi
          done
```

## 🎬 Custom Actions

### CanAI Setup Action (`actions/setup-canai/`)

```yaml
# action.yml
name: 'Setup CanAI Platform'
description: 'Sets up the CanAI development environment'
inputs:
  node-version:
    description: 'Node.js version to use'
    required: false
    default: '18'
  cache-dependency-path:
    description: 'Path to package-lock.json'
    required: false
    default: 'package-lock.json'
runs:
  using: 'composite'
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'npm'
        cache-dependency-path: ${{ inputs.cache-dependency-path }}
    - name: Install dependencies
      shell: bash
      run: npm ci
    - name: Validate CanAI rules
      shell: bash
      run: npm run canai:rules:check
    - name: Setup environment
      shell: bash
      run: |
        cp env.example .env.test
        echo "ENVIRONMENT=test" >> .env.test
```

### Render Deployment Action (`actions/deploy-render/`)

```yaml
# action.yml
name: 'Deploy to Render'
description: 'Deploys CanAI platform to Render'
inputs:
  environment:
    description: 'Deployment environment (staging/production)'
    required: true
  render-api-key:
    description: 'Render API key'
    required: true
  service-id:
    description: 'Render service ID'
    required: true
runs:
  using: 'composite'
  steps:
    - name: Trigger Render deployment
      shell: bash
      run: |
        curl -X POST \
          -H "Authorization: Bearer ${{ inputs.render-api-key }}" \
          -H "Content-Type: application/json" \
          "https://api.render.com/v1/services/${{ inputs.service-id }}/deploys"
    - name: Wait for deployment
      shell: bash
      run: |
        echo "Waiting for deployment to complete..."
        sleep 60
    - name: Health check
      shell: bash
      run: |
        if [ "${{ inputs.environment }}" = "production" ]; then
          curl -f https://canai-router.onrender.com/health
        else
          curl -f https://canai-staging.onrender.com/health
        fi
```

## 📝 Issue & PR Templates

### Pull Request Template

```markdown
## 📋 Pull Request Checklist

### 🎯 Purpose

<!-- Describe what this PR accomplishes -->

### 🔄 Changes Made

<!-- List the main changes in this PR -->

- [ ] Frontend changes
- [ ] Backend changes
- [ ] Database changes
- [ ] Documentation updates

### 🧪 Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

### 🔒 Security

- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Authentication/authorization checked
- [ ] OWASP guidelines followed

### ♿ Accessibility

- [ ] WCAG 2.2 AA compliance verified
- [ ] Keyboard navigation tested
- [ ] Screen reader compatibility checked
- [ ] Color contrast verified

### 🎭 User Journey Impact

<!-- Which stages of the 9-stage journey are affected? -->

- [ ] F1: Discovery Hook
- [ ] F2: 2-Step Discovery Funnel
- [ ] F3: Spark Layer
- [ ] F4: Purchase Flow
- [ ] F5: Detailed Input Collection
- [ ] F6: Intent Mirror
- [ ] F7: Deliverable Generation
- [ ] F8: SparkSplit
- [ ] F9: Feedback Capture

### 📊 Performance

- [ ] Performance impact assessed
- [ ] Core Web Vitals maintained
- [ ] Bundle size impact minimal
- [ ] Database query optimization

### 🔄 TaskMaster

- [ ] TaskMaster tasks updated if applicable
- [ ] Task dependencies verified
- [ ] Milestone progress updated

### 📚 Documentation

- [ ] README files updated
- [ ] API documentation updated
- [ ] Component documentation updated
- [ ] Deployment notes added

### 🚀 Deployment

- [ ] Environment variables documented
- [ ] Database migrations included
- [ ] Rollback plan documented
- [ ] Feature flags configured
```

### Bug Report Template

```markdown
---
name: Bug Report
about: Create a report to help us improve the CanAI platform
title: '[BUG] '
labels: 'bug'
assignees: ''
---

## 🐛 Bug Description

<!-- A clear and concise description of the bug -->

## 🎭 User Journey Stage

<!-- Which stage of the 9-stage journey is affected? -->

- [ ] F1: Discovery Hook
- [ ] F2: 2-Step Discovery Funnel
- [ ] F3: Spark Layer
- [ ] F4: Purchase Flow
- [ ] F5: Detailed Input Collection
- [ ] F6: Intent Mirror
- [ ] F7: Deliverable Generation
- [ ] F8: SparkSplit
- [ ] F9: Feedback Capture

## 🔄 Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## 🎯 Expected Behavior

<!-- What you expected to happen -->

## 📱 Environment

- OS: [e.g. iOS, Windows, macOS]
- Browser: [e.g. Chrome, Safari, Firefox]
- Version: [e.g. 22]
- Device: [e.g. iPhone 12, Desktop]

## 📊 Impact Assessment

- [ ] Blocks user journey progression
- [ ] Affects payment processing
- [ ] Impacts AI generation
- [ ] UI/UX issue only
- [ ] Performance degradation
- [ ] Security concern

## 📸 Screenshots

<!-- Add screenshots to help explain the problem -->

## 🔍 Additional Context

<!-- Any other context about the problem -->
```

## 🔒 Security & Compliance

### Automated Security Checks

1. **Dependency Scanning**: Weekly npm audit and vulnerability assessment
2. **Code Analysis**: CodeQL static analysis on every PR
3. **Container Security**: Trivy scanning of Docker images
4. **OWASP Compliance**: ZAP security testing for web vulnerabilities
5. **Secret Detection**: Automated scanning for exposed credentials
6. **License Compliance**: Automated license compatibility checking

### Compliance Monitoring

```yaml
# Example compliance check
- name: GDPR Compliance Check
  run: |
    # Check for proper data handling
    grep -r "personal.*data" src/ --include="*.ts" --include="*.tsx"
    # Verify consent management
    grep -r "consent" src/ --include="*.ts" --include="*.tsx"
    # Check data retention policies
    node scripts/verify-data-retention.js
```

## 📊 Quality Metrics

### Automated Quality Gates

- **Code Coverage**: Minimum 80% for all new code
- **Performance Budget**: Core Web Vitals within targets
- **Security Score**: Zero high/critical vulnerabilities
- **Accessibility**: WCAG 2.2 AA compliance
- **Bundle Size**: Maximum 500KB initial bundle
- **API Response Time**: <200ms for 95th percentile

### Quality Reporting

```yaml
- name: Generate Quality Report
  run: |
    npm run test:coverage
    npm run lighthouse:ci
    npm run bundle:analyze
    node scripts/generate-quality-report.js
```

## 🤝 Contributing

### Workflow Guidelines

1. **Branch Naming**: Use descriptive names (e.g., `feature/f3-spark-generation`,
   `fix/payment-validation`)
2. **Commit Messages**: Follow conventional commits format
3. **PR Size**: Keep PRs focused and reviewable (<500 lines when possible)
4. **Testing**: Include comprehensive tests for all changes
5. **Documentation**: Update relevant documentation

### Quality Standards

- All workflows must pass before merge
- Security scans must show no high/critical issues
- Performance budgets must be maintained
- Accessibility standards must be met
- Code coverage must not decrease

## 📞 Support & Resources

### Getting Help

- **Workflow Issues**: Check GitHub Actions logs and error messages
- **Security Questions**: Review security scanning results and OWASP guidelines
- **Performance Problems**: Analyze Lighthouse reports and Core Web Vitals
- **Deployment Issues**: Check Render deployment logs and health endpoints

### External Resources

- **GitHub Actions Documentation**:
  [https://docs.github.com/en/actions](https://docs.github.com/en/actions)
- **Render Deployment**: [https://render.com/docs](https://render.com/docs)
- **OWASP Security**: [https://owasp.org/](https://owasp.org/)
- **Lighthouse CI**:
  [https://github.com/GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci)

---

<div align="center">

**Built with ❤️ for the CanAI Emotional Sovereignty Platform**

[🏠 Back to Root](../README.md) | [🔧 Backend](../backend/README.md) |
[🎨 Frontend](../frontend/README.md)

</div>
