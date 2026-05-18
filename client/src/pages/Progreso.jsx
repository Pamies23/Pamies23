import React from 'react';
import { useApi } from '../hooks/useApi.js';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

// Alexander (2004) palette — cool marble, Macedonian purple, stone
const C = {
  pageBg:       '#ededea',       // cool limestone floor
  marble:       '#f8f7f5',       // white marble
  marbleDeep:   '#eeede9',       // veined marble
  border:       '#cbc8c0',       // stone grout
  borderAccent: '#9188a0',       // muted purple-stone
  purple:       '#4a3060',       // Macedonian royal purple
  purpleLight:  '#6b5280',       // lighter purple
  purpleFaint:  'rgba(74,48,96,0.08)',
  slate:        '#3a3848',       // dark stone/slate
  stoneGray:    '#7a7870',       // weathered stone
  stoneLight:   '#a09890',       // pale stone
  textPrimary:  '#1c1c24',       // dark ink on marble
  textSecondary:'#6b6860',       // faded inscription
  olive:        '#4a6040',       // macedonian olive
  sienna:       '#8a5038',       // terracotta
  blue:         '#2e5070',       // aegean sea
  gridLine:     'rgba(74,48,96,0.07)',
};

const card = {
  background: C.marble,
  borderRadius: 6,
  padding: 24,
  boxShadow: '0 1px 4px rgba(28,28,36,0.08), 0 4px 16px rgba(28,28,36,0.04)',
  border: `1px solid ${C.border}`,
};

const tooltipStyle = {
  background: C.marble,
  border: `1px solid ${C.borderAccent}`,
  borderRadius: 4,
  fontSize: 12,
  color: C.textPrimary,
  boxShadow: '0 2px 8px rgba(28,28,36,0.12)',
};

