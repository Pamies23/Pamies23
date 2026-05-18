import React from 'react';

export default function ProgressBar({ value, max, color = '#c9a055', height = 8, showLabel = false }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const fillGradient = pct >= 100
    ? 'linear-gradient(90deg, #5a7a3a, #3d5a28)'
    : `linear-gradient(90deg, #c9a055, #8b5e1a)`;

  return (
    <div>
      {showLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#7a4e0d',
          marginBottom: 4,
          fontWeight: 500,
        }}>
          <span>{value} / {max}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div style={{
        width: '100%',
        height,
        background: '#e8d5a3',
        borderRadius: height,
        overflow: 'hidden',
        border: '1px solid rgba(201,160,85,0.3)',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: fillGradient,
          borderRadius: height,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}
