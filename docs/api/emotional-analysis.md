# Emotional Analysis API

## Overview

This API provides endpoints for analyzing the emotional resonance of text using Hume AI and a GPT-4o
fallback. It supports the CanAI Emotional Sovereignty Platform's F6 (Intent Mirror), F7 (Deliverable
Generation), and F8 (SparkSplit) stages, and aligns with PRD Sections 6.6, 6.7, 6.8, 7.1, 7.2, 12,
and 14.1.

---

## POST /v1/analyze-emotion

**Description:** Analyze the emotional resonance of input text using Hume AI or GPT-4o fallback.

- **Request Body:**

  ```json
  {
    "text": "This is a warm and inviting business plan",
    "comparisonId": "uuid"
  }
  ```

- **Response:**

  ```json
  {
    "arousal": 0.7,
    "valence": 0.8,
    "confidence": 0.9,
    "source": "hume",
    "error": null
  }
  ```

- **Error Response:**

  ```json
  {
    "error": "Error message"
  }
  ```

- **Authentication:** Memberstack JWT required (user context)

**User Context Extraction (Task 8.2):** All authenticated requests require a valid Memberstack JWT.
The backend middleware extracts and validates a standardized user context object, available as
`req.memberstackUser`:

```js
{
  userId: <string>,        // Memberstack user ID (required)
  email: <string>,         // User email (required)
  roles: <array>,          // User roles (array, defaults to [])
  customFields: <object>,  // Custom fields (object, defaults to {})
}
```

If any required field is missing or malformed, the API returns:

```json
{
  "error": "Missing or invalid user context",
  "code": "AUTH_USER_CONTEXT_INVALID"
}
```

See backend middleware and Task 8.2 implementation plan for details.

- **Validation:**
  - `text`: string, required, 1-1000 chars
  - `comparisonId`: UUID, required

- **Rate Limiting:** 100 req/min per IP

- **Fallback:** If Hume AI is unavailable or circuit breaker is open, GPT-4o is used

- **PRD Alignment:** F6, F7, F8, 7.2, 14.1

---

## GET /v1/analyze-emotion/status

**Description:** Check the status of the emotional analysis service (admin only).

- **Response:**

  ```json
  {
    "status": "operational",
    "circuitBreakerState": "CLOSED",
    "error": null
  }
  ```

- **Authentication:** Memberstack JWT (admin role required)

- **PRD Alignment:** 7.2, 14.1

---

## Error Codes

- `400 Bad Request`: Invalid input (validation error)
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions (admin required)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Unexpected error or downstream service failure

---

## Example Usage

### Request

```bash
curl -X POST https://api.canai.com/v1/analyze-emotion \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a warm and inviting business plan", "comparisonId": "uuid"}'
```

### Response

```json
{
  "arousal": 0.7,
  "valence": 0.8,
  "confidence": 0.9,
  "source": "hume",
  "error": null
}
```

---

## Notes

- All requests and responses are JSON.
- Input is validated using Joi; errors return a 400 with details.
- Circuit breaker state is reported in the status endpoint.
- All errors are logged to Sentry and PostHog for observability.
- Emotional scores are stored in the `comparisons` table with `emotional_score` and `score_source`
  fields.
- Data is purged after 24 months for GDPR/CCPA compliance.

---

## PRD Alignment

- **F6: Intent Mirror** – Validates emotional resonance for user intent summaries
- **F7: Deliverable Generation** – Ensures deliverables meet emotional thresholds
- **F8: SparkSplit** – Supports comparison of CanAI outputs with emotional resonance scores
- **7.2: Security** – Rate limiting, input validation, and error handling
- **14.1: Compliance** – GDPR/CCPA data retention and privacy

## GDPR/CCPA Data Retention & Purge Policy

To comply with GDPR and CCPA requirements, all user data in the `public.comparisons` table is
automatically deleted after 24 months. This is enforced by a scheduled SQL job
(`databases/cron/purge.sql`) using Supabase's `pg_cron` extension.

The purge job runs daily and removes any records older than 24 months based on the `created_at`
timestamp.

- **Retention Period:** 24 months
- **Data Purged:** All records in `public.comparisons` older than 24 months
- **Scheduling:** Automated via `pg_cron` (see `databases/cron/purge.sql`)
- **Compliance:** Ensures platform meets GDPR/CCPA data minimization and right-to-erasure
  requirements.

For more details or to adjust the retention policy, see the SQL script and Supabase/pg_cron
documentation.

---

## Authentication: Token Refresh Endpoint

### POST /v1/auth/refresh-token

**Purpose:** Refresh a Memberstack JWT using a valid refresh token. Enforces rate limiting and logs
all events/errors to Sentry and PostHog. Follows PRD and MVP requirements for secure session
management.

**Request Body:**

```json
{
  "refreshToken": "<refresh_token_string>"
}
```

**Response (Success):**

```json
{
  "accessToken": "<new_jwt_access_token>"
}
```

**Response (Error):**

```json
{
  "error": "<error_message>",
  "code": "<error_code>"
}
```

**Error Codes:**

- `AUTH_TOKEN_MISSING`: Missing or invalid refresh token in request
- `AUTH_TOKEN_REFRESH_FAILED`: Refresh failed (invalid/expired token, Memberstack API/network error,
  or no accessToken returned)
- `AUTH_INTERNAL_ERROR`: Internal server error during refresh
- `Rate limit exceeded`: Too many requests from the same IP (HTTP 429)

**Logging:**

- All errors and events are logged to Sentry and PostHog using the same conventions as the main
  authentication middleware.

**References:**

- [docs/task-8.3-token-refresh-implementation-plan.md](../task-8.3-token-refresh-implementation-plan.md)
- [docs/task-8-memberstack-auth-middleware.md](../task-8-memberstack-auth-middleware.md)
- PRD.md (Sections 6, 8.3, 8.5, 14)
