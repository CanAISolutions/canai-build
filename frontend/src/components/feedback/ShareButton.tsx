import React from 'react';
import { Button } from '@/components/ui/button';

export const ShareButton = ({
  icon,
  label,
  id,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  id: string;
  onClick: () => void;
}) => (
  <Button
    variant="outline"
    className="
      bg-[rgba(255,255,255,0.05)] 
      border-2 border-[rgba(54,209,254,0.3)] 
      text-white 
      hover:bg-[rgba(54,209,254,0.1)] 
      hover:border-[#36d1fe] 
      hover:scale-105 
      transition-all 
      duration-300
      px-4 py-2.5 
      rounded-xl
      font-medium
      shadow-[0_0_10px_rgba(54,209,254,0.2)]
    "
    id={id}
    type="button"
    onClick={onClick}
    aria-label={label}
  >
    <span className="flex items-center gap-2">
      {icon}
      <span className="font-manrope">{label}</span>
    </span>
  </Button>
);
