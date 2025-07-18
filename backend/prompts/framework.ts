/**
 * CanAI Emotionally Intelligent Prompt Template Framework
 *
 * Updated to include template versioning and regex input validation per PRD Section 6.2.
 */

import Joi from 'joi';

// Gold Standard Schema Description
interface GoldStandardSchemaDescription {
  Summary: {
    Summary: string;
    ConfidenceScore: string;
    ClarifyingQuestions: string;
  };
  CoreContent: {
    CanAI_Output: string;
    Generic_Output: string;
    TrustDelta: string;
  };
  PostPurchase: {
    ConfirmationEmail: string;
    PDFDownload: string;
    FeedbackPrompt: string;
    FollowUpEmail: string;
    ShareOption: string;
  };
}

interface InputData {
  [key: string]: unknown;
  businessName?: string;
  businessDescription?: string;
  targetAudience?: string;
  primaryGoal?: string;
  brandVoice?: string;
}

interface EmotionalDrivers {
  brandVoice: Record<string, string[]>;
  businessContext: Record<string, string[]>;
  audienceContext: Record<string, string[]>;
}

interface CulturalContext {
  [location: string]: {
    values: string[];
    businessContext: string[];
    demographicInsights?: string[];
    localReferences?: string[];
  };
}

interface OutputData {
  [key: string]: unknown;
  Summary?: {
    Summary?: string;
    ConfidenceScore?: number;
    ClarifyingQuestions?: string[];
  };
  Plan?: {
    CanAI_Output?: string;
    Generic_Output?: string;
    TrustDelta?: number;
  };
  PostPurchase?: {
    ConfirmationEmail?: string;
    PDFDownload?: string;
    FeedbackPrompt?: string;
    FollowUpEmail?: string;
    ShareOption?: string;
  };
}

class EmotionallyIntelligentPromptFramework {
  templateType: string;
  goldStandardSchema: GoldStandardSchemaDescription;
  inputSchema: Joi.ObjectSchema;
  emotionalDrivers: EmotionalDrivers;
  culturalContext: CulturalContext;

  constructor() {
    this.templateType = 'default';
    this.goldStandardSchema = {
      Summary: {
        Summary: 'Brief summary of the generated content',
        ConfidenceScore: 'Confidence score (0.0-1.0)',
        ClarifyingQuestions: 'Array of clarifying questions if needed',
      },
      CoreContent: {
        CanAI_Output: 'Emotionally intelligent, culturally-aware output',
        Generic_Output: 'Neutral, formulaic output for comparison',
        TrustDelta: 'Emotional resonance advantage score (0.0-5.0)',
      },
      PostPurchase: {
        ConfirmationEmail: 'Thank you email template',
        PDFDownload: 'PDF download link',
        FeedbackPrompt: 'Feedback collection prompt',
        FollowUpEmail: 'Follow-up email template',
        ShareOption: 'Social sharing option',
      },
    };

    // Input validation schema
    this.inputSchema = Joi.object({
      businessName: Joi.string().required(),
      businessDescription: Joi.string().required(),
      targetAudience: Joi.string().required(),
      primaryGoal: Joi.string().required(),
      brandVoice: Joi.string().required(),
      templateType: Joi.string().required(),
    });

    // Emotional drivers mapping
    this.emotionalDrivers = {
      brandVoice: {
        warm: ['trust', 'comfort', 'nurturing', 'community'],
        professional: ['reliability', 'expertise', 'confidence', 'authority'],
        playful: ['joy', 'creativity', 'spontaneity', 'fun'],
        sophisticated: ['elegance', 'refinement', 'exclusivity', 'prestige'],
        friendly: ['approachability', 'openness', 'genuineness', 'welcome'],
      },
      businessContext: {
        family_business: ['legacy', 'tradition', 'trust', 'community'],
        tech_startup: [
          'innovation',
          'progress',
          'efficiency',
          'transformation',
        ],
        local_business: ['community', 'authenticity', 'connection', 'support'],
        service_business: ['care', 'attention', 'dedication', 'excellence'],
        creative_business: [
          'expression',
          'inspiration',
          'uniqueness',
          'passion',
        ],
      },
      audienceContext: {
        families: ['security', 'nurturing', 'growth', 'togetherness'],
        professionals: [
          'achievement',
          'efficiency',
          'recognition',
          'advancement',
        ],
        entrepreneurs: ['independence', 'innovation', 'growth', 'impact'],
        creatives: ['expression', 'inspiration', 'authenticity', 'freedom'],
        community: ['connection', 'belonging', 'support', 'collaboration'],
      },
    };

    // Cultural context mapping
    this.culturalContext = {
      default: {
        values: ['authenticity', 'community', 'growth', 'innovation'],
        businessContext: ['customer-centric', 'quality-focused', 'sustainable'],
        demographicInsights: ['diverse', 'educated', 'tech-savvy'],
        localReferences: [
          'local landmarks',
          'community events',
          'regional culture',
        ],
      },
      'denver, co': {
        values: [
          'outdoor lifestyle',
          'innovation',
          'community',
          'sustainability',
        ],
        businessContext: [
          'tech-friendly',
          'outdoor-oriented',
          'community-focused',
        ],
        demographicInsights: [
          'young professionals',
          'outdoor enthusiasts',
          'tech workers',
        ],
        localReferences: ['Rocky Mountains', 'Denver Tech Center', 'Red Rocks'],
      },
      'new york, ny': {
        values: ['diversity', 'ambition', 'innovation', 'culture'],
        businessContext: ['fast-paced', 'competitive', 'diverse'],
        demographicInsights: [
          'cosmopolitan',
          'career-focused',
          'culturally diverse',
        ],
        localReferences: ['Broadway', 'Central Park', 'Wall Street'],
      },
      'los angeles, ca': {
        values: ['creativity', 'wellness', 'diversity', 'innovation'],
        businessContext: ['creative', 'wellness-focused', 'entertainment'],
        demographicInsights: [
          'creative professionals',
          'health-conscious',
          'diverse',
        ],
        localReferences: ['Hollywood', 'Venice Beach', 'Silicon Beach'],
      },
    };
  }

