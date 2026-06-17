export default function RiskGauge({ value, size = 130 }) {
  const r = 38, cx = 50, cy = 50, circ = Math.PI * r;
  const pct = Math.min(Math.max(value, 0), 100) / 100;
  const color = value >= 75 ? "#ef4444" : value >= 45 ? "#f59e0b" : "#22c55e";
  return (
    <svg viewBox="0 0 100 60" width={size} height={size * 0.6}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#1e2a1e" strokeWidth="10" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease, stroke 0.4s ease" }} />
      <text x={cx} y={cy - 6} textAnchor="middle" fill={color} fontSize="18" fontWeight="700" fontFamily="monospace">{value}</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="sans-serif">RISK SCORE</text>
    </svg>
  );
}
