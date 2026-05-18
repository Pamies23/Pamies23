import React, { useState, useEffect } from 'react';
import { useApi, apiPost, apiDelete } from '../hooks/useApi.js';
import ProgressBar from '../components/ProgressBar.jsx';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';

const pageStyle = { padding: '28px 32px', maxWidth: 1100 };

const card = {
  background: '#fffbf0',
  borderRadius: 8,
  padding: 20,
  boxShadow: '0 2px 8px rgba(139,94,26,0.15)',
  border: '1px solid #c9a055',
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #c9a055',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  background: '#fdf6e3',
  color: '#2a1a08',
  boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: '#7a4e0d',
  marginBottom: 4,
  display: 'block',
  letterSpacing: '0.03em',
};

const btnPrimary = {
  background: '#8b5e1a',
  color: '#fdf6e3',
  border: '1px solid #7a4e0d',
  borderRadius: 8,
  padding: '9px 18px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const btnDanger = {
  background: 'none',
  color: '#b86b1a',
  border: 'none',
  cursor: 'pointer',
  fontSize: 18,
  padding: '4px',
};

const today = new Date().toISOString().split('T')[0];
const CALORIE_GOAL = 2000;
const WATER_GOAL = 2000;

// Troy-themed meal time styles
const mealTimeLabels = {
  desayuno: { label: 'Desayuno', icon: '🌅', color: '#c9a055', bg: 'rgba(201,160,85,0.12)' },
  almuerzo: { label: 'Almuerzo', icon: '☀️', color: '#8b5e1a', bg: 'rgba(139,94,26,0.1)' },
  merienda: { label: 'Merienda', icon: '🍎', color: '#b86b1a', bg: 'rgba(184,107,26,0.1)' },
  cena: { label: 'Cena', icon: '🌙', color: '#2e6b8a', bg: 'rgba(46,107,138,0.1)' },
  snack: { label: 'Snack', icon: '🍿', color: '#5a7a3a', bg: 'rgba(90,122,58,0.1)' },
};

const tooltipStyle = {
  background: '#fffbf0',
  border: '1px solid #c9a055',
  borderRadius: 6,
  fontSize: 12,
  color: '#2a1a08',
  boxShadow: '0 2px 8px rgba(139,94,26,0.2)',
};

