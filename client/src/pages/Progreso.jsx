import React from 'react';
import { useApi } from '../hooks/useApi.js';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

// Alexander palette v2
// Background: warm dirty white. Sidebar/structural: sandy bronze.
// Charts/accents: vivid Mediterranean — sea blue + vegetation green.
const C = {
  pageBg:      '#eddfc8',   // light sand — sidebar color lightened
  cardBg:      '#ffffff',   // white cards so charts pop
  cardBgAlt:   '#f9f9f7',
  border:      '#ddd0b8',
  sandy:       '#b8956a',
  sandyDark:   '#8a6a3a',
  sandyLight:  '#d4b896',
  sandyFaint:  'rgba(184,149,106,0.12)',
  blue1:       '#0077e6',   // vivid electric blue
  blue2:       '#00aaff',   // bright sky blue
  green1:      '#00b84a',   // vivid grass green
  green2:      '#22dd77',   // bright lime green
  teal:        '#00c4aa',   // Mediterranean teal
  terracotta:  '#e05520',   // bright terracotta
  textPrimary: '#1e1812',
  textSecondary:'#6b5a40',
  textMuted:   '#a0907a',
  gridLine:    'rgba(0,0,0,0.05)',
};

const card = {
  background: C.cardBg,
  borderRadius: 8,
  padding: 24,
  boxShadow: '0 1px 3px rgba(30,24,18,0.07), 0 4px 12px rgba(30,24,18,0.04)',
  border: `1px solid ${C.border}`,
};

const tooltipStyle = {
  background: C.cardBg,
  border: `1px solid ${C.sandyLight}`,
  borderRadius: 4,
  fontSize: 12,
  color: C.textPrimary,
  boxShadow: '0 2px 8px rgba(30,24,18,0.1)',
};

