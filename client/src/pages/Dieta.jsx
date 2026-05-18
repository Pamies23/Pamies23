import React, { useState, useEffect } from 'react';
import { useApi, apiPost, apiDelete } from '../hooks/useApi.js';
import ProgressBar from '../components/ProgressBar.jsx';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';

const pageStyle = { padding: '28px 32px', maxWidth: 1100, background: '#0f0f1a', minHeight: '100vh' };

const card = {
  background: '#1a1a2e',
  borderRadius: 14,
  padding: 20,
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 0 20px rgba(124, 58, 237, 0.1), 0 4px 16px rgba(0,0,0,0.3)',
};

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1px solid rgba(124,58,237,0.25)',
  borderRadius: 8,
  fontSize: 14, fontFamily: 'inherit', outline: 'none',
  background: '#12122a',
  color: '#f1f5f9',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const labelStyle = {
  fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6,
  display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em',
};

const btnPrimary = {
  background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
  color: '#fff', border: 'none', borderRadius: 8,
  padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  boxShadow: '0 0 16px rgba(124,58,237,0.35)',
  transition: 'box-shadow 0.2s ease, transform 0.15s ease',
};

const btnDanger = {
  background: 'none', color: '#f87171', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px',
  borderRadius: 6,
};

const darkTooltipStyle = {
  background: '#12122a',
  border: '1px solid rgba(245,158,11,0.3)',
  borderRadius: 10,
  fontSize: 12,
  color: '#f1f5f9',
};

const today = new Date().toISOString().split('T')[0];
const CALORIE_GOAL = 2000;
const WATER_GOAL = 2000;

// Time-of-day badge colors
const mealTimeBadge = {
  desayuno: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)' },
  almuerzo: { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.3)' },
  merienda: { color: '#34d399', bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)' },
  cena: { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)' },
  snack: { color: '#f87171', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.3)' },
};

