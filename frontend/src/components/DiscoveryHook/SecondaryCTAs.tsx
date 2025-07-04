import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Eye, DollarSign, Sparkles } from 'lucide-react';

type SecondaryCTAsProps = {
  onOpenPricing: () => void;
  onOpenPreview: () => void;
};

const SecondaryCTAs: React.FC<SecondaryCTAsProps> = ({
  onOpenPricing,
  onOpenPreview,
}) => {
  const navigate = useNavigate();

  return (
    <section
      className="flex justify-center w-full mt-6 mb-8 px-4 animate-fade-in"
      style={{ animationDelay: '1s' }}
    >
      <div className="max-w-4xl w-full">
        {/* Enhanced CTA Header */}
        <div className="text-center mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-manrope">
            Ready to Get Started?
          </h3>
          <p className="text-[#cce7fa] opacity-80">
            Explore options that work best for your journey
          </p>
        </div>

        {/* Enhanced CTA Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Pricing CTA */}
          <Button
            variant="outline"
            size="lg"
            onClick={onOpenPricing}
            aria-haspopup="dialog"
            aria-controls="pricing-modal"
            className="
              group w-full h-auto py-6 px-6 flex flex-col items-center gap-3
              border-2 border-[rgba(54,209,254,0.4)] bg-[rgba(54,209,254,0.08)]
              hover:bg-[rgba(54,209,254,0.15)] hover:border-[#36d1fe]
              text-[#E6F6FF] rounded-2xl transition-all duration-300
              hover:scale-105 hover:shadow-[0_0_30px_rgba(54,209,254,0.4)]
            "
          >
            <DollarSign className="w-6 h-6 text-[#36d1fe] group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <div className="font-bold text-lg mb-1">View Pricing</div>
              <div className="text-sm opacity-80">Transparent, fair rates</div>
            </div>
          </Button>

          {/* Samples CTA */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/samples')}
            className="
              group w-full h-auto py-6 px-6 flex flex-col items-center gap-3
              border-2 border-[rgba(54,209,254,0.4)] bg-[rgba(54,209,254,0.08)]
              hover:bg-[rgba(54,209,254,0.15)] hover:border-[#36d1fe]
              text-[#E6F6FF] rounded-2xl transition-all duration-300
              hover:scale-105 hover:shadow-[0_0_30px_rgba(54,209,254,0.4)]
            "
          >
            <Eye className="w-6 h-6 text-[#36d1fe] group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <div className="font-bold text-lg mb-1">See Samples</div>
              <div className="text-sm opacity-80">Real results showcase</div>
            </div>
          </Button>

          {/* Free Spark CTA - Most Prominent */}
          <Button
            variant="default"
            size="lg"
            className="
              group w-full h-auto py-6 px-6 flex flex-col items-center gap-3
              bg-gradient-to-r from-[#36d1fe] to-[#00b8e6]
              hover:from-[#4ae3ff] hover:to-[#36d1fe]
              text-[#0a1628] font-bold rounded-2xl
              shadow-[0_0_30px_rgba(54,209,254,0.5)]
              hover:shadow-[0_0_40px_rgba(54,209,254,0.7)]
              hover:scale-105 transition-all duration-300
              border-0
            "
            onClick={onOpenPreview}
            aria-haspopup="dialog"
          >
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <div className="text-center">
              <div className="font-bold text-lg mb-1">Spark for Free</div>
              <div className="text-sm opacity-90">Try before you buy</div>
            </div>
          </Button>
        </div>

        {/* Trust Signal */}
        <div className="text-center mt-6">
          <p className="text-[#cce7fa] text-sm opacity-70">
            🔒 Secure checkout • 💰 Money-back guarantee • ⚡ Instant delivery
          </p>
        </div>
      </div>
    </section>
  );
};

export default SecondaryCTAs;
