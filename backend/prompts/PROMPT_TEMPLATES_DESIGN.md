# CanAI Prompt Templates Design Document

## Overview

This document defines the emotionally intelligent prompt template system for the CanAI Emotional
Sovereignty Platform. The system generates dual outputs (CanAI vs Generic) with cultural context,
emotional resonance, and structured responses across three core use cases: Business Plans, Social
Media Campaigns, and Website Audits.

---

## Gold Standard: Business Plan Template

### 1. Prompt Specification

```json
{
  "Prompt": [
    "Act as a world-class Business Strategy Consultant and Emotional Intelligence Specialist, crafting investor-ready business plans that reflect the customer's vision and voice.",
    "Deliver two 700–800-word business plans: a tone-aligned, emotionally resonant **CanAI_Output**, and a neutral **Generic_Output**.",
    "Strictly follow structure: Vision & Mission, Market Opportunity, Growth Strategy, Impact Roadmap.",
    "Incorporate hyper-local cultural context, inferred emotional drivers, and brand voice.",
    "Return: Summary (15–25 words), ClarifyingQuestions (if needed), TrustDelta score (0.0–5.0), PostPurchase content.",
    "Validate all constraints (e.g., word count, sections, latency, tone), and securely deliver via Supabase + Memberstack after Stripe purchase."
  ]
}
```

### 2. Example Input Data

```json
{
  "businessName": "Sprinkle Haven Bakery",
  "targetAudience": "Local families and young professionals in Denver, CO",
  "primaryGoal": "Secure $75,000 funding to open a flagship store",
  "competitiveContext": "Competing with Starbucks and The Denver Brew",
  "brandVoice": "warm",
  "resourceConstraints": "$50,000 budget, team of 3, 6-month timeline",
  "currentStatus": "Pre-launch, building pitch deck",
  "businessDescription": "A cozy bakery offering artisan pastries, custom cakes, and coffee, fostering community through events",
  "revenueModel": "Direct sales, catering, merchandise",
  "planPurpose": "Investor pitch for angel funding"
}
```

### 3. Expected Output Structure

```json
{
  "Summary": {
    "Summary": "Launch Sprinkle Haven Bakery with warm tone to unite Denver families via cozy artisan experiences.",
    "ConfidenceScore": 0.97,
    "ClarifyingQuestions": []
  },
  "Plan": {
    "CanAI_Output": "[700–800-word emotionally intelligent and culturally specific business plan tailored to Sprinkle Haven Bakery]",
    "Generic_Output": "[700–800-word neutral, formulaic plan for Sprinkle Haven Bakery]",
    "TrustDelta": 4.8
  },
  "PostPurchase": {
    "ConfirmationEmail": "Thank you for choosing CanAI, [userName]! Your Sprinkle Haven Bakery plan is ready. Access it now.",
    "PDFDownload": "https://supabase.com/files/plan-12345.pdf",
    "FeedbackPrompt": "Does this plan capture your vision and voice? Rate 1–5. How does it inspire your community focus? [Open-ended response]",
    "FollowUpEmail": "How's your Sprinkle Haven Bakery journey? Share your progress or refine with CanAI.",
    "ShareOption": "Share your vision on Instagram via Webflow button"
  }
}
```

---

## Framework Architecture

### Core Principles

1. **Dual Output Strategy**: Always generate both CanAI (emotionally resonant) and Generic (neutral)
   outputs
2. **Structured Response**: Return Summary, Core Content, and PostPurchase objects with specific
   fields
3. **Emotional Intelligence**: Infer emotional drivers, incorporate cultural context, maintain brand
   voice
4. **Quality Over Cost**: Prioritize exceptional customer experience while being cost-conscious
5. **Comprehensive Context**: Use rich input data for personalization

### Template Structure

```javascript
const templateStructure = {
  systemPrompt: ['Role definition', 'Quality standards', 'Context awareness'],
  userPrompt: 'Structured prompt with {placeholders}',
  outputSchema: {
    Summary: { Summary: 'string', ConfidenceScore: 'number', ClarifyingQuestions: 'array' },
    CoreContent: { CanAI_Output: 'string', Generic_Output: 'string', TrustDelta: 'number' },
    PostPurchase: {
      /* Tailored to use case */
    },
  },
};
```

### Emotional Driver Intelligence

