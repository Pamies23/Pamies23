# Real Food · revisión 10/11/2026

## Comprobado

- Ocho grupos de regresión con Chromium y contextos locales aislados: conservación del historial; alta, edición y eliminación con gramos decimales y recarga; objetivos cero; entrenamientos separados por persona y recarga; textos de usuario literales; búsqueda sin acentos; selección al cambiar comida; receta → menú → lista de compra y eliminación de receta.
- Revisión de capturas de portada, menú, alimentos, compra, perfil y entrenamiento a 393×852 (iPhone 15 Pro) y 320×568. Comprobación adicional de ancho a 430×932, 844×390 y 1024×768.
- Corregidos desbordamientos detectados en las pestañas del catálogo, plantillas de entrenamiento y cabecera en tablet.
- Sintaxis JavaScript, JSON del manifiesto y diff sin errores de espacios.

## Límites

Las pruebas usan Chromium con tamaños móviles: no sustituyen Safari en un iPhone físico ni verifican la instalación real o los valores físicos del notch. Se conservan viewport-fit=cover y los env(safe-area-inset-*); se actualiza la tinta de Safari por pantalla y se respeta el área inferior de botones.

Los datos siguen siendo locales al navegador y al dominio; no se sincronizan ni se transfieren automáticamente desde otra URL. El catálogo y los valores nutricionales preexistentes no se han contrastado con etiquetas oficiales. No hay modo sin conexión garantizado.

## V3.2 · Correcciones tras las capturas del iPhone

### Fallo reproducido

La versión anterior fallaba 21 de 24 saltos de categoría en un viewport 393×852 con zonas seguras simuladas de 59/34 px. Se midieron huecos de aproximadamente 143 px desde arriba y 52 px desde posiciones profundas. La cabecera se transformaba durante el scroll y se usaban medidas anteriores a ese cambio.

### Resultado comprobado

- Chromium: 72/72 saltos correctos, sin errores JavaScript.
- WebKit: 72/72 saltos correctos, sin errores JavaScript. El primer alimento queda a 8–9 px de la cabecera.
- Ambos motores: ocho categorías desde arriba, desde abajo y en orden inverso; tamaños 393×852, 320×568 y 844×390. Sin desbordamiento horizontal.
- Revisión visual de portada, catálogo y Lácteos con zonas seguras simuladas: cabecera opaca continua, primera fila visible y eliminación del splash fijo y su relleno inferior verde.
- Ocho grupos de regresión de alimentación, recetas, compra, perfiles y entrenamiento conservados.
- Copias: exportación real del estado inicial y de datos guardados desde la interfaz; importación en un navegador nuevo mediante selector de archivo, confirmación y recarga; comparación de todos los valores; conservación de claves ajenas; rechazo de HTML antes de escribir. Cuatro grupos de navegador pasan sin errores JavaScript. Validación y reversión de una escritura fallida también comprobadas.
- Portada visible en el HTML inicial para evitar un destello del menú vacío durante una carga lenta.
- Revisión independiente: carga HTML pausada antes del script; cambios rápidos entre categorías; categorías de recetas; cambio de tamaño durante un salto; interrupción real del scroll animado por un gesto. Todos correctos tras corregir el primer render y detener también la animación nativa al cancelar.

### Límite específico de iOS

WebKit se ejecutó en Linux. Simular dimensiones y zonas seguras no reproduce la barra de estado ni el sombreado de una app instalada en un iPhone físico. Se retira `apple-mobile-web-app-status-bar-style=black-translucent`, una opción obsoleta con problemas documentados por WebKit (https://bugs.webkit.org/show_bug.cgi?id=317153).

Un icono existente puede conservar la configuración de instalación (https://bugs.webkit.org/show_bug.cgi?id=316008). Si precisa instalar un nuevo acceso, primero usar **Exportar mis datos** en el menú lateral de la app antigua, abrir la nueva y usar **Importar copia**; verificar los datos antes de borrar el acceso anterior. No asumir que Safari y una app de pantalla de inicio comparten almacenamiento.
