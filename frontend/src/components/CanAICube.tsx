import React from 'react';

interface CanAICubeProps {
  size?: number;
  className?: string;
}

const CanAICube: React.FC<CanAICubeProps> = ({ size = 80, className = '' }) => {
  const cubeStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  const faceStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  const transforms = {
    front: `rotateY(0deg) translateZ(${size / 2}px)`,
    back: `rotateY(180deg) translateZ(${size / 2}px)`,
    right: `rotateY(90deg) translateZ(${size / 2}px)`,
    left: `rotateY(-90deg) translateZ(${size / 2}px)`,
    top: `rotateX(90deg) translateZ(${size / 2}px)`,
    bottom: `rotateX(-90deg) translateZ(${size / 2}px)`,
  };

  return (
    <div className={`canai-cube ${className}`} style={cubeStyle}>
      <div
        className="canai-cube-face"
        style={{ ...faceStyle, transform: transforms.front }}
      />
      <div
        className="canai-cube-face"
        style={{ ...faceStyle, transform: transforms.back }}
      />
      <div
        className="canai-cube-face"
        style={{ ...faceStyle, transform: transforms.right }}
      />
      <div
        className="canai-cube-face"
        style={{ ...faceStyle, transform: transforms.left }}
      />
      <div
        className="canai-cube-face"
        style={{ ...faceStyle, transform: transforms.top }}
      />
      <div
        className="canai-cube-face"
        style={{ ...faceStyle, transform: transforms.bottom }}
      />
    </div>
  );
};

export default CanAICube;
