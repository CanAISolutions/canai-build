# CanAI Platform CRM Export Guide

## 📊 **Overview**

This guide provides comprehensive instructions for exporting user data, analytics, and business
metrics from the CanAI Emotional Sovereignty Platform for integration with Customer Relationship
Management (CRM) systems, business intelligence tools, and other external platforms per PRD Section
17.1.6 future enhancements.

## 🎯 **Export Capabilities**

### **Available Data Categories**

- **User Journey Data**: Complete 9-stage user journey tracking (F1-F9)
- **AI Output Analytics**: TrustDelta scores, emotional resonance metrics, spark generation data
- **Transaction & Payment Data**: Stripe payments, refunds, product track selections
- **Engagement & Interaction Data**: Session logs, interaction patterns, conversion metrics
- **Feedback & Support Data**: User ratings, comments, support requests, NPS scores
- **Performance Metrics**: API response times, system health, usage analytics

### **Supported Export Formats**

- **JSON**: Structured data with complete schema validation
- **CSV**: Spreadsheet compatible with business analytics tools
- **XML**: Enterprise system integration format
- **PDF**: Human-readable reports and deliverables
- **API Endpoints**: Real-time integration with live data access
- **Webhook Notifications**: Event-driven data synchronization

## 🚀 **API Integration (PRD Section 17.1.6)**

### **Authentication Setup**

```javascript
// Authentication for CRM export API
const apiKey = process.env.CANAI_API_KEY;
const headers = {
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  'X-API-Version': 'v1',
};
```

### **Primary Export Endpoint: POST /v1/export**

```typescript
// POST /v1/export endpoint specification
interface ExportRequest {
  export_type: 'user_data' | 'analytics' | 'deliverables' | 'full_platform';
  date_range: {
    start: string; // ISO 8601 format
    end: string; // ISO 8601 format
  };
  user_filters?: {
    user_ids?: string[];
    subscription_tiers?: ('standard' | 'premium')[];
    journey_stages?: ('F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9')[];
    product_tracks?: ('business_builder' | 'social_email' | 'site_audit')[];
  };
  data_fields: string[]; // Specific fields to include
  format: 'json' | 'csv' | 'xml';
  include_metadata: boolean;
  anonymize_data?: boolean; // GDPR/CCPA compliance
}

interface ExportResponse {
  data: {
    export_id: string;
    download_url: string; // Supabase storage URL
    expires_at: string; // URL expiration time
    record_count: number;
    file_size_bytes: number;
    format: string;
  };
  error: null;
  metadata: {
    export_created_at: string;
    processing_time_ms: number;
    request_id: string;
  };
}
```

### **Complete User Data Export**

```javascript
// Export comprehensive user journey data
const userDataExport = await fetch('https://canai-router.onrender.com/v1/export', {
  method: 'POST',
  headers: headers,
  body: JSON.stringify({
    export_type: 'user_data',
    date_range: {
      start: '2024-01-01T00:00:00Z',
      end: '2024-12-31T23:59:59Z',
    },
    data_fields: [
      'user_id',
      'email',
      'registration_date',
      'subscription_tier',
      'journey_progress',
      'total_spent',
      'trust_delta_average',
      'emotional_resonance_scores',
      'spark_selections',
      'deliverables_generated',
      'feedback_ratings',
      'referral_activity',
    ],
    format: 'json',
    include_metadata: true,
    anonymize_data: false,
  }),
});

const exportData = await userDataExport.json();
console.log('Export URL:', exportData.data.download_url);
```

### **Analytics Export for Business Intelligence**

```javascript
// Export aggregated analytics data
const analyticsExport = await fetch('https://canai-router.onrender.com/v1/export', {
  method: 'POST',
  headers: headers,
  body: JSON.stringify({
    export_type: 'analytics',
    date_range: {
      start: '2024-12-01T00:00:00Z',
      end: '2024-12-31T23:59:59Z',
    },
    data_fields: [
      'daily_active_users',
      'funnel_conversion_rates',
      'average_trust_delta',
      'emotional_resonance_trends',
      'revenue_by_product_track',
      'user_satisfaction_scores',
      'api_performance_metrics',
      'geographic_distribution',
      'referral_conversion_rates',
    ],
    format: 'csv',
    include_metadata: true,
  }),
});
```

### **Deliverables Export for Portfolio**

