import PageHeader from '@/components/PageHeader';
import SampleMetricBadge from '@/components/Samples/SampleMetricBadge';
import StandardBackground from '@/components/StandardBackground';
import StandardCard from '@/components/StandardCard';
import {
  AccentText,
  BodyText,
  CardTitle,
  PageTitle,
  SectionTitle,
} from '@/components/StandardTypography';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { FileText, MessageSquare, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Card data lives here so that it's scalable to future additions/changes.
const sampleCards = [
  {
    icon: <FileText className="text-white drop-shadow-lg" size={36} />,
    title: 'Business Plan Sample',
    subtitle: 'EcoClean Solutions (BUSINESS_BUILDER)',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
    imageAlt:
      'Professional business planning with laptop and documents showcasing EcoClean Solutions business strategy',
    content: (
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 font-playfair animate-fade-in">
          Disrupting the $330B Cleaning Market
        </h3>
        <div className="space-y-3 text-[#cce7fa]">
          <p>
            <b className="text-[#36d1fe] font-extrabold">EcoClean Solutions</b>{' '}
            brings next-gen, sustainable cleaning powered by botanicals and IoT.
            Our <span className="font-semibold text-[#36d1fe]">eco-first</span>{' '}
            technology delivers <b>89% less waste</b> with <b>40% less labor</b>
            , cutting costs <b>25%</b> for offices, retail, and healthcare.
          </p>
          <p>
            Founded in 2024, we&apos;re built for scale.{' '}
            <span className="font-bold">Proprietary green agents</span> and
            smart sensors keep quality high{' '}
            <span className="text-[#36d1fe]">and the planet safe.</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-6 mb-4">
          <SampleMetricBadge
            label="Year 1 Revenue"
            value="$2.4M"
            emoji="💰"
            color="from-orange-500 to-amber-500"
          />
          <SampleMetricBadge
            label="Target Clients"
            value="150"
            emoji="🎯"
            color="from-fuchsia-500 to-pink-500"
          />
          <SampleMetricBadge
            label="ROI"
            value="340%"
            emoji="📈"
            color="from-green-500 to-lime-400"
          />
        </div>
        <hr className="my-4 border-[rgba(54,209,254,0.2)]" aria-hidden="true" />
        <p className="text-[#b3d9f2] italic text-sm px-2">
          [Excerpt from a full plan: projections, analysis, next steps]
        </p>
      </div>
    ),
  },
  {
    icon: <MessageSquare className="text-white drop-shadow-lg" size={36} />,
    title: 'Social & Email Campaign',
    subtitle: 'For SMB Owners (SOCIAL_EMAIL)',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    imageAlt:
      'Social media marketing and email campaign interface showing engagement metrics and content optimization',
    content: (
      <div className="space-y-5">
        <div>
          <div className="uppercase text-xs text-[#36d1fe] tracking-wider font-semibold mb-2">
            LinkedIn Post
          </div>
          <div className="bg-[rgba(25,60,101,0.4)] border-l-4 border-[#36d1fe] rounded-xl px-5 py-4 text-[#cce7fa] shadow-lg border border-[rgba(54,209,254,0.2)]">
            <span className="font-bold text-[#36d1fe]">
              🌱 Small changes, big impact!
            </span>
            <span className="block text-[#cce7fa] mt-1">
              Switch to eco-cleaning for savings{' '}
              <b className="text-[#36d1fe]">25% lower costs</b>{' '}
              <span aria-hidden>|</span>{' '}
              <b className="text-[#36d1fe]">40% faster</b>.<br />
              Ready to make the change?{' '}
              <span className="opacity-70">#EcoFriendly #SMB</span>
            </span>
          </div>
        </div>
        <div>
          <div className="uppercase text-xs text-pink-400 tracking-wider font-semibold mb-2">
            Email Subject
          </div>
          <div className="bg-[rgba(25,60,101,0.4)] border-l-4 border-pink-400 rounded-xl px-5 py-4 text-[#cce7fa] font-semibold shadow-lg border border-[rgba(255,182,193,0.2)]">
            &quot;How Sarah Cut Cleaning Costs{' '}
            <span className="text-[#36d1fe] font-bold">25%</span> (and helped
            the planet)&quot;
          </div>
        </div>
        <div>
          <span className="inline-flex items-center gap-1 text-[#b3d9f2] text-sm italic">
            [Includes 5 post templates & 3 persuasive emails]
          </span>
        </div>
      </div>
    ),
  },
  {
    icon: <Search className="text-white drop-shadow-lg" size={36} />,
    title: 'Website Audit Results',
    subtitle: 'Homepage (SITE_AUDIT)',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    imageAlt:
      'Website analytics dashboard showing performance metrics, conversion rates, and optimization recommendations',
    content: (
      <div>
        <h3 className="text-xl font-bold text-white mb-3 font-playfair animate-fade-in">
          Performance At-a-Glance
        </h3>
        <div className="flex flex-wrap gap-3 mb-4">
          <SampleMetricBadge
            label="Conversion Rate"
            value="2.1%"
            emoji="📉"
            color="from-pink-500 to-rose-400"
          />
          <SampleMetricBadge
            label="Load Speed"
            value="4.2s"
            emoji="⚠️"
            color="from-yellow-400 to-amber-500"
          />
          <SampleMetricBadge
            label="Mobile Friendly"
            value="95%"
            emoji="✅"
            color="from-green-500 to-lime-400"
          />
        </div>
        <div className="text-[#cce7fa] space-y-2">
          <p>
            <span className="font-semibold text-[#36d1fe]">
              Key Opportunity:
            </span>
            <br />
            The main CTA is below-the-fold on mobile, reducing engagement up to{' '}
            <b>35%</b>. Moving it up could boost conversion to{' '}
            <span className="font-bold text-[#36d1fe]">3.4%</span>.
          </p>
          <p className="text-[#b3d9f2] italic text-sm pt-2">
            [From a detailed 350-word audit, including actionable website fixes]
          </p>
        </div>
      </div>
    ),
  },
];

const Samples = () => {
  const navigate = useNavigate();

  return (
    <StandardBackground>
      <PageHeader showBackButton className="max-w-7xl mx-auto pt-6 pb-4 px-4" />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pb-20 pt-2">
        <section className="max-w-6xl mx-auto space-y-12">
          <header className="text-center pb-6">
            <PageTitle className="animate-fade-in">
              Explore CanAI Output Samples
            </PageTitle>
            <BodyText
              className="animate-fade-in max-w-3xl mx-auto text-xl"
              style={{ animationDelay: '0.12s' }}
            >
              These examples reflect the same design, polish, and intelligence
              your final deliverables receive.
              <br className="hidden md:block" />
              Full outputs are always custom and ready to use.
            </BodyText>
          </header>

          {/* Card Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sampleCards.map((card, idx) => (
              <article
                key={card.title}
                className="group flex flex-col h-full animate-fade-in overflow-hidden"
                style={{
                  minHeight: 520,
                  animationDelay: `${idx * 0.15 + 0.02}s`,
                }}
                tabIndex={0}
                role="region"
                aria-labelledby={`sample-title-${idx}`}
              >
                <StandardCard
                  variant="content"
                  padding="none"
                  className="h-full flex flex-col"
                >
                  {/* Optimized header image */}
                  <div className="relative h-32 overflow-hidden">
                    <OptimizedImage
                      src={card.image}
                      alt={card.imageAlt}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={idx < 2}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C]/60 to-transparent" />
                  </div>

                  <header className="flex items-center gap-5 p-8 pb-4">
                    <div className="rounded-2xl bg-gradient-to-br from-[#36d1fe] to-[#00B2E3] p-4 flex items-center justify-center shadow-lg border border-[rgba(255,255,255,0.2)] shadow-[0_0_20px_rgba(54,209,254,0.4)]">
                      {card.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle
                        id={`sample-title-${idx}`}
                        className="leading-tight mb-1"
                      >
                        {card.title}
                      </CardTitle>
                      <AccentText className="text-sm tracking-wide">
                        {card.subtitle}
                      </AccentText>
                    </div>
                  </header>
                  <section className="bg-[rgba(25,60,101,0.4)] rounded-2xl p-8 mx-6 mb-8 flex-1 shadow-lg border border-[rgba(54,209,254,0.2)]">
                    {card.content}
                  </section>
                </StandardCard>
              </article>
            ))}
          </div>

          {/* CTA Section */}
          <footer className="text-center pt-8 pb-6">
            <div className="max-w-2xl mx-auto mb-8">
              <SectionTitle className="animate-fade-in mb-4">
                Ready for Your Custom Content?
              </SectionTitle>
              <BodyText
                className="animate-fade-in text-xl"
                style={{ animationDelay: '0.09s' }}
              >
                Get investor-ready plans, high-converting posts, or expert
                audits in hours.
                <br />
                See why{' '}
                <AccentText className="font-bold">
                  65% of users prefer CanAI outputs!
                </AccentText>
              </BodyText>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => navigate('/discovery-funnel')}
                size="lg"
                variant="canai"
                className="text-lg px-12 py-6 shadow-[0_0_30px_rgba(54,209,254,0.4)] hover:shadow-[0_0_50px_rgba(54,209,254,0.6)] hover:scale-105 animate-fade-in min-w-[240px] transition-all duration-300 font-manrope"
                style={{ animationDelay: '0.15s' }}
              >
                Start Your Project
              </Button>
              <BodyText
                className="mt-2 sm:mt-0 animate-fade-in font-medium"
                style={{ animationDelay: '0.18s' }}
              >
                ✨ 500+ plans created • 📈 65% prefer CanAI outputs
              </BodyText>
            </div>
          </footer>
        </section>
      </main>
    </StandardBackground>
  );
};

export default Samples;
