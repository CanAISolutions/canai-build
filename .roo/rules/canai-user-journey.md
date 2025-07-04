---
description:
globs: frontend/src/pages/**/*.{tsx}, frontend/src/components/**/*.{tsx}, backend/routes/*.js
alwaysApply: false
---

---

description: Guides implementation of the 9-stage user journey globs:
frontend/src/pages/**/\*.{tsx}, frontend/src/components/**/_.{tsx}, backend/routes/_.js alwaysApply:
true

---

# CanAI User Journey Guidelines

## Purpose

Guide the creation of a seamless, trust-building, and emotionally resonant 9-stage user journey for
the CanAI Emotional Sovereignty Platform, aligning with PRD Sections 5 (User Journey), 6.1–6.9
(Functional Requirements), and 12 (Success Metrics) to foster engagement, conversion, and user
satisfaction through personalized AI-driven experiences.

## Scope

These guidelines shape the user journey across frontend and backend systems, prioritizing
flexibility and PRD compliance. They balance user experience, performance, and trust while
encouraging adaptability.

## Core Principles

### Journey Structure

- **Goal**: Deliver a cohesive 9-stage experience from discovery to feedback.
- **Guidelines**:
  - Implement all stages (F1: Discovery Hook to F9: Feedback Capture) with clear progression.
  - Organize components and APIs by feature, guided by PRD architecture.
  - Provide intuitive navigation, such as progress indicators.

### User Experience

- **Goal**: Create an engaging, trust-building journey.
- **Guidelines**:
  - Design intuitive interfaces with clear calls-to-action and contextual support (e.g., tooltips).
  - Incorporate trust indicators (e.g., testimonials, quality metrics) to enhance confidence.
  - Personalize interactions using user inputs and AI insights.

### Performance

- **Goal**: Ensure fast, reliable interactions.
- **Guidelines**:
  - Optimize page loads, API responses, and AI generation to align with PRD performance goals.
  - Leverage caching, lazy loading, or similar techniques for efficiency.
  - Monitor performance to support PRD targets (e.g., response times, uptime).

### Accessibility

- **Goal**: Promote inclusivity for all users.
- **Guidelines**:
  - Aim for WCAG 2.2 AA compliance, including sufficient contrast and ARIA labels.
  - Support screen readers and keyboard navigation.
  - Provide clear, accessible error messages and feedback.

### Analytics

- **Goal**: Monitor user behavior to refine the journey.
- **Guidelines**:
  - Track funnel progression, engagement, and conversion with analytics tools.
  - Capture key interactions (e.g., spark selection, payment completion).
  - Align analytics with PRD success metrics (e.g., trust scores, completion rates).

### Security

- **Goal**: Safeguard user data and interactions.
- **Guidelines**:
  - Use secure authentication and data access controls, such as Row-Level Security (RLS).
  - Sanitize inputs to mitigate security risks.
  - Ensure secure payment processing, per PRD Section 6.

## Stage-Specific Guidelines

### F1: Discovery Hook

- **Purpose**: Engage users with a compelling value proposition.
- **Guidelines**:
  - Highlight products and trust indicators (e.g., social proof, previews).
  - Use accessible calls-to-action to encourage exploration.
  - Track initial engagement to gauge interest.

### F2: Discovery Funnel

- **Purpose**: Gather initial inputs with ease.
- **Guidelines**:
  - Design a concise, multi-step form with real-time validation and progress cues.
  - Offer contextual guidance (e.g., tooltips) based on inputs.
  - Display trust signals to build confidence.

### F3: Spark Layer

- **Purpose**: Spark purchase intent with resonant concepts.
- **Guidelines**:
  - Present AI-generated sparks with options for selection or regeneration.
  - Use trust and emotional metrics to guide choices.
  - Collect feedback on sparks to refine future outputs.

### F4: Purchase Flow

