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
import { StepOneFormProps } from '@/types/formTypes';
import { HelpCircle } from 'lucide-react';
import React from 'react';

const StepOneForm: React.FC<StepOneFormProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleTooltipClick = (field: string) => {
    console.log('Tooltip viewed:', field);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Business Name */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Label
              htmlFor="name-input"
              className="text-white font-semibold text-base"
            >
              Business Name *
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle
                  className="w-5 h-5 text-[#36d1fe] cursor-help hover:text-[#00F0FF] transition-colors"
                  onClick={() => handleTooltipClick('businessName')}
                />
              </TooltipTrigger>
              <TooltipContent className="bg-[#0A0F1C] border-[#36d1fe] text-white max-w-xs">
                <p>
                  E.g., &quot;Sprinkle Haven Bakery&quot; - Your official
                  business name (3-50 characters)
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="name-input"
            value={formData.businessName}
            onChange={e => handleInputChange('businessName', e.target.value)}
            placeholder="e.g., Sprinkle Haven Bakery"
            className="bg-[#0A0F1C]/50 border-[#36d1fe]/40 text-white placeholder:text-white/60 focus:border-[#36d1fe] focus:ring-2 focus:ring-[#36d1fe]/20 h-12 text-base rounded-lg"
            maxLength={50}
          />
          {errors.businessName && (
            <p className="text-red-400 text-sm mt-2">{errors.businessName}</p>
          )}
        </div>

        {/* Target Audience */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Label
              htmlFor="audience-input"
              className="text-white font-semibold text-base"
            >
              Target Audience *
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle
                  className="w-5 h-5 text-[#36d1fe] cursor-help hover:text-[#00F0FF] transition-colors"
                  onClick={() => handleTooltipClick('targetAudience')}
                />
              </TooltipTrigger>
              <TooltipContent className="bg-[#0A0F1C] border-[#36d1fe] text-white max-w-xs">
                <p>
                  E.g., &quot;Denver families with young children who value
                  organic, artisanal baked goods&quot;
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            id="audience-input"
            value={formData.targetAudience}
            onChange={e => handleInputChange('targetAudience', e.target.value)}
            placeholder="e.g., Denver families with young children who value organic, artisanal baked goods"
            className="bg-[#0A0F1C]/50 border-[#36d1fe]/40 text-white placeholder:text-white/60 focus:border-[#36d1fe] focus:ring-2 focus:ring-[#36d1fe]/20 min-h-[100px] text-base rounded-lg resize-none"
            maxLength={200}
          />
          {errors.targetAudience && (
            <p className="text-red-400 text-sm mt-2">{errors.targetAudience}</p>
          )}
        </div>

        {/* Primary Goal */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Label
              htmlFor="goal-select"
              className="text-white font-semibold text-base"
            >
              Primary Goal *
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle
                  className="w-5 h-5 text-[#36d1fe] cursor-help hover:text-[#00F0FF] transition-colors"
                  onClick={() => handleTooltipClick('primaryGoal')}
                />
              </TooltipTrigger>
              <TooltipContent className="bg-[#0A0F1C] border-[#36d1fe] text-white max-w-xs">
                <p>What&apos;s your main objective for this business plan?</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={formData.primaryGoal}
            onValueChange={value => handleInputChange('primaryGoal', value)}
          >
            <SelectTrigger
              id="goal-select"
              className="bg-[#0A0F1C]/50 border-[#36d1fe]/40 text-white h-12 text-base rounded-lg"
            >
              <SelectValue placeholder="Select your primary goal" />
            </SelectTrigger>
            <SelectContent className="bg-[#0A0F1C] border-[#36d1fe]">
              <SelectItem
                value="funding"
                className="text-white hover:bg-[#36d1fe]/20 focus:bg-[#36d1fe]/20"
              >
                Secure Funding
              </SelectItem>
              <SelectItem
                value="growth"
                className="text-white hover:bg-[#36d1fe]/20 focus:bg-[#36d1fe]/20"
              >
                Business Growth
              </SelectItem>
              <SelectItem
                value="operations"
                className="text-white hover:bg-[#36d1fe]/20 focus:bg-[#36d1fe]/20"
              >
                Operational Planning
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.primaryGoal && (
            <p className="text-red-400 text-sm mt-2">{errors.primaryGoal}</p>
          )}
        </div>

        {/* Two-column layout for smaller fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Competitive Context */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Label
                htmlFor="context-input"
                className="text-white font-semibold text-base"
              >
                Competitive Context
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle
                    className="w-5 h-5 text-[#36d1fe] cursor-help hover:text-[#00F0FF] transition-colors"
                    onClick={() => handleTooltipClick('competitiveContext')}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-[#0A0F1C] border-[#36d1fe] text-white max-w-xs">
                  <p>
                    E.g., &quot;Blue Moon Bakery dominates downtown, but lacks
                    organic options&quot;
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="context-input"
              value={formData.competitiveContext}
              onChange={e =>
                handleInputChange('competitiveContext', e.target.value)
              }
              placeholder="e.g., Blue Moon Bakery dominates downtown"
              className="bg-[#0A0F1C]/50 border-[#36d1fe]/40 text-white placeholder:text-white/60 focus:border-[#36d1fe] focus:ring-2 focus:ring-[#36d1fe]/20 h-12 text-base rounded-lg"
              maxLength={100}
            />
          </div>

          {/* Brand Voice */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Label
                htmlFor="voice-select"
                className="text-white font-semibold text-base"
              >
                Brand Voice
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle
                    className="w-5 h-5 text-[#36d1fe] cursor-help hover:text-[#00F0FF] transition-colors"
                    onClick={() => handleTooltipClick('brandVoice')}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-[#0A0F1C] border-[#36d1fe] text-white max-w-xs">
                  <p>
                    How should your brand communicate? &quot;Warm&quot; works
                    great for community bakeries
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={formData.brandVoice}
              onValueChange={value => handleInputChange('brandVoice', value)}
            >
              <SelectTrigger
                id="voice-select"
                className="bg-[#0A0F1C]/50 border-[#36d1fe]/40 text-white h-12 text-base rounded-lg"
              >
                <SelectValue placeholder="Select brand voice" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0F1C] border-[#36d1fe]">
                <SelectItem
                  value="warm"
                  className="text-white hover:bg-[#36d1fe]/20 focus:bg-[#36d1fe]/20"
                >
                  Warm
                </SelectItem>
                <SelectItem
                  value="bold"
                  className="text-white hover:bg-[#36d1fe]/20 focus:bg-[#36d1fe]/20"
                >
                  Bold
                </SelectItem>
                <SelectItem
                  value="optimistic"
                  className="text-white hover:bg-[#36d1fe]/20 focus:bg-[#36d1fe]/20"
                >
                  Optimistic
                </SelectItem>
                <SelectItem
                  value="professional"
                  className="text-white hover:bg-[#36d1fe]/20 focus:bg-[#36d1fe]/20"
                >
                  Professional
                </SelectItem>
                <SelectItem
                  value="playful"
                  className="text-white hover:bg-[#36d1fe]/20 focus:bg-[#36d1fe]/20"
                >
                  Playful
                </SelectItem>
                <SelectItem
                  value="inspirational"
                  className="text-white hover:bg-[#36d1fe]/20 focus:bg-[#36d1fe]/20"
                >
                  Inspirational
                </SelectItem>
                <SelectItem
                  value="custom"
                  className="text-white hover:bg-[#36d1fe]/20 focus:bg-[#36d1fe]/20"
                >
                  Custom
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Label
              htmlFor="location-input"
              className="text-white font-semibold text-base"
            >
              Location *
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle
                  className="w-5 h-5 text-[#36d1fe] cursor-help hover:text-[#00F0FF] transition-colors"
                  onClick={() => handleTooltipClick('location')}
                />
              </TooltipTrigger>
              <TooltipContent className="bg-[#0A0F1C] border-[#36d1fe] text-white max-w-xs">
                <p>
                  E.g., &quot;Denver, CO&quot; - Where your business operates or
                  will operate
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="location-input"
            value={formData.location}
            onChange={e => handleInputChange('location', e.target.value)}
            placeholder="e.g., Denver, CO"
            className="bg-[#0A0F1C]/50 border-[#36d1fe]/40 text-white placeholder:text-white/60 focus:border-[#36d1fe] focus:ring-2 focus:ring-[#36d1fe]/20 h-12 text-base rounded-lg"
            maxLength={100}
          />
          {errors.location && (
            <p className="text-red-400 text-sm mt-2">{errors.location}</p>
          )}
        </div>

        {/* Unique Value */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Label
              htmlFor="unique-value-input"
              className="text-white font-semibold text-base"
            >
              Unique Value Proposition *
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle
                  className="w-5 h-5 text-[#36d1fe] cursor-help hover:text-[#00F0FF] transition-colors"
                  onClick={() => handleTooltipClick('uniqueValue')}
                />
              </TooltipTrigger>
              <TooltipContent className="bg-[#0A0F1C] border-[#36d1fe] text-white max-w-xs">
                <p>
                  E.g., &quot;Organic, community-focused pastries with
                  locally-sourced ingredients&quot;
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            id="unique-value-input"
            value={formData.uniqueValue}
            onChange={e => handleInputChange('uniqueValue', e.target.value)}
            placeholder="e.g., Organic, community-focused pastries with locally-sourced ingredients"
            className="bg-[#0A0F1C]/50 border-[#36d1fe]/40 text-white placeholder:text-white/60 focus:border-[#36d1fe] focus:ring-2 focus:ring-[#36d1fe]/20 min-h-[100px] text-base rounded-lg resize-none"
            maxLength={200}
          />
          {errors.uniqueValue && (
            <p className="text-red-400 text-sm mt-2">{errors.uniqueValue}</p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default StepOneForm;
