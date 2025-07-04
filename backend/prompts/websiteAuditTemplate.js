/**
 * Website Audit & Feedback Template - PRD-Aligned Implementation
 *
 * Implements template for Website Audit & Feedback per PRD Sections 6.7, 10.3.
 * Generates 300–400-word audit with UX and accessibility recommendations.
 */

import { EmotionallyIntelligentPromptFramework } from './framework.js';

class WebsiteAuditTemplate extends EmotionallyIntelligentPromptFramework {
  constructor() {
    super();
    this.templateType = 'websiteAudit';
    this.version = '1.0.0'; // Template versioning
  }

  /**
   * Generate website audit
   */
  async generateWebsiteAudit(inputData) {
    // Validate required inputs (PRD Section 6.2)
    const requiredFields = [
      'businessName',
      'targetAudience',
      'primaryGoal',
      'brandVoice',
      'businessDescription',
      'contentSource',
      'auditScope',
    ];
    const missingFields = requiredFields.filter(field => !inputData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Generate complete prompt
    const promptData = await this.generateCompletePrompt(
      inputData,
      this.templateType
    );

    // Enhance with website audit-specific context
    const enhancedUserPrompt = this.enhanceWebsiteAuditPrompt(
      promptData.user,
      inputData
    );

    return {
      systemPrompt: promptData.system,
      userPrompt: enhancedUserPrompt,
      expectedSchema: this.goldStandardSchema,
      validation: promptData.validation,
      inputData,
      templateVersion: this.version,
    };
  }

  /**
   * Enhance prompt with website audit-specific requirements
   */
  enhanceWebsiteAuditPrompt(basePrompt, inputData) {
    const additionalContext = `

**Additional Website Audit Context:**
- Content Source: ${inputData.contentSource || 'Website URL'}
- Audit Scope: ${inputData.auditScope || 'UX, accessibility, brand alignment'}
- Primary Goal: ${inputData.primaryGoal || 'Improve conversions'}

**Website Audit Structure Requirements:**
1. **User Emotional Journey**: Analyze emotional impact of site navigation and content.
2. **Brand Alignment**: Evaluate consistency with brand voice and values.
3. **Conversion Optimization**: Identify barriers to user goals (e.g., signups, purchases).
4. **Accessibility**: Ensure WCAG 2.2 AA compliance (e.g., contrast, ARIA labels).
5. **Performance**: Assess load times and responsiveness.
6. **Recommendations**: Actionable steps prioritized by impact and feasibility.

**Output Requirements:**
- CanAI_Output: 300–400 words, emotionally intelligent, culturally aware.
- Generic_Output: 300–400 words, neutral, technical.
- TrustDelta: Score 0.0–5.0 (target ≥4.2) for emotional resonance advantage.
- Response time: <1.5s (PRD Section 6.3).
    `;

    return basePrompt + additionalContext;
  }

  /**
   * Validate website audit output
   */
  validateWebsiteAuditOutput(output) {
    const baseValidation = this.validateOutput(output);
    const websiteAuditErrors = [];

    // Validate Audit object
    if (!output.Audit) {
      websiteAuditErrors.push('Missing Audit object');
    } else {
      if (!output.Audit.CanAI_Output)
        websiteAuditErrors.push('Missing Audit.CanAI_Output');
      if (!output.Audit.Generic_Output)
        websiteAuditErrors.push('Missing Audit.Generic_Output');
      if (
        typeof output.Audit.TrustDelta !== 'number' ||
        output.Audit.TrustDelta < 4.2
      ) {
        websiteAuditErrors.push(
          'Invalid or low Audit.TrustDelta (must be ≥4.2)'
        );
      }

      // Validate word count
      const canAIWordCount = output.Audit.CanAI_Output
        ? output.Audit.CanAI_Output.split(/\s+/).length
        : 0;
      const genericWordCount = output.Audit.Generic_Output
        ? output.Audit.Generic_Output.split(/\s+/).length
        : 0;
      if (canAIWordCount < 300 || canAIWordCount > 400) {
        websiteAuditErrors.push(
          `CanAI_Output: Invalid word count (${canAIWordCount}, must be 300–400)`
        );
      }
      if (genericWordCount < 300 || genericWordCount > 400) {
        websiteAuditErrors.push(
          `Generic_Output: Invalid word count (${genericWordCount}, must be 300–400)`
        );
      }

      // Validate accessibility (improved check)
      if (output.Audit.CanAI_Output) {
        const hasAccessibilityKeyword = /WCAG|accessibility/i.test(
          output.Audit.CanAI_Output
        );
        if (!hasAccessibilityKeyword) {
          websiteAuditErrors.push(
            'CanAI_Output: Missing accessibility analysis (no mention of WCAG or accessibility)'
          );
        }
        // Check for specific accessibility elements
        const checks = [
          { key: 'color contrast', label: 'color contrast' },
          { key: 'alt text', label: 'alt text for images' },
          { key: 'heading', label: 'heading structure' },
          { key: 'focus', label: 'focus management' },
          { key: 'form label', label: 'form labels' },
        ];
        for (const check of checks) {
          if (!new RegExp(check.key, 'i').test(output.Audit.CanAI_Output)) {
            websiteAuditErrors.push(
              `CanAI_Output: Missing accessibility element (${check.label})`
            );
          }
        }
      }
    }

    // Validate PostPurchase
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
        websiteAuditErrors.push(
          `Missing PostPurchase fields: ${missingPostPurchase.join(', ')}`
        );
      }
    }

    return {
      isValid: baseValidation.isValid && websiteAuditErrors.length === 0,
      errors: [...baseValidation.errors, ...websiteAuditErrors],
      websiteAuditSpecific: websiteAuditErrors,
    };
  }

  /**
   * Example usage with TechTrend Innovations (PRD Section 10.3)
   */
  getTechTrendExample() {
    return {
      inputData: {
        businessName: 'TechTrend Innovations',
        targetAudience: 'Tech professionals in Denver, CO',
        primaryGoal: 'Improve website conversions',
        brandVoice: 'professional',
        businessDescription:
          'A tech startup offering AI-driven analytics tools in Denver',
        contentSource: 'https://techtrend.com',
        auditScope: 'UX, accessibility, conversions',
      },
      expectedOutput: {
        Summary: {
          Summary:
            "Audit for TechTrend's website to boost conversions with innovative, Denver-focused UX.",
          ConfidenceScore: 0.96,
          ClarifyingQuestions: [],
        },
        Audit: {
          CanAI_Output:
            '[300–400-word audit with emotional, cultural UX recommendations]',
          Generic_Output: '[300–400-word technical audit]',
          TrustDelta: 4.6,
        },
        PostPurchase: {
          ConfirmationEmail:
            'Thank you, [userName]! Your TechTrend audit is ready. Access now.',
          PDFDownload: 'https://supabase.com/files/audit-12345.pdf',
          FeedbackPrompt:
            'Does this audit align with your vision? Rate 1–5. [Open-ended]',
          FollowUpEmail:
            "How's your TechTrend website update? Refine with CanAI.",
          ShareOption: 'Share your audit on LinkedIn via Webflow',
        },
      },
    };
  }
}

export { WebsiteAuditTemplate };