- **Purpose**: Streamline payment processing.
- **Guidelines**:
  - Create a clear checkout process with transparent pricing and product options.
  - Use a secure payment provider with defined refund policies.
  - Track payment completion and handle failures gracefully.

### F5: Detailed Input Collection

- **Purpose**: Collect detailed inputs for tailored deliverables.
- **Guidelines**:
  - Implement a multi-step form with auto-save and progress tracking.
  - Validate inputs and provide contextual support.
  - Ensure data persistence across sessions.

### F6: Intent Mirror

- **Purpose**: Confirm and summarize user inputs.
- **Guidelines**:
  - Display a clear summary with AI-driven confidence scoring.
  - Allow edits for low-confidence inputs.
  - Monitor confirmation and edit rates to improve clarity.

### F7: Deliverable Generation

- **Purpose**: Deliver high-quality, AI-driven outputs.
- **Guidelines**:
  - Generate deliverables using AI, ensuring emotional resonance.
  - Support revision requests with clear progress updates.
  - Align outputs with PRD quality standards (e.g., coherence, tone).

### F8: SparkSplit

- **Purpose**: Showcase CanAI’s value through comparison.
- **Guidelines**:
  - Present CanAI and generic outputs side-by-side with trust and emotional metrics.
  - Emphasize CanAI’s strengths (e.g., tone, cultural relevance).
  - Track user preferences and engagement with comparisons.

### F9: Feedback Capture

- **Purpose**: Gather feedback and promote sharing.
- **Guidelines**:
  - Offer a simple feedback form with ratings and sentiment analysis.
  - Encourage social sharing and referrals with incentives.
  - Use feedback to drive continuous improvement.

## Cross-Stage Guidelines

### Data Flow and State Management

- **Goal**: Ensure consistent user progress.
- **Guidelines**:
  - Manage state to share data across stages effectively.
  - Persist progress in a secure database, with local storage as a fallback.
  - Maintain data consistency with auto-save and recovery options.

### Error Handling

- **Goal**: Deliver a resilient experience.
- **Guidelines**:
  - Use error boundaries and clear, user-friendly messages.
  - Implement fallbacks (e.g., cached content) for API disruptions.
  - Log errors for monitoring, integrating with tools like Sentry.

### AI Integration

- **Goal**: Enhance personalization and quality with AI.
- **Guidelines**:
  - Leverage AI for spark generation, summaries, and emotional validation.
  - Validate AI outputs to ensure resonance and quality.
  - Plan for AI service limitations (e.g., quotas) with fallbacks.

### Testing

- **Goal**: Ensure reliability and quality.
- **Guidelines**:
  - Test critical paths with unit, integration, and end-to-end tests.
  - Validate accessibility and performance under load.
  - Use A/B testing or feature flags to optimize flows.

### Continuous Improvement

- **Goal**: Refine the journey based on insights.
- **Guidelines**:
  - Analyze feedback and analytics to address friction points.
  - Conduct performance audits to align with PRD goals.
  - Iterate on features using data-driven insights.

## Development Workflow

- **Plan Stages**: Align UX and API design with PRD Sections 6.1–6.9.
- **Test Incrementally**: Validate functionality and metrics per stage.
- **Monitor Metrics**: Track PRD-defined success criteria (e.g., trust, conversion).
- **Adapt**: Refine stages based on user and developer feedback.

## Validation and Monitoring

- **CI/CD**: Automate testing for functionality, performance, and accessibility.
- **Monitoring**: Track latency, errors, and analytics in real time.
- **Success Criteria**: Align with PRD metrics (e.g., completion, trust, satisfaction).
- **Improvement**: Optimize conversion and UX with feedback and testing.

## References

- **PRD Sections**: 5 (User Journey), 6.1–6.9 (Functional Requirements), 12 (Success Metrics).
- **Tech Stack**: Guided by PRD, including frameworks, databases, AI services, and analytics tools.
- **Standards**: WCAG 2.2 AA, secure authentication, performance optimization.

---

**Created**: June 19, 2025 **Version**: 1.0.0
