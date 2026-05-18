import React, { useState } from 'react';
import { useApi, apiPost, apiPut, apiDelete } from '../hooks/useApi.js';
import ProgressBar from '../components/ProgressBar.jsx';

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

const btnSecondary = {
  background: '#fdf6e3',
  color: '#7a4e0d',
  border: '1px solid #c9a055',
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
  padding: '4px 8px',
};

const btnGhost = {
  background: 'none',
  color: '#7a6040',
  border: 'none',
  cursor: 'pointer',
  fontSize: 13,
  padding: '4px 8px',
};

const EMPTY_GOAL = { name: '', description: '', category: 'ejercicio', target_value: '', current_value: '', unit: '', deadline: '', status: 'activo' };
const EMPTY_MILESTONE = { name: '', target_value: '' };

function categoryBadge(cat) {
  const map = {
    ejercicio: { bg: 'rgba(139,94,26,0.15)', color: '#7a4e0d', label: 'Ejercicio' },
    dieta: { bg: 'rgba(90,122,58,0.15)', color: '#3d5a28', label: 'Dieta' },
    general: { bg: 'rgba(184,107,26,0.15)', color: '#8a4e10', label: 'General' },
  };
  const s = map[cat] || map.general;
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 600,
      padding: '2px 8px', borderRadius: 99, border: `1px solid ${s.color}44`,
      letterSpacing: '0.03em',
    }}>{s.label}</span>
  );
}

function statusBadge(status) {
  const map = {
    activo: { bg: 'rgba(90,122,58,0.15)', color: '#3d5a28', label: 'Activo' },
    completado: { bg: 'rgba(46,107,138,0.15)', color: '#1a4e6b', label: 'Completado' },
    pausado: { bg: 'rgba(184,107,26,0.15)', color: '#8a4e10', label: 'Pausado' },
  };
  const s = map[status] || map.activo;
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 600,
      padding: '2px 8px', borderRadius: 99, border: `1px solid ${s.color}44`,
    }}>{s.label}</span>
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
      background: '#fdf6e3',
      borderRadius: 8,
      border: '1px solid rgba(201,160,85,0.4)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{
          fontWeight: 700,
          fontSize: 14,
          color: '#7a4e0d',
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}>🏁 Hitos del objetivo</span>
        <button style={{ ...btnGhost, color: '#7a6040' }} onClick={onClose}>✕ Cerrar</button>
      </div>
      {loading ? (
        <div style={{ color: '#7a6040', fontSize: 13 }}>Cargando...</div>
      ) : (
        <>
          {milestones && milestones.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {milestones.map(m => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                  background: '#fffbf0', borderRadius: 8, border: '1px solid rgba(201,160,85,0.3)',
                }}>
                  <input
                    type="checkbox"
                    checked={!!m.completed_at}
                    onChange={() => toggleMilestone(m.id)}
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#c9a055' }}
                  />
                  <span style={{
                    flex: 1, fontSize: 13,
                    color: m.completed_at ? '#7a6040' : '#2a1a08',
                    textDecoration: m.completed_at ? 'line-through' : 'none',
                  }}>{m.name}</span>
                  {m.target_value && (
                    <span style={{ fontSize: 12, color: '#7a6040', marginRight: 8 }}>Meta: {m.target_value}</span>
                  )}
                  {m.completed_at && (
                    <span style={{ fontSize: 11, color: '#5a7a3a', marginRight: 4 }}>
                      ✓ {new Date(m.completed_at).toLocaleDateString('es-ES')}
                    </span>
                  )}
                  <button style={btnDanger} onClick={() => deleteMilestone(m.id)}>✕</button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: '#7a6040', marginBottom: 12 }}>Sin hitos aún. ¡Añade uno!</div>
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
            color: '#7a4e0d',
            fontFamily: "Georgia, 'Times New Roman', serif",
            letterSpacing: '0.04em',
            margin: 0,
            paddingBottom: 8,
            borderBottom: '2px solid rgba(201,160,85,0.5)',
            display: 'inline-block',
          }}>Objetivos</h1>
          <p style={{ color: '#7a6040', fontSize: 14, marginTop: 6 }}>Gestiona tus metas de fitness</p>
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
          borderTop: '3px solid #c9a055',
        }}>
          <div style={{
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 16,
            color: '#7a4e0d',
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
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 600,
              border: filter === f.key ? '1px solid #7a4e0d' : '1px solid #c9a055',
              cursor: 'pointer',
              background: filter === f.key ? '#8b5e1a' : '#fdf6e3',
              color: filter === f.key ? '#fdf6e3' : '#7a4e0d',
              transition: 'all 0.15s',
            }}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#7a6040', padding: 40, fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Cargando objetivos...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: '#7a6040', padding: 40 }}>
          {filter === 'todos' ? 'No hay objetivos aún. ¡Crea uno!' : `No hay objetivos ${filter}s.`}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(goal => {
            const pct = goal.target_value > 0
              ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
              : 0;
            const catBorderColors = {
              ejercicio: '#8b5e1a',
              dieta: '#5a7a3a',
              general: '#b86b1a',
            };
            const borderColor = catBorderColors[goal.category] || '#c9a055';
            return (
              <div key={goal.id} style={{
                ...card,
                borderLeft: `4px solid ${borderColor}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: '#2a1a08',
                        fontFamily: "Georgia, 'Times New Roman', serif",
                      }}>{goal.name}</span>
                      {categoryBadge(goal.category)}
                      {statusBadge(goal.status)}
                    </div>
                    {goal.description && (
                      <div style={{ fontSize: 13, color: '#7a6040', marginBottom: 10 }}>{goal.description}</div>
                    )}
                    {goal.target_value && (
                      <div style={{ marginBottom: 10 }}>
                        <ProgressBar value={goal.current_value || 0} max={goal.target_value} showLabel />
                        <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12, color: '#7a6040' }}>
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
