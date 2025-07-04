import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type TrustDeltaDisplayProps = {
  delta: number;
  onTooltipView?: () => void;
};

const TrustDeltaDisplay: React.FC<TrustDeltaDisplayProps> = ({
  delta,
  onTooltipView,
}) => {
  const formatDelta = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}`;
  };

  return (
    <div className="flex flex-col items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="cursor-help focus:outline-none rounded-2xl transition-all duration-300 p-6 hover:scale-105 focus-visible:ring-4 focus-visible:ring-canai-primary ring-canai-primary"
            onClick={onTooltipView}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTooltipView?.();
              }
            }}
            tabIndex={0}
            role="button"
            aria-describedby="trust-delta-tooltip"
          >
            <div className="text-center flex flex-col items-center">
              <div className="text-lg font-playfair font-semibold text-canai-light mb-3 opacity-95 tracking-wide">
                Trust Delta
              </div>
              <div
                className={`
                bg-gradient-to-br from-[#0b3861]/70 to-[#00CFFF]/20
                border-2 rounded-2xl px-10 py-8 shadow-[0_0_48px_#00CFFF44]
                animate-glow-pop transition-all duration-300
                ring-canai-primary border-canai-primary
              `}
              >
                <div
                  className={`text-5xl md:text-6xl font-playfair font-extrabold bg-gradient-to-r from-[#00CFFF] to-[#00B2E3] text-transparent bg-clip-text drop-shadow mt-1 animate-countup-glow`}
                >
                  {formatDelta(delta)}
                </div>
              </div>
              <div className="text-sm text-[#E6F6FF] mt-4 opacity-70">
                out of 5.0
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          id="trust-delta-tooltip"
          className="max-w-md text-center bg-[#193c65ec] border border-[#36d1fe99] text-[#E6F6FF] p-5 rounded-xl shadow-strong"
        >
          <p className="font-bold mb-2 text-[#00CFFF] text-base">
            Trust Delta Score
          </p>
          <p className="text-sm leading-relaxed">
            Measures how well CanAI&apos;s output aligns with{' '}
            <span className="font-semibold">your</span> vision versus generic
            alternatives.
            <br />
            <span className="block mt-2">
              Tone (50%), emotional impact (30%), and cultural specificity (20%)
            </span>
          </p>
          <p className="text-xs mt-3 opacity-80">
            Higher = more personalized, magnetic output
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
export default TrustDeltaDisplay;
