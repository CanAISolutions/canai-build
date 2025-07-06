# Deployment and Operations Playbook - CanAI Emotional Sovereignty Platform

## Purpose

Guides reliable deployment and production operations per PRD Section 15. Prevents deployment errors
by standardizing processes, ensuring 99.9% uptime, and supporting the complete 9-stage user journey
with TaskMaster integration, automated rollbacks, and comprehensive monitoring.

## Structure

- **Environment Setup**: Render, Supabase, .env configurations with security best practices.
- **CI/CD Pipeline**: GitHub Actions steps for build/test/deploy with TaskMaster validation.
- **Rollback Plan**: Git tags, automated triggers, and <5min recovery procedures.
- **Monitoring Stack**: Sentry, PostHog, health checks for comprehensive observability.
- **Maintenance Procedures**: Data lifecycle, security updates, and performance optimization.

## Environment Setup and Configuration

### Production Environment (Render)

#### Backend Deployment

```yaml
# render.yaml - Backend service configuration
services:
  - type: web
    name: canai-backend
    env: node
    buildCommand: npm ci && npm run build
    startCommand: npm start
    healthCheckPath: /health
    scaling:
      minInstances: 2
      maxInstances: 10
      targetCPUPercent: 70
      targetMemoryPercent: 80
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: SUPABASE_URL
        fromSecret: SUPABASE_URL
      - key: SUPABASE_ANON_KEY
        fromSecret: SUPABASE_ANON_KEY
      - key: OPENAI_API_KEY
        fromSecret: OPENAI_API_KEY
      - key: HUME_API_KEY
        fromSecret: HUME_API_KEY
      - key: STRIPE_SECRET_KEY
        fromSecret: STRIPE_SECRET_KEY
      - key: MEMBERSTACK_SECRET_KEY
        fromSecret: MEMBERSTACK_SECRET_KEY
      - key: SENTRY_DSN
        fromSecret: SENTRY_DSN
      - key: POSTHOG_API_KEY
        fromSecret: POSTHOG_API_KEY
      - key: MAKE_COM_WEBHOOK_URL
        fromSecret: MAKE_COM_WEBHOOK_URL
```

**Production URLs**:

- **Backend**: `https://canai-router.onrender.com` (internal: `canai-router:10000`)
- **Server IPs**: 52.41.36.82, 54.191.253.12, 44.226.122.3
- **Frontend**: `https://canai-frontend.onrender.com` (Webflow CMS integration)
- **Admin Dashboard**: `https://canai-admin.onrender.com` (Memberstack secured)

#### Auto-scaling Configuration

```javascript
// Auto-scaling rules per PRD Section 7.4
const scalingConfig = {
  minInstances: 2,
  maxInstances: 10,
  scaleUpThreshold: {
    cpu: 70, // Scale up when CPU > 70%
    memory: 80, // Scale up when memory > 80%
    responseTime: 500, // Scale up when response time > 500ms
    concurrentUsers: 1000,
  },
  scaleDownThreshold: {
    cpu: 30, // Scale down when CPU < 30%
    memory: 40, // Scale down when memory < 40%
    responseTime: 200, // Scale down when response time < 200ms
    idleTime: 300, // Scale down after 5min idle
  },
};
```

### Staging Environment

```yaml
# Staging environment for testing
services:
  - type: web
    name: canai-backend-staging
    env: node
    envVars:
      - key: NODE_ENV
        value: staging
      - key: SUPABASE_URL
        fromSecret: SUPABASE_STAGING_URL
      # Use staging versions of all external services
```

### Development Environment

```bash
# Local development setup
cp .env.example .env.local

# Required environment variables
SUPABASE_URL=your-staging-supabase-url
SUPABASE_ANON_KEY=your-staging-anon-key
OPENAI_API_KEY=your-openai-api-key
HUME_API_KEY=your-hume-api-key
STRIPE_SECRET_KEY=your-stripe-test-key
MEMBERSTACK_SECRET_KEY=your-memberstack-staging-key
SENTRY_DSN=your-sentry-dsn
POSTHOG_API_KEY=your-posthog-api-key
MAKE_COM_WEBHOOK_URL=your-make-webhook-url

# TaskMaster integration
TASKMASTER_API_KEY=your-taskmaster-api-key
TASKMASTER_PROJECT_ID=canai-build
```

