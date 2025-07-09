# Task 8 Implementation Plan: Memberstack Authentication Middleware (MVP)

---

## Pre-Implementation Checklist

Before starting any phase of Task 8, ensure the following are addressed:

- [ ] **JWT validation logic is strict** (issuer, audience, algorithm, expiration).
- [ ] **Token refresh endpoint is rate-limited and protected** (no open abuse vectors).
- [ ] **HTTPS enforcement is tested** in all environments (including behind proxies).
- [ ] **CORS settings are tested** for all expected origins and methods.
- [ ] **Role mapping is up-to-date** with current Memberstack fields/roles.
- [ ] **Make.com signature verification** is covered by integration tests.
- [ ] **All error codes and responses are documented** and human-readable.
- [ ] **Logging is enabled** for all authentication events and errors (success and failure).
- [ ] **Dependencies are up-to-date** and checked for vulnerabilities (npm audit, Dependabot).
- [ ] **Integration/regression tests are planned** for all protected routes and edge cases.
- [ ] **Out of Scope/MVP Only:** No analytics, no advanced refresh, no non-Make.com automations.

---

## Purpose & PRD Alignment

Establish a secure, robust, and PRD-aligned authentication layer for both frontend and Make.com
automation flows using Memberstack JWTs. This plan is strictly MVP-focused and maps directly to
PRD.md requirements for authentication, automation, and user journey support (F1–F9).

- **PRD.md References:**
  - Section 6: User Journey (F1–F9)
  - Section 8.3, 8.5: Automation & Integration
  - Section 14: Security & Compliance

---

## MVP Scope & Out of Scope

**In Scope:**

- Authenticate all protected backend routes using Memberstack JWTs
- Support both frontend and Make.com automation requests
- Implement role-based access control (RBAC) for user journey stages
- Map Memberstack user fields/roles to backend and automation needs
- Enforce CORS and security headers for all relevant origins
- Comprehensive error handling and logging
- Token refresh logic for expired tokens
- HTTPS enforcement for all communications
- Logging of authentication events for monitoring
- Guidance on regular dependency updates

**Out of Scope:**

- No future analytics integrations
- No non-Make.com automations
- No advanced token refresh flows beyond basic implementation
- No speculative features or endpoints

---

## Architecture Overview

- **Unified Middleware:** Accepts JWTs from both frontend (`Authorization`) and Make.com
  (`x-memberstack-token`)
- **Dual Auth Router:** Detects request source and applies correct middleware
- **CORS:** Multi-origin, credentialed, secure
- **RBAC:** Role-based scenario and route access
- **Error Handling:** Structured codes, Sentry/PostHog logging
- **Health Checks:** `/health` endpoint for Memberstack and Make.com
- **Token Refresh:** Mechanism to handle expired tokens
- **HTTPS Enforcement:** Ensures all communications are secure
- **Authentication Event Logging:** Monitors successful authentications
- **Dependency Management:** Regular updates for security

---

## CORS Configuration & Rationale (Task 8.5)

To ensure secure, PRD-aligned integration between the frontend, Memberstack authentication, and
Make.com automations, the backend now enforces a robust CORS (Cross-Origin Resource Sharing) policy:

- **Only trusted origins are allowed:**
  - Origins are defined in the `CORS_ORIGIN` environment variable (comma-separated list, see
    `.env.example`).
  - Requests from unlisted origins are blocked with a clear error message and logged for monitoring.
- **Credentialed and preflight requests are supported:**
  - `credentials: true` is set for all CORS requests, enabling secure authentication flows.
  - All required methods and headers are allowed, and preflight (OPTIONS) requests are handled for
    every protected endpoint.
- **Error handling and logging:**
  - CORS violations return actionable error messages and are logged for observability and
    compliance.
- **Configuration and updates:**
  - To update allowed origins, modify `CORS_ORIGIN` in your environment config and restart the
    backend.
  - See `docs/api/README.md` for full documentation and rationale.

**References:**

- [Task 8.5 CORS Implementation Plan](./task-8.5-cors-implementation-plan.md)
- [Backend API CORS Documentation](./api/README.md)
- [PRD.md Sections 6, 8.3, 8.5, 14]

---

## Implementation Phases & Phase Gates

### 1. JWT Authentication Middleware

> **Phase Gate: Before you start:**
>
> - Confirm you have the latest Memberstack JWKS endpoint and understand how JWKS works for key
>   rotation.
> - Review PRD requirements for token validation (issuer, audience, algorithm, expiration).
> - Plan error handling and logging for both success and failure.
> - Ensure no analytics or non-Make.com automations are added (MVP only).

