import React, { useState } from 'react';
import { useApi, apiPost, apiDelete } from '../hooks/useApi.js';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { C, card, inputStyle, labelStyle, btnPrimary, tooltipStyle } from '../theme.js';

const pageStyle = { padding: '28px 32px', maxWidth: 1100, background: C.pageBg, minHeight: '100vh' };

const btnDanger = {
  background: 'none',
  color: C.textMuted,
  border: 'none',
  cursor: 'pointer',
  fontSize: 16,
  padding: '4px',
};

const badge = (color = C.bronzeDark) => ({
  background: C.marbleLight,
  color,
  border: `1px solid ${C.border}`,
  fontSize: 10,
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: 99,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

const today = new Date().toISOString().split('T')[0];

// Intensity: graduated from sandy bronze to deep bronze
const intensityBronze = ['', '#c4a882', '#b09060', '#9a7040', '#7a5830', '#5c3e20'];
const intensityLabels = ['', 'Muy baja', 'Baja', 'Media', 'Alta', 'Máxima'];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

const cardTitle = {
  fontSize: 11,
  fontWeight: 700,
  marginBottom: 16,
  color: C.bronzeDark,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  borderBottom: `1px solid ${C.border}`,
  paddingBottom: 10,
};

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
        <div style={cardTitle}>➕ Registrar entrenamiento</div>
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
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={btnPrimary} disabled={saving}>
              {saving ? 'Guardando...' : '💾 Guardar entrenamiento'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div style={card}>
        <div style={cardTitle}>📋 Historial de entrenamientos</div>
        {loading ? (
          <div style={{ color: '#a0907a', textAlign: 'center', padding: 20 }}>Cargando...</div>
        ) : !workouts || workouts.length === 0 ? (
          <div style={{ color: '#a0907a', textAlign: 'center', padding: 20 }}>Sin entrenamientos registrados</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f5f0e8' }}>
                  {['Fecha', 'Tipo', 'Duración', 'Intensidad', 'Notas', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 12px',
                      textAlign: 'left',
                      color: C.bronzeDark,
                      fontWeight: 700,
                      fontSize: 10,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      borderBottom: `1px solid ${C.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workouts.map((w, i) => (
                  <tr key={w.id} style={{
                    background: i % 2 === 0 ? '#ffffff' : '#faf6f0',
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    <td style={{ padding: '10px 12px', color: C.textMuted }}>
                      {new Date(w.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: C.text }}>{w.type}</td>
                    <td style={{ padding: '10px 12px', color: C.text }}>{w.duration_min} min</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        ...badge(intensityBronze[w.intensity]),
                        background: `${intensityBronze[w.intensity]}1a`,
                        border: `1px solid ${intensityBronze[w.intensity]}55`,
                      }}>
                        {w.intensity}/5 {intensityLabels[w.intensity]}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: C.textSub, fontSize: 13 }}>{w.notes || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
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
        <div style={cardTitle}>➕ Registrar medidas</div>
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
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={btnPrimary} disabled={saving}>
              {saving ? 'Guardando...' : '💾 Guardar medidas'}
            </button>
          </div>
        </form>
      </div>

      {/* Weight chart */}
      {chartData.length > 1 && (
        <div style={card}>
          <div style={cardTitle}>📈 Evolución del peso</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 11, fill: C.textMuted }} domain={['auto', 'auto']} />
              <Tooltip
                formatter={(v) => [`${v} kg`, 'Peso']}
                labelFormatter={l => `Fecha: ${l}`}
                contentStyle={tooltipStyle}
              />
              <Line type="monotone" dataKey="weight_kg" stroke={C.bronzeDark} strokeWidth={2.5} dot={{ r: 3, fill: C.bronzeDark }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div style={card}>
        <div style={cardTitle}>📋 Historial de medidas</div>
        {loading ? (
          <div style={{ color: '#a0907a', textAlign: 'center', padding: 20 }}>Cargando...</div>
        ) : !metrics || metrics.length === 0 ? (
          <div style={{ color: '#a0907a', textAlign: 'center', padding: 20 }}>Sin registros de medidas</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f5f0e8' }}>
                  {['Fecha', 'Peso (kg)', 'Cintura', 'Cadera', 'Pecho', 'Notas', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 12px',
                      textAlign: 'left',
                      color: C.bronzeDark,
                      fontWeight: 700,
                      fontSize: 10,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      borderBottom: `1px solid ${C.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, i) => (
                  <tr key={m.id} style={{
                    background: i % 2 === 0 ? '#ffffff' : '#faf6f0',
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    <td style={{ padding: '10px 12px', color: C.textMuted }}>
                      {new Date(m.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: C.text }}>{m.weight_kg ?? '—'}</td>
                    <td style={{ padding: '10px 12px', color: C.text }}>{m.waist_cm ? `${m.waist_cm} cm` : '—'}</td>
                    <td style={{ padding: '10px 12px', color: C.text }}>{m.hip_cm ? `${m.hip_cm} cm` : '—'}</td>
                    <td style={{ padding: '10px 12px', color: C.text }}>{m.chest_cm ? `${m.chest_cm} cm` : '—'}</td>
                    <td style={{ padding: '10px 12px', color: C.textSub, fontSize: 13 }}>{m.notes || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
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
        <div style={cardTitle}>➕ Añadir récord personal</div>
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
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={btnPrimary} disabled={saving}>
              {saving ? 'Guardando...' : '🏆 Añadir récord'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div style={card}>
        <div style={cardTitle}>🏆 Récords personales</div>
        {loading ? (
          <div style={{ color: '#a0907a', textAlign: 'center', padding: 20 }}>Cargando...</div>
        ) : !records || records.length === 0 ? (
          <div style={{ color: '#a0907a', textAlign: 'center', padding: 20 }}>Sin récords registrados</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {records.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px',
                background: C.cardAlt,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${C.bronze}`,
              }}>
                <div style={{
                  width: 44, height: 44,
                  background: C.marbleLight,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>🏆</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{r.exercise_name}</div>
                  {r.notes && <div style={{ fontSize: 12, color: C.textMuted }}>{r.notes}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.bronzeDark, fontVariantNumeric: 'tabular-nums' }}>{r.value}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.unit}</div>
                </div>
                <div style={{ textAlign: 'right', color: C.textMuted, fontSize: 12, flexShrink: 0, minWidth: 70 }}>
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
          fontSize: 22, fontWeight: 800, color: C.text,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          margin: 0, marginBottom: 4,
        }}>Ejercicio</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ height: 2, width: 32, background: C.bronze, borderRadius: 2 }} />
          <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>Registra tus entrenamientos y progreso físico</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        background: '#f5f0e8',
        padding: 4,
        borderRadius: 8,
        marginBottom: 24,
        width: 'fit-content',
        border: `1px solid ${C.border}`,
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: tab === t.key ? C.bronzeDark : 'transparent',
              color: tab === t.key ? '#ffffff' : C.bronzeDark,
              transition: 'all 0.15s',
              fontFamily: 'inherit',
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