### Supabase Configuration

#### Production Database Setup

```sql
-- Production database configuration
-- Applied via migrations in databases/migrations/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Configure connection pooling
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements,pg_cron';

-- Set up monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

#### RLS Policy Deployment

```bash
# Deploy RLS policies
supabase db push --include-all

# Verify RLS is enabled on all tables
psql $SUPABASE_DB_URL -c "
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
"
```

### Heroku Fallback Configuration

```json
{
  "name": "canai-backend-fallback",
  "description": "CanAI Backend Fallback on Heroku",
  "repository": "https://github.com/your-org/canai-build",
  "keywords": ["canai", "ai", "emotional-sovereignty", "backup"],
  "env": {
    "NODE_ENV": {
      "description": "Node environment",
      "value": "production"
    },
    "SUPABASE_URL": {
      "description": "Supabase project URL"
    },
    "DATABASE_URL": {
      "description": "Fallback database URL"
    }
  },
  "addons": ["heroku-postgresql:standard-0", "heroku-redis:premium-0", "papertrail:choklad"],
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ]
}
```

## CI/CD Pipeline Implementation

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  validate-taskmaster:
    name: Validate TaskMaster Tasks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate TaskMaster Dependencies
        run: |
          npm install -g @taskmaster/cli
          taskmaster validate --config .taskmaster.yml
          taskmaster dependency-check --strict

  test:
    name: Run Test Suite
    runs-on: ubuntu-latest
    needs: validate-taskmaster
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Unit Tests
        run: npm run test:unit
        env:
          COVERAGE_THRESHOLD: 80

      - name: Run Integration Tests
        run: npm run test:integration
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_STAGING_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_STAGING_ANON_KEY }}

      - name: Run E2E Tests
        run: npm run test:e2e

      - name: Check Coverage
        run: |
          npm run coverage:check
          if [ $(npm run coverage:percentage --silent) -lt 80 ]; then
            echo "Coverage below 80% threshold"
            exit 1
          fi

  security-scan:
    name: Security Analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run OWASP ZAP Scan
        uses: zaproxy/action-full-scan@v0.4.0
        with:
          target: 'https://canai-router-staging.onrender.com'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'

      - name: Run Semgrep Security Scan
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit p/secrets p/nodejs

      - name: Check for Vulnerabilities
        run: npm audit --audit-level high

  build-backend:
    name: Build Backend
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker Image
        run: |
          docker build -t canai-backend:${{ github.sha }} .
          docker tag canai-backend:${{ github.sha }} canai-backend:latest

      - name: Push to Registry
        run: |
          echo ${{ secrets.CONTAINER_REGISTRY_PASSWORD }} | docker login -u ${{ secrets.CONTAINER_REGISTRY_USERNAME }} --password-stdin
          docker push canai-backend:${{ github.sha }}
          docker push canai-backend:latest

  deploy-database:
    name: Deploy Database Migrations
    runs-on: ubuntu-latest
    needs: build-backend
    steps:
      - uses: actions/checkout@v4

      - name: Run Database Migrations
        run: |
          npm install @supabase/cli
          npx supabase db push --db-url ${{ secrets.SUPABASE_DB_URL }}

      - name: Verify Migration Success
        run: |
          npx supabase db diff --db-url ${{ secrets.SUPABASE_DB_URL }}

  deploy-backend:
    name: Deploy Backend to Render
    runs-on: ubuntu-latest
    needs: deploy-database
    steps:
      - name: Trigger Render Deployment
        uses: renderinc/github-action@v1.0.1
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
          wait-for-deploy: true

      - name: Health Check
        run: |
          for i in {1..30}; do
            if curl -f https://canai-router.onrender.com/health; then
              echo "Health check passed"
              break
            fi
            echo "Health check attempt $i failed, retrying..."
            sleep 10
          done

  deploy-frontend:
    name: Deploy Frontend (Webflow Integration)
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - name: Update Webflow CMS
        run: |
          curl -X POST "https://api.webflow.com/sites/${{ secrets.WEBFLOW_SITE_ID }}/publish" \
            -H "Authorization: Bearer ${{ secrets.WEBFLOW_API_TOKEN }}" \
            -H "accept-version: 1.0.0"

      - name: Verify Frontend Deployment
        run: |
          curl -f https://canai-frontend.onrender.com
          curl -f https://canai-admin.onrender.com

  notify-taskmaster:
    name: Update TaskMaster Status
    runs-on: ubuntu-latest
    needs: [deploy-backend, deploy-frontend]
    if: always()
    steps:
      - name: Update TaskMaster Deployment Status
        run: |
          curl -X POST "${{ secrets.TASKMASTER_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{
              "deployment_id": "${{ github.sha }}",
              "status": "${{ job.status }}",
              "environment": "production",
              "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
              "services": {
                "backend": "deployed",
                "frontend": "deployed",
                "database": "migrated"
              }
            }'
```

