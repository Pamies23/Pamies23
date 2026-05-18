import React, { useState } from 'react';
import { useApi, apiPost, apiPut, apiDelete } from '../hooks/useApi.js';
import ProgressBar from '../components/ProgressBar.jsx';

const C = {
  pageBg:     '#eddfc8',
  cardBg:     '#ffffff',
  border:     '#e5e0d6',
  bronze:     '#c4a882',
  bronzeDark: '#9a7040',
  marble:     '#e5e0d6',
  text:       '#1e1812',
  textMuted:  '#a0907a',
  textSub:    '#6b5a40',
  gridLine:   '#e5e0d6',
};

const pageStyle = { padding: '28px 32px', maxWidth: 1100, background: C.pageBg, minHeight: '100vh' };

const card = {
  background: C.cardBg,
  borderRadius: 8,
  padding: 20,
  boxShadow: '0 1px 3px rgba(30,24,18,0.07), 0 4px 12px rgba(30,24,18,0.04)',
  border: `1px solid ${C.border}`,
};

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  background: '#ffffff',
  color: C.text,
  boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.bronzeDark,
  marginBottom: 4,
  display: 'block',
  letterSpacing: '0.03em',
};

const btnPrimary = {
  background: C.bronzeDark,
  color: '#ffffff',
  border: 'none',
  borderRadius: 6,
  padding: '8px 16px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const btnSecondary = {
  background: '#f5f0e8',
  color: C.bronzeDark,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  padding: '8px 16px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const btnDanger = {
  background: 'none',
  color: C.textMuted,
  border: 'none',
  cursor: 'pointer',
  fontSize: 18,
  padding: '4px 8px',
};

const btnGhost = {
  background: 'none',
  color: C.textSub,
  border: 'none',
  cursor: 'pointer',
  fontSize: 13,
  padding: '4px 8px',
};

const badge = {
  background: '#f5f0e8',
  color: C.bronzeDark,
  border: `1px solid ${C.border}`,
  fontSize: 10,
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: 99,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const EMPTY_GOAL = { name: '', description: '', category: 'ejercicio', target_value: '', current_value: '', unit: '', deadline: '', status: 'activo' };
const EMPTY_MILESTONE = { name: '', target_value: '' };

function categoryBadge(cat) {
  const labels = { ejercicio: 'Ejercicio', dieta: 'Dieta', general: 'General' };
  return (
    <span style={badge}>{labels[cat] || cat}</span>
  );
}

function statusBadge(status) {
  const labels = { activo: 'Activo', completado: 'Completado', pausado: 'Pausado' };
  return (
    <span style={badge}>{labels[status] || status}</span>
  );
}

function GoalForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_GOAL);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        target_value: form.target_value ? parseFloat(form.target_value) : null,
        current_value: form.current_value ? parseFloat(form.current_value) : 0,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Nombre del objetivo *</label>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Ej: Correr 5km" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Descripción</label>
          <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descripción opcional..." />
        </div>
        <div>
          <label style={labelStyle}>Categoría *</label>
          <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="ejercicio">Ejercicio</option>
            <option value="dieta">Dieta</option>
            <option value="general">General</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Estado</label>
          <select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="activo">Activo</option>
            <option value="pausado">Pausado</option>
            <option value="completado">Completado</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Valor objetivo</label>
          <input style={inputStyle} type="number" step="0.01" value={form.target_value} onChange={e => set('target_value', e.target.value)} placeholder="Ej: 5" />
        </div>
        <div>
          <label style={labelStyle}>Valor actual</label>
          <input style={inputStyle} type="number" step="0.01" value={form.current_value} onChange={e => set('current_value', e.target.value)} placeholder="Ej: 2.5" />
        </div>
        <div>
          <label style={labelStyle}>Unidad</label>
          <input style={inputStyle} value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="Ej: km, kg, días" />
        </div>
        <div>
          <label style={labelStyle}>Fecha límite</label>
          <input style={inputStyle} type="date" value={form.deadline || ''} onChange={e => set('deadline', e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" style={btnSecondary} onClick={onCancel}>Cancelar</button>
        <button type="submit" style={btnPrimary} disabled={saving}>
          {saving ? 'Guardando...' : (initial?.id ? 'Actualizar' : 'Crear objetivo')}
        </button>
      </div>
    </form>
  );
}

