const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ==================== GOALS ====================

app.get('/api/goals', (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM goals ORDER BY created_at DESC';
  let goals;
  if (status) {
    goals = db.prepare('SELECT * FROM goals WHERE status = ? ORDER BY created_at DESC').all(status);
  } else {
    goals = db.prepare(query).all();
  }
  res.json(goals);
});

app.post('/api/goals', (req, res) => {
  const { name, description, category, target_value, current_value, unit, deadline, status } = req.body;
  if (!name || !category) {
    return res.status(400).json({ error: 'name y category son requeridos' });
  }
  const stmt = db.prepare(`
    INSERT INTO goals (name, description, category, target_value, current_value, unit, deadline, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    name, description || null, category,
    target_value || null, current_value || 0,
    unit || null, deadline || null, status || 'activo'
  );
  const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(goal);
});

app.put('/api/goals/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, category, target_value, current_value, unit, deadline, status } = req.body;
  const existing = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Objetivo no encontrado' });

  db.prepare(`
    UPDATE goals SET name=?, description=?, category=?, target_value=?, current_value=?, unit=?, deadline=?, status=?
    WHERE id=?
  `).run(
    name ?? existing.name,
    description ?? existing.description,
    category ?? existing.category,
    target_value ?? existing.target_value,
    current_value ?? existing.current_value,
    unit ?? existing.unit,
    deadline ?? existing.deadline,
    status ?? existing.status,
    id
  );
  const updated = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
  res.json(updated);
});

app.delete('/api/goals/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Objetivo no encontrado' });
  db.prepare('DELETE FROM goals WHERE id = ?').run(id);
  res.json({ message: 'Objetivo eliminado' });
});

// ==================== MILESTONES ====================

app.get('/api/goals/:id/milestones', (req, res) => {
  const milestones = db.prepare('SELECT * FROM milestones WHERE goal_id = ? ORDER BY target_value ASC').all(req.params.id);
  res.json(milestones);
});

app.post('/api/goals/:id/milestones', (req, res) => {
  const { name, target_value } = req.body;
  if (!name) return res.status(400).json({ error: 'name es requerido' });
  const stmt = db.prepare('INSERT INTO milestones (goal_id, name, target_value) VALUES (?, ?, ?)');
  const result = stmt.run(req.params.id, name, target_value || null);
  const milestone = db.prepare('SELECT * FROM milestones WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(milestone);
});

app.put('/api/milestones/:id', (req, res) => {
  const { id } = req.params;
  const milestone = db.prepare('SELECT * FROM milestones WHERE id = ?').get(id);
  if (!milestone) return res.status(404).json({ error: 'Hito no encontrado' });
  const completed_at = milestone.completed_at ? null : new Date().toISOString();
  db.prepare('UPDATE milestones SET completed_at = ? WHERE id = ?').run(completed_at, id);
  const updated = db.prepare('SELECT * FROM milestones WHERE id = ?').get(id);
  res.json(updated);
});

app.delete('/api/milestones/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM milestones WHERE id = ?').run(id);
  res.json({ message: 'Hito eliminado' });
});

// ==================== WORKOUTS ====================

app.get('/api/workouts', (req, res) => {
  const workouts = db.prepare('SELECT * FROM workouts ORDER BY date DESC, created_at DESC').all();
  res.json(workouts);
});

app.post('/api/workouts', (req, res) => {
  const { date, type, duration_min, intensity, notes } = req.body;
  if (!date || !type || !duration_min || !intensity) {
    return res.status(400).json({ error: 'date, type, duration_min e intensity son requeridos' });
  }
  const result = db.prepare(`
    INSERT INTO workouts (date, type, duration_min, intensity, notes) VALUES (?, ?, ?, ?, ?)
  `).run(date, type, duration_min, intensity, notes || null);
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(workout);
});

app.delete('/api/workouts/:id', (req, res) => {
  db.prepare('DELETE FROM workouts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Entrenamiento eliminado' });
});

// ==================== BODY METRICS ====================

app.get('/api/body-metrics', (req, res) => {
  const metrics = db.prepare('SELECT * FROM body_metrics ORDER BY date DESC').all();
  res.json(metrics);
});

app.post('/api/body-metrics', (req, res) => {
  const { date, weight_kg, waist_cm, hip_cm, chest_cm, notes } = req.body;
  if (!date) return res.status(400).json({ error: 'date es requerido' });
  const result = db.prepare(`
    INSERT INTO body_metrics (date, weight_kg, waist_cm, hip_cm, chest_cm, notes) VALUES (?, ?, ?, ?, ?, ?)
  `).run(date, weight_kg || null, waist_cm || null, hip_cm || null, chest_cm || null, notes || null);
  const metric = db.prepare('SELECT * FROM body_metrics WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(metric);
});

app.delete('/api/body-metrics/:id', (req, res) => {
  db.prepare('DELETE FROM body_metrics WHERE id = ?').run(req.params.id);
  res.json({ message: 'Medida eliminada' });
});

// ==================== PERSONAL RECORDS ====================

app.get('/api/personal-records', (req, res) => {
  const records = db.prepare('SELECT * FROM personal_records ORDER BY date DESC').all();
  res.json(records);
});

app.post('/api/personal-records', (req, res) => {
  const { exercise_name, value, unit, date, notes } = req.body;
  if (!exercise_name || !value || !unit || !date) {
    return res.status(400).json({ error: 'exercise_name, value, unit y date son requeridos' });
  }
  const result = db.prepare(`
    INSERT INTO personal_records (exercise_name, value, unit, date, notes) VALUES (?, ?, ?, ?, ?)
  `).run(exercise_name, value, unit, date, notes || null);
  const record = db.prepare('SELECT * FROM personal_records WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(record);
});

app.delete('/api/personal-records/:id', (req, res) => {
  db.prepare('DELETE FROM personal_records WHERE id = ?').run(req.params.id);
  res.json({ message: 'Récord eliminado' });
});

// ==================== DIET LOGS ====================

app.get('/api/diet-logs', (req, res) => {
  const { date } = req.query;
  let logs;
  if (date) {
    logs = db.prepare('SELECT * FROM diet_logs WHERE date = ?').all(date);
  } else {
    logs = db.prepare('SELECT * FROM diet_logs ORDER BY date DESC').all();
  }
  res.json(logs);
});

app.post('/api/diet-logs', (req, res) => {
  const { date, calories, water_ml, notes } = req.body;
  if (!date) return res.status(400).json({ error: 'date es requerido' });
  const existing = db.prepare('SELECT * FROM diet_logs WHERE date = ?').get(date);
  if (existing) {
    db.prepare('UPDATE diet_logs SET calories=?, water_ml=?, notes=? WHERE date=?')
      .run(calories || existing.calories, water_ml ?? existing.water_ml, notes ?? existing.notes, date);
    const updated = db.prepare('SELECT * FROM diet_logs WHERE date = ?').get(date);
    return res.json(updated);
  }
  const result = db.prepare(`
    INSERT INTO diet_logs (date, calories, water_ml, notes) VALUES (?, ?, ?, ?)
  `).run(date, calories || null, water_ml || 0, notes || null);
  const log = db.prepare('SELECT * FROM diet_logs WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(log);
});

app.get('/api/diet-logs/:id/meals', (req, res) => {
  const meals = db.prepare('SELECT * FROM meals WHERE diet_log_id = ? ORDER BY time_of_day ASC, created_at ASC').all(req.params.id);
  res.json(meals);
});

app.post('/api/diet-logs/:id/meals', (req, res) => {
  const { name, calories, time_of_day } = req.body;
  if (!name || !calories || !time_of_day) {
    return res.status(400).json({ error: 'name, calories y time_of_day son requeridos' });
  }
  const result = db.prepare(`
    INSERT INTO meals (diet_log_id, name, calories, time_of_day) VALUES (?, ?, ?, ?)
  `).run(req.params.id, name, calories, time_of_day);

  // Update total calories in diet_log
  const totalCals = db.prepare('SELECT SUM(calories) as total FROM meals WHERE diet_log_id = ?').get(req.params.id);
  db.prepare('UPDATE diet_logs SET calories = ? WHERE id = ?').run(totalCals.total, req.params.id);

  const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(meal);
});

app.delete('/api/meals/:id', (req, res) => {
  const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(req.params.id);
  if (!meal) return res.status(404).json({ error: 'Comida no encontrada' });
  db.prepare('DELETE FROM meals WHERE id = ?').run(req.params.id);

  // Update total calories
  const totalCals = db.prepare('SELECT SUM(calories) as total FROM meals WHERE diet_log_id = ?').get(meal.diet_log_id);
  db.prepare('UPDATE diet_logs SET calories = ? WHERE id = ?').run(totalCals.total || 0, meal.diet_log_id);

  res.json({ message: 'Comida eliminada' });
});

// ==================== STREAKS ====================

app.get('/api/streaks', (req, res) => {
  const streaks = db.prepare('SELECT * FROM streaks').all();
  res.json(streaks);
});

app.post('/api/streaks/update', (req, res) => {
  const { habit_type } = req.body;
  if (!habit_type) return res.status(400).json({ error: 'habit_type es requerido' });

  const today = new Date().toISOString().split('T')[0];
  const existing = db.prepare('SELECT * FROM streaks WHERE habit_type = ?').get(habit_type);

  if (!existing) {
    const result = db.prepare(`
      INSERT INTO streaks (habit_type, current_streak, longest_streak, last_recorded_date)
      VALUES (?, 1, 1, ?)
    `).run(habit_type, today);
    return res.json(db.prepare('SELECT * FROM streaks WHERE id = ?').get(result.lastInsertRowid));
  }

  const lastDate = existing.last_recorded_date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak;
  if (lastDate === today) {
    return res.json(existing); // Already recorded today
  } else if (lastDate === yesterdayStr) {
    newStreak = existing.current_streak + 1;
  } else {
    newStreak = 1; // Streak broken
  }

  const longestStreak = Math.max(newStreak, existing.longest_streak);
  db.prepare(`
    UPDATE streaks SET current_streak=?, longest_streak=?, last_recorded_date=?, updated_at=datetime('now')
    WHERE habit_type=?
  `).run(newStreak, longestStreak, today, habit_type);

  const updated = db.prepare('SELECT * FROM streaks WHERE habit_type = ?').get(habit_type);
  res.json(updated);
});

// ==================== DASHBOARD ====================

app.get('/api/dashboard', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthAgoStr = monthAgo.toISOString().split('T')[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  // Calories today
  const todayLog = db.prepare('SELECT * FROM diet_logs WHERE date = ?').get(today);

  // Workouts this week
  const workoutsThisWeek = db.prepare(
    'SELECT COUNT(*) as count FROM workouts WHERE date >= ? AND date <= ?'
  ).get(weekAgoStr, today);

  // Latest weight
  const latestWeight = db.prepare(
    'SELECT weight_kg FROM body_metrics WHERE weight_kg IS NOT NULL ORDER BY date DESC LIMIT 1'
  ).get();

  // Streaks
  const streaks = db.prepare('SELECT * FROM streaks').all();
  const trainStreak = streaks.find(s => s.habit_type === 'entrenamiento');

  // Weight last 30 days
  const weightHistory = db.prepare(
    'SELECT date, weight_kg FROM body_metrics WHERE date >= ? AND weight_kg IS NOT NULL ORDER BY date ASC'
  ).all(monthAgoStr);

  // Calories last 7 days
  const caloriesHistory = db.prepare(
    'SELECT date, calories FROM diet_logs WHERE date >= ? ORDER BY date ASC'
  ).all(sevenDaysAgoStr);

  // Active goals
  const activeGoals = db.prepare(
    "SELECT * FROM goals WHERE status = 'activo' ORDER BY created_at DESC"
  ).all();

  // Recent workouts
  const recentWorkouts = db.prepare(
    'SELECT * FROM workouts ORDER BY date DESC, created_at DESC LIMIT 5'
  ).all();

  // Recent diet logs
  const recentDietLogs = db.prepare(
    'SELECT * FROM diet_logs ORDER BY date DESC LIMIT 5'
  ).all();

  res.json({
    summary: {
      caloriesHoy: todayLog?.calories || 0,
      workoutsThisWeek: workoutsThisWeek.count,
      currentWeight: latestWeight?.weight_kg || null,
      currentStreak: trainStreak?.current_streak || 0,
    },
    weightHistory,
    caloriesHistory,
    activeGoals,
    recentWorkouts,
    recentDietLogs,
    streaks,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