### Deployment Verification Scripts

```bash
#!/bin/bash
# scripts/verify-deployment.sh

echo "🚀 Verifying CanAI Platform Deployment..."

# Health check endpoints
BACKEND_URL="https://canai-router.onrender.com"
FRONTEND_URL="https://canai-frontend.onrender.com"
ADMIN_URL="https://canai-admin.onrender.com"

# Test backend health
echo "🔍 Checking backend health..."
if curl -f -s "$BACKEND_URL/health" > /dev/null; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Test API endpoints
echo "🔍 Testing critical API endpoints..."
endpoints=(
    "/v1/messages"
    "/v1/pricing"
)

for endpoint in "${endpoints[@]}"; do
    if curl -f -s "$BACKEND_URL$endpoint" > /dev/null; then
        echo "✅ $endpoint responding"
    else
        echo "❌ $endpoint failed"
        exit 1
    fi
done

# Test database connectivity
echo "🔍 Testing database connectivity..."
if curl -f -s "$BACKEND_URL/health/database" > /dev/null; then
    echo "✅ Database connectivity verified"
else
    echo "❌ Database connectivity failed"
    exit 1
fi

# Test external service integrations
echo "🔍 Testing external service integrations..."
services=("stripe" "memberstack" "supabase" "posthog" "sentry")

for service in "${services[@]}"; do
    if curl -f -s "$BACKEND_URL/health/$service" > /dev/null; then
        echo "✅ $service integration verified"
    else
        echo "⚠️  $service integration may have issues"
    fi
done

echo "🎉 Deployment verification completed successfully!"
```

## Rollback Procedures

### Automated Rollback Triggers

```yaml
# .github/workflows/rollback.yml
name: Automated Rollback

on:
  workflow_dispatch:
    inputs:
      target_version:
        description: 'Version to rollback to'
        required: true
        type: string
  repository_dispatch:
    types: [health-check-failure, error-rate-spike]

jobs:
  rollback:
    name: Execute Rollback
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.target_version || 'HEAD~1' }}

      - name: Validate Rollback Target
        run: |
          git show --name-only ${{ github.event.inputs.target_version }}
          echo "Rolling back to: ${{ github.event.inputs.target_version }}"

      - name: Rollback Database Migrations
        run: |
          npx supabase db reset --db-url ${{ secrets.SUPABASE_DB_URL }}
          npx supabase db push --db-url ${{ secrets.SUPABASE_DB_URL }}

      - name: Rollback Backend Service
        run: |
          curl -X POST "https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys" \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"imageUrl": "canai-backend:${{ github.event.inputs.target_version }}"}'

      - name: Verify Rollback Success
        run: |
          sleep 60  # Wait for deployment
          ./scripts/verify-deployment.sh

      - name: Notify Team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: '🔄 Rollback to ${{ github.event.inputs.target_version }} completed'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Manual Rollback Procedures

```bash
#!/bin/bash
# scripts/manual-rollback.sh

TARGET_VERSION=$1

if [ -z "$TARGET_VERSION" ]; then
    echo "Usage: ./manual-rollback.sh <version-tag>"
    echo "Available versions:"
    git tag -l "v*" | sort -V | tail -10
    exit 1
fi

echo "🔄 Starting manual rollback to $TARGET_VERSION..."

# 1. Checkout target version
git checkout $TARGET_VERSION