const mealTimeLabels = {
  desayuno: { label: 'Desayuno', icon: '🌅' },
  almuerzo: { label: 'Almuerzo', icon: '☀️' },
  merienda: { label: 'Merienda', icon: '🍎' },
  cena: { label: 'Cena', icon: '🌙' },
  snack: { label: 'Snack', icon: '🍿' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

export default function Dieta() {
  const [selectedDate, setSelectedDate] = useState(today);
  const { data: logs, loading: logsLoading, refetch: refetchLogs } = useApi('/api/diet-logs');
  const { data: streaks } = useApi('/api/streaks');
  const [currentLog, setCurrentLog] = useState(null);
  const [meals, setMeals] = useState([]);
  const [logForm, setLogForm] = useState({ calories: '', water_ml: '', notes: '' });
  const [mealForm, setMealForm] = useState({ name: '', calories: '', time_of_day: 'desayuno' });
  const [savingLog, setSavingLog] = useState(false);
  const [savingMeal, setSavingMeal] = useState(false);

  // Get weekly data for chart (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const weeklyData = last7.map(date => {
    const log = logs ? logs.find(l => l.date === date) : null;
    return { date, calories: log?.calories || 0 };
  });

  // Load current day log + meals
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
      // Refresh log to get updated calories
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
    // Refresh log
    const res = await fetch(`/api/diet-logs?date=${selectedDate}`);
    const data = await res.json();
    if (data[0]) setCurrentLog(data[0]);
    refetchLogs();
  };

  const dietStreak = streaks?.find(s => s.habit_type === 'dieta');
  const totalCalories = currentLog?.calories || 0;
  const totalWater = currentLog?.water_ml || 0;

  const mealsByTime = {};
  meals.forEach(m => {
    if (!mealsByTime[m.time_of_day]) mealsByTime[m.time_of_day] = [];
    mealsByTime[m.time_of_day].push(m);
  });

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800,
          background: 'linear-gradient(135deg, #f59e0b, #10b981)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em',
        }}>Dieta</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>Registra tu alimentación diaria</p>
      </div>

      {/* Top row: day selector + streaks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 24, alignItems: 'start' }}>
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: '#f1f5f9' }}>📅 Día seleccionado</div>
          <input
            type="date"
            style={{ ...inputStyle, maxWidth: 200 }}
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            max={today}
          />
        </div>
        {dietStreak && (
          <div style={{
            ...card,
            textAlign: 'center',
            minWidth: 130,
            background: 'linear-gradient(135deg, rgba(236,72,153,0.12), rgba(124,58,237,0.1))',
            border: '1px solid rgba(236,72,153,0.25)',
          }}>
            <div style={{ fontSize: 11, color: '#ec4899', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>RACHA DIETA</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#ec4899', lineHeight: 1 }}>{dietStreak.current_streak}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>días</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>Récord: <span style={{ color: '#60a5fa', fontWeight: 700 }}>{dietStreak.longest_streak}</span></div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Calories card */}
        <div style={{ ...card, borderTop: '3px solid #f59e0b' }}>
          <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🍽️ Calorías</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: totalCalories > CALORIE_GOAL ? '#f87171' : '#fbbf24', lineHeight: 1, marginBottom: 6 }}>
            {totalCalories}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>de {CALORIE_GOAL} kcal objetivo</div>
          <ProgressBar value={totalCalories} max={CALORIE_GOAL} color={totalCalories > CALORIE_GOAL ? 'linear-gradient(90deg, #f87171, #ef4444)' : 'linear-gradient(90deg, #f59e0b, #d97706)'} />
        </div>

        {/* Water card */}
        <div style={{ ...card, borderTop: '3px solid #2563eb' }}>
          <div style={{ fontSize: 12, color: '#60a5fa', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>💧 Agua</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: totalWater >= WATER_GOAL ? '#10b981' : '#60a5fa', lineHeight: 1, marginBottom: 6 }}>
            {totalWater >= 1000 ? `${(totalWater / 1000).toFixed(1)}L` : `${totalWater}ml`}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>de {WATER_GOAL / 1000}L objetivo</div>
          <ProgressBar value={totalWater} max={WATER_GOAL} color={totalWater >= WATER_GOAL ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #2563eb, #1d4ed8)'} />
        </div>

        {/* Meals count card */}
        <div style={{ ...card, borderTop: '3px solid #10b981' }}>
          <div style={{ fontSize: 12, color: '#34d399', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🍴 Comidas hoy</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', lineHeight: 1, marginBottom: 6 }}>{meals.length}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>entradas registradas</div>
        </div>
      </div>

      {/* Daily log form */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#f1f5f9' }}>
          💾 Registro del día{' '}
          <span style={{ color: '#94a3b8', fontWeight: 500 }}>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
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
          <div style={{ marginTop: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
            <button
              type="submit" style={btnPrimary} disabled={savingLog}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(124,58,237,0.35)'; }}
            >
              {savingLog ? 'Guardando...' : (currentLog ? '✏️ Actualizar registro' : '💾 Crear registro del día')}
            </button>
            {currentLog && (
              <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                ✓ Registro guardado
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Add meal */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#f1f5f9' }}>➕ Añadir comida</div>
        {!currentLog && (
          <div style={{
            fontSize: 13, color: '#fbbf24', marginBottom: 14,
            background: 'rgba(245,158,11,0.1)', padding: '10px 14px', borderRadius: 8,
            border: '1px solid rgba(245,158,11,0.25)',
          }}>
            ⚠️ Primero crea el registro del día antes de añadir comidas.
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
            <button
              type="submit" style={btnPrimary} disabled={savingMeal || !currentLog}
              onMouseEnter={e => { if (!savingMeal && currentLog) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.5)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(124,58,237,0.35)'; }}
            >
              {savingMeal ? 'Añadiendo...' : '+ Añadir comida'}
            </button>
          </div>
        </form>
      </div>

      {/* Meals list by time */}
      {meals.length > 0 && (
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: '#f1f5f9' }}>🍽️ Comidas del día</div>
          {Object.entries(mealTimeLabels).map(([timeKey, timeVal]) => {
            const timeMeals = mealsByTime[timeKey];
            if (!timeMeals || timeMeals.length === 0) return null;
            const timeTotal = timeMeals.reduce((sum, m) => sum + m.calories, 0);
            const badgeStyle = mealTimeBadge[timeKey] || mealTimeBadge.snack;
            return (
              <div key={timeKey} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      background: badgeStyle.bg, color: badgeStyle.color,
                      border: `1px solid ${badgeStyle.border}`,
                      fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
                    }}>
                      {timeVal.icon} {timeVal.label}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
                    <span style={{ color: badgeStyle.color }}>{timeTotal}</span> kcal
                  </span>
                </div>
                {timeMeals.map(m => (
                  <div key={m.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#151525',
                    borderRadius: 10, marginBottom: 6,
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: `3px solid ${badgeStyle.color}`,
                  }}>
                    <span style={{ fontSize: 14, color: '#f1f5f9' }}>{m.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>{m.calories} kcal</span>
                      <button style={btnDanger} onClick={() => handleDeleteMeal(m.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Weekly chart */}
      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
          📊 Calorías últimos 7 días
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b', fontWeight: 500 }}>semana actual</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => [`${v} kcal`, 'Calorías']}
              labelFormatter={l => `Fecha: ${l}`}
              contentStyle={darkTooltipStyle}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#fbbf24' }}
            />
            <ReferenceLine y={CALORIE_GOAL} stroke="#f87171" strokeDasharray="4 4"
              label={{ value: 'Objetivo', fontSize: 11, fill: '#f87171' }} />
            <defs>
              <linearGradient id="caloriesBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <Bar dataKey="calories" fill="url(#caloriesBarGrad)" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
