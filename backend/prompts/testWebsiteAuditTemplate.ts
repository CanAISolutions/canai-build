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

export { testWebsiteAudit };

testWebsiteAudit();
