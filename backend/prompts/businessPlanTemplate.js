/**
 * Business Plan Template - Gold Standard Implementation
 *
 * This template follows the exact specifications provided in the user's gold standard example
 * for Sprinkle Haven Bakery, ensuring consistent quality and structure.
 */

import { EmotionallyIntelligentPromptFramework } from './framework.js';

class BusinessPlanTemplate extends EmotionallyIntelligentPromptFramework {
  constructor() {
    super();
    this.templateType = 'businessPlan';
  }

  /**
   * Generate business plan using the gold standard format
   */
  async generateBusinessPlan(inputData) {
    // Validate required inputs
    const requiredFields = [
      'businessName',
      'targetAudience',
      'primaryGoal',
      'brandVoice',
      'businessDescription',
    ];

    const missingFields = requiredFields.filter(field => !inputData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Generate the complete prompt
    const promptData = await this.generateCompletePrompt(
      inputData,
      this.templateType
    );

    // Add business plan specific context
    const enhancedUserPrompt = this.enhanceBusinessPlanPrompt(
      promptData.user,
      inputData
    );

    return {
      systemPrompt: promptData.system,
      userPrompt: enhancedUserPrompt,
      expectedSchema: this.goldStandardSchema,
      validation: promptData.validation,
      inputData: inputData,
    };
  }

  /**
   * Enhance the user prompt with business plan specific requirements
   */
  enhanceBusinessPlanPrompt(basePrompt, inputData) {
    const additionalContext = `

**Additional Business Plan Context:**
- Revenue Model: ${inputData.revenueModel || 'To be determined'}
- Resource Constraints: ${inputData.resourceConstraints || 'Standard startup constraints'}
- Current Status: ${inputData.currentStatus || 'Planning phase'}
- Competitive Context: ${inputData.competitiveContext || 'General market competition'}

**Business Plan Structure Requirements:**
1. **Vision & Mission**: Clear, emotionally resonant statement of purpose
2. **Market Opportunity**: Data-driven analysis with cultural context
3. **Growth Strategy**: Actionable roadmap with realistic milestones
4. **Impact Roadmap**: Measurable outcomes aligned with community values

**Output Requirements:**
- CanAI_Output: 700-800 words, emotionally intelligent, culturally aware
- Generic_Output: 700-800 words, neutral, formulaic
- TrustDelta: Score 0.0-5.0 measuring emotional resonance advantage
    `;

    return basePrompt + additionalContext;
  }

  /**
   * Validate business plan output against gold standard
   */
  validateBusinessPlanOutput(output) {
    const baseValidation = this.validateOutput(output);
    const businessPlanErrors = [];

    // Validate Plan object specifically
    if (!output.Plan) {
      businessPlanErrors.push('Missing Plan object');
    } else {
      if (!output.Plan.CanAI_Output)
        businessPlanErrors.push('Missing Plan.CanAI_Output');
      if (!output.Plan.Generic_Output)
        businessPlanErrors.push('Missing Plan.Generic_Output');
      if (typeof output.Plan.TrustDelta !== 'number')
        businessPlanErrors.push('Invalid Plan.TrustDelta type');

      // Check word count guidance (flexible but should be substantial)
      if (output.Plan.CanAI_Output && output.Plan.CanAI_Output.length < 500) {
        businessPlanErrors.push(
          'CanAI_Output appears too short for a comprehensive business plan'
        );
      }
      if (
        output.Plan.Generic_Output &&
        output.Plan.Generic_Output.length < 500
      ) {
        businessPlanErrors.push(
          'Generic_Output appears too short for a comprehensive business plan'
        );
      }
    }

    // Validate PostPurchase for business plan specifics
    if (output.PostPurchase) {
      const requiredFields = [
        'ConfirmationEmail',
        'FeedbackPrompt',
        'FollowUpEmail',
        'ShareOption',
      ];
      const missingPostPurchase = requiredFields.filter(
        field => !output.PostPurchase[field]
      );
      if (missingPostPurchase.length > 0) {
        businessPlanErrors.push(
          `Missing PostPurchase fields: ${missingPostPurchase.join(', ')}`
        );
      }
    }

    return {
      isValid: baseValidation.isValid && businessPlanErrors.length === 0,
      errors: [...baseValidation.errors, ...businessPlanErrors],
      businessPlanSpecific: businessPlanErrors,
    };
  }

  /**
   * Example usage with the Sprinkle Haven Bakery data from gold standard
   */
  getGoldStandardExample() {
    return {
      inputData: {
        businessName: 'Sprinkle Haven Bakery',
        targetAudience: 'Local families and young professionals in Denver, CO',
        primaryGoal: 'Secure $75,000 funding to open a flagship store',
        competitiveContext: 'Competing with Starbucks and The Denver Brew',
        brandVoice: 'warm',
        resourceConstraints: '$50,000 budget, team of 3, 6-month timeline',
        currentStatus: 'Pre-launch, building pitch deck',
        businessDescription:
          'A cozy bakery offering artisan pastries, custom cakes, and coffee, fostering community through events',
        revenueModel: 'Direct sales, catering, merchandise',
        planPurpose: 'Investor pitch for angel funding',
      },
      expectedOutput: {
        Summary: {
          Summary:
            'Launch Sprinkle Haven Bakery with warm tone to unite Denver families via cozy artisan experiences.',
          ConfidenceScore: 0.97,
          ClarifyingQuestions: [],
        },
        Plan: {
          CanAI_Output:
            '[700–800-word emotionally intelligent and culturally specific business plan tailored to Sprinkle Haven Bakery]',
          Generic_Output:
            '[700–800-word neutral, formulaic plan for Sprinkle Haven Bakery]',
          TrustDelta: 4.8,
        },
        PostPurchase: {
          ConfirmationEmail:
            'Thank you for choosing CanAI, [userName]! Your Sprinkle Haven Bakery plan is ready. Access it now.',
          PDFDownload: 'https://supabase.com/files/plan-12345.pdf',
          FeedbackPrompt:
            'Does this plan capture your vision and voice? Rate 1–5. How does it inspire your community focus? [Open-ended response]',
          FollowUpEmail:
            "How's your Sprinkle Haven Bakery journey? Share your progress or refine with CanAI.",
          ShareOption: 'Share your vision on Instagram via Webflow button',
        },
      },
    };
  }
}

export { BusinessPlanTemplate };
