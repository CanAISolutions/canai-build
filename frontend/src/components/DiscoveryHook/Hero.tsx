import React from 'react';
import CanAILogo from '@/components/CanAILogo';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = ({
  userName,
  onStart,
}: {
  userName?: string;
  onStart: () => void;
}) => {
  return (
    <section className="relative flex flex-col items-center w-full pt-12 sm:pt-16 pb-8 sm:pb-12 z-10 px-4">
      {/* Logo with enhanced positioning */}
      <div className="mb-8 flex flex-col items-center animate-fade-in">
        <CanAILogo size="xl" showTagline />
      </div>

      {/* Main heading with improved hierarchy */}
      <div className="flex flex-col items-center gap-3 mb-8 max-w-5xl mx-auto text-center">
        {userName && (
          <div className="animate-fade-in">
            <h1 className="font-playfair font-bold text-2xl sm:text-3xl lg:text-4xl text-white mb-2 tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
              <span className="text-[#E6F6FF] opacity-90">Welcome back,</span>{' '}
              <span className="bg-gradient-to-r from-[#36d1fe] to-[#00b8e6] bg-clip-text text-transparent font-extrabold drop-shadow-none">
                {userName}!
              </span>
            </h1>
          </div>
        )}

        <div
          className="animate-fade-in"
          style={{ animationDelay: userName ? '0.2s' : '0s' }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white font-playfair tracking-tight mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
            Elevate Your Essence with{' '}
            <span className="bg-gradient-to-r from-[#36d1fe] to-[#00b8e6] bg-clip-text text-transparent drop-shadow-none">
              AI-Crafted Solutions
            </span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl font-manrope text-[#E6F6FF] max-w-4xl mx-auto leading-relaxed opacity-95">
            Transform your vision into reality with emotionally intelligent
            strategies that truly resonate.
          </p>
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <div
        className="flex flex-col items-center gap-6 animate-fade-in"
        style={{ animationDelay: '0.4s' }}
      >
        <Button
          id="begin-btn"
          size="lg"
          variant="canai"
          onClick={onStart}
          className="
            px-12 sm:px-16 py-6 text-xl font-bold
            shadow-[0_0_40px_rgba(54,209,254,0.6)]
            hover:shadow-[0_0_60px_rgba(54,209,254,0.8)] 
            transition-all duration-300 group font-manrope
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#36d1fe]/50
          "
          aria-label="Start your journey with CanAI"
        >
          <Sparkles
            className="mr-3 group-hover:rotate-12 transition-transform"
            size={24}
          />
          Start Your Journey
          <ArrowRight
            className="ml-3 group-hover:translate-x-1 transition-transform"
            size={24}
          />
        </Button>

        {/* Trust indicator below CTA */}
        <div className="flex items-center gap-2 text-[#cce7fa] text-sm opacity-90">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-400 drop-shadow-sm">
                ★
              </span>
            ))}
          </div>
          <span className="font-manrope">Trusted by 500+ founders</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
