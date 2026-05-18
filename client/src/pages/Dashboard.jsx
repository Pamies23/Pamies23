import React from 'react';
import { useApi } from '../hooks/useApi.js';
import StatCard from '../components/StatCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

// Same palette as Progreso
const C = {
  pageBg:    '#eddfc8',
  cardBg:    '#ffffff',
  border:    '#e5e0d6',
  bronze:    '#c4a882',
  bronzeDark:'#9a7040',
  marble:    '#e5e0d6',
  text:      '#1e1812',
  textMuted: '#a0907a',
  textSub:   '#6b5a40',
  gridLine:  '#e5e0d6',
};

const card = {
  background: C.cardBg,
  borderRadius: 8,
  padding: 20,
  boxShadow: '0 1px 3px rgba(30,24,18,0.07), 0 4px 12px rgba(30,24,18,0.04)',
  border: `1px solid ${C.border}`,
};

const tooltipStyle = {
  background: C.cardBg,
  border: `1px solid ${C.bronze}`,
  borderRadius: 4,
  fontSize: 12,
  color: C.text,
  boxShadow: '0 2px 8px rgba(30,24,18,0.1)',
};

const sectionTitle = {
  fontSize: 11,
  fontWeight: 700,
  color: C.bronzeDark,
  marginBottom: 14,
  marginTop: 32,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  borderBottom: `1px solid ${C.border}`,
  paddingBottom: 10,
};

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getDate()}/${dt.getMonth() + 1}`;
}

export default function Dashboard() {
  const { data, loading, error } = useApi('/api/dashboard');

  if (loading) return (
    <div style={{ padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div style={{ textAlign: 'center', color: C.textMuted }}>
        <div style={{ fontSize: 13, letterSpacing: '0.08em' }}>CARGANDO...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ padding: '28px 32px', color: C.bronzeDark }}>Error: {error}</div>
  );

  const { summary, weightHistory, caloriesHistory, activeGoals, recentWorkouts, streaks } = data;
  const workoutStreak = streaks?.find(s => s.habit_type === 'entrenamiento');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, background: C.pageBg, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 800, color: C.text,
          letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0, marginBottom: 4,
        }}>Panel</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ height: 2, width: 32, background: C.bronze, borderRadius: 2 }} />
          <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard icon="🔥" label="Racha entrenamiento"   value={`${summary.currentStreak} días`}   sub={workoutStreak ? `Récord: ${workoutStreak.longest_streak} días` : undefined} color={C.bronzeDark} />
        <StatCard icon="🍽️" label="Calorías hoy"          value={summary.caloriesHoy > 0 ? `${summary.caloriesHoy} kcal` : '—'} sub="Objetivo: 2000 kcal" color={C.bronze} />
        <StatCard icon="💪" label="Entrenos esta semana"   value={summary.workoutsThisWeek}           sub="Últimos 7 días"       color={C.bronzeDark} />
        <StatCard icon="⚖️" label="Peso actual"            value={summary.currentWeight ? `${summary.currentWeight} kg` : '—'}  sub="Último registro"   color={C.bronze} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginTop: 32 }}>

        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.bronzeDark, marginBottom: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Evolución del peso — 30 días
          </div>
          {weightHistory && weightHistory.length > 1 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={weightHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.textMuted }} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${v} kg`, 'Peso']} labelFormatter={(l) => `Fecha: ${l}`} contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="weight_kg" stroke={C.bronzeDark} strokeWidth={2.5} dot={{ r: 2, fill: C.bronzeDark, strokeWidth: 0 }} activeDot={{ r: 4, fill: C.bronze, stroke: C.cardBg, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: 13 }}>Sin datos de peso aún</div>
          )}
        </div>

        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.bronzeDark, marginBottom: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Calorías — últimos 7 días
          </div>
          {caloriesHistory && caloriesHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={caloriesHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${v} kcal`, 'Calorías']} labelFormatter={(l) => `Fecha: ${l}`} contentStyle={tooltipStyle} />
                <Bar dataKey="calories" fill={C.bronze} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: 13 }}>Sin datos de calorías aún</div>
          )}
        </div>
      </div>

      {/* Active goals */}
      <div style={sectionTitle}>Objetivos activos</div>
      {activeGoals && activeGoals.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {activeGoals.map(goal => (
            <div key={goal.id} style={{ ...card, borderLeft: `3px solid ${C.bronze}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{goal.name}</div>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: C.bronzeDark,
                  background: '#f5f0e8', padding: '2px 8px', borderRadius: 99,
                  border: `1px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{goal.category}</span>
              </div>
              {goal.description && (
                <div style={{ fontSize: 12, color: C.textSub, marginBottom: 10 }}>{goal.description}</div>
              )}
              <ProgressBar value={goal.current_value || 0} max={goal.target_value || 1} showLabel />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: C.textMuted }}>
                <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
                {goal.deadline && <span>⏰ {new Date(goal.deadline).toLocaleDateString('es-ES')}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ ...card, textAlign: 'center', color: C.textMuted, padding: 32 }}>
          Sin objetivos activos. ¡Crea uno en la sección de Objetivos!
        </div>
      )}

      {/* Recent activity + streaks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginTop: 32 }}>

        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.bronzeDark, marginBottom: 16, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>
            Últimos entrenamientos
          </div>
          {recentWorkouts && recentWorkouts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentWorkouts.map(w => (
                <div key={w.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', background: '#faf6f0',
                  borderRadius: 6, borderLeft: `3px solid ${C.bronze}`,
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 6,
                    background: '#f5f0e8', border: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0,
                  }}>💪</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{w.type}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{w.duration_min} min · Intensidad {w.intensity}/5</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, flexShrink: 0 }}>
                    {new Date(w.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: C.textMuted, padding: 20 }}>Sin entrenamientos recientes</div>
          )}
        </div>

        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.bronzeDark, marginBottom: 16, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>
            Rachas actuales
          </div>
          {streaks && streaks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {streaks.map(s => {
                const icons  = { entrenamiento: '💪', dieta: '🌿', agua: '🌊' };
                const labels = { entrenamiento: 'Entrenamiento', dieta: 'Dieta', agua: 'Hidratación' };
                return (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', background: '#faf6f0',
                    borderRadius: 6, border: `1px solid ${C.border}`,
                    borderLeft: `3px solid ${C.bronze}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{icons[s.habit_type] || '🏆'}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{labels[s.habit_type] || s.habit_type}</div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>Récord: {s.longest_streak} días</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: C.bronzeDark, fontVariantNumeric: 'tabular-nums' }}>{s.current_streak}</div>
                      <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>días</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: C.textMuted, padding: 20 }}>Sin rachas registradas</div>
          )}
        </div>
      </div>
    </div>
  );
}
