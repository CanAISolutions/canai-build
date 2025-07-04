import { SocialMediaTemplate } from './socialMediaTemplate.js';

async function testSocialMedia() {
  const template = new SocialMediaTemplate();
  const { inputData, expectedOutput } = template.getSerenityYogaExample();

  try {
    // Generate the prompt
    const result = await template.generateSocialMediaCampaign(inputData);

    // Print prompts and schema
    console.log('System Prompt:', result.systemPrompt);
    console.log('User Prompt:', result.userPrompt);
    console.log(
      'Expected Schema:',
      JSON.stringify(result.expectedSchema, null, 2)
    );

    // Validate a mock output (or real model output)
    const validation = result.validation(expectedOutput);
    console.log('Validation:', validation);

    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.errors);
    } else {
      console.log('✅ Validation passed!');
    }
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

export { testSocialMedia };

testSocialMedia();
