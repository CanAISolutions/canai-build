# CanAI Development Guidelines

This directory provides a streamlined development framework for the CanAI Emotional Sovereignty
Platform, designed to promote consistent, adaptable, and high-quality code while aligning with the
PRD and optimizing for Cursor AI.

## 🎯 Framework Overview

The CanAI Development Guidelines offer flexible recommendations to support the 9-stage user journey
(F1-F9). These guidelines encourage innovation, maintain project coherence, and ensure code aligns
with business goals and user experience objectives.

### Core Principles

- **User-Centric Development**: Prioritize emotional well-being and trust-building
- **PRD Alignment**: Implementations should reflect PRD goals and metrics
- **Performance Focus**: Aim for responsive, scalable solutions
- **Type Safety**: Encourage TypeScript best practices
- **Contextual Awareness**: Use Cortex for project consistency

## 📋 Guidelines Catalog

### 🏗️ Foundation Guidelines

#### 1. **canai-typescript.mdc** - Type Safety Practices

- **Purpose**: Recommends TypeScript practices for reliable code
- **Key Features**:
  - Type definitions for journey stages and emotional data
  - Suggestions for strict mode and React Server Components
  - Patterns for AI service integration
- **Applies To**: All TypeScript files
- **Cursor Support**: Enhances code completion and error detection

#### 2. **canai-structure.mdc** - Project Organization

- **Purpose**: Suggests file and folder organization
- **Key Features**:
  - Logical structure for 9-stage journey
  - Component and service naming conventions
  - Import/export best practices
- **Applies To**: Project-wide architecture
- **Cursor Support**: Improves file navigation and suggestions

#### 3. **canai-cortex.mdc** - Project Context Management

- **Purpose**: Maintains development context and milestones
- **Key Features**:
  - Milestone tracking aligned with PRD
  - Journey progress monitoring
  - Task integration
- **Applies To**: Project planning and context
- **Cursor Support**: Provides context for intelligent suggestions

### 🚀 Core Development Guidelines

#### 4. **canai-api.mdc** - API Development

- **Purpose**: Guides REST API design and implementation
- **Key Features**:
  - Endpoint patterns for F1-F9 stages
  - Performance and authentication recommendations
  - User-friendly error handling
- **Applies To**: Backend routes and services
- **Cursor Support**: Assists with API implementation

#### 5. **canai-supabase.mdc** - Database Practices

- **Purpose**: Recommends Supabase integration strategies
- **Key Features**:
  - Row-Level Security (RLS) suggestions
  - Query optimization tips
  - Real-time subscription patterns
- **Applies To**: Database operations
- **Cursor Support**: Aids query and schema generation

#### 6. **canai-user-journey.mdc** - User Journey Design

- **Purpose**: Guides implementation of the 9-stage journey
- **Key Features**:
  - Stage-specific recommendations
  - Emotional resonance and trust-building tips
  - State management suggestions
- **Applies To**: Frontend components and user flows
- **Cursor Support**: Supports journey-aligned development

### 🔧 Integration & Service Guidelines

#### 7. **canai-llm.mdc** - AI Integration

- **Purpose**: Guides GPT-4o and Hume AI integration
- **Key Features**:
  - Multi-provider setup suggestions
  - Emotional resonance validation tips
  - Reliability patterns
- **Applies To**: AI service integration
- **Cursor Support**: Provides AI integration patterns

#### 8. **canai-llm-prompting.mdc** - Prompt Engineering

- **Purpose**: Recommends effective prompt design
- **Key Features**:
  - Prompt templates for journey stages
  - Emotional context suggestions
  - Efficiency tips
- **Applies To**: AI prompt creation
- **Cursor Support**: Enhances prompt consistency

#### 9. **canai-make-automation.mdc** - Automation Workflows

- **Purpose**: Guides Make.com automation
- **Key Features**:
  - Webhook and email automation patterns
  - Security and error handling tips
- **Applies To**: Automation workflows
- **Cursor Support**: Supports webhook implementation

#### 10. **canai-memberstack-sync.mdc** - Authentication

- **Purpose**: Recommends user authentication practices
- **Key Features**:
  - JWT and session management tips
  - Profile synchronization patterns
  - Role-based access suggestions
- **Applies To**: Authentication and user management
- **Cursor Support**: Aids auth implementation

### 📊 Analytics & Monitoring Guidelines

#### 11. **canai-analytics.mdc** - Event Tracking

- **Purpose**: Guides privacy-compliant analytics
- **Key Features**:
  - Journey event tracking suggestions
  - PostHog integration tips
  - Metric dashboard recommendations
- **Applies To**: Analytics and tracking
- **Cursor Support**: Supports event implementation

#### 12. **canai-observability.mdc** - Monitoring

- **Purpose**: Recommends system health monitoring
- **Key Features**:
  - Error tracking and alerting suggestions
  - Health check patterns
  - Performance metric tips
- **Applies To**: System monitoring
- **Cursor Support**: Enhances monitoring setup

#### 13. **canai-performance.mdc** - Performance Optimization

- **Purpose**: Suggests performance improvements
- **Key Features**:
  - Caching and load optimization tips
  - Frontend and database performance patterns
- **Applies To**: System-wide performance
- **Cursor Support**: Provides optimization patterns

### 🔒 Security & Compliance Guidelines

#### 14. **canai-security.mdc** - Security Practices

- **Purpose**: Recommends security best practices
- **Key Features**:
  - Input validation and rate limiting tips
  - Authentication and authorization patterns
