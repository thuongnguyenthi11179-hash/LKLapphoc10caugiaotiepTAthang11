import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

export const SchoolLogo: React.FC<Props> = ({ className = "w-10 h-10", size = 44 }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo Trường Tiểu học Lê Kim Lăng"
    >
      {/* Outer Circle */}
      <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3" />
      <circle cx="50" cy="50" r="44" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3 2" />

      {/* Circular text path for TRƯỜNG TIỂU HỌC LÊ KIM LĂNG */}
      <path
        id="school-text-path-top"
        d="M 16 50 A 34 34 0 1 1 84 50"
        fill="none"
      />
      <text fill="#0369A1" fontSize="7.2" fontWeight="800" letterSpacing="0.4">
        <textPath href="#school-text-path-top" startOffset="50%" textAnchor="middle">
          TIỂU HỌC LÊ KIM LĂNG
        </textPath>
      </text>

      {/* Bottom text */}
      <path
        id="school-text-path-bottom"
        d="M 84 52 A 34 34 0 0 1 16 52"
        fill="none"
      />
      <text fill="#DC2626" fontSize="6.5" fontWeight="700" letterSpacing="0.6">
        <textPath href="#school-text-path-bottom" startOffset="50%" textAnchor="middle">
          HÒA XUÂN - ĐÀ NẴNG
        </textPath>
      </text>

      {/* Inner Decorative Circle */}
      <circle cx="50" cy="50" r="26" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1.5" />

      {/* Open Book */}
      <path
        d="M 33 58 C 40 54, 46 56, 50 60 C 54 56, 60 54, 67 58 L 67 67 C 60 63, 54 65, 50 69 C 46 65, 40 63, 33 67 Z"
        fill="#FFFFFF"
        stroke="#0284C7"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="50" y1="60" x2="50" y2="69" stroke="#0284C7" strokeWidth="1.5" />

      {/* Pages lines */}
      <line x1="37" y1="60" x2="46" y2="58" stroke="#93C5FD" strokeWidth="1" />
      <line x1="37" y1="63" x2="46" y2="61" stroke="#93C5FD" strokeWidth="1" />
      <line x1="54" y1="58" x2="63" y2="60" stroke="#93C5FD" strokeWidth="1" />
      <line x1="54" y1="61" x2="63" y2="63" stroke="#93C5FD" strokeWidth="1" />

      {/* Torch Body */}
      <path
        d="M 47 48 L 53 48 L 51.5 57 L 48.5 57 Z"
        fill="#DC2626"
        stroke="#991B1B"
        strokeWidth="0.8"
      />
      {/* Torch Cup */}
      <path
        d="M 45 48 L 55 48 L 53 44 L 47 44 Z"
        fill="#F59E0B"
        stroke="#B45309"
        strokeWidth="0.8"
      />

      {/* Flame */}
      <path
        d="M 50 30 C 54 36, 56 40, 52 44 C 50 42, 48 43, 47 44 C 45 40, 46 36, 50 30 Z"
        fill="#EF4444"
      />
      <path
        d="M 50 35 C 52 38, 53 41, 51 43 C 49 42, 48 42.5, 48 43 C 47 41, 48 38, 50 35 Z"
        fill="#FDE047"
      />

      {/* Little stars */}
      <circle cx="27" cy="50" r="1.5" fill="#DC2626" />
      <circle cx="73" cy="50" r="1.5" fill="#DC2626" />
    </svg>
  );
};