function MilestoneList({ goalId, onClose }) {
  const { data: milestones, loading, refetch } = useApi(`/api/goals/${goalId}/milestones`);
  const [form, setForm] = useState(EMPTY_MILESTONE);
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await apiPost(`/api/goals/${goalId}/milestones`, {
        name: form.name,
        target_value: form.target_value ? parseFloat(form.target_value) : null,
      });
      setForm(EMPTY_MILESTONE);
      refetch();
    } finally {
      setAdding(false);
    }
  };

  const toggleMilestone = async (id) => {
    await apiPut(`/api/milestones/${id}`, {});
    refetch();
  };

  const deleteMilestone = async (id) => {
    if (!confirm('¿Eliminar este hito?')) return;
    await apiDelete(`/api/milestones/${id}`);
    refetch();
  };

  return (
    <div style={{
      marginTop: 16,
      padding: 16,
      background: '#faf6f0',
      borderRadius: 8,
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{
          fontWeight: 700,
          fontSize: 14,
          color: C.bronzeDark,
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}>🏁 Hitos del objetivo</span>
        <button style={{ ...btnGhost, color: C.textSub }} onClick={onClose}>✕ Cerrar</button>
      </div>
      {loading ? (
        <div style={{ color: C.textSub, fontSize: 13 }}>Cargando...</div>
      ) : (
        <>
          {milestones && milestones.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {milestones.map(m => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                  background: '#faf6f0', borderRadius: 6, borderLeft: `3px solid ${C.bronze}`,
                  border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.bronze}`,
                }}>
                  <input
                    type="checkbox"
                    checked={!!m.completed_at}
                    onChange={() => toggleMilestone(m.id)}
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: C.bronze }}
                  />
                  <span style={{
                    flex: 1, fontSize: 13,
                    color: m.completed_at ? C.textMuted : C.text,
                    textDecoration: m.completed_at ? 'line-through' : 'none',
                  }}>{m.name}</span>
                  {m.target_value && (
                    <span style={{ fontSize: 12, color: C.textSub, marginRight: 8 }}>Meta: {m.target_value}</span>
                  )}
                  {m.completed_at && (
                    <span style={{ fontSize: 11, color: C.bronzeDark, marginRight: 4 }}>
                      ✓ {new Date(m.completed_at).toLocaleDateString('es-ES')}
                    </span>
                  )}
                  <button style={btnDanger} onClick={() => deleteMilestone(m.id)}>✕</button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: C.textSub, marginBottom: 12 }}>Sin hitos aún. ¡Añade uno!</div>
          )}
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nombre del hito"
              required
            />
            <input
              style={{ ...inputStyle, width: 90 }}
              type="number"
              step="0.01"
              value={form.target_value}
              onChange={e => setForm(f => ({ ...f, target_value: e.target.value }))}
              placeholder="Valor"
            />
            <button type="submit" style={{ ...btnPrimary, padding: '9px 14px' }} disabled={adding}>
              {adding ? '...' : '+ Añadir'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function Objetivos() {
  const { data: goals, loading, refetch } = useApi('/api/goals');
  const [filter, setFilter] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [expandedMilestones, setExpandedMilestones] = useState(null);

  const filtered = goals ? goals.filter(g => filter === 'todos' || g.status === filter) : [];

  const handleCreate = async (data) => {
    await apiPost('/api/goals', data);
    setShowForm(false);
    refetch();
  };

  const handleEdit = async (data) => {
    await apiPut(`/api/goals/${editGoal.id}`, data);
    setEditGoal(null);
    refetch();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este objetivo y todos sus hitos?')) return;
    await apiDelete(`/api/goals/${id}`);
    refetch();
  };

  const toggleStatus = async (goal) => {
    const nextStatus = goal.status === 'activo' ? 'pausado' : 'activo';
    await apiPut(`/api/goals/${goal.id}`, { status: nextStatus });
    refetch();
  };

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: C.text,
            fontFamily: "Georgia, 'Times New Roman', serif",
            letterSpacing: '0.04em',
            margin: 0,
            paddingBottom: 8,
            borderBottom: `3px solid ${C.bronze}`,
            display: 'inline-block',
            textTransform: 'uppercase',
          }}>Objetivos</h1>
          <p style={{ color: C.textSub, fontSize: 14, marginTop: 6 }}>Gestiona tus metas de fitness</p>
        </div>
        <button
          style={btnPrimary}
          onClick={() => { setShowForm(true); setEditGoal(null); }}
        >
          + Nuevo objetivo
        </button>
      </div>

      {/* Modal form */}
      {(showForm || editGoal) && (
        <div style={{
          ...card,
          marginBottom: 24,
          borderTop: `3px solid ${C.bronze}`,
        }}>
          <div style={{
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 16,
            color: C.bronzeDark,
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}>
            {editGoal ? '✏️ Editar objetivo' : '🎯 Nuevo objetivo'}
          </div>
          <GoalForm
            initial={editGoal}
            onSave={editGoal ? handleEdit : handleCreate}
            onCancel={() => { setShowForm(false); setEditGoal(null); }}
          />
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'activo', label: 'Activos' },
          { key: 'completado', label: 'Completados' },
          { key: 'pausado', label: 'Pausados' },
        ].map(f => (
          <button
            key={f.key}
            style={{
              padding: '7px 16px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: filter === f.key ? C.bronzeDark : '#f5f0e8',
              color: filter === f.key ? '#ffffff' : C.bronzeDark,
              transition: 'all 0.15s',
            }}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: C.textSub, padding: 40, fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Cargando objetivos...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: C.textSub, padding: 40 }}>
          {filter === 'todos' ? 'No hay objetivos aún. ¡Crea uno!' : `No hay objetivos ${filter}s.`}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(goal => {
            const pct = goal.target_value > 0
              ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
              : 0;
            return (
              <div key={goal.id} style={{
                ...card,
                borderLeft: `4px solid ${C.bronze}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: C.text,
                        fontFamily: "Georgia, 'Times New Roman', serif",
                      }}>{goal.name}</span>
                      {categoryBadge(goal.category)}
                      {statusBadge(goal.status)}
                    </div>
                    {goal.description && (
                      <div style={{ fontSize: 13, color: C.textSub, marginBottom: 10 }}>{goal.description}</div>
                    )}
                    {goal.target_value && (
                      <div style={{ marginBottom: 10 }}>
                        <ProgressBar value={goal.current_value || 0} max={goal.target_value} showLabel />
                        <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12, color: C.textSub }}>
                          <span>📊 {goal.current_value} / {goal.target_value} {goal.unit}</span>
                          {goal.deadline && (
                            <span>⏰ Límite: {new Date(goal.deadline).toLocaleDateString('es-ES')}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button
                      style={{ ...btnGhost, fontSize: 18 }}
                      onClick={() => setExpandedMilestones(expandedMilestones === goal.id ? null : goal.id)}
                      title="Ver hitos"
                    >🏁</button>
                    <button
                      style={{ ...btnGhost, fontSize: 18 }}
                      onClick={() => { setEditGoal(goal); setShowForm(false); }}
                      title="Editar"
                    >✏️</button>
                    <button
                      style={{ ...btnGhost, fontSize: 14 }}
                      onClick={() => toggleStatus(goal)}
                      title={goal.status === 'activo' ? 'Pausar' : 'Activar'}
                    >{goal.status === 'activo' ? '⏸️' : '▶️'}</button>
                    <button
                      style={{ ...btnDanger, fontSize: 18 }}
                      onClick={() => handleDelete(goal.id)}
                      title="Eliminar"
                    >🗑️</button>
                  </div>
                </div>
                {expandedMilestones === goal.id && (
                  <MilestoneList goalId={goal.id} onClose={() => setExpandedMilestones(null)} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
