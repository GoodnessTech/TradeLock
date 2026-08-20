import { useEffect, useState } from 'react';

interface Props {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  className?: string;
  label?: string;
}

export function ScoreRing({
  value,
  max = 100,
  size = 120,
  stroke = 8,
  className = '',
  label,
}: Props) {
  const [display, setDisplay] = useState(0);
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const from = 0;
    const dur = 900;
    const tick = (t: number) => {
      const k = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const color = value >= 80 ? '#287A52' : value >= 50 ? '#E7A52B' : '#D83A34';

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E8E5DE" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tnum text-2xl font-bold tracking-tightish text-ink">{display}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">/ {max}</span>
        {label && <span className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-muted">{label}</span>}
      </div>
    </div>
  );
}
