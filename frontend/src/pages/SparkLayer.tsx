import StandardBackground from '@/components/StandardBackground';
import {
  BodyText,
  PageTitle,
  SectionTitle,
} from '@/components/StandardTypography';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StandardButton } from '@/components/ui/standard-button';
import {
  StandardForm,
  StandardFormGroup,
  StandardFormLabel,
  StandardFormTextarea,
} from '@/components/ui/standard-form';
import { ArrowRight, RefreshCw, Sparkles, Star } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// API and analytics imports
import {
  trackFunnelStep,
  trackPageView,
  trackSparkSelected,
  trackSparksRegenerated,
} from '@/utils/analytics';
import { logInteraction } from '@/utils/api';
import { generateSparks, regenerateSparks } from '@/utils/sparkLayerApi';

interface Spark {
  id: string;
  title: string;
  tagline: string;
  productTrack: 'business_builder' | 'social_email' | 'site_audit';
}

const SparkLayer = () => {
  const navigate = useNavigate();
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [selectedSpark, setSelectedSpark] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [trustScore] = useState(85); // Mock trust score

  const initializeSparks = useCallback(async () => {
    try {
      trackPageView('spark_layer');
      trackFunnelStep('spark_layer_viewed');

      const response = await generateSparks({
        businessType: 'Family Bakery',
        tone: 'warm',
        outcome: 'community_connection',
        attemptCount: 1,
      });

      if (response.sparks) {
        // Convert SparkData to Spark with additional properties
        const convertedSparks: Spark[] = response.sparks.map(
          (spark, index) => ({
            id: `spark_${index + 1}`,
            title: spark.title,
            tagline: spark.tagline,
            productTrack: 'business_builder' as const,
          })
        );

        setSparks(convertedSparks);
        console.log('[Spark Layer] Initial sparks loaded:', convertedSparks);
      } else {
        // Fallback sparks
        setSparks([
          {
            id: 'community_spark',
            title: 'BUSINESS_BUILDER: The Community Spark',
            tagline: 'Unite Denver families with a cozy bakery experience',
            productTrack: 'business_builder',
          },
          {
            id: 'heritage_hub',
            title: 'BUSINESS_BUILDER: The Heritage Hub',
            tagline: 'Celebrate traditions through authentic family recipes',
            productTrack: 'business_builder',
          },
          {
            id: 'neighborhood_nest',
            title: 'BUSINESS_BUILDER: The Neighborhood Nest',
            tagline: 'Create the heartbeat of your local community',
            productTrack: 'business_builder',
          },
        ]);
      }

      await logInteraction({
        user_id: 'demo-user-id',
        interaction_type: 'sparks_generated',
        interaction_details: {
          attempt_count: 1,
          spark_count: 3,
          trust_score: trustScore,
        },
      });
    } catch (error) {
      console.error('[Spark Layer] Failed to load sparks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [trustScore]);

  useEffect(() => {
    initializeSparks();
  }, [initializeSparks]);

  const handleRegenerate = async () => {
    if (attemptCount >= 3) return; // Limit regeneration attempts

    setIsRegenerating(true);
    const newAttemptCount = attemptCount + 1;

    try {
      trackSparksRegenerated(newAttemptCount);

      const response = await regenerateSparks({
        businessType: 'Family Bakery',
        tone: 'warm',
        outcome: 'community_connection',
        attemptCount: newAttemptCount,
        feedback: feedback.trim() || undefined,
      });

      if (response.sparks) {
        // Convert SparkData to Spark with additional properties
        const convertedSparks: Spark[] = response.sparks.map(
          (spark, index) => ({
            id: `regenerated_${index + 1}`,
            title: spark.title,
            tagline: spark.tagline,
            productTrack: 'business_builder' as const,
          })
        );

        setSparks(convertedSparks);
        setAttemptCount(newAttemptCount);
        setFeedback('');
        console.log('[Spark Layer] Sparks regenerated:', convertedSparks);
      }
    } catch (error) {
      console.error('[Spark Layer] Regeneration failed:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSparkSelect = (sparkId: string) => {
    setSelectedSpark(sparkId);
    const spark = sparks.find(s => s.id === sparkId);

    if (spark) {
      trackSparkSelected(sparkId);

      logInteraction({
        user_id: 'demo-user-id',
        interaction_type: 'spark_selected',
        interaction_details: {
          spark_id: sparkId,
          product_track: spark.productTrack,
          attempt_count: attemptCount,
        },
      });
    }
  };

  const handleProceedToPurchase = () => {
    if (!selectedSpark) return;

    const spark = sparks.find(s => s.id === selectedSpark);
    if (spark) {
      trackFunnelStep('proceed_to_purchase', {
        spark_id: selectedSpark,
        product: spark.productTrack,
      });
      navigate('/purchase-flow');
    }
  };

  if (isLoading) {
    return (
      <StandardBackground className="items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-[#36d1fe] animate-spin mx-auto" />
          <BodyText className="text-white">
            Generating your personalized sparks...
          </BodyText>
        </div>
      </StandardBackground>
    );
  }

  return (
    <StandardBackground>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <PageTitle className="text-white mb-4">Choose Your Spark</PageTitle>
          <BodyText className="text-xl text-white opacity-90 max-w-3xl mx-auto">
            We&apos;ve created three unique concepts tailored to your vision.
            Select the one that resonates most with your goals.
          </BodyText>
        </div>

        {/* Spark Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {sparks.map(spark => (
            <Card
              key={spark.id}
              className={`cursor-pointer transition-all duration-300 canai-product-card ${
                selectedSpark === spark.id
                  ? 'ring-4 ring-[#36d1fe] ring-opacity-60 scale-105'
                  : 'hover:scale-102'
              }`}
              onClick={() => handleSparkSelect(spark.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-[#36d1fe]" />
                  <span className="text-[#36d1fe] text-sm font-medium">
                    CONCEPT {spark.id.toUpperCase()}
                  </span>
                </div>
                <CardTitle className="text-white text-lg leading-tight">
                  {spark.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BodyText className="text-white opacity-90 text-base">
                  {spark.tagline}
                </BodyText>
                {selectedSpark === spark.id && (
                  <div className="mt-4 p-3 bg-[#36d1fe]/10 rounded-lg border border-[#36d1fe]/30">
                    <BodyText className="text-[#36d1fe] text-sm font-medium">
                      ✓ Selected - This concept will shape your personalized
                      deliverable
                    </BodyText>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Regeneration Section */}
        <Card className="mb-8 bg-[rgba(25,60,101,0.7)] border-2 border-[#36d1fe]/40">
          <CardContent className="p-6">
            <SectionTitle className="text-white text-center mb-4">
              Want Different Options?
            </SectionTitle>
            <BodyText className="text-white text-center mb-4 opacity-90">
              Not quite right? Share what you&apos;d like to see different and
              we&apos;ll generate new concepts.
            </BodyText>

            <StandardForm>
              <StandardFormGroup>
                <StandardFormLabel className="text-white">
                  What would you like to adjust? (Optional)
                </StandardFormLabel>
                <StandardFormTextarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="e.g., More focus on sustainability, different target audience, stronger community emphasis..."
                  className="text-white placeholder:text-white/50"
                />
              </StandardFormGroup>

              <div className="flex justify-center">
                <StandardButton
                  onClick={handleRegenerate}
                  disabled={attemptCount >= 3 || isRegenerating}
                  loading={isRegenerating}
                  loadingText="Generating new concepts..."
                  variant="secondary"
                  icon={<RefreshCw size={18} />}
                  iconPosition="left"
                >
                  Generate New Concepts ({attemptCount}/3)
                </StandardButton>
              </div>
            </StandardForm>

            {attemptCount >= 3 && (
              <BodyText className="text-regenerate-count text-center mt-4">
                Maximum regenerations reached. Please select from the available
                concepts.
              </BodyText>
            )}
          </CardContent>
        </Card>

        {/* Proceed Button */}
        <div className="flex justify-center">
          <StandardButton
            onClick={handleProceedToPurchase}
            disabled={!selectedSpark}
            variant="primary"
            size="lg"
            icon={<ArrowRight size={20} />}
            iconPosition="right"
          >
            Continue to Purchase (
            {selectedSpark ? '1 concept selected' : 'Select a concept first'})
          </StandardButton>
        </div>
      </div>
    </StandardBackground>
  );
};

export default SparkLayer;
