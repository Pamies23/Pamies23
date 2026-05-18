import React, { useState } from 'react';

export default function StatCard({ icon, label, value, sub, color = '#7c3aed', bg }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#1a1a2e',
        borderRadius: 14,
        padding: '20px 24px',
        border: '1px solid rgba(255,255,255,0.06)',
        borderTop: `3px solid ${color}`,
        boxShadow: hovered
          ? `0 0 28px ${color}40, 0 4px 20px rgba(0,0,0,0.4)`
          : `0 0 16px ${color}20, 0 2px 8px rgba(0,0,0,0.3)`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        minWidth: 0,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        cursor: 'default',
      }}
    >
      <div style={{
        width: 50,
        height: 50,
        borderRadius: 12,
        background: bg || `${color}22`,
        border: `1px solid ${color}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  );
}