  /**
   * Validate inputs with Joi schema
   */
  validateInputs(inputData: InputData, templateType: string) {
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
  async storeTemplate(templateType: string, version: string, content: string) {
    if (
      typeof process === 'undefined' ||
      !process.env['SUPABASE_URL'] ||
      !process.env['SUPABASE_KEY']
    ) {
      return;
    }
    try {
      const { createClient: createSupabaseClient } = await import(
        '@supabase/supabase-js'
      );
      const supabaseClient = createSupabaseClient(
        process.env['SUPABASE_URL'],
        process.env['SUPABASE_KEY']
      );
      const { error } = await supabaseClient.from('prompt_templates').insert({
        template_type: templateType,
        version,
        content,
        created_at: new Date().toISOString(),
      });
      if (error) {
        throw new Error(
          `Failed to store template: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    } catch (error) {
      console.error('Error storing template:', error);
      throw new Error(
        `Failed to store template: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Retrieve latest template version (no-op if not configured)
   */
  async getLatestTemplateVersion(templateType: string) {
    if (
      typeof process === 'undefined' ||
      !process.env['SUPABASE_URL'] ||
      !process.env['SUPABASE_KEY']
    ) {
      return '1.0.0';
    }
    try {
      const { createClient: createSupabaseClient } = await import(
        '@supabase/supabase-js'
      );
      const supabaseClient = createSupabaseClient(
        process.env['SUPABASE_URL'],
        process.env['SUPABASE_KEY']
      );
      const { data, error } = await supabaseClient
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
    } catch (error) {
      console.error('Error retrieving template version:', error);
      return '1.0.0';
    }
  }

  generateSystemPrompt(templateType: string) {
    const basePrompts: Record<string, string[]> = {
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

  generateUserPrompt(inputData: InputData, templateType: string) {
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

  buildEmotionalContext(inputData: InputData) {
    const brandDrivers =
      this.emotionalDrivers.brandVoice[
        inputData.brandVoice?.toLowerCase() as keyof typeof this.emotionalDrivers.brandVoice
      ] || [];
    const businessType = this.inferBusinessType(
      inputData.businessDescription || ''
    );
    const businessDrivers =
      this.emotionalDrivers.businessContext[businessType] || [];
    const audienceType = this.inferAudienceType(inputData.targetAudience || '');
    const audienceDrivers =
      this.emotionalDrivers.audienceContext[audienceType] || [];

    return `
- Brand Voice Drivers: ${brandDrivers.join(', ')}
- Business Context Drivers: ${businessDrivers.join(', ')}
- Audience Emotional Drivers: ${audienceDrivers.join(', ')}
- Inferred Emotional Themes: ${this.inferEmotionalThemes(inputData)}
    `.trim();
  }

  buildCulturalContext(inputData: InputData) {
    const location = this.extractLocation(inputData.targetAudience || '');
    const context =
      this.culturalContext[location] || this.culturalContext.default;

    return `
- Location: ${location}
- Cultural Values: ${context.values.join(', ')}
- Business Context: ${context.businessContext.join(', ')}
- Demographic Insights: ${context.demographicInsights?.join(', ') || 'N/A'}
- Local References: ${context.localReferences.join(', ')}
    `.trim();
  }

  inferBusinessType(description: string) {
    const keywords: Record<string, string[]> = {
      family_business: ['family', 'heritage', 'tradition', 'generational'],
      tech_startup: ['app', 'platform', 'software', 'tech', 'digital', 'AI'],
      local_business: [
        'local',
        'community',
        'neighborhood',
        'small business',
        'independent',
      ],
      service_business: ['service', 'consulting', 'help', 'support', 'care'],
      creative_business: [
        'creative',
        'design',
        'art',
        'music',
        'writing',
        'photography',
      ],
    };

    const lowerDescription = description.toLowerCase();
    for (const [type, typeKeywords] of Object.entries(keywords)) {
      if (typeKeywords.some(keyword => lowerDescription.includes(keyword))) {
        return type;
      }
    }
    return 'local_business';
  }

  inferAudienceType(audience: string) {
    const keywords: Record<string, string[]> = {
      families: ['family', 'children', 'parents', 'kids', 'home'],
      professionals: ['professional', 'business', 'corporate', 'executive'],
      entrepreneurs: ['entrepreneur', 'startup', 'founder', 'business owner'],
      creatives: ['creative', 'artist', 'designer', 'musician', 'writer'],
      community: ['community', 'local', 'neighborhood', 'residents'],
    };

    const lowerAudience = audience.toLowerCase();
    for (const [type, typeKeywords] of Object.entries(keywords)) {
      if (typeKeywords.some(keyword => lowerAudience.includes(keyword))) {
        return type;
      }
    }
    return 'community';
  }

  extractLocation(targetAudience: string) {
    const locationMatch = targetAudience.match(/([^,]+),\s*([A-Z]{2})/i);
    if (locationMatch) {
      return `${locationMatch[1].toLowerCase()}, ${locationMatch[2].toLowerCase()}`;
    }
    return 'default';
  }

  inferEmotionalThemes(inputData: InputData) {
    const themes: string[] = [];
    const description = inputData.businessDescription?.toLowerCase() || '';
    const audience = inputData.targetAudience?.toLowerCase() || '';

    if (description.includes('community') || audience.includes('community')) {
      themes.push('connection');
    }
    if (description.includes('family') || audience.includes('family')) {
      themes.push('nurturing');
    }
    if (description.includes('tech') || description.includes('innovation')) {
      themes.push('progress');
    }
    if (description.includes('creative') || description.includes('art')) {
      themes.push('expression');
    }

    return themes.length > 0 ? themes.join(', ') : 'authenticity, growth';
  }

  validateOutput(output: OutputData) {
    const errors: string[] = [];

    // Validate Summary
    if (!output.Summary) {
      errors.push('Missing Summary object');
    } else {
      if (!output.Summary.Summary) errors.push('Missing Summary.Summary');
      if (typeof output.Summary.ConfidenceScore !== 'number') {
        errors.push('Invalid Summary.ConfidenceScore type');
      }
    }

    // Validate Core Content (Plan for business plans)
    const coreContent = output.Plan || output.CoreContent;
    if (!coreContent) {
      errors.push('Missing Plan/CoreContent object');
    } else {
      const coreContentObj = coreContent as Record<string, unknown>;
      if (!coreContentObj.CanAI_Output) errors.push('Missing CanAI_Output');
      if (!coreContentObj.Generic_Output) errors.push('Missing Generic_Output');
      if (typeof coreContentObj.TrustDelta !== 'number') {
        errors.push('Invalid TrustDelta type');
      }
    }

    // Validate PostPurchase
    if (!output.PostPurchase) {
      errors.push('Missing PostPurchase object');
    } else {
      const requiredFields = [
        'ConfirmationEmail',
        'FeedbackPrompt',
        'FollowUpEmail',
        'ShareOption',
      ];
      const missingFields = requiredFields.filter(
        field =>
          !output.PostPurchase![field as keyof typeof output.PostPurchase]
      );
      if (missingFields.length > 0) {
        errors.push(`Missing PostPurchase fields: ${missingFields.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async generateCompletePrompt(
    inputData: InputData,
    templateType: string,
    customization: { version?: string } = {}
  ) {
    const systemPrompt = this.generateSystemPrompt(templateType);
    const userPrompt = this.generateUserPrompt(inputData, templateType);

    // Store template version if configured
    if (customization.version) {
      await this.storeTemplate(templateType, customization.version, userPrompt);
    }

    return {
      system: systemPrompt.join('\n'),
      user: userPrompt,
      validation: this.validateOutput,
    };
  }
}

export { EmotionallyIntelligentPromptFramework };
