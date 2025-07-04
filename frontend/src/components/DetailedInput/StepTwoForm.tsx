import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StepTwoFormProps } from '@/types/formTypes';
import { POSTHOG_EVENTS, trackEvent } from '@/utils/analytics';
import { generateTooltipContent } from '@/utils/api';
import { HelpCircle, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

const StepTwoForm: React.FC<StepTwoFormProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const [tooltipLoading, setTooltipLoading] = useState<string | null>(null);
  const [enhancedTooltips, setEnhancedTooltips] = useState<
    Record<string, string>
  >({});

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleTooltipClick = async (field: string) => {
    console.log('Tooltip viewed:', field);

    // Track tooltip interaction
    trackEvent(POSTHOG_EVENTS.FUNNEL_STEP, {
      stepName: 'tooltip_viewed',
      completed: true,
      tooltip_field: field,
      business_type: formData.businessName ? 'defined' : 'undefined',
    });

    // Generate enhanced tooltip if not already cached
    if (!enhancedTooltips[field]) {
      setTooltipLoading(field);

      try {
        const startTime = Date.now();
        const tooltipResponse = await generateTooltipContent({
          field,
          business_type: formData.businessName || 'general',
          context: formData.businessDescription || '',
        });

        const duration = Date.now() - startTime;
        console.log(`[Tooltip] Generated for ${field} in ${duration}ms`);

        if (tooltipResponse.content) {
          setEnhancedTooltips(prev => ({
            ...prev,
            [field]: tooltipResponse.content,
          }));
        }

        // Track tooltip generation performance
        trackEvent(POSTHOG_EVENTS.FUNNEL_STEP, {
          stepName: 'tooltip_generated',
          completed: true,
          tooltip_field: field,
          generation_time_ms: duration,
          meets_performance_target: duration < 100,
        });
      } catch (error) {
        console.error('[Tooltip] Generation failed:', error);

        trackEvent(POSTHOG_EVENTS.FUNNEL_STEP, {
          stepName: 'tooltip_generation_failed',
          completed: false,
          tooltip_field: field,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setTooltipLoading(null);
      }
    }
  };

  const countWords = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  };

  const getTooltipContent = (field: string, defaultContent: string) => {
    return enhancedTooltips[field] || defaultContent;
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Business Description - Featured first with enhanced styling */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Label
              htmlFor="desc-input"
              className="text-white font-bold text-lg"
            >
              Business Description * (10-50 words)
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  {tooltipLoading === 'businessDescription' ? (
                    <Loader2 className="w-5 h-5 text-[#36d1fe] animate-spin" />
                  ) : (
                    <HelpCircle
                      id="desc-tooltip"
                      className="w-5 h-5 text-[#36d1fe] cursor-help hover:text-[#00F0FF] transition-colors duration-200"
                      onClick={() => handleTooltipClick('businessDescription')}
                    />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-[#0A0F1C] border-[#36d1fe]/50 text-white max-w-xs p-3 rounded-lg shadow-lg">
                <p className="text-sm">
                  {getTooltipContent(
                    'businessDescription',
                    'E.g., "Artisanal bakery serving Denver with organic pastries and community gathering space"'
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            id="desc-input"
            value={formData.businessDescription}
            onChange={e =>
              handleInputChange('businessDescription', e.target.value)
            }
            placeholder="e.g., Artisanal bakery serving Denver with organic pastries and community gathering space"
            className="bg-[#0A0F1C]/60 border-2 border-[#36d1fe]/50 text-white placeholder:text-white/70 focus:border-[#36d1fe] focus:ring-2 focus:ring-[#36d1fe]/30 min-h-[140px] text-base rounded-xl p-4 resize-none transition-all duration-200 hover:border-[#36d1fe]/70"
            maxLength={400}
          />
          <div className="flex justify-between items-center text-sm">
            <span className="text-white font-medium">
              Word count:{' '}
              <span className="text-[#36d1fe] font-bold">
                {countWords(formData.businessDescription)}/50
              </span>
            </span>
            {errors.businessDescription && (
              <span className="text-red-400 font-medium">
                {errors.businessDescription}
              </span>
            )}
          </div>
        </div>

        {/* Plan Purpose - Enhanced styling */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-3">
            <Label
              htmlFor="purpose-select"
              className="text-white font-bold text-lg"
            >
              Plan Purpose *
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle
                  className="w-5 h-5 text-[#36d1fe] cursor-help hover:text-[#00F0FF] transition-colors duration-200"
                  onClick={() => handleTooltipClick('planPurpose')}
                />
              </TooltipTrigger>
              <TooltipContent className="bg-[#0A0F1C] border-[#36d1fe]/50 text-white max-w-xs p-3 rounded-lg shadow-lg">
                <p className="text-sm">
                  Will you use this for investors or internal planning?
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={formData.planPurpose}
            onValueChange={value => handleInputChange('planPurpose', value)}
          >
            <SelectTrigger
              id="purpose-select"
              className="bg-[#0A0F1C]/60 border-2 border-[#36d1fe]/50 text-white h-14 text-base rounded-xl px-4 hover:border-[#36d1fe]/70 focus:border-[#36d1fe] focus:ring-2 focus:ring-[#36d1fe]/30 transition-all duration-200"
            >
              <SelectValue placeholder="Select plan purpose" />
            </SelectTrigger>
            <SelectContent className="bg-[#0A0F1C] border-2 border-[#36d1fe]/50 rounded-xl shadow-xl">
              <SelectItem
                value="investor"
                className="text-white hover:bg-[#36d1fe]/30 focus:bg-[#36d1fe]/30 rounded-lg mx-1 my-1"
              >
                Investor Presentation
              </SelectItem>
              <SelectItem
                value="internal"
                className="text-white hover:bg-[#36d1fe]/30 focus:bg-[#36d1fe]/30 rounded-lg mx-1 my-1"
              >
                Internal Planning
              </SelectItem>
              <SelectItem
                value="loan"
                className="text-white hover:bg-[#36d1fe]/30 focus:bg-[#36d1fe]/30 rounded-lg mx-1 my-1"
              >
                Loan Application
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.planPurpose && (
            <p className="text-red-400 text-sm font-medium mt-2">
              {errors.planPurpose}
            </p>
          )}
        </div>

        {/* Two-column layout for secondary fields with improved spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          {/* Resource Constraints */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <Label
                htmlFor="constraints-input"
                className="text-white font-semibold text-base"
              >
                Resource Constraints
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    {tooltipLoading === 'resourceConstraints' ? (
                      <Loader2 className="w-5 h-5 text-[#36d1fe] animate-spin" />
                    ) : (
                      <HelpCircle
                        id="constraints-tooltip"
                        className="w-5 h-5 text-[#36d1fe] cursor-help hover:text-[#00F0FF] transition-colors duration-200"
                        onClick={() =>
                          handleTooltipClick('resourceConstraints')
                        }
                      />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-[#0A0F1C] border-[#36d1fe]/50 text-white max-w-xs p-3 rounded-lg shadow-lg">
                  <p className="text-sm">
                    {getTooltipContent(
                      'resourceConstraints',
                      'E.g., &quot;$50k budget; team of 3; 6 months timeline&quot;'
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              id="constraints-input"
              value={formData.resourceConstraints}
              onChange={e =>
                handleInputChange('resourceConstraints', e.target.value)
              }
              placeholder="e.g., $50k budget; team of 3; 6 months timeline"
              className="bg-[#0A0F1C]/60 border-2 border-[#36d1fe]/50 text-white placeholder:text-white/70 focus:border-[#36d1fe] focus:ring-2 focus:ring-[#36d1fe]/30 min-h-[120px] text-base rounded-xl p-4 resize-none transition-all duration-200 hover:border-[#36d1fe]/70"
              maxLength={200}
            />
          </div>

          {/* Current Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <Label
                htmlFor="status-input"
                className="text-white font-semibold text-base"
              >
                Current Status
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle
                    className="w-5 h-5 text-[#36d1fe] cursor-help hover:text-[#00F0FF] transition-colors duration-200"
                    onClick={() => handleTooltipClick('currentStatus')}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-[#0A0F1C] border-[#36d1fe]/50 text-white max-w-xs p-3 rounded-lg shadow-lg">
                  <p className="text-sm">
                    E.g., &quot;Planning phase - researched location, need
                    business plan for loan&quot;
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              id="status-input"
              value={formData.currentStatus}
              onChange={e => handleInputChange('currentStatus', e.target.value)}
              placeholder="e.g., Planning phase - researched location"
              className="bg-[#0A0F1C]/60 border-2 border-[#36d1fe]/50 text-white placeholder:text-white/70 focus:border-[#36d1fe] focus:ring-2 focus:ring-[#36d1fe]/30 min-h-[120px] text-base rounded-xl p-4 resize-none transition-all duration-200 hover:border-[#36d1fe]/70"
              maxLength={120}
            />
          </div>
        </div>

        {/* Revenue Model - Enhanced single column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-3">
            <Label
              htmlFor="revenue-input"
              className="text-white font-semibold text-base"
            >
              Revenue Model
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  {tooltipLoading === 'revenueModel' ? (
                    <Loader2 className="w-5 h-5 text-[#36d1fe] animate-spin" />
                  ) : (
                    <HelpCircle
                      id="revenue-tooltip"
                      className="w-5 h-5 text-[#36d1fe] cursor-help hover:text-[#00F0FF] transition-colors duration-200"
                      onClick={() => handleTooltipClick('revenueModel')}
                    />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-[#0A0F1C] border-[#36d1fe]/50 text-white max-w-xs p-3 rounded-lg shadow-lg">
                <p className="text-sm">
                  {getTooltipContent(
                    'revenueModel',
                    'E.g., &quot;Bakery sales, events, catering services&quot;'
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="revenue-input"
            value={formData.revenueModel}
            onChange={e => handleInputChange('revenueModel', e.target.value)}
            placeholder="e.g., Bakery sales, events, catering services"
            className="bg-[#0A0F1C]/60 border-2 border-[#36d1fe]/50 text-white placeholder:text-white/70 focus:border-[#36d1fe] focus:ring-2 focus:ring-[#36d1fe]/30 h-14 text-base rounded-xl px-4 transition-all duration-200 hover:border-[#36d1fe]/70"
            maxLength={150}
          />
        </div>

        {/* Additional Context - Optional with enhanced styling */}
        <div className="pt-6 border-t-2 border-[#36d1fe]/30 space-y-4">
          <div className="flex items-center gap-3 mb-3">
            <Label
              htmlFor="feedback-text"
              className="text-white font-semibold text-base"
            >
              Additional Context{' '}
              <span className="text-white text-sm font-normal">(Optional)</span>
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-5 h-5 text-[#36d1fe] cursor-help hover:text-[#00F0FF] transition-colors duration-200" />
              </TooltipTrigger>
              <TooltipContent className="bg-[#0A0F1C] border-[#36d1fe]/50 text-white max-w-xs p-3 rounded-lg shadow-lg">
                <p className="text-sm">
                  Any other important details about your bakery business?
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            id="feedback-text"
            value={formData.additionalContext}
            onChange={e =>
              handleInputChange('additionalContext', e.target.value)
            }
            placeholder="e.g., Family recipes passed down 3 generations, partnership with local farms established"
            className="bg-[#0A0F1C]/60 border-2 border-[#36d1fe]/50 text-white placeholder:text-white/70 focus:border-[#36d1fe] focus:ring-2 focus:ring-[#36d1fe]/30 min-h-[120px] text-base rounded-xl p-4 resize-none transition-all duration-200 hover:border-[#36d1fe]/70"
            maxLength={300}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default StepTwoForm;
