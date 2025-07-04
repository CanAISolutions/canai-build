import AutoSaveIndicator from '@/components/DetailedInput/AutoSaveIndicator';
import StepOneForm from '@/components/DetailedInput/StepOneForm';
import StepTwoForm from '@/components/DetailedInput/StepTwoForm';
import StandardBackground from '@/components/StandardBackground';
import {
  BodyText,
  PageTitle,
  SectionTitle,
} from '@/components/StandardTypography';
import { Card, CardContent } from '@/components/ui/card';
import { StandardButton } from '@/components/ui/standard-button';
import { FormData } from '@/types/formTypes';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// API and analytics imports
import { trackFormStep, trackPageView } from '@/utils/analytics';
import { logInteraction } from '@/utils/api';
import { saveDetailedInput } from '@/utils/detailedInputIntegration';

const DetailedInput: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    businessDescription: '',
    targetAudience: '',
    keyProducts: '',
    uniqueValueProp: '',
    location: '',
    primaryGoals: '',
    secondaryGoals: '',
    timeline: '',
    budget: '',
    successMetrics: '',
    additionalContext: '',
    primaryGoal: '',
    competitiveContext: '',
    brandVoice: '',
    uniqueValue: '',
    planPurpose: '',
    resourceConstraints: '',
    currentStatus: '',
    revenueModel: '',
  });

  const [errors] = useState<Partial<FormData>>({});

  useEffect(() => {
    trackPageView('detailed_input');
    trackFormStep('detailed_input_entered');

    logInteraction({
      user_id: 'demo-user-id',
      interaction_type: 'page_view',
      interaction_details: {
        page: 'detailed_input',
        step: currentStep,
        timestamp: new Date().toISOString(),
      },
    });
  }, [currentStep]);

  const autoSave = useCallback(async () => {
    try {
      await saveDetailedInput(formData);
      setLastSaved(new Date());
      console.log('[Detailed Input] Auto-saved at:', new Date().toISOString());
    } catch (error) {
      console.error('[Detailed Input] Auto-save failed:', error);
    }
  }, [formData]);

  useEffect(() => {
    const interval = setInterval(() => {
      autoSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoSave]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      trackFormStep('step_1_completed', {
        businessName: formData.businessName,
        targetAudience: formData.targetAudience,
      });
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      trackFormStep('detailed_input_completed', { formData });

      const response = await saveDetailedInput(formData);

      if (response.success) {
        console.log('[Detailed Input] Submission successful:', response);

        setTimeout(() => {
          navigate('/intent-mirror');
        }, 1500);
      } else {
        throw new Error(response.error || 'Submission failed');
      }
    } catch (error) {
      console.error('[Detailed Input] Submission failed:', error);
      setIsSubmitting(false);
    }
  };

  const isStep1Complete =
    formData.businessName &&
    formData.businessDescription &&
    formData.targetAudience &&
    formData.keyProducts;
  const isStep2Complete =
    formData.primaryGoals && formData.timeline && formData.budget;

  return (
    <StandardBackground>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <PageTitle className="text-white mb-4">
            Tell Us More About Your Vision
          </PageTitle>
          <BodyText className="text-xl text-white opacity-90 max-w-2xl mx-auto">
            Help us understand the details of your business so we can create
            something truly personalized.
          </BodyText>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1
                  ? 'bg-[#36d1fe] text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              1
            </div>
            <div
              className={`w-16 h-1 ${
                currentStep >= 2 ? 'bg-[#36d1fe]' : 'bg-gray-600'
              }`}
            />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2
                  ? 'bg-[#36d1fe] text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              2
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-white opacity-70">
            <span>Business Details</span>
            <span>Goals & Strategy</span>
          </div>
        </div>

        {/* Auto-save indicator */}
        <div className="mb-6">
          <AutoSaveIndicator lastSaved={lastSaved} isAutoSaving={false} />
        </div>

        {/* Form Steps */}
        <Card className="bg-[rgba(25,60,101,0.7)] border-2 border-[#36d1fe]/40 backdrop-blur-md">
          <CardContent className="p-8">
            {currentStep === 1 && (
              <div>
                <SectionTitle className="text-white text-center mb-6">
                  Step 1: Business Foundation
                </SectionTitle>
                <StepOneForm
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                />
                <div className="flex justify-end mt-8">
                  <StandardButton
                    onClick={handleNextStep}
                    disabled={!isStep1Complete}
                    variant="primary"
                    size="lg"
                    icon={<ArrowRight size={20} />}
                    iconPosition="right"
                  >
                    Continue to Goals
                  </StandardButton>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <SectionTitle className="text-white text-center mb-6">
                  Step 2: Goals & Strategy
                </SectionTitle>
                <StepTwoForm
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                />
                <div className="flex justify-between mt-8">
                  <StandardButton
                    onClick={handlePrevStep}
                    variant="secondary"
                    size="lg"
                    icon={<ArrowLeft size={20} />}
                    iconPosition="left"
                  >
                    Back
                  </StandardButton>
                  <StandardButton
                    onClick={handleSubmit}
                    disabled={!isStep2Complete}
                    loading={isSubmitting}
                    loadingText="Processing your details..."
                    variant="primary"
                    size="lg"
                    icon={<ArrowRight size={20} />}
                    iconPosition="right"
                  >
                    Continue to Intent Mirror
                  </StandardButton>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StandardBackground>
  );
};

export default DetailedInput;
