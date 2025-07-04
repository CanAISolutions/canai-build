import { Button } from '@/components/ui/button';
import React from 'react';
import { useNavigate } from 'react-router-dom';

type FollowupProps = {
  show: boolean;
  rating: number;
  prompt_id: string;
};

export const Followup: React.FC<FollowupProps> = ({
  show,
  rating,
  prompt_id,
}) => {
  const navigate = useNavigate();

  if (!show) return null;
  return (
    <div
      className="bg-[#112542F5] p-4 mt-5 rounded-xl shadow"
      aria-live="polite"
    >
      <div id="followup-text" className="font-semibold text-canai-cyan mb-2">
        Thank you for your feedback 🙏
      </div>
      <div id="tips-text" className="text-canai-light mb-1">
        Top tip: Share your SparkSplit with another founder for extra rewards!
      </div>
      <Button
        variant="canai"
        className="mb-2"
        onClick={() => {
          window.posthog?.capture('upsell_clicked', { prompt_id });
          navigate('/social-email');
        }}
      >
        Try Our Social & Email Plan
      </Button>
      {rating < 3 && (
        <div id="poor-followup" className="text-sm text-red-300 mt-2">
          Sorry your SparkSplit didn&apos;t land! We&apos;ll reach out to make
          it right.
        </div>
      )}
    </div>
  );
};
