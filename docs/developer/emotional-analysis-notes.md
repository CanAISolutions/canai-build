# Emotional Analysis Service – Developer Notes

> **Purpose:** Provide setup, maintenance, and troubleshooting guidance for the Emotional Analysis
> (Hume AI + GPT-4o fallback) service in the CanAI Emotional Sovereignty Platform.

---

## 1. Setup Instructions

### Environment Variables

- `HUME_API_KEY`: Hume AI API key (required)
- `HUME_API_ENDPOINT`: Hume AI API endpoint (default: https://api.hume.ai/v1)
- `HUME_RATE_LIMIT`: Max requests per minute (default: 100)
- `HUME_TIMEOUT`: Hume API timeout in ms (default: 5000)
- `OPENAI_API_KEY`: OpenAI API key for GPT-4o fallback
- `POSTHOG_API_KEY`: PostHog project key for analytics
- `SUPABASE_URL` / `SUPABASE_KEY`: Supabase project credentials
- `SENTRY_DSN` / `SENTRY_ENV`: Sentry error tracking

Add these to `.env` and `.env.example`.

### Keys & Secrets

- Store Hume API key in Supabase vault (`encrypted_keys` table) for secure rotation.
- Rotate keys every 30 days using `KeyManagementService`.

### Sentry & PostHog

- Sentry is initialized in `backend/api/src/instrument.ts`.
- PostHog is used in all analytics and error logging (see `hume.js`, `gpt4oFallback.js`,
  `emotionalScoring.js`).

---

## 2. Key Rotation & Error Handling

### Key Rotation

- Use `KeyManagementService.rotateHumeKey()` to rotate the Hume API key.
- Update the `encrypted_keys` table and environment variable.
- Log rotation events with PostHog (`hume_key_rotated`).

### Error Handling

- All errors are logged to Sentry and PostHog.
- Circuit breaker triggers after 5 failures in 60s; resets after 1 min.
- Fallback to GPT-4o if Hume AI is unavailable or circuit breaker is OPEN.
- All error types and context are logged in `error_logs` (see Supabase schema).

---

## 3. Testing & Troubleshooting

### Testing

- Run unit tests: `npm test` (see `backend/tests/unit/`)
- Run integration tests: `npm test` (see `backend/tests/integration/`)
- Run load tests: `locust -f backend/tests/load/emotionalAnalysis.load.py`
- Coverage report: `backend/coverage/lcov-report/index.html` (target: >80%)

### Troubleshooting

- Check Sentry for error traces.
- Check PostHog for analytics and event logs.
- Use `/v1/analyze-emotion/status` to check service/circuit breaker state.
- Confirm environment variables are set and valid.
- Verify Supabase migrations are applied (see `007_add_emotional_score_to_comparisons.sql`).

---

## 4. Maintenance & Future Enhancements

- **Key Management:** Schedule regular key rotation and monitor for failed rotations.
- **Rate Limits:** Monitor Hume AI usage and adjust `HUME_RATE_LIMIT` as needed.
- **Fallback Logic:** Periodically review GPT-4o fallback accuracy and update prompts if needed.
- **Compliance:** Ensure GDPR/CCPA purge job (`databases/cron/purge.sql`) is enabled and documented.
- **Enhancements:**
  - Add cultural intelligence to emotional analysis (see implementation plan).
  - Integrate user feedback for prompt tuning.
  - Add voice input support in future releases.

---

> For questions or updates, refer to the implementation plan, PRD, or contact the lead developer.
