import React from 'react';

type TrustDeltaStarsProps = {
  score: number;
};

const TrustDeltaStars: React.FC<TrustDeltaStarsProps> = ({ score }) => {
  const rounded = Math.round(score);
  return (
    <span
      id="trustdelta-score"
      className="inline-flex items-center gap-1 text-2xl font-bold text-yellow-400"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < rounded ? '★' : '☆'}</span>
      ))}
      <span className="ml-2 text-base font-medium text-canai-light">
        {score.toFixed(1)}/5.0
      </span>
    </span>
  );
};

export default TrustDeltaStars;
