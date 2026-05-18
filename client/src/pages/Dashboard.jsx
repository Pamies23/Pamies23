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
};

const sectionTitle = {
  fontSize: 18,
  fontWeight: 700,
  color: '#1a202c',
  marginBottom: 16,
  marginTop: 32,
};

const card = {
  background: '#ffffff',
  borderRadius: 12,
  padding: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function categoryBadge(cat) {
  const map = {
    ejercicio: { bg: '#dbeafe', color: '#1d4ed8', label: 'Ejercicio' },
    dieta: { bg: '#d1fae5', color: '#065f46', label: 'Dieta' },
    general: { bg: '#fef3c7', color: '#92400e', label: 'General' },
  };
  const s = map[cat] || map.general;
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 600,
      padding: '2px 8px', borderRadius: 99,
    }}>{s.label}</span>
  );
}

function statusBadge(status) {
  const map = {
    activo: { bg: '#d1fae5', color: '#065f46', label: 'Activo' },
    completado: { bg: '#dbeafe', color: '#1d4ed8', label: 'Completado' },
    pausado: { bg: '#fef3c7', color: '#92400e', label: 'Pausado' },
  };
  const s = map[status] || map.activo;
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 600,
      padding: '2px 8px', borderRadius: 99,
    }}>{s.label}</span>
  );
}

const intensityLabels = ['', 'Muy baja', 'Baja', 'Media', 'Alta', 'Máxima'];

export default function Dashboard() {
  const { data, loading, error } = useApi('/api/dashboard');

  if (loading) return (
    <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div style={{ textAlign: 'center', color: '#6b7280' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
        <div>Cargando datos...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ ...pageStyle, color: '#ef4444' }}>Error: {error}</div>
  );

  const { summary, weightHistory, caloriesHistory, activeGoals, recentWorkouts, recentDietLogs, streaks } = data;

  const workoutStreak = streaks?.find(s => s.habit_type === 'entrenamiento');
  const dietStreak = streaks?.find(s => s.habit_type === 'dieta');

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a202c' }}>Panel de Control</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
        <StatCard
          icon="🔥"
          label="Racha de entrenamiento"
          value={`${summary.currentStreak} días`}
          sub={workoutStreak ? `Récord: ${workoutStreak.longest_streak} días` : undefined}
          color="#f59e0b"
        />
        <StatCard
          icon="🍽️"
          label="Calorías hoy"
          value={summary.caloriesHoy > 0 ? `${summary.caloriesHoy} kcal` : '—'}
          sub="Objetivo: 2000 kcal"
          color="#10b981"
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
          color="#8b5cf6"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginTop: 32 }}>
        {/* Weight chart */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a202c', marginBottom: 16 }}>
            ⚖️ Evolución del peso (30 días)
          </div>
          {weightHistory && weightHistory.length > 1 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={weightHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip
                  formatter={(v) => [`${v} kg`, 'Peso']}
                  labelFormatter={(l) => `Fecha: ${l}`}
                  contentStyle={{ fontSize: 12 }}
                />
                <Line type="monotone" dataKey="weight_kg" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
              Sin datos de peso aún
            </div>
          )}
        </div>

        {/* Calories chart */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a202c', marginBottom: 16 }}>
            🍽️ Calorías últimos 7 días
          </div>
          {caloriesHistory && caloriesHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={caloriesHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => [`${v} kcal`, 'Calorías']}
                  labelFormatter={(l) => `Fecha: ${l}`}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="calories" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
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
              <div key={goal.id} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1a202c' }}>{goal.name}</div>
                  {categoryBadge(goal.category)}
                </div>
                {goal.description && (
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{goal.description}</div>
                )}
                <ProgressBar value={goal.current_value || 0} max={goal.target_value || 1} showLabel />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#6b7280' }}>
                  <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
                  {goal.deadline && <span>⏰ {new Date(goal.deadline).toLocaleDateString('es-ES')}</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ ...card, textAlign: 'center', color: '#9ca3af', padding: 32 }}>
          Sin objetivos activos. ¡Crea uno en la sección de Objetivos!
        </div>
      )}

      {/* Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginTop: 32 }}>
        {/* Recent workouts */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a202c', marginBottom: 16 }}>
            💪 Últimos entrenamientos
          </div>
          {recentWorkouts && recentWorkouts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentWorkouts.map(w => (
                <div key={w.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', background: '#f8f9fa', borderRadius: 8,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: '#dbeafe',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                  }}>💪</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1a202c' }}>{w.type}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {w.duration_min} min · Intensidad: {w.intensity}/5
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>
                    {new Date(w.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>Sin entrenamientos recientes</div>
          )}
        </div>

        {/* Streaks */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a202c', marginBottom: 16 }}>
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
                    padding: '12px 14px', background: '#f8f9fa', borderRadius: 8,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{icons[s.habit_type] || '🏆'}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{labels[s.habit_type] || s.habit_type}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>Récord: {s.longest_streak} días</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{s.current_streak}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>días</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>Sin rachas registradas</div>
          )}
        </div>
      </div>
    </div>
  );
}
