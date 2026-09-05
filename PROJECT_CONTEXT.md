# Real Food — Contexto permanente del proyecto

Última actualización: 5 de septiembre de 2026.

## Objetivo

Crear una aplicación para iPhone que ayude al usuario a seguir su alimentación, calorías y macronutrientes, preparar recetas y listas de compra, y registrar entrenamiento. El proyecto debe evolucionar durante varios meses desde el prototipo actual hacia un producto estable, profesional y visualmente atractivo, con posibilidad de adquirir sentido comercial más adelante.

La prioridad inmediata no es cobrar a usuarios ni añadir pagos. Primero hay que corregir errores, ordenar la base técnica, ampliar el catálogo y conseguir una experiencia de calidad.

## Repositorio y ramas

- Repositorio: `Pamies23/Pamies23`
- Prototipo original de Claude: `claude/rediseno-v2-nkmvq8`
- Nuevo desarrollo: `codex/rediseno-v3`
- La V3 nació exactamente del commit de Claude `22e73bd6583cd30ba1bb7d25798d3b8896d958ea`.
- La rama de Claude debe permanecer intacta.

## Estado actual

- La aplicación está concentrada principalmente en `iphone.html`.
- Es una aplicación web que imita y se adapta a la pantalla de un iPhone 15 Pro.
- El catálogo actual contiene 49 alimentos definidos dentro del propio HTML.
- Los valores actuales de cada alimento están calculados para una ración base propia.
- Hay registro diario de comidas, objetivos de calorías y macros, recetas, lista de compra, perfiles/datos personales y una sección de entrenamiento.
- Parte de la información se conserva mediante `localStorage`.
- Existen imágenes y fondos sueltos en la raíz del repositorio.
- No hay todavía una base de datos real ni una arquitectura separada de componentes, lógica y datos.

## Problemas y necesidades conocidas

1. En iPhone aparece una franja o espacio blanco en la zona superior; probablemente está relacionado con `safe-area`, el modo standalone/PWA o la combinación de márgenes y `padding` del encabezado. Debe reproducirse antes de corregirlo.
2. El archivo HTML es muy grande y mezcla estilos, estructura, lógica y datos, lo que dificultará ampliar y mantener la aplicación.
3. Solo hay 49 alimentos y se quieren incorporar cientos.
4. La interfaz actual no convence del todo al usuario y necesita una presentación más profesional.
5. Hay que revisar sistemáticamente el resto de errores antes de ampliar funcionalidades.

## Banco de alimentos

Se preparó un Excel piloto con cinco productos de Mercadona. La estructura final acordada contiene exclusivamente:

| Campo | Criterio |
|---|---|
| ID Mercadona | Número oficial del producto, sin prefijos |
| Nombre | Denominación clara del producto |
| Categoría | Categoría funcional de la app |
| Marca | Marca que figura en el producto |
| Tamaño del envase | Peso, volumen o unidades del envase |
| Ración habitual | Cantidad que suele consumir el usuario |
| Base nutricional | 100 g o 100 ml según la etiqueta |
| kcal | Valor oficial por la base nutricional |
| Proteínas | Gramos por la base nutricional |
| Hidratos | Gramos por la base nutricional |
| Grasas | Gramos por la base nutricional |
| Sal | Gramos por la base nutricional |
| Imagen | Imagen o nombre de archivo asociado |

No se guardará la URL: se comprobó que el ID basta para encontrar rápidamente el producto. Cuando la etiqueta muestre un valor como “< 0,5”, el piloto almacena el límite superior numérico y debe conservarse una indicación de esta convención.

### Productos piloto

| ID | Producto | Ración habitual | Base | kcal | Proteínas | Hidratos | Grasas | Sal |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 31504 | Huevos grandes L | 60 g (1 ud) | 100 g | 150 | 12,5 | 0,5 | 11,1 | 0,36 |
| 31312 | Claras de huevo líquidas pasteurizadas | 150 ml | 100 ml | 42 | 11 | 0,5 | 0,5 | 0,44 |
| 5710 | Pechuga 92% pavo Hacendado lonchas | 30 g | 100 g | 89 | 19,5 | 1 | 1,3 | 1,9 |
| 59151 | Jamón serrano Incarlopsa lonchas extrafinas | 55 g | 100 g | 247,8 | 33,5 | 1 | 12,2 | 3,6 |
| 2786 | Solomillos de pollo Pujante | 100 g | 100 g | 98 | 22 | 0,1 | 1,2 | 0,15 |

El Excel se llama `Banco_alimentos_piloto.xlsx` e incluye las cinco imágenes incrustadas. Todavía no está integrado en el repositorio ni en la aplicación.

## Decisiones tomadas

- Mantener intacta la versión de Claude.
- Continuar el desarrollo en la V3.
- Usar el ID de Mercadona y prescindir de la URL.
- Separar la ración habitual personal de la información nutricional oficial.
- Incluir la sal entre los datos nutricionales.
- Guardar una imagen asociada a cada producto.
- Estabilizar el HTML antes de decidir una migración a Swift/SwiftUI.

## Hoja de ruta orientativa

### Fase 1 — Estabilización

- Inventariar errores reproducibles.
- Corregir primero la franja blanca superior y los problemas de zonas seguras.
- Revisar navegación, modales, persistencia y cálculos.
- Crear una comprobación visual básica para iPhone.

### Fase 2 — Orden técnico

- Dividir progresivamente `iphone.html` en archivos de estructura, estilos, lógica y datos.
- Definir un modelo único de alimentos compatible con Excel, CSV o JSON.
- Añadir validaciones para macros, porciones e identificadores.

### Fase 3 — Catálogo amplio

- Importar gradualmente productos de Mercadona.
- Guardar datos nutricionales y recursos gráficos de forma mantenible.
- Diseñar búsqueda, filtros, favoritos y actualización de productos.
- Revisar las condiciones de acceso y uso antes de automatizar una extracción masiva.

### Fase 4 — Profesionalización

- Unificar el sistema visual y la navegación.
- Mejorar accesibilidad, estados vacíos, mensajes de error y rendimiento.
- Preparar una demo pulida que pueda enseñarse como producto.

### Fase 5 — Decisión de plataforma

- Comparar PWA/web instalada frente a aplicación nativa con SwiftUI.
- Si se elige iOS nativo, reutilizar el modelo de datos y la lógica ya ordenados, desarrollando con Xcode en un Mac.

## Método de trabajo en Codex

1. Abrir el repositorio `Pamies23/Pamies23` y elegir `codex/rediseno-v3` como rama de partida.
2. Crear un chat distinto para cada resultado concreto; por ejemplo, “Corregir la franja blanca superior”.
3. Pedir al inicio que lea `AGENTS.md` y `PROJECT_CONTEXT.md` y que primero reproduzca el problema.
4. Trabajar en una rama corta creada desde la V3.
5. Revisar el resumen, las capturas y el diff antes de incorporar el cambio a la V3.
6. Actualizar este documento cuando se adopte una decisión importante.
7. Hasta separar el gran HTML, realizar las modificaciones de código de forma principalmente secuencial para evitar conflictos.

## Primera tarea recomendada

Auditar y corregir la franja blanca superior sin rediseñar todavía el resto de la aplicación. La tarea debe comprobar el comportamiento en navegador móvil y, si es posible, en modo añadido a pantalla de inicio/standalone.