#### JWKS (JSON Web Key Set) for Key Rotation

Memberstack may rotate their JWT signing keys. To ensure your authentication middleware always uses
the correct key, implement JWKS fetching and caching. This approach automatically retrieves the
current keys from Memberstack's JWKS endpoint, matches the JWT's `kid` to the correct key, and uses
that for verification—no redeploys required.

#### Success Criteria

- Middleware validates JWTs strictly (signature, issuer, audience, expiration) using JWKS.
- Automatically handles key rotation without redeploys.
- Invalid tokens are rejected with clear error codes and logs.
- Successful authentications are logged (PostHog/Sentry).
- No analytics or out-of-scope features are present.

```javascript
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://api.memberstack.com/.well-known/jwks.json', // Replace with actual endpoint
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000, // 10 minutes
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const memberstackMiddleware = (req, res, next) => {
  const token = req.headers['x-memberstack-token'] || req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res
      .status(401)
      .json({ error: 'Missing authentication token', code: 'AUTH_TOKEN_MISSING' });
  }
  jwt.verify(
    token,
    getKey,
    { algorithms: ['RS256'], issuer: 'memberstack.com' },
    (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired', code: 'AUTH_TOKEN_EXPIRED' });
        }
        return res.status(403).json({ error: 'Invalid token', code: 'AUTH_TOKEN_INVALID' });
      }
      req.memberstackUser = decoded;
      // Log successful authentication
      postHog.capture({
        distinctId: decoded.id,
        event: 'auth_success',
        properties: { userId: decoded.id, timestamp: new Date().toISOString() },
      });
      next();
    }
  );
};
```

### 2. Make.com Signature Verification Middleware

> **Phase Gate: Before you start:**
>
> - Confirm Make.com signature verification logic matches current Make.com documentation.
> - Plan integration tests for signature verification.
> - Ensure error handling and logging are in place.

#### Success Criteria

- All Make.com requests are verified for signature and timestamp.
- Invalid signatures are rejected with clear error codes and logs.
- No analytics or out-of-scope features are present.

```javascript
const makeAuthMiddleware = (req, res, next) => {
  const signature = req.headers['x-make-signature'];
  const timestamp = req.headers['x-make-timestamp'];
  const secret = process.env.MAKE_WEBHOOK_SECRET;
  const isValid = verifyMakeSignature(signature, req.body, timestamp, secret); // Custom verification function
  if (!isValid) {
    return res
      .status(403)
      .json({ error: 'Invalid Make.com signature', code: 'MAKE_SIGNATURE_INVALID' });
  }
  next();
};
```

### 3. Dual Authentication Router

> **Phase Gate: Before you start:**
>
> - Ensure router logic is clear and does not introduce ambiguity between frontend and Make.com
>   flows.
> - Plan for integration tests covering both request types.

#### Success Criteria

- Router correctly applies the appropriate middleware for each request type.
- All protected routes are covered by at least one authentication method.

```javascript
const authenticationRouter = require('express').Router();
authenticationRouter.use(async (req, res, next) => {
  const isMakeRequest = !!req.headers['x-make-signature'];
  if (isMakeRequest) {
    return makeAuthMiddleware(req, res, next);
  }
  return memberstackMiddleware(req, res, next);
});
app.use('/api/v1', authenticationRouter);
```

### 4. CORS Configuration

> **Phase Gate: Before you start:**
>
> - List all expected origins and methods.
> - Plan CORS regression tests for all flows.

#### Success Criteria

- Only allowed origins can access protected endpoints.
- CORS preflight and credentialed requests work for all supported clients.

```javascript
const cors = require('cors');
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://us1.make.com',
      'https://eu1.make.com',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Authorization', 'x-memberstack-token', 'x-make-signature', 'x-make-timestamp'],
  credentials: true,
  maxAge: 86400,
};
app.use(cors(corsOptions));
```

### 5. User Field & Role Mapping

> **Phase Gate: Before you start:**
>
> - Confirm Memberstack roles/fields are up-to-date and documented.
> - Plan tests to fail if expected fields are missing.

#### Success Criteria

- User context is extracted and mapped for all downstream needs.
- Role-based access control is possible for all protected routes.

```javascript
const mapUserForAutomation = memberstackUser => ({
  userId: memberstackUser.id,
  email: memberstackUser.email,
  roles: memberstackUser.roles || [],
  customFields: memberstackUser.customFields || {},
});
```

### 6. Role-Based Scenario Access

> **Phase Gate: Before you start:**
>
> - Document all scenario permissions and required roles.
> - Plan tests for all RBAC scenarios.

#### Success Criteria

- RBAC logic enforces correct permissions for all scenarios.
- Unauthorized access is rejected with clear error codes and logs.

