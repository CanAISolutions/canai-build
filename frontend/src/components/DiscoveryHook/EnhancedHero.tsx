import React, { useState, useEffect } from 'react';
import CanAILogo from '@/components/CanAILogo';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

const EnhancedHero = ({
  userName,
  onStart,
}: {
  userName?: string;
  onStart: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative flex flex-col items-center w-full pt-12 sm:pt-16 pb-8 sm:pb-12 z-10 px-4">
      {/* Pre-launch notice */}
      <div
        className={`
        mb-6 px-6 py-3 rounded-full
        bg-gradient-to-r from-yellow-500/20 to-orange-500/20
        border border-yellow-400/30 backdrop-blur-md
        transition-all duration-700 transform
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
      >
        <span className="text-sm font-medium text-yellow-300">
          🚧 CanAI is currently in private beta — join the waitlist below
        </span>
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
            Build Investor-Ready Plans with{' '}
            <span className="bg-gradient-to-r from-[#36d1fe] to-[#00b8e6] bg-clip-text text-transparent drop-shadow-none">
              CanAI (Beta)
            </span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl font-manrope text-[#E6F6FF] max-w-4xl mx-auto leading-relaxed opacity-95 mb-4">
            Transform your vision into investor-ready strategies that actually
            get funded.
          </p>

          {/* Short genuine tagline */}
          <p className="text-[#E6F6FF] opacity-90 font-manrope mb-6 max-w-3xl mx-auto">
            We're polishing the experience — sign up below to be among the first to try it.
          </p>
        </div>
      </div>

      {/* Enhanced CTA Section with urgency */}
      <div
        className={`
        flex flex-col items-center gap-6 transition-all duration-700 delay-500
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
      >
        {/* CTA context */}
        <div className="text-center mb-2 text-[#cce7fa] text-sm opacity-80">
          Private beta access — limited seats
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
      </div>
    </section>
  );
};

export default EnhancedHero;