const sectionTitle = {
  fontWeight: 700,
  fontSize: 11,
  marginBottom: 20,
  color: C.sandyDark,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  borderBottom: `1px solid ${C.border}`,
  paddingBottom: 10,
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function StatBox({ label, value, unit, sub, accent = C.sandy }) {
  return (
    <div style={{
      background: C.cardBg,
      borderRadius: 8,
      padding: '18px 20px',
      boxShadow: '0 1px 3px rgba(30,24,18,0.06)',
      border: `1px solid ${C.border}`,
      borderTop: `3px solid ${accent}`,
    }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: C.textMuted,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 32,
        fontWeight: 800,
        color: accent,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
        {unit && (
          <span style={{ fontSize: 13, fontWeight: 500, color: C.textMuted, marginLeft: 4 }}>{unit}</span>
        )}
      </div>
      {sub && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

const streakMeta = {
  entrenamiento: { color: C.blue1,  label: '⚔️ Entrenamiento' },
  dieta:         { color: C.green1, label: '🌿 Dieta' },
  agua:          { color: C.teal,   label: '🌊 Hidratación' },
};

export default function Progreso() {
  const { data: metrics,  loading: l1 } = useApi('/api/body-metrics');
  const { data: dietLogs, loading: l2 } = useApi('/api/diet-logs');
  const { data: workouts, loading: l3 } = useApi('/api/workouts');
  const { data: streaks,  loading: l4 } = useApi('/api/streaks');

  const loading = l1 || l2 || l3 || l4;

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const weightData = metrics
    ? [...metrics]
        .filter(m => m.weight_kg && new Date(m.date) >= ninetyDaysAgo)
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  const twentyEightDaysAgo = new Date();
  twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);
  const caloriesData = dietLogs
    ? [...dietLogs]
        .filter(d => new Date(d.date) >= twentyEightDaysAgo)
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  const workoutsPerWeek = [];
  if (workouts) {
    for (let w = 7; w >= 0; w--) {
      const s = new Date(); s.setDate(s.getDate() - (w + 1) * 7);
      const e = new Date(); e.setDate(e.getDate() - w * 7);
      const count = workouts.filter(wo => { const d = new Date(wo.date); return d >= s && d < e; }).length;
      workoutsPerWeek.push({ week: `Sem ${8 - w}`, count });
    }
  }

  const avgCalories = caloriesData.length > 0
    ? Math.round(caloriesData.reduce((s, d) => s + (d.calories || 0), 0) / caloriesData.length)
    : 0;

  const totalWorkoutsMonth = workouts
    ? workouts.filter(w => { const d = new Date(w.date); const ago = new Date(); ago.setDate(ago.getDate() - 30); return d >= ago; }).length
    : 0;

  const avgWorkoutsPerWeek = totalWorkoutsMonth > 0 ? (totalWorkoutsMonth / 4).toFixed(1) : '0';

  const weightChange = weightData.length >= 2
    ? (weightData[weightData.length - 1].weight_kg - weightData[0].weight_kg).toFixed(1)
    : null;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, background: C.pageBg, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 22,
          fontWeight: 800,
          color: C.textPrimary,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          margin: 0,
          marginBottom: 4,
        }}>
          Progreso
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ height: 2, width: 32, background: C.sandy, borderRadius: 2 }} />
          <p style={{ color: C.textMuted, fontSize: 13, margin: 0, letterSpacing: '0.03em' }}>
            Evolución y estadísticas a largo plazo
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: C.textMuted, padding: 80 }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>—</div>
          <div style={{ fontSize: 13, letterSpacing: '0.06em' }}>Cargando...</div>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 14,
            marginBottom: 28,
          }}>
            <StatBox label="Promedio calorías" value={avgCalories} unit="kcal" sub="Últimas 4 semanas" accent={C.terracotta} />
            <StatBox label="Entrenos / semana"  value={avgWorkoutsPerWeek} sub="Media último mes"   accent={C.blue1} />
            <StatBox label="Entrenos este mes"  value={totalWorkoutsMonth} sub="Últimos 30 días"    accent={C.green1} />
            {weightChange !== null && (
              <StatBox
                label="Cambio de peso"
                value={`${weightChange > 0 ? '+' : ''}${weightChange}`}
                unit="kg"
                sub="Últimos 90 días"
                accent={parseFloat(weightChange) <= 0 ? C.green1 : C.terracotta}
              />
            )}
          </div>

          {/* Weight — area chart, sea blue line */}
          <div style={{ ...card, marginBottom: 20 }}>
            <div style={sectionTitle}>Peso corporal — últimos 90 días</div>
            {weightData.length > 1 ? (
              <ResponsiveContainer width="100%" height={270}>
                <AreaChart data={weightData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGradAlex2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.blue1} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={C.blue1} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} />
                  <XAxis
                    dataKey="date" tickFormatter={formatDate}
                    tick={{ fontSize: 11, fill: C.textMuted }}
                    axisLine={{ stroke: C.border }} tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: C.textMuted }}
                    axisLine={false} tickLine={false} domain={['auto', 'auto']}
                  />
                  <Tooltip
                    formatter={(v) => [`${v} kg`, 'Peso']}
                    labelFormatter={l => `Fecha: ${l}`}
                    contentStyle={tooltipStyle}
                  />
                  <Area
                    type="monotone" dataKey="weight_kg"
                    stroke={C.blue1} strokeWidth={2.5}
                    fill="url(#weightGradAlex2)"
                    dot={{ r: 2.5, fill: C.blue1, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: C.blue1, stroke: C.cardBg, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted }}>
                Necesitas al menos 2 registros de peso para ver la gráfica
              </div>
            )}
          </div>

          {/* Calories + Workouts side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Calories — terracotta bars */}
            <div style={card}>
              <div style={sectionTitle}>Calorías — últimas 4 semanas</div>
              {caloriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={caloriesData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} />
                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} interval={3} />
                    <YAxis tick={{ fontSize: 10, fill: C.textMuted }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [`${v} kcal`, 'Calorías']} labelFormatter={l => `Fecha: ${l}`} contentStyle={tooltipStyle} />
                    <Bar dataKey="calories" fill={C.terracotta} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: 13 }}>
                  Sin datos en las últimas 4 semanas
                </div>
              )}
            </div>

            {/* Workouts — vegetation green bars */}
            <div style={card}>
              <div style={sectionTitle}>Entrenamientos por semana</div>
              {workoutsPerWeek.some(w => w.count > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={workoutsPerWeek} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: C.textMuted }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip formatter={(v) => [v, 'Entrenamientos']} contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill={C.green1} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: 13 }}>
                  Sin entrenamientos registrados
                </div>
              )}
            </div>
          </div>

          {/* Streaks */}
          <div style={card}>
            <div style={sectionTitle}>Rachas</div>
            {streaks && streaks.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
                {streaks.map(s => {
                  const meta = streakMeta[s.habit_type] || { color: C.sandy, label: s.habit_type };
                  return (
                    <div key={s.id} style={{
                      padding: '20px 22px',
                      background: C.cardBg,
                      borderRadius: 6,
                      border: `1px solid ${C.border}`,
                      borderLeft: `3px solid ${meta.color}`,
                    }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: 12,
                        color: meta.color,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        marginBottom: 14,
                      }}>
                        {meta.label}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                            Racha actual
                          </div>
                          <div style={{ fontSize: 38, fontWeight: 800, color: meta.color, lineHeight: 1 }}>
                            {s.current_streak}
                          </div>
                          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>días</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                            Récord
                          </div>
                          <div style={{ fontSize: 28, fontWeight: 700, color: C.textSecondary, lineHeight: 1 }}>
                            {s.longest_streak}
                          </div>
                          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>días</div>
                        </div>
                      </div>
                      {s.last_recorded_date && (
                        <div style={{
                          fontSize: 11, color: C.textMuted, marginTop: 14,
                          borderTop: `1px solid ${C.border}`, paddingTop: 10,
                        }}>
                          Último registro: {new Date(s.last_recorded_date).toLocaleDateString('es-ES')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: C.textMuted, padding: 24 }}>Sin datos de rachas</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
