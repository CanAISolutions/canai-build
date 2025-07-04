import React from 'react';
import { ArrowRight, FileText, MessageSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import StandardCard from './StandardCard';
import { SectionTitle, BodyText } from './StandardTypography';
import {
  trackProductClick,
  trackFunnelStep,
  logInteraction,
} from '@/utils/analytics';

const products = [
  {
    id: 'BUSINESS_BUILDER',
    title: 'Business Plan',
    description:
      'Investor-ready strategy in 700–800 words. Confidently attract funding with clear, compelling plans.',
    icon: FileText,
    href: '/business-builder',
  },
  {
    id: 'SOCIAL_EMAIL',
    title: 'Social Launch Kit',
    description:
      'Get 3–7 branded posts and 3–5 high-converting emails. Kickstart your social campaigns painlessly.',
    icon: MessageSquare,
    href: '/social-email',
  },
  {
    id: 'SITE_AUDIT',
    title: 'Website Audit',
    description:
      'Actionable 300–400 word analysis + next steps. Instantly boost your web presence.',
    icon: Search,
    href: '/site-audit',
  },
];

const ProductCards = () => {
  const navigate = useNavigate();

  const handleProductClick = async (product: (typeof products)[0]) => {
    // Track analytics
    trackProductClick(product.id, product.title);
    trackFunnelStep('product_selected', {
      product_id: product.id,
      product_name: product.title,
    });

    // Log interaction
    await logInteraction({
      interaction_type: 'product_card_clicked',
      interaction_details: {
        product_id: product.id,
        product_name: product.title,
        href: product.href,
        timestamp: new Date().toISOString(),
      },
    });

    navigate(product.href);
  };

  return (
    <section
      id="product-cards"
      className="py-12 sm:py-16 container mx-auto px-4"
    >
      <div className="text-center mb-12 sm:mb-14">
        <SectionTitle className="mb-4 animate-fade-in">
          Tailored Solutions For Every Vision
        </SectionTitle>
        <BodyText
          className="text-lg md:text-xl max-w-2xl mx-auto animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          Choose your spark – each product delivers expert results, instantly.
        </BodyText>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {products.map((product, index) => {
          const IconComponent = product.icon;
          return (
            <button
              key={product.id}
              id={`product-card-${product.id.toLowerCase()}`}
              onClick={() => handleProductClick(product)}
              className="group w-full focus:outline-none animate-fade-in"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              aria-label={`View details for ${product.title}`}
            >
              <StandardCard
                variant="product"
                className="h-full flex flex-col group-focus-visible:ring-4 group-focus-visible:ring-[#36d1fe]/50 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex flex-col items-center gap-6 text-center">
                  <div className="rounded-2xl bg-gradient-to-br from-[#36d1fe] to-[#00B2E3] p-4 flex items-center justify-center shadow-lg border border-[rgba(255,255,255,0.2)] shadow-[0_0_20px_rgba(54,209,254,0.4)] transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(54,209,254,0.6)]">
                    <IconComponent
                      size={32}
                      className="text-white drop-shadow-lg"
                      strokeWidth={2}
                    />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white font-manrope tracking-tight drop-shadow-lg">
                    {product.title}
                  </h3>

                  <p className="text-[#cce7fa] text-sm sm:text-base font-manrope leading-relaxed opacity-90 flex-1">
                    {product.description}
                  </p>

                  <Button
                    tabIndex={-1}
                    variant="ghost"
                    className="w-full max-w-xs py-3 font-semibold rounded-xl text-base text-white bg-[rgba(54,209,254,0.1)] border border-[#36d1fe] transition-all duration-200 hover:bg-[rgba(54,209,254,0.2)] hover:shadow-[0_0_20px_rgba(54,209,254,0.4)] font-manrope group-hover:scale-105"
                  >
                    Learn More
                    <ArrowRight
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                      size={18}
                    />
                  </Button>
                </div>
              </StandardCard>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ProductCards;
