import React, { useState } from 'react';
import { useApi, apiPost, apiDelete } from '../hooks/useApi.js';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
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
  borderRadius: 6, transition: 'background 0.15s',
};

const darkTooltipStyle = {
  background: '#12122a',
  border: '1px solid rgba(124,58,237,0.3)',
  borderRadius: 10,
  fontSize: 12,
  color: '#f1f5f9',
};

const today = new Date().toISOString().split('T')[0];

const intensityColors = ['', '#10b981', '#84cc16', '#f59e0b', '#f97316', '#ef4444'];
const intensityLabels = ['', 'Muy baja', 'Baja', 'Media', 'Alta', 'Máxima'];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

// ============ ENTRENAMIENTOS TAB ============
function WorkoutsTab() {
  const { data: workouts, loading, refetch } = useApi('/api/workouts');
  const [form, setForm] = useState({
    date: today, type: '', duration_min: '', intensity: '3', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPost('/api/workouts', {
        ...form,
        duration_min: parseInt(form.duration_min),
        intensity: parseInt(form.intensity),
      });
      setForm({ date: today, type: '', duration_min: '', intensity: '3', notes: '' });
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este entrenamiento?')) return;
    await apiDelete(`/api/workouts/${id}`);
    refetch();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Form */}
      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', borderRadius: 8, padding: '4px 8px', fontSize: 13 }}>➕</span>
          Registrar entrenamiento
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            <div>
              <label style={labelStyle}>Fecha *</label>
              <input style={inputStyle} type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Tipo de ejercicio *</label>
              <input style={inputStyle} value={form.type} onChange={e => set('type', e.target.value)}
                placeholder="Ej: Correr, Pesas..." required />
            </div>
            <div>
              <label style={labelStyle}>Duración (minutos) *</label>
              <input style={inputStyle} type="number" min="1" value={form.duration_min}
                onChange={e => set('duration_min', e.target.value)} placeholder="45" required />
            </div>
            <div>
              <label style={labelStyle}>Intensidad (1-5) *</label>
              <select style={inputStyle} value={form.intensity} onChange={e => set('intensity', e.target.value)}>
                {[1, 2, 3, 4, 5].map(i => (
                  <option key={i} value={i}>{i} - {intensityLabels[i]}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Notas</label>
              <input style={inputStyle} value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Observaciones opcionales..." />
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit" style={btnPrimary} disabled={saving}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(124,58,237,0.35)'; }}
            >
              {saving ? 'Guardando...' : '💾 Guardar entrenamiento'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: '#f1f5f9' }}>
          📋 Historial de entrenamientos
        </div>
        {loading ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: 24 }}>Cargando...</div>
        ) : !workouts || workouts.length === 0 ? (
          <div style={{ color: '#475569', textAlign: 'center', padding: 24, fontSize: 14 }}>Sin entrenamientos registrados</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Fecha', 'Tipo', 'Duración', 'Intensidad', 'Notas', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left',
                      color: '#64748b', fontWeight: 700, fontSize: 11,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workouts.map((w, idx) => (
                  <tr key={w.id} style={{
                    background: idx % 2 === 0 ? '#1a1a2e' : '#151525',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.15s',
                  }}>
                    <td style={{ padding: '11px 14px', color: '#94a3b8', fontSize: 13 }}>
                      {new Date(w.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td style={{ padding: '11px 14px', fontWeight: 700, color: '#f1f5f9' }}>{w.type}</td>
                    <td style={{ padding: '11px 14px', color: '#94a3b8' }}>
                      <span style={{ color: '#60a5fa', fontWeight: 600 }}>{w.duration_min}</span> min
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        background: `${intensityColors[w.intensity]}20`,
                        color: intensityColors[w.intensity],
                        border: `1px solid ${intensityColors[w.intensity]}40`,
                        fontWeight: 700, fontSize: 12, padding: '3px 10px', borderRadius: 99,
                      }}>
                        {w.intensity}/5 {intensityLabels[w.intensity]}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#64748b', fontSize: 13 }}>{w.notes || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <button style={btnDanger} onClick={() => handleDelete(w.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ PESO & MEDIDAS TAB ============
function MetricsTab() {
  const { data: metrics, loading, refetch } = useApi('/api/body-metrics');
  const [form, setForm] = useState({ date: today, weight_kg: '', waist_cm: '', hip_cm: '', chest_cm: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPost('/api/body-metrics', {
        ...form,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        waist_cm: form.waist_cm ? parseFloat(form.waist_cm) : null,
        hip_cm: form.hip_cm ? parseFloat(form.hip_cm) : null,
        chest_cm: form.chest_cm ? parseFloat(form.chest_cm) : null,
      });
      setForm({ date: today, weight_kg: '', waist_cm: '', hip_cm: '', chest_cm: '', notes: '' });
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este registro?')) return;
    await apiDelete(`/api/body-metrics/${id}`);
    refetch();
  };

  const chartData = metrics ? [...metrics].reverse().slice(-30) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Form */}
      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', borderRadius: 8, padding: '4px 8px', fontSize: 13 }}>➕</span>
          Registrar medidas
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
            <div>
              <label style={labelStyle}>Fecha *</label>
              <input style={inputStyle} type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Peso (kg)</label>
              <input style={inputStyle} type="number" step="0.1" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} placeholder="75.5" />
            </div>
            <div>
              <label style={labelStyle}>Cintura (cm)</label>
              <input style={inputStyle} type="number" step="0.5" value={form.waist_cm} onChange={e => set('waist_cm', e.target.value)} placeholder="85" />
            </div>
            <div>
              <label style={labelStyle}>Cadera (cm)</label>
              <input style={inputStyle} type="number" step="0.5" value={form.hip_cm} onChange={e => set('hip_cm', e.target.value)} placeholder="98" />
            </div>
            <div>
              <label style={labelStyle}>Pecho (cm)</label>
              <input style={inputStyle} type="number" step="0.5" value={form.chest_cm} onChange={e => set('chest_cm', e.target.value)} placeholder="95" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Notas</label>
              <input style={inputStyle} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Observaciones..." />
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit" style={btnPrimary} disabled={saving}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(124,58,237,0.35)'; }}
            >
              {saving ? 'Guardando...' : '💾 Guardar medidas'}
            </button>
          </div>
        </form>
      </div>

      {/* Weight chart */}
      {chartData.length > 1 && (
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            📈 Evolución del peso
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b', fontWeight: 500 }}>últimos 30 días</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [`${v} kg`, 'Peso']}
                labelFormatter={l => `Fecha: ${l}`}
                contentStyle={darkTooltipStyle}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#a78bfa' }}
              />
              <defs>
                <linearGradient id="weightLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <Line type="monotone" dataKey="weight_kg" stroke="#7c3aed" strokeWidth={2.5}
                dot={{ r: 3, fill: '#7c3aed', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#a78bfa', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: '#f1f5f9' }}>
          📋 Historial de medidas
        </div>
        {loading ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: 24 }}>Cargando...</div>
        ) : !metrics || metrics.length === 0 ? (
          <div style={{ color: '#475569', textAlign: 'center', padding: 24, fontSize: 14 }}>Sin registros de medidas</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Fecha', 'Peso (kg)', 'Cintura', 'Cadera', 'Pecho', 'Notas', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left',
                      color: '#64748b', fontWeight: 700, fontSize: 11,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, idx) => (
                  <tr key={m.id} style={{
                    background: idx % 2 === 0 ? '#1a1a2e' : '#151525',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <td style={{ padding: '11px 14px', color: '#94a3b8', fontSize: 13 }}>
                      {new Date(m.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td style={{ padding: '11px 14px', fontWeight: 700, color: '#a78bfa' }}>{m.weight_kg ?? '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#94a3b8' }}>{m.waist_cm ? `${m.waist_cm} cm` : '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#94a3b8' }}>{m.hip_cm ? `${m.hip_cm} cm` : '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#94a3b8' }}>{m.chest_cm ? `${m.chest_cm} cm` : '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#64748b', fontSize: 13 }}>{m.notes || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <button style={btnDanger} onClick={() => handleDelete(m.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ RÉCORDS PERSONALES TAB ============
function RecordsTab() {
  const { data: records, loading, refetch } = useApi('/api/personal-records');
  const [form, setForm] = useState({ exercise_name: '', value: '', unit: 'kg', date: today, notes: '' });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPost('/api/personal-records', {
        ...form,
        value: parseFloat(form.value),
      });
      setForm({ exercise_name: '', value: '', unit: 'kg', date: today, notes: '' });
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este récord?')) return;
    await apiDelete(`/api/personal-records/${id}`);
    refetch();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Form */}
      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: 8, padding: '4px 8px', fontSize: 13 }}>🏆</span>
          Añadir récord personal
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            <div>
              <label style={labelStyle}>Ejercicio *</label>
              <input style={inputStyle} value={form.exercise_name} onChange={e => set('exercise_name', e.target.value)}
                placeholder="Ej: Press de banca" required />
            </div>
            <div>
              <label style={labelStyle}>Valor *</label>
              <input style={inputStyle} type="number" step="0.01" value={form.value}
                onChange={e => set('value', e.target.value)} placeholder="100" required />
            </div>
            <div>
              <label style={labelStyle}>Unidad *</label>
              <input style={inputStyle} value={form.unit} onChange={e => set('unit', e.target.value)}
                placeholder="kg, reps, min..." required />
            </div>
            <div>
              <label style={labelStyle}>Fecha *</label>
              <input style={inputStyle} type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Notas</label>
              <input style={inputStyle} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Observaciones..." />
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit" style={{ ...btnPrimary, background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 0 16px rgba(245,158,11,0.35)' }}
              disabled={saving}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(245,158,11,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(245,158,11,0.35)'; }}
            >
              {saving ? 'Guardando...' : '🏆 Añadir récord'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: '#f1f5f9' }}>
          🏆 Récords personales
        </div>
        {loading ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: 24 }}>Cargando...</div>
        ) : !records || records.length === 0 ? (
          <div style={{ color: '#475569', textAlign: 'center', padding: 24, fontSize: 14 }}>Sin récords registrados</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {records.map((r, idx) => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px',
                background: idx % 2 === 0 ? '#151525' : '#12122a',
                borderRadius: 12,
                border: '1px solid rgba(245,158,11,0.12)',
                borderLeft: '3px solid #f59e0b',
              }}>
                <div style={{
                  width: 44, height: 44,
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                }}>🏆</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{r.exercise_name}</div>
                  {r.notes && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{r.notes}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>{r.value}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{r.unit}</div>
                </div>
                <div style={{ textAlign: 'right', color: '#64748b', fontSize: 12, flexShrink: 0, minWidth: 60 }}>
                  {new Date(r.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })}
                </div>
                <button style={btnDanger} onClick={() => handleDelete(r.id)}>🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ MAIN PAGE ============
export default function Ejercicio() {
  const [tab, setTab] = useState('entrenamientos');

  const tabs = [
    { key: 'entrenamientos', label: '💪 Entrenamientos' },
    { key: 'medidas', label: '⚖️ Peso & Medidas' },
    { key: 'records', label: '🏆 Récords Personales' },
  ];

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800,
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em',
        }}>Ejercicio</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>Registra tus entrenamientos y progreso físico</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4,
        background: '#12122a',
        padding: 4, borderRadius: 12, marginBottom: 28,
        width: 'fit-content',
        border: '1px solid rgba(124,58,237,0.2)',
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            style={{
              padding: '9px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700,
              border: 'none', cursor: 'pointer',
              background: tab === t.key
                ? 'linear-gradient(135deg, #7c3aed, #2563eb)'
                : 'transparent',
              color: tab === t.key ? '#fff' : '#64748b',
              boxShadow: tab === t.key ? '0 0 14px rgba(124,58,237,0.4)' : 'none',
              transition: 'all 0.15s',
            }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'entrenamientos' && <WorkoutsTab />}
      {tab === 'medidas' && <MetricsTab />}
      {tab === 'records' && <RecordsTab />}
    </div>
  );
}
