import React, { useState, useEffect } from 'react';
import { useApi, apiPost, apiDelete } from '../hooks/useApi.js';
import ProgressBar from '../components/ProgressBar.jsx';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';

const pageStyle = { padding: '28px 32px', maxWidth: 1100 };
const card = { background: '#ffffff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8,
  fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box',
};
const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' };
const btnPrimary = {
  background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8,
  padding: '9px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
};
const btnDanger = {
  background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px',
};

const today = new Date().toISOString().split('T')[0];
const CALORIE_GOAL = 2000;
const WATER_GOAL = 2000;

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
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a202c' }}>Dieta</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Registra tu alimentación diaria</p>
      </div>

      {/* Top row: day selector + streaks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 24, alignItems: 'start' }}>
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📅 Día seleccionado</div>
          <input
            type="date"
            style={{ ...inputStyle, maxWidth: 200 }}
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            max={today}
          />
        </div>
        {dietStreak && (
          <div style={{ ...card, textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>RACHA DIETA</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#f59e0b' }}>{dietStreak.current_streak}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>días</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Récord: {dietStreak.longest_streak}</div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={card}>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 8 }}>🍽️ CALORÍAS</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: totalCalories > CALORIE_GOAL ? '#ef4444' : '#10b981' }}>
            {totalCalories}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>de {CALORIE_GOAL} kcal objetivo</div>
          <ProgressBar value={totalCalories} max={CALORIE_GOAL} color={totalCalories > CALORIE_GOAL ? '#ef4444' : '#10b981'} />
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 8 }}>💧 AGUA</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: totalWater >= WATER_GOAL ? '#10b981' : '#2563eb' }}>
            {totalWater >= 1000 ? `${(totalWater / 1000).toFixed(1)}L` : `${totalWater}ml`}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>de {WATER_GOAL / 1000}L objetivo</div>
          <ProgressBar value={totalWater} max={WATER_GOAL} color={totalWater >= WATER_GOAL ? '#10b981' : '#2563eb'} />
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 8 }}>🍴 COMIDAS HOY</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1a202c' }}>{meals.length}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>entradas registradas</div>
        </div>
      </div>

      {/* Daily log form */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
          💾 Registro del día {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
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
            {currentLog && <span style={{ fontSize: 12, color: '#10b981' }}>✓ Registro guardado</span>}
          </div>
        </form>
      </div>

      {/* Add meal */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>➕ Añadir comida</div>
        {!currentLog && (
          <div style={{ fontSize: 13, color: '#f59e0b', marginBottom: 12, background: '#fef3c7', padding: '8px 12px', borderRadius: 8 }}>
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
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🍽️ Comidas del día</div>
          {Object.entries(mealTimeLabels).map(([timeKey, timeVal]) => {
            const timeMeals = mealsByTime[timeKey];
            if (!timeMeals || timeMeals.length === 0) return null;
            const timeTotal = timeMeals.reduce((sum, m) => sum + m.calories, 0);
            return (
              <div key={timeKey} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>
                    {timeVal.icon} {timeVal.label}
                  </div>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>{timeTotal} kcal</span>
                </div>
                {timeMeals.map(m => (
                  <div key={m.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', background: '#f8f9fa', borderRadius: 8, marginBottom: 6,
                  }}>
                    <span style={{ fontSize: 14, color: '#1a202c' }}>{m.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{m.calories} kcal</span>
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
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📊 Calorías últimos 7 días</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v) => [`${v} kcal`, 'Calorías']}
              labelFormatter={l => `Fecha: ${l}`}
              contentStyle={{ fontSize: 12 }}
            />
            <ReferenceLine y={CALORIE_GOAL} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Objetivo', fontSize: 11, fill: '#ef4444' }} />
            <Bar dataKey="calories" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
