import ProgressIndicator from '@/components/enhanced/ProgressIndicator';
import StandardBackground from '@/components/StandardBackground';
import {
  BodyText,
  PageTitle,
  SectionTitle,
} from '@/components/StandardTypography';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import {
  MobileOptimizedCard,
  MobileOptimizedCardContent,
} from '@/components/ui/mobile-optimized-card';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {
  StandardForm,
  StandardFormGroup,
  StandardFormInput,
  StandardFormLabel,
} from '@/components/ui/standard-form';
import { useAccessibility } from '@/hooks/useAccessibility';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { ArrowRight, Clock, Heart, Lightbulb, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// API and analytics imports
import {
  trackFunnelStep,
  trackPageView,
  trackTrustScoreUpdate,
} from '@/utils/analytics';
import { logInteraction } from '@/utils/api';
import { submitInitialPrompt, validateInput } from '@/utils/discoveryFunnelApi';

const DiscoveryFunnel = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trustScore, setTrustScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    businessType: '',
    challenge: '',
    tone: '',
    outcome: '',
  });

  // Enhanced hooks
  const { trackInteraction } = usePerformanceMonitor('discovery_funnel', 1500);
  const { setPageTitle, announce } = useAccessibility();

  const steps = ['Your Business', 'Your Style'];

  useEffect(() => {
    setPageTitle('Discovery Funnel');

    // Track page view and funnel step
    trackPageView('discovery_funnel');
    trackFunnelStep('discovery_funnel_entered');

    // Log interaction
    logInteraction({
      user_id: 'demo-user-id',
      interaction_type: 'page_view',
      interaction_details: {
        page: 'discovery_funnel',
        step: step + 1,
        timestamp: new Date().toISOString(),
      },
    });
  }, [setPageTitle, step]);

  const handleInputChange = async (field: string, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    // Validate input and update trust score
    try {
      const validation = await validateInput({
        value,
        context: updatedData,
      });

      if (validation.valid) {
        const newTrustScore = Math.min(trustScore + 15, 100);
        setTrustScore(newTrustScore);
        trackTrustScoreUpdate(newTrustScore, { field });
      }
    } catch (error) {
      console.error('[Discovery Funnel] Validation failed:', error);
    }
  };

  const handleStepComplete = () => {
    trackInteraction(`step_${step + 1}_complete`);

    if (step === 0) {
      trackFunnelStep('step_1_completed', {
        businessType: formData.businessType,
        challenge: formData.challenge,
      });
      setStep(1);
      announce('Moving to step 2: Define your style', 'polite');
    } else if (step === 1) {
      trackFunnelStep('step_2_completed', {
        tone: formData.tone,
        outcome: formData.outcome,
      });
      setIsModalOpen(true);
      announce('Discovery complete! Ready to continue?', 'polite');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      trackFunnelStep('discovery_completed', { trustScore, formData });

      const response = await submitInitialPrompt({
        ...formData,
        trustScore,
        timestamp: new Date().toISOString(),
      });

      if (response.success) {
        console.log('[Discovery Funnel] Submission successful:', response);
        announce('Discovery submitted successfully! Redirecting...', 'polite');

        // Navigate to next step
        setTimeout(() => {
          navigate('/spark-layer');
        }, 1500);
      } else {
        throw new Error(response.error || 'Submission failed');
      }
    } catch (error) {
      console.error('[Discovery Funnel] Submission failed:', error);
      announce('Submission failed. Please try again.', 'assertive');
      setIsSubmitting(false);
    }
  };

  const isStep1Complete = formData.businessType && formData.challenge;
  const isStep2Complete = formData.tone && formData.outcome;

  return (
    <StandardBackground>
      <div
        id="main-content"
        className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      >
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <PageTitle className="text-white mb-4">
            Tell Us About Your Vision
          </PageTitle>
          <BodyText className="text-xl text-white opacity-90 max-w-2xl mx-auto">
            Help us understand your business goals so we can create something
            truly personalized for you.
          </BodyText>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator steps={steps} currentStep={step} />
        </div>

        {/* Trust Score Display */}
        {trustScore > 0 && (
          <MobileOptimizedCard className="mb-8" glowEffect>
            <MobileOptimizedCardContent className="p-4 text-center">
              <BodyText className="text-white mb-2">
                Trust Score: {trustScore}%
              </BodyText>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-[#36d1fe] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${trustScore}%` }}
                />
              </div>
            </MobileOptimizedCardContent>
          </MobileOptimizedCard>
        )}

        {/* Form Steps */}
        <MobileOptimizedCard glowEffect>
          <MobileOptimizedCardContent className="p-6 sm:p-8">
            {step === 0 && (
              <StandardForm>
                <SectionTitle className="text-white text-center mb-6 flex items-center justify-center gap-2">
                  <Lightbulb className="w-6 h-6" />
                  Tell Us About Your Business
                </SectionTitle>

                <StandardFormGroup>
                  <StandardFormLabel required className="text-white">
                    What type of business are you building?
                  </StandardFormLabel>
                  <StandardFormInput
                    value={formData.businessType}
                    onChange={e =>
                      handleInputChange('businessType', e.target.value)
                    }
                    placeholder="e.g., Family bakery, Tech startup, Consulting firm..."
                    className="text-white placeholder:text-white/50"
                  />
                </StandardFormGroup>

                <StandardFormGroup>
                  <StandardFormLabel required className="text-white">
                    What&apos;s your biggest challenge right now?
                  </StandardFormLabel>
                  <StandardFormInput
                    value={formData.challenge}
                    onChange={e =>
                      handleInputChange('challenge', e.target.value)
                    }
                    placeholder="e.g., Finding customers, Scaling operations, Building brand awareness..."
                    className="text-white placeholder:text-white/50"
                  />
                </StandardFormGroup>

                <div className="flex justify-center mt-8">
                  <EnhancedButton
                    onClick={handleStepComplete}
                    disabled={!isStep1Complete}
                    variant="primary"
                    size="lg"
                    icon={<ArrowRight size={20} />}
                    iconPosition="right"
                  >
                    Continue
                  </EnhancedButton>
                </div>
              </StandardForm>
            )}

            {step === 1 && (
              <StandardForm>
                <SectionTitle className="text-white text-center mb-6 flex items-center justify-center gap-2">
                  <Heart className="w-6 h-6" />
                  Define Your Style
                </SectionTitle>

                <StandardFormGroup>
                  <StandardFormLabel required className="text-white">
                    What tone best represents your brand?
                  </StandardFormLabel>
                  <StandardFormInput
                    value={formData.tone}
                    onChange={e => handleInputChange('tone', e.target.value)}
                    placeholder="e.g., Warm and welcoming, Professional and trustworthy, Bold and innovative..."
                    className="text-white placeholder:text-white/50"
                  />
                </StandardFormGroup>

                <StandardFormGroup>
                  <StandardFormLabel required className="text-white">
                    What outcome do you want to achieve?
                  </StandardFormLabel>
                  <StandardFormInput
                    value={formData.outcome}
                    onChange={e => handleInputChange('outcome', e.target.value)}
                    placeholder="e.g., Build community connections, Increase revenue, Establish market leadership..."
                    className="text-white placeholder:text-white/50"
                  />
                </StandardFormGroup>

                <div className="flex justify-center mt-8">
                  <EnhancedButton
                    onClick={handleStepComplete}
                    disabled={!isStep2Complete}
                    variant="primary"
                    size="lg"
                    icon={<Target size={20} />}
                    iconPosition="right"
                  >
                    Complete Discovery
                  </EnhancedButton>
                </div>
              </StandardForm>
            )}
          </MobileOptimizedCardContent>
        </MobileOptimizedCard>
      </div>

      {/* Completion Modal */}
      <ResponsiveModal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle className="text-center flex items-center justify-center gap-2">
              <Clock className="w-6 h-6" />
              Ready to Create Something Amazing?
            </ResponsiveModalTitle>
            <ResponsiveModalDescription className="text-center">
              We&apos;ve captured your vision. Let&apos;s transform it into
              something extraordinary with CanAI&apos;s emotional intelligence.
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          <div className="flex justify-center mt-6">
            <EnhancedButton
              onClick={handleSubmit}
              loading={isSubmitting}
              loadingText="Processing your vision..."
              variant="primary"
              size="lg"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
            >
              Continue to Spark Layer
            </EnhancedButton>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </StandardBackground>
  );
};

export default DiscoveryFunnel;
