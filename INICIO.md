# FitTracker — Guía de inicio

## Lo que necesitas instalar (solo una vez)

| Herramienta | Descarga | Notas |
|---|---|---|
| **Node.js** | https://nodejs.org | Descarga la versión **LTS** |
| **Git** | https://git-scm.com | En Mac puede que ya esté instalado |

Para comprobar que están instalados, abre una terminal y escribe:
```
node --version
git --version
```
Si ves números de versión, estás listo.

---

## Primera vez: descargar y configurar

Abre una terminal (en Windows: busca **PowerShell** o **cmd**) y ejecuta esto línea a línea:

```bash
git clone https://github.com/Pamies23/Pamies23.git fittracker
cd fittracker
git checkout claude/fitness-goal-tracker-alexander-PLRbW
npm run install:all
```

El último paso puede tardar 1-2 minutos (descarga las dependencias). Solo hay que hacerlo la primera vez.

---

## Iniciar la app

### Opción A — Doble clic (más fácil)

- **Windows:** doble clic en `iniciar.bat`
- **Mac / Linux:** abre terminal en la carpeta y escribe `./iniciar.sh`

### Opción B — Desde la terminal

Desde la carpeta del proyecto:
```bash
npm run dev
```

Luego abre el navegador en **http://localhost:5173**

Para cerrar la app pulsa `Ctrl + C` en la terminal.

---

## La primera vez que se abre

La app crea automáticamente una base de datos con **datos de ejemplo** para que puedas ver cómo funciona todo:

- 5 objetivos con hitos y progreso
- 20 entrenamientos de los últimos 30 días
- 2 meses de registros de peso
- 5 récords personales (press banca, sentadilla, peso muerto...)
- 14 días de dieta con comidas detalladas
- Rachas activas de entrenamiento, dieta e hidratación

Puedes borrar o editar estos datos cuando quieras y empezar a registrar los tuyos.

---

## Dónde se guardan tus datos

Todo se guarda en `server/fitness.db` (en tu ordenador, no en Internet).  
Si cambias de ordenador, copia ese archivo a la misma carpeta del nuevo equipo.

---

## Qué hay en cada sección

| Sección | Para qué sirve |
|---|---|
| **Panel** | Resumen del día: calorías, entrenos, peso, rachas |
| **Objetivos** | Metas con hitos, progreso visual y fechas límite |
| **Ejercicio** | Registrar entrenos, peso corporal, medidas y récords personales |
| **Dieta** | Log diario de comidas, calorías y agua |
| **Progreso** | Gráficas históricas y estadísticas a largo plazo |

---

## Solución de problemas

**"La app no abre" / error de puerto en uso**

```bash
# En Mac/Linux:
npx kill-port 3001 5173

# En Windows PowerShell:
npx kill-port 3001 5173
```

**"npm: command not found"**  
Node.js no está instalado o no está en el PATH. Reinstálalo desde https://nodejs.org

**"git: command not found"**  
Git no está instalado. Descárgalo desde https://git-scm.com
