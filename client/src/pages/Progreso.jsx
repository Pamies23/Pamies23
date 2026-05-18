import React from 'react';
import { useApi } from '../hooks/useApi.js';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const pageStyle = { padding: '28px 32px', maxWidth: 1200, background: '#0f0f1a', minHeight: '100vh' };

const card = {
  background: '#1a1a2e',
  borderRadius: 14,
  padding: 24,
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

const statBoxAccents = ['#7c3aed', '#2563eb', '#ec4899', '#10b981', '#f59e0b'];

function StatBox({ label, value, unit, sub, color = '#7c3aed', idx = 0 }) {
  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: 14,
      padding: '22px 24px',
      border: '1px solid rgba(255,255,255,0.06)',
      borderTop: `3px solid ${color}`,
      boxShadow: `0 0 20px ${color}18, 0 4px 16px rgba(0,0,0,0.3)`,
      textAlign: 'center',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 0 30px ${color}30, 0 8px 24px rgba(0,0,0,0.4)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 0 20px ${color}18, 0 4px 16px rgba(0,0,0,0.3)`; }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', marginBottom: 10, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, color, lineHeight: 1 }}>
        {value}
        {unit && <span style={{ fontSize: 16, fontWeight: 600, color: '#64748b', marginLeft: 4 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>{sub}</div>}
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
  const streakColors = { entrenamiento: '#ec4899', dieta: '#10b981', agua: '#2563eb' };

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800,
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em',
        }}>Progreso</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>Analiza tu evolución a largo plazo</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: 80 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>Cargando estadísticas...</div>
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
              idx={0}
            />
            <StatBox
              label="Entrenos / semana"
              value={avgWorkoutsPerWeek}
              sub="Media último mes"
              color="#2563eb"
              idx={1}
            />
            <StatBox
              label="Total entrenos (mes)"
              value={totalWorkoutsMonth}
              sub="Últimos 30 días"
              color="#7c3aed"
              idx={2}
            />
            {weightChange !== null && (
              <StatBox
                label="Cambio de peso"
                value={`${weightChange > 0 ? '+' : ''}${weightChange}`}
                unit="kg"
                sub="Últimos 90 días"
                color={parseFloat(weightChange) <= 0 ? '#10b981' : '#f87171'}
                idx={3}
              />
            )}
          </div>

          {/* Weight chart - 90 days */}
          <div style={{ ...card, marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚖️ Evolución del peso
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b', fontWeight: 500 }}>últimos 90 días</span>
            </div>
            {weightData.length > 1 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={weightData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#64748b' }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => [`${v} kg`, 'Peso']}
                    labelFormatter={l => `Fecha: ${l}`}
                    contentStyle={darkTooltipStyle}
                    labelStyle={{ color: '#94a3b8' }}
                    itemStyle={{ color: '#a78bfa' }}
                  />
                  <Area type="monotone" dataKey="weight_kg" stroke="#7c3aed" strokeWidth={2.5}
                    fill="url(#weightAreaGrad)"
                    dot={{ r: 3, fill: '#7c3aed', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#a78bfa', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 14 }}>
                Necesitas al menos 2 registros de peso para ver la gráfica
              </div>
            )}
          </div>

          {/* Calories chart - 28 days */}
          <div style={{ ...card, marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
              🍽️ Calorías
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b', fontWeight: 500 }}>últimas 4 semanas</span>
            </div>
            {caloriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={caloriesData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#64748b' }} interval={2} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => [`${v} kcal`, 'Calorías']}
                    labelFormatter={l => `Fecha: ${l}`}
                    contentStyle={{ ...darkTooltipStyle, border: '1px solid rgba(245,158,11,0.3)' }}
                    labelStyle={{ color: '#94a3b8' }}
                    itemStyle={{ color: '#fbbf24' }}
                  />
                  <defs>
                    <linearGradient id="calProgressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="calories" fill="url(#calProgressGrad)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 14 }}>
                Sin datos de calorías en las últimas 4 semanas
              </div>
            )}
          </div>

          {/* Workouts per week */}
          <div style={{ ...card, marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
              💪 Entrenamientos por semana
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b', fontWeight: 500 }}>últimas 8 semanas</span>
            </div>
            {workoutsPerWeek.some(w => w.count > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={workoutsPerWeek} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => [v, 'Entrenamientos']}
                    contentStyle={{ ...darkTooltipStyle, border: '1px solid rgba(37,99,235,0.3)' }}
                    labelStyle={{ color: '#94a3b8' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <defs>
                    <linearGradient id="workoutsBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="count" fill="url(#workoutsBarGrad)" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 14 }}>
                Sin entrenamientos registrados en las últimas 8 semanas
              </div>
            )}
          </div>

          {/* Streaks */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#f1f5f9' }}>
              🔥 Resumen de rachas
            </div>
            {streaks && streaks.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {streaks.map(s => {
                  const color = streakColors[s.habit_type] || '#ec4899';
                  return (
                    <div key={s.id} style={{
                      padding: 20,
                      background: `linear-gradient(135deg, ${color}10, ${color}06)`,
                      borderRadius: 14,
                      border: `1px solid ${color}25`,
                      borderTop: `3px solid ${color}`,
                      display: 'flex', flexDirection: 'column', gap: 14,
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>
                        {streakLabels[s.habit_type] || s.habit_type}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>RACHA ACTUAL</div>
                          <div style={{ fontSize: 36, fontWeight: 800, color, lineHeight: 1 }}>{s.current_streak}</div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>días</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>RÉCORD</div>
                          <div style={{ fontSize: 36, fontWeight: 800, color: '#60a5fa', lineHeight: 1 }}>{s.longest_streak}</div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>días</div>
                        </div>
                      </div>
                      {s.last_recorded_date && (
                        <div style={{ fontSize: 12, color: '#475569', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          Último registro: {new Date(s.last_recorded_date).toLocaleDateString('es-ES')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#475569', padding: 32, fontSize: 14 }}>Sin datos de rachas</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
