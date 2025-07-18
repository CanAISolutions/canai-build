import { WebsiteAuditTemplate } from './websiteAuditTemplate.js';

async function testWebsiteAudit() {
  const template = new WebsiteAuditTemplate();
  const { inputData, expectedOutput } = template.getTechTrendExample();

  try {
    const result = await template.generateWebsiteAudit(inputData);

    console.log('System Prompt:', result.systemPrompt);
    console.log('User Prompt:', result.userPrompt);
    console.log(
      'Expected Schema:',
      JSON.stringify(result.expectedSchema, null, 2)
    );

    const validation = template.validateWebsiteAuditOutput(expectedOutput);
    console.log('Validation:', validation);

    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.errors);
    } else {
      console.log('✅ Validation passed!');
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Test failed:', errorMessage);
  }
}

export { testWebsiteAudit };

testWebsiteAudit();