```javascript
// Export user deliverables (business plans, campaigns, audits)
const deliverablesExport = await fetch('https://canai-router.onrender.com/v1/export', {
  method: 'POST',
  headers: headers,
  body: JSON.stringify({
    export_type: 'deliverables',
    user_filters: {
      product_tracks: ['business_builder'],
      journey_stages: ['F7', 'F8'], // Completed deliverables only
    },
    data_fields: [
      'deliverable_id',
      'user_id',
      'product_track',
      'canai_output',
      'word_count',
      'trust_delta',
      'emotional_resonance',
      'user_satisfaction',
      'pdf_url',
      'created_at',
    ],
    format: 'json',
    include_metadata: true,
    anonymize_data: true, // For portfolio/marketing use
  }),
});
```

## 🔗 **CRM Integration Examples**

### **Salesforce Integration**

```javascript
// Salesforce bulk data import with CanAI platform data
const salesforceIntegration = {
  endpoint: 'https://your-instance.salesforce.com/services/data/v54.0/sobjects/Contact',

  async exportToSalesforce(canaiData) {
    const salesforceContacts = canaiData.users.map(user => ({
      // Standard Salesforce fields
      FirstName: user.firstName,
      LastName: user.lastName,
      Email: user.email,
      Phone: user.phone,

      // Custom CanAI fields
      CanAI_User_ID__c: user.userId,
      Journey_Stage__c: user.currentJourneyStage, // F1-F9
      Subscription_Tier__c: user.subscriptionTier,
      Total_Spent__c: user.totalSpent,
      Last_Activity__c: user.lastActivity,

      // AI-specific metrics
      Trust_Delta_Average__c: user.trustDeltaAverage,
      Emotional_Resonance_Score__c: user.emotionalResonanceAverage,
      Deliverables_Created__c: user.deliverablesCount,

      // Engagement metrics
      Sessions_Count__c: user.totalSessions,
      Spark_Generations__c: user.sparkGenerationsCount,
      Referrals_Made__c: user.referralsMade,

      // Satisfaction and feedback
      NPS_Score__c: user.npsScore,
      Overall_Satisfaction__c: user.averageRating,

      // Business context
      Business_Type__c: user.businessType,
      Funding_Goal__c: user.fundingGoal,
      Location__c: user.location,

      // Lead scoring
      Lead_Score__c: this.calculateLeadScore(user),
      Lifecycle_Stage__c: this.mapJourneyToLifecycle(user.currentJourneyStage),
    }));

    // Bulk insert to Salesforce
    return await this.bulkInsert(salesforceContacts);
  },

  calculateLeadScore(user) {
    let score = 0;
    score += user.trustDeltaAverage * 10; // 0-50 points
    score += user.totalSessions * 2; // Engagement
    score += user.totalSpent / 10; // Revenue value
    score += user.referralsMade * 5; // Advocacy
    return Math.min(score, 100);
  },

  mapJourneyToLifecycle(journeyStage) {
    const mapping = {
      F1: 'Subscriber',
      F2: 'Lead',
      F3: 'Marketing Qualified Lead',
      F4: 'Sales Qualified Lead',
      F5: 'Opportunity',
      F6: 'Opportunity',
      F7: 'Customer',
      F8: 'Customer',
      F9: 'Evangelist',
    };
    return mapping[journeyStage] || 'Other';
  },
};
```

### **HubSpot Integration**

