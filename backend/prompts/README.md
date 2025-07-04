# CanAI Emotionally Intelligent Prompt Framework

## 🎯 Gold Standard Implementation

This framework implements the exact gold standard specification provided for emotionally intelligent
prompt templates. It ensures consistent quality, emotional resonance, and cultural awareness across
all CanAI outputs.

## 📋 Core Specifications

### Input Data Schema

```json
{
  "businessName": "string",
  "targetAudience": "string (with location)",
  "primaryGoal": "string",
  "brandVoice": "string (warm|innovative|professional|playful|bold|caring)",
  "businessDescription": "string",
  "competitiveContext": "string (optional)",
  "resourceConstraints": "string (optional)",
  "currentStatus": "string (optional)",
  "revenueModel": "string (optional)",
  "planPurpose": "string (optional)"
}
```

### Output Schema (Gold Standard)

```json
{
  "Summary": {
    "Summary": "string (15-25 words)",
    "ConfidenceScore": "number (0.0-1.0)",
    "ClarifyingQuestions": "array"
  },
  "Plan": {
    "CanAI_Output": "string (emotionally resonant, culturally aware)",
    "Generic_Output": "string (neutral, formulaic)",
    "TrustDelta": "number (0.0-5.0)"
  },
  "PostPurchase": {
    "ConfirmationEmail": "string",
    "PDFDownload": "string (optional)",
    "FeedbackPrompt": "string",
    "FollowUpEmail": "string",
    "ShareOption": "string"
  }
}
```

## 🧠 Emotional Intelligence Engine

### Brand Voice Mapping

- **warm**: heartfelt connection, community-focused, nurturing, welcoming, authentic
- **innovative**: forward-thinking, pioneering, disruptive, cutting-edge, visionary
- **professional**: trustworthy, reliable, expert-driven, authoritative, polished
- **playful**: joyful, creative, engaging, lighthearted, inspiring
- **bold**: confident, daring, impactful, ambitious, transformative
- **caring**: empathetic, supportive, understanding, compassionate, healing

### Cultural Context Intelligence

Currently supports:

- **Denver, CO**: outdoor lifestyle, craft culture, community-minded, environmentally conscious
- **Austin, TX**: keep it weird, music culture, entrepreneurial spirit, food scene
- **Default**: quality, community, innovation, growth, authenticity

## 🚀 Quick Start

### 1. Business Plan Generation

```javascript
const { BusinessPlanTemplate } = require('./businessPlanTemplate');

const businessPlan = new BusinessPlanTemplate();

const inputData = {
  businessName: 'Sprinkle Haven Bakery',
  targetAudience: 'Local families and young professionals in Denver, CO',
  primaryGoal: 'Secure $75,000 funding to open a flagship store',
  brandVoice: 'warm',
  businessDescription:
    'A cozy bakery offering artisan pastries, custom cakes, and coffee, fostering community through events',
};

const result = await businessPlan.generateBusinessPlan(inputData);
```

## 📁 File Structure

```
backend/prompts/
├── framework.js              # Core emotional intelligence framework
├── businessPlanTemplate.js   # Business plan specific implementation
├── integration.js           # GPT-4o service integration
├── testGoldStandard.js      # Testing framework with gold standard
├── PROMPT_TEMPLATES_DESIGN.md # Detailed design documentation
└── README.md                # This file
```

## 🎯 Gold Standard Example

**Input**: Sprinkle Haven Bakery (Denver, CO, warm brand voice)

**Expected Output**:

- **Summary**: "Launch Sprinkle Haven Bakery with warm tone to unite Denver families via cozy
  artisan experiences."
- **ConfidenceScore**: 0.97
- **TrustDelta**: 4.8
- **CanAI_Output**: Emotionally intelligent, culturally aware business plan
- **Generic_Output**: Neutral, formulaic business plan
- **PostPurchase**: Personalized follow-up content

## 💡 Philosophy

**Quality > Cost**: Prioritize exceptional customer experience and emotional resonance while being
responsible with resource usage.

**Cultural Intelligence**: Every output should demonstrate deep understanding of local culture,
values, and context.

**Brand Voice Authenticity**: Maintain unwavering consistency with the customer's brand voice.

**Measurable Emotional Impact**: Use TrustDelta scores to quantify the emotional advantage of CanAI
outputs.

# Prompt Templates (Task 5.4)

Implements prompt templates for CanAI's three product tracks per PRD Sections 6.2, 6.7, 6.8, 10.2,
10.3:

- **businessPlanTemplate.js**: Generates 700–800-word business plans (PRD Section 10.1, Sprinkle
  Haven).
- **socialMediaTemplate.js**: Generates 3–7 social posts, 3–5 emails (PRD Section 10.2, Serenity
  Yoga).
- **websiteAuditTemplate.js**: Generates 300–400-word website audits (PRD Section 10.3, TechTrend).
  - Accessibility validation now checks for color contrast, alt text, heading structure, focus
    management, and form labels, not just keywords like WCAG/accessibility.
- **framework.js**: Provides emotional/cultural context, versioning, and regex validation (PRD
  Section 6.2).

**Usage**:

```javascript
const socialMediaTemplate = new SocialMediaTemplate();
const campaign = await socialMediaTemplate.generateSocialMediaCampaign({
  businessName: 'Serenity Yoga Studio',
  targetAudience: 'Young professionals in Austin, TX',
  primaryGoal: 'Increase class signups',
  brandVoice: 'inspirational',
  businessDescription: 'A yoga studio offering mindfulness classes',
  socialPlatforms: 'Instagram, Twitter',
  contentStrategy: 'Inspirational posts'
});

PRD Alignment:
Emotional resonance >0.7, TrustDelta ≥4.2 (Section 3).


Response time <1.5s (Section 6.3).


Uses GPT-4o only (Section 1.5).


Stores templates in prompt_templates (Section 6.2).
```
