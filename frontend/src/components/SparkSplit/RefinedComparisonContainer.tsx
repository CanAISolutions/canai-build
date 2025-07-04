import React from 'react';
import SparkleIcon from './SparkleIcon';

type RefinedComparisonContainerProps = {
  canaiOutput: string;
  genericOutput: string;
};

const RefinedComparisonContainer: React.FC<RefinedComparisonContainerProps> = ({
  canaiOutput,
  genericOutput,
}) => {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      id="comparison-container"
    >
      {/* CanAI Output */}
      <div className="flex flex-col h-full">
        <div
          className="
            bg-gradient-to-br from-[#173b5ccf] to-[#203251F6]
            rounded-2xl border-2 border-[#00CFFF] shadow-[0_4px_36px_#00b2e340]
            flex-1 flex flex-col min-h-[500px] overflow-hidden
            backdrop-blur-xl
            hover:shadow-[0_0_40px_#00CFFF88] hover:border-cyan-400 focus-within:border-cyan-400
            ring-canai-primary transition-all duration-300
          "
        >
          <div className="px-8 py-7 border-b border-[#36d1fe33] bg-gradient-to-r from-[#00CFFF]/15 to-transparent">
            <h3 className="flex items-center gap-2 font-playfair text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-[#00CFFF] to-[#00B2E3] bg-clip-text drop-shadow animate-glow-pop mb-1 select-none focus:ring-2 focus:ring-canai-primary">
              <SparkleIcon /> Personalized for Your Vision
            </h3>
            <p className="text-base font-medium text-[#E6F6FF] opacity-95 font-manrope tracking-wide">
              <span className="bg-[#001C2E44] px-2 py-0.5 rounded-lg">
                Made uniquely for you
              </span>
            </p>
          </div>
          <div className="p-8 flex-1 overflow-hidden">
            <div
              className="font-manrope text-lg md:text-[1.15rem] text-[#E6F6FF] h-full overflow-y-auto prose prose-invert max-w-none"
              style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                lineHeight: '1.75',
                textShadow: '0 1px 14px #193c6538',
              }}
            >
              {canaiOutput}
            </div>
          </div>
        </div>
      </div>

      {/* Generic Output */}
      <div className="flex flex-col h-full">
        <div className="bg-gradient-to-br from-[#283B5Dda] to-[#41546Aa5] rounded-2xl border-2 border-[#BBC6F3] shadow-[0_4px_40px_#253b4c2c] flex-1 flex flex-col min-h-[500px] overflow-hidden ring-2 ring-[#96B2D6]/30 focus-within:ring-cyan-300 transition-all duration-300 backdrop-blur-xl hover:border-cyan-200">
          <div className="px-8 py-7 border-b border-[#BBC6F3]/20 bg-gradient-to-r from-[#BBC6F3]/10 to-transparent">
            <h3 className="flex items-center gap-2 font-playfair text-2xl md:text-3xl font-bold text-[#C7D9FF] mb-1 select-none">
              <span
                role="img"
                aria-label="Robot"
                className="animate-glow-pop scale-95 mr-1"
              >
                🤖
              </span>
              Standard AI Response
            </h3>
            <p className="text-base font-medium text-[#E4EDFF] opacity-95 font-manrope tracking-wide">
              <span className="bg-[#2a3b6560] px-2 py-0.5 rounded-lg">
                What a generic AI might suggest
              </span>
            </p>
          </div>
          <div className="p-8 flex-1 overflow-hidden">
            <div
              className="font-manrope text-lg md:text-[1.15rem] text-[#ECF0F1] h-full overflow-y-auto prose prose-invert max-w-none"
              style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                lineHeight: '1.75',
                textShadow: '0 1px 14px #22335c24',
              }}
            >
              {genericOutput}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefinedComparisonContainer;
