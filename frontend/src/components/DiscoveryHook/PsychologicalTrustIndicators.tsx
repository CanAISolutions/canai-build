import {
  Award,
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const PsychologicalTrustIndicators = () => {
  const [currentMetric, setCurrentMetric] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const trustMetrics = [
    {
      icon: TrendingUp,
      label: 'Success Rate',
      value: '78%',
      detail: 'of plans get funded',
    },
    {
      icon: Clock,
      label: 'Avg. Delivery',
      value: '18hrs',
      detail: 'typical turnaround',
    },
    {
      icon: Users,
      label: 'Happy Founders',
      value: '500+',
      detail: 'funded this year',
    },
    {
      icon: Award,
      label: 'Funding Raised',
      value: '$50M+',
      detail: 'by our users',
    },
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentMetric(prev => (prev + 1) % trustMetrics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [trustMetrics.length]);

  return (
    <section className="w-full py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Rotating featured metric */}
        <div
          className={`
          text-center mb-8 transition-all duration-700
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
        >
          <div
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#193c65]/80 to-[#1e4a73]/80
                         backdrop-blur-md rounded-2xl px-8 py-4 border border-[#36d1fe]/30
                         shadow-[0_0_30px_rgba(54,209,254,0.2)] hover:shadow-[0_0_40px_rgba(54,209,254,0.3)]
                         transition-all duration-300"
          >
            {React.createElement(
              trustMetrics[currentMetric]?.icon || TrendingUp,
              {
                size: 28,
                className: 'text-[#36d1fe] animate-pulse',
              }
            )}
            <div className="text-left">
              <div className="text-2xl font-bold text-white font-playfair">
                {trustMetrics[currentMetric]?.value || '0'}
              </div>
              <div className="text-sm text-[#E6F6FF] opacity-90 font-manrope">
                {trustMetrics[currentMetric]?.detail || ''}
              </div>
            </div>
          </div>
        </div>

        {/* Authority signals grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: CheckCircle,
              text: 'Venture-Backed',
              subtext: 'By top VCs',
            },
            {
              icon: Shield,
              text: 'SOC 2 Compliant',
              subtext: 'Enterprise security',
            },
            {
              icon: Award,
              text: 'Industry Awards',
              subtext: 'AI Excellence 2024',
            },
            { icon: Users, text: 'Y Combinator', subtext: 'Alumni network' },
          ].map((item, index) => (
            <div
              key={index}
              className={`
                bg-gradient-to-br from-[#193c65]/60 to-[#1e4a73]/60
                backdrop-blur-md rounded-xl p-4 text-center
                border border-[#36d1fe]/20 hover:border-[#36d1fe]/40
                transition-all duration-300 hover:scale-105
                ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <item.icon className="w-6 h-6 text-[#36d1fe] mx-auto mb-2" />
              <div className="text-sm font-semibold text-white font-manrope">
                {item.text}
              </div>
              <div className="text-xs text-[#E6F6FF] opacity-70">
                {item.subtext}
              </div>
            </div>
          ))}
        </div>

        {/* Social proof testimonial */}
        <div
          className={`
          max-w-4xl mx-auto text-center transition-all duration-700 delay-300
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
        >
          <div
            className="bg-gradient-to-r from-[#193c65]/70 to-[#1e4a73]/70
                         backdrop-blur-md rounded-2xl p-6 border border-[#36d1fe]/30
                         shadow-[0_0_25px_rgba(54,209,254,0.15)]"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#36d1fe] to-[#00b8e6]
                             flex items-center justify-center text-white font-bold text-lg"
              >
                S
              </div>
              <div className="flex-1 text-left">
                <p className="text-[#E6F6FF] italic mb-3 font-manrope leading-relaxed">
                  &quot;CanAI&apos;s business plan helped us raise $2.5M in
                  Series A. The emotional intelligence in their writing was
                  exactly what investors wanted to see.&quot;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold font-playfair">
                      Sarah Chen
                    </div>
                    <div className="text-[#36d1fe] text-sm">
                      CEO, TechFlow • $2.5M raised
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PsychologicalTrustIndicators;
