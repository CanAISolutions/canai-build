import React from 'react';
import ProductCards from '@/components/ProductCards';
import { SectionTitle, BodyText } from '@/components/StandardTypography';

const ProductCardsSection = () => (
  <section
    className="w-full mt-12 pb-8 flex flex-col items-center animate-fade-in"
    style={{ animationDelay: '0.8s' }}
  >
    <div className="max-w-7xl mx-auto px-4 py-0 w-full">
      {/* Enhanced Section Header */}
      <div className="text-center mb-12 sm:mb-16">
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-6 text-white">
          Choose Your{' '}
          <span className="canai-gradient-text">Perfect Solution</span>
        </SectionTitle>
        <BodyText className="text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto opacity-90 leading-relaxed">
          Each product delivers expert-level results, crafted with emotional
          intelligence and designed for your success.
        </BodyText>

        {/* Value Props */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-[#cce7fa] text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#36d1fe] rounded-full"></span>
            <span>Instant Generation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#36d1fe] rounded-full"></span>
            <span>Emotionally Intelligent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#36d1fe] rounded-full"></span>
            <span>Investor-Ready Quality</span>
          </div>
        </div>
      </div>

      <ProductCards />
    </div>
  </section>
);

export default ProductCardsSection;
