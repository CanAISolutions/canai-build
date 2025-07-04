---
title: Supabase Frontend Integration Guide
purpose:
  Step-by-step instructions for integrating Supabase with the CanAI React/Vite frontend, ensuring
  consistency, security, and maintainability.
date: 2025-06-24
version: 1.0.0
---

# Supabase Frontend Integration Guide

## Purpose

Provide a clear, production-ready reference for integrating Supabase into the CanAI React/Vite
frontend, aligned with project standards and PRD requirements. This guide ensures consistent
implementation across the 9-stage user journey (F1-F9) while maintaining security and performance
standards.

## Prerequisites

- Node.js, npm, and Vite installed
- Supabase project with URL and anon key
- Environment variables configured
- TypeScript knowledge (project uses strict mode)

## 1. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

**Note:** This project uses `@supabase/supabase-js` (not the deprecated
`@supabase/auth-helpers-react`).

## 2. Configure Environment Variables

Create or update `.env.local` in your project root (never commit secrets):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Security Notes:**

- Use `.env.local` for local development (gitignored)
- Use `.env.test` for test environments
- Never commit real secrets to version control
- Use `VITE_` prefix for Vite environment variables

## 3. Create the Supabase Client

Create or update `frontend/src/integrations/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env['VITE_SUPABASE_URL'] || 'https://your-project.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env['VITE_SUPABASE_ANON_KEY'] || 'your-anon-key';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```

**Key Points:**

- Use singleton pattern for consistent client usage
- Include TypeScript types for database schema
- Provide fallback values for development
- Follow project's import path conventions

## 4. Generate TypeScript Types (Optional but Recommended)

For full type safety, generate types from your Supabase schema:

```bash
npx supabase gen types typescript --project-id your-project-id > frontend/src/integrations/supabase/types.ts
```

Then update your client import:

```typescript
import type { Database } from './types';
```

## 5. Usage Examples

### Basic Query

```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.from('trust_indicators').select('*').limit(10);

if (error) {
  console.error('Error fetching trust indicators:', error);
  return;
}

console.log('Trust indicators:', data);
```

### Insert with Error Handling

```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase
  .from('prompt_logs')
  .insert({
    user_id: 'user-uuid',
    prompt_type: 'spark_generation',
    content: 'Generate business sparks for bakery',
    confidence_score: 0.85,
  })
  .select();

if (error) {
  console.error('Error logging prompt:', error);
  // Handle error appropriately
  return;
}

console.log('Logged prompt:', data);
```

### Real-time Subscriptions

```typescript
import { supabase } from '@/integrations/supabase/client';

const subscription = supabase
  .channel('trust_updates')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'trust_indicators' },
    payload => {
      console.log('New trust indicator:', payload.new);
    }
  )
  .subscribe();

// Clean up subscription
return () => {
  subscription.unsubscribe();
};
```

## 6. Journey-Specific Integration Patterns

### F1: Discovery Hook - Trust Indicators

```typescript
// frontend/src/utils/supabase.ts
export const getTrustIndicators = async () => {
  const { data, error } = await supabase
    .from('trust_indicators')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching trust indicators:', error);
    return { data: [], error };
  }

  return { data, error: null };
};
```

### F5: Detailed Input Collection - Progress Saving

```typescript
// frontend/src/utils/detailedInputIntegration.ts
export const saveUserProgress = async (userId: string, stageData: any) => {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      stage: 'F5',
      data: stageData,
      updated_at: new Date().toISOString(),
    })
    .select();

  if (error) {
    console.error('Error saving progress:', error);
    throw new Error('Failed to save progress');
  }

  return data;
};
```

### F9: Feedback Capture - Sentiment Analysis

```typescript
// frontend/src/utils/feedback.ts
export const submitFeedback = async (feedbackData: FeedbackData) => {
  const { data, error } = await supabase
    .from('user_feedback')
    .insert({
      user_id: feedbackData.userId,
      rating: feedbackData.rating,
      sentiment: feedbackData.sentiment,
      comments: feedbackData.comments,
      journey_stage: 'F9',
    })
    .select();

  if (error) {
    console.error('Error submitting feedback:', error);
    throw new Error('Failed to submit feedback');
  }

  return data;
};
```

## 7. Error Handling Best Practices

### Standardized Error Handling

```typescript
// frontend/src/utils/supabase.ts
export const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase error in ${context}:`, error);

  // Log to analytics
  trackError({
    error: error.message,
    context,
    action: 'supabase_operation',
  });

  // Return user-friendly error
  return {
    success: false,
    error: 'Something went wrong. Please try again.',
    details: error.message,
  };
};

