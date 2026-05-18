import React from 'react';
import { useApi } from '../hooks/useApi.js';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const pageStyle = { padding: '28px 32px', maxWidth: 1200 };
const card = { background: '#ffffff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
}

function StatBox({ label, value, unit, sub, color = '#2563eb' }) {
  return (
    <div style={{
      background: '#ffffff', borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 8 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color }}>
        {value}
        {unit && <span style={{ fontSize: 16, fontWeight: 500, color: '#6b7280', marginLeft: 4 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function Progreso() {
  const { data: metrics, loading: metricsLoading } = useApi('/api/body-metrics');
  const { data: dietLogs, loading: dietLoading } = useApi('/api/diet-logs');
  const { data: workouts, loading: workoutsLoading } = useApi('/api/workouts');
  const { data: streaks, loading: streaksLoading } = useApi('/api/streaks');

  const loading = metricsLoading || dietLoading || workoutsLoading || streaksLoading;

  // Weight last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const weightData = metrics
    ? [...metrics]
        .filter(m => m.weight_kg && new Date(m.date) >= ninetyDaysAgo)
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  // Calories last 28 days (4 weeks)
  const twentyEightDaysAgo = new Date();
  twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);
  const caloriesData = dietLogs
    ? [...dietLogs]
        .filter(d => new Date(d.date) >= twentyEightDaysAgo)
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  // Workouts per week (last 8 weeks)
  const workoutsPerWeek = [];
  if (workouts) {
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (w + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - w * 7);
      const count = workouts.filter(wo => {
        const d = new Date(wo.date);
        return d >= weekStart && d < weekEnd;
      }).length;
      const label = `Sem ${8 - w}`;
      workoutsPerWeek.push({ week: label, count });
    }
  }

  // Stats
  const avgCalories = caloriesData.length > 0
    ? Math.round(caloriesData.reduce((sum, d) => sum + (d.calories || 0), 0) / caloriesData.length)
    : 0;

  const totalWorkoutsMonth = workouts
    ? workouts.filter(w => {
        const d = new Date(w.date);
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        return d >= monthAgo;
      }).length
    : 0;

  const avgWorkoutsPerWeek = totalWorkoutsMonth > 0 ? (totalWorkoutsMonth / 4).toFixed(1) : '0';

  const weightChange = weightData.length >= 2
    ? (weightData[weightData.length - 1].weight_kg - weightData[0].weight_kg).toFixed(1)
    : null;

  const streakLabels = { entrenamiento: '💪 Entrenamiento', dieta: '🥗 Dieta', agua: '💧 Hidratación' };

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a202c' }}>Progreso</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Analiza tu evolución a largo plazo</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#9ca3af', padding: 60 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
          <div>Cargando estadísticas...</div>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatBox
              label="Promedio calorías"
              value={avgCalories}
              unit="kcal"
              sub="Últimas 4 semanas"
              color="#10b981"
            />
            <StatBox
              label="Entrenos / semana"
              value={avgWorkoutsPerWeek}
              sub="Media último mes"
              color="#2563eb"
            />
            <StatBox
              label="Total entrenos (mes)"
              value={totalWorkoutsMonth}
              sub="Últimos 30 días"
              color="#8b5cf6"
            />
            {weightChange !== null && (
              <StatBox
                label="Cambio de peso"
                value={`${weightChange > 0 ? '+' : ''}${weightChange}`}
                unit="kg"
                sub="Últimos 90 días"
                color={parseFloat(weightChange) <= 0 ? '#10b981' : '#ef4444'}
              />
            )}
          </div>

          {/* Weight chart - 90 days */}
          <div style={{ ...card, marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#1a202c' }}>
              ⚖️ Evolución del peso — últimos 90 días
            </div>
            {weightData.length > 1 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={weightData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                  <Tooltip
                    formatter={(v) => [`${v} kg`, 'Peso']}
                    labelFormatter={l => `Fecha: ${l}`}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="weight_kg" stroke="#8b5cf6" strokeWidth={2.5}
                    fill="url(#weightGrad)" dot={{ r: 3, fill: '#8b5cf6' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                Necesitas al menos 2 registros de peso para ver la gráfica
              </div>
            )}
          </div>

          {/* Calories chart - 28 days */}
          <div style={{ ...card, marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#1a202c' }}>
              🍽️ Calorías — últimas 4 semanas
            </div>
            {caloriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={caloriesData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} interval={2} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v) => [`${v} kcal`, 'Calorías']}
                    labelFormatter={l => `Fecha: ${l}`}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="calories" fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                Sin datos de calorías en las últimas 4 semanas
              </div>
            )}
          </div>

          {/* Workouts per week */}
          <div style={{ ...card, marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#1a202c' }}>
              💪 Entrenamientos por semana — últimas 8 semanas
            </div>
            {workoutsPerWeek.some(w => w.count > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={workoutsPerWeek} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(v) => [v, 'Entrenamientos']}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                Sin entrenamientos registrados en las últimas 8 semanas
              </div>
            )}
          </div>

          {/* Streaks */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#1a202c' }}>
              🔥 Resumen de rachas
            </div>
            {streaks && streaks.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {streaks.map(s => (
                  <div key={s.id} style={{
                    padding: 20, background: '#f8f9fa', borderRadius: 12,
                    display: 'flex', flexDirection: 'column', gap: 12,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                      {streakLabels[s.habit_type] || s.habit_type}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>RACHA ACTUAL</div>
                        <div style={{ fontSize: 30, fontWeight: 800, color: '#f59e0b' }}>{s.current_streak}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>días</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>RÉCORD</div>
                        <div style={{ fontSize: 30, fontWeight: 800, color: '#2563eb' }}>{s.longest_streak}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>días</div>
                      </div>
                    </div>
                    {s.last_recorded_date && (
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>
                        Último registro: {new Date(s.last_recorded_date).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>Sin datos de rachas</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
