import React, { useEffect, useState } from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';
import StandardCard from '@/components/StandardCard';
import { SectionTitle, BodyText } from '@/components/StandardTypography';

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  show,
  onComplete,
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (show) {
      // Phase 1: Fade in check
      setTimeout(() => setAnimationPhase(1), 100);
      // Phase 2: Scale in card
      setTimeout(() => setAnimationPhase(2), 600);
      // Phase 3: Show sparkles
      setTimeout(() => setAnimationPhase(3), 1000);
      // Complete
      setTimeout(() => {
        onComplete?.();
      }, 2500);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative">
        {/* Success Check Icon */}
        <div
          className={`
          flex items-center justify-center mb-6 transition-all duration-500
          ${
            animationPhase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }
        `}
        >
          <CheckCircle
            className="w-24 h-24 text-green-400 animate-[scale-in_0.5s_ease-out]"
            fill="currentColor"
          />
        </div>

        {/* Success Card */}
        <StandardCard
          variant="form"
          padding="xl"
          className={`
            max-w-md text-center transition-all duration-500
            ${
              animationPhase >= 2
                ? 'scale-100 opacity-100 translate-y-0'
                : 'scale-90 opacity-0 translate-y-4'
            }
          `}
        >
          <SectionTitle className="text-white mb-4">
            Feedback Received!
          </SectionTitle>

          <BodyText className="mb-6">
            Thank you for helping us improve CanAI. Your insights make a
            difference.
          </BodyText>

          {/* Sparkles Animation */}
          {animationPhase >= 3 && (
            <div className="absolute -top-2 -left-2 animate-fade-in">
              <Sparkles className="w-6 h-6 text-[#36d1fe] animate-pulse" />
            </div>
          )}
          {animationPhase >= 3 && (
            <div
              className="absolute -bottom-2 -right-2 animate-fade-in"
              style={{ animationDelay: '200ms' }}
            >
              <Sparkles className="w-4 h-4 text-[#00f0ff] animate-pulse" />
            </div>
          )}
        </StandardCard>
      </div>
    </div>
  );
};

export default SuccessAnimation;
