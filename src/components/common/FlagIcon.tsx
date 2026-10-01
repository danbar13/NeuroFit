import React from 'react';
import type { Language } from '../../i18n/translations';

interface FlagIconProps {
  country: Language;
  className?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ country, className = 'w-7 h-5' }) => {
  if (country === 'he') {
    // Crisp SVG Flag of Israel
    return (
      <svg
        className={`inline-block rounded-sm shadow-sm overflow-hidden border border-black/10 shrink-0 ${className}`}
        viewBox="0 0 220 160"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="220" height="160" fill="#FFFFFF" />
        <rect y="15" width="220" height="25" fill="#0038B8" />
        <rect y="120" width="220" height="25" fill="#0038B8" />
        {/* Star of David */}
        <g fill="none" stroke="#0038B8" strokeWidth="5.5" strokeLinejoin="round" transform="translate(110, 80)">
          {/* Upward triangle */}
          <polygon points="0,-30 26,15 -26,15" />
          {/* Downward triangle */}
          <polygon points="0,30 26,-15 -26,-15" />
        </g>
      </svg>
    );
  }

  // Crisp SVG Flag of Great Britain (UK)
  return (
    <svg
      className={`inline-block rounded-sm shadow-sm overflow-hidden border border-black/10 shrink-0 ${className}`}
      viewBox="0 0 60 30"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <clipPath id="uk-clip">
        <rect width="60" height="30" />
      </clipPath>
      <g clipPath="url(#uk-clip)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
};
