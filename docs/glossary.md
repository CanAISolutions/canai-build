# CanAI Platform Glossary

## 📚 **Project Overview Terms**

### **CanAI Platform**

The complete Emotional Sovereignty Platform designed to guide users through a 9-stage journey of
self-discovery, decision-making, and personal empowerment through AI-assisted emotional intelligence
tools.

### **Emotional Sovereignty**

The core concept of achieving complete autonomy over one's emotional responses, decision-making
processes, and personal growth trajectory through structured self-awareness and AI-assisted
insights.

## 🎯 **9-Stage User Journey (F1-F9)**

### **F1: Discovery Hook**

The initial landing page and user engagement point designed to capture attention and introduce users
to the CanAI platform through compelling value propositions and trust indicators.

### **F2: 2-Step Discovery Funnel**

An interactive quiz and assessment system that helps users understand their emotional awareness
levels and decision-making patterns while collecting initial user data.

### **F3: Spark Layer**

The engagement and interest amplification stage where users receive personalized insights based on
their discovery funnel results, building motivation for deeper platform engagement.

### **F4: Purchase Flow**

The monetization and conversion stage featuring Stripe-integrated payment processing, subscription
management, and tier-based access control.

### **F5: Detailed Input Collection**

Comprehensive data gathering phase where users provide detailed information about their goals,
challenges, and context through structured forms and interactive elements.

### **F6: Intent Mirror**

A reflection and validation stage where users review and confirm their inputs, ensuring accuracy and
alignment with their stated goals and intentions.

### **F7: Deliverable Generation**

The AI-powered content creation phase utilizing GPT-4o and Hume AI to generate personalized
emotional sovereignty tools, guides, and recommendations.

### **F8: SparkSplit**

A comparison and optimization stage where users can compare different approaches, strategies, or
outcomes using AI-assisted analysis and trust delta calculations.

### **F9: Feedback Capture**

The final stage focused on collecting user feedback, measuring satisfaction, enabling social
sharing, and facilitating referrals to complete the user journey loop.

## 🤖 **AI & Technology Components**

### **GPT-4o Integration**

OpenAI's advanced language model used for generating personalized content, analyzing user inputs,
and providing contextual recommendations throughout the user journey.

### **Hume AI**

Emotional intelligence API used for analyzing emotional context, sentiment, and providing empathetic
responses in user interactions and content generation.

### **Trust Delta**

A proprietary metric measuring the difference in user confidence and trust levels between different
options, approaches, or stages in their journey.

### **SparkSplit Technology**

AI-powered comparison and analysis system that helps users evaluate different paths, decisions, or
strategies using emotional intelligence and logical frameworks.

### **Circuit Breaker**

A resilience pattern implemented in the backend to prevent cascading failures when external AI
services (Hume AI, GPT-4o) experience rate limits or outages, automatically falling back to
alternative processing methods.

### **Emotional Resonance**

Quantitative metric (target >0.7) measuring the emotional alignment between generated content and
user context using Hume AI analysis of arousal (>0.5) and valence (>0.6) scores.

## 🏗️ **Technical Architecture**

### **Monorepo Structure**

A single repository containing both frontend and backend workspaces, shared packages, and
comprehensive tooling for the entire CanAI platform.

### **Frontend Workspace**

React-based application built with Vite, TypeScript, and Tailwind CSS, featuring the complete
9-stage user journey interface and component library.

### **Backend Workspace**

Node.js/Express API server with TypeScript, handling business logic, external integrations, and data
processing for the CanAI platform.

### **Domain-Driven Design (DDD)**

Architectural approach organizing code around business domains and contexts, ensuring clear
separation of concerns and maintainable code structure.

### **TaskMaster System**

Internal task management and development assignment system that organizes backend implementation
work into specific, trackable tasks (T8.1.1 through T17.1.6) while preventing conflicts with
infrastructure foundation files.

## 🔗 **External Integrations**

### **Supabase**

PostgreSQL-based backend-as-a-service providing database management, authentication, and real-time
subscriptions for the CanAI platform.

### **Memberstack**

User authentication and membership management service handling user registration, login, and
subscription tier management.

### **Make.com**

Workflow automation platform connecting CanAI with external services through webhooks and automated
scenarios for data processing and notifications.

### **Stripe**

Payment processing service handling subscriptions, one-time payments, and billing management for the
CanAI platform's monetization.

### **PostHog**

Product analytics platform tracking user behavior, conversion funnels, and feature usage across the
9-stage journey.

### **Sentry**

Error monitoring and performance tracking service providing real-time error reporting and
application performance insights.

