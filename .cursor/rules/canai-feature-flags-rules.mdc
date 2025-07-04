---
description:
globs: backend/services/*.js, frontend/src/lib/utils.ts, .github/workflows/
alwaysApply: false
---
---
description: Guides feature rollout strategies
globs: backend/services/*.js, frontend/src/lib/utils.ts, .github/workflows/flags.yml
alwaysApply: false
---
# CanAI Feature Flags Guidelines

## Purpose
Enable controlled feature rollouts, A/B testing, and experimentation across the 9-stage user journey (F1-F9), aligning with PRD Sections 7, 12, and 17 to enhance user experience, trust, and conversions while ensuring stability.

## Scope
Provide flexible guidance for implementing and managing feature flags across frontend, backend, and analytics layers, prioritizing PRD alignment, accessibility, and adaptability to project needs.

## Guiding Principles

### Controlled Rollouts
- Deploy features incrementally to minimize risk and validate impact.
- Support rapid enablement or disablement for critical features.

### Experimentation
- Enable A/B testing to optimize user engagement and PRD-defined metrics.
- Target specific user segments for tailored experiences.

### Stability
- Use safe defaults to ensure platform reliability.
- Plan for quick reversions if issues arise.

### Transparency
- Document flag purposes, metrics, and outcomes clearly.
- Communicate changes to relevant teams.

## Feature Flag Approach

### Naming
- Use clear, consistent naming (e.g., kebab-case, optional stage prefixes like `f1-pricing`).
- Document flag intent and scope for clarity.

### Lifecycle
- Define flags with clear goals tied to PRD metrics (e.g., trust, conversion).
- Test in staging, roll out gradually, evaluate results, and retire or make permanent.
- Remove unused flags to avoid technical debt.

### Defaults
- Set conservative defaults (e.g., off or control variant).
- Start rollouts with small user cohorts, scaling based on data.

## Stage-Specific Guidance
Apply flags thoughtfully across the 9-stage journey, guided by PRD:
- **F1: Discovery Hook**: Test trust signals or pricing displays to boost engagement.
- **F2: Discovery Funnel**: Experiment with input validation or tooltips to reduce errors.
- **F3: Spark Layer**: Vary spark generation parameters to improve selection rates.
- **F4: Purchase Flow**: Optimize checkout flows for higher completion.
- **F5: Input Collection**: Adjust input guidance or save frequency for efficiency.
- **F6: Intent Mirror**: Test summary styles or confidence thresholds for clarity.
- **F7: Deliverable Generation**: Experiment with output delivery methods for speed.
- **F8: SparkSplit**: Vary comparison formats to enhance preference clarity.
- **F9: Feedback Capture**: Test feedback prompts or timing for quality responses.

## Implementation Guidance

### Frontend
- Use hooks or utilities for dynamic flag evaluation.
- Cache flags locally to reduce latency.
- Ensure flag-driven UI complies with WCAG 2.2 AA.

### Backend
- Implement flag logic in middleware or services.
- Support user segmentation for targeted rollouts.
- Integrate with analytics for tracking outcomes.

### Analytics
- Track flag usage and experiment results (e.g., `flag_enabled`, `experiment_completed`).
- Monitor impacts on trust, conversion, and performance metrics.

### Advanced Patterns
- **Kill Switches**: Enable rapid feature toggling for safety.
- **Segmentation**: Target flags by user traits (e.g., behavior, demographics).
- **Prompt Versioning**: Test AI prompt variations for optimized outputs.

## Management & Safety
- Store flag configurations centrally for dynamic updates.
- Start rollouts conservatively, monitoring real-time feedback.
- Plan for quick rollback mechanisms if issues occur.
- Document and communicate flag changes to stakeholders.

## Validation & Testing
- Validate flag syntax and defaults in CI/CD pipelines.
- Test flag logic and analytics integration in staging.
- Simulate rollouts to ensure stability and performance.

## Documentation
- Maintain a registry of flags with their purpose, metrics, and status.
- Record experiment outcomes and decisions.
- Update documentation as PRD or project needs evolve.

## Ownership
- **Product Team**: Defines flag goals and metrics.
- **Backend Team**: Implements and manages flag logic.
- **QA Team**: Validates flag behavior and outcomes.
- **DevOps Team**: Monitors performance and rollout impacts.

## References
- **PRD Sections**: 7 (Performance), 12 (Metrics), 17 (Future Enhancements).
- **Standards**: Prioritize PRD alignment, accessibility, and stability.

---

**Created**: June 19, 2025
**Version**: 1.0.0
**Alignment**: PRD Sections 7, 12, 17
