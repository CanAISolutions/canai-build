import { Clock, DollarSign, Eye, Sparkles, Star } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type EnhancedSecondaryCTAsProps = {
  onOpenPricing: () => void;
  onOpenPreview: () => void;
};

const EnhancedSecondaryCTAs: React.FC<EnhancedSecondaryCTAsProps> = ({
  onOpenPricing,
  onOpenPreview,
}) => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section
      className="flex justify-center w-full mt-8 mb-8 px-4 animate-fade-in"
      style={{ animationDelay: '1s' }}
    >
      <div className="max-w-4xl w-full">
        {/* Enhanced CTA Header with urgency */}
        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-playfair">
            Choose Your Path to Success
          </h3>
          <p className="text-[#cce7fa] opacity-90 mb-4 font-manrope">
            Join 500+ founders who&apos;ve already raised funding with CanAI
          </p>
          <div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20
                         text-amber-300 px-4 py-2 rounded-full text-sm border border-amber-400/30"
          >
            <Clock size={16} />
            <span>Limited time: 48-hour delivery guarantee</span>
          </div>
        </div>

        {/* Enhanced CTA Grid with psychological triggers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Pricing CTA - Authority */}
          <div
            className={`
              group relative overflow-hidden rounded-2xl transition-all duration-300
              bg-gradient-to-br from-[#193c65]/80 to-[#1e4a73]/80 backdrop-blur-md
              border-2 ${
                hoveredCard === 'pricing'
                  ? 'border-[#36d1fe]'
                  : 'border-[rgba(54,209,254,0.4)]'
              }
              hover:scale-105 hover:shadow-[0_0_40px_rgba(54,209,254,0.4)]
              cursor-pointer
            `}
            onMouseEnter={() => setHoveredCard('pricing')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={onOpenPricing}
          >
            <div className="p-6 text-center">
              <div className="mb-4 relative">
                <DollarSign
                  className={`w-8 h-8 text-[#36d1fe] mx-auto transition-transform duration-300
                                       ${
                                         hoveredCard === 'pricing'
                                           ? 'scale-110 rotate-12'
                                           : ''
                                       }`}
                />
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Popular
                </div>
              </div>
              <div className="font-bold text-xl mb-2 text-white font-playfair">
                View Pricing
              </div>
              <div className="text-sm text-[#E6F6FF] opacity-80 mb-4 font-manrope">
                Transparent rates, no hidden fees
              </div>
              <div className="text-xs text-[#36d1fe] font-semibold">
                Starting at $49 • Money-back guarantee
              </div>
            </div>
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
                           translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"
            />
          </div>

          {/* Samples CTA - Social Proof */}
          <div
            className={`
              group relative overflow-hidden rounded-2xl transition-all duration-300
              bg-gradient-to-br from-[#193c65]/80 to-[#1e4a73]/80 backdrop-blur-md
              border-2 ${
                hoveredCard === 'samples'
                  ? 'border-[#36d1fe]'
                  : 'border-[rgba(54,209,254,0.4)]'
              }
              hover:scale-105 hover:shadow-[0_0_40px_rgba(54,209,254,0.4)]
              cursor-pointer
            `}
            onMouseEnter={() => setHoveredCard('samples')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate('/samples')}
          >
            <div className="p-6 text-center">
              <div className="mb-4 relative">
                <Eye
                  className={`w-8 h-8 text-[#36d1fe] mx-auto transition-transform duration-300
                                ${
                                  hoveredCard === 'samples' ? 'scale-110' : ''
                                }`}
                />
                <div className="absolute -top-1 -right-3 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </div>
              <div className="font-bold text-xl mb-2 text-white font-playfair">
                See Examples
              </div>
              <div className="text-sm text-[#E6F6FF] opacity-80 mb-4 font-manrope">
                Real plans that raised millions
              </div>
              <div className="text-xs text-[#36d1fe] font-semibold">
                $50M+ raised by users • Proven results
              </div>
            </div>
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
                           translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"
            />
          </div>

          {/* Free Spark CTA - FOMO + Risk Reversal */}
          <div
            className={`
              group relative overflow-hidden rounded-2xl transition-all duration-300
              bg-gradient-to-r from-[#36d1fe] to-[#00b8e6]
              hover:from-[#4ae3ff] hover:to-[#36d1fe]
              shadow-[0_0_30px_rgba(54,209,254,0.5)]
              hover:shadow-[0_0_40px_rgba(54,209,254,0.7)]
              hover:scale-105 border-0 cursor-pointer
            `}
            onMouseEnter={() => setHoveredCard('preview')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={onOpenPreview}
          >
            <div className="p-6 text-center relative z-10">
              <div className="mb-4 relative">
                <Sparkles
                  className={`w-8 h-8 text-[#0a1628] mx-auto transition-transform duration-300
                                     ${
                                       hoveredCard === 'preview'
                                         ? 'scale-110 rotate-12'
                                         : ''
                                     }`}
                />
                <div className="absolute -top-2 -right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  FREE
                </div>
              </div>
              <div className="font-bold text-xl mb-2 text-[#0a1628] font-playfair">
                Try Free Spark
              </div>
              <div className="text-sm text-[#0a1628] opacity-90 mb-4 font-manrope">
                No risk preview of your personalized plan
              </div>
              <div className="text-xs text-[#0a1628] font-semibold">
                100% Free • No signup required • Instant
              </div>
            </div>
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                           translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"
            />
          </div>
        </div>

        {/* Enhanced Trust Signal with social proof */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-4 text-[#cce7fa] text-sm opacity-70 mb-4">
            <span>🔒 Secure checkout</span>
            <span>💰 Money-back guarantee</span>
            <span>⚡ Instant delivery</span>
          </div>
          <div className="text-xs text-[#cce7fa] opacity-60">
            Trusted by 500+ founders • Featured in TechCrunch, Forbes • SOC 2
            Compliant
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedSecondaryCTAs;
