# Repaso — flashcards para iPhone

App web independiente de Real Food (no comparte código ni datos con `iphone.html`).

- `index.html`: toda la app (estilos, lógica y datos de ejemplo).
- `sw.js` + `manifest.webmanifest`: funcionamiento sin conexión e instalación.
- Datos guardados en `localStorage` del dispositivo (clave `repaso.v1`). Exportar copia desde Ajustes.

## Repetición espaciada

Cuatro botones: Otra vez (1 min), Difícil, Bien, Fácil. Las nuevas pasan por 1 min → 10 min y luego salen a días.
En repaso el intervalo se multiplica por la facilidad de la tarjeta (SM-2, empieza en 250 %). Día nuevo a las 4:00.

## Instalar

Servir la carpeta por HTTPS (p. ej. GitHub Pages), abrir en Safari → Compartir → Añadir a pantalla de inicio.