```javascript
const emotionalDriverMap = {
  // Brand Voice → Emotional Drivers
  warm: ['heartfelt connection', 'community-focused', 'nurturing'],
  innovative: ['forward-thinking', 'pioneering', 'disruptive'],
  professional: ['trustworthy', 'reliable', 'expert-driven'],
  playful: ['joyful', 'creative', 'engaging'],

  // Context-Based Drivers
  family_business: ['generational', 'legacy-building', 'family values'],
  tech_startup: ['scalable', 'data-driven', 'user-centric'],
  local_business: ['community-rooted', 'neighborhood-focused', 'locally-sourced'],
};
```

### Cultural Context Engine

```javascript
const culturalContextMap = {
  'Denver, CO': {
    values: ['outdoor lifestyle', 'craft culture', 'community-minded'],
    businessContext: ['local sourcing', 'sustainability', 'work-life balance'],
    demographicInsights: ['health-conscious', 'environmentally aware', 'tech-savvy'],
  },
};
```

---

## Social Media & Email Campaign Template

### 1. Prompt Specification

```json
{
  "Prompt": [
    "Act as a world-class Social Media Strategist and Emotional Intelligence Specialist, crafting engaging campaigns that amplify the customer's authentic voice.",
    "Deliver two comprehensive campaign packages: an emotionally resonant, culturally-aware **CanAI_Output**, and a neutral **Generic_Output**.",
    "Include: 5 social media posts, 3 email templates, hashtag strategy, content calendar, and engagement tactics.",
    "Incorporate platform-specific best practices, cultural nuances, and brand voice alignment.",
    "Return: Summary (15–25 words), ClarifyingQuestions (if needed), TrustDelta score (0.0–5.0), PostPurchase content.",
    "Optimize for maximum engagement, authentic connection, and measurable growth."
  ]
}
```

### 2. Example Input Data

```json
{
  "businessName": "Sprinkle Haven Bakery",
  "targetAudience": "Local families and young professionals in Denver, CO",
  "primaryGoal": "Build brand awareness and drive foot traffic to grand opening",
  "platforms": ["Instagram", "Facebook", "Email"],
  "brandVoice": "warm",
  "campaignDuration": "4 weeks pre-launch",
  "contentThemes": ["artisan craftsmanship", "community events", "local ingredients"],
  "businessDescription": "A cozy bakery offering artisan pastries, custom cakes, and coffee, fostering community through events",
  "specialOffers": "Grand opening 20% off, free coffee with pastry purchase",
  "currentFollowing": "150 Instagram followers, 300 email subscribers"
}
```

### 3. Expected Output Structure

```json
{
  "Summary": {
    "Summary": "Warm, community-focused social campaign showcasing artisan craftsmanship to drive Denver grand opening traffic.",
    "ConfidenceScore": 0.94,
    "ClarifyingQuestions": []
  },
  "Campaign": {
    "CanAI_Output": {
      "SocialPosts": "[5 emotionally resonant, culturally-aware posts]",
      "EmailTemplates": "[3 warm, community-focused email templates]",
      "HashtagStrategy": "[Local Denver hashtags + artisan baking tags]",
      "ContentCalendar": "[4-week strategic posting schedule]",
      "EngagementTactics": "[Community-building strategies]"
    },
    "Generic_Output": {
      "SocialPosts": "[5 standard promotional posts]",
      "EmailTemplates": "[3 generic marketing emails]",
      "HashtagStrategy": "[Standard baking/food hashtags]",
      "ContentCalendar": "[Basic posting frequency]",
      "EngagementTactics": "[Standard social media practices]"
    },
    "TrustDelta": 4.6
  },
  "PostPurchase": {
    "ConfirmationEmail": "Your Sprinkle Haven social media campaign is ready! Time to build your community.",
    "ImplementationGuide": "Step-by-step guide for campaign execution",
    "FeedbackPrompt": "Does this campaign capture your warm, community spirit? Rate and share feedback.",
    "FollowUpEmail": "How's your campaign performing? Let's optimize based on early results.",
    "ShareOption": "Share your campaign launch on LinkedIn"
  }
}
```

---

## Website Audit & Feedback Template

### 1. Prompt Specification

```json
{
  "Prompt": [
    "Act as a world-class UX Strategist and Emotional Intelligence Specialist, providing comprehensive website audits that enhance user experience and emotional connection.",
    "Deliver two detailed audit reports: an emotionally intelligent, brand-aligned **CanAI_Output**, and a technical **Generic_Output**.",
    "Analyze: User experience, emotional journey, conversion optimization, accessibility, performance, and brand alignment.",
    "Incorporate emotional design principles, cultural considerations, and brand voice consistency.",
    "Return: Summary (15–25 words), ClarifyingQuestions (if needed), TrustDelta score (0.0–5.0), PostPurchase content.",
    "Provide actionable recommendations prioritized by impact and implementation difficulty."
  ]
}
```

