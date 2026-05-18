const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'fitness.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK(category IN ('ejercicio', 'dieta', 'general')),
    target_value REAL,
    current_value REAL DEFAULT 0,
    unit TEXT,
    deadline TEXT,
    status TEXT NOT NULL DEFAULT 'activo' CHECK(status IN ('activo', 'completado', 'pausado')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_value REAL,
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    duration_min INTEGER NOT NULL,
    intensity INTEGER NOT NULL CHECK(intensity BETWEEN 1 AND 5),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS body_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    weight_kg REAL,
    waist_cm REAL,
    hip_cm REAL,
    chest_cm REAL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS personal_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_name TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS diet_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    calories INTEGER,
    water_ml INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    diet_log_id INTEGER NOT NULL REFERENCES diet_logs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    time_of_day TEXT NOT NULL CHECK(time_of_day IN ('desayuno', 'almuerzo', 'merienda', 'cena', 'snack')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS streaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_type TEXT NOT NULL UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_recorded_date TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Seed data if tables are empty
function seedData() {
  const goalsCount = db.prepare('SELECT COUNT(*) as count FROM goals').get();
  if (goalsCount.count > 0) return;

  console.log('Seeding sample data...');

  // Goals
  const insertGoal = db.prepare(`
    INSERT INTO goals (name, description, category, target_value, current_value, unit, deadline, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const goal1 = insertGoal.run('Correr 5km sin parar', 'Mejorar resistencia cardiovascular hasta poder correr 5km continuos', 'ejercicio', 5, 3.2, 'km', '2025-06-30', 'activo');
  const goal2 = insertGoal.run('Perder 5kg', 'Reducir peso corporal de forma saludable', 'dieta', 5, 2.5, 'kg', '2025-07-31', 'activo');
  const goal3 = insertGoal.run('Beber 2L de agua al día', 'Mantener hidratación diaria adecuada', 'dieta', 2000, 1800, 'ml', null, 'activo');
  const goal4 = insertGoal.run('Press banca 80kg', 'Aumentar fuerza en press de banca', 'ejercicio', 80, 65, 'kg', '2025-08-31', 'activo');
  const goal5 = insertGoal.run('Meditar 30 días seguidos', 'Establecer hábito de meditación diaria', 'general', 30, 30, 'días', '2025-04-30', 'completado');

  // Milestones
  const insertMilestone = db.prepare(`
    INSERT INTO milestones (goal_id, name, target_value, completed_at)
    VALUES (?, ?, ?, ?)
  `);
  insertMilestone.run(goal1.lastInsertRowid, 'Correr 1km sin parar', 1, '2025-03-01T10:00:00');
  insertMilestone.run(goal1.lastInsertRowid, 'Correr 2km sin parar', 2, '2025-03-15T10:00:00');
  insertMilestone.run(goal1.lastInsertRowid, 'Correr 3km sin parar', 3, null);
  insertMilestone.run(goal1.lastInsertRowid, 'Correr 5km sin parar', 5, null);
  insertMilestone.run(goal2.lastInsertRowid, 'Perder 1kg', 1, '2025-03-10T10:00:00');
  insertMilestone.run(goal2.lastInsertRowid, 'Perder 2.5kg', 2.5, '2025-04-01T10:00:00');
  insertMilestone.run(goal2.lastInsertRowid, 'Perder 5kg', 5, null);

  // Workouts - last 30 days
  const insertWorkout = db.prepare(`
    INSERT INTO workouts (date, type, duration_min, intensity, notes)
    VALUES (?, ?, ?, ?, ?)
  `);
  const workoutTypes = ['Correr', 'Ciclismo', 'Natación', 'Pesas', 'Yoga', 'HIIT', 'Senderismo'];
  const workoutNotes = ['Buena sesión', 'Me sentí con energía', 'Un poco cansado', 'Excelente ritmo', null];
  const today = new Date();
  for (let i = 0; i < 20; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - Math.floor(Math.random() * 30));
    const dateStr = d.toISOString().split('T')[0];
    const type = workoutTypes[Math.floor(Math.random() * workoutTypes.length)];
    const duration = 30 + Math.floor(Math.random() * 60);
    const intensity = 1 + Math.floor(Math.random() * 5);
    const notes = workoutNotes[Math.floor(Math.random() * workoutNotes.length)];
    insertWorkout.run(dateStr, type, duration, intensity, notes);
  }

  // Body metrics - last 60 days
  const insertMetrics = db.prepare(`
    INSERT INTO body_metrics (date, weight_kg, waist_cm, hip_cm, chest_cm, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  let weight = 82.5;
  for (let i = 59; i >= 0; i -= 3) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    weight = weight - (Math.random() * 0.4 - 0.1);
    insertMetrics.run(dateStr, parseFloat(weight.toFixed(1)), 86 - i * 0.05, 98.0, 95.0, null);
  }

  // Personal records
  const insertPR = db.prepare(`
    INSERT INTO personal_records (exercise_name, value, unit, date, notes)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertPR.run('Press de banca', 65, 'kg', '2025-04-15', '¡Nuevo récord personal!');
  insertPR.run('Sentadilla', 90, 'kg', '2025-04-10', 'Buena forma técnica');
  insertPR.run('Peso muerto', 110, 'kg', '2025-04-20', 'Sin cinturón');
  insertPR.run('Carrera 5km', 28, 'min', '2025-03-25', 'Pista municipal');
  insertPR.run('Dominadas', 12, 'repeticiones', '2025-04-18', 'Sin ayuda');

  // Diet logs - last 14 days
  const insertDietLog = db.prepare(`
    INSERT INTO diet_logs (date, calories, water_ml, notes)
    VALUES (?, ?, ?, ?)
  `);
  const insertMeal = db.prepare(`
    INSERT INTO meals (diet_log_id, name, calories, time_of_day)
    VALUES (?, ?, ?, ?)
  `);
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const calories = 1800 + Math.floor(Math.random() * 600) - 200;
    const water = 1500 + Math.floor(Math.random() * 1000);
    const log = insertDietLog.run(dateStr, calories, water, null);
    const logId = log.lastInsertRowid;

    insertMeal.run(logId, 'Avena con frutas', 350, 'desayuno');
    insertMeal.run(logId, 'Pollo con arroz y verduras', 550, 'almuerzo');
    insertMeal.run(logId, 'Yogur griego', 150, 'merienda');
    insertMeal.run(logId, 'Ensalada con atún', 380, 'cena');
    if (Math.random() > 0.5) {
      insertMeal.run(logId, 'Fruta', 120, 'snack');
    }
  }

  // Streaks
  const insertStreak = db.prepare(`
    INSERT INTO streaks (habit_type, current_streak, longest_streak, last_recorded_date)
    VALUES (?, ?, ?, ?)
  `);
  const todayStr = today.toISOString().split('T')[0];
  insertStreak.run('entrenamiento', 5, 12, todayStr);
  insertStreak.run('dieta', 14, 14, todayStr);
  insertStreak.run('agua', 8, 20, todayStr);

  console.log('Sample data seeded successfully!');
}

seedData();

module.exports = db;
