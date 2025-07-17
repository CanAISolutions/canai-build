/**
 * Social Media & Email Campaign Template - PRD-Aligned Implementation
 *
 * Implements template for Social Media & Email Campaign per PRD Sections 6.7, 10.2.
 * Generates 3–7 posts, 3–5 emails with platform-specific logic.
 */

import { EmotionallyIntelligentPromptFramework } from './framework.js';

class SocialMediaTemplate extends EmotionallyIntelligentPromptFramework {
  constructor() {
    super();
    this.templateType = 'socialMedia';
    this.version = '1.0.0'; // Template versioning
  }

  /**
   * Generate social media and email campaign
   */
  async generateSocialMediaCampaign(inputData) {
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
  enhanceSocialMediaPrompt(basePrompt, inputData) {
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
  validateSocialMediaOutput(output) {
    const baseValidation = this.validateOutput(output);
    const socialMediaErrors = [];

    // Validate Campaign object
    if (!output.Campaign) {
      socialMediaErrors.push('Missing Campaign object');
    } else {
      if (!output.Campaign.CanAI_Output)
        socialMediaErrors.push('Missing Campaign.CanAI_Output');
      if (!output.Campaign.Generic_Output)
        socialMediaErrors.push('Missing Campaign.Generic_Output');
      if (
        typeof output.Campaign.TrustDelta !== 'number' ||
        output.Campaign.TrustDelta < 4.2
      ) {
        socialMediaErrors.push(
          'Invalid or low Campaign.TrustDelta (must be ≥4.2)'
        );
      }

      // Validate post and email counts
      const canAI = output.Campaign.CanAI_Output || {};
      const generic = output.Campaign.Generic_Output || {};
      if (!canAI.posts || canAI.posts.length < 3 || canAI.posts.length > 7) {
        socialMediaErrors.push(
          'CanAI_Output: Invalid post count (must be 3–7)'
        );
      }
      if (
        !generic.posts ||
        generic.posts.length < 3 ||
        generic.posts.length > 7
      ) {
        socialMediaErrors.push(
          'Generic_Output: Invalid post count (must be 3–7)'
        );
      }
      if (!canAI.emails || canAI.emails.length < 3 || canAI.emails.length > 5) {
        socialMediaErrors.push(
          'CanAI_Output: Invalid email count (must be 3–5)'
        );
      }
      if (
        !generic.emails ||
        generic.emails.length < 3 ||
        generic.emails.length > 5
      ) {
        socialMediaErrors.push(
          'Generic_Output: Invalid email count (must be 3–5)'
        );
      }

      // Validate platform-specific constraints
      if (canAI.posts) {
        canAI.posts.forEach((post, index) => {
          if (post.platform === 'Twitter' && post.content.length > 280) {
            socialMediaErrors.push(
              `CanAI_Output: Post ${index + 1} exceeds Twitter 280-char limit`
            );
          }
          if (!post.hashtags || post.hashtags.length < 3) {
            socialMediaErrors.push(
              `CanAI_Output: Post ${index + 1} has <3 hashtags`
            );
          }
        });
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
        socialMediaErrors.push(
          `Missing PostPurchase fields: ${missingPostPurchase.join(', ')}`
        );
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
                  'Find peace with Serenity Yoga. Join our mindfulness classes! #AustinYoga #Wellness',
                hashtags: [
                  '#AustinYoga',
                  '#Mindfulness',
                  '#Serenity',
                  '#KeepAustinWeird',
                ],
              },
              // ... 2–6 more posts
            ],
            emails: [
              {
                subject: 'Discover Serenity in Austin',
                body: 'Join our yoga classes for mindfulness...',
                cta: 'Sign Up Now',
              },
              // ... 2–4 more emails
            ],
            contentCalendar:
              'Week 1: 2 Instagram posts, 1 email; Week 2: 3 Twitter posts...',
            hashtagStrategy: '#AustinYoga, #Mindfulness for local engagement',
          },
          Generic_Output: {
            posts: [
              {
                platform: 'Instagram',
                content: 'Yoga classes available. Sign up today.',
                hashtags: ['#Yoga', '#Fitness'],
              },
              // ... 2–6 more posts
            ],
            emails: [
              {
                subject: 'Yoga Classes',
                body: 'Sign up for yoga classes.',
                cta: 'Register',
              },
              // ... 2–4 more emails
            ],
            contentCalendar: 'Post weekly, email biweekly',
            hashtagStrategy: '#Yoga, #Health',
          },
          TrustDelta: 4.5,
        },
        PostPurchase: {
          ConfirmationEmail:
            'Thank you, [userName]! Your Serenity Yoga campaign is ready. Access now.',
          PDFDownload: 'https://supabase.com/files/campaign-12345.pdf',
          FeedbackPrompt:
            'Does this campaign inspire your audience? Rate 1–5. [Open-ended]',
          FollowUpEmail:
            "How's your Serenity Yoga campaign? Share progress or refine with CanAI.",
          ShareOption: 'Share your campaign on Twitter via Webflow',
        },
      },
    };
  }
}

export { SocialMediaTemplate };
