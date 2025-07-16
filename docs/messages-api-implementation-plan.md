# Messages API & Data Model Implementation Plan

---

## Purpose & Strategic Goals

This document outlines the implementation plan for the CanAI Platform's **Messages API** and supporting data model. It is designed to:
- Align with PRD Section 6.1 and the 9-stage user journey (F1–F9)
- Support both current trust indicator messaging and future user/system messaging features
- Ensure security, compliance, and extensibility
- Serve as a living reference for TaskMaster Task 13.1 and all related future work

---

## TaskMaster Tasks & Deliverables

### **Current Tasks**
- **Task 13.1:** Design and implement message data model with database schema
  - Create the `messages` table in Supabase with all required fields
  - Implement migration scripts and indexes
  - Define model validation rules and connection setup
- **Task 13.2+ (Planned):**
  - Implement repository/data access layer
  - Build API endpoints (GET/POST /v1/messages)
  - Integrate analytics, caching, and error handling
  - Add comprehensive tests and documentation

### **Key Deliverables**
- New `messages` table migration (Supabase SQL)
- Joi validation schema for message objects
- API contract documentation (input/output, error structure)
- Integration with caching, analytics, and security middleware
- Test plan and coverage for all endpoints and edge cases
- Living documentation (this file)

---

## PRD & User Journey Alignment

- **PRD Section 6.1:** Requires robust messaging infrastructure for trust indicators and future user/system messages
- **API Contract:** Supports rich message objects (id, text, author, type, timestamps, emotional tone, trust score, etc.)
- **Security & Compliance:** Enforces RLS, validation, sanitization, and GDPR/CCPA data retention
- **Performance:** Indexed for <200ms API responses, 5-min cache TTL
- **Extensibility:** Schema supports testimonials, trust indicators, user-to-user, and system notifications

---

## Implementation Plan (Strategic & Future-Proofed)

### 1. **Schema & Migration**
- Design `messages` table with fields:
  - `id` (UUID, PK)
  - `text` (TEXT, required)
  - `author` (TEXT, optional)
  - `sender_id` (UUID, FK to users, nullable)
  - `recipient_id` (UUID, FK to users, nullable)
  - `type` (ENUM: 'testimonial', 'trust_indicator', 'sample_preview', 'success_story', 'user_message', 'system_notification')
  - `emotional_tone` (ENUM: 'warm', 'bold', 'optimistic', 'inspirational', etc.)
  - `trust_score_context` (NUMERIC, optional)
  - `location` (TEXT, optional)
  - `status` (ENUM: 'active', 'archived', 'deleted')
  - `created_at` (TIMESTAMPTZ, default now())
  - `updated_at` (TIMESTAMPTZ, default now())
- Add indexes for sender_id, recipient_id, type, created_at
- Enable Row Level Security (RLS) and create policies
- Document migration in `/backend/supabase/migrations/`

### 2. **Validation & Sanitization**
- Define Joi schema for all message fields
- Integrate with centralized validation and sanitization middleware (Joi + DOMPurify)
- Ensure all string fields are sanitized for XSS and injection
- Follow error handling and logging best practices (see docs/task-9-input-validation-middleware.md)

### 3. **API Contract & Endpoints**
- Document input/output schemas for GET/POST /v1/messages
- Implement endpoints in `backend/routes/messages.js`
- Ensure response structure matches contract in `docs/api-contract-specification.md`
- Add caching (5-min TTL) and analytics event logging (PostHog)
- Implement comprehensive error handling and rate limiting

### 4. **Testing & Documentation**
- Create/extend test plan for all endpoints, including edge cases and malicious payloads
- Use Vitest for integration and unit tests
- Assert on validation, sanitization, analytics, and error handling
- Update this document and related docs after each major step

### 5. **Security, Compliance, & Observability**
- Enforce RLS and access policies in Supabase
- Log all validation and error events to PostHog/Sentry
- Ensure GDPR/CCPA compliance (24-month purge, consent tracking)
- Monitor cache hit/miss, API latency, and error rates

### 6. **Future-Proofing & Extensibility**
- Design schema to support:
  - User-to-user and system messages
  - Rich content (attachments, reactions, threading)
  - Internationalization (i18n)
  - Auditing and moderation workflows
- Document all assumptions and open questions for future review

---

## References & Related Documentation
- PRD.md (Section 6.1, 8.4, 12)
- docs/api-contract-specification.md
- docs/data-model-schema.md
- docs/validation-rules.md
- docs/task-9-input-validation-middleware.md
- backend/schemas/messages.js
- backend/routes/messages.js
- backend/supabase/migrations/
- .cursor/rules/canai-structure-rules.mdc

---

**This document is a living guide. Update after each major implementation or discovery.**