# Change Management and Versioning Matrix - CanAI Emotional Sovereignty Platform

## Purpose

Manages updates to code, schemas, and prompts for traceability. Prevents untracked changes by
enforcing PRD versioning rules.

## Structure

- **Versioning Scheme**: SemVer for code, DataVer for schemas, prompt versioning.
- **Approval Process**: Solo developer and TaskMaster validation.
- **Changelog Template**: PRD-specified format for changes.
- **Migration Plan**: Schema and API update strategies.

## Versioning Scheme

- **Code**: SemVer (e.g., `v1.0.0`, `v1.1.0`) for backend/frontend.
- **Schemas**: DataVer (e.g., `v1.0`, `v1.1`) for Supabase tables (`databases/migrations/`).
- **Prompts**: Versioned files (e.g., `sparks-v1.js`, `deliverable-v1.js`) in `backend/prompts/`.
- **Releases**: Tagged in Git (e.g., `v1.0.0`).

## Approval Process

- **Solo Developer**: Reviews pull requests, approves changes.
- **TaskMaster**: Validates tasks in CI/CD (`.github/workflows/taskmaster.yml`).
- **Validation**: Automated tests (Jest, Supatest) ensure compliance.

## Changelog Template

**Format**:

```
[Version] - [Date]
* Added: [Feature/Endpoint] ([PRD Section])
* Fixed: [Bug/Issue] ([PRD Section])
* Deprecated: [Old Feature] ([PRD Section])
```

**Examples**:

```
v1.1.0 - 2025-06-16
* Added: POST /v1/consent (PRD 14.1)
* Fixed: POST /v1/stripe-session retry bug (PRD 6.4)
* Deprecated: prompt_logs_v0 (PRD 14)

v1.0.1 - 2025-06-01
* Fixed: GET /v1/messages caching issue (PRD 6.1)
```

## Migration Plan

### Schema Migrations

- Run `databases/migrations/*.sql` in sequence.
- Example: Add `trust_score` to `initial_prompt_logs` (`v1.1`).
- Backward compatibility: Preserve old columns until deprecated.

### API Migrations

- Redirect deprecated endpoints (e.g., `/v0/messages` to `/v1/messages`).
- Maintain API versioning in `backend/routes/`.

### Prompt Migrations

- Version prompts (e.g., `sparks-v2.js`) in `backend/prompts/`.
- Test new prompts with Jest (`backend/tests/prompts.test.js`).
