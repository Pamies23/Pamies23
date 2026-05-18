import React from 'react';

// Track = marble stone (#e5e0d6), fill = sandy bronze (#c4a882 → #9a7040)
export default function ProgressBar({ value, max, height = 8, showLabel = false }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const fill = pct >= 100
    ? 'linear-gradient(90deg, #a07848, #7a5830)'
    : 'linear-gradient(90deg, #c4a882, #9a7040)';

  return (
    <div>
      {showLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#5a4020',
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
        background: '#e5e0d6',
        borderRadius: height,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: fill,
          borderRadius: height,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}
