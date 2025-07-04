import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import CanAILogo from '@/components/CanAILogo';
import { BackgroundImage } from '@/components/ui/background-image';
import { BodyText, CaptionText } from '@/components/StandardTypography';
import { useAccessibility } from '@/hooks/useAccessibility';

const Index = () => {
  const navigate = useNavigate();
  const { setPageTitle, announce } = useAccessibility();

  useEffect(() => {
    setPageTitle('Welcome to CanAI');
    announce(
      'Welcome to the CanAI Emotional Sovereignty Platform. Navigate using tab key or screen reader.',
      'polite'
    );
  }, [setPageTitle, announce]);

  const handleEnterPlatform = () => {
    announce('Navigating to Discovery Hook page', 'polite');
    navigate('/discovery-hook');
  };

  return (
    <>
      {/* Skip to Content Link */}
      <a
        href="#main-content"
        className="skip-link"
        onFocus={() => announce('Skip to main content link focused', 'polite')}
      >
        Skip to main content
      </a>

      <BackgroundImage
        src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80&fm=webp"
        alt="Futuristic AI technology background with circuit patterns and digital elements representing CanAI's emotional sovereignty platform"
        className="min-h-screen flex flex-col items-center justify-center"
        overlay={true}
        overlayOpacity={0.8}
      >
        <main
          id="main-content"
          className="text-center space-y-6 sm:space-y-8 max-w-2xl mx-auto px-4 relative z-10"
          role="main"
          aria-label="CanAI Platform Welcome Page"
        >
          <header className="animate-fade-in animate-logo-breathe">
            <CanAILogo size="xl" />
          </header>

          <section
            className="space-y-4 animate-fade-in animate-delay-200"
            style={{ animationDelay: '0.2s' }}
            aria-labelledby="welcome-heading"
          >
            <h1
              id="welcome-heading"
              className="text-xl sm:text-2xl font-light text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.3)] animate-fade-in-up"
            >
              Welcome to the Emotional Sovereignty Platform
            </h1>
            <BodyText className="text-lg sm:text-xl opacity-90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)] animate-fade-in-up animate-delay-300">
              Experience the future of AI-driven business strategy, designed
              with emotional intelligence and empathy at its core.
            </BodyText>
          </section>

          <section
            className="animate-fade-in animate-delay-400"
            style={{ animationDelay: '0.4s' }}
            aria-label="Platform entry point"
          >
            <Button
              onClick={handleEnterPlatform}
              size="lg"
              variant="canai"
              className="
                text-lg px-8 py-4 group font-manrope transition-all duration-300 
                hover:scale-105 shadow-[0_0_30px_rgba(54,209,254,0.5)]
                hover:shadow-[0_0_45px_rgba(54,209,254,0.7)]
                hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-[#36d1fe]/60
                focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1C]
                active:scale-[0.98] active:translate-y-0
                min-h-[48px] min-w-[48px]
              "
              aria-label="Enter CanAI Platform - Start your AI-powered business journey"
              role="button"
            >
              Enter CanAI Platform
              <ArrowRight
                className="ml-2 group-hover:translate-x-1 transition-transform duration-200"
                size={20}
                aria-hidden="true"
              />
            </Button>
          </section>

          <footer
            className="pt-6 sm:pt-8 animate-fade-in animate-delay-600"
            style={{ animationDelay: '0.6s' }}
            aria-label="Platform features summary"
          >
            <CaptionText
              className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
              role="complementary"
            >
              🚀 9 Seamless Scenes • 🎯 Emotionally Intelligent • ✨ Zero Manual
              Touch
            </CaptionText>
          </footer>
        </main>

        {/* Hidden live region for screen reader announcements */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          id="announcements"
        ></div>
      </BackgroundImage>
    </>
  );
};

export default Index;
