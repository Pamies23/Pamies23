# Guía para arrancar una nueva app (estilo juego para móvil)

Esta guía resume, en lenguaje sencillo, **cómo está hecho** el juego de Rayo y
**qué necesitas saber** para empezar otro proyecto parecido (una app para el
móvil) pero con **otro estilo visual**. Al final tienes un **prompt listo para
copiar** y pegárselo a la IA para echar a andar.

---

## 1. Qué es esto técnicamente (lo esencial)

- Es **un solo archivo `.html`**. Dentro lleva las tres cosas que hacen una web:
  - **HTML** → la estructura (el lienzo del juego y los botones).
  - **CSS** → el aspecto (colores, tamaños, que ocupe toda la pantalla).
  - **JavaScript** → la lógica (que el coche se mueva, las colisiones, etc.).
- No hace falta instalar nada ni montar un servidor: **se abre en el navegador**
  (Safari, Chrome…) y funciona. Es “una web que parece un juego”.
- El dibujo se hace sobre un **`<canvas>`** (un lienzo). Todo lo que ves
  (coche, carretera, montañas) está **pintado con código**, no son imágenes.
  Por eso cambiar el estilo visual = cambiar cómo se pinta.
- Hay un **bucle** que repite ~60 veces por segundo: *actualizar* (mover cosas)
  y *dibujar*. Eso crea la animación.
- Extras que usamos: **controles táctiles** en pantalla, soporte de **mando**,
  **sonidos** (generados por el navegador) y, para 2 jugadores, conexión por
  internet con **WebRTC** (librería PeerJS) usando un “código de sala”.

> Idea clave: **es una web, no una app “de la App Store”**. Pero en el iPhone se
> puede hacer que se comporte casi como una app (ver punto 2).

---

## 2. Cómo se usa en el iPhone (como si fuera una app)

- Se abre el **enlace** en Safari.
- Trucos para que parezca una app de verdad:
  - **Horizontal y a pantalla completa**: el código detecta la orientación y
    ocupa toda la pantalla (respetando la “isla dinámica” / notch).
  - **“Añadir a pantalla de inicio”**: en Safari, botón Compartir →
    *Añadir a pantalla de inicio*. Aparece un **icono** como una app y se abre
    **sin la barra del navegador** (gracias a unas etiquetas `meta` especiales
    que ya lleva el archivo).
  - **Controles táctiles** y bloqueo de zoom/scroll para que no se mueva sola.
- Limitaciones honestas: como es una web, **no está en la App Store**, no manda
  notificaciones “de app”, y para multijugador necesita **internet**.

---

## 3. El tema de los enlaces (importante)

El archivo vive en **GitHub** (un sitio donde se guarda el código). Para *jugar*
hay que “servir” ese HTML como página web. Dos formas:

1. **htmlpreview.github.io** (lo que usamos ahora): coge el archivo de GitHub y
   lo muestra como web. El enlace tiene esta forma:

   `https://htmlpreview.github.io/?https://github.com/USUARIO/REPO/blob/COMMIT/archivo.html`

   - Ojo con la **caché**: si apuntas a la *rama*, el navegador puede enseñarte
     una versión vieja. Por eso usamos un enlace fijado a un **commit** concreto
     (un identificador largo); como cambia en cada subida, **siempre ves lo
     último**. La pega: hay que copiar un enlace nuevo cada vez que hay cambios.
   - Es cómodo para probar, pero es un visor de terceros y a veces es más
     restrictivo (p. ej. cargar librerías externas como la de multijugador).

2. **GitHub Pages** (lo recomendable para algo “de verdad”): publica el repo
   como **web propia** con una dirección fija, por ejemplo:

   `https://USUARIO.github.io/REPO/archivo.html`

   - **Ventajas**: enlace **siempre el mismo** (no cambia en cada subida), carga
     mejor, y cosas como el multijugador funcionan sin las restricciones del
     visor. Es la opción ideal para usarlo a diario y compartirlo.
   - Se activa una vez en los ajustes del repositorio (o te lo dejo montado).

> Recomendación: para *desarrollar* vale htmlpreview; para *usar y compartir* la
> app, **GitHub Pages**.

---

## 4. Para empezar el nuevo proyecto: lo mínimo

1. Un **repositorio nuevo** en GitHub (o una carpeta nueva en este mismo).
2. **Un archivo `.html`** donde irá todo (la IA te lo crea).
3. Decidir **3 cosas** antes de empezar (cuanto más claras, mejor sale):
   - **Qué es** la app/juego (la idea y cómo se juega/usa).
   - **El estilo visual** (colores, si es plano/minimalista, pixel art, dibujos
     redondeados, oscuro/claro, referencias que te gusten…).
   - **Cómo se controla** (táctil, botones, deslizar, inclinar el móvil…).
4. Probar el enlace en el móvil, pedir cambios, repetir. (Igual que hemos hecho
   con Rayo: poco a poco.)

---

## 5. PROMPT listo para copiar (rellena los huecos)

Copia esto y pégaselo a la IA para arrancar. Cambia lo que está **EN MAYÚSCULAS**:

```
Quiero crear una app/juego para jugar en el MÓVIL (iPhone), parecida en lo
técnico a un proyecto anterior que hicimos, pero con OTRO estilo visual.

CÓMO QUIERO QUE ESTÉ HECHO (técnico, respétalo):
- Un único archivo .html autocontenido (HTML + CSS + JavaScript, sin
  dependencias salvo que sean imprescindibles), dibujando todo en un <canvas>.
- Que ocupe toda la pantalla en horizontal en el iPhone, nítido en pantallas
  modernas (escalar por devicePixelRatio), respetando la isla dinámica
  (safe-area), sin zoom ni scroll accidental.
- Preparado para "Añadir a pantalla de inicio" como webapp (metas
  apple-mobile-web-app-capable, viewport con viewport-fit=cover, etc.).
- Controles TÁCTILES en pantalla (semitransparentes) y, si tiene sentido,
  soporte de mando (Gamepad API). En vertical, avisar de "gira el móvil".
- Bucle de juego con requestAnimationFrame (actualizar + dibujar).
- Si hay sonidos, generarlos con WebAudio y activarlos tras el primer toque.

LA IDEA:
- DESCRIBE AQUÍ QUÉ ES LA APP O JUEGO Y CÓMO SE JUEGA/USA.

EL ESTILO VISUAL QUE QUIERO:
- DESCRIBE COLORES, TONO (minimalista/plano, dibujos redondeados, pixel art,
  oscuro/claro...), y REFERENCIAS que te gusten.

CONTROLES:
- DESCRIBE CÓMO SE CONTROLA (tocar dónde ir, dos botones, deslizar, etc.).

FORMA DE TRABAJAR:
- Hazlo por partes y dame en cada paso un enlace para abrirlo en el iPhone.
- Valida que no haya errores antes de darme el enlace.
- Cuando esté encaminado, déjamelo listo para publicarlo en GitHub Pages
  (enlace fijo) además del enlace de prueba.
```

---

### Resumen de una frase

> Es **una web hecha en un solo archivo HTML** que se abre en el móvil, se puede
> **añadir a la pantalla de inicio** como si fuera una app, y se comparte con un
> **enlace** (lo ideal: **GitHub Pages**, enlace fijo).
