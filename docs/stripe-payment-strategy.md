# Strategic Approach: Stripe Payment Processing Service

## Overview

This document outlines our strategic approach for implementing a secure, scalable, and
production-ready Stripe payment processing service in our Node.js/TypeScript backend. The approach
meets PRD requirements, ensures PCI compliance, and supports the F1-F9 user journey
stages—particularly the F4 Purchase Flow—by providing a reliable and seamless payment experience.
Integration with Make.com workflows, pricing transparency, and robust error handling are key focuses
to enhance user trust and operational efficiency.

---

## 1. Core Service Architecture

- **Service Layer:** Encapsulate all Stripe logic in a dedicated `StripeService` class for
  maintainability and testability.
- **Environment Management:** Use environment variables for all Stripe keys (test/live) and
  configuration. Never hardcode secrets.
- **Type Safety:** Use TypeScript interfaces for all Stripe-related data structures and service
  methods.
- **Dependency Injection:** Inject Supabase client and logger for database logging and
  observability.

---

## 2. Checkout Session Creation

- **Idempotency:** Use idempotency keys for all session and payment operations to prevent duplicate
  charges, critical for user retry scenarios in the F4 Purchase Flow.
- **Metadata:** Attach user ID, product track (e.g., Business Plan Builder), and plan metadata to
  sessions for traceability.
- **Pricing Validation:** Fetch and validate pricing from the backend (`/v1/pricing`) to ensure
  consistency with Webflow CMS-displayed prices (e.g., $99 for Business Plan Builder).
- **Product Tracks:** Configure sessions for specific product tracks: Business Plan Builder ($99),
  Social Media & Email Campaign ($49), and Website Audit & Feedback ($79).
- **Error Handling:** Log errors with context; surface actionable messages (e.g., "Payment failed,
  please retry") to guide users back to the funnel.
- **Success/Cancel URLs:** Use environment-based URLs redirecting to F5 Detailed Input Collection
  (success) or F4 retry (cancel).

---

## 3. Webhook Handling

- **Signature Verification:** Verify Stripe webhook signatures using the secret from environment
  variables.
- **Event Handling:** Implement handlers for:
  - `checkout.session.completed`: Trigger `add_project.json` in Make.com for project setup.
  - `payment_intent.succeeded`, `payment_intent.payment_failed`, `customer.subscription.updated`.
- **Make.com Integration:** Upon `checkout.session.completed`, send data to Make.com via webhook to
  automate workflows (e.g., `add_project.json`).
- **Idempotency:** Ensure handlers are idempotent to avoid duplicate processing.
- **Logging:** Log all events to the `payment_logs` table in Supabase for auditability.

---

## 4. Refund Processing

- **Endpoint Security:** Restrict refund endpoints to authorized users/admins via Memberstack auth.
- **Partial/Full Refunds:** Support both refund types with reason tracking (e.g., "User requested
  product switch").
- **Webhook Integration:** Handle `charge.refunded` and `charge.dispute.created` events from Stripe.
- **Audit Trail:** Log refund actions and statuses in Supabase.

---

## 5. Subscription Management

- **Lifecycle Management:** Support creation, updates, cancellations, and pauses for users requiring
  ongoing services or multiple deliverables.
- **Product Switching:** Allow users to switch product tracks (e.g., from Business Plan Builder to
  Website Audit & Feedback) by:
  - Updating subscriptions (if applicable) with proration.
  - Creating new checkout sessions for one-time purchases of different products.
- **Webhook Events:** Handle `customer.subscription.created`, `updated`, `deleted` for accurate
  state tracking.
- **Proration:** Implement proration logic for mid-cycle plan changes.
- **Status Tracking:** Maintain subscription status in Supabase; note that primary model is one-time
  payments, with subscriptions for extended use cases.

---

## 6. Payment Logging & Analytics

- **Database Schema:** Use a normalized `payment_logs` table with fields: `event_type`, `user_id`,
  `amount`, `status`, `metadata`.
- **RLS Policies:** Enforce row-level security so users only access their logs.
- **Analytics:** Enable querying for payment trends and analytics.
- **Retention:** Implement 24-month data retention per PRD, using Supabase `pg_cron`.

---

## 7. Error Handling & Retry Logic

- **Centralized Error Handling:** Use a consistent strategy across service methods.
- **Retry Logic:** Implement exponential backoff (max 3 retries, 2^i \* 1000ms) for retryable errors
  (e.g., rate limits, network issues).
- **User Experience:** Provide friendly error messages (e.g., "Payment failed, please try again")
  for F4 Purchase Flow failures.
- **Alerting:** Integrate with Sentry for high failure rate alerts.

---

## 8. Security & Compliance

- **PCI Compliance:** Use Stripe Elements for frontend card collection; never store raw card data.
- **Access Controls:** Restrict sensitive endpoints with Memberstack auth.
- **Audit Logging:** Maintain a complete audit trail in Supabase.
- **GDPR/CCPA:** Support consent via Webflow modal; purge data after 24 months.

---

## 9. Testing Strategy

- **Integration Tests:** Use mocked Stripe clients and Supabase test databases for end-to-end tests.
- **Webhook Tests:** Simulate Stripe events and verify Make.com scenario triggers (e.g.,
  `add_project.json`).
- **Manual QA:** Test payment, refund, and subscription flows in Stripe test mode.
- **Production Verification:** Monitor logs and analytics post-deployment.

---

## 10. Production Deployment Checklist

- **Environment Variables:** Set Stripe and Supabase secrets in production.
- **Webhook Configuration:** Configure Stripe webhooks in the dashboard to point to the production
  endpoint; verify Make.com scenario triggers.
- **Monitoring:** Set up health checks and alerts for payment/webhook failures via Sentry.
- **Documentation:** Keep this strategy and implementation docs updated.
- **PRD Alignment:** Ensure support for F4 Purchase Flow and pricing transparency.

---

## References

- [Stripe Official Docs](https://stripe.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [PCI Compliance Guide](https://stripe.com/docs/security/pci-compliance)
- Project PRD: docs/PRD.md

---

**Last updated:** 2025-07-01p