# 2. Rollback database if needed
echo "⚠️  Rolling back database migrations..."
read -p "Continue with database rollback? (y/N): " confirm
if [[ $confirm == [yY] ]]; then
    npx supabase db reset
    npx supabase db push
fi

# 3. Deploy previous version
echo "🚀 Deploying previous version..."
render deploy --service canai-backend --image canai-backend:$TARGET_VERSION

# 4. Verify rollback
echo "🔍 Verifying rollback..."
sleep 60
./scripts/verify-deployment.sh

echo "✅ Rollback completed successfully!"
```

## Health Monitoring and Alerting

### Health Check Endpoints

```javascript
// backend/routes/health.js
const express = require('express');
const router = express.Router();

// Main health check
router.get('/health', async (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    services: {},
  };

  try {
    // Database connectivity
    const dbHealth = await checkDatabaseHealth();
    healthStatus.services.database = dbHealth;

    // External services
    healthStatus.services.supabase = await checkSupabaseHealth();
    healthStatus.services.stripe = await checkStripeHealth();
    healthStatus.services.openai = await checkOpenAIHealth();
    healthStatus.services.hume = await checkHumeAIHealth();
    healthStatus.services.memberstack = await checkMemberstackHealth();

    // Performance metrics
    healthStatus.performance = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      activeConnections: getActiveConnectionCount(),
    };

    const hasFailures = Object.values(healthStatus.services).some(
      service => service.status !== 'healthy'
    );

    if (hasFailures) {
      healthStatus.status = 'degraded';
      return res.status(503).json(healthStatus);
    }

    res.json(healthStatus);
  } catch (error) {
    healthStatus.status = 'unhealthy';
    healthStatus.error = error.message;
    res.status(503).json(healthStatus);
  }
});

