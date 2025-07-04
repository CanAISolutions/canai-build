# Prompt Engineering Templates - CanAI Emotional Sovereignty Platform

## Purpose

Standardizes GPT-4o prompts for emotionally resonant outputs, guiding Cursor AI to generate
PRD-compliant content. Prevents AI hallucination by providing precise, constrained prompts.

## Structure

- **Task Goals**: Objectives for each AI-driven stage (F2, F3, F6, F7).
- **Prompt Structures**: Templates with placeholders and constraints.
- **Context Links**: PRD and API spec references.
- **Example Outputs**: PRD-aligned samples for each stage.

## Task Goals

- **F2 (Discovery Funnel)**: Validate inputs for clarity, compute trust score (0–100%).
- **F3 (Spark Layer)**: Generate three spark concepts with emotional resonance (valence >0.6).
- **F6 (Intent Mirror)**: Summarize inputs with >85% confirmation rate.
- **F7 (Deliverable Generation)**: Produce deliverables (e.g., 700–800-word plans) with emotional
  resonance >0.7.

## Prompt Structures

### F2 Validation

```
Validate inputs: businessType=[businessType], primaryChallenge=[primaryChallenge], preferredTone=[preferredTone], desiredOutcome=[desiredOutcome]. Provide feedback and a trust score (0–100%). Output: JSON { "feedback": string, "trustScore": number }. Constraints: <300 tokens, no external data.
```

### F3 Spark Generation

```
Generate three spark concepts for a [businessType] facing [primaryChallenge] with [preferredTone] tone, targeting [desiredOutcome]. Ensure emotional resonance (Hume AI: valence >0.6). Output: JSON { "sparks": [{ "title": string, "tagline": string }] }. Constraints: <500 tokens, no external data.
```

### F6 Intent Mirror

```
Summarize inputs: [12-field inputs]. Generate a concise summary reflecting user intent with [preferredTone] tone. Include confidence score (0.0–1.0). Output: JSON { "summary": string, "confidence": number }. Constraints: <400 tokens, no external data.
```

### F7 Deliverable Generation

```
Generate a [product_track] deliverable (e.g., 700–800-word business plan) for [businessType] with [businessDescription], [revenueModel], and [competitors]. Use [preferredTone] tone. Include financial projections and local context (e.g., [location]). Ensure emotional resonance (Hume AI: valence >0.7, arousal >0.5). Output: text. Constraints: <2000 tokens, no external data.
```

## Context Links

- **PRD**: `/docs/prd.md` (Sections 6.1–6.9)
- **API Spec**: `/docs/api-contract.md` (`/v1/validate-input`, `/v1/generate-sparks`,
  `/v1/intent-mirror`, `/v1/deliverable`)

## Example Outputs

### F2 Validation

- **Input**: `businessType=retail, primaryChallenge=Need $75k, preferredTone=warm`
- **Output**:

  ```json
  { "feedback": "Clear funding goal!", "trustScore": 85 }
  ```

### F3 Spark

- **Input**:
  `businessType=retail, primaryChallenge=funding, preferredTone=warm, desiredOutcome=secure funding`
- **Output**:

  ```json
  {
    "sparks": [
      {
        "title": "Community Spark",
        "tagline": "Unite Denver families with a cozy bakery"
      }
    ]
  }
  ```

### F6 Intent Mirror

- **Input**:
  `businessType=retail, businessDescription=Artisanal bakery in Denver, preferredTone=warm`
- **Output**:

  ```json
  {
    "summary": "Launch a warm, community-focused bakery in Denver",
    "confidence": 0.9
  }
  ```

### F7 Deliverable

- **Input**:
  `product_track=business_builder, businessType=retail, businessDescription=Sprinkle Haven Bakery, preferredTone=warm, location=Denver`
- **Output**:

  ```
  Sprinkle Haven Bakery Business Plan: A warm, community-focused bakery in Denver’s LoHi, targeting $75k funding with artisan pastries…
  ```