const cardTitle = {
  fontWeight: 700,
  fontSize: 15,
  marginBottom: 16,
  color: '#7a4e0d',
  fontFamily: "Georgia, 'Times New Roman', serif",
  letterSpacing: '0.02em',
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
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#7a4e0d',
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: '0.04em',
          margin: 0,
          paddingBottom: 8,
          borderBottom: '2px solid rgba(201,160,85,0.5)',
          display: 'inline-block',
        }}>Dieta</h1>
        <p style={{ color: '#7a6040', fontSize: 14, marginTop: 6 }}>Registra tu alimentación diaria</p>
      </div>

      {/* Top row: day selector + streaks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 24, alignItems: 'start' }}>
        <div style={card}>
          <div style={cardTitle}>📅 Día seleccionado</div>
          <input
            type="date"
            style={{ ...inputStyle, maxWidth: 200 }}
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            max={today}
          />
        </div>
        {dietStreak && (
          <div style={{ ...card, textAlign: 'center', minWidth: 130, borderTop: '3px solid #c9a055' }}>
            <div style={{
              fontSize: 11,
              color: '#7a6040',
              fontWeight: 700,
              marginBottom: 4,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>Racha Dieta</div>
            <div style={{
              fontSize: 36,
              fontWeight: 800,
              color: '#c9a055',
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}>{dietStreak.current_streak}</div>
            <div style={{ fontSize: 12, color: '#7a6040' }}>días</div>
            <div style={{ fontSize: 11, color: '#7a6040', marginTop: 4, opacity: 0.7 }}>
              Récord: {dietStreak.longest_streak}
            </div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Calories card */}
        <div style={{ ...card, borderTop: '3px solid #b86b1a' }}>
          <div style={{
            fontSize: 12,
            color: '#7a6040',
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>🍽️ Calorías</div>
          <div style={{
            fontSize: 28,
            fontWeight: 800,
            color: totalCalories > CALORIE_GOAL ? '#b86b1a' : '#5a7a3a',
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}>
            {totalCalories}
          </div>
          <div style={{ fontSize: 12, color: '#7a6040', marginBottom: 8 }}>de {CALORIE_GOAL} kcal objetivo</div>
          <ProgressBar value={totalCalories} max={CALORIE_GOAL} color={totalCalories > CALORIE_GOAL ? '#b86b1a' : '#5a7a3a'} />
        </div>

        {/* Water card */}
        <div style={{ ...card, borderTop: '3px solid #2e6b8a' }}>
          <div style={{
            fontSize: 12,
            color: '#7a6040',
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>💧 Agua</div>
          <div style={{
            fontSize: 28,
            fontWeight: 800,
            color: totalWater >= WATER_GOAL ? '#5a7a3a' : '#2e6b8a',
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}>
            {totalWater >= 1000 ? `${(totalWater / 1000).toFixed(1)}L` : `${totalWater}ml`}
          </div>
          <div style={{ fontSize: 12, color: '#7a6040', marginBottom: 8 }}>de {WATER_GOAL / 1000}L objetivo</div>
          <ProgressBar value={totalWater} max={WATER_GOAL} color={totalWater >= WATER_GOAL ? '#5a7a3a' : '#2e6b8a'} />
        </div>

        {/* Meals count card */}
        <div style={{ ...card, borderTop: '3px solid #8b5e1a' }}>
          <div style={{
            fontSize: 12,
            color: '#7a6040',
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>🍴 Comidas hoy</div>
          <div style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#8b5e1a',
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}>{meals.length}</div>
          <div style={{ fontSize: 12, color: '#7a6040' }}>entradas registradas</div>
        </div>
      </div>

      {/* Daily log form */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={cardTitle}>
          💾 Registro del día — {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
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
          <div style={{ marginTop: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button type="submit" style={btnPrimary} disabled={savingLog}>
              {savingLog ? 'Guardando...' : (currentLog ? '✏️ Actualizar registro' : '💾 Crear registro del día')}
            </button>
            {currentLog && (
              <span style={{ fontSize: 12, color: '#5a7a3a', fontWeight: 600 }}>✓ Registro guardado</span>
            )}
          </div>
        </form>
      </div>

      {/* Add meal */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={cardTitle}>➕ Añadir comida</div>
        {!currentLog && (
          <div style={{
            fontSize: 13,
            color: '#b86b1a',
            marginBottom: 12,
            background: 'rgba(184,107,26,0.12)',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid rgba(184,107,26,0.3)',
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
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={btnPrimary} disabled={savingMeal || !currentLog}>
              {savingMeal ? 'Añadiendo...' : '+ Añadir comida'}
            </button>
          </div>
        </form>
      </div>

      {/* Meals list by time */}
      {meals.length > 0 && (
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={cardTitle}>🍽️ Comidas del día</div>
          {Object.entries(mealTimeLabels).map(([timeKey, timeVal]) => {
            const timeMeals = mealsByTime[timeKey];
            if (!timeMeals || timeMeals.length === 0) return null;
            const timeTotal = timeMeals.reduce((sum, m) => sum + m.calories, 0);
            return (
              <div key={timeKey} style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  padding: '6px 10px',
                  background: timeVal.bg,
                  borderRadius: 6,
                  border: `1px solid ${timeVal.color}33`,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: timeVal.color }}>
                    {timeVal.icon} {timeVal.label}
                  </div>
                  <span style={{
                    fontSize: 13,
                    color: timeVal.color,
                    fontWeight: 600,
                  }}>{timeTotal} kcal</span>
                </div>
                {timeMeals.map(m => (
                  <div key={m.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#fdf6e3',
                    borderRadius: 8,
                    marginBottom: 6,
                    border: '1px solid rgba(201,160,85,0.2)',
                    borderLeft: `3px solid ${timeVal.color}`,
                  }}>
                    <span style={{ fontSize: 14, color: '#2a1a08' }}>{m.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#7a4e0d' }}>{m.calories} kcal</span>
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
        <div style={cardTitle}>📊 Calorías últimos 7 días</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,94,26,0.1)" />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#7a6040' }} />
            <YAxis tick={{ fontSize: 11, fill: '#7a6040' }} />
            <Tooltip
              formatter={(v) => [`${v} kcal`, 'Calorías']}
              labelFormatter={l => `Fecha: ${l}`}
              contentStyle={tooltipStyle}
            />
            <ReferenceLine
              y={CALORIE_GOAL}
              stroke="#b86b1a"
              strokeDasharray="4 4"
              label={{ value: 'Objetivo', fontSize: 11, fill: '#b86b1a' }}
            />
            <Bar dataKey="calories" fill="#b86b1a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
