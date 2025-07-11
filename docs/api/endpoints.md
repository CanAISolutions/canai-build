# API Authentication Requirements (PRD Aligned)

## Authentication Middleware

- **Production**: All protected endpoints require a valid Memberstack JWT in the
  `Authorization: Bearer <token>` header.
- **Non-Production**: Authentication is bypassed for testing.
- **Error Responses**:
  - `401 Unauthorized` if the header is missing, malformed, or the token is invalid/expired.
- **PRD Alignment**: F2 (Discovery Funnel), F4 (Purchase Flow), F5 (Input Collection)

## Example Request

```http
GET /api/protected-endpoint
Authorization: Bearer <memberstack-jwt>
```

## Example Error Response

```json
{
  "error": "Missing or invalid Authorization header"
}
```

## Notes

- The backend verifies JWTs using Memberstack's JWKS endpoint.
- On success, user info is attached to `req.user` for downstream use.

# API Endpoints

## Payment Analytics Endpoint (MVP)

### GET /v1/stripe/payment-logs/analytics

Returns payment analytics for the requesting user (or all users if admin, once RLS is updated).

**Query Parameters:**

- `user_id` (optional, string): Filter by user (required for non-admins; admins can omit to get all
  data)
- `from` (optional, ISO date): Start date for analytics window
- `to` (optional, ISO date): End date for analytics window

**Authentication:**

- Requires JWT (Memberstack)
- RLS enforced: users see only their data; admins see all (pending RLS update)

**Response:**

```json
{
  "totalRevenue": 1234.56,
  "totalRefunds": 78.90,
  "eventCounts": {
    "payment_intent.succeeded": 10,
    "refund.created": 2,
    ...
  },
  "error": null
}
```

**MVP Scope:**

- Only basic aggregation (total revenue, refunds, event counts)
- No advanced analytics or PostHog integration
- Admin access to all data pending RLS policy update

---

### POST /v1/messages (Planned/Experimental)

- Accepts: { messageText: string (required, 1-1000), subject: string (optional, max 200), user_id:
  uuid (required) }
- Returns: 501 Not Implemented (stub for future user messaging)
- Validation and sanitization are enforced, but the endpoint is not yet active.