### **Render**

Primary cloud hosting platform for backend services at `canai-router.onrender.com` with auto-scaling
capabilities for up to 10,000 concurrent users.

## 📊 **Analytics & Monitoring**

### **User Journey Analytics**

Comprehensive tracking of user progression through the 9-stage journey, including conversion rates,
drop-off points, and engagement metrics.

### **Conversion Funnel**

Analysis of user progression from discovery to purchase and completion, identifying optimization
opportunities at each stage.

### **Engagement Score**

Proprietary metric measuring user interaction depth, time spent, and meaningful engagement with
platform features and content.

### **Trust Indicators**

Visual and functional elements designed to build user confidence, including testimonials, security
badges, and social proof components.

### **Event Tracking**

Comprehensive analytics system capturing user interactions, performance metrics, and business KPIs
through PostHog integration with GDPR-compliant data handling.

## 🎨 **UI/UX Components**

### **Component Library**

Standardized React components built with shadcn/ui, ensuring consistent design and user experience
across the platform.

### **Responsive Design**

Mobile-first approach ensuring optimal user experience across all device types and screen sizes.

### **Accessibility (A11Y)**

WCAG 2.2 AA compliance ensuring the platform is accessible to users with disabilities through proper
semantic markup and interaction patterns.

### **Progressive Web App (PWA)**

Web application with native app-like features including offline functionality, push notifications,
and app-like installation.

## 🔒 **Security & Compliance**

### **GDPR Compliance**

European data protection regulation compliance including user consent management, data portability,
and right to erasure.

### **Data Anonymization**

Process of removing or encrypting personally identifiable information (PII) while maintaining data
utility for analytics, implemented through automated monthly jobs.

### **Rate Limiting**

Security measure preventing abuse by limiting the number of requests from a single source within a
specified time period.

### **CORS (Cross-Origin Resource Sharing)**

Security feature controlling which domains can access the CanAI API, preventing unauthorized
cross-origin requests.

### **Row Level Security (RLS)**

Supabase database security feature ensuring users can only access their own data through
policy-based access controls.

### **Content Security Policy (CSP)**

HTTP security header implementation preventing XSS attacks by controlling resource loading and
script execution.

## 🧪 **Testing & Quality Assurance**

### **Unit Tests**

Individual component and function testing ensuring code correctness at the smallest testable level.

### **Integration Tests**

Testing of component interactions and API integrations to ensure proper system functionality.

### **End-to-End (E2E) Tests**

Complete user journey testing simulating real user interactions from start to finish.

### **Accessibility Testing**

Automated and manual testing ensuring compliance with accessibility standards and guidelines.

### **Load Testing**

Performance testing using Locust to validate system behavior under expected traffic loads and
concurrent user scenarios.

### **Security Testing**

Automated security scanning and vulnerability assessment as part of the CI/CD pipeline.

## 🚀 **Development & Deployment**

### **Continuous Integration/Continuous Deployment (CI/CD)**

Automated pipeline for code testing, building, and deployment using GitHub Actions and comprehensive
quality gates.

### **Feature Flags**

System for enabling/disabling features without code deployment, allowing for controlled rollouts and
A/B testing.

### **Blue-Green Deployment**

Deployment strategy maintaining two identical production environments to enable zero-downtime
deployments and quick rollbacks.

### **Infrastructure as Code (IaC)**

Managing deployment infrastructure through code and configuration files rather than manual
processes.

### **GitHub Actions Workflows**

Comprehensive automation system with 16+ workflows covering testing, quality assurance, security
scanning, deployment, and monitoring validation.

## 📈 **Business & Product Terms**

### **Subscription Tiers**

Different levels of platform access and features, typically including Basic, Standard, and Premium
tiers with varying capabilities.

### **Customer Lifetime Value (CLV)**

Predicted total value a customer will generate throughout their relationship with the CanAI
platform.

### **Monthly Recurring Revenue (MRR)**

Predictable monthly revenue from subscription customers, key metric for SaaS business model.

### **Churn Rate**

Percentage of customers who cancel their subscriptions within a given time period.

### **Net Promoter Score (NPS)**

Customer satisfaction metric measuring likelihood of customers recommending the platform to others.

### **TrustDelta Metric**

Proprietary measurement system targeting ≥4.2 average score to quantify user confidence improvement
through the platform experience.

## 🔧 **Development Tools**

### **Cursor IDE**

AI-powered development environment with comprehensive rules and configurations specific to CanAI
development standards.

### **TypeScript**

Strongly-typed JavaScript superset providing enhanced code quality, debugging, and development
experience.

