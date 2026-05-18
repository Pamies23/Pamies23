import React, { useState } from 'react';
import { C } from '../theme.js';

export default function StatCard({ icon, label, value, sub, color = C.bronzeDark }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.cardBg,
        borderRadius: 8,
        padding: '18px 22px',
        boxShadow: hovered
          ? '0 4px 14px rgba(30,24,18,0.12)'
          : '0 1px 3px rgba(30,24,18,0.07), 0 4px 12px rgba(30,24,18,0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        minWidth: 0,
        border: `1px solid ${C.border}`,
        borderTop: `3px solid ${color}`,
        transition: 'box-shadow 0.2s ease',
      }}
    >
      <div style={{
        width: 44, height: 44,
        borderRadius: 8,
        background: C.marbleLight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        flexShrink: 0,
        border: `1px solid ${C.border}`,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 10,
          color: C.textMuted,
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
        {sub && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}
