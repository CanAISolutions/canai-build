import { SectionTitle } from '@/components/StandardTypography';
import TrustIndicators from '@/components/TrustIndicators';

const TrustIndicatorsSection = () => (
  <section
    className="w-full px-4 mt-8 mb-6 animate-fade-in"
    style={{ animationDelay: '0.6s' }}
  >
    <div className="max-w-5xl mx-auto">
      {/* Section Title */}
      <div className="text-center mb-8">
        <SectionTitle className="text-2xl sm:text-3xl mb-3 text-white opacity-95">
          Trusted by Forward-Thinking Founders
        </SectionTitle>
        <p className="text-[#cce7fa] text-base sm:text-lg opacity-80 max-w-2xl mx-auto">
          Join hundreds of entrepreneurs who&apos;ve elevated their business
          with CanAI
        </p>
      </div>

      {/* Enhanced Container */}
      <div
        className="
        rounded-3xl backdrop-blur-xl
        bg-gradient-to-br from-white/10 via-[#14365714] to-[#36d1fe1e]
        shadow-[0_0_60px_rgba(54,209,254,0.25)]
        border border-[rgba(54,209,254,0.3)]
        px-6 py-10 sm:px-8 sm:py-12
        hover:shadow-[0_0_80px_rgba(54,209,254,0.35)]
        transition-all duration-500
      "
      >
        <TrustIndicators />
      </div>
    </div>
  </section>
);

export default TrustIndicatorsSection;