### 2. Example Input Data

```json
{
  "businessName": "Sprinkle Haven Bakery",
  "websiteUrl": "https://sprinklehavenbakery.com",
  "targetAudience": "Local families and young professionals in Denver, CO",
  "primaryGoal": "Drive online orders and event bookings",
  "brandVoice": "warm",
  "currentChallenges": ["Low conversion rate", "High bounce rate on mobile"],
  "businessDescription": "A cozy bakery offering artisan pastries, custom cakes, and coffee, fostering community through events",
  "competitorUrls": ["starbucks.com/store-locator/co/denver", "denverbrew.com"],
  "keyPages": ["Home", "Menu", "Catering", "Events", "Contact"],
  "conversionGoals": ["Online orders", "Event bookings", "Email signups"]
}
```

### 3. Expected Output Structure

```json
{
  "Summary": {
    "Summary": "Enhance warm, community-focused user experience to boost Denver bakery conversions and emotional connection.",
    "ConfidenceScore": 0.92,
    "ClarifyingQuestions": []
  },
  "Audit": {
    "CanAI_Output": {
      "EmotionalJourneyAnalysis": "[User emotional experience assessment]",
      "BrandAlignmentReview": "[Consistency with warm, community voice]",
      "CulturalRelevanceCheck": "[Denver-specific optimization opportunities]",
      "ConversionOptimization": "[Emotionally-driven improvement recommendations]",
      "AccessibilityAssessment": "[Inclusive design evaluation]",
      "ActionPlan": "[Prioritized recommendations with emotional impact focus]"
    },
    "Generic_Output": {
      "TechnicalAnalysis": "[Standard UX/UI assessment]",
      "PerformanceMetrics": "[Speed, SEO, mobile responsiveness]",
      "ConversionAnalysis": "[Standard CRO recommendations]",
      "CompetitorComparison": "[Feature and design benchmarking]",
      "TechnicalIssues": "[Bug reports and technical fixes]",
      "StandardRecommendations": "[Industry best practices]"
    },
    "TrustDelta": 4.4
  },
  "PostPurchase": {
    "ConfirmationEmail": "Your Sprinkle Haven website audit is complete! Ready to enhance your digital presence.",
    "ImplementationRoadmap": "Phased improvement plan with timelines",
    "FeedbackPrompt": "Does this audit reflect your vision for community connection? Rate and comment.",
    "FollowUpEmail": "How are the website improvements going? Need help prioritizing next steps?",
    "ShareOption": "Share your website transformation journey on social media"
  }
}
```

---

## Implementation Strategy

### File Structure

```
backend/prompts/
├── templates.js          # Main template engine
├── businessPlan.js       # Business plan specific logic
├── socialMedia.js        # Social media campaign logic
├── websiteAudit.js       # Website audit logic
├── emotionalDrivers.js   # Emotional driver mapping
├── culturalContext.js    # Location-based insights
└── validators.js         # Input/output validation
```

### Quality vs Cost Balance

#### Tier-Based Approach

1. **Premium Tier (Gold Standard)**:
   - Full word count outputs (700-800 words for business plans)
   - Rich cultural context and emotional intelligence
   - Complete PostPurchase package

2. **Standard Tier**:
   - Condensed outputs (400-500 words)
   - Basic emotional drivers
   - Essential PostPurchase elements

#### Smart Optimization

```javascript
const getOptimalParams = (inputComplexity, userTier) => {
  if (userTier === 'premium') {
    return { max_tokens: 4096, temperature: 0.8 }; // Full quality
  }
  return { max_tokens: 2048, temperature: 0.7 }; // Balanced
};
```

### Testing Strategy

#### Gold Standard Validation

- Use Sprinkle Haven examples as benchmarks for each template
- Validate output structure matches expected format
- Ensure emotional resonance and cultural relevance

#### Quality Metrics

- TrustDelta score consistency (target: >4.0)
- Word count adherence
- Emotional driver integration
- Cultural context relevance
- Brand voice alignment

---

## Next Steps

1. **Build template engine** with business plan as primary template
2. **Implement emotional driver and cultural context systems**
3. **Test with Sprinkle Haven data** to validate gold standard output
4. **Extend to social media and website audit templates**
5. **Create comprehensive test suite** for all templates

---

_This document serves as the foundational design for CanAI's emotionally intelligent prompt system,
ensuring consistent quality and user experience across all content generation use cases._
