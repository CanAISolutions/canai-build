/**
 * Social Media & Email Campaign Template - PRD-Aligned Implementation
 *
 * Implements template for Social Media & Email Campaign per PRD Sections 6.7, 10.2.
 * Generates 3–7 posts, 3–5 emails with platform-specific logic.
 */

import { EmotionallyIntelligentPromptFramework } from './framework.js';

interface SocialMediaInput {
  [key: string]: unknown;
  businessName: string;
  targetAudience: string;
  primaryGoal: string;
  brandVoice: string;
  businessDescription: string;
  socialPlatforms: string;
  contentStrategy: string;
}

interface SocialMediaOutput {
  systemPrompt: string;
  userPrompt: string;
  expectedSchema: unknown;
  validation: unknown;
  inputData: SocialMediaInput;
  templateVersion: string;
}

class SocialMediaTemplate extends EmotionallyIntelligentPromptFramework {
  version: string;

  constructor() {
    super();
    this.templateType = 'socialMedia';
    this.version = '1.0.0';
  }

  /**
   * Generate social media and email campaign
   */
  async generateSocialMediaCampaign(
    inputData: SocialMediaInput
  ): Promise<SocialMediaOutput> {
    // Validate required inputs (PRD Section 6.2)
    const requiredFields = [
      'businessName',
      'targetAudience',
      'primaryGoal',
      'brandVoice',
      'businessDescription',
      'socialPlatforms',
      'contentStrategy',
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

    // Enhance with social media-specific context
    const enhancedUserPrompt = this.enhanceSocialMediaPrompt(
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
   * Enhance prompt with social media-specific requirements
   */
  enhanceSocialMediaPrompt(
    basePrompt: string,
    inputData: SocialMediaInput
  ): string {
    const additionalContext = `

**Additional Social Media Context:**
- Social Platforms: ${inputData.socialPlatforms || 'Twitter, Instagram, LinkedIn'}
- Content Strategy: ${inputData.contentStrategy || 'Engage local audience'}
- Campaign Goals: ${inputData.primaryGoal || 'Increase engagement'}

**Social Media Structure Requirements:**
1. **Social Posts (3–7)**:
   - Platform-specific (e.g., Twitter: ≤280 chars, Instagram: visual focus, LinkedIn: professional).
   - Include hashtags (3–5 per post, culturally relevant).
   - Engagement tactics (e.g., CTAs, polls, stories).
2. **Emails (3–5)**:
   - Subject line (<60 chars), body (100–200 words), CTA.
   - Aligned with brand voice and emotional drivers.
3. **Content Calendar**: Weekly schedule for posts/emails.
4. **Hashtag Strategy**: Culturally resonant, platform-specific.

**Output Requirements:**
- CanAI_Output: 3–7 posts, 3–5 emails, emotionally intelligent, culturally aware.
- Generic_Output: 3–7 posts, 3–5 emails, neutral, formulaic.
- TrustDelta: Score 0.0–5.0 (target ≥4.2) for emotional resonance advantage.
- Response time: <1.5s (PRD Section 6.3).
    `;

    return basePrompt + additionalContext;
  }

  /**
   * Validate social media campaign output
   */
  validateSocialMediaOutput(output: unknown) {
    const baseValidation = this.validateOutput(
      output as Record<string, unknown>
    );
    const socialMediaErrors: string[] = [];

    // Validate Campaign object
    if (!output || typeof output !== 'object' || !('Campaign' in output)) {
      socialMediaErrors.push('Missing Campaign object');
    } else {
      const campaign = (output as { Campaign?: unknown }).Campaign;
      if (!campaign || typeof campaign !== 'object') {
        socialMediaErrors.push('Invalid Campaign object');
      } else {
        const campaignObj = campaign as Record<string, unknown>;
        if (!campaignObj.CanAI_Output)
          socialMediaErrors.push('Missing Campaign.CanAI_Output');
        if (!campaignObj.Generic_Output)
          socialMediaErrors.push('Missing Campaign.Generic_Output');
        if (
          typeof campaignObj.TrustDelta !== 'number' ||
          campaignObj.TrustDelta < 4.2
        ) {
          socialMediaErrors.push(
            'Invalid or low Campaign.TrustDelta (must be ≥4.2)'
          );
        }

        // Validate post and email counts
        const canAI =
          (campaignObj.CanAI_Output as Record<string, unknown>) || {};
        const generic =
          (campaignObj.Generic_Output as Record<string, unknown>) || {};
        if (
          !canAI.posts ||
          !Array.isArray(canAI.posts) ||
          canAI.posts.length < 3 ||
          canAI.posts.length > 7
        ) {
          socialMediaErrors.push(
            'CanAI_Output: Invalid post count (must be 3–7)'
          );
        }
        if (
          !generic.posts ||
          !Array.isArray(generic.posts) ||
          generic.posts.length < 3 ||
          generic.posts.length > 7
        ) {
          socialMediaErrors.push(
            'Generic_Output: Invalid post count (must be 3–7)'
          );
        }
        if (
          !canAI.emails ||
          !Array.isArray(canAI.emails) ||
          canAI.emails.length < 3 ||
          canAI.emails.length > 5
        ) {
          socialMediaErrors.push(
            'CanAI_Output: Invalid email count (must be 3–5)'
          );
        }
        if (
          !generic.emails ||
          !Array.isArray(generic.emails) ||
          generic.emails.length < 3 ||
          generic.emails.length > 5
        ) {
          socialMediaErrors.push(
            'Generic_Output: Invalid email count (must be 3–5)'
          );
        }

        // Validate platform-specific constraints
        if (canAI.posts && Array.isArray(canAI.posts)) {
          canAI.posts.forEach((post: unknown, index: number) => {
            if (
              post &&
              typeof post === 'object' &&
              'platform' in post &&
              'content' in post
            ) {
              const postObj = post as Record<string, unknown>;
              if (
                postObj.platform === 'Twitter' &&
                typeof postObj.content === 'string' &&
                postObj.content.length > 280
              ) {
                socialMediaErrors.push(
                  `CanAI_Output: Post ${index + 1} exceeds Twitter 280-char limit`
                );
              }
              if (
                !postObj.hashtags ||
                !Array.isArray(postObj.hashtags) ||
                postObj.hashtags.length < 3
              ) {
                socialMediaErrors.push(
                  `CanAI_Output: Post ${index + 1} has <3 hashtags`
                );
              }
            }
          });
        }
      }
    }

    // Validate PostPurchase
    if (output && typeof output === 'object' && 'PostPurchase' in output) {
      const postPurchase = (output as { PostPurchase?: unknown }).PostPurchase;
      if (postPurchase && typeof postPurchase === 'object') {
        const postPurchaseObj = postPurchase as Record<string, unknown>;
        const requiredFields = [
          'ConfirmationEmail',
          'FeedbackPrompt',
          'FollowUpEmail',
          'ShareOption',
        ];
        const missingPostPurchase = requiredFields.filter(
          field => !postPurchaseObj[field]
        );
        if (missingPostPurchase.length > 0) {
          socialMediaErrors.push(
            `Missing PostPurchase fields: ${missingPostPurchase.join(', ')}`
          );
        }
      }
    }

    return {
      isValid: baseValidation.isValid && socialMediaErrors.length === 0,
      errors: [...baseValidation.errors, ...socialMediaErrors],
      socialMediaSpecific: socialMediaErrors,
    };
  }

  /**
   * Example usage with Serenity Yoga Studio (PRD Section 10.2)
   */
  getSerenityYogaExample() {
    return {
      inputData: {
        businessName: 'Serenity Yoga Studio',
        targetAudience: 'Young professionals and families in Austin, TX',
        primaryGoal: 'Increase class signups via social media',
        brandVoice: 'inspirational',
        businessDescription:
          'A yoga studio offering mindfulness classes and wellness workshops in Austin',
        socialPlatforms: 'Instagram, Twitter, LinkedIn',
        contentStrategy:
          'Inspirational posts and nurturing emails to promote wellness',
      },
      expectedOutput: {
        Summary: {
          Summary:
            'Inspirational campaign for Serenity Yoga to boost Austin signups via social media and email.',
          ConfidenceScore: 0.95,
          ClarifyingQuestions: [],
        },
        Campaign: {
          CanAI_Output: {
            posts: [
              {
                platform: 'Instagram',
                content:
                  'Find your inner peace at Serenity Yoga 🧘‍♀️✨ Join us for mindful movement and community connection. #AustinYoga #MindfulLiving #SerenityYoga',
                hashtags: [
                  '#AustinYoga',
                  '#MindfulLiving',
                  '#SerenityYoga',
                  '#Wellness',
                  '#Community',
                ],
              },
              {
                platform: 'Twitter',
                content:
                  'Transform your day with 30 minutes of mindful movement. New classes starting this week! #AustinYoga #Wellness #Mindfulness',
                hashtags: ['#AustinYoga', '#Wellness', '#Mindfulness', '#Yoga'],
              },
            ],
            emails: [
              {
                subject: 'Begin Your Wellness Journey with Serenity Yoga',
                body: 'Welcome to a community of mindful movement and inner peace. Join us for classes designed to nurture your body and soul.',
                cta: 'Book Your First Class',
              },
            ],
          },
          Generic_Output: {
            posts: [
              {
                platform: 'Instagram',
                content:
                  'Yoga classes available. Join us for fitness and relaxation. #Yoga #Fitness #Austin',
                hashtags: ['#Yoga', '#Fitness', '#Austin', '#Exercise'],
              },
            ],
            emails: [
              {
                subject: 'Yoga Classes Available',
                body: 'We offer yoga classes for all levels. Improve your fitness and flexibility with our experienced instructors.',
                cta: 'Sign Up Now',
              },
            ],
          },
          TrustDelta: 4.5,
        },
        PostPurchase: {
          ConfirmationEmail:
            'Thank you for choosing CanAI! Your Serenity Yoga campaign is ready. Access it now.',
          PDFDownload: 'https://supabase.com/files/campaign-12345.pdf',
          FeedbackPrompt:
            'How does this campaign resonate with your vision? Rate 1–5. What aspects inspire your community focus?',
          FollowUpEmail:
            "How's your Serenity Yoga campaign performing? Share your results or refine with CanAI.",
          ShareOption: 'Share your campaign on Instagram via Webflow button',
        },
      },
    };
  }
}

export { SocialMediaTemplate };
