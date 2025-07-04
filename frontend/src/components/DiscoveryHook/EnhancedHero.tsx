import React, { useState, useEffect } from 'react';
import CanAILogo from '@/components/CanAILogo';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, TrendingUp, Shield } from 'lucide-react';

const EnhancedHero = ({
  userName,
  onStart,
}: {
  userName?: string;
  onStart: () => void;
}) => {
  const [currentCount, setCurrentCount] = useState(472);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Simulate live counter for social proof
    const interval = setInterval(() => {
      setCurrentCount(prev => prev + Math.floor(Math.random() * 2));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex flex-col items-center w-full pt-12 sm:pt-16 pb-8 sm:pb-12 z-10 px-4">
      {/* Social Proof Banner */}
      <div
        className={`
        mb-6 px-6 py-3 rounded-full 
        bg-gradient-to-r from-emerald-500/20 to-blue-500/20 
        border border-emerald-400/30 backdrop-blur-md
        transition-all duration-700 transform
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <Users size={16} />
          </div>
          <span className="transition-all duration-300">
            <span className="font-bold">{currentCount}</span> founders created
            plans this week
          </span>
        </div>
      </div>

      {/* Logo with enhanced positioning */}
      <div
        className={`
        mb-8 flex flex-col items-center transition-all duration-700 delay-200
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
      >
        <CanAILogo size="xl" showTagline />
      </div>

      {/* Main heading with improved hierarchy */}
      <div className="flex flex-col items-center gap-4 mb-8 max-w-5xl mx-auto text-center">
        {userName && (
          <div
            className={`
            transition-all duration-700 delay-300
            ${
              isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }
          `}
          >
            <h1 className="font-playfair font-bold text-2xl sm:text-3xl lg:text-4xl text-white mb-2 tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
              <span className="text-[#E6F6FF] opacity-90">Welcome back,</span>{' '}
              <span className="bg-gradient-to-r from-[#36d1fe] to-[#00b8e6] bg-clip-text text-transparent font-extrabold drop-shadow-none">
                {userName}!
              </span>
            </h1>
          </div>
        )}

        <div
          className={`
          transition-all duration-700 delay-400
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white font-playfair tracking-tight mb-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
            Get Funded Faster with{' '}
            <span className="bg-gradient-to-r from-[#36d1fe] to-[#00b8e6] bg-clip-text text-transparent drop-shadow-none relative">
              AI-Crafted Plans
              <div className="absolute -top-1 -right-6 text-xs bg-gradient-to-r from-orange-400 to-red-500 text-white px-2 py-1 rounded-full font-bold animate-pulse">
                HOT
              </div>
            </span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl font-manrope text-[#E6F6FF] max-w-4xl mx-auto leading-relaxed opacity-95 mb-4">
            Transform your vision into investor-ready strategies that actually
            get funded.
          </p>

          {/* Value proposition with anchoring */}
          <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
            <div className="flex items-center gap-2 text-emerald-300">
              <TrendingUp size={16} />
              <span>78% funding success rate</span>
            </div>
            <div className="flex items-center gap-2 text-blue-300">
              <Shield size={16} />
              <span>Risk-free guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-purple-300">
              <Sparkles size={16} />
              <span>2-minute setup</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section with urgency */}
      <div
        className={`
        flex flex-col items-center gap-6 transition-all duration-700 delay-500
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
      >
        {/* Urgency indicator */}
        <div className="text-center mb-2">
          <div className="text-amber-300 text-sm font-medium mb-1">
            ⚡ Limited Time: 48-hour delivery guarantee
          </div>
          <div className="text-[#cce7fa] text-xs opacity-80">
            Join founders who raised $12M+ this month
          </div>
        </div>

        <Button
          id="begin-btn"
          size="lg"
          variant="canai"
          onClick={onStart}
          className="
            group px-16 sm:px-20 py-6 text-xl font-bold
            relative overflow-hidden
            shadow-[0_0_40px_rgba(54,209,254,0.6)]
            hover:shadow-[0_0_60px_rgba(54,209,254,0.8)] 
            transition-all duration-300 font-manrope
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#36d1fe]/50
            hover:scale-105 active:scale-100
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
            before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700
          "
          aria-label="Start your journey with CanAI"
        >
          <Sparkles
            className="mr-3 group-hover:rotate-12 transition-transform"
            size={24}
          />
          Start Building Now
          <ArrowRight
            className="ml-3 group-hover:translate-x-1 transition-transform"
            size={24}
          />
        </Button>

        {/* Risk reversal */}
        <div className="text-center text-sm text-[#cce7fa] opacity-90 max-w-md">
          <div className="mb-2">
            ✅ No credit card required • ✅ Money-back guarantee
          </div>
          <div className="text-xs opacity-70">
            Free spark preview • Instant download • 24/7 support
          </div>
        </div>

        {/* Social proof trust indicator */}
        <div className="flex items-center gap-2 text-[#cce7fa] text-sm opacity-90 mt-4">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className="text-yellow-400 drop-shadow-sm animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                ★
              </span>
            ))}
          </div>
          <span className="font-manrope">4.9/5 from 500+ funded founders</span>
        </div>
      </div>
    </section>
  );
};

export default EnhancedHero;
