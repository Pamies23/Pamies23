import React, { useState } from 'react';

export default function StatCard({ icon, label, value, sub, color = '#9a7040' }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        borderRadius: 8,
        padding: '20px 24px',
        boxShadow: hovered
          ? '0 4px 14px rgba(30,24,18,0.12)'
          : '0 1px 3px rgba(30,24,18,0.07), 0 4px 12px rgba(30,24,18,0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        minWidth: 0,
        border: '1px solid #e5e0d6',
        borderTop: `3px solid ${color}`,
        transition: 'box-shadow 0.2s ease',
      }}
    >
      <div style={{
        width: 46,
        height: 46,
        borderRadius: 8,
        background: '#f5f0e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
        border: '1px solid #e5e0d6',
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 10,
          color: '#a0907a',
          marginBottom: 4,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.09em',
        }}>{label}</div>
        <div style={{
          fontSize: 22,
          fontWeight: 800,
          color,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: '#a0907a', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}
