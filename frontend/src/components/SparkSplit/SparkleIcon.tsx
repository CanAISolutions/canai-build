import { Sparkle } from 'lucide-react';
import React from 'react';

/**
 * A glowing Sparkle icon for decorative headings.
 */
const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Sparkle
    className={`inline-block mr-2 animate-glow-pop text-[#00CFFF] drop-shadow-[0_0_10px_#00CFFF77] ${
      className || ''
    }`}
    size={26}
    strokeWidth={2.4}
    aria-hidden="true"
  />
);

export default SparkleIcon;
