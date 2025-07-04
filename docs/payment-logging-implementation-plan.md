# Payment Logging to Supabase — Implementation Plan (Task 7.6)

## Progress Log (as of 2025-07-02)

- [x] Database migration applied: `event_type` and `metadata` columns added to `payment_logs`,
      indexes created.
- [x] Backend logging logic updated: `/stripe-session` and `/refund` routes now populate
      `event_type` and `metadata`.
- [x] Log querying/filtering API endpoint implemented and tested (`/payment-logs` with pagination,
      sorting, RLS).
- [x] All existing integration and unit tests for payment logging are passing, including event_type
      and metadata fields.
- [x] Documentation updated: schema snapshot and implementation plan reflect current state.
- [x] Data retention automation implemented: monthly pg_cron job purges payment_logs older than 24
      months (see migration 010 and analytics-implementation-log.md).
- [ ] Analytics aggregation logic and endpoints (future work).

---

**Purpose:** Implement comprehensive payment event logging and audit trail in Supabase, fully
aligned with PRD, F4 Purchase Flow, and compliance requirements. This plan provides a step-by-step
checklist for implementation and verification.

---

## 1. Database Layer

### 1.1. Review/Update `payment_logs` Table

- [x] Confirm all required fields exist:
  - `id`, `user_id`, `amount`, `currency`, `payment_method`, `status`, `stripe_payment_id`,
    `event_type`, `metadata`, `created_at`, `updated_at`
- [x] Ensure audit trail (immutable records, triggers for updates if needed)
- [x] Confirm RLS policies:
  - Users can only access their own logs
  - Admins can access all logs
- [x] Add indexes for `user_id`, `event_type`, `created_at` for query performance
- [x] Document schema and RLS in `docs/project-structure-mapping.md`

---

## 2. Backend Integration

### 2.1. Event Logging

- [x] For every payment event (success, failure, refund, subscription), insert a record into
      `payment_logs`
- [x] Supported event types:
  - `payment_intent.succeeded`, `payment_intent.failed`, `checkout.session.completed`,
    `refund.created`, `subscription.created`, `subscription.updated`, `subscription.canceled`, etc.
- [x] Include all relevant metadata (user, Stripe IDs, amounts, status, error codes if any)
- [x] Ensure idempotency (avoid duplicate logs for retried webhooks)
- [x] Update/implement logic in:
  - `backend/services/stripe.js`
  - `backend/services/stripeCheckout.js`
  - Webhook handlers

### 2.2. Log Querying & Filtering

- [x] Implement backend API/service methods to query/filter logs by user, event type, date, status,
      etc.
- [x] Add pagination and sorting
- [x] Restrict access via RLS and/or backend auth

### 2.3. Analytics Data Collection

- [ ] Aggregate payment data for analytics (total revenue, refunds, churn, etc.)
- [ ] Optionally, log analytics events to PostHog for funnel analysis
- [ ] Expose analytics endpoints or service methods

### 2.4. Data Retention

- [x] Implement retention policy (e.g., archive or purge logs after 24 months)
- [x] Add scheduled job or cron for data retention (Supabase `pg_cron`)
- [x] Document policy in code and `docs/analytics-implementation-log.md`

---

## 3. Testing & Validation

- [x] Simulate all payment flows (success, failure, refund, subscription)
- [x] Verify logs are created with correct data for each event type (manual/initial validation)
- [x] Test log querying and filtering endpoints
- [x] Add/expand integration tests in `backend/tests/integration/` (all passing)
- [x] Add/expand tests to verify correct logging of event_type and metadata for payment and refund
      events
- [ ] Test analytics aggregation endpoints (when implemented)
- [ ] Validate RLS and data retention (when retention is implemented)
- [ ] Document test cases and results

---

## 4. Documentation & Milestone Logging

- [x] Update `docs/project-structure-mapping.md` with new/updated files, schema, and endpoints
- [x] Update `docs/analytics-implementation-log.md` with a milestone entry (date, summary, PRD/rule
      alignment, technical notes)
- [x] Ensure PRD.md and cortex.md reflect payment logging status and coverage
- [x] Reference this plan in future reviews and PRs

---

## 5. Risks & Gaps Checklist

- [x] Idempotency: Stripe webhooks can be retried; must ensure no duplicate logs
- [x] PII/Security: Only log non-sensitive payment metadata; never store full card data
- [ ] Retention: Must align with legal/accounting requirements
- [ ] Testing: Cover all edge cases (partial refunds, failed payments, etc.)

---

## 6. Backend Code Changes for event_type and metadata Logging

### 6.1. Log Payment Event on Checkout Session Creation

- [x] In `backend/routes/stripe.js`, after creating the Stripe session in the `/stripe-session`
      route, insert a new record into `payment_logs` with:
  - `user_id`, `amount`, `currency`, `payment_method`, `status`, `stripe_payment_id`, `event_type`,
    `metadata`, `created_at`, `updated_at`
  - Example:

```js
await supabase.from('payment_logs').insert([
  {
    user_id,
    amount: session.amount_total / 100, // Stripe returns amount in cents
    currency: session.currency,
    payment_method: 'card', // or session.payment_method_types[0]
    status: 'pending',
    stripe_payment_id: session.payment_intent, // or session.id if using session as unique
    event_type: 'checkout.session.created',
    metadata: session, // Store the full session object or a filtered version
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]);
```

### 6.2. Update Refund Logic

- [x] In the `/refund` route, update the log using `stripe_payment_id` (not `stripe_session_id`):

```js
await supabase
  .from('payment_logs')
  .update({
    status: 'refunded',
    event_type: 'refund.created',
    metadata: { ...refund, refund_reason: reason },
    updated_at: new Date().toISOString(),
  })
  .eq('stripe_payment_id', paymentIntentId);
```

### 6.3. Test Impact

- [x] Review and update any test files that mock or assert on payment_logs (integration/unit tests)
      to ensure they account for the new fields (`event_type`, `metadata`).
- [x] Add/expand tests to verify correct logging of event_type and metadata for payment and refund
      events (all passing).

---

**References:**

- [PRD.md](./PRD.md)
- [stripe-payment-strategy.md](./stripe-payment-strategy.md)
- [supabase-schema-snapshot.sql](./supabase-schema-snapshot.sql)
- [project-structure-mapping.md](./project-structure-mapping.md)
- [analytics-implementation-log.md](./analytics-implementation-log.md)

---

**Last updated:** 2025-07-02
