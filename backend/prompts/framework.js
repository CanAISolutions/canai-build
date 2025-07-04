/**
 * CanAI Emotionally Intelligent Prompt Template Framework
 *
 * Updated to include template versioning and regex input validation per PRD Section 6.2.
 */

import Joi from 'joi';

class EmotionallyIntelligentPromptFramework {
  constructor() {
    this.goldStandardSchema = {
      Summary: {
        Summary: 'string (15-25 words)',
        ConfidenceScore: 'number (0.0-1.0)',
        ClarifyingQuestions: 'array',
      },
      CoreContent: {
        CanAI_Output: 'string (emotionally resonant, culturally aware)',
        Generic_Output: 'string (neutral, formulaic)',
        TrustDelta: 'number (0.0-5.0)',
      },
      PostPurchase: {
        ConfirmationEmail: 'string',
        PDFDownload: 'string (optional)',
        FeedbackPrompt: 'string',
        FollowUpEmail: 'string',
        ShareOption: 'string',
      },
    };

    // Input validation schema (PRD Section 6.2)
    this.inputSchema = Joi.object({
      businessName: Joi.string().min(3).max(100).required(),
      targetAudience: Joi.string().min(5).max(100).required(),
      primaryGoal: Joi.string()
        .regex(/^[a-zA-Z0-9\s,.$%&()-]{5,100}$/)
        .required(),
      brandVoice: Joi.string()
        .valid(
          'warm',
          'bold',
          'optimistic',
          'professional',
          'playful',
          'inspirational',
          'custom'
        )
        .required(),
      customTone: Joi.string()
        .regex(/^[a-zA-Z0-9\s]{1,50}$/)
        .when('brandVoice', { is: 'custom', then: Joi.required() }),
      businessDescription: Joi.string().min(10).max(500).required(),
      socialPlatforms: Joi.string().when('templateType', {
        is: 'socialMedia',
        then: Joi.required(),
      }),
      contentStrategy: Joi.string().when('templateType', {
        is: 'socialMedia',
        then: Joi.required(),
      }),
      contentSource: Joi.string()
        .uri()
        .when('templateType', { is: 'websiteAudit', then: Joi.required() }),
      auditScope: Joi.string().when('templateType', {
        is: 'websiteAudit',
        then: Joi.required(),
      }),
    }).unknown(true);

    // Emotional Driver Intelligence Engine
    this.emotionalDrivers = {
      brandVoice: {
        warm: [
          'heartfelt connection',
          'community-focused',
          'nurturing',
          'welcoming',
          'authentic',
        ],
        innovative: [
          'forward-thinking',
          'pioneering',
          'disruptive',
          'cutting-edge',
          'visionary',
        ],
        professional: [
          'trustworthy',
          'reliable',
          'expert-driven',
          'authoritative',
          'polished',
        ],
        playful: [
          'joyful',
          'creative',
          'engaging',
          'lighthearted',
          'inspiring',
        ],
        bold: [
          'confident',
          'daring',
          'impactful',
          'ambitious',
          'transformative',
        ],
        caring: [
          'empathetic',
          'supportive',
          'understanding',
          'compassionate',
          'healing',
        ],
      },
      businessContext: {
        family_business: [
          'generational',
          'legacy-building',
          'family values',
          'tradition',
          'heritage',
        ],
        tech_startup: [
          'scalable',
          'data-driven',
          'user-centric',
          'agile',
          'innovative',
        ],
        local_business: [
          'community-rooted',
          'neighborhood-focused',
          'locally-sourced',
          'personal',
          'intimate',
        ],
        b2b_service: [
          'partnership-focused',
          'results-driven',
          'strategic',
          'collaborative',
          'growth-oriented',
        ],
        creative_agency: [
          'artistic',
          'expressive',
          'original',
          'inspiring',
          'boundary-pushing',
        ],
      },
      audienceContext: {
        families: [
          'safety-focused',
          'value-driven',
          'community-minded',
          'future-planning',
          'nurturing',
        ],
        professionals: [
          'efficiency-focused',
          'growth-oriented',
          'network-building',
          'career-advancing',
          'time-conscious',
        ],
        entrepreneurs: [
          'risk-taking',
          'opportunity-seeking',
          'independence-valued',
          'innovation-driven',
          'resilience-focused',
        ],
        creatives: [
          'self-expression',
          'authenticity-seeking',
          'inspiration-driven',
          'uniqueness-valued',
          'artistic',
        ],
      },
    };

    // Cultural Context Intelligence Engine
    this.culturalContext = {
      'Denver, CO': {
        values: [
          'outdoor lifestyle',
          'craft culture',
          'community-minded',
          'environmentally conscious',
          'work-life balance',
        ],
        businessContext: [
          'local sourcing',
          'sustainability focus',
          'craft brewing culture',
          'outdoor recreation',
          'tech-friendly',
        ],
        demographicInsights: [
          'health-conscious',
          'environmentally aware',
          'tech-savvy',
          'active lifestyle',
          'community-engaged',
        ],
        localReferences: [
          'Mile High City',
          'Rocky Mountains',
          'craft beer scene',
          'outdoor recreation',
          'tech hub',
        ],
      },
      'Austin, TX': {
        values: [
          'keep it weird',
          'music culture',
          'entrepreneurial spirit',
          'food scene',
          'tech innovation',
        ],
        businessContext: [
          'creative industries',
          'tech startups',
          'music venues',
          'food trucks',
          'SXSW culture',
        ],
        demographicInsights: [
          'creative professionals',
          'young professionals',
          'music lovers',
          'foodie culture',
          'tech workers',
        ],
        localReferences: [
          'Keep Austin Weird',
          'SXSW',
          'food truck culture',
          'live music',
          'tech corridor',
        ],
      },
      default: {
        values: [
          'quality',
          'community',
          'innovation',
          'growth',
          'authenticity',
        ],
        businessContext: [
          'customer-focused',
          'growth-oriented',
          'quality-driven',
          'service-excellence',
        ],
        demographicInsights: [
          'value-conscious',
          'quality-seeking',
          'relationship-focused',
          'results-oriented',
        ],
        localReferences: [],
      },
    };
  }

