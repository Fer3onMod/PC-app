import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  monochrome?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  monochrome = false,
  className = '',
}) => {
  const sizeMap = {
    xs: { icon: 20, text: 'text-xs', sub: 'text-[8px]', gap: 'gap-1.5' },
    sm: { icon: 26, text: 'text-sm', sub: 'text-[9px]', gap: 'gap-2' },
    md: { icon: 34, text: 'text-base', sub: 'text-[10px]', gap: 'gap-2.5' },
    lg: { icon: 44, text: 'text-xl', sub: 'text-xs', gap: 'gap-3' },
    xl: { icon: 56, text: 'text-2xl', sub: 'text-sm', gap: 'gap-3.5' },
  };

  const { icon, text, sub, gap } = sizeMap[size];

  return (
    <div className={`flex items-center ${gap} select-none ${className}`} dir="ltr">
      {/* Precision Vector Shield & Camera Aperture SVG Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-sm transition-transform duration-200 hover:scale-105"
        >
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={monochrome ? '#334155' : '#2563eb'} />
              <stop offset="50%" stopColor={monochrome ? '#1e293b' : '#1d4ed8'} />
              <stop offset="100%" stopColor={monochrome ? '#0f172a' : '#0369a1'} />
            </linearGradient>

            <linearGradient id="cyanAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={monochrome ? '#94a3b8' : '#38bdf8'} />
              <stop offset="100%" stopColor={monochrome ? '#64748b' : '#0284c7'} />
            </linearGradient>

            <linearGradient id="innerGlow" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
            </linearGradient>
          </defs>

          {/* Outer Protective Shield Geometry */}
          <path
            d="M50 6 L86 20 C86 52 72 78 50 94 C28 78 14 52 14 20 L50 6 Z"
            fill="url(#shieldGrad)"
            stroke={monochrome ? '#475569' : '#60a5fa'}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Gloss Shield Line */}
          <path
            d="M50 12 L80 24 C80 50 68 72 50 86 C32 72 20 50 20 24 L50 12 Z"
            fill="url(#innerGlow)"
            opacity="0.35"
          />

          {/* Precision Security Camera Iris / Optical Sensor */}
          <circle
            cx="50"
            cy="48"
            r="20"
            fill={monochrome ? '#0f172a' : '#0b132b'}
            stroke="url(#cyanAccent)"
            strokeWidth="3"
          />

          {/* Aperture Blades / Security Radar Sweep Segments */}
          <path
            d="M50 32 L58 45 M66 48 L53 56 M58 64 L45 56 M34 52 L47 43 M42 34 L50 48"
            stroke={monochrome ? '#cbd5e1' : '#38bdf8'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Center Optical Lens Glint (Biometric Eye) */}
          <circle
            cx="50"
            cy="48"
            r="8"
            fill={monochrome ? '#e2e8f0' : '#38bdf8'}
          />
          <circle
            cx="48"
            cy="46"
            r="2.5"
            fill="#ffffff"
          />

          {/* Top Security Crest Crown Accent */}
          <path
            d="M44 14 L50 9 L56 14"
            stroke={monochrome ? '#f8fafc' : '#38bdf8'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Typography Wordmark */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center tracking-tight font-black font-sans">
          <span
            className={`${text} font-black uppercase tracking-wider ${
              monochrome ? 'text-slate-900' : 'text-white'
            }`}
          >
            TOP
          </span>
          <span
            className={`${text} font-extrabold uppercase tracking-wider ml-1.5 ${
              monochrome ? 'text-slate-600' : 'text-sky-400'
            }`}
          >
            SECURITY
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`${sub} tracking-widest font-bold uppercase mt-0.5 ${
              monochrome ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Surveillance & POS Systems
          </span>
        )}
      </div>
    </div>
  );
};
