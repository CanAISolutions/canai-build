import React from 'react';

export interface SampleMetricBadgeProps {
  label: string;
  value: string;
  emoji?: string;
  color?: string;
  'aria-label'?: string;
}

const SampleMetricBadge: React.FC<SampleMetricBadgeProps> = ({
  label,
  value,
  emoji,
  color = 'from-canai-primary to-canai-gradient-anchor',
  ...props
}) => (
  <span
    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold animate-fade-in text-sm bg-gradient-to-r ${color} shadow-lg text-white border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl`}
    {...props}
    tabIndex={0}
  >
    {emoji && <span className="text-base">{emoji}</span>}
    <span className="sr-only">{label}: </span>
    <span aria-hidden className="uppercase tracking-wide font-bold text-xs">
      {label}
    </span>
    <span className="ml-1 font-extrabold text-white">{value}</span>
  </span>
);

export default SampleMetricBadge;
