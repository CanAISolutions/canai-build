import React from 'react';

type EmotionalResonanceDisplayProps = {
  emoRes: {
    canaiScore: number;
    genericScore: number;
    delta: number;
    arousal: number;
    valence: number;
  } | null;
};

const EmotionalResonanceDisplay: React.FC<EmotionalResonanceDisplayProps> = ({
  emoRes,
}) => {
  return (
    <div className="mt-5 mb-3 text-sm">
      <span className="font-semibold mr-2">Emotional Resonance:</span>
      <span
        className={
          emoRes?.canaiScore > 0.7 ? 'text-green-400' : 'text-yellow-400'
        }
      >
        CanAI {Math.round((emoRes?.canaiScore ?? 0) * 100)}%
      </span>
      <span className="mx-2 text-gray-400">•</span>
      <span
        className={
          emoRes?.genericScore > 0.7 ? 'text-green-400' : 'text-yellow-400'
        }
      >
        Generic {Math.round((emoRes?.genericScore ?? 0) * 100)}%
      </span>
      <span className="ml-4 text-xs text-canai-light-softer">
        (Arousal: {emoRes?.arousal}, Valence: {emoRes?.valence}, Δ:{' '}
        {emoRes?.delta})
      </span>
    </div>
  );
};

export default EmotionalResonanceDisplay;
