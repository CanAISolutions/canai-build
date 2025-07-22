/**
 * Unit tests for prompt templates (Task 5.4, PRD Section 13.1)
 */
import { SocialMediaTemplate } from '../prompts/socialMediaTemplate.js';
import { WebsiteAuditTemplate } from '../prompts/websiteAuditTemplate.js';
import { EmotionallyIntelligentPromptFramework } from '../prompts/framework.js';

// Prompt templates are critical for core business logic (PRD Section 6.7)
describe('Prompt Templates', () => {
  let socialMediaTemplate, websiteAuditTemplate, framework;

  beforeAll(async () => {
    socialMediaTemplate = new SocialMediaTemplate();
    websiteAuditTemplate = new WebsiteAuditTemplate();
    framework = new EmotionallyIntelligentPromptFramework();
    // Remove Supabase environment variables to use no-op path for unit tests
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_KEY;
  });

  test('Social Media Template example data structure', async () => {
    const exampleData = socialMediaTemplate.getSerenityYogaExample().inputData;

    // Test that the template can process the example data structure
    expect(exampleData.businessName).toBe('Serenity Yoga Studio');
    expect(exampleData.socialPlatforms).toBe('Instagram, Twitter, LinkedIn');
    expect(exampleData.contentStrategy).toBe(
      'Inspirational posts and nurturing emails to promote wellness'
    );

    // Test that the template has the expected structure
    expect(socialMediaTemplate.version).toBe('1.0.0');
    expect(socialMediaTemplate.templateType).toBe('socialMedia');
  });

  test('Website Audit Template example data structure', async () => {
    const exampleData = websiteAuditTemplate.getTechTrendExample().inputData;

    // Test that the template can process the example data structure
    expect(exampleData.businessName).toBe('TechTrend Innovations');
    expect(exampleData.contentSource).toBe('https://techtrend.com');
    expect(exampleData.auditScope).toBe('UX, accessibility, conversions');

    // Test that the template has the expected structure
    expect(websiteAuditTemplate.version).toBe('1.0.0');
    expect(websiteAuditTemplate.templateType).toBe('websiteAudit');
  });

  test('Framework validates inputs with required fields', async () => {
    const validInput = {
      businessName: 'Test Business',
      targetAudience: 'Families in Denver, CO',
      primaryGoal: 'Increase sales',
      brandVoice: 'warm',
      businessDescription: 'A local business offering services',
    };
    expect(() =>
      framework.validateInputs(validInput, 'socialMedia')
    ).not.toThrow();

    const invalidInput = { ...validInput, businessName: undefined };
    expect(() => framework.validateInputs(invalidInput, 'socialMedia')).toThrow(
      /businessName/
    );
  });

  test('Framework stores and retrieves template version', async () => {
    const templateType = 'socialMedia';
    const version = '1.0.0';
    const content = 'Test system prompt';
    await framework.storeTemplate(templateType, version, content);

    const retrieved = await framework.getLatestTemplateVersion(templateType);
    // When Supabase is not configured, it returns a string version
    if (typeof retrieved === 'string') {
      expect(retrieved).toBe(version);
    } else {
      expect(retrieved.version).toBe(version);
      expect(retrieved.content).toBe(content);
    }
  });
});
