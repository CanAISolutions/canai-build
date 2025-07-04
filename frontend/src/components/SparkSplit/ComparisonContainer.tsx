import React from 'react';
import { diffHighlight } from './utils';

type ComparisonContainerProps = {
  canai: string;
  generic: string;
};

const ComparisonContainer: React.FC<ComparisonContainerProps> = ({
  canai,
  generic,
}) => {
  return (
    <div className="flex flex-row gap-6 mt-4" id="comparison-container">
      {/* CanAI Output */}
      <div className="flex-1 p-5 rounded-xl bg-[#1E314F] shadow-lg border border-[#36d1fe66]">
        <div className="text-sm font-semibold text-canai-cyan mb-1">
          CanAI Output
        </div>
        <div
          className="text-base md:text-lg prose text-canai-light"
          style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}
        >
          {diffHighlight(canai || '', generic || '')}
        </div>
      </div>
      {/* Generic Output */}
      <div className="flex-1 p-5 rounded-xl bg-[#22335C] shadow-lg border border-[#36d1fe40]">
        <div className="text-sm font-semibold text-green-300 mb-1">
          Generic Output
        </div>
        <div
          className="text-base md:text-lg prose text-canai-light"
          style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}
        >
          {diffHighlight(generic || '', canai || '')}
        </div>
      </div>
    </div>
  );
};

export default ComparisonContainer;
