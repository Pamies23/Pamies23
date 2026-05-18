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
      {open && (
        <div
          onClick={onToggle}
          style={{
            display: 'none',
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99,
          }}
        />
      )}
      <aside
        style={{
          width: open ? 240 : 64,
          minHeight: '100vh',
          background: '#0d0d1f',
          borderRight: '1px solid rgba(124, 58, 237, 0.2)',
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
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 12px',
          borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minHeight: 64,
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🏋️</span>
          {open && (
            <div>
              <div style={{
                fontWeight: 800,
                fontSize: 16,
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
              }}>
                💪 FitTracker
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Tu progreso personal</div>
            </div>
          )}
          <button
            onClick={onToggle}
            style={{
              marginLeft: 'auto',
              background: 'rgba(124, 58, 237, 0.12)',
              border: '1px solid rgba(124, 58, 237, 0.25)',
              cursor: 'pointer',
              fontSize: 13,
              color: '#9f67ff',
              padding: '5px 7px',
              borderRadius: 6,
              flexShrink: 0,
              lineHeight: 1,
              transition: 'background 0.15s',
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
                padding: '11px 12px',
                borderRadius: 10,
                textDecoration: 'none',
                color: isActive ? '#f1f5f9' : '#94a3b8',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(37,99,235,0.25))'
                  : 'transparent',
                fontWeight: isActive ? 700 : 400,
                fontSize: 14,
                marginBottom: 4,
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
                boxShadow: isActive ? '0 0 12px rgba(124,58,237,0.2)' : 'none',
              })}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {open && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        {open && (
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(124, 58, 237, 0.15)',
          }}>
            <div style={{ fontSize: 11, color: '#475569' }}>
              © 2025 FitTracker
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
