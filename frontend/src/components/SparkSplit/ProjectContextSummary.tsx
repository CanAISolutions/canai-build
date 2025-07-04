import React from 'react';

const demoContext = [
  ['Business', 'Sprinkle Haven Bakery'],
  ['Target Audience', 'Denver families'],
  ['Goal', 'Funding'],
  ['Competitive', 'Blue Moon Bakery'],
  ['Voice', 'Warm'],
  ['Constraints', '$50k, 3 people, 6 months'],
  ['Location', 'Denver, CO'],
  ['Value', 'Organic, community-focused pastries'],
];

const ProjectContextSummary: React.FC = () => (
  <div
    className="
      max-w-[330px] w-full
      bg-gradient-to-br from-[#162c44e6] to-[#1a3556f0]
      rounded-2xl px-7 py-8 flex flex-col gap-4
      border border-[#00CFFF] shadow-[0_8px_40px_#00Cfff22]
      min-h-full mb-4
      animate-fade-in
    "
    style={{
      boxShadow: '0 0 0 2px #00CFFF44, 0 4px 32px 0 #00b2e330',
    }}
  >
    <div className="font-bold text-lg mb-2 text-canai-cyan tracking-wide drop-shadow">
      Your Project
    </div>
    <ul className="space-y-3">
      {demoContext.map(([label, value]) => (
        <li key={label} className="flex flex-col">
          <span className="uppercase text-xs font-semibold tracking-wide text-canai-cyan/80 leading-none mb-1">
            {label}
          </span>
          <span className="text-base text-[#E6F6FF] font-semibold font-manrope leading-relaxed break-words">
            {value}
          </span>
        </li>
      ))}
    </ul>
    <div className="text-xs text-canai-light-softer italic mt-5 pt-2 border-t border-[#00CFFF22] opacity-80">
      “How your brief shaped both plans”
    </div>
  </div>
);

export default ProjectContextSummary;
