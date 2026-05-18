import React from 'react';

export default function StatCard({ icon, label, value, sub, color = '#2563eb', bg }) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 12,
      padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      minWidth: 0,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: bg || `${color}18`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#1a202c', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}