```javascript
// HubSpot contact and deal creation with CanAI enrichment
const hubspotIntegration = {
  apiKey: process.env.HUBSPOT_API_KEY,

  async exportToHubSpot(canaiData) {
    const hubspotContacts = canaiData.users.map(user => ({
      properties: {
        // Standard HubSpot properties
        email: user.email,
        firstname: user.firstName,
        lastname: user.lastName,
        phone: user.phone,

        // CanAI platform data
        canai_user_id: user.userId,
        canai_journey_stage: user.currentJourneyStage,
        canai_subscription_tier: user.subscriptionTier,
        canai_total_spent: user.totalSpent,
        canai_trust_delta: user.trustDeltaAverage,
        canai_emotional_resonance: user.emotionalResonanceAverage,
        canai_deliverables_count: user.deliverablesCount,

        // Business context
        canai_business_type: user.businessType,
        canai_funding_goal: user.fundingGoal,
        canai_product_track: user.preferredProductTrack,

        // Engagement metrics
        canai_sessions_count: user.totalSessions,
        canai_spark_generations: user.sparkGenerationsCount,
        canai_last_activity: user.lastActivity,

        // Satisfaction metrics
        canai_nps_score: user.npsScore,
        canai_satisfaction_rating: user.averageRating,

        // Lead lifecycle
        lifecyclestage: this.mapJourneyToLifecycle(user.currentJourneyStage),
        lead_status: this.getLeadStatus(user),
      },
    }));

    // Create contacts in HubSpot
    const contactResults = await this.batchCreateContacts(hubspotContacts);

    // Create deals for paying customers
    const deals = canaiData.users
      .filter(user => user.totalSpent > 0)
      .map(user => this.createDealFromUser(user));

    const dealResults = await this.batchCreateDeals(deals);

    return { contacts: contactResults, deals: dealResults };
  },

  createDealFromUser(user) {
    return {
      properties: {
        dealname: `${user.firstName} ${user.lastName} - ${user.businessType}`,
        amount: user.totalSpent,
        dealstage: user.currentJourneyStage === 'F9' ? 'closedwon' : 'qualifiedtobuy',
        pipeline: 'default',
        canai_product_track: user.preferredProductTrack,
        canai_trust_delta: user.trustDeltaAverage,
        canai_deliverables: user.deliverablesCount,
      },
      associations: [
        {
          to: { id: user.hubspotContactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
        },
      ],
    };
  },
};
```

### **Pipedrive Integration**

```javascript
// Pipedrive CRM integration with CanAI sales pipeline data
const pipedriveIntegration = {
  apiToken: process.env.PIPEDRIVE_API_TOKEN,

  async exportToPipedrive(canaiData) {
    const pipedrivePersons = canaiData.users.map(user => ({
      name: `${user.firstName} ${user.lastName}`,
      email: [{ value: user.email, primary: true }],
      phone: [{ value: user.phone, primary: true }],

      // Custom fields for CanAI data
      canai_user_id: user.userId,
      canai_journey_stage: user.currentJourneyStage,
      canai_business_type: user.businessType,
      canai_trust_delta: user.trustDeltaAverage,
      canai_emotional_resonance: user.emotionalResonanceAverage,
      canai_total_value: user.totalSpent,
      canai_deliverables_count: user.deliverablesCount,
      canai_satisfaction_score: user.averageRating,
      canai_referrals_made: user.referralsMade,

      // Lead scoring and segmentation
      lead_score: this.calculateLeadScore(user),
      customer_segment: this.getCustomerSegment(user),
      revenue_potential: this.estimateRevenuePotential(user),
    }));

    // Create persons in Pipedrive
    const personResults = await this.batchCreatePersons(pipedrivePersons);

    // Create deals for qualified leads
    const deals = canaiData.users
      .filter(user => this.isQualifiedLead(user))
      .map(user => this.createPipedriveDeal(user));

    const dealResults = await this.batchCreateDeals(deals);

    return { persons: personResults, deals: dealResults };
  },

  createPipedriveDeal(user) {
    return {
      title: `${user.businessType} - ${user.firstName} ${user.lastName}`,
      value: user.fundingGoal || this.estimateRevenuePotential(user),
      currency: 'USD',
      stage_id: this.mapJourneyToStage(user.currentJourneyStage),
      person_id: user.pipedrivePersonId,

      // Custom deal fields
      canai_product_track: user.preferredProductTrack,
      canai_trust_delta: user.trustDeltaAverage,
      canai_funding_goal: user.fundingGoal,
      canai_business_description: user.businessDescription,
      expected_close_date: this.estimateCloseDate(user),
    };
  },

  isQualifiedLead(user) {
    return (
      user.currentJourneyStage >= 'F3' && user.trustDeltaAverage >= 4.0 && user.totalSessions >= 2
    );
  },

  estimateRevenuePotential(user) {
    const baseValue =
      {
        business_builder: 99,
        social_email: 49,
        site_audit: 79,
      }[user.preferredProductTrack] || 99;

    // Multiply by engagement and satisfaction factors
    const engagementMultiplier = Math.min(user.totalSessions / 3, 3);
    const satisfactionMultiplier = user.averageRating / 5;

    return Math.round(baseValue * engagementMultiplier * satisfactionMultiplier);
  },
};
```

## 📈 **Advanced Analytics Export**

### **User Journey Analytics**

