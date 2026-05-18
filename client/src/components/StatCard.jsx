import React, { useState } from 'react';

export default function StatCard({ icon, label, value, sub, color = '#8b5e1a', bg }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fffbf0',
        borderRadius: 8,
        padding: '20px 24px',
        boxShadow: hovered
          ? '0 4px 16px rgba(139,94,26,0.25)'
          : '0 2px 8px rgba(139,94,26,0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        minWidth: 0,
        border: '1px solid #c9a055',
        borderTop: `3px solid ${color}`,
        transition: 'box-shadow 0.2s ease',
      }}
    >
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 8,
        background: bg || `${color}22`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
        border: `1px solid ${color}44`,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 12,
          color: '#7a6040',
          marginBottom: 2,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>{label}</div>
        <div style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#7a4e0d',
          lineHeight: 1,
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: '#7a6040', marginTop: 3, opacity: 0.8 }}>{sub}</div>}
      </div>
    </div>
  );
}
