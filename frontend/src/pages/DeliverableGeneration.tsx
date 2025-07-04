import PageHeader from '@/components/PageHeader';
import StandardBackground from '@/components/StandardBackground';
import StandardCard from '@/components/StandardCard';
import {
  BodyText,
  CaptionText,
  CardTitle,
  PageTitle,
} from '@/components/StandardTypography';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Download,
  Edit3,
  RefreshCw,
} from 'lucide-react';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

// Import new API functions
import {
  trackDeliverableGenerated,
  trackDeliverableRegenerated,
  trackEmotionalResonance,
  trackPDFDownload,
  trackRevisionRequested,
} from '@/utils/analytics';
import {
  generateDeliverableContent,
  getGenerationStatus,
  regenerateDeliverable,
  requestRevision,
} from '@/utils/deliverableApi';
import { trackEvent } from '@/utils/analytics';

interface DeliverableData {
  id: string;
  content: string;
  productType: 'BUSINESS_BUILDER' | 'SOCIAL_EMAIL' | 'SITE_AUDIT';
  promptId: string;
  generatedAt: string;
  revisionCount: number;
  pdfUrl?: string;
  emotionalResonance?: {
    canaiScore: number;
    genericScore: number;
    delta: number;
    arousal: number;
    valence: number;
    isValid: boolean;
  };
}

interface GenerationProgress {
  step: string;
  message: string;
  progress: number;
}