### **ESLint**

JavaScript linting tool enforcing code quality standards and catching potential errors during
development.

### **Prettier**

Code formatting tool ensuring consistent code style across the entire codebase.

### **Vitest**

Fast unit testing framework designed for Vite-based applications with excellent TypeScript support.

### **Vite**

Modern build tool providing fast development server and optimized production builds for the frontend
workspace.

## 📋 **Project Management**

### **TaskMaster**

Internal task management system organizing development work into specific, trackable tasks with
clear dependencies and completion criteria.

### **Cortex Memory**

Project knowledge management system maintaining institutional memory, decisions, and architectural
context.

### **Infrastructure Implementation Plan**

Comprehensive document outlining safe-to-create vs TaskMaster-assigned files to prevent development
conflicts during implementation phases.

### **User Story**

Development requirement written from the user's perspective, typically following "As a [user], I
want [goal] so that [benefit]" format.

### **Development Phases**

Structured approach to platform development with Phase 1 (Infrastructure Foundation) completed in
June 2025, preparing for Phase 2 (TaskMaster Implementation).

## 🎯 **Performance & Optimization**

### **Core Web Vitals**

Google's metrics for measuring user experience including Largest Contentful Paint (LCP), First Input
Delay (FID), and Cumulative Layout Shift (CLS).

### **Bundle Optimization**

Process of minimizing JavaScript bundle size through code splitting, tree shaking, and efficient
dependency management.

### **Caching Strategy**

Multi-layer approach to storing frequently accessed data including browser cache, CDN cache, and
application-level caching with Redis implementation.

### **Lazy Loading**

Performance optimization technique loading content only when needed, reducing initial page load
times.

### **Response Time Targets**

Performance benchmarks including <1.5s page loads, <2s API responses, <100ms error responses, and
99.9% uptime requirements.

## 📱 **User Experience Terms**

### **User Flow**

The path taken by users to complete a task or achieve a goal within the CanAI platform.

### **Conversion Rate**

Percentage of users who complete a desired action, such as signing up or making a purchase.

### **Bounce Rate**

Percentage of users who leave the platform after viewing only one page without taking any action.

### **Session Duration**

Average time users spend on the platform during a single visit.

### **User Retention**

Measure of how many users continue to use the platform over time.

### **Emotional Intelligence Metrics**

Quantitative measurements of user emotional engagement including arousal, valence, and emotional
resonance scores derived from Hume AI analysis.

## 🔄 **Data & Analytics**

### **Event Tracking**

Recording specific user actions and interactions for analysis and optimization purposes.

### **Cohort Analysis**

Grouping users based on shared characteristics or behaviors to analyze patterns over time.

### **A/B Testing**

Experimental approach comparing two versions of a feature to determine which performs better.

### **Heatmap Analysis**

Visual representation of user interaction patterns showing where users click, scroll, and focus
attention.

### **Data Retention Policy**

24-month data retention strategy with automated anonymization and compliance procedures for GDPR and
privacy regulations.

## 🔧 **Infrastructure Terms**

### **Microservices Architecture**

Design pattern organizing the application into small, independently deployable services with
specific business functions.

### **API Gateway**

Centralized entry point for all client requests, handling routing, authentication, rate limiting,
and request/response transformation.

### **Dead Letter Queue (DLQ)**

Message queue system for handling failed webhook processing and ensuring reliable data flow between
external services.

### **Environment Configuration**

Structured approach to managing application settings across development, staging, and production
environments using environment variables and configuration templates.

### **Health Checks**

Automated monitoring endpoints that verify service availability and system health for deployment and
operational monitoring.

## 🚀 **Advanced Features**

### **Prompt Engineering**

Systematic approach to crafting AI prompts for optimal content generation, emotional resonance, and
user engagement.

### **Token Management**

System for handling GPT-4o token limits including MapReduce techniques for large content processing
and overflow management.

### **Webhook Processing**

Automated handling of external service notifications and data synchronization through Make.com
scenarios and custom endpoint processing.

### **Real-time Features**

WebSocket implementation for live updates, progress indicators, and interactive user experiences
during content generation.

### **Internationalization (i18n)**

Multi-language support system for expanding platform accessibility to global markets with localized
content and interfaces.

---

**Glossary Version:** 3.0.0 **Last Updated:** June 2025 - Infrastructure Foundation Complete
**Maintained By:** CanAI Development Team **Review Cycle:** Monthly with quarterly comprehensive
audits **TaskMaster Status:** Phase 1 Infrastructure Complete, Phase 2 Implementation Ready
