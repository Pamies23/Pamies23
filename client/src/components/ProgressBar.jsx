import React from 'react';

export default function ProgressBar({ value, max, color = '#2563eb', height = 8, showLabel = false }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
          <span>{value} / {max}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div style={{
        width: '100%',
        height,
        background: '#e5e7eb',
        borderRadius: height,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: pct >= 100 ? '#10b981' : color,
          borderRadius: height,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}
