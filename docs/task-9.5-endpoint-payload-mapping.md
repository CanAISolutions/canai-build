# Task 9.5 Endpoint & Payload Mapping Guide

## Status Update (2025-07-11)

- **Malicious payload validation now covers:**
  - `/v1/validate-input`:
    - `businessName` (string, required)
    - `businessDescription` (string, required, multi-line)
    - `targetAudience` (string, required)
    - `primaryChallenge` (string, required)
  - `/v1/feedback`:
    - `feedbackText` (string, required, user-generated)
  - `/v1/request-revision`:
    - `revisionReason` (string, required, user-generated)
- **Test suite:**
  - 102 tests (17 payloads × 6 fields) for `/v1/validate-input`, `/v1/feedback`, and
    `/v1/request-revision`.
  - All tests pass: every payload is either blocked (400) or sanitized (response value not equal to
    raw payload).
- **Logging:**
  - All requests and responses are logged for evidence-based debugging.
- **Next step:**
  - Review `/v1/messages` endpoint (fields: `messageText`, `subject`, etc.) for user-generated input
    requiring coverage.

---

**If you see 404 errors, check that the test targets the correct endpoint path.**

---

_Last updated: 2025-07-11_
