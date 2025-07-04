# CanAI Emotional Sovereignty Platform - Documentation README

## Overview

The `/docs/` folder contains the nine essential Cursor Production Documents for the CanAI Emotional
Sovereignty Platform, a SaaS solution delivering AI-driven, emotionally intelligent outputs (e.g.,
business plans, social media strategies, website audits) for small business owners and solopreneurs.
These documents provide a comprehensive, production-ready framework to guide Cursor AI and
TaskMaster in building the platform, ensuring alignment with the Product Requirements Document (PRD)
and achieving goals of TrustDelta ≥4.2, emotional resonance >0.7, and 99.9% uptime.

The documents are designed to prevent drift, hallucinations, scope creep, or project failure by
offering clear, structured guidance for all aspects of the platform, including architecture, APIs,
data models, testing, and deployment. They are the authoritative guides for development, distinct
from the PRD, which resides in `/requirements/prd.md`.

## Purpose

This folder houses the following documents to support Cursor AI in executing the CanAI build:

- **Technical Architecture Document**: Defines the platform's architecture, tech stack, and
  integration flows.
- **API Contract Specification**: Documents all API endpoints, schemas, and integration details.
- **Data Model and Schema Definition**: Specifies Supabase schemas, relationships, and RLS policies.
- **Supabase Frontend Integration Guide**: Step-by-step instructions for integrating Supabase with
  the React/Vite frontend.
- **Prompt Engineering Templates**: Standardizes GPT-4o prompts for emotionally resonant outputs.
- **Test Case Specification**: Outlines tests for functionality, performance, and quality assurance.
- **Coding Standards and Style Guide**: Enforces consistent code conventions for maintainability.
- **Deployment and Operations Playbook**: Guides deployment, CI/CD, and production operations.
- **Risk and Assumption Log**: Tracks risks and assumptions with mitigation strategies.
- **Change Management and Versioning Matrix**: Manages updates to code, schemas, and prompts.

These documents ensure Cursor AI can comprehend and fluently implement the platform's requirements,
with no other file types (e.g., code, configs) residing here to maintain clarity.

## Folder Structure

```
/docs/
├── README.md                    # This file, providing context for the folder
├── api-contract-specification.md # API endpoints, schemas, and examples
├── change-management-versioning-matrix.md # Versioning and migration plans
├── coding-standards-style-guide.md # Code conventions and linter configs
├── data-model-schema.md         # Supabase schemas and relationships
├── deployment-operations-playbook.md # Deployment and operations procedures
├── prompt-engineering-templates.md # GPT-4o prompt templates
├── risk-assumption-log.md       # Risks, assumptions, and mitigations
├── supabase-frontend-integration.md # Supabase React/Vite integration guide
├── technical-architecture-document-(TAD).md # System architecture and integration flows
└── test-case-specification.md  # Test cases and coverage goals
```

- **File Naming**: Uses kebab-case (per Coding Standards and Style Guide) for consistency.
- **Exclusivity**: Only the nine Markdown documents and this README reside here, ensuring focus.
- **PRD Separation**: The PRD is stored in `/requirements/prd.md` to distinguish it as the
  foundational requirements document.

## Usage

### For Developers

- **Access**: Review these documents to understand the platform's architecture, APIs, and
  operational requirements before starting development.
- **Reference**: Use as the primary guide for implementing features, testing, and deploying the
  platform, ensuring alignment with the PRD.
- **Updates**: Follow the Change Management and Versioning Matrix
  (`change-management-versioning-matrix.md`) for modifying documents, ensuring changes are tracked
  and validated via CI/CD (`.github/workflows/docs.yml`).

### For Cursor AI

- **Parsing**: Cursor AI should parse these Markdown files to extract requirements, schemas, and
  prompts for building the platform.
- **TaskMaster Integration**: Tasks in these documents (e.g., T18.1.1 in
  `technical-architecture-document-(TAD).md`) are TaskMaster-compatible, guiding automated build
  processes. Validate tasks in CI/CD (`.github/workflows/taskmaster.yml`).
- **Context**: Treat these documents as the authoritative source for platform implementation,
  cross-referencing with `/requirements/prd.md` for foundational requirements.

## Key Instructions

- **Do Not Modify Directly**: Update documents via pull requests, approved by the solo developer and
  validated by TaskMaster (per `change-management-versioning-matrix.md`).
- **No Additional Files**: Keep `/docs/` exclusive to these files to maintain clarity for Cursor AI.
- **Version Control**: All files are versioned in Git, with releases tagged (e.g., `v1.0.0`) for
  rollback (per `deployment-operations-playbook.md`).

## Related Resources

- **PRD**: Located at `/requirements/prd.md`, defining the platform's requirements and user journey.
- **Codebase**: Implementation files in `/backend/`, `/frontend/`, and `/databases/` (per
  `coding-standards-style-guide.md`).
- **CI/CD Pipelines**: Configured in `.github/workflows/` for build, test, and deploy (per
  `deployment-operations-playbook.md`).
- **TaskMaster Tasks**: Embedded in documents and validated in `.github/workflows/taskmaster.yml`
  (per `change-management-versioning-matrix.md`).
- **Backend Database Utilities**:
  - `backend/db.js` — Direct Postgres client for admin/migration scripts (Node.js only).
  - `backend/supabase/client.js` — Supabase client for RLS-safe CRUD (preferred for app/API logic).

## Contact

For questions or clarifications, contact the solo developer (placeholder for contact details, per
PRD Section 1.4). Issues should be logged in the project's Git repository, with errors tracked via
Sentry (`backend/services/sentry.js`) and analytics via PostHog (`backend/services/posthog.js`).

## Secret Management

For instructions on securely adding API keys and other secrets to Supabase, see the 'Managing
Encrypted Secrets (Supabase Vault)' section in
[project-structure-mapping.md](./project-structure-mapping.md).

## [2025-06-19] Task 5.4 Complete: Prompt Template System

- Implemented modular, PRD-aligned prompt templates for business plans, social media/email
  campaigns, and website audits.
- Added robust input validation, gold standard schemas, and test harnesses for each template.
- See `docs/project-structure-mapping.md` for technical details and file locations.

---

**Update (2025-06-27):**

- Task 5 (GPT-4o Service Integration) and all subtasks (5.1–5.5) are now complete and tested.
- The main and only relevant test file for GPT-4o is `backend/tests/gpt4o.test.js` (all others
  obsolete).
- Task 6 (Hume AI Emotional Resonance Service) is the next major milestone.

---

- GPT-4o service (`backend/services/gpt4o.js`) now uses ES6 export syntax and pino logger for all
  logging (no console.log in production).
- Website audit template (`backend/prompts/websiteAuditTemplate.js`) now validates accessibility by
  checking for color contrast, alt text, heading structure, focus management, and form labels, not
  just keywords.