```javascript
const scenarioPermissions = {
  admin_add_project: ['admin'],
  add_project: ['admin', 'user'],
};
const checkScenarioAccess = (user, scenarioName) => {
  const userRoles = user.roles;
  const requiredRoles = scenarioPermissions[scenarioName];
  return userRoles.some(role => requiredRoles.includes(role));
};
```

### 7. Error Handler & Logging

> **Phase Gate: Before you start:**
>
> - Plan for centralized logging (Sentry/PostHog) for all errors and events.
> - Document all error codes and expected responses.

#### Success Criteria

- All errors are logged and surfaced with actionable codes.
- No silent failures; all error paths are covered.

```javascript
const handleError = (error, res) => {
  const errorCodes = {
    AUTH_TOKEN_MISSING: 401,
    AUTH_TOKEN_INVALID: 403,
    AUTH_TOKEN_EXPIRED: 401,
    MAKE_SIGNATURE_INVALID: 403,
    PERMISSION_DENIED: 403,
  };
  const status = errorCodes[error.code] || 500;
  res.status(status).json({ error: error.message, code: error.code });
  // Log to PostHog
  postHog.capture({
    distinctId: 'system',
    event: 'error_occurred',
    properties: { code: error.code, message: error.message },
  });
  // Log to Sentry
  Sentry.captureException(error, { tags: { source: 'authentication' } });
};
```

### 8. Rate Limiting (with Webhook Exception)

> **Phase Gate: Before you start:**
>
> - Ensure rate limiting does not block Make.com automations.
> - Plan tests for both normal and webhook flows.

#### Success Criteria

- Rate limiting is enforced for all endpoints except Make.com webhooks.
- No legitimate automation is blocked.

```javascript
const rateLimit = require('express-rate-limit');
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  skip: req => !!req.headers['x-make-signature'],
});
app.use('/api/v1', rateLimiter);
```

### 9. Health Check Endpoint

> **Phase Gate: Before you start:**
>
> - Plan health checks for both Memberstack and Make.com connectivity.
> - Document expected health check responses.

#### Success Criteria

- Health endpoint accurately reflects service status.
- Fails gracefully and logs errors if dependencies are down.

```javascript
app.get('/health', async (req, res) => {
  try {
    await checkMemberstackHealth(); // Custom function to ping Memberstack API
    await checkMakeWebhookHealth(); // Custom function to verify Make.com connectivity
    res.json({ status: 'healthy', services: { memberstack: 'ok', make: 'ok' } });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});
```

### 10. Token Refresh Logic

> **Phase Gate: Before you start:**
>
> - Ensure refresh endpoint is rate-limited and protected.
> - Plan for error handling and logging on refresh failures.

#### Success Criteria

- Expired tokens can be refreshed securely.
- Refresh failures are logged and surfaced with clear errors.

```javascript
const refreshToken = async refreshToken => {
  try {
    const response = await fetch('https://auth.memberstack.com/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) throw new Error('Token refresh failed');
    const { accessToken } = await response.json();
    return accessToken;
  } catch (error) {
    throw new Error('Token refresh failed');
  }
};

// Example endpoint for token refresh
app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const newToken = await refreshToken(refreshToken);
    res.json({ accessToken: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Token refresh failed' });
  }
});
```

### 11. HTTPS Enforcement

> **Phase Gate: Before you start:**
>
> - Test HTTPS enforcement in all deployment environments (including behind proxies).
> - Document proxy settings if needed (e.g., Express trust proxy).

#### Success Criteria

- All HTTP requests are redirected to HTTPS.
- No sensitive data is exposed over insecure channels.

