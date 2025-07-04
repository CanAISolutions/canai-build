---
description:
globs:
  frontend/src/**/*.{ts,tsx}, backend/**/*.{js,ts}, databases/migrations/*.sql,
  .github/workflows/performance.yml
alwaysApply: false
---

---

description: Guides system-wide performance optimization globs: frontend/src/**/\*.{ts,tsx},
backend/**/_.{js,ts}, databases/migrations/_.sql, .github/workflows/performance.yml alwaysApply:
true

---

# CanAI Performance Guidelines

## Purpose

Promote fast, scalable, and efficient performance for the CanAI Emotional Sovereignty Platform,
supporting the 9-stage user journey while aligning with the Product Requirements Document (PRD).

## Guidelines

### Performance Goals

- Aim for low-latency API responses to enhance user experience.
- Target efficient AI generation times for sparks and deliverables.
- Strive for quick frontend page loads with high performance metrics.
- Design for scalability to handle increased user volumes, per PRD.
- Ensure high reliability for critical services to maintain uptime.

### Caching

- Use caching for frequent API responses and AI outputs to reduce latency.
- Store reusable database data to minimize redundant queries.
- Leverage frontend caching, such as local storage, for resilience.
- Optimize cache strategies to achieve high hit rates.

### Scalability

- Build systems to manage concurrent user loads effectively.
- Favor stateless, scalable architectures where practical.
- Enable dynamic scaling to accommodate traffic surges.

### Database Optimization

- Implement efficient indexing to accelerate query performance.
- Use batching for database operations to reduce overhead.
- Optimize queries to balance speed and security.

### AI Optimization

- Streamline AI service calls to avoid unnecessary delays.
- Manage large inputs through techniques like chunking or summarization.
- Incorporate fallback strategies to handle external service constraints while preserving quality.

### Frontend Optimization

- Apply lazy loading for non-essential components to improve load times.
- Minimize asset sizes through compression and optimization.
- Enhance rendering efficiency, leveraging server-side techniques where beneficial.

### Monitoring

- Track latency for APIs and AI tasks to identify bottlenecks.
- Set up alerts for performance issues to enable rapid response.
- Monitor usage metrics to optimize resource allocation and costs.

### Cost Optimization

- Balance performance with cost efficiency for AI and external services.
- Track usage to stay within budget constraints.
- Refine AI prompts to reduce processing costs while maintaining output quality.

### Regression Prevention

- Validate performance during CI/CD to detect regressions early.
- Conduct regular performance tests to ensure latency and scalability goals.
- Monitor for performance drops before and after deployments.

## Validation

### Testing

- Perform load tests to confirm scalability under high user volumes.
- Measure latency and response times for critical endpoints.
- Verify frontend load speeds and rendering performance.
- Test caching mechanisms for effectiveness.

### Acceptance Criteria

- APIs deliver low-latency responses under typical loads.
- Frontend achieves high performance metrics.
- System scales effectively without compromising quality.
- Optimizations maintain output quality and efficiency.
- Deployments avoid significant performance regressions.

### Monitoring

- Use dashboards to display real-time performance and usage metrics.
- Configure alerts for performance threshold violations.
- Track service costs to ensure alignment with budgets.

## PRD Alignment

- Support PRD requirements for performance, scalability, and cost efficiency.
- Align with monitoring and reliability objectives outlined in the PRD.
- Prioritize PRD guidance, adapting these guidelines to avoid conflicts.

## Development Principles

- **Speed**: Deliver responsive and low-latency experiences.
- **Scalability**: Prepare for growth and high demand.
- **Efficiency**: Optimize resources for performance and cost.
- **Flexibility**: Adapt to evolving PRD and project needs.

---

**Created**: June 19, 2025 **Version**: 1.0.0