- **Applies To**: Security implementation
- **Cursor Support**: Enhances secure coding

#### 15. **canai-data-lifecycle.mdc** - Data Privacy

- **Purpose**: Guides GDPR/CCPA-compliant data handling
- **Key Features**:
  - Data retention and consent management tips
  - Encryption and anonymization patterns
- **Applies To**: Data privacy and compliance
- **Cursor Support**: Supports compliant workflows

### 🧪 Quality Assurance Guidelines

#### 16. **canai-testing.mdc** - Testing Strategies

- **Purpose**: Recommends comprehensive testing
- **Key Features**:
  - Unit, integration, and accessibility testing tips
  - AI model validation suggestions
- **Applies To**: Code quality and validation
- **Cursor Support**: Aids test creation

#### 17. **canai-error-handling.mdc** - Error Management

- **Purpose**: Guides robust error handling
- **Key Features**:
  - User-friendly error message patterns
  - Fallback and recovery strategies
- **Applies To**: Error handling logic
- **Cursor Support**: Supports error patterns

### 🚀 Deployment & Operations Guidelines

#### 18. **canai-production-readiness.mdc** - Production Deployment

- **Purpose**: Comprehensive production readiness checklist and operational guidelines
- **Key Features**:
  - Infrastructure validation and security hardening
  - Performance benchmarks and monitoring setup
  - Backup strategies and disaster recovery procedures
  - Auto-scaling configuration and capacity planning
  - Go-live checklist and post-deployment monitoring
- **Applies To**: Production deployment and operations
- **Cursor Support**: Ensures comprehensive production preparation

#### 19. **canai-ci-cd.mdc** - Deployment Pipelines

- **Purpose**: Recommends efficient deployments
- **Key Features**:
  - GitHub Actions workflow suggestions
  - Testing and rollback strategies
- **Applies To**: CI/CD pipelines
- **Cursor Support**: Enhances pipeline setup

#### 19. **canai-github.mdc** - Version Control

- **Purpose**: Guides Git workflows
- **Key Features**:
  - Branching and commit suggestions
  - PR and review process tips
- **Applies To**: Git workflows
- **Cursor Support**: Supports Git practices

### 🎛️ Advanced Features Guidelines

#### 20. **canai-feature-flags.mdc** - Feature Management

- **Purpose**: Recommends feature rollout strategies
- **Key Features**:
  - Feature flag and A/B testing patterns
  - Rollout and rollback suggestions
- **Applies To**: Feature deployment
- **Cursor Support**: Aids feature implementation

#### 21. **canai-taskmaster.mdc** - Task Management

- **Purpose**: Guides task integration
- **Key Features**:
  - Task tracking and dependency suggestions
  - Progress monitoring tips
- **Applies To**: Project management
- **Cursor Support**: Enhances task workflows

#### 22. **canai-docs.mdc** - Documentation

- **Purpose**: Recommends documentation practices
- **Key Features**:
  - API and component documentation tips
  - Developer onboarding suggestions
- **Applies To**: Project documentation
- **Cursor Support**: Supports doc creation

## 🔄 Guideline Relationships

### Key Connections

- **TypeScript ↔ Structure**: Consistent code and organization
- **API ↔ User Journey**: Backend supports frontend flows
- **Security ↔ Data Lifecycle**: Privacy and protection
- **Testing ↔ CI/CD**: Quality assurance and deployment

## 🎯 Implementation Approach

### Phase 1: Foundation

- TypeScript, Structure, Cortex, Security

### Phase 2: Core Development

- API, Supabase, User Journey, LLM

### Phase 3: Integration & Quality

- Analytics, Performance, Testing, Error Handling

### Phase 4: Operations & Features

- CI/CD, Observability, Feature Flags, Documentation

## 🎛️ Cursor AI Integration

### Features

- **Context Support**: Guidelines enhance code suggestions
- **Code Generation**: Aligns with recommended patterns
- **Validation**: Encourages PRD-aligned code

## 📊 Success Metrics

### Technical

- Type Safety: High TypeScript adoption
- Performance: Responsive and scalable systems
- Test Coverage: Comprehensive validation
- Security: Minimal vulnerabilities

### Business

- Trust and Resonance: Positive user engagement
- Conversion: High journey completion rates

## 🔧 Usage

### Development

- Reference Cortex for context
- Use guideline patterns
- Validate against PRD
- Test thoroughly

### Team Collaboration

- Prioritize foundational guidelines
- Monitor performance
- Update documentation

## 🔄 Maintenance

- Review guidelines regularly
- Incorporate feedback
- Update for new requirements

## 📚 Quick Reference

### Key Files

- **Cortex**: `.cursor/guidelines/cortex.md`
- **Types**: `frontend/src/types/`, `backend/types/`
- **API**: `backend/routes/`
- **Journey**: `frontend/src/pages/F1-F9/`
- **Tests**: `backend/tests/`, `frontend/tests/`

### Commands

- Type Check: `npm run type-check`
- Test: `npm run test`
- Build: `npm run build`

## 🚨 Success Tips

- Start with Cortex for context
- Apply TypeScript and security patterns
- Validate performance and PRD alignment
- Use testing and analytics for quality

---

**Version**: 2.2.0 **Last Updated**: June 19, 2025 **Guidelines**: 22 flexible recommendations
**Coverage**: Full 9-stage journey **Optimization**: Balanced for Cursor AI and innovation
