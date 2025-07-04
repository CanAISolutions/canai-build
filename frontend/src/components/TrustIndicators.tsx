import { Award, Star, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// CountUp animation helper
function useCountUp({
  to,
  duration = 1200,
  step = 1,
  start = 0,
}: {
  to: number;
  duration?: number;
  step?: number;
  start?: number;
}) {
  const [value, setValue] = useState(start);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    let raf: number;
    function tick(now: number) {
      if (!startTime.current) startTime.current = now;
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const nextValue = Math.floor(progress * (to - start) + start);
      setValue(nextValue);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setValue(to);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line
  }, [to, duration, step, start]);

  return value;
}

const TrustIndicators = () => {
  const plansCount = useCountUp({ to: 600, duration: 1200, start: 540 });
  const [progress, setProgress] = useState(0);

  // Animate progress bar
  useEffect(() => {
    let raf: number;
    const startTime = performance.now();
    function animate(now: number) {
      const pct = Math.min((now - startTime) / 1050, 1) * 98;
      setProgress(pct);
      if (pct < 98) raf = requestAnimationFrame(animate);
      else setProgress(98);
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Animate stars
  const [starVisible, setStarVisible] = useState(Array(5).fill(false));
  useEffect(() => {
    const timeoutIds: NodeJS.Timeout[] = [];
    for (let i = 0; i < 5; i++) {
      timeoutIds.push(
        setTimeout(
          () => {
            setStarVisible(prev => {
              const arr = [...prev];
              arr[i] = true;
              return arr;
            });
          },
          200 + i * 160
        )
      );
    }
    return () => timeoutIds.forEach(clearTimeout);
  }, []);

  return (
    <section
      className="relative py-16 border-t border-canai-primary/20 w-full flex justify-center"
      style={{
        background:
          'linear-gradient(132deg, rgba(18,41,74,0.82) 60%, rgba(27,49,76,0.83) 100%)',
        boxShadow: '0 8px 40px #36d1fe22, 0 1.5px 3px #0001',
        backdropFilter: 'blur(8px) saturate(120%)',
        zIndex: 1,
      }}
    >
      {/* Subtle inner glass highlight */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl mx-6"
        style={{
          background:
            'linear-gradient(120deg, rgba(28,64,120,0.11) 60%,rgba(54,209,254,0.12) 100%)',
          boxShadow: '0 0 40px 16px #36d1fe22',
          backdropFilter: 'blur(3px) saturate(120%)',
          zIndex: 0,
        }}
        aria-hidden
      />
      <div className="w-full max-w-5xl px-4 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-5 relative z-10">
        {/* Testimonial */}
        <div className="bg-white/5 bg-clip-padding backdrop-blur-lg rounded-2xl p-8 text-center space-y-4 flex flex-col justify-center items-center md:items-start md:text-left shadow-strong border border-white/10 hover:shadow-[0_0_24px_#36d1fe44] transition-all">
          <div className="flex justify-center mb-4 space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`text-yellow-300 fill-current transition-all duration-300 will-change-transform
                  ${
                    starVisible[i]
                      ? 'scale-110 opacity-100 animate-glow-pop'
                      : 'scale-75 opacity-45'
                  }`}
                size={25}
                aria-label="Testimonial star"
                style={{
                  filter:
                    'drop-shadow(0 0 10px #36d1feaa) drop-shadow(0 0 6px #ffeaa055)',
                  strokeWidth: 1.2,
                }}
              />
            ))}
          </div>
          <blockquote
            className="text-lg text-canai-light font-semibold italic font-manrope max-w-[320px] md:max-w-full"
            style={{
              fontWeight: 400,
              color: '#F7FAFF',
              textShadow: '0 2px 22px #36d1fe99,0 1px 10px #000b,0 0 4px #fff3',
            }}
            id="trust-testimonial"
          >
            &quot;CanAI launched my bakery! The business plan was exactly what I
            needed for investors.&quot;
          </blockquote>
          <cite
            className="text-canai-light opacity-95 not-italic font-manrope font-semibold"
            style={{
              fontWeight: 400,
              color: '#d4ebfc',
              textShadow: '0 2px 18px #36d1fe66, 0 0 2px #fff',
            }}
          >
            — Jane, Sweet Dreams Bakery
          </cite>
        </div>

        {/* Plans Created Stat */}
        <div className="bg-white/5 bg-clip-padding backdrop-blur-lg rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-strong border border-white/10 hover:shadow-[0_0_24px_#36d1fe44] transition-all md:border-x md:border-canai-primary/10">
          <div
            className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#205680] to-[#36d1fe99] rounded-full mb-3 mx-auto shadow-[0_0_18px_#36d1feb7] animate-glow-pop"
            style={{ animationDelay: '500ms' }}
          >
            <Users
              className="text-canai-cyan"
              size={28}
              style={{
                filter:
                  'drop-shadow(0 0 9px #fff8), drop-shadow(0 0 6px #36d1fe88)',
              }}
            />
          </div>
          <div
            className="text-5xl font-extrabold text-canai-cyan font-manrope animate-countup-glow"
            style={{
              fontWeight: 900,
              color: '#00F0FF',
              textShadow:
                '0 4px 28px #36d1fecc, 0 0 8px #00cfff99, 0 1px 2px #fff',
            }}
            aria-label="Plans Created"
          >
            {plansCount}+
          </div>
          <div
            className="text-canai-light font-semibold font-manrope text-lg"
            style={{
              fontWeight: 600,
              color: '#d9f6ff',
              opacity: 1,
              textShadow: '0 2px 12px #36d1febb',
            }}
          >
            Plans Created
          </div>
        </div>

        {/* Success Uplift Stat */}
        <div className="bg-white/5 bg-clip-padding backdrop-blur-lg rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-strong border border-white/10 hover:shadow-[0_0_24px_#36d1fe44] transition-all">
          <div
            className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#205680] to-[#36d1fe99] rounded-full mb-3 mx-auto shadow-[0_0_18px_#36d1feb7] animate-glow-pop"
            style={{ animationDelay: '800ms' }}
          >
            <Award
              className="text-canai-cyan"
              size={28}
              style={{
                filter:
                  'drop-shadow(0 0 9px #fff8), drop-shadow(0 0 6px #36d1fe88)',
              }}
            />
          </div>
          <div
            className="text-5xl font-extrabold text-canai-cyan font-manrope animate-countup-glow"
            style={{
              fontWeight: 900,
              color: '#00F0FF',
              textShadow:
                '0 4px 28px #36d1fecc, 0 0 8px #00cfff99, 0 1px 2px #fff',
            }}
            aria-label="Success Uplift"
          >
            98%
          </div>
          <div
            className="text-canai-light font-semibold font-manrope text-lg mb-2"
            style={{
              fontWeight: 600,
              color: '#d9f6ff',
              opacity: 1,
              textShadow: '0 2px 12px #36d1febb',
            }}
          >
            Success Uplift
          </div>
          <div className="w-28 h-3 rounded-full bg-canai-primary/35 border border-canai-primary/60 relative overflow-hidden shadow-strong">
            <div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #00F0FF 35%, #36d1fe 90%)',
                boxShadow:
                  '0 0 16px #36d1fecc, 0 0 11px #36d1febb, 0 2px 10px #00CFFFcc',
                filter: 'brightness(1.33) drop-shadow(0 0 6px #36d1feaa)',
                transition: 'width 0.32s cubic-bezier(.4,0,.2,1)',
              }}
              aria-label="Success rate progress"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;
