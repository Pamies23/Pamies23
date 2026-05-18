import React from 'react';

export default function ProgressBar({ value, max, color, height = 8, showLabel = false }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  // Choose gradient based on state
  const fillGradient = pct >= 100
    ? 'linear-gradient(90deg, #10b981, #059669)'
    : pct >= 80
      ? 'linear-gradient(90deg, #10b981, #2563eb)'
      : color
        ? color
        : 'linear-gradient(90deg, #7c3aed, #2563eb)';

  return (
    <div>
      {showLabel && (
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 500,
        }}>
          <span>{value} / {max}</span>
          <span style={{ color: pct >= 100 ? '#10b981' : '#94a3b8', fontWeight: 700 }}>{pct}%</span>
        </div>
      )}
      <div style={{
        width: '100%',
        height,
        background: '#2a2a3e',
        borderRadius: height,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: fillGradient,
          borderRadius: height,
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: pct > 0 ? '0 0 8px rgba(124,58,237,0.4)' : 'none',
        }} />
      </div>
    </div>
  );
}
