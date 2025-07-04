import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import StandardCard from './StandardCard';

export interface PricingCardProps {
  product: string;
  price: string;
  title: string;
  features: string[];
  description: string;
  cta?: string;
  highlighted?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  product,
  price,
  title,
  features,
  description,
  cta = 'Get Started',
  highlighted = false,
}) => {
  const cardId = `pricing-card-${product.toLowerCase().replace(/\s+/g, '-')}`;
  const featuresId = `${cardId}-features`;
  const descriptionId = `${cardId}-description`;

  return (
    <StandardCard
      variant="product"
      padding="xl"
      className={cn(
        'relative flex flex-col items-center text-center min-h-[500px]',
        highlighted &&
          'ring-4 ring-[#36d1fe]/50 shadow-[0_0_50px_rgba(54,209,254,0.4)]'
      )}
      role="article"
      aria-labelledby={`${cardId}-title`}
      aria-describedby={`${featuresId} ${descriptionId}`}
    >
      {highlighted && (
        <div
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
          role="banner"
          aria-label="Most popular plan indicator"
        >
          <span className="bg-gradient-to-r from-[#36d1fe] to-[#00b8e6] px-6 py-2 rounded-full text-sm font-bold text-white shadow-lg border border-white/20">
            Most Popular
          </span>
        </div>
      )}

      <div className="flex flex-col items-center justify-between h-full w-full">
        <header className="text-center">
          <h3
            className="text-[#36d1fe] text-lg font-bold font-playfair uppercase tracking-wider mb-3 drop-shadow-lg"
            aria-label={`${product} plan`}
          >
            {product}
          </h3>
          <div
            className="text-5xl font-extrabold text-white mb-3 drop-shadow-lg font-playfair"
            aria-label={`Price: ${price}`}
          >
            {price}
          </div>
          <div
            id={`${cardId}-title`}
            className="text-xl text-white font-semibold mb-8 font-manrope opacity-95"
          >
            {title}
          </div>
        </header>

        <div className="flex-1 w-full">
          <ul
            id={featuresId}
            className="mb-8 space-y-4 w-full text-left"
            role="list"
            aria-label={`Features included in ${product} plan`}
          >
            {features.map((feature, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[#E6F6FF] text-base font-manrope"
                role="listitem"
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full bg-[#36d1fe] shadow-[0_0_8px_#36d1fe] mt-2 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>

          <p
            id={descriptionId}
            className="mb-8 text-[#cce7fa] text-center font-manrope leading-relaxed opacity-90"
            aria-label={`Plan description: ${description}`}
          >
            {description}
          </p>
        </div>

        <Button
          variant="canai"
          className="w-full max-w-xs font-bold font-manrope text-lg py-6 shadow-[0_0_20px_rgba(54,209,254,0.4)] hover:shadow-[0_0_30px_rgba(54,209,254,0.6)] min-h-[48px] min-w-[48px]"
          aria-label={`${cta} for ${product} plan at ${price}`}
          role="button"
        >
          {cta}
        </Button>
      </div>
    </StandardCard>
  );
};

export default PricingCard;
