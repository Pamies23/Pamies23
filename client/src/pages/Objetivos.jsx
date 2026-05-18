import React, { useState } from 'react';
import { useApi, apiPost, apiPut, apiDelete } from '../hooks/useApi.js';
import ProgressBar from '../components/ProgressBar.jsx';
import {
  C, card, inputStyle, labelStyle, btnPrimary, btnSecondary,
  badge, categoryColor, statusColor,
} from '../theme.js';

const btnGhost = {
  background: 'none',
  color: C.textSub,
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  padding: '4px 8px',
  borderRadius: 4,
};

const btnDanger = {
  background: 'none',
  color: C.textMuted,
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  padding: '4px 8px',
};

const EMPTY_GOAL = { name: '', description: '', category: 'ejercicio', target_value: '', current_value: '', unit: '', deadline: '', status: 'activo' };
const EMPTY_MILESTONE = { name: '', target_value: '' };

const CAT_LABELS = { ejercicio: 'Ejercicio', dieta: 'Dieta', general: 'General' };
const STATUS_LABELS = { activo: 'Activo', completado: 'Completado', pausado: 'Pausado' };

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

  const toggleMilestone = async (id) => { await apiPut(`/api/milestones/${id}`, {}); refetch(); };
  const deleteMilestone = async (id) => {
    if (!confirm('¿Eliminar este hito?')) return;
    await apiDelete(`/api/milestones/${id}`);
    refetch();
  };

  return (
    <div style={{
      marginTop: 16, padding: 16,
      background: C.cardAlt, borderRadius: 8, border: `1px solid ${C.border}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{
          fontWeight: 700, fontSize: 11, color: C.bronzeDark,
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>Hitos del objetivo</span>
        <button style={btnGhost} onClick={onClose}>✕ Cerrar</button>
      </div>
      {loading ? (
        <div style={{ color: C.textMuted, fontSize: 13 }}>Cargando...</div>
      ) : (
        <>
          {milestones && milestones.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {milestones.map(m => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                  background: C.cardBg, borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  borderLeft: `3px solid ${m.completed_at ? C.cypress : C.bronze}`,
                }}>
                  <input
                    type="checkbox" checked={!!m.completed_at}
                    onChange={() => toggleMilestone(m.id)}
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: C.cypress }}
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
                    <span style={{ fontSize: 11, color: C.cypress, marginRight: 4 }}>
                      ✓ {new Date(m.completed_at).toLocaleDateString('es-ES')}
                    </span>
                  )}
                  <button style={btnDanger} onClick={() => deleteMilestone(m.id)}>✕</button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 12 }}>Sin hitos aún. ¡Añade uno!</div>
          )}
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8 }}>
            <input
              style={{ ...inputStyle, flex: 1 }} value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nombre del hito" required
            />
            <input
              style={{ ...inputStyle, width: 90 }} type="number" step="0.01"
              value={form.target_value}
              onChange={e => setForm(f => ({ ...f, target_value: e.target.value }))}
              placeholder="Valor"
            />
            <button type="submit" style={btnPrimary} disabled={adding}>
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

  const handleCreate = async (data) => { await apiPost('/api/goals', data); setShowForm(false); refetch(); };
  const handleEdit = async (data) => { await apiPut(`/api/goals/${editGoal.id}`, data); setEditGoal(null); refetch(); };
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
    <div style={{ padding: '28px 32px', maxWidth: 1100, background: C.pageBg, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{
            fontSize: 22, fontWeight: 800, color: C.text,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            margin: 0, marginBottom: 4,
          }}>Objetivos</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ height: 2, width: 32, background: C.bronze, borderRadius: 2 }} />
            <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>Gestiona tus metas de fitness</p>
          </div>
        </div>
        <button style={btnPrimary} onClick={() => { setShowForm(true); setEditGoal(null); }}>
          + Nuevo objetivo
        </button>
      </div>

      {/* Form */}
      {(showForm || editGoal) && (
        <div style={{ ...card, marginBottom: 20, borderTop: `3px solid ${C.bronze}` }}>
          <div style={{
            fontWeight: 700, fontSize: 11, color: C.bronzeDark,
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16,
            borderBottom: `1px solid ${C.border}`, paddingBottom: 10,
          }}>
            {editGoal ? 'Editar objetivo' : 'Nuevo objetivo'}
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
              padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700,
              border: filter === f.key ? 'none' : `1px solid ${C.border}`,
              cursor: 'pointer',
              background: filter === f.key ? C.bronzeDark : C.marbleLight,
              color: filter === f.key ? '#ffffff' : C.bronzeDark,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: C.textMuted, padding: 40, letterSpacing: '0.08em' }}>CARGANDO OBJETIVOS...</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: C.textMuted, padding: 40 }}>
          {filter === 'todos' ? 'No hay objetivos aún. ¡Crea uno!' : `No hay objetivos ${filter}s.`}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(goal => {
            const catColor = categoryColor(goal.category);
            return (
              <div key={goal.id} style={{ ...card, borderLeft: `4px solid ${catColor}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{goal.name}</span>
                      <span style={badge(catColor)}>{CAT_LABELS[goal.category] || goal.category}</span>
                      <span style={badge(statusColor(goal.status))}>{STATUS_LABELS[goal.status] || goal.status}</span>
                    </div>
                    {goal.description && (
                      <div style={{ fontSize: 13, color: C.textSub, marginBottom: 10 }}>{goal.description}</div>
                    )}
                    {goal.target_value && (
                      <div style={{ marginBottom: 4 }}>
                        <ProgressBar value={goal.current_value || 0} max={goal.target_value} showLabel />
                        <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12, color: C.textMuted }}>
                          <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
                          {goal.deadline && <span>⏰ {new Date(goal.deadline).toLocaleDateString('es-ES')}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                    <button style={btnGhost} onClick={() => setExpandedMilestones(expandedMilestones === goal.id ? null : goal.id)} title="Ver hitos">🏁</button>
                    <button style={btnGhost} onClick={() => { setEditGoal(goal); setShowForm(false); }} title="Editar">✏️</button>
                    <button style={btnGhost} onClick={() => toggleStatus(goal)} title={goal.status === 'activo' ? 'Pausar' : 'Activar'}>
                      {goal.status === 'activo' ? '⏸️' : '▶️'}
                    </button>
                    <button style={btnDanger} onClick={() => handleDelete(goal.id)} title="Eliminar">🗑️</button>
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
