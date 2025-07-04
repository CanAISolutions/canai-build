import React from 'react';

interface StandardBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const StandardBackground: React.FC<StandardBackgroundProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`min-h-screen w-full flex flex-col ${className}`}
      style={{
        background:
          'radial-gradient(ellipse at 55% 24%, #152647 0%, #091023 65%, #052947 100%)',
        backgroundColor: '#0A1535',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle starfield overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
        style={{ zIndex: 0 }}
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="spotlight" cx="55%" cy="25%" r="0.7">
            <stop offset="0%" stopColor="#36d1fe22" />
            <stop offset="70%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#spotlight)" />
        <g>
          <circle cx="220" cy="180" r="1.2" fill="#e6f6ff" opacity="0.08" />
          <circle cx="430" cy="400" r="1.6" fill="#36d1fe" opacity="0.11" />
          <circle cx="1520" cy="250" r="1" fill="#e6f6ff" opacity="0.08" />
          <circle cx="770" cy="850" r="0.7" fill="#00f0ff" opacity="0.09" />
          <circle cx="1430" cy="960" r="1.4" fill="#e6f6ff" opacity="0.07" />
          <circle cx="1190" cy="780" r="1.1" fill="#36d1fe" opacity="0.13" />
        </g>
      </svg>

      {/* Content with proper z-index */}
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        {children}
      </div>
    </div>
  );
};

export default StandardBackground;