```javascript
// Comprehensive user journey funnel analysis
const journeyAnalyticsExport = await fetch('https://canai-router.onrender.com/v1/export', {
  method: 'POST',
  headers: headers,
  body: JSON.stringify({
    export_type: 'analytics',
    data_fields: [
      'stage_completion_rates',
      'average_time_per_stage',
      'drop_off_points',
      'conversion_funnels',
      'user_paths',
      'engagement_patterns',
      'satisfaction_by_stage',
      'trust_delta_progression',
      'emotional_resonance_journey',
    ],
    date_range: {
      start: '2024-01-01T00:00:00Z',
      end: '2024-12-31T23:59:59Z',
    },
    format: 'json',
    include_metadata: true,
  }),
});

// Process journey analytics for business intelligence
const journeyMetrics = await journeyAnalyticsExport.json();

// Example response structure:
/*
{
  "data": {
    "stage_completion_rates": {
      "F1_to_F2": 0.87,  // 87% complete F1 → F2
      "F2_to_F3": 0.73,  // 73% complete F2 → F3
      "F3_to_F4": 0.45,  // 45% make purchase
      "F4_to_F7": 0.92,  // 92% complete after purchase
      "F7_to_F8": 0.78,  // 78% view SparkSplit
      "F8_to_F9": 0.85   // 85% provide feedback
    },
    "average_time_per_stage": {
      "F1": 120,  // 2 minutes average
      "F2": 180,  // 3 minutes average
      "F3": 300,  // 5 minutes average
      "F4": 240,  // 4 minutes average
      "F5": 900,  // 15 minutes average
      "F6": 60,   // 1 minute average
      "F7": 0,    // Generated async
      "F8": 180,  // 3 minutes average
      "F9": 120   // 2 minutes average
    }
  }
}
*/
```

### **Revenue and Performance Analytics**

```javascript
// Export revenue analytics and performance metrics
const revenueAnalytics = await fetch('https://canai-router.onrender.com/v1/export', {
  method: 'POST',
  headers: headers,
  body: JSON.stringify({
    export_type: 'analytics',
    data_fields: [
      'monthly_recurring_revenue',
      'customer_lifetime_value',
      'churn_rates',
      'revenue_by_product_track',
      'upgrade_conversion_rates',
      'refund_rates',
      'geographic_revenue_distribution',
      'customer_acquisition_cost',
      'api_performance_metrics',
      'system_uptime_percentage',
    ],
    format: 'csv',
    include_metadata: true,
  }),
});
```

## 🔄 **Real-time Integration via Webhooks**

### **Webhook Configuration**

```javascript
// Configure webhooks for real-time CRM synchronization
const webhookConfig = {
  url: 'https://your-crm.com/webhooks/canai',
  events: [
    'user.registered',
    'user.journey_stage_completed',
    'payment.completed',
    'deliverable.generated',
    'feedback.submitted',
    'user.referred_signup',
  ],
  auth: {
    type: 'bearer',
    token: process.env.WEBHOOK_SECRET,
  },
};

// Example webhook payload for user journey stage completion
/*
{
  "event": "user.journey_stage_completed",
  "timestamp": "2024-12-15T10:30:00Z",
  "data": {
    "user_id": "user_uuid_123",
    "email": "sarah@sprinklehaven.com",
    "stage_completed": "F7",
    "stage_name": "Deliverable Generation",
    "completion_time_ms": 1847,
    "trust_delta": 4.3,
    "emotional_resonance": 0.82,
    "deliverable_metadata": {
      "product_track": "business_builder",
      "word_count": 753,
      "pdf_url": "https://storage.supabase.co/v1/object/plans/business_plan_123.pdf"
    }
  }
}
*/
```

### **CRM Webhook Handlers**

```javascript
// Example webhook handler for Salesforce
app.post('/webhooks/canai', async (req, res) => {
  const { event, data } = req.body;

  switch (event) {
    case 'user.journey_stage_completed':
      await updateSalesforceContact(data.user_id, {
        CanAI_Journey_Stage__c: data.stage_completed,
        CanAI_Trust_Delta__c: data.trust_delta,
        CanAI_Last_Activity__c: data.timestamp,
      });
      break;

    case 'payment.completed':
      await createSalesforceOpportunity({
        ContactId: data.user_id,
        Amount: data.amount,
        StageName: 'Closed Won',
        CloseDate: new Date().toISOString().split('T')[0],
        Name: `${data.product_track} - ${data.user_email}`,
      });
      break;

    case 'deliverable.generated':
      await updateSalesforceContact(data.user_id, {
        CanAI_Deliverables_Count__c: data.total_deliverables,
        CanAI_Latest_Deliverable__c: data.deliverable_url,
      });
      break;
  }

  res.status(200).json({ received: true });
});
```

