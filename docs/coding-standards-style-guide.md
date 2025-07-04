# Coding Standards and Style Guide - CanAI Emotional Sovereignty Platform

## Purpose

Enforces consistent, PRD-compliant code for maintainability. Prevents code variability by
standardizing conventions.

## Structure

- **Naming Conventions**: Variables, files, functions, and SQL.
- **File Structure**: Backend/frontend organization.
- **Linter Configs**: ESLint, Prettier settings.
- **PRD Examples**: Good/bad code snippets for key stages.

## Naming Conventions

- **Variables/Functions**: camelCase (e.g., `trustScore`, `generateSparks`).
- **Files**: kebab-case (e.g., `generate-sparks.js`, `funnel.html`).
- **SQL**: snake_case (e.g., `prompt_logs`, `trust_score`).
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_SPARK_ATTEMPTS`).

## File Structure

### Backend

- `backend/routes/`: API routes (e.g., `sparks.js`).
- `backend/services/`: Integration logic (e.g., `gpt4o.js`).
- `backend/middleware/`: Auth, validation (e.g., `rateLimit.js`).
- `backend/webhooks/`: Make.com handlers (e.g., `add_project.js`).
- `backend/prompts/`: GPT-4o prompts (e.g., `sparks.js`).
- `backend/tests/`: Jest/Supatest tests.

### Frontend

- `frontend/public/`: Static assets (e.g., `funnel.html`).
- `frontend/src/`: JS/TS logic (e.g., `cms.js`).
- `frontend/src/cms/`: Webflow CMS content.

### Database

- `databases/migrations/`: Schema scripts.
- `databases/cron/`: Purging jobs.
- `databases/seed/`: Test data.

## Linter Configs

### ESLint (.eslintrc.js)

- **Base**: Airbnb style guide.
- **Extensions**: TypeScript, `no-console`, `no-unused-vars`.
- **Rules**:
  - `indent`: [2, 2]
  - `quotes`: [2, 'single']

### Prettier (.prettierrc)

- **Indent**: 2 spaces.
- **Quotes**: Single quotes.
- **Trailing commas**: ES5.
- **Semi-colons**: True.

## PRD Examples

### Good (F3 Spark Generation)

```typescript
/** Generates sparks */
async function generateSparks(req: Request, res: Response): Promise<void> {
  const { businessType, tone } = req.body;
  const sparks = await gpt4oService.generateSparks({ businessType, tone });
  res.status(200).json({ sparks, error: null });
}
```

### Bad (F3 Spark Generation)

```javascript
function SPARKS(req, RES) {
  console.log(REQ.body.BUSINESSTYPE);
  RES.send({ data: 'sparks' });
}
```

### Good (F7 Deliverable Generation)

```typescript
/** Generates deliverable */
async function generateDeliverable(req: Request, res: Response): Promise<void> {
  const { product_track, businessDescription } = req.body;
  const output = await gpt4oService.generateDeliverable({
    product_track,
    businessDescription,
    tone: 'warm',
  });
  await humeService.validateResonance(output);
  res.status(200).json({ canaiOutput: output, error: null });
}
```

### Bad (F7 Deliverable Generation)

```javascript
function DELIVERABLE(REQ) {
  return REQ.body.output;
}
```
