import React from 'react';
import { useApi } from '../hooks/useApi.js';
import StatCard from '../components/StatCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const pageStyle = {
  padding: '28px 32px',
  maxWidth: 1200,
  minHeight: '100vh',
  background: '#0f0f1a',
};

const sectionTitle = {
  fontSize: 18,
  fontWeight: 700,
  color: '#f1f5f9',
  marginBottom: 16,
  marginTop: 32,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const card = {
  background: '#1a1a2e',
  borderRadius: 14,
  padding: 20,
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 0 20px rgba(124, 58, 237, 0.1), 0 4px 16px rgba(0,0,0,0.3)',
};

const darkTooltipStyle = {
  background: '#12122a',
  border: '1px solid rgba(124,58,237,0.3)',
  borderRadius: 10,
  fontSize: 12,
  color: '#f1f5f9',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function categoryBadge(cat) {
  const map = {
    ejercicio: { bg: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: 'rgba(124,58,237,0.4)', label: 'Ejercicio' },
    dieta: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.35)', label: 'Dieta' },
    general: { bg: 'rgba(37,99,235,0.18)', color: '#60a5fa', border: 'rgba(37,99,235,0.4)', label: 'General' },
  };
  const s = map[cat] || map.general;
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
      padding: '3px 10px', borderRadius: 99, border: `1px solid ${s.border}`,
      letterSpacing: '0.04em',
    }}>{s.label}</span>
  );
}

export default function Dashboard() {
  const { data, loading, error } = useApi('/api/dashboard');

  if (loading) return (
    <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12, animation: 'spin 1s linear infinite' }}>⏳</div>
        <div style={{ color: '#94a3b8', fontSize: 15, fontWeight: 500 }}>Cargando datos...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ ...pageStyle, color: '#f87171' }}>Error: {error}</div>
  );

  const { summary, weightHistory, caloriesHistory, activeGoals, recentWorkouts, recentDietLogs, streaks } = data;

  const workoutStreak = streaks?.find(s => s.habit_type === 'entrenamiento');
  const dietStreak = streaks?.find(s => s.habit_type === 'dieta');

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800,
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em',
        }}>
          Panel de Control
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 6, fontWeight: 500 }}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 28 }}>
        <StatCard
          icon="🔥"
          label="Racha de entrenamiento"
          value={`${summary.currentStreak} días`}
          sub={workoutStreak ? `Récord: ${workoutStreak.longest_streak} días` : undefined}
          color="#ec4899"
        />
        <StatCard
          icon="🍽️"
          label="Calorías hoy"
          value={summary.caloriesHoy > 0 ? `${summary.caloriesHoy} kcal` : '—'}
          sub="Objetivo: 2000 kcal"
          color="#f59e0b"
        />
        <StatCard
          icon="💪"
          label="Entrenamientos esta semana"
          value={summary.workoutsThisWeek}
          sub="Últimos 7 días"
          color="#2563eb"
        />
        <StatCard
          icon="⚖️"
          label="Peso actual"
          value={summary.currentWeight ? `${summary.currentWeight} kg` : '—'}
          sub="Último registro"
          color="#7c3aed"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginTop: 32 }}>
        {/* Weight chart */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚖️</span> <span>Evolución del peso</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b', fontWeight: 500 }}>30 días</span>
          </div>
          {weightHistory && weightHistory.length > 1 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={weightHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`${v} kg`, 'Peso']}
                  labelFormatter={(l) => `Fecha: ${l}`}
                  contentStyle={darkTooltipStyle}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Line type="monotone" dataKey="weight_kg" stroke="#7c3aed" strokeWidth={2.5} dot={false}
                  activeDot={{ r: 5, fill: '#7c3aed', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 13 }}>
              Sin datos de peso aún
            </div>
          )}
        </div>

        {/* Calories chart */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🍽️</span> <span>Calorías</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b', fontWeight: 500 }}>7 días</span>
          </div>
          {caloriesHistory && caloriesHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={caloriesHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`${v} kcal`, 'Calorías']}
                  labelFormatter={(l) => `Fecha: ${l}`}
                  contentStyle={darkTooltipStyle}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#34d399' }}
                />
                <Bar dataKey="calories" fill="url(#caloriesGrad)" radius={[5, 5, 0, 0]} />
                <defs>
                  <linearGradient id="caloriesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 13 }}>
              Sin datos de calorías aún
            </div>
          )}
        </div>
      </div>

      {/* Active goals */}
      <div style={sectionTitle}>🎯 Objetivos activos</div>
      {activeGoals && activeGoals.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {activeGoals.map(goal => {
            const pct = goal.target_value > 0 ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100)) : 0;
            return (
              <div key={goal.id} style={{
                ...card,
                borderLeft: '3px solid #7c3aed',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{goal.name}</div>
                  {categoryBadge(goal.category)}
                </div>
                {goal.description && (
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{goal.description}</div>
                )}
                <ProgressBar value={goal.current_value || 0} max={goal.target_value || 1} showLabel />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: '#64748b' }}>
                  <span style={{ color: '#94a3b8' }}>{goal.current_value} / {goal.target_value} {goal.unit}</span>
                  {goal.deadline && <span style={{ color: '#7c3aed' }}>⏰ {new Date(goal.deadline).toLocaleDateString('es-ES')}</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ ...card, textAlign: 'center', color: '#475569', padding: 40, fontSize: 14 }}>
          Sin objetivos activos. ¡Crea uno en la sección de Objetivos!
        </div>
      )}

      {/* Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginTop: 32 }}>
        {/* Recent workouts */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            💪 Últimos entrenamientos
          </div>
          {recentWorkouts && recentWorkouts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentWorkouts.map((w, idx) => {
                const borderColors = ['#7c3aed', '#2563eb', '#ec4899', '#10b981', '#f59e0b'];
                const bc = borderColors[idx % borderColors.length];
                return (
                  <div key={w.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px',
                    background: '#151525',
                    borderRadius: 10,
                    borderLeft: `3px solid ${bc}`,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: `${bc}22`,
                      border: `1px solid ${bc}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                    }}>💪</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>{w.type}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {w.duration_min} min · Intensidad: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{w.intensity}/5</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', flexShrink: 0 }}>
                      {new Date(w.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#475569', padding: 20, fontSize: 13 }}>Sin entrenamientos recientes</div>
          )}
        </div>

        {/* Streaks */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            🔥 Rachas actuales
          </div>
          {streaks && streaks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {streaks.map(s => {
                const icons = { entrenamiento: '💪', dieta: '🥗', agua: '💧' };
                const labels = { entrenamiento: 'Entrenamiento', dieta: 'Dieta', agua: 'Hidratación' };
                return (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(124,58,237,0.1))',
                    borderRadius: 12,
                    border: '1px solid rgba(236,72,153,0.15)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 22 }}>{icons[s.habit_type] || '🏆'}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>{labels[s.habit_type] || s.habit_type}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Récord: <span style={{ color: '#60a5fa', fontWeight: 600 }}>{s.longest_streak} días</span></div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#ec4899', lineHeight: 1 }}>{s.current_streak}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>días</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#475569', padding: 20, fontSize: 13 }}>Sin rachas registradas</div>
          )}
        </div>
      </div>
    </div>
  );
}
