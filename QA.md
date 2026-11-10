# Real Food · revisión 10/11/2026

## Comprobado

- Ocho grupos de regresión con Chromium y contextos locales aislados: conservación del historial; alta, edición y eliminación con gramos decimales y recarga; objetivos cero; entrenamientos separados por persona y recarga; textos de usuario literales; búsqueda sin acentos; selección al cambiar comida; receta → menú → lista de compra y eliminación de receta.
- Revisión de capturas de portada, menú, alimentos, compra, perfil y entrenamiento a 393×852 (iPhone 15 Pro) y 320×568. Comprobación adicional de ancho a 430×932, 844×390 y 1024×768.
- Corregidos desbordamientos detectados en las pestañas del catálogo, plantillas de entrenamiento y cabecera en tablet.
- Sintaxis JavaScript, JSON del manifiesto y diff sin errores de espacios.

## Límites

Las pruebas usan Chromium con tamaños móviles: no sustituyen Safari en un iPhone físico ni verifican la instalación real o los valores físicos del notch. Se conservan viewport-fit=cover y los env(safe-area-inset-*); se actualiza la tinta de Safari por pantalla y se respeta el área inferior de botones.

Los datos siguen siendo locales al navegador y al dominio; no se sincronizan ni se transfieren automáticamente desde otra URL. El catálogo y los valores nutricionales preexistentes no se han contrastado con etiquetas oficiales. No hay modo sin conexión garantizado.
