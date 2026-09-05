# Instrucciones para Codex

## Contexto obligatorio

- Lee `PROJECT_CONTEXT.md` antes de analizar, planificar o modificar el proyecto.
- Este es un proyecto de varios meses. El contexto duradero debe quedar en el repositorio, no solo en el chat.
- Actualiza `PROJECT_CONTEXT.md` cuando una tarea cambie de forma material el estado, la arquitectura, el modelo de datos o las decisiones pendientes.

## Seguridad de ramas

- Trata `claude/rediseno-v2-nkmvq8` como una referencia histórica de solo lectura.
- La rama de integración del nuevo desarrollo es `codex/rediseno-v3`.
- Crea cada cambio relevante en una rama corta basada en `codex/rediseno-v3`.
- No mezcles cambios en `master` ni en la rama de Claude sin autorización expresa del usuario.
- No borres ni reescribas trabajo previo del usuario.

## Forma de trabajar

- Antes de editar, reproduce o identifica el comportamiento actual y explica brevemente la causa probable.
- Haz cambios pequeños, verificables y fáciles de revertir.
- Mantén una sola finalidad por tarea y por pull request.
- Para cambios visuales, prueba como mínimo un viewport equivalente a iPhone 15 Pro y revisa las zonas seguras superior e inferior.
- Si es posible, acompaña los cambios visuales con una captura antes/después.
- Conserva el comportamiento existente salvo que la tarea pida cambiarlo.
- No añadas frameworks, dependencias importantes, backend, autenticación ni una migración nativa sin explicar la decisión y obtener aprobación.
- Hasta que el monolito se divida, evita tareas paralelas que modifiquen simultáneamente `iphone.html`.

## Prioridades técnicas

- Primero: corregir errores visibles y estabilizar la aplicación HTML actual.
- Primer error conocido: espacio en blanco o tratamiento incorrecto de la zona superior en iPhone.
- Después: separar presentación, lógica y datos para que el catálogo pueda crecer de 49 a cientos de alimentos.
- La posible migración a una aplicación iOS nativa se decidirá más adelante; no iniciar una reescritura todavía.

## Modelo de alimentos acordado

- ID Mercadona
- Nombre
- Categoría
- Marca
- Tamaño del envase
- Ración habitual del usuario
- Base nutricional (`100 g` o `100 ml`)
- kcal
- Proteínas
- Hidratos
- Grasas
- Sal
- Imagen

No guardar URL del producto: el ID de Mercadona es suficiente para localizarlo. Mantener separada la ración habitual de los valores nutricionales oficiales por 100 g o 100 ml.

## Comunicación y cierre

- Comunícate en español claro y conciso; el usuario no necesita conocer Git para colaborar.
- Al terminar una tarea, indica: qué cambió, cómo se comprobó y qué decisión o riesgo queda pendiente.
- No fusiones una rama ni publiques una versión definitiva sin que el usuario pueda revisar el resultado.
