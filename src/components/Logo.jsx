// src/components/Logo.jsx
export default function Logo({ size = 36, variant = 'dark' }) {
  const bg = variant === 'light' ? '#D5CFC1' : '#2D3347';
  const fg = variant === 'light' ? '#2D3347' : '#D5CFC1';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-label="Orbit Logo">
      <circle cx="50" cy="50" r="46" fill={bg} />
      {/* Arc — open at bottom */}
      <path
        d="M 28 62 A 25 25 0 1 1 72 62"
        stroke={fg}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      {/* Center dot */}
      <circle cx="50" cy="63" r="5" fill={fg} />
    </svg>
  );
}
