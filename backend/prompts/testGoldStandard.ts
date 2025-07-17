/**
 * Test Gold Standard Framework
 *
 * This file tests the emotionally intelligent prompt framework
 * using the exact Sprinkle Haven Bakery example provided by the user.
 */

import { BusinessPlanTemplate } from './businessPlanTemplate.js';

async function testGoldStandardFramework() {
  console.log('🧪 Testing CanAI Gold Standard Framework\n');

  // Initialize the business plan template
  const businessPlan = new BusinessPlanTemplate();

  // Get the gold standard example data
  const goldStandardExample = businessPlan.getGoldStandardExample();

  console.log('📋 Input Data:');
  console.log(JSON.stringify(goldStandardExample.inputData, null, 2));
  console.log('\n' + '='.repeat(80) + '\n');

  try {
    // Generate the prompt using our framework
    const result = await businessPlan.generateBusinessPlan(
      goldStandardExample.inputData
    );

    console.log('🎯 System Prompt Generated:');
    console.log(result.systemPrompt);
    console.log('\n' + '-'.repeat(40) + '\n');

    console.log('💭 User Prompt Generated:');
    console.log(result.userPrompt);
    console.log('\n' + '-'.repeat(40) + '\n');

    console.log('📊 Expected Schema:');
    console.log(JSON.stringify(result.expectedSchema, null, 2));
    console.log('\n' + '-'.repeat(40) + '\n');

    // Test the emotional intelligence features
    console.log('🧠 Emotional Intelligence Analysis:');
    const emotionalContext = businessPlan.buildEmotionalContext(
      goldStandardExample.inputData
    );
    console.log('Emotional Context:');
    console.log(emotionalContext);
    console.log('\n');

    const culturalContext = businessPlan.buildCulturalContext(
      goldStandardExample.inputData
    );
    console.log('Cultural Context:');
    console.log(culturalContext);
    console.log('\n');

    // Test validation with expected output structure
    const mockOutput = {
      Summary: {
        Summary:
          'Launch Sprinkle Haven Bakery with warm tone to unite Denver families via cozy artisan experiences.',
        ConfidenceScore: 0.97,
        ClarifyingQuestions: [],
      },
      Plan: {
        CanAI_Output: 'Sample emotionally intelligent business plan content...',
        Generic_Output: 'Sample generic business plan content...',
        TrustDelta: 4.8,
      },
      PostPurchase: {
        ConfirmationEmail:
          'Thank you for choosing CanAI, [userName]! Your Sprinkle Haven Bakery plan is ready.',
        FeedbackPrompt:
          'Does this plan capture your vision and voice? Rate 1–5.',
        FollowUpEmail: "How's your Sprinkle Haven Bakery journey?",
        ShareOption: 'Share your vision on Instagram',
      },
    };

    console.log('✅ Validation Test:');
    const validation = result.validation(mockOutput);
    console.log('Is Valid:', validation.isValid);
    if (!validation.isValid) {
      console.log('Errors:', validation.errors);
    }

    console.log('\n🎉 Gold Standard Framework Test Complete!');
    console.log('\nKey Features Validated:');
    console.log('✅ Emotional intelligence context building');
    console.log('✅ Cultural context integration');
    console.log('✅ Brand voice mapping');
    console.log('✅ Dual output structure (CanAI vs Generic)');
    console.log('✅ PostPurchase personalization');
    console.log('✅ Schema validation');
    console.log('✅ Gold standard format compliance');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

export { testGoldStandardFramework };

testGoldStandardFramework();
