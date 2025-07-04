/**
 * Unit tests for prompt templates (Task 5.4, PRD Section 13.1)
 */
import { SocialMediaTemplate } from '../prompts/socialMediaTemplate.js';
import { WebsiteAuditTemplate } from '../prompts/websiteAuditTemplate.js';
import { EmotionallyIntelligentPromptFramework } from '../prompts/framework.js';
import { createClient } from '@supabase/supabase-js';

describe.skip('Prompt Templates', () => {
  let socialMediaTemplate, websiteAuditTemplate, framework, supabase;

  beforeAll(async () => {
    socialMediaTemplate = new SocialMediaTemplate();
    websiteAuditTemplate = new WebsiteAuditTemplate();
    framework = new EmotionallyIntelligentPromptFramework();
    process.env.SUPABASE_URL =
      process.env.SUPABASE_URL || 'https://your-test-project.supabase.co';
    process.env.SUPABASE_KEY = process.env.SUPABASE_KEY || 'your-test-anon-key';
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  });

  test('Social Media Template generates valid campaign', async () => {
    const inputData = socialMediaTemplate.getSerenityYogaExample().inputData;
    const result =
      await socialMediaTemplate.generateSocialMediaCampaign(inputData);

    expect(result.systemPrompt).toContain('Social Media Strategist');
    expect(result.userPrompt).toContain('Serenity Yoga Studio');
    expect(result.templateVersion).toBe('1.0.0');

    const output = socialMediaTemplate.getSerenityYogaExample().expectedOutput;
    const validation = socialMediaTemplate.validateSocialMediaOutput(output);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  test('Website Audit Template generates valid audit', async () => {
    const inputData = websiteAuditTemplate.getTechTrendExample().inputData;
    const result = await websiteAuditTemplate.generateWebsiteAudit(inputData);

    expect(result.systemPrompt).toContain('UX Strategist');
    expect(result.userPrompt).toContain('TechTrend Innovations');
    expect(result.templateVersion).toBe('1.0.0');

    const output = websiteAuditTemplate.getTechTrendExample().expectedOutput;
    const validation = websiteAuditTemplate.validateWebsiteAuditOutput(output);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  test('Framework validates inputs with regex', async () => {
    const validInput = {
      businessName: 'Test Business',
      targetAudience: 'Families in Denver, CO',
      primaryGoal: 'Increase sales',
      brandVoice: 'warm',
      businessDescription: 'A local business offering services',
      socialPlatforms: 'Instagram, Twitter',
      contentStrategy: 'Engage community',
    };
    expect(() =>
      framework.validateInputs(validInput, 'socialMedia')
    ).not.toThrow();

    const invalidInput = { ...validInput, primaryGoal: '!!!' };
    expect(() => framework.validateInputs(invalidInput, 'socialMedia')).toThrow(
      /primaryGoal/
    );
  });

  test('Framework stores and retrieves template version', async () => {
    const templateType = 'socialMedia';
    const version = '1.0.0';
    const content = 'Test system prompt';
    await framework.storeTemplate(templateType, version, content);

    const retrieved = await framework.getLatestTemplateVersion(templateType);
    expect(retrieved.version).toBe(version);
    expect(retrieved.content).toBe(content);
  });
});
