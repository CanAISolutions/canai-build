import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Eye, DollarSign } from 'lucide-react';

type CTAButtonsProps = {
  onOpenPricing: () => void;
  onOpenPreview: () => void;
};

const CTAButtons: React.FC<CTAButtonsProps> = ({
  onOpenPricing,
  onOpenPreview,
}) => {
  const navigate = useNavigate();

  return (
    <section className="w-full flex flex-col items-center gap-6 my-8 px-4">
      {/* Primary CTA */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button
          variant="canai"
          size="lg"
          className="
            w-full group font-bold text-lg py-6
            bg-gradient-to-r from-[#36d1fe] to-[#00b8e6]
            hover:from-[#4ae3ff] hover:to-[#36d1fe]
            shadow-[0_0_30px_rgba(54,209,254,0.5)]
            hover:shadow-[0_0_40px_rgba(54,209,254,0.7)]
            hover:scale-105 transition-all duration-300
            animate-fade-in
          "
          onClick={() => navigate('/discovery-funnel')}
          aria-label="Start your CanAI journey"
        >
          <Sparkles
            className="mr-2 group-hover:rotate-12 transition-transform"
            size={20}
          />
          Get Started Now
          <ArrowRight
            className="ml-2 group-hover:translate-x-1 transition-transform"
            size={20}
          />
        </Button>
      </div>

      {/* Secondary CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
        <Button
          variant="outline"
          size="lg"
          className="
            flex-1 border-[#36d1fe] text-[#E6F6FF] 
            hover:bg-[rgba(54,209,254,0.1)] hover:border-[#36d1fe] 
            focus-visible:ring-4 focus-visible:ring-[#36d1fe]/50 
            transition-all duration-200 py-4
          "
          onClick={onOpenPricing}
          aria-haspopup="dialog"
          aria-controls="pricing-modal"
        >
          <DollarSign size={18} className="mr-2" />
          Pricing
        </Button>

        <Button
          variant="ghost"
          size="lg"
          className="
            flex-1 text-[#36d1fe] hover:bg-[rgba(54,209,254,0.1)] 
            focus-visible:ring-4 focus-visible:ring-[#36d1fe]/50 
            transition-all duration-200 py-4
          "
          onClick={() => navigate('/samples')}
        >
          <Eye size={18} className="mr-2" />
          Samples
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="
            flex-1 border-[#36d1fe] text-[#36d1fe] 
            hover:bg-[rgba(54,209,254,0.1)] hover:border-[#36d1fe]
            focus-visible:ring-4 focus-visible:ring-[#36d1fe]/50 
            transition-all duration-200 py-4
          "
          onClick={onOpenPreview}
          aria-haspopup="dialog"
        >
          <Sparkles size={18} className="mr-2" />
          Try Free
        </Button>
      </div>
    </section>
  );
};

export default CTAButtons;