  /**
   * Validate inputs with Joi schema
   */
  validateInputs(inputData, templateType) {
    const { error } = this.inputSchema.validate(
      { ...inputData, templateType },
      { abortEarly: false }
    );
    if (error) {
      throw new Error(
        `Input validation failed: ${error.details.map(d => d.message).join(', ')}`
      );
    }
    return true;
  }

  /**
   * Store template in Supabase (no-op if not configured)
   */
  async storeTemplate(templateType, version, content) {
    if (
      typeof process === 'undefined' ||
      !process.env ||
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_KEY
    )
      return;
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    const { error } = await supabase.from('prompt_templates').insert({
      template_type: templateType,
      version,
      content,
      created_at: new Date().toISOString(),
    });
    if (error) {
      throw new Error(`Failed to store template: ${error.message}`);
    }
  }

  /**
   * Retrieve latest template version (no-op if not configured)
   */
  async getLatestTemplateVersion(templateType) {
    if (
      typeof process === 'undefined' ||
      !process.env ||
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_KEY
    )
      return null;
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('version, content')
      .eq('template_type', templateType)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error) {
      throw new Error(`Failed to retrieve template: ${error.message}`);
    }
    return data;
  }

  generateSystemPrompt(templateType) {
    const basePrompts = {
      businessPlan: [
        "Act as a world-class Business Strategy Consultant and Emotional Intelligence Specialist, crafting investor-ready business plans that reflect the customer's vision and voice.",
        'Deliver two comprehensive business plans: a tone-aligned, emotionally resonant **CanAI_Output**, and a neutral **Generic_Output**.',
        'Strictly follow structure: Vision & Mission, Market Opportunity, Growth Strategy, Impact Roadmap.',
        'Incorporate hyper-local cultural context, inferred emotional drivers, and brand voice authenticity.',
        'Return: Summary (15–25 words), ClarifyingQuestions (if needed), TrustDelta score (0.0–5.0), PostPurchase content.',
        'Prioritize exceptional quality and emotional resonance while being cost-conscious.',
      ],
      socialMedia: [
        'Act as a world-class Social Media Strategist and Emotional Intelligence Specialist, crafting engaging campaigns that amplify authentic voice and drive meaningful connection.',
        'Deliver two comprehensive campaign packages: an emotionally resonant, culturally-aware **CanAI_Output**, and a neutral **Generic_Output**.',
        'Include: Social media posts (3–7), email templates (3–5), hashtag strategy, content calendar, engagement tactics.',
        'Incorporate platform-specific best practices, cultural nuances, emotional triggers, and brand voice consistency.',
        'Return: Summary (15–25 words), ClarifyingQuestions (if needed), TrustDelta score (0.0–5.0), PostPurchase content.',
        'Optimize for authentic engagement, emotional connection, and measurable growth.',
      ],
      websiteAudit: [
        'Act as a world-class UX Strategist and Emotional Intelligence Specialist, providing comprehensive website audits that enhance user experience and emotional connection.',
        'Deliver two detailed audit reports: an emotionally intelligent, brand-aligned **CanAI_Output**, and a technical **Generic_Output**.',
        'Analyze: User emotional journey, brand alignment, conversion optimization, accessibility (WCAG 2.2 AA), performance.',
        'Incorporate emotional design principles, cultural considerations, brand voice consistency, and user psychology insights.',
        'Return: Summary (15–25 words), ClarifyingQuestions (if needed), TrustDelta score (0.0–5.0), PostPurchase content.',
        'Provide actionable recommendations prioritized by emotional impact and feasibility.',
      ],
    };

    return basePrompts[templateType] || basePrompts.businessPlan;
  }

  generateUserPrompt(inputData, templateType) {
    this.validateInputs(inputData, templateType);
    const emotionalContext = this.buildEmotionalContext(inputData);
    const culturalContext = this.buildCulturalContext(inputData);

    const basePrompt = `
Based on the following information, create ${templateType} content that demonstrates exceptional emotional intelligence and cultural awareness:

**Business Context:**
- Business Name: ${inputData.businessName}
- Description: ${inputData.businessDescription}
- Target Audience: ${inputData.targetAudience}
- Primary Goal: ${inputData.primaryGoal}
- Brand Voice: ${inputData.brandVoice}

**Emotional Intelligence Context:**
${emotionalContext}

**Cultural Context:**
${culturalContext}

**Quality Standards:**
- Prioritize exceptional customer experience and emotional resonance (>0.7)
- Ensure cultural sensitivity and local relevance
- Maintain brand voice authenticity
- Provide actionable, implementable recommendations
- Generate content with TrustDelta ≥4.2

**Output Requirements:**
1. **Summary Object**: 15-25 word summary, confidence score (0.0-1.0), clarifying questions if needed
2. **Core Content**: CanAI_Output (emotionally intelligent), Generic_Output (neutral)
3. **TrustDelta Score**: Rate emotional resonance advantage (0.0–5.0, target ≥4.2)
4. **PostPurchase Object**: Confirmation email, feedback prompt, follow-up email, share option
    `;

    return basePrompt;
  }

  buildEmotionalContext(inputData) {
    const brandDrivers =
      this.emotionalDrivers.brandVoice[inputData.brandVoice?.toLowerCase()] ||
      [];
    const businessType = this.inferBusinessType(inputData.businessDescription);
    const businessDrivers =
      this.emotionalDrivers.businessContext[businessType] || [];
    const audienceType = this.inferAudienceType(inputData.targetAudience);
    const audienceDrivers =
      this.emotionalDrivers.audienceContext[audienceType] || [];

    return `
- Brand Voice Drivers: ${brandDrivers.join(', ')}
- Business Context Drivers: ${businessDrivers.join(', ')}
- Audience Emotional Drivers: ${audienceDrivers.join(', ')}
- Inferred Emotional Themes: ${this.inferEmotionalThemes(inputData)}
    `.trim();
  }

  buildCulturalContext(inputData) {
    const location = this.extractLocation(inputData.targetAudience);
    const context =
      this.culturalContext[location] || this.culturalContext.default;

    return `
- Location: ${location}
- Cultural Values: ${context.values.join(', ')}
- Business Context: ${context.businessContext.join(', ')}
- Demographic Insights: ${context.demographicInsights.join(', ')}
- Local References: ${context.localReferences.join(', ')}
    `.trim();
  }

  inferBusinessType(description) {
    const keywords = {
      family_business: ['family', 'heritage', 'tradition', 'generational'],
      tech_startup: ['app', 'platform', 'software', 'tech', 'digital', 'AI'],
      local_business: [
        'local',
        'community',
        'neighborhood',
        'bakery',
        'restaurant',
      ],
      b2b_service: [
        'consulting',
        'services',
        'business',
        'enterprise',
        'corporate',
      ],
      creative_agency: [
        'design',
        'creative',
        'agency',
        'marketing',
        'advertising',
      ],
    };

    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => description.toLowerCase().includes(word))) {
        return type;
      }
    }
    return 'local_business';
  }

  inferAudienceType(audience) {
    const keywords = {
      families: ['families', 'parents', 'children', 'family'],
      professionals: ['professionals', 'executives', 'managers', 'workers'],
      entrepreneurs: [
        'entrepreneurs',
        'business owners',
        'startups',
        'founders',
      ],
      creatives: ['artists', 'designers', 'creatives', 'musicians'],
    };

    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => audience.toLowerCase().includes(word))) {
        return type;
      }
    }
    return 'professionals';
  }

  extractLocation(targetAudience) {
    const locationMatch = targetAudience.match(/in ([^,]+,?\s*[A-Z]{2})/i);
    return locationMatch ? locationMatch[1] : 'default';
  }

  inferEmotionalThemes(inputData) {
    const themes = [];
    if (inputData.businessDescription?.includes('community'))
      themes.push('community connection');
    if (inputData.primaryGoal?.includes('funding'))
      themes.push('growth ambition');
    if (inputData.brandVoice === 'warm') themes.push('authentic relationships');
    if (inputData.targetAudience?.includes('families'))
      themes.push('family values');
    return themes.join(', ') || 'authenticity, growth, connection';
  }

  validateOutput(output) {
    const errors = [];
    // Validate Summary
    if (!output.Summary) errors.push('Missing Summary');
    // Validate CoreContent/Plan/Campaign/Audit
    if (
      !output.CoreContent &&
      !output.Plan &&
      !output.Campaign &&
      !output.Audit
    ) {
      errors.push('Missing CoreContent/Plan/Campaign/Audit');
    }
    // Validate PostPurchase
    if (!output.PostPurchase) errors.push('Missing PostPurchase');
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async generateCompletePrompt(inputData, templateType, customization = {}) {
    const systemPrompt = this.generateSystemPrompt(templateType, customization);
    const userPrompt = this.generateUserPrompt(inputData, templateType);

    // Store template in Supabase
    await this.storeTemplate(
      templateType,
      customization.version || '1.0.0',
      systemPrompt.join('\n')
    );

    return {
      system: systemPrompt.join('\n'),
      user: userPrompt,
      expectedSchema: this.goldStandardSchema,
      validation: output => this.validateOutput(output),
      templateVersion: customization.version || '1.0.0',
    };
  }
}

export { EmotionallyIntelligentPromptFramework };
