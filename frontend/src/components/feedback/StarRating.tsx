import React from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({
  rating,
  setRating,
  id = 'rating-input',
}: {
  rating: number;
  setRating: (n: number) => void;
  id?: string;
}) => (
  <div id={id} className="flex items-center gap-2">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        type="button"
        key={star}
        onClick={() => setRating(star)}
        className={`
          p-2 
          rounded-lg 
          transition-all 
          duration-200 
          hover:scale-110 
          focus-visible:ring-2 
          focus-visible:ring-[#36d1fe] 
          focus-visible:ring-opacity-50
          ${star <= rating ? 'text-[#fbbf24]' : 'text-[rgba(255,255,255,0.3)]'}
        `}
        aria-label={`${star} Star`}
        tabIndex={0}
      >
        <Star
          fill={star <= rating ? '#fbbf24' : 'none'}
          className="w-8 h-8 drop-shadow-lg"
          strokeWidth={2}
        />
      </button>
    ))}
  </div>
);
