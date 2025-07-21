/**
 * Integration between Emotional Intelligence Framework and GPT-4o Service
 *
 * This file connects the emotionally intelligent prompt templates
 * with the existing GPT-4o service for actual content generation.
 */

import { BusinessPlanTemplate } from './businessPlanTemplate.js';
import { GPT4Service } from '../services/gpt4o.js';
import supabase from '../supabase/client.js';

interface BusinessPlanOptions {
  temperature?: number;
  maxTokens?: number;
  delayMs?: number;
}

// const _gpt4oService = new GPT4oService();

class EmotionalIntelligenceIntegration {
  businessPlanTemplate: BusinessPlanTemplate;
  gpt4oService: GPT4Service;

  constructor() {
    this.businessPlanTemplate = new BusinessPlanTemplate();
    this.gpt4oService = new GPT4Service(supabase);
  }

  /**
   * Generate emotionally intelligent business plan using GPT-4o
   */
  async generateBusinessPlan(inputData, options: BusinessPlanOptions = {}) {
    try {
      // Generate the prompt using our framework
      const promptData =
        await this.businessPlanTemplate.generateBusinessPlan(inputData);

      // Prepare the request for GPT-4o service
      const gptRequest = {
        messages: [
          {
            role: 'system',
            content: promptData.systemPrompt,
          },
          {
            role: 'user',
            content: promptData.userPrompt,
          },
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000,
        response_format: { type: 'json_object' },
      };

      // Call GPT-4o service
      const response = await this.gpt4oService.generate(
        promptData.userPrompt,
        gptRequest
      );

      // Parse and validate the response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (parseError) {
        throw new Error(
          `Failed to parse GPT-4o response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`
        );
      }

      // Validate against our schema
      const validation =
        this.businessPlanTemplate.validateBusinessPlanOutput(parsedResponse);

      return {
        success: true,
        data: parsedResponse,
        validation: validation,
        metadata: {
          inputData: inputData,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          model: 'gpt-4o',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          inputData: inputData,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Test the integration with the gold standard example
   */
  async testGoldStandardIntegration() {
    console.log('🧪 Testing Gold Standard Integration with GPT-4o\n');

    const goldStandardExample =
      this.businessPlanTemplate.getGoldStandardExample();

    console.log('📋 Testing with Sprinkle Haven Bakery data...\n');

    const result = await this.generateBusinessPlan(
      goldStandardExample.inputData
    );

    if (result.success) {
      console.log('✅ Integration successful!');
      console.log(
        '📊 Response validation:',
        result.validation.isValid ? 'PASSED' : 'FAILED'
      );

      if (!result.validation.isValid) {
        console.log('❌ Validation errors:', result.validation.errors);
      }

      console.log('📈 Token usage:', {
        prompt: result.metadata.promptTokens,
        completion: result.metadata.completionTokens,
        total: result.metadata.totalTokens,
      });

      console.log(
        '🎯 TrustDelta Score:',
        result.data.Plan?.TrustDelta || 'N/A'
      );
      console.log('📝 Summary:', result.data.Summary?.Summary || 'N/A');
    } else {
      console.log('❌ Integration failed:', result.error);
    }

    return result;
  }

  /**
   * Batch processing for multiple business plans
   */
  async generateMultipleBusinessPlans(
    inputDataArray,
    options: BusinessPlanOptions = {}
  ) {
    const results = [];

    for (const inputData of inputDataArray) {
      const result = await this.generateBusinessPlan(inputData, options);
      results.push(result);

      // Add delay between requests to respect rate limits
      if (options.delayMs) {
        await new Promise(resolve => setTimeout(resolve, options.delayMs));
      }
    }

    return results;
  }

  /**
   * Quality assurance check for generated content
   */
  validateQualityStandards(generatedContent, inputData) {
    const qualityChecks = {
      hasBothOutputs: !!(
        generatedContent.Plan?.CanAI_Output &&
        generatedContent.Plan?.Generic_Output
      ),
      hasEmotionalResonance: generatedContent.Plan?.TrustDelta > 3.0,
      hasCulturalContext: this.checkCulturalRelevance(
        generatedContent,
        inputData
      ),
      hasBrandVoiceAlignment: this.checkBrandVoiceAlignment(
        generatedContent,
        inputData
      ),
    };

    return {
      passed: Object.values(qualityChecks).every(check => check),
      checks: qualityChecks,
      score:
        Object.values(qualityChecks).filter(check => check).length /
        Object.keys(qualityChecks).length,
    };
  }

  // Quality check helper methods
  checkCulturalRelevance(content, inputData) {
    const location = this.businessPlanTemplate.extractLocation(
      inputData.targetAudience
    );
    const canaiOutput = content.Plan?.CanAI_Output?.toLowerCase() || '';

    if (location === 'Denver, CO') {
      return (
        canaiOutput.includes('denver') ||
        canaiOutput.includes('colorado') ||
        canaiOutput.includes('mile high')
      );
    }

    return true;
  }

  checkBrandVoiceAlignment(content, inputData) {
    const brandVoice = inputData.brandVoice?.toLowerCase();
    const canaiOutput = content.Plan?.CanAI_Output?.toLowerCase() || '';

    const voiceKeywords = {
      warm: ['warm', 'welcoming', 'community', 'cozy', 'heartfelt'],
      innovative: ['innovative', 'cutting-edge', 'pioneer', 'breakthrough'],
      professional: ['professional', 'expert', 'reliable', 'proven'],
    };

    const keywords = voiceKeywords[brandVoice] || [];
    return keywords.some(keyword => canaiOutput.includes(keyword));
  }
}

export { EmotionalIntelligenceIntegration };
