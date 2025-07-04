import React from 'react';

interface CanAILogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

const sizeMap = {
  sm: {
    fontSize: 'clamp(1.4rem, 3vw, 2.5rem)',
    tagline: 'clamp(0.7rem, 1.5vw, 1rem)',
  },
  md: {
    fontSize: 'clamp(2.5rem, 5vw, 3.7rem)',
    tagline: 'clamp(1rem, 2vw, 1.25rem)',
  },
  lg: {
    fontSize: 'clamp(3.6rem, 7vw, 5.5rem)',
    tagline: 'clamp(1.2rem, 3vw, 1.65rem)',
  },
  xl: {
    fontSize: 'clamp(4.5rem, 9vw, 7rem)',
    tagline: 'clamp(1.3rem, 3.5vw, 2rem)',
  },
};

const CanAILogo: React.FC<CanAILogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  const fontSize = sizeMap[size].fontSize;
  const taglineSize = sizeMap[size].tagline;

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <h1
        id="hero-logo"
        style={{
          fontFamily: "Manrope, 'Inter', Helvetica Neue, sans-serif",
          fontWeight: 800,
          fontSize: fontSize,
          letterSpacing: '0.05em',
          lineHeight: 1.06,
          color: '#fff',
          textShadow: '0 0 5px rgba(54, 209, 254, 0.8)',
          marginBottom: '0px',
          display: 'flex',
        }}
        className="select-none"
      >
        <span style={{ color: '#fff' }}>CanAI</span>
        <span
          style={{
            background: 'linear-gradient(to right, #36d1fe, #07c3fb)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            marginLeft: '.09em',
            fontWeight: 800,
            filter: 'drop-shadow(0 0 10px #36d1fe88)',
            display: 'inline-block',
          }}
        >
          .so
        </span>
      </h1>
      {showTagline && (
        <p
          id="hero-tagline"
          style={{
            fontFamily: "Manrope, 'Inter', Helvetica Neue, sans-serif",
            fontWeight: 200,
            textTransform: 'uppercase',
            fontSize: taglineSize,
            letterSpacing: '0.18em',
            color: '#E6F6FF',
            opacity: 0.9,
            marginTop: '-10px',
          }}
        >
          EMPOWERMENT THROUGH EASE
        </p>
      )}
    </div>
  );
};

export default CanAILogo;
