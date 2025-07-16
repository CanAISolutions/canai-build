# Task 12: Node-Cache Service Implementation Plan — Defensive, Evidence-Based Guide

---

## Purpose & PRD Alignment

This document provides a concrete, actionable, and defensive implementation plan for Task 12:
**Setup Node-Cache Service**. It is designed to:

- Align with PRD requirements for API performance, resilience, and observability (see PRD Sections
  6, 7, 8, 12, 16)
- Support current and future caching needs for API endpoints (e.g., `/v1/messages`)
- Ensure security, compliance, and extensibility
- Serve as a living reference for TaskMaster Task 12 and all related caching work

---

## TaskMaster Tasks & Deliverables

### **Current Tasks**

- **Task 12:** Setup Node-Cache Service (TTL, invalidation, monitoring)
  - **12.1:** Implement cache storage and retrieval with TTL
  - **12.2:** Add cache invalidation and warming
  - **12.3:** Expose cache statistics and monitoring

### **Future-Proofing**

- Design for easy migration to Redis or distributed cache
- Modularize for per-endpoint and per-key strategies
- Integrate with observability (Sentry, PostHog)

---

## Goals & Success Criteria

- Reduce database/API load and latency for high-traffic endpoints
- Provide 5-minute TTL caching for trust indicators and messages
- Support cache invalidation on data changes
- Expose cache stats for health and monitoring
- Log cache hits/misses/errors to Sentry/PostHog
- Achieve 100% test coverage for cache logic and edge cases

---

## Architecture & Structure

- **Service Module:** `backend/services/cache.js` (or `.ts`)
  - Encapsulate all cache logic (get, set, del, stats)
  - Use `node-cache` for in-memory caching (MVP)
  - Configurable TTL (default: 5 min)
- **Middleware:** Optionally add per-route cache middleware
- **Monitoring:** Expose `/cache/stats` or include in `/health`
- **Observability:** Log cache events to Sentry/PostHog
- **Invalidation:** Provide methods to invalidate by key or pattern
- **Warming:** Optionally pre-populate cache on startup for hot endpoints

---

## Implementation Phases & Phase Gates

### 1. Service Module & Basic Operations

> **Phase Gate:** `node-cache` is installed and imported. Service exposes `get`, `set`, `del`,
> `stats`.

**Success Criteria:**

- Can store, retrieve, and delete cache entries with TTL
- Stats method returns hit/miss counts, keys, and memory usage

**Example:**

```js
// services/cache.js
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
export default {
  get: key => cache.get(key),
  set: (key, value, ttl) => cache.set(key, value, ttl),
  del: key => cache.del(key),
  stats: () => cache.getStats(),
};
```

---

### 2. Integration with API Endpoints

> **Phase Gate:** Cache middleware or logic is added to `/v1/messages` and other high-traffic
> endpoints.

**Success Criteria:**

- API checks cache before DB
- On cache hit, returns cached response
- On miss, fetches from DB, stores in cache

**Example:**

```js
// routes/messages.js
import cache from '../services/cache.js';
router.get('/', async (req, res) => {
  const cacheKey = 'messages';
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);
  const data = await fetchMessagesFromDB();
  cache.set(cacheKey, data, 300);
  res.json(data);
});
```

---

### 3. Invalidation & Warming

> **Phase Gate:** Invalidation logic is implemented for data-changing endpoints (e.g.,
> POST/PUT/DELETE).

**Success Criteria:**

- Cache is invalidated on relevant data changes
- Optionally, cache is pre-warmed on startup

**Example:**

```js
// On data change
cache.del('messages');
// On startup
cache.set('messages', await fetchMessagesFromDB(), 300);
```

---

### 4. Monitoring & Observability

> **Phase Gate:** Cache stats are exposed and events are logged to Sentry/PostHog.

**Success Criteria:**

- `/cache/stats` or `/health` returns cache metrics
- Cache hits/misses/errors are logged

**Example:**

```js
// routes/cache.js
router.get('/stats', (req, res) => res.json(cache.stats()));
// In cache service
import * as Sentry from './instrument.js';
if (error) Sentry.captureException(error);
```

---

### 5. Testing & Validation

> **Phase Gate:** Vitest test suite covers all cache logic, edge cases, and error paths.

**Success Criteria:**

- All cache operations are tested (get, set, del, stats)
- Edge cases: expired keys, invalidation, memory limits
- Test logs and metrics for cache events

---

## Defensive Rollback & Iteration Plan

- After each change, run affected and full test suite
- If regression, revert last change and isolate issue
- Log all findings and lessons learned in TaskMaster and docs
- Remove temporary logs before merge

---

## Acceptance Criteria & Checklist

- [ ] Service module implemented and tested
- [ ] Integrated with at least one API endpoint
- [ ] Invalidation and warming logic present
- [ ] Monitoring and stats exposed
- [ ] Observability/logging integrated
- [ ] 100% test coverage for cache logic
- [ ] Documentation and TaskMaster updated after each step

---

## References & Best Practices

- PRD.md (Sections 6, 7, 8, 12, 16)
- [CanAI Structure Rules](../.cursor/rules/canai-structure-rules.mdc)
- [Task 9 Input Validation Plan](task-9-input-validation-middleware.md)
- [Task 15 Preview Spark API Plan](task-15-Create-POST-v1-generate-preview-spark-API.md)
- node-cache, Sentry, PostHog docs
- [test-debugging-best-practices.md](test-debugging-best-practices.md)

---

**Last updated:** 2025-07-16