```javascript
const enforceHttps = (req, res, next) => {
  if (req.secure) {
    next();
  } else {
    res.redirect(`https://${req.headers.host}${req.url}`);
  }
};
app.use(enforceHttps);
```

---

## Testing & Validation Checklist

- [ ] JWT verification uses JWKS and supports key rotation without redeploys
- [ ] Valid JWT (frontend, Make.com)
- [ ] Invalid JWT (frontend, Make.com)
- [ ] Expired JWT
- [ ] Token refresh logic for expired tokens
- [ ] CORS preflight and credentialed requests
- [ ] Role-based access for each scenario
- [ ] Error response structure and logging
- [ ] Health check endpoint returns correct status
- [ ] Rate limiting works, but skips Make.com webhooks
- [ ] User field/role mapping for all automations
- [ ] HTTPS enforcement for all communications
- [ ] Authentication event logging (success and failure)
- [ ] **Integration/Regression Testing:**
  - [ ] Test new authentication code with all existing protected routes to ensure no regressions.
  - [ ] Validate that changes do not break unrelated features (e.g., payment, analytics, etc.).
  - [ ] Run full test suite after any middleware/auth changes.

---

## Best Practices / Nuggets of Gold

- **Unified Middleware:** Accept JWTs from both frontend and Make.com for simplicity and
  maintainability.
- **Signature Verification:** Always verify Make.com requests with a shared secret.
- **Explicit Error Codes:** Use structured error codes for easier debugging and automation retries.
- **Role-Based Access:** Map roles to scenario permissions for security and clarity.
- **Rate Limiting Exception:** Never block Make.com automations with rate limiting.
- **Health Checks:** Monitor both Memberstack and Make.com connectivity.
- **Field Mapping:** Standardize user data for automation compatibility.
- **Centralized Logging:** Use Sentry/PostHog for all error and event logging.
- **Token Refresh:** Implement basic token refresh to handle expired tokens gracefully.
- **HTTPS Enforcement:** Ensure all communications are secure with HTTPS.
- **Dependency Updates:** Regularly update dependencies to patch vulnerabilities.

---

## Known Pitfalls & Gotchas

- **Missing CORS Headers:** Will break Make.com or frontend requests.
- **Not Skipping Rate Limiting for Webhooks:** Can cause automation failures.
- **Forgetting to Map All Required Fields:** Leads to automation bugs.
- **Not Handling All Error Codes:** Makes debugging and support harder.
- **Scope Creep:** Stick to MVP—avoid adding analytics, advanced refresh, or non-Make.com
  automations.
- **No Token Refresh:** Users will lose sessions without refresh logic.
- **Insecure Connections:** Lack of HTTPS enforcement risks data exposure.

---

## References

- PRD.md (Sections 6, 8.3, 8.5, 14)
- Task8-Supplement.md (for rationale, code samples, and deeper context)
- Make.com scenario JSONs (add_client, add_project, admin_add_project, SAAP Update Project
  Blueprint)
- Memberstack JWT documentation

---

## Maintenance Notes

- **Dependency Updates:** Regularly run `npm audit` or use tools like Dependabot to identify and
  patch vulnerabilities in dependencies. Schedule monthly reviews to ensure the system remains
  secure.

---

## Environment Variables: Memberstack Integration

To securely connect your backend to Memberstack, configure the following environment variables in
your `.env` file. **Never commit real secrets to version control.**

### Required Variables

| Variable Name            | Description                               |
| ------------------------ | ----------------------------------------- |
| `MEMBERSTACK_PUBLIC_KEY` | Memberstack Public API Key                |
| `MEMBERSTACK_SECRET_KEY` | Memberstack Secret API Key                |
| `MEMBERSTACK_APP_ID`     | Memberstack Application ID                |
| `MEMBERSTACK_JWKS_URI`   | JWKS endpoint for JWT validation          |
| `MEMBERSTACK_ISSUER`     | JWT issuer (default: `memberstack.com`)   |
| `MEMBERSTACK_AUDIENCE`   | JWT audience (if required by your config) |

### Example `.env` File Block

```env
# Memberstack API Keys (do not use real values here)
MEMBERSTACK_PUBLIC_KEY=your-public-key-here
MEMBERSTACK_SECRET_KEY=your-secret-key-here
MEMBERSTACK_APP_ID=your-app-id-here

# JWT Validation
MEMBERSTACK_JWKS_URI=https://api.memberstack.com/.well-known/jwks.json
MEMBERSTACK_ISSUER=memberstack.com
# MEMBERSTACK_AUDIENCE=your-audience-here   # Only set if required
```

**Security Notes:**

- **Never** share your Secret Key publicly or commit it to a repository.
- Use different keys for Test and Live modes. Update your `.env` when switching environments.
- Rotate your Secret Key if you suspect it has been exposed.

### Where to Find These Values

- **Public Key, Secret Key, App ID:**
  - Found in the Memberstack dashboard under **Dev Tools > API Keys** and **Application ID**.
  - Make sure you are in the correct mode (Test or Live) when copying these values.
- **JWKS URI:**
  - Use the default: `https://api.memberstack.com/.well-known/jwks.json`
- **Issuer/Audience:**
  - Use the defaults unless your Memberstack config specifies otherwise.

### Best Practices for Future Developers

- Always use environment variables for secrets and configuration.
- Document the location of these values in the Memberstack dashboard.
- Add a `.env.example` file (with placeholder values) to the repo for onboarding.
- Remind developers to update keys when switching between Test and Live modes.
- Never log or expose the Secret Key in application logs or error messages.

---

**Last updated:** 2025-07-04
