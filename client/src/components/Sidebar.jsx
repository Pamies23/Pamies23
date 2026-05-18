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
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99,
            '@media (max-width: 768px)': { display: 'block' },
          }}
        />
      )}
      <aside
        style={{
          width: open ? 240 : 64,
          minHeight: '100vh',
          background: '#c4a882',
          borderRight: '1px solid #b09060',
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
          boxShadow: '2px 0 8px rgba(120,80,30,0.15)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 12px',
          borderBottom: '1px solid rgba(120,80,30,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minHeight: 64,
          background: 'rgba(120,80,30,0.08)',
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>⚔️</span>
          {open && (
            <div>
              <div style={{
                fontWeight: 700,
                fontSize: 16,
                color: '#3d2a0e',
                fontFamily: "Georgia, 'Times New Roman', serif",
                letterSpacing: '0.04em',
              }}>FitTracker</div>
              <div style={{ fontSize: 11, color: 'rgba(80,50,10,0.55)', letterSpacing: '0.06em' }}>Tu progreso personal</div>
            </div>
          )}
          <button
            onClick={onToggle}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              color: '#5a3e1e',
              padding: '4px',
              borderRadius: 4,
              flexShrink: 0,
              opacity: 0.8,
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
                borderRadius: 6,
                textDecoration: 'none',
                color: isActive ? '#3d2a0e' : '#5a3e1e',
                background: isActive ? 'rgba(80,50,10,0.15)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                marginBottom: 2,
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                borderLeft: isActive ? '3px solid #3d2a0e' : '3px solid transparent',
                paddingLeft: isActive ? '9px' : '12px',
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
            borderTop: '1px solid rgba(80,50,10,0.2)',
            background: 'rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontSize: 11, color: 'rgba(80,50,10,0.4)', letterSpacing: '0.05em' }}>
              © 2025 FitTracker
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