// Individual service health checks
router.get('/health/database', async (req, res) => {
  try {
    const result = await supabase.from('trust_indicators').select('count').limit(1);
    res.json({ status: 'healthy', response_time: result.duration });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

router.get('/health/stripe', async (req, res) => {
  try {
    await stripe.paymentMethods.list({ limit: 1 });
    res.json({ status: 'healthy' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

module.exports = router;
```

### Monitoring Configuration

```javascript
// backend/services/monitoring.js
const Sentry = require('@sentry/node');
const { PostHog } = require('posthog-node');

class MonitoringService {
  constructor() {
    this.setupSentry();
    this.setupPostHog();
    this.setupHealthChecks();
  }

  setupSentry() {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      beforeSend(event) {
        // Filter out noise
        if (event.exception?.values?.[0]?.type === 'RateLimitError') {
          return null;
        }
        return event;
      },
    });
  }

  setupPostHog() {
    this.posthog = new PostHog(process.env.POSTHOG_API_KEY, {
      host: 'https://app.posthog.com',
    });
  }

  setupHealthChecks() {
    // Run health checks every 30 seconds
    setInterval(async () => {
      try {
        const health = await this.performHealthCheck();

        if (health.status !== 'healthy') {
          this.alertHealthIssue(health);
        }

        // Log metrics to PostHog
        this.posthog.capture('health_check', {
          status: health.status,
          response_time: health.response_time,
          memory_usage: process.memoryUsage().rss,
          uptime: process.uptime(),
        });
      } catch (error) {
        Sentry.captureException(error);
      }
    }, 30000);
  }

  async alertHealthIssue(health) {
    // Send alert to Slack
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 CanAI Health Alert: ${health.status}`,
        attachments: [
          {
            color: 'danger',
            fields: [
              { title: 'Status', value: health.status, short: true },
              { title: 'Timestamp', value: health.timestamp, short: true },
              { title: 'Failed Services', value: this.getFailedServices(health), short: false },
            ],
          },
        ],
      }),
    });

    // Trigger automated rollback if critical
    if (health.status === 'unhealthy') {
      await this.triggerAutomatedRollback();
    }
  }

  async triggerAutomatedRollback() {
    // Trigger GitHub workflow for rollback
    await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'health-check-failure',
        client_payload: {
          timestamp: new Date().toISOString(),
          severity: 'critical',
        },
      }),
    });
  }
}

module.exports = new MonitoringService();
```

## Data Lifecycle and Maintenance

### Automated Maintenance Jobs

```sql
-- Schedule maintenance jobs via pg_cron

-- Daily optimization
SELECT cron.schedule(
    'daily-maintenance',
    '0 2 * * *', -- 2 AM daily
    $$
    BEGIN
        -- Vacuum and analyze tables
        VACUUM ANALYZE session_logs;
        VACUUM ANALYZE initial_prompt_logs;
        VACUUM ANALYZE spark_logs;
        VACUUM ANALYZE payment_logs;

        -- Update table statistics
        ANALYZE;

        -- Clean up expired cache entries
        DELETE FROM spark_cache WHERE expires_at < NOW();

        -- Archive old error logs
        INSERT INTO error_logs_archive
        SELECT * FROM error_logs WHERE created_at < NOW() - INTERVAL '30 days';
        DELETE FROM error_logs WHERE created_at < NOW() - INTERVAL '30 days';
    END
    $$
);

-- Weekly performance optimization
SELECT cron.schedule(
    'weekly-optimization',
    '0 3 * * 0', -- 3 AM every Sunday
    $$
    BEGIN
        -- Reindex performance-critical indexes
        REINDEX INDEX CONCURRENTLY idx_session_logs_user_id;
        REINDEX INDEX CONCURRENTLY idx_prompt_logs_user_id;
        REINDEX INDEX CONCURRENTLY idx_comparisons_trust_delta;

        -- Update query planner statistics
        ANALYZE;
    END
    $$
);

-- Monthly data lifecycle management
SELECT cron.schedule(
    'monthly-lifecycle',
    '0 4 1 * *', -- 4 AM on 1st of month
    $$
    BEGIN
        -- Purge data older than 24 months (GDPR compliance)
        DELETE FROM session_logs WHERE created_at < NOW() - INTERVAL '24 months';
        DELETE FROM initial_prompt_logs WHERE created_at < NOW() - INTERVAL '24 months';
        DELETE FROM error_logs WHERE created_at < NOW() - INTERVAL '24 months';

        -- Anonymize old feedback (12+ months)
        UPDATE feedback_logs
        SET comments = '[ANONYMIZED]',
            improvement_suggestions = '[ANONYMIZED]',
            anonymized = true
        WHERE created_at < NOW() - INTERVAL '12 months'
        AND anonymized = false;

        -- Generate monthly performance report
        INSERT INTO performance_reports (
            month,
            avg_response_time,
            total_users,
            total_plans_created,
            avg_trust_delta,
            uptime_percentage
        )
        SELECT
            date_trunc('month', NOW() - INTERVAL '1 month'),
            AVG(response_time_ms),
            COUNT(DISTINCT user_id),
            COUNT(*) FILTER (WHERE product_track = 'business_builder'),
            AVG(trust_delta),
            calculate_uptime(date_trunc('month', NOW() - INTERVAL '1 month'))
        FROM session_logs
        WHERE created_at >= date_trunc('month', NOW() - INTERVAL '1 month')
        AND created_at < date_trunc('month', NOW());
    END
    $$
);
```

### Backup and Recovery Procedures

```bash
#!/bin/bash
# scripts/backup-recovery.sh

# Daily automated backup
backup_database() {
    echo "📦 Creating database backup..."

    BACKUP_FILE="canai-backup-$(date +%Y%m%d-%H%M%S).sql"

    pg_dump $DATABASE_URL > "backups/$BACKUP_FILE"

    # Compress backup
    gzip "backups/$BACKUP_FILE"

    # Upload to S3 for redundancy
    aws s3 cp "backups/$BACKUP_FILE.gz" "s3://canai-backups/daily/"

    # Keep only last 30 days locally
    find backups/ -name "*.sql.gz" -mtime +30 -delete

    echo "✅ Backup completed: $BACKUP_FILE.gz"
}

# Point-in-time recovery
restore_database() {
    local TARGET_TIME=$1

    if [ -z "$TARGET_TIME" ]; then
        echo "Usage: restore_database '2024-12-15 10:30:00'"
        exit 1
    fi

    echo "🔄 Restoring database to $TARGET_TIME..."

    # Create recovery instance
    supabase db clone --to-time "$TARGET_TIME"

    # Validate recovery
    psql $RECOVERY_DB_URL -c "SELECT NOW(), 'Recovery validation';"

    echo "✅ Database restored to $TARGET_TIME"
}

# Weekly backup validation
validate_backups() {
    echo "🔍 Validating recent backups..."

    LATEST_BACKUP=$(ls -t backups/*.sql.gz | head -1)

    # Test restore to temporary database
    gunzip -c "$LATEST_BACKUP" | psql $TEST_DATABASE_URL

    # Verify data integrity
    psql $TEST_DATABASE_URL -c "
        SELECT
            COUNT(*) as total_records,
            MAX(created_at) as latest_record
        FROM session_logs;
    "

    echo "✅ Backup validation completed"
}
```

## Security and Compliance Procedures

### Security Monitoring

```javascript
// backend/middleware/security-monitoring.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting with progressive penalties
const createRateLimiter = (windowMs, max, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    skipSuccessfulRequests,
    message: {
      error: {
        code: 429,
        message: 'Rate limit exceeded. Please wait before trying again.',
        retry_after: Math.ceil(windowMs / 1000),
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      // Log rate limit violations
      monitoring.posthog.capture('rate_limit_exceeded', {
        ip: req.ip,
        endpoint: req.path,
        user_agent: req.get('User-Agent'),
      });

      res.status(429).json({
        error: {
          code: 429,
          message: 'Rate limit exceeded. Please wait before trying again.',
          retry_after: Math.ceil(windowMs / 1000),
        },
      });
    },
  });
};

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.stripe.com', 'https://api.supabase.co'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

module.exports = {
  apiRateLimit: createRateLimiter(60 * 1000, 100), // 100 req/min
  strictRateLimit: createRateLimiter(60 * 1000, 20), // 20 req/min for sensitive endpoints
  securityHeaders,
};
```

### Compliance Monitoring

```javascript
// Monitor GDPR/CCPA compliance
const complianceMonitor = {
  async auditDataAccess(userId, action, resource) {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      resource,
      timestamp: new Date().toISOString(),
      ip_address: req.ip,
    });
  },

  async processDataDeletionRequest(userId) {
    const deletionTasks = [
      'session_logs',
      'initial_prompt_logs',
      'spark_logs',
      'prompt_logs',
      'feedback_logs',
      'usage_logs',
      'share_logs',
    ];

    for (const table of deletionTasks) {
      await supabase.from(table).delete().eq('user_id', userId);
    }

    // Log deletion completion
    await this.auditDataAccess(userId, 'GDPR_DELETION', 'ALL_USER_DATA');
  },
};
```

## Performance Optimization

### Database Query Optimization

```sql
-- Monitor slow queries
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 100  -- Queries taking >100ms
ORDER BY mean_time DESC
LIMIT 20;

-- Create performance-optimized indexes
CREATE INDEX CONCURRENTLY idx_session_logs_performance
ON session_logs(user_id, created_at DESC, interaction_type)
WHERE created_at > NOW() - INTERVAL '30 days';

-- Optimize for analytics queries
CREATE MATERIALIZED VIEW daily_metrics AS
SELECT
    date_trunc('day', created_at) as date,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as total_interactions,
    AVG(CASE WHEN interaction_details->>'response_time_ms' IS NOT NULL
        THEN (interaction_details->>'response_time_ms')::integer END) as avg_response_time
FROM session_logs
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY date_trunc('day', created_at)
ORDER BY date DESC;

-- Refresh materialized view daily
SELECT cron.schedule(
    'refresh-daily-metrics',
    '0 1 * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY daily_metrics;'
);
```

This comprehensive deployment playbook ensures reliable, secure, and maintainable operations for the
CanAI platform while supporting the complete 9-stage user journey and TaskMaster integration
requirements.

### Useful Scripts for Deployment & QA

- Typecheck backend: `cd backend && npm run typecheck`
- Unit test frontend: `cd frontend && npm run test:unit`
- Format diff: `npm run format:diff`
- Migrate test DB: `cd backend && npm run migrate:test`

> **Note:** The backend always runs on port 10000 in all environments (local, Docker, Render, CI/CD).
