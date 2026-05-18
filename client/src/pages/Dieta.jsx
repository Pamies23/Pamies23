import React, { useState, useEffect } from 'react';
import { useApi, apiPost, apiDelete } from '../hooks/useApi.js';
import ProgressBar from '../components/ProgressBar.jsx';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { C, card, inputStyle, labelStyle, btnPrimary, tooltipStyle } from '../theme.js';

const pageStyle = { padding: '28px 32px', maxWidth: 1100, background: C.pageBg, minHeight: '100vh' };

const btnDanger = {
  background: 'none',
  color: C.textMuted,
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  padding: '4px',
};

const today = new Date().toISOString().split('T')[0];
const CALORIE_GOAL = 2000;
const WATER_GOAL = 2000;

// Each meal time gets a Mediterranean color
const mealTimeLabels = {
  desayuno: { label: 'Desayuno', icon: '🌅', color: C.bronze },
  almuerzo: { label: 'Almuerzo', icon: '☀️', color: C.bronzeDark },
  merienda: { label: 'Merienda', icon: '🍎', color: C.terracotta },
  cena:     { label: 'Cena',     icon: '🌙', color: C.aegean },
  snack:    { label: 'Snack',    icon: '🍿', color: C.cypress },
};

const cardTitle = {
  fontWeight: 700,
  fontSize: 11,
  marginBottom: 16,
  color: C.bronzeDark,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  borderBottom: `1px solid ${C.border}`,
  paddingBottom: 10,
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

export default function Dieta() {
  const [selectedDate, setSelectedDate] = useState(today);
  const { data: logs, refetch: refetchLogs } = useApi('/api/diet-logs');
  const { data: streaks } = useApi('/api/streaks');
  const [currentLog, setCurrentLog] = useState(null);
  const [meals, setMeals] = useState([]);
  const [logForm, setLogForm] = useState({ calories: '', water_ml: '', notes: '' });
  const [mealForm, setMealForm] = useState({ name: '', calories: '', time_of_day: 'desayuno' });
  const [savingLog, setSavingLog] = useState(false);
  const [savingMeal, setSavingMeal] = useState(false);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const weeklyData = last7.map(date => {
    const log = logs ? logs.find(l => l.date === date) : null;
    return { date, calories: log?.calories || 0 };
  });

  useEffect(() => {
    async function loadDay() {
      const res = await fetch(`/api/diet-logs?date=${selectedDate}`);
      const data = await res.json();
      const log = data[0] || null;
      setCurrentLog(log);
      if (log) {
        setLogForm({ calories: log.calories || '', water_ml: log.water_ml || '', notes: log.notes || '' });
        const mealsRes = await fetch(`/api/diet-logs/${log.id}/meals`);
        setMeals(await mealsRes.json());
      } else {
        setLogForm({ calories: '', water_ml: '', notes: '' });
        setMeals([]);
      }
    }
    loadDay();
  }, [selectedDate]);

  const handleSaveLog = async (e) => {
    e.preventDefault();
    setSavingLog(true);
    try {
      const saved = await apiPost('/api/diet-logs', {
        date: selectedDate,
        water_ml: logForm.water_ml ? parseInt(logForm.water_ml) : 0,
        notes: logForm.notes || null,
      });
      setCurrentLog(saved);
      refetchLogs();
    } finally {
      setSavingLog(false);
    }
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!currentLog) {
      alert('Primero guarda el registro del día');
      return;
    }
    setSavingMeal(true);
    try {
      const newMeal = await apiPost(`/api/diet-logs/${currentLog.id}/meals`, {
        name: mealForm.name,
        calories: parseInt(mealForm.calories),
        time_of_day: mealForm.time_of_day,
      });
      setMeals(prev => [...prev, newMeal]);
      setMealForm({ name: '', calories: '', time_of_day: 'desayuno' });
      const res = await fetch(`/api/diet-logs?date=${selectedDate}`);
      const data = await res.json();
      if (data[0]) setCurrentLog(data[0]);
      refetchLogs();
    } finally {
      setSavingMeal(false);
    }
  };

  const handleDeleteMeal = async (id) => {
    if (!confirm('¿Eliminar esta comida?')) return;
    await apiDelete(`/api/meals/${id}`);
    setMeals(prev => prev.filter(m => m.id !== id));
    const res = await fetch(`/api/diet-logs?date=${selectedDate}`);
    const data = await res.json();
    if (data[0]) setCurrentLog(data[0]);
    refetchLogs();
  };

  const dietStreak = streaks?.find(s => s.habit_type === 'dieta');
  const totalCalories = currentLog?.calories || 0;
  const totalWater = currentLog?.water_ml || 0;
  const overCalories = totalCalories > CALORIE_GOAL;

  const mealsByTime = {};
  meals.forEach(m => {
    if (!mealsByTime[m.time_of_day]) mealsByTime[m.time_of_day] = [];
    mealsByTime[m.time_of_day].push(m);
  });

  return (
    <div style={pageStyle}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 800, color: C.text,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          margin: 0, marginBottom: 4,
        }}>Dieta</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ height: 2, width: 32, background: C.bronze, borderRadius: 2 }} />
          <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>Registra tu alimentación diaria</p>
        </div>
      </div>

      {/* Top row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 20, alignItems: 'stretch' }}>
        <div style={card}>
          <div style={cardTitle}>Día seleccionado</div>
          <input
            type="date"
            style={{ ...inputStyle, maxWidth: 220 }}
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            max={today}
          />
        </div>
        {dietStreak && (
          <div style={{ ...card, textAlign: 'center', minWidth: 150, borderTop: `3px solid ${C.cypress}`, padding: '16px 20px' }}>
            <div style={{
              fontSize: 10, color: C.textMuted, fontWeight: 700,
              marginBottom: 4, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>Racha Dieta</div>
            <div style={{ fontSize: 38, fontWeight: 800, color: C.cypress, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {dietStreak.current_streak}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>días</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>
              Récord: {dietStreak.longest_streak}
            </div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>

        {/* Calories */}
        <div style={{ ...card, borderTop: `3px solid ${C.terracotta}` }}>
          <div style={{
            fontSize: 10, color: C.textMuted, fontWeight: 700,
            marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>🍽️ Calorías</div>
          <div style={{
            fontSize: 30, fontWeight: 800,
            color: overCalories ? C.terracotta : C.cypress,
            lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 4,
          }}>
            {totalCalories}
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10 }}>de {CALORIE_GOAL} kcal objetivo</div>
          <ProgressBar value={totalCalories} max={CALORIE_GOAL} />
        </div>

        {/* Water */}
        <div style={{ ...card, borderTop: `3px solid ${C.aegean}` }}>
          <div style={{
            fontSize: 10, color: C.textMuted, fontWeight: 700,
            marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>💧 Agua</div>
          <div style={{
            fontSize: 30, fontWeight: 800,
            color: totalWater >= WATER_GOAL ? C.cypress : C.aegean,
            lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 4,
          }}>
            {totalWater >= 1000 ? `${(totalWater / 1000).toFixed(1)}L` : `${totalWater}ml`}
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10 }}>de {WATER_GOAL / 1000}L objetivo</div>
          <ProgressBar value={totalWater} max={WATER_GOAL} />
        </div>

        {/* Meals count */}
        <div style={{ ...card, borderTop: `3px solid ${C.bronze}` }}>
          <div style={{
            fontSize: 10, color: C.textMuted, fontWeight: 700,
            marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>🍴 Comidas hoy</div>
          <div style={{
            fontSize: 30, fontWeight: 800, color: C.bronzeDark,
            lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 4,
          }}>{meals.length}</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>entradas registradas</div>
        </div>
      </div>

      {/* Daily log form */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={cardTitle}>
          Registro del día — {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <form onSubmit={handleSaveLog}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <div>
              <label style={labelStyle}>Agua consumida (ml)</label>
              <input style={inputStyle} type="number" min="0" value={logForm.water_ml}
                onChange={e => setLogForm(f => ({ ...f, water_ml: e.target.value }))} placeholder="2000" />
            </div>
            <div>
              <label style={labelStyle}>Notas del día</label>
              <input style={inputStyle} value={logForm.notes}
                onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observaciones..." />
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button type="submit" style={btnPrimary} disabled={savingLog}>
              {savingLog ? 'Guardando...' : (currentLog ? 'Actualizar registro' : 'Crear registro del día')}
            </button>
            {currentLog && (
              <span style={{ fontSize: 12, color: C.cypress, fontWeight: 600 }}>✓ Registro guardado</span>
            )}
          </div>
        </form>
      </div>

      {/* Add meal */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={cardTitle}>Añadir comida</div>
        {!currentLog && (
          <div style={{
            fontSize: 13, color: C.terracotta, marginBottom: 12,
            background: C.terracottaFaint, padding: '10px 14px',
            borderRadius: 6, border: `1px solid ${C.terracotta}33`,
          }}>
            ⚠ Primero crea el registro del día antes de añadir comidas.
          </div>
        )}
        <form onSubmit={handleAddMeal}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            <div style={{ flex: 2 }}>
              <label style={labelStyle}>Nombre de la comida *</label>
              <input style={inputStyle} value={mealForm.name}
                onChange={e => setMealForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Pollo con arroz" required />
            </div>
            <div>
              <label style={labelStyle}>Calorías (kcal) *</label>
              <input style={inputStyle} type="number" min="0" value={mealForm.calories}
                onChange={e => setMealForm(f => ({ ...f, calories: e.target.value }))}
                placeholder="350" required />
            </div>
            <div>
              <label style={labelStyle}>Momento del día *</label>
              <select style={inputStyle} value={mealForm.time_of_day}
                onChange={e => setMealForm(f => ({ ...f, time_of_day: e.target.value }))}>
                {Object.entries(mealTimeLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={btnPrimary} disabled={savingMeal || !currentLog}>
              {savingMeal ? 'Añadiendo...' : '+ Añadir comida'}
            </button>
          </div>
        </form>
      </div>

      {/* Meals by time of day */}
      {meals.length > 0 && (
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={cardTitle}>Comidas del día</div>
          {Object.entries(mealTimeLabels).map(([timeKey, timeVal]) => {
            const timeMeals = mealsByTime[timeKey];
            if (!timeMeals || timeMeals.length === 0) return null;
            const timeTotal = timeMeals.reduce((sum, m) => sum + m.calories, 0);
            return (
              <div key={timeKey} style={{ marginBottom: 18 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 8, padding: '8px 12px',
                  background: C.marbleLight,
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  borderLeft: `3px solid ${timeVal.color}`,
                }}>
                  <div style={{
                    fontWeight: 700, fontSize: 12, color: timeVal.color,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {timeVal.icon} {timeVal.label}
                  </div>
                  <span style={{ fontSize: 13, color: timeVal.color, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{timeTotal} kcal</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {timeMeals.map(m => (
                    <div key={m.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: C.cardAlt,
                      borderRadius: 6,
                      border: `1px solid ${C.border}`,
                      borderLeft: `3px solid ${timeVal.color}`,
                    }}>
                      <span style={{ fontSize: 14, color: C.text }}>{m.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.bronzeDark, fontVariantNumeric: 'tabular-nums' }}>{m.calories} kcal</span>
                        <button style={btnDanger} onClick={() => handleDeleteMeal(m.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Weekly chart */}
      <div style={card}>
        <div style={cardTitle}>Calorías — últimos 7 días</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => [`${v} kcal`, 'Calorías']}
              labelFormatter={l => `Fecha: ${l}`}
              contentStyle={tooltipStyle}
            />
            <ReferenceLine
              y={CALORIE_GOAL}
              stroke={C.terracotta}
              strokeDasharray="4 4"
              label={{ value: 'Objetivo', fontSize: 11, fill: C.terracotta }}
            />
            <Bar dataKey="calories" fill={C.terracotta} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