const DeliverableGeneration: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [isGenerating, setIsGenerating] = useState(true);
  const [currentStep, setCurrentStep] = useState<GenerationProgress>({
    step: 'analyzing',
    message: 'Analyzing your inputs...',
    progress: 10,
  });
  const [deliverable, setDeliverable] = useState<DeliverableData | null>(null);
  const [revisionText, setRevisionText] = useState('');
  const [isRevising, setIsRevising] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const productType =
    (searchParams.get('type') as
      | 'BUSINESS_BUILDER'
      | 'SOCIAL_EMAIL'
      | 'SITE_AUDIT') || 'BUSINESS_BUILDER';
  const promptId = searchParams.get('promptId') || 'demo-prompt-id';

  // Sprinkle Haven Bakery 12-field inputs from Intent Mirror - memoized to prevent useCallback dependency changes
  const intentMirrorInputs = useMemo(
    () => ({
      businessName: 'Sprinkle Haven Bakery',
      targetAudience: 'Denver families',
      primaryGoal: 'funding',
      competitiveContext: 'Blue Moon Bakery',
      brandVoice: 'warm',
      resourceConstraints: '$50k budget; team of 3; 6 months',
      currentStatus: 'Planning phase',
      businessDescription: 'Artisanal bakery offering organic pastries',
      revenueModel: 'Sales, events',
      planPurpose: 'investor',
      location: 'Denver, CO',
      uniqueValue: 'Organic, community-focused pastries',
    }),
    []
  );

  // Memoized generation steps to prevent useCallback dependency changes
  const generationSteps = useMemo(
    () => [
      { step: 'analyzing', message: 'Analyzing your inputs...', progress: 10 },
      {
        step: 'processing',
        message: 'Processing with GPT-4o...',
        progress: 30,
      },
      {
        step: 'validating',
        message: 'Validating emotional resonance with Hume AI...',
        progress: 60,
      },
      {
        step: 'formatting',
        message: 'Formatting deliverable...',
        progress: 80,
      },
      {
        step: 'finalizing',
        message: 'Finalizing and generating PDF...',
        progress: 95,
      },
      { step: 'complete', message: 'Generation complete!', progress: 100 },
    ],
    []
  );

  const generateDeliverable = useCallback(async () => {
    console.log('[DeliverableGeneration] Starting deliverable generation');
    setIsGenerating(true);
    setError(null);

    try {
      const startTime = Date.now();
      let timedOut = false;
      const timeoutId = setTimeout(() => {
        timedOut = true;
        setError('Generation timed out. Please try again.');
        setIsGenerating(false);
        console.error(
          '[DeliverableGeneration] Global timeout reached, exiting generation loop'
        );
      }, 15000);

      let step = 0;
      while (step < generationSteps.length && !timedOut) {
        console.debug('Generation step:', step, 'Timed out:', timedOut);
        if (step > 5) return;
        setCurrentStep(generationSteps[step]);
        if (process.env['NODE_ENV'] !== 'test') {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        step++;
      }
      clearTimeout(timeoutId);
      if (timedOut) return;
      if (step < generationSteps.length) return;

      console.log('[DeliverableGeneration] Generating content with API');
      console.debug(
        '[DeliverableGeneration] Calling generateDeliverableContent',
        { productType, intentMirrorInputs }
      );
      const { canaiOutput, emotionalResonance } =
        await generateDeliverableContent(productType, intentMirrorInputs);

      console.log('[DeliverableGeneration] Content generated successfully');

      const deliverableData: DeliverableData = {
        id: `del-${Date.now()}`,
        content: canaiOutput,
        productType,
        promptId,
        generatedAt: new Date().toISOString(),
        revisionCount: 0,
        pdfUrl: `https://example.com/deliverables/${promptId}.pdf`,
        emotionalResonance,
      };

      try {
        // Use strict analytics function for allowed fields only
        trackDeliverableGenerated({ timestamp: new Date().toISOString() });
        // Use generic event tracker for custom fields
        trackEvent('deliverable_generated', {
          promptId,
          productType,
          completionTimeMs: Date.now() - startTime,
          emotionalResonanceScore: emotionalResonance.canaiScore,
          trustDelta: emotionalResonance.delta,
        });
        trackEmotionalResonance({ timestamp: new Date().toISOString() });
        trackEvent('emotional_resonance', {
          promptId,
          arousal: emotionalResonance.arousal,
          valence: emotionalResonance.valence,
          canaiScore: emotionalResonance.canaiScore,
          genericScore: emotionalResonance.genericScore,
          delta: emotionalResonance.delta,
          validationPassed: emotionalResonance.isValid,
        });
      } catch (analyticsError) {
        console.warn(
          '[DeliverableGeneration] Analytics logging failed, continuing anyway:',
          analyticsError
        );
      }

      setDeliverable(deliverableData);
      setIsGenerating(false);
      toast({
        title: 'Generation Complete',
        description: 'Your deliverable has been successfully generated!',
      });
    } catch (error) {
      console.error('[DeliverableGeneration] Generation failed:', error);
      setError('Generation failed. Please try again.');
      setIsGenerating(false);
      toast({
        title: 'Generation Failed',
        description: 'Unable to generate deliverable. Please try again.',
        variant: 'destructive',
      });
    }
  }, [productType, intentMirrorInputs, generationSteps, toast, promptId]);

  useEffect(() => {
    console.log(
      '[DeliverableGeneration] Page loaded, starting generation process'
    );
    generateDeliverable();
  }, [generateDeliverable]);

  const handleRevision = async () => {
    if (!revisionText.trim() || !deliverable) return;

    setIsRevising(true);

    try {
      const startTime = Date.now();

      // Use real API endpoint with fallback
      const response = await requestRevision({
        prompt_id: deliverable.promptId,
        feedback: revisionText,
      });

      const duration = Date.now() - startTime;

      // Track revision request (with error handling)
      try {
        // Use strict analytics function for allowed fields only
        trackRevisionRequested({ timestamp: new Date().toISOString() });
        // Use generic event tracker for custom fields
        trackEvent('revision_requested', {
          promptId: deliverable.promptId,
          reason: revisionText,
          revisionCount: deliverable.revisionCount + 1,
          responseTime: duration,
        });
      } catch (trackingError) {
        console.warn(
          '[DeliverableGeneration] Revision tracking failed:',
          trackingError
        );
      }

      setDeliverable(prev =>
        prev
          ? {
              ...prev,
              content: response.new_output,
              revisionCount: prev.revisionCount + 1,
              generatedAt: new Date().toISOString(),
            }
          : null
      );

      setRevisionText('');

      toast({
        title: 'Revision Applied',
        description:
          'Your deliverable has been updated based on your feedback.',
      });
    } catch (error) {
      console.error('[DeliverableGeneration] Revision error:', error);
      toast({
        title: 'Revision Failed',
        description: 'Unable to process revision request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRevising(false);
    }

    console.debug('Revision button visible?', !isGenerating && deliverable);
  };

  const handleRegenerate = async () => {
    if (regenerationCount >= 2) {
      toast({
        title: 'Regeneration Limit Reached',
        description: 'Maximum 2 regeneration attempts allowed per deliverable.',
        variant: 'destructive',
      });
      return;
    }

    setIsRegenerating(true);

    try {
      const startTime = Date.now();

      // Use real API endpoint with fallback
      const response = await regenerateDeliverable({
        prompt_id: deliverable?.promptId || '',
        attempt_count: regenerationCount + 1,
      });

      const duration = Date.now() - startTime;

      // Track regeneration (with error handling)
      try {
        // Use strict analytics function for allowed fields only
        trackDeliverableRegenerated({ timestamp: new Date().toISOString() });
        // Use generic event tracker for custom fields
        trackEvent('deliverable_regenerated', {
          promptId: deliverable?.promptId || '',
          attemptCount: regenerationCount + 1,
          responseTime: duration,
        });
      } catch (trackingError) {
        console.warn(
          '[DeliverableGeneration] Regeneration tracking failed:',
          trackingError
        );
      }

      setDeliverable(prev =>
        prev
          ? {
              ...prev,
              content: response.new_output,
              generatedAt: new Date().toISOString(),
            }
          : null
      );

      setRegenerationCount(prev => prev + 1);

      toast({
        title: 'Deliverable Regenerated',
        description: `New version generated (${
          regenerationCount + 1
        }/2 attempts used).`,
      });
    } catch (error) {
      console.error('[DeliverableGeneration] Regeneration error:', error);
      toast({
        title: 'Regeneration Failed',
        description: 'Unable to regenerate deliverable. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }

    console.debug('Regenerate button visible?', !isGenerating && deliverable);
  };

  const handleDownloadPDF = async () => {
    try {
      if (!deliverable?.pdfUrl) {
        throw new Error('PDF not available');
      }

      const startTime = Date.now();

      // Check generation status first
      const status = await getGenerationStatus(deliverable.promptId);

      if (status.status !== 'complete' || !status.pdf_url) {
        throw new Error('PDF not ready yet');
      }

      // Simulate PDF download
      const link = document.createElement('a');
      link.href = status.pdf_url;
      link.download = `${productType.toLowerCase()}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const downloadTime = Date.now() - startTime;

      // Track PDF download (with error handling)
      try {
        // Use strict analytics function for allowed fields only
        trackPDFDownload({ timestamp: new Date().toISOString() });
        // Use generic event tracker for custom fields
        trackEvent('pdf_download', {
          promptId: deliverable.promptId,
          productType,
          downloadTime: downloadTime,
        });
      } catch (trackingError) {
        console.warn(
          '[DeliverableGeneration] PDF download tracking failed:',
          trackingError
        );
      }

      toast({
        title: 'PDF Downloaded',
        description: 'Your deliverable has been downloaded successfully.',
      });
    } catch (error) {
      console.error('[DeliverableGeneration] PDF download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Unable to generate PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: `${section} copied to clipboard.`,
      });
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const formatContent = (content: string) => {
    const sections = content.split('\n\n## ');
    if (sections.length === 1) return content;

    return sections.map((section, index) => {
      if (index === 0) return section;

      const [title, ...contentLines] = section.split('\n');
      const sectionContent = contentLines.join('\n');
      const sectionId = title.toLowerCase().replace(/\s+/g, '-');
      const isExpanded = expandedSections[sectionId] ?? true;

      return (
        <div key={sectionId} className="border-b border-[#00CFFF]/20 pb-4 mb-4">
          <button
            onClick={() => toggleSection(sectionId)}
            className="flex items-center justify-between w-full text-left hover:text-[#00CFFF] transition-colors duration-200"
          >
            <CardTitle className="mb-2 text-white">## {title}</CardTitle>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </button>
          {isExpanded && (
            <div className="relative group">
              <pre className="whitespace-pre-wrap text-white leading-relaxed font-manrope">
                {sectionContent}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(`## ${title}\n${sectionContent}`, title)
                }
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#00CFFF]/10 hover:bg-[#00CFFF]/20 text-white"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      );
    });
  };

  // Removed unused getTemplateContent function

  return (
    <StandardBackground>
      <PageHeader />

      <div className="flex-1 px-3 sm:px-4 py-4 sm:py-8 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <PageTitle className="mb-2 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl px-2">
            {productType
              .replace('_', ' ')
              .toLowerCase()
              .replace(/\b\w/g, l => l.toUpperCase())}{' '}
            Generation
          </PageTitle>
          <BodyText className="text-lg sm:text-xl px-2">
            Creating personalized deliverable for{' '}
            {intentMirrorInputs.businessName}
          </BodyText>
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <div className="mb-6 sm:mb-8 animate-fade-in">
            <StandardCard variant="form" className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-[#00CFFF] animate-spin mx-auto sm:mx-0" />
                <div className="text-center sm:text-left">
                  <CardTitle className="text-[#E6F6FF] text-lg sm:text-xl">
                    {currentStep.message}
                  </CardTitle>
                  <CaptionText className="mt-1 text-sm">
                    Step{' '}
                    {generationSteps.findIndex(
                      s => s.step === currentStep.step
                    ) + 1}{' '}
                    of {generationSteps.length}
                  </CaptionText>
                </div>
              </div>

              <Progress
                value={currentStep.progress}
                className="mb-3 sm:mb-4 h-2 sm:h-3"
              />

              <div className="flex justify-between mb-3 sm:mb-4">
                <CaptionText className="text-sm">
                  {currentStep.progress}% Complete
                </CaptionText>
              </div>

              <CaptionText className="text-center text-xs sm:text-sm leading-relaxed">
                Generating with GPT-4o • Validating with Hume AI • Creating PDF
                via Make.com
              </CaptionText>
            </StandardCard>
          </div>
        )}

        {/* Generated Deliverable */}
        {deliverable && !isGenerating && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Emotional Resonance Score */}
            {deliverable.emotionalResonance && (
              <StandardCard
                variant="content"
                className="bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 border-green-400/40 max-w-4xl mx-auto"
              >
                <div className="flex flex-col gap-4 mb-4 sm:mb-6">
                  <div className="text-center sm:text-left">
                    <CardTitle className="text-green-300 mb-2 text-lg sm:text-xl">
                      Emotional Resonance Analysis
                    </CardTitle>
                    <BodyText className="text-green-200/80 text-sm sm:text-base">
                      Validated by Hume AI for optimal engagement
                    </BodyText>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-green-400 font-manrope">
                      {(
                        deliverable.emotionalResonance.canaiScore * 100
                      ).toFixed(0)}
                      %
                    </div>
                    <CaptionText className="text-green-300 text-sm">
                      CanAI Score
                    </CaptionText>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-black/20 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-xl font-bold text-green-400 font-manrope">
                      {deliverable.emotionalResonance.arousal.toFixed(2)}
                    </div>
                    <CaptionText className="text-green-200 text-xs sm:text-sm">
                      Arousal
                    </CaptionText>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-xl font-bold text-blue-400 font-manrope">
                      {deliverable.emotionalResonance.valence.toFixed(2)}
                    </div>
                    <CaptionText className="text-blue-200 text-xs sm:text-sm">
                      Valence
                    </CaptionText>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-xl font-bold text-purple-400 font-manrope">
                      {(deliverable.emotionalResonance.delta * 100).toFixed(0)}%
                    </div>
                    <CaptionText className="text-purple-200 text-xs sm:text-sm">
                      Improvement
                    </CaptionText>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-xl font-bold text-gray-400 font-manrope">
                      {(
                        deliverable.emotionalResonance.genericScore * 100
                      ).toFixed(0)}
                      %
                    </div>
                    <CaptionText className="text-gray-200 text-xs sm:text-sm">
                      Generic
                    </CaptionText>
                  </div>
                </div>
              </StandardCard>
            )}

            {/* Deliverable Content */}
            <StandardCard variant="content" className="max-w-5xl mx-auto">
              <div className="flex flex-col gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                  <CardTitle className="text-lg sm:text-xl text-center sm:text-left">
                    Your {productType.replace('_', ' ')} Deliverable
                  </CardTitle>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
                  <Button
                    id="regenerate-btn"
                    variant="outline"
                    size={isMobile ? 'default' : 'sm'}
                    onClick={handleRegenerate}
                    disabled={isRegenerating || regenerationCount >= 2}
                    className="border-[#00CFFF] text-[#E6F6FF] hover:bg-[#00CFFF]/20 w-full sm:w-auto"
                    aria-label="Regenerate"
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${
                        isRegenerating ? 'animate-spin' : ''
                      }`}
                    />
                    {isRegenerating
                      ? `Regenerate (${regenerationCount + 1}/2)`
                      : `Regenerate (${regenerationCount}/2)`}
                  </Button>
                  <Button
                    variant="secondary"
                    size={isMobile ? 'default' : 'sm'}
                    onClick={handleDownloadPDF}
                    className="w-full sm:w-auto"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>

              <div className="bg-black/20 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="prose prose-invert max-w-none text-sm sm:text-base text-white">
                  {formatContent(deliverable.content)}
                </div>
              </div>

              {/* Branding Note */}
              <div
                className="p-3 sm:p-4 bg-amber-500/20 border border-amber-500/40 rounded-xl"
                id="branding-note"
              >
                <BodyText className="text-amber-200 text-sm sm:text-base">
                  <strong>Note:</strong> CanAI excludes branding (e.g., logos).
                  Contact us for partners.
                </BodyText>
              </div>
            </StandardCard>

            {/* Revision Request */}
            <StandardCard variant="form" className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 justify-center sm:justify-start">
                <Edit3 className="w-6 h-6 sm:w-8 sm:h-8 text-[#00CFFF]" />
                <CardTitle className="text-lg sm:text-xl">
                  Request Revision
                </CardTitle>
              </div>

              <Textarea
                id="revision-input"
                placeholder="Describe specific changes you'd like (e.g., 'Make tone bolder', 'Add more financial details', 'Focus more on sustainability')..."
                value={revisionText}
                onChange={e => setRevisionText(e.target.value)}
                className="mb-4 bg-white/10 border-[#00CFFF]/30 text-white placeholder:text-white/50 min-h-[100px] text-sm sm:text-base"
                rows={isMobile ? 3 : 4}
              />

              <Button
                id="revision-btn"
                onClick={handleRevision}
                disabled={isRevising || isGenerating || isRegenerating}
                aria-label="Apply Revision"
                variant="secondary"
                className="w-full"
                size={isMobile ? 'default' : 'lg'}
              >
                {isRevising ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Applying Revision...
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Apply Revision
                  </>
                )}
              </Button>
            </StandardCard>

            {/* Deliverable Metadata */}
            <StandardCard variant="content" className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#00CFFF] font-manrope mb-1 sm:mb-2">
                    {deliverable.revisionCount}
                  </div>
                  <CaptionText className="text-xs sm:text-sm">
                    Revisions
                  </CaptionText>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#00CFFF] font-manrope mb-1 sm:mb-2">
                    {regenerationCount}/2
                  </div>
                  <CaptionText className="text-xs sm:text-sm">
                    Regenerations
                  </CaptionText>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#00CFFF] font-manrope mb-1 sm:mb-2">
                    {deliverable.content.split(' ').length}
                  </div>
                  <CaptionText className="text-xs sm:text-sm">
                    Words
                  </CaptionText>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#00CFFF] font-manrope mb-1 sm:mb-2">
                    {new Date(deliverable.generatedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <CaptionText className="text-xs sm:text-sm">
                    Generated
                  </CaptionText>
                </div>
              </div>
            </StandardCard>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <StandardCard
            variant="content"
            className="bg-red-500/20 border-red-500/40 max-w-3xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-red-200 mb-4 sm:mb-6">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto sm:mx-0" />
              <div className="text-center sm:text-left">
                <CardTitle className="text-red-300 text-lg sm:text-xl">
                  Generation Error
                </CardTitle>
                <BodyText className="opacity-75 text-sm sm:text-base">
                  {error}
                </BodyText>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={generateDeliverable}
              className="border-red-400 text-red-200 hover:bg-red-500/20 w-full sm:w-auto"
              size={isMobile ? 'default' : 'sm'}
            >
              Retry Generation
            </Button>
          </StandardCard>
        )}
      </div>
    </StandardBackground>
  );
};

export default DeliverableGeneration;