## 📋 **Data Schema Reference**

### **User Data Schema**

```typescript
interface ExportedUser {
  // Core user data
  user_id: string;
  email: string;
  created_at: string;
  last_active_at: string;

  // Journey progress
  current_journey_stage: 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9';
  stages_completed: string[];
  journey_completion_percentage: number;

  // Business context
  business_type: string;
  business_description?: string;
  location?: string;
  funding_goal?: number;

  // AI metrics
  trust_delta_average: number;
  emotional_resonance_average: number;
  deliverables_generated: number;
  sparks_generated: number;

  // Engagement
  total_sessions: number;
  total_time_spent_seconds: number;
  last_login: string;

  // Financial
  subscription_tier: 'standard' | 'premium';
  total_spent: number;
  lifetime_value: number;

  // Satisfaction
  nps_score?: number;
  average_rating?: number;
  feedback_count: number;

  // Referrals
  referrals_made: number;
  referral_conversions: number;
}
```

### **Analytics Data Schema**

```typescript
interface AnalyticsExport {
  // Time period
  date_range: {
    start: string;
    end: string;
  };

  // User metrics
  total_users: number;
  new_users: number;
  active_users: number;
  churned_users: number;

  // Journey metrics
  funnel_conversion_rates: Record<string, number>;
  average_journey_time: number;
  stage_completion_rates: Record<string, number>;

  // Quality metrics
  average_trust_delta: number;
  average_emotional_resonance: number;
  user_satisfaction_score: number;

  // Revenue metrics
  total_revenue: number;
  monthly_recurring_revenue: number;
  average_order_value: number;
  customer_lifetime_value: number;

  // Performance metrics
  api_response_times: Record<string, number>;
  system_uptime_percentage: number;
  error_rates: Record<string, number>;
}
```

## 🛡️ **Security and Compliance**

### **Data Privacy and GDPR Compliance**

```javascript
// GDPR-compliant data export with anonymization
const gdprExport = await fetch('https://canai-router.onrender.com/v1/export', {
  method: 'POST',
  headers: headers,
  body: JSON.stringify({
    export_type: 'user_data',
    user_filters: {
      user_ids: ['specific_user_uuid'],
    },
    data_fields: ['all'], // Complete user data
    format: 'json',
    anonymize_data: false, // Full data for GDPR request
    include_metadata: true,
    compliance_mode: 'gdpr_export',
  }),
});

// Anonymized export for marketing/analytics
const anonymizedExport = await fetch('https://canai-router.onrender.com/v1/export', {
  method: 'POST',
  headers: headers,
  body: JSON.stringify({
    export_type: 'analytics',
    anonymize_data: true, // Remove PII
    data_fields: [
      'journey_patterns',
      'satisfaction_trends',
      'geographic_insights',
      'product_performance',
    ],
    format: 'csv',
  }),
});
```

### **API Security**

- **Authentication**: Bearer token authentication with API key rotation
- **Rate Limiting**: 100 requests per minute per API key
- **Data Encryption**: All exports encrypted in transit and at rest
- **Access Logging**: Complete audit trail of all export requests
- **IP Whitelisting**: Optional IP restriction for sensitive exports

### **Export Expiration and Cleanup**

- **Download URLs**: Expire after 24 hours for security
- **Temporary Files**: Automatically deleted after 48 hours
- **Access Logs**: Retained for 12 months for audit purposes
- **Large Exports**: Chunked for files >100MB

## 📞 **Support and Troubleshooting**

### **Common Issues**

1. **Export Timeout**: Large exports may take several minutes - use async processing
2. **Rate Limiting**: Implement exponential backoff for API calls
3. **Data Formatting**: Validate field names match current schema
4. **Authentication**: Ensure API keys have proper export permissions

### **Integration Support**

- **Documentation**: Complete API documentation at `/docs/api`
- **SDKs**: JavaScript/Node.js SDK available
- **Webhooks**: Real-time integration support
- **Custom Fields**: CRM-specific field mapping assistance

This comprehensive CRM export guide enables seamless integration of CanAI platform data with
external business systems while maintaining security, compliance, and data integrity standards per
PRD requirements.

---

**Last Updated:** June 2025 **Version:** 2.0.0 **API Version:** v2 **Compatibility:** All major CRM
systems