const cardTitle = {
  fontWeight: 700,
  fontSize: 15,
  marginBottom: 20,
  color: C.purple,
  fontFamily: "Georgia, 'Times New Roman', serif",
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  borderBottom: `1px solid ${C.border}`,
  paddingBottom: 10,
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function StatBox({ label, value, unit, sub, color = C.purple, accentColor }) {
  const accent = accentColor || color;
  return (
    <div style={{
      background: C.marble,
      borderRadius: 6,
      padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(28,28,36,0.08)',
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${accent}`,
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 60, height: 60,
        background: `radial-gradient(circle at top right, ${accent}18, transparent 70%)`,
      }} />
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: C.stoneGray,
        letterSpacing: '0.1em',
        marginBottom: 10,
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 34,
        fontWeight: 800,
        color: accent,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
        {unit && (
          <span style={{ fontSize: 14, fontWeight: 500, color: C.stoneGray, marginLeft: 4 }}>{unit}</span>
        )}
      </div>
      {sub && <div style={{ fontSize: 11, color: C.stoneLight, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

const streakAccents = {
  entrenamiento: { color: C.purple,  label: '⚔️ Entrenamiento' },
  dieta:         { color: C.olive,   label: '🌿 Dieta' },
  agua:          { color: C.blue,    label: '🌊 Hidratación' },
};

export default function Progreso() {
  const { data: metrics,  loading: metricsLoading }  = useApi('/api/body-metrics');
  const { data: dietLogs, loading: dietLoading }      = useApi('/api/diet-logs');
  const { data: workouts, loading: workoutsLoading }  = useApi('/api/workouts');
  const { data: streaks,  loading: streaksLoading }   = useApi('/api/streaks');

  const loading = metricsLoading || dietLoading || workoutsLoading || streaksLoading;

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
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (w + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - w * 7);
      const count = workouts.filter(wo => {
        const d = new Date(wo.date);
        return d >= weekStart && d < weekEnd;
      }).length;
      workoutsPerWeek.push({ week: `Sem ${8 - w}`, count });
    }
  }

  const avgCalories = caloriesData.length > 0
    ? Math.round(caloriesData.reduce((s, d) => s + (d.calories || 0), 0) / caloriesData.length)
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

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, background: C.pageBg, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 4 }}>
          <h1 style={{
            fontSize: 26,
            fontWeight: 800,
            color: C.slate,
            fontFamily: "Georgia, 'Times New Roman', serif",
            letterSpacing: '0.06em',
            margin: 0,
            textTransform: 'uppercase',
          }}>
            Progreso
          </h1>
          <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, ${C.purple}, transparent)` }} />
        </div>
        <p style={{ color: C.stoneGray, fontSize: 13, margin: 0, letterSpacing: '0.02em' }}>
          Evolución y estadísticas a largo plazo
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: C.stoneGray, padding: 80 }}>
          <div style={{ fontSize: 28, marginBottom: 12, color: C.purple }}>◈</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 14, letterSpacing: '0.06em' }}>
            CARGANDO...
          </div>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 16,
            marginBottom: 28,
          }}>
            <StatBox
              label="Promedio calorías"
              value={avgCalories}
              unit="kcal"
              sub="Últimas 4 semanas"
              accentColor={C.sienna}
            />
            <StatBox
              label="Entrenos / semana"
              value={avgWorkoutsPerWeek}
              sub="Media último mes"
              accentColor={C.purple}
            />
            <StatBox
              label="Entrenos este mes"
              value={totalWorkoutsMonth}
              sub="Últimos 30 días"
              accentColor={C.purpleLight}
            />
            {weightChange !== null && (
              <StatBox
                label="Cambio de peso"
                value={`${weightChange > 0 ? '+' : ''}${weightChange}`}
                unit="kg"
                sub="Últimos 90 días"
                accentColor={parseFloat(weightChange) <= 0 ? C.olive : C.sienna}
              />
            )}
          </div>

          {/* Weight chart */}
          <div style={{ ...card, marginBottom: 20 }}>
            <div style={cardTitle}>⚖ Peso corporal — 90 días</div>
            {weightData.length > 1 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={weightData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGradAlex" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.purple} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={C.purple} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11, fill: C.stoneGray }}
                    axisLine={{ stroke: C.border }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: C.stoneGray }}
                    axisLine={false}
                    tickLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    formatter={(v) => [`${v} kg`, 'Peso']}
                    labelFormatter={l => `Fecha: ${l}`}
                    contentStyle={tooltipStyle}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight_kg"
                    stroke={C.purple}
                    strokeWidth={2}
                    fill="url(#weightGradAlex)"
                    dot={{ r: 2.5, fill: C.purple, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: C.purple, stroke: C.marble, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.stoneGray }}>
                Necesitas al menos 2 registros de peso para ver la gráfica
              </div>
            )}
          </div>

          {/* Calories + Workouts side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div style={card}>
              <div style={cardTitle}>🍽 Calorías — 4 semanas</div>
              {caloriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={caloriesData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      tick={{ fontSize: 10, fill: C.stoneGray }}
                      axisLine={{ stroke: C.border }}
                      tickLine={false}
                      interval={3}
                    />
                    <YAxis tick={{ fontSize: 10, fill: C.stoneGray }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v) => [`${v} kcal`, 'Calorías']}
                      labelFormatter={l => `Fecha: ${l}`}
                      contentStyle={tooltipStyle}
                    />
                    <Bar dataKey="calories" fill={C.sienna} radius={[3, 3, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.stoneGray, fontSize: 13 }}>
                  Sin datos en las últimas 4 semanas
                </div>
              )}
            </div>

            <div style={card}>
              <div style={cardTitle}>⚔ Entrenamientos / semana</div>
              {workoutsPerWeek.some(w => w.count > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={workoutsPerWeek} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: C.stoneGray }} axisLine={{ stroke: C.border }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: C.stoneGray }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      formatter={(v) => [v, 'Entrenamientos']}
                      contentStyle={tooltipStyle}
                    />
                    <Bar dataKey="count" fill={C.purple} radius={[3, 3, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.stoneGray, fontSize: 13 }}>
                  Sin entrenamientos registrados
                </div>
              )}
            </div>
          </div>

          {/* Streaks */}
          <div style={card}>
            <div style={cardTitle}>◈ Rachas</div>
            {streaks && streaks.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
                {streaks.map(s => {
                  const meta = streakAccents[s.habit_type] || { color: C.purple, label: s.habit_type };
                  return (
                    <div key={s.id} style={{
                      padding: '20px 24px',
                      background: C.marbleDeep,
                      borderRadius: 6,
                      border: `1px solid ${C.border}`,
                      borderTop: `2px solid ${meta.color}`,
                    }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: meta.color,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        marginBottom: 16,
                        fontFamily: "Georgia, serif",
                      }}>
                        {meta.label}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: 10, color: C.stoneGray, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                            Racha actual
                          </div>
                          <div style={{ fontSize: 36, fontWeight: 800, color: meta.color, lineHeight: 1 }}>
                            {s.current_streak}
                          </div>
                          <div style={{ fontSize: 11, color: C.stoneLight, marginTop: 2 }}>días</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 10, color: C.stoneGray, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                            Récord
                          </div>
                          <div style={{ fontSize: 28, fontWeight: 700, color: C.slate, lineHeight: 1 }}>
                            {s.longest_streak}
                          </div>
                          <div style={{ fontSize: 11, color: C.stoneLight, marginTop: 2 }}>días</div>
                        </div>
                      </div>
                      {s.last_recorded_date && (
                        <div style={{ fontSize: 11, color: C.stoneLight, marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                          Último registro: {new Date(s.last_recorded_date).toLocaleDateString('es-ES')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: C.stoneGray, padding: 24 }}>Sin datos de rachas</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
