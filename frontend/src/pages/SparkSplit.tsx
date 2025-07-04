import ProjectContextSummary from '@/components/SparkSplit/ProjectContextSummary';
import RefinedComparisonContainer from '@/components/SparkSplit/RefinedComparisonContainer';
import RefinedFeedbackForm from '@/components/SparkSplit/RefinedFeedbackForm';
import TrustDeltaDisplay from '@/components/SparkSplit/TrustDeltaDisplay';
import StandardBackground from '@/components/StandardBackground';
import {
  BodyText,
  PageTitle,
  SectionTitle,
} from '@/components/StandardTypography';
import LoadingState from '@/components/enhanced/LoadingState';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import {
  MobileOptimizedCard,
  MobileOptimizedCardContent,
} from '@/components/ui/mobile-optimized-card';
import { useAccessibility } from '@/hooks/useAccessibility';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { ArrowRight, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// API and analytics imports
import {
  trackFeedbackSubmission,
  trackFunnelStep,
  trackPageView,
  trackSparkSplitView,
} from '@/utils/analytics';
import { logInteraction } from '@/utils/api';
import { generateSparkSplit, submitFeedback } from '@/utils/sparkSplitApi';

const SparkSplit = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [canaiOutput, setCanaiOutput] = useState('');
  const [genericOutput, setGenericOutput] = useState('');
  const [trustDelta, setTrustDelta] = useState(0);
  const [emotionalResonance, setEmotionalResonance] = useState({
    canaiScore: 0,
    genericScore: 0,
    delta: 0,
  });

  // Enhanced hooks
  const { trackInteraction } = usePerformanceMonitor('spark_split', 500);
  const { setPageTitle, announce } = useAccessibility();

  useEffect(() => {
    setPageTitle('Spark Split Comparison');

    const initializeSparkSplit = async () => {
      try {
        // Track page view
        trackPageView('spark_split');
        trackFunnelStep('spark_split_viewed');
        trackSparkSplitView();

        // Generate comparison outputs
        const response = await generateSparkSplit({
          businessName: 'Family Bakery',
          tone: 'warm',
          outcome: 'community_connection',
        });

        if (response.error) {
          throw new Error(response.error);
        }

        setCanaiOutput(response.canaiOutput);
        setGenericOutput(response.genericOutput);
        setTrustDelta(response.trustDelta);
        setEmotionalResonance(response.emotionalResonance);

        announce('Comparison results loaded successfully', 'polite');

        // Log interaction
        await logInteraction({
          user_id: 'demo-user-id',
          interaction_type: 'spark_split_view',
          interaction_details: {
            trust_delta: response.trustDelta,
            emotional_resonance: response.emotionalResonance,
          },
        });
      } catch (error: unknown) {
        console.error('[SparkSplit] Initialization failed:', error);

        // Fallback content
        setCanaiOutput(`# BUSINESS_BUILDER: The Community Spark

Transform your family bakery vision into Denver's most beloved neighborhood gathering place.

## Executive Summary
Your warm, family-centered bakery isn't just about bread and pastries—it's about creating the heart of your community. This plan leverages your personal story and values to build sustainable connections that turn first-time customers into lifelong advocates.

## Market Opportunity
Denver's growing families crave authentic, local experiences. Your bakery fills the gap between impersonal chains and the intimate, multi-generational gathering space that builds lasting memories.

## Revenue Strategy
- **Morning Rush**: Premium coffee + fresh pastries for working parents
- **Afternoon Comfort**: After-school treats + homework-friendly environment
- **Weekend Celebrations**: Custom cakes + family event hosting
- **Community Events**: Baking classes + local artist showcases

## Implementation Timeline
**Month 1-2**: Secure location in family-dense neighborhood, design welcoming interior
**Month 3-4**: Hire community-minded staff, establish supplier relationships
**Month 5-6**: Grand opening with neighborhood celebration, loyalty program launch

Your bakery becomes more than a business—it becomes the place where Denver families create their most cherished moments.`);

        setGenericOutput(`# Business Plan: Bakery

## Overview
This document outlines a business plan for starting a bakery.

## Market Analysis
The bakery industry serves customers who want baked goods. There is demand for bread, cakes, and pastries in most markets.

## Products and Services
- Bread
- Pastries
- Cakes
- Coffee
- Catering services

## Target Market
- Local residents
- Office workers
- Event planners
- Restaurants

## Marketing Strategy
- Social media advertising
- Local partnerships
- Print advertisements
- Grand opening promotion

## Financial Projections
Revenue projections should be based on local market data and competition analysis. Initial investment will be required for equipment, lease, and inventory.

## Operations Plan
Daily operations will include baking, customer service, inventory management, and cleaning. Staff will need training in food safety and customer service.

## Conclusion
A bakery can be a profitable business with proper planning and execution.`);

        setTrustDelta(4.2);
        setEmotionalResonance({
          canaiScore: 8.7,
          genericScore: 3.2,
          delta: 5.5,
        });

        announce(
          'Loaded with sample content due to connection issue',
          'assertive'
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeSparkSplit();
  }, [setPageTitle, announce]);

  const handleFeedbackSubmit = async (rating: number, comment: string) => {
    try {
      trackInteraction('feedback_submit');
      trackFeedbackSubmission('spark_split', rating);

      await submitFeedback({
        rating,
        comment,
        trust_delta: trustDelta,
        emotional_resonance: emotionalResonance,
      });

      announce('Feedback submitted successfully', 'polite');

      // Navigate to feedback page after submission
      setTimeout(() => {
        navigate('/feedback');
      }, 1500);
    } catch (error: unknown) {
      console.error('[SparkSplit] Feedback submission failed:', error);
      announce('Failed to submit feedback. Please try again.', 'assertive');
    }
  };

  const handleDownloadPDF = () => {
    trackInteraction('pdf_download');
    trackFunnelStep('pdf_download', { source: 'spark_split' });

    // Create downloadable content
    const content = `CanAI Personalized Output\n\n${canaiOutput}\n\n---\n\nGeneric AI Output\n\n${genericOutput}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canai-comparison.txt';
    a.click();
    URL.revokeObjectURL(url);

    announce('Comparison downloaded successfully', 'polite');
  };

  const handleContinueJourney = () => {
    trackInteraction('continue_journey');
    trackFunnelStep('continue_journey', { source: 'spark_split' });
    navigate('/feedback');
  };

  if (isLoading) {
    return (
      <StandardBackground className="items-center justify-center">
        <LoadingState
          message="Generating your personalized comparison..."
          variant="sparkles"
          size="lg"
        />
      </StandardBackground>
    );
  }

  return (
    <StandardBackground>
      <div
        id="main-content"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      >
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <PageTitle className="text-white mb-4">See The Difference</PageTitle>
          <BodyText className="text-xl text-white opacity-90 max-w-3xl mx-auto">
            Experience how CanAI&apos;s emotional intelligence creates outputs
            that truly resonate with your vision, compared to generic AI
            responses.
          </BodyText>
        </div>

        {/* Project Context Summary */}
        <div className="mb-8">
          <ProjectContextSummary />
        </div>

        {/* Trust Delta Display */}
        <div className="mb-8">
          <TrustDeltaDisplay delta={trustDelta} />
        </div>

        {/* Comparison Container */}
        <div className="mb-12">
          <RefinedComparisonContainer
            canaiOutput={canaiOutput}
            genericOutput={genericOutput}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <EnhancedButton
            variant="secondary"
            size="lg"
            onClick={handleDownloadPDF}
            icon={<Download size={20} />}
            iconPosition="left"
          >
            Download Comparison
          </EnhancedButton>

          <EnhancedButton
            variant="primary"
            size="lg"
            onClick={handleContinueJourney}
            icon={<ArrowRight size={20} />}
            iconPosition="right"
          >
            Continue Journey
          </EnhancedButton>
        </div>

        {/* Feedback Form */}
        <MobileOptimizedCard className="max-w-4xl mx-auto" glowEffect>
          <MobileOptimizedCardContent className="p-6 sm:p-8">
            <SectionTitle className="text-white text-center mb-6">
              Share Your Experience
            </SectionTitle>
            <RefinedFeedbackForm onSubmit={handleFeedbackSubmit} />
          </MobileOptimizedCardContent>
        </MobileOptimizedCard>
      </div>
    </StandardBackground>
  );
};

export default SparkSplit;
