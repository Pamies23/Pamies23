import React, { useState } from 'react';
import { useApi, apiPost, apiPut, apiDelete } from '../hooks/useApi.js';
import ProgressBar from '../components/ProgressBar.jsx';

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
  transition: 'border-color 0.15s, box-shadow 0.15s',
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

const btnSecondary = {
  background: 'rgba(255,255,255,0.05)',
  color: '#94a3b8',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
};

const btnDanger = {
  background: 'none', color: '#f87171', border: 'none', cursor: 'pointer',
  fontSize: 13, padding: '4px 8px', borderRadius: 6,
  transition: 'background 0.15s',
};

const btnGhost = {
  background: 'none', color: '#64748b', border: 'none', cursor: 'pointer',
  fontSize: 13, padding: '4px 8px', borderRadius: 6,
  transition: 'color 0.15s',
};

const EMPTY_GOAL = { name: '', description: '', category: 'ejercicio', target_value: '', current_value: '', unit: '', deadline: '', status: 'activo' };
const EMPTY_MILESTONE = { name: '', target_value: '' };

function categoryBadge(cat) {
  const map = {
    ejercicio: { bg: 'rgba(124,58,237,0.18)', color: '#a78bfa', border: 'rgba(124,58,237,0.35)', label: 'Ejercicio' },
    dieta: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.3)', label: 'Dieta' },
    general: { bg: 'rgba(37,99,235,0.15)', color: '#60a5fa', border: 'rgba(37,99,235,0.3)', label: 'General' },
  };
  const s = map[cat] || map.general;
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
      padding: '3px 10px', borderRadius: 99, border: `1px solid ${s.border}`,
      letterSpacing: '0.04em',
    }}>
      {s.label}
    </span>
  );
}

function statusBadge(status) {
  const map = {
    activo: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.3)', label: 'Activo' },
    completado: { bg: 'rgba(37,99,235,0.15)', color: '#60a5fa', border: 'rgba(37,99,235,0.3)', label: 'Completado' },
    pausado: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)', label: 'Pausado' },
  };
  const s = map[status] || map.activo;
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
      padding: '3px 10px', borderRadius: 99, border: `1px solid ${s.border}`,
      letterSpacing: '0.04em',
    }}>
      {s.label}
    </span>
  );
}

const categoryBorderColors = {
  ejercicio: '#7c3aed',
  dieta: '#10b981',
  general: '#2563eb',
};

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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Nombre del objetivo *</label>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Ej: Correr 5km" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Descripción</label>
          <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 64 }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descripción opcional..." />
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
      marginTop: 16, padding: 16,
      background: 'rgba(124,58,237,0.06)',
      borderRadius: 12,
      border: '1px solid rgba(124,58,237,0.2)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>🏁 Hitos del objetivo</span>
        <button style={{ ...btnGhost, color: '#94a3b8', fontSize: 12 }} onClick={onClose}>✕ Cerrar</button>
      </div>
      {loading ? <div style={{ color: '#64748b', fontSize: 13 }}>Cargando...</div> : (
        <>
          {milestones && milestones.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {milestones.map(m => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  background: '#12122a', borderRadius: 8,
                  border: m.completed_at ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}>
                  <input
                    type="checkbox"
                    checked={!!m.completed_at}
                    onChange={() => toggleMilestone(m.id)}
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#7c3aed' }}
                  />
                  <span style={{
                    flex: 1, fontSize: 13,
                    color: m.completed_at ? '#64748b' : '#f1f5f9',
                    textDecoration: m.completed_at ? 'line-through' : 'none',
                  }}>{m.name}</span>
                  {m.target_value && (
                    <span style={{ fontSize: 12, color: '#64748b', marginRight: 8 }}>Meta: {m.target_value}</span>
                  )}
                  {m.completed_at && (
                    <span style={{ fontSize: 11, color: '#10b981', marginRight: 4 }}>
                      ✓ {new Date(m.completed_at).toLocaleDateString('es-ES')}
                    </span>
                  )}
                  <button style={btnDanger} onClick={() => deleteMilestone(m.id)}>✕</button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>Sin hitos aún. ¡Añade uno!</div>
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
            <button type="submit" style={{ ...btnPrimary, padding: '10px 14px' }} disabled={adding}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{
            fontSize: 28, fontWeight: 800,
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
          }}>Objetivos</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>Gestiona tus metas de fitness</p>
        </div>
        <button
          style={btnPrimary}
          onClick={() => { setShowForm(true); setEditGoal(null); }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(124,58,237,0.35)'; }}
        >
          + Nuevo objetivo
        </button>
      </div>

      {/* Modal form */}
      {(showForm || editGoal) && (
        <div style={{ ...card, marginBottom: 24, border: '1px solid rgba(124,58,237,0.35)' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18, color: '#f1f5f9' }}>
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'activo', label: '✅ Activos' },
          { key: 'completado', label: '🏆 Completados' },
          { key: 'pausado', label: '⏸ Pausados' },
        ].map(f => (
          <button
            key={f.key}
            style={{
              padding: '8px 18px', borderRadius: 99, fontSize: 13, fontWeight: 700,
              border: 'none', cursor: 'pointer',
              transition: 'all 0.15s',
              background: filter === f.key
                ? 'linear-gradient(135deg, #7c3aed, #2563eb)'
                : 'rgba(255,255,255,0.05)',
              color: filter === f.key ? '#fff' : '#94a3b8',
              boxShadow: filter === f.key ? '0 0 12px rgba(124,58,237,0.35)' : 'none',
            }}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: 48, fontSize: 15 }}>Cargando objetivos...</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: '#475569', padding: 48, fontSize: 14 }}>
          {filter === 'todos' ? 'No hay objetivos aún. ¡Crea uno!' : `No hay objetivos ${filter}s.`}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(goal => {
            const borderColor = categoryBorderColors[goal.category] || '#7c3aed';
            return (
              <div key={goal.id} style={{
                ...card,
                borderLeft: `4px solid ${borderColor}`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 16, color: '#f1f5f9' }}>{goal.name}</span>
                      {categoryBadge(goal.category)}
                      {statusBadge(goal.status)}
                    </div>
                    {goal.description && (
                      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>{goal.description}</div>
                    )}
                    {goal.target_value && (
                      <div style={{ marginBottom: 8 }}>
                        <ProgressBar value={goal.current_value || 0} max={goal.target_value} showLabel />
                        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: '#64748b' }}>
                          <span>📊 <span style={{ color: '#94a3b8' }}>{goal.current_value} / {goal.target_value} {goal.unit}</span></span>
                          {goal.deadline && (
                            <span>⏰ <span style={{ color: '#7c3aed' }}>Límite: {new Date(goal.deadline).toLocaleDateString('es-ES')}</span></span>
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
                      style={{ ...btnGhost, fontSize: 16 }}
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