// Usage
const { data, error } = await supabase.from('table').select('*');
if (error) {
  return handleSupabaseError(error, 'fetching data');
}
```

### Retry Logic for Transient Failures

```typescript
// frontend/src/utils/supabase.ts
export const retrySupabaseOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw new Error('Max retries exceeded');
};
```

## 8. Security Considerations

### Row Level Security (RLS)

- Ensure RLS policies are enabled on all tables
- Use authenticated user context for protected operations
- Never expose service role keys in frontend code

### Input Validation

```typescript
// frontend/src/utils/validation.ts
export const validateSupabaseInput = (data: any, schema: any) => {
  // Use Zod or similar for runtime validation
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new Error(`Invalid input: ${result.error.message}`);
  }

  return result.data;
};
```

### Rate Limiting

- Implement client-side rate limiting for API calls
- Use exponential backoff for retries
- Monitor for abuse patterns

## 9. Performance Optimization

### Query Optimization

```typescript
// Good: Select only needed columns
const { data } = await supabase.from('users').select('id, name, email').eq('status', 'active');

// Avoid: Selecting all columns
const { data } = await supabase.from('users').select('*'); // Don't do this unless needed
```

### Caching Strategy

```typescript
// frontend/src/utils/cache.ts
const cache = new Map();

export const getCachedData = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes
): Promise<T> => {
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await fetchFn();
  cache.set(key, { data, timestamp: Date.now() });

  return data;
};
```

## 10. Testing Integration

### Mock Supabase Client for Tests

```typescript
// frontend/src/tests/mocks/supabase.ts
export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
      })),
    })),
  })),
};

// In your test setup
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));
```

### Integration Test Example

```typescript
// frontend/src/tests/integration/supabase.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import { getTrustIndicators } from '@/utils/supabase';

describe('Supabase Integration', () => {
  it('fetches trust indicators successfully', async () => {
    const { data, error } = await getTrustIndicators();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });
});
```

## 11. Environment-Specific Configuration

### Development

```env
# .env.local
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key
```

### Testing

```env
# .env.test
VITE_SUPABASE_URL=https://test-project.supabase.co
VITE_SUPABASE_ANON_KEY=test-anon-key
```

### Production

```env
# .env.production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
```

## 12. Troubleshooting

### Common Issues

**Error: "Invalid API key"**

- Check that `VITE_SUPABASE_ANON_KEY` is correct
- Ensure the key is from the correct project
- Verify the key hasn't been rotated

**Error: "JWT expired"**

- Implement token refresh logic
- Check authentication state management
- Verify RLS policies allow the operation

**Error: "Row Level Security policy violation"**

- Check RLS policies on the table
- Verify user authentication state
- Ensure user has required permissions

### Debug Mode

```typescript
// Enable debug logging in development
if (import.meta.env.DEV) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change:', event, session);
  });
}
```

## 13. References and Resources

### Official Documentation

- [Supabase React Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Project Documentation

- [Project Structure Mapping](./project-structure-mapping.md)
- [Backend Supabase Setup](../backend/supabase/README.md)
- [API Contract Specification](./api-contract-specification.md)
- [Data Model Schema](./data-model-schema.md)

### Related Files

- `frontend/src/integrations/supabase/client.ts` - Main client configuration
- `frontend/src/integrations/supabase/types.ts` - Generated TypeScript types
- `frontend/src/utils/supabase.ts` - Utility functions
- `backend/supabase/migrations/` - Database schema migrations

## 14. Maintenance and Updates

### Regular Tasks

- Update Supabase client library versions
- Regenerate TypeScript types after schema changes
- Review and update RLS policies
- Monitor performance and error rates

### Version Compatibility

- This guide is tested with `@supabase/supabase-js` v2.x
- Check [Supabase changelog](https://github.com/supabase/supabase-js/releases) for breaking changes
- Update this guide when upgrading major versions

## Backend Direct SQL Access

For admin scripts, migrations, or advanced analytics that require raw SQL (bypassing Supabase's
API), use `backend/db.js` in the backend workspace. This utility uses the `postgres` library and the
`DATABASE_URL` environment variable. Never use this in frontend code.

---

**Maintainer:** CanAI Development Team  
**Last Updated:** 2025-06-24  
**Version:** 1.0.0  
**Status:** Production Ready

---

_This guide follows the CanAI platform's documentation standards and is aligned with the PRD
requirements for the 9-stage user journey (F1-F9)._
