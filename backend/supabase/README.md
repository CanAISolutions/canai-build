# Supabase Database Setup

> **STATUS: Preparation/Design Phase**
>
> - Migration files and RLS policy scripts are written and staged in `backend/supabase/migrations/`.
> - Integration tests for RLS enforcement are ready in
>   `backend/tests/integration/rls-policies.test.js`.
> - **Note:** The actual Supabase tables and policies are not yet deployed. Testing will be
>   performed after initial schema migration.
> - See PRD.md and tasks.json for the planned schema and security requirements.

This directory contains the database schema and migration files for the CanAI Emotional Sovereignty
Platform.

## Quick Start

1. **Environment Setup**

   ```bash
   # Set your Supabase environment variables
   export SUPABASE_URL="your-project-url"
   export SUPABASE_KEY="your-anon-key"
   ```

2. **Run Migrations**
   ```bash
   # Execute the core tables migration
   psql "postgresql://postgres:[password]@[host]:5432/postgres" -f migrations/001_core_tables.sql
   ```

## Migration Files

### 001_core_tables.sql

Creates the core application tables:

- **prompt_logs** - Detailed input collection (12 fields per PRD)
- **spark_logs** - Initial spark generation and selection tracking
- **comparisons** - SparkSplit comparison functionality with TrustDelta scoring

## Table Overview

### prompt_logs

Stores user input data for deliverable generation:

- 12 detailed business input fields
- Completion tracking and validation status
- Auto-save functionality support
- Emotional drivers and context analysis

### spark_logs

Manages initial spark generation:

- Generated sparks array (3 sparks per generation)
- Selection tracking and attempt limits (max 4)
- Trust scoring and emotional resonance data
- Product track classification

### comparisons

Handles SparkSplit comparison functionality:

- CanAI vs Generic output comparison
- TrustDelta scoring (target ≥4.2)
- Emotional resonance tracking (target >0.7)
- User preference recording and revision tracking

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- User data isolation via `auth.uid() = user_id` policies
- Proper foreign key constraints and data validation
- Automatic timestamp management with triggers

## Performance Optimizations

- Composite indexes on frequently queried columns
- User-specific indexes for data isolation
- Timestamp-based indexes for time-series queries
- JSONB indexes for metadata searches

## Data Validation

- CHECK constraints on critical fields
- Enum validation for status and type fields
- Length constraints on text fields
- Numeric range validation for scores

## Usage Examples

```javascript
// Insert new prompt log
const { data, error } = await supabase.from('prompt_logs').insert({
  business_description: 'A tech startup...',
  target_market: 'Small businesses',
  validation_status: 'draft',
});

// Query user's spark logs
const { data, error } = await supabase
  .from('spark_logs')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Update comparison with user preference
const { data, error } = await supabase
  .from('comparisons')
  .update({
    user_preference: 'canai',
    preference_recorded_at: new Date().toISOString(),
  })
  .eq('id', comparisonId);
```

## Development Notes

- All tables use UUID primary keys with `gen_random_uuid()`
- Timestamps are automatically managed via triggers
- JSONB fields store flexible metadata and analysis results
- Foreign key relationships maintain data integrity
- RLS policies ensure user data privacy

## Next Steps

After running this migration, you'll need to:

1. Create additional supporting tables (error_logs, feedback_logs, etc.)
2. Set up database triggers for audit logging
3. Configure Supabase vault for sensitive data encryption
4. Add composite indexes based on query patterns
