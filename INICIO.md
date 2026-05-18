# FitTracker — Cómo iniciarlo

## Requisitos

- **Node.js** versión 18 o superior → https://nodejs.org (descarga la versión LTS)
- **Git** → https://git-scm.com (para descargar el proyecto)

---

## Pasos (solo la primera vez)

### 1. Descargar el proyecto

Abre una terminal (en Windows: busca "cmd" o "PowerShell") y ejecuta:

```bash
git clone https://github.com/Pamies23/Pamies23.git fittracker
cd fittracker
git checkout claude/fitness-goal-tracker-alexander-PLRbW
```

### 2. Instalar dependencias

```bash
npm run install:all
```

Esto puede tardar 1-2 minutos la primera vez.

---

## Iniciar la app (cada vez que quieras usarla)

Desde la carpeta del proyecto:

```bash
npm run dev
```

Luego abre el navegador en:

```
http://localhost:5173
```

Para cerrarla pulsa `Ctrl + C` en la terminal.

---

## Dónde se guardan tus datos

Todos los datos se guardan en el archivo `server/fitness.db`.  
Este archivo **no se sube a GitHub** — es solo tuyo, en tu ordenador.

Si algún día cambias de ordenador, copia ese archivo y pégalo en la misma carpeta del nuevo equipo.

---

## Estructura de la app

| Sección | Qué puedes hacer |
|---|---|
| **Panel** | Resumen del día: calorías, entrenos, peso, rachas |
| **Objetivos** | Crear metas con hitos y seguimiento de progreso |
| **Ejercicio** | Registrar entrenos, peso corporal, medidas y récords |
| **Dieta** | Log diario de comidas, calorías y agua |
| **Progreso** | Gráficas históricas y estadísticas a largo plazo |
