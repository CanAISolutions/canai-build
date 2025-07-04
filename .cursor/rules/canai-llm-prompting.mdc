---
description:
globs: backend/prompts/*.js
alwaysApply: false
---
---
description: Enforces effective AI prompt design
globs: backend/prompts/*.js
alwaysApply: false
---

# CanAI LLM Prompting Guidelines

## Purpose
Guide the creation of GPT-4o prompts to deliver emotionally resonant, high-quality outputs across the 9-stage user journey (F1-F9), aligning with PRD Sections 6, 8.4, 12, and 17 to enhance user trust and engagement.

## Scope
Provide flexible, high-level guidance for designing and managing LLM prompts, prioritizing PRD alignment, emotional resonance, and adaptability to project needs.

## Guiding Principles

### Emotional Resonance
- Craft prompts to produce outputs that align with user emotional drivers (e.g., trust, community).
- Validate resonance using tools like Hume AI to meet PRD goals.

### PRD Alignment
- Ensure prompts support PRD-defined objectives for each journey stage.
- Adapt to evolving PRD requirements and user feedback.

### Clarity
- Design concise, purpose-driven prompts to generate relevant outputs.
- Avoid ambiguity to minimize irrelevant or off-topic responses.

### Efficiency
- Optimize token usage and processing to maintain performance.
- Implement fallbacks to ensure reliability under constraints.

## Prompt Design

### Structure
- Organize prompts logically by journey stage (e.g., discovery, sparks, deliverables).
- Store prompts in a dedicated backend directory for maintainability.
- Allow flexibility in format to suit project needs.

### Emotional Drivers
- Incorporate user inputs (e.g., business goals, brand voice) to emphasize emotional drivers.
- Embed drivers naturally to enhance output relevance and impact.

### Tone
- Apply consistent, user-preferred tones (e.g., professional, warm) within sessions.
- Validate tone appropriateness with PRD metrics and resonance tools.
- Support custom tones with validation for quality.

### Input Handling
- Validate essential inputs (e.g., business type, challenge) for complete context.
- Filter inappropriate content and detect contradictions in user inputs.
- Rely solely on provided inputs, avoiding external data unless PRD-specified.

### Token Management
- Prioritize critical inputs to stay within token limits.
- Use chunking or summarization for large inputs to maintain efficiency.
- Monitor token usage to optimize performance.

## Stage-Specific Guidance
Apply prompts thoughtfully across the 9-stage journey, guided by PRD:
- **F1: Discovery Hook**: Generate trust-building messages or pricing insights.
- **F2: Discovery Funnel**: Validate inputs with feedback for clarity.
- **F3: Spark Layer**: Create engaging spark concepts tailored to user goals.
- **F4: Purchase Flow**: Support payment-related guidance or confirmations.
- **F5: Input Collection**: Provide input-specific tooltips or guidance.
- **F6: Intent Mirror**: Summarize inputs with high confidence and clarity.
- **F7: Deliverable**: Generate tailored outputs meeting quality standards.
- **F8: SparkSplit**: Produce comparable outputs for trust analysis.
- **F9: Feedback**: Analyze feedback for sentiment and insights.

## Implementation Guidance

### Validation
- Verify prompts produce outputs meeting PRD formats (e.g., word counts, structure).
- Use resonance tools to ensure emotional alignment.
- Test prompts for consistency across journey stages.

### Versioning
- Track prompt versions with clear change logs.
- Experiment with variations (e.g., A/B testing) to optimize outcomes.
- Retire outdated prompts to reduce complexity.

### Fallbacks
- Implement fallback models (e.g., GPT-4o-mini) for service constraints.
- Apply trust penalties for fallback outputs per PRD.
- Log fallback usage for monitoring.

### Testing
- Conduct unit tests for prompt output quality and driver accuracy.
- Perform integration tests to ensure stage cohesion.
- Test error handling and fallback behaviors.

### Monitoring
- Track prompt success rates, resonance scores, and user satisfaction.
- Monitor technical issues (e.g., latency, token limits) with analytics tools.
- Incorporate user feedback to refine prompts.

## Automation & CI/CD
- Validate prompt syntax and PRD compliance in CI/CD pipelines.
- Test performance and resonance metrics automatically.
- Cache frequent prompts to reduce latency.

## Documentation
- Document prompt purposes, inputs, and expected outputs.
- Maintain a registry of prompt versions and test results.
- Update documentation with PRD or project changes.

## Ownership
- **AI Team**: Designs and refines prompts.
- **Product Team**: Defines prompt goals and metrics.
- **QA Team**: Validates prompt quality and alignment.
- **DevOps Team**: Monitors performance and integration.

## References
- **PRD Sections**: 6 (Requirements), 8.4 (AI Integration), 12 (Metrics), 17 (Enhancements).
- **Standards**: Emphasize PRD precedence, resonance, and efficiency.

---

**Created**: June 19, 2025
**Version**: 1.0.0
