import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

const Confetti: React.FC<ConfettiProps> = ({ active, onComplete }) => {
  useEffect(() => {
    if (active) {
      // Fire confetti in bursts
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        zIndex: 9999,
      });
      setTimeout(() => {
        confetti({
          particleCount: 70,
          spread: 110,
          origin: { y: 0.4 },
          zIndex: 9999,
        });
      }, 300);
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 150,
          origin: { y: 0.7 },
          zIndex: 9999,
        });
        if (onComplete) onComplete();
      }, 700);
    }
  }, [active, onComplete]);

  return null; // purely visual
};

export default Confetti;
