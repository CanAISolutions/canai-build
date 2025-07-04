import EditModal from '@/components/IntentMirror/EditModal';
import SummaryCard from '@/components/IntentMirror/SummaryCard';
import PageHeader from '@/components/PageHeader';
import StandardBackground from '@/components/StandardBackground';
import { BodyText, PageTitle } from '@/components/StandardTypography';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  trackIntentMirrorConfirmed,
  trackIntentMirrorEdited,
  trackSupportRequested,
} from '@/utils/analytics';
import { generateIntentMirror, trackFieldEdit } from '@/utils/api';
import { handleLowConfidenceSupport } from '@/utils/intentMirrorIntegration';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface IntentMirrorData {
  summary: string;
  confidenceScore: number;
  clarifyingQuestions: string[];
  originalData: {
    businessName: string;
    targetAudience: string;
    primaryGoal: string;
    competitiveContext: string;
    brandVoice: string;
    location: string;
    uniqueValue: string;
    resourceConstraints: string;
    currentStatus: string;
    businessDescription: string;
    revenueModel: string;
    planPurpose: string;
  };
}

const IntentMirror = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [lowConfidenceAttempts, setLowConfidenceAttempts] = useState(0);
  const [intentData, setIntentData] = useState<IntentMirrorData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState<string>('');
  const [isValid] = useState(false);

  // Get prompt_id from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const promptId = urlParams.get('prompt_id') || 'demo-prompt-id';

  // Removed unused generateMockIntentData function

  const loadIntentMirror = useCallback(
    async (retryCount = 0) => {
      setIsLoading(true);

      try {
        const startTime = Date.now();

        // Get business data from URL params or localStorage
        const businessData = {
          businessName: 'Sprinkle Haven Bakery', // TODO: Get from actual form data
          targetAudience:
            'Denver families with children seeking organic, artisanal baked goods',
          primaryGoal: 'Secure $200K investor funding for bakery launch',
          competitiveContext:
            'Competing with Blue Moon Bakery and chain stores',
          brandVoice: 'warm',
          resourceConstraints:
            '$50k initial budget; team of 3; 6-month timeline',
          currentStatus: 'Planning phase with market research completed',
          businessDescription:
            'Artisanal neighborhood bakery specializing in organic pastries',
          revenueModel:
            'Retail sales, custom orders, baking workshops, catering events',
          planPurpose: 'Secure investor funding and establish market presence',
          location: 'Denver, Colorado',
          uniqueValue:
            'Organic, community-focused pastries with interactive family baking workshops',
        };

        // Use new API integration
        const response = await generateIntentMirror(businessData);

        setIntentData({
          summary: response.summary,
          confidenceScore: response.confidenceScore,
          clarifyingQuestions: response.clarifyingQuestions,
          originalData: businessData,
        });

        if (response.confidenceScore < 0.8) {
          setLowConfidenceAttempts(prev => {
            const newCount = prev + 1;

            // Handle support request for multiple low confidence attempts
            if (newCount >= 2) {
              handleLowConfidenceSupport({
                confidence_score: response.confidenceScore,
                business_data: businessData,
                attempt_count: newCount,
              });
            }

            return newCount;
          });
        }

        const endTime = Date.now();
        console.log('Intent mirror loaded:', {
          promptId,
          confidence: response.confidenceScore,
          loadTime: endTime - startTime,
        });
      } catch (error) {
        console.error('Intent mirror load failed:', error);

        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => {
            loadIntentMirror(retryCount + 1);
          }, delay);
        } else {
          toast({
            title: 'Loading failed',
            description:
              'Unable to load your business summary. Please try again.',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [promptId, toast]
  );

  useEffect(() => {
    loadIntentMirror();
  }, [loadIntentMirror]);

  const handleConfirm = async () => {
    if (!intentData) return;

    setIsConfirming(true);

    try {
      // Track confirmation with analytics
      trackIntentMirrorConfirmed({
        confidence_score: intentData.confidenceScore,
        editing_attempts: lowConfidenceAttempts,
        time_to_confirm: Date.now() - performance.now(), // Approximate time since load
      });

      console.log('Intent confirmed:', {
        promptId,
        confidence: intentData.confidenceScore,
      });

      toast({
        title: "Perfect! Let's create your plan",
        description: 'Moving to deliverable generation...',
      });

      // Navigate to Deliverable Generation
      setTimeout(() => {
        window.location.href = `/deliverable?prompt_id=${promptId}`;
      }, 1500);
    } catch (error) {
      console.error('Confirmation failed:', error);
      toast({
        title: 'Confirmation failed',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleEdit = (field: string) => {
    // Track field edit with analytics
    trackIntentMirrorEdited({
      field,
      edit_type: field === 'general' ? 'general' : 'field_specific',
      confidence_score: intentData?.confidenceScore,
    });

    // Track field edit event
    trackFieldEdit(field, '');

    setEditField(field);
    setShowEditModal(true);
    console.log('Edit field requested:', field);
  };

  const handleEditConfirm = () => {
    setShowEditModal(false);
    window.location.href = `/detailed-input?prompt_id=${promptId}&edit_field=${editField}`;
  };

  const handleSupportRequest = () => {
    // Track support request
    trackSupportRequested({
      reason: 'user_initiated',
      confidence_score: intentData?.confidenceScore,
      attempt_count: lowConfidenceAttempts,
    });

    console.log('Support requested:', { attempts: lowConfidenceAttempts });

    toast({
      title: 'Support contacted',
      description: 'Our team will help optimize your business summary.',
    });
  };

  useEffect(() => {
    console.debug('Confirm button state:', isValid);
  }, [isValid]);

  if (isLoading) {
    return (
      <StandardBackground className="items-center justify-center">
        <PageHeader />
        <div className="text-center animate-fade-in">
          <div className="animate-spin w-12 h-12 border-4 border-[#36d1fe] border-t-transparent rounded-full mx-auto mb-4"></div>
          <PageTitle className="text-2xl mb-2">
            Analyzing Your Business
          </PageTitle>
          <BodyText className="opacity-75">
            Creating your personalized summary...
          </BodyText>
        </div>
      </StandardBackground>
    );
  }

  if (!intentData) {
    return (
      <StandardBackground className="items-center justify-center">
        <PageHeader />
        <div className="error-fallback text-center animate-fade-in">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <PageTitle className="text-2xl mb-2">Validation Failed</PageTitle>
          <BodyText className="opacity-75 mb-6">
            There was an issue validating your business summary.
          </BodyText>
          <Button variant="canai" onClick={() => loadIntentMirror()}>
            Try Again
          </Button>
        </div>
      </StandardBackground>
    );
  }

  const showLowConfidenceHelp = intentData.confidenceScore < 0.8;
  const showSupportLink = lowConfidenceAttempts >= 2;

  console.debug('Confirm button props:', {
    id: 'confirm-btn',
    disabled: !isValid,
    text: 'Confirm',
  });

  return (
    <StandardBackground className="items-center justify-center">
      <PageHeader />

      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <PageTitle className="mb-4">Review Your Business Summary</PageTitle>
          <BodyText className="text-lg opacity-90">
            We&apos;ve analyzed your information and created this summary.
            Please review and confirm it&apos;s accurate.
          </BodyText>
        </div>

        <SummaryCard
          summary={intentData.summary}
          confidenceScore={intentData.confidenceScore}
          clarifyingQuestions={intentData.clarifyingQuestions}
          originalData={intentData.originalData}
          isConfirming={isConfirming}
          onConfirm={handleConfirm}
          onEdit={handleEdit}
          onSupport={handleSupportRequest}
          showLowConfidenceHelp={showLowConfidenceHelp}
          showSupportLink={showSupportLink}
        />

        <div className="text-center mt-8 animate-fade-in">
          <div className="bg-[rgba(25,60,101,0.4)] border-2 border-[rgba(54,209,254,0.3)] backdrop-blur-sm rounded-2xl p-6 inline-block">
            <Button
              variant="ghost"
              onClick={() =>
                (window.location.href = `/detailed-input?prompt_id=${promptId}`)
              }
              className="text-[#36d1fe] hover:text-[#00f0ff] hover:bg-[#36d1fe]/10 transition-colors duration-200 text-lg px-6 py-3"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Edit Details
            </Button>
          </div>
        </div>

        <div className="text-center mt-8 animate-fade-in">
          <Button
            id="confirm-btn"
            aria-label="Confirm"
            disabled={!isValid}
            onClick={handleConfirm}
            className="inline-flex items-center justify-center rounded-md text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Confirm
          </Button>
        </div>
      </div>

      <EditModal
        show={showEditModal}
        field={editField}
        onClose={() => setShowEditModal(false)}
        onContinue={handleEditConfirm}
      />
    </StandardBackground>
  );
};

export default IntentMirror;
