import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Panel', icon: '🏠' },
  { to: '/objetivos', label: 'Objetivos', icon: '🎯' },
  { to: '/ejercicio', label: 'Ejercicio', icon: '💪' },
  { to: '/dieta', label: 'Dieta', icon: '🥗' },
  { to: '/progreso', label: 'Progreso', icon: '📈' },
];

export default function Sidebar({ open, onToggle }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={onToggle}
          style={{
            display: 'none',
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 99,
            '@media (max-width: 768px)': { display: 'block' },
          }}
        />
      )}
      <aside
        style={{
          width: open ? 240 : 64,
          minHeight: '100vh',
          background: '#f8f9fa',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 100,
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 12px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minHeight: 64,
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🏋️</span>
          {open && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1a202c' }}>FitTracker</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Tu progreso personal</div>
            </div>
          )}
          <button
            onClick={onToggle}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              color: '#6b7280',
              padding: '4px',
              borderRadius: 4,
              flexShrink: 0,
            }}
            title={open ? 'Cerrar menú' : 'Abrir menú'}
          >
            {open ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                color: isActive ? '#2563eb' : '#374151',
                background: isActive ? '#dbeafe' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                marginBottom: 2,
                transition: 'background 0.15s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              })}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {open && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        {open && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>
              © 2025 FitTracker
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
