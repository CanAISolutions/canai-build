# Task 13 Execution Prompt — Zero Ambiguity, Strong Execution

## Context Setup

You are executing **Task 13: Implement GET /v1/messages API** for the CanAI Emotional Sovereignty Platform. This is a **CRITICAL** task with existing code that must be preserved.

### **CRITICAL WARNINGS**
- **EXISTING CODE PRESERVATION**: `backend/routes/messages.ts` already exists with basic GET /messages implementation - **PRESERVE IT**
- **EXISTING SCHEMAS**: `backend/schemas/messages.ts` already exists - **EXTEND, DON'T REPLACE**
- **EXISTING TESTS**: `backend/tests/integration/maliciousPayloads.api.test.ts` tests POST /v1/messages - **PRESERVE COVERAGE**
- **CACHE CONFLICTS**: Use unique cache key `trust_indicators_cache` to avoid conflicts with Task 12
- **ANALYTICS REUSE**: Use existing `funnel_step` events, don't create new event types

## Your Mission

Execute Task 13 following the **FINAL, MACHINE-READABLE** documentation exactly. No deviations, no assumptions, no creative interpretations.

## Required Documentation (READ FIRST)

1. **Implementation Plan**: `docs/task-13-messages-api-implementation-plan.md` - **FINAL VERSION**
2. **Test Plan**: `docs/task-13-messages-api-test-plan.md` - **FINAL VERSION**
3. **TaskMaster Task**: `.taskmaster/tasks/task_013.txt`
4. **PRD**: `docs/PRD.md` Sections 6, 12, 16

## Execution Requirements

### **Phase 1: Database Schema (Task 13.1)**
**File**: `backend/supabase/migrations/004_messages_table.sql`
- Create migration with exact SQL from implementation plan
- Include performance indexes for <200ms queries
- Add RLS policies for security
- **VERIFY**: Migration runs without errors

### **Phase 2: Repository Layer (Task 13.2)**
**File**: `backend/services/messages.ts` (NEW FILE)
- Implement MessagesRepository class exactly as specified
- Query `trust_indicators` table primarily (PRD Section 6.1)
- Calculate statistics: `SELECT COUNT(*) FROM comparisons WHERE created_at IS NOT NULL`
- **VERIFY**: Unit tests pass with 100% coverage

### **Phase 3: API Endpoint (Task 13.3)**
**File**: `backend/routes/messages.ts` (EXISTING - EXTEND CAREFULLY)
- **PRESERVE** existing GET /messages route
- Add new GET /v1/messages route with exact implementation
- Use cache key `trust_indicators_cache` (5-minute TTL)
- **VERIFY**: Both routes work after implementation

### **Phase 4: Analytics Integration (Task 13.4)**
**File**: `backend/services/analytics.ts` (EXTEND EXISTING)
- Add `funnel_step` event tracking with `stepName: 'discovery_hook'`
- **REUSE** existing PostHog service, don't duplicate
- **VERIFY**: Analytics events fire correctly

## Critical Implementation Rules

### **Code Preservation Rules**
1. **NEVER DELETE** existing code in `backend/routes/messages.ts`
2. **EXTEND** existing schemas in `backend/schemas/messages.ts`
3. **PRESERVE** existing test coverage in `backend/tests/`
4. **REUSE** existing services (PostHog, cache, logger)

### **Performance Requirements**
- **Response Time**: <200ms for cached requests (PRD Section 12)
- **Cache TTL**: 5 minutes exactly as specified
- **Rate Limit**: 100 req/min per IP (PRD Section 6.1)

### **Analytics Requirements**
- **Event Name**: `funnel_step` (existing event type)
- **Step Name**: `discovery_hook` (PRD Section 12)
- **Properties**: `{completed: boolean, user_id, cache_hit, message_count}`

### **Response Format (EXACT)**
```json
{
  "messages": [
    {
      "text": "string",
      "user_id": "uuid|null"
    }
  ],
  "error": null,
  "cached": boolean
}
```

## Testing Requirements

### **Mandatory Test Execution**
1. **Unit Tests**: `npm run test:unit` - Repository, service, validation layers
2. **Integration Tests**: `npm run test:integration` - API endpoints with mocked dependencies
3. **Performance Tests**: Verify <200ms response time
4. **Security Tests**: Authentication, authorization, input validation
5. **Analytics Tests**: Event tracking verification
6. **Regression Tests**: All existing tests must still pass

### **Test Coverage Requirements**
- **Unit Tests**: ≥90% line coverage
- **Integration Tests**: ≥80% line coverage
- **Overall Coverage**: ≥80% combined
- **Critical Paths**: 100% coverage (authentication, validation, analytics)

## Defensive Implementation Strategy

### **Before Implementation**
1. Run full test suite to establish baseline
2. Document current state of existing files
3. Create backup of critical files

### **During Implementation**
1. Implement one phase at a time
2. Run tests after each phase
3. Verify no regressions in existing functionality
4. Use logging with `NODE_ENV === 'test'` guards

### **After Implementation**
1. Run complete test suite
2. Verify all existing functionality works
3. Check analytics events are firing
4. Validate performance requirements

## Error Handling Requirements

### **User-Friendly Errors**
- Return `{ messages: [], error: "message" }` format
- No stack traces in production
- Log errors for debugging

### **Analytics Error Tracking**
- Track `messages_error` events
- Include error context and user identification
- Mark funnel step as `completed: false`

## Success Verification Checklist

### **Before Marking Complete**
- [ ] Database migration runs successfully
- [ ] Repository layer passes all unit tests
- [ ] API endpoint handles all request types
- [ ] Caching works with 5-minute TTL
- [ ] Analytics events fire correctly
- [ ] Performance <200ms achieved
- [ ] All existing tests still pass
- [ ] No conflicts with existing code
- [ ] Security requirements met
- [ ] Documentation updated

## Rollback Plan

### **If Issues Arise**
1. **Immediate**: Revert to last working commit
2. **Database**: Rollback migration if needed
3. **Code**: Restore from backup
4. **Tests**: Verify all existing tests pass

## Communication Requirements

### **Progress Updates**
- Report completion of each phase
- Share test results and coverage
- Document any deviations from plan
- Provide evidence of success

### **Blockers**
- Immediately report any blockers
- Provide detailed error information
- Suggest alternative approaches if needed

## Final Instructions

1. **READ ALL DOCUMENTATION FIRST** - Don't start coding until you understand every detail
2. **FOLLOW THE PLAN EXACTLY** - No creative interpretations or deviations
3. **PRESERVE EXISTING CODE** - This is critical for project stability
4. **TEST THOROUGHLY** - Every change must be tested
5. **DOCUMENT PROGRESS** - Keep detailed logs of implementation steps
6. **VERIFY SUCCESS** - Don't mark complete until all requirements are met

## Success Criteria

Task 13 is complete when:
- GET /v1/messages API returns trust indicators with caching
- Statistics calculation works correctly
- Analytics events fire with proper funnel step tracking
- Performance requirements are met (<200ms response time)
- All existing functionality is preserved
- Test coverage requirements are satisfied
- No conflicts with existing code or services

**Execute this task with precision, care, and attention to detail. The success of the CanAI platform depends on it.**

---

**This prompt is FINAL and MACHINE-READABLE for seamless Task 13 execution. Follow it exactly for guaranteed success.**