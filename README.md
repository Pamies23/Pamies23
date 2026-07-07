# Folio — lector de PDF con IA integrada

> Nombre provisional. App **personal** (no pensada para stores): un lector de PDF
> con un chat de IA al lado, para leer preguntando.

- **Windows** como plataforma prioritaria (estética y pulido al máximo, barra de título propia).
- **iPhone/iPad** funcional con el mismo código.
- **Flutter (Dart)**, sin Material Design "de serie": tema propio *Papel* (claro) y
  *Tinta* (oscuro) con acento cobre, tipografías **Fraunces** (titulares),
  **Inter** (interfaz) y **JetBrains Mono** (código).

## Funcionalidades

| | |
|---|---|
| 📄 Lector PDF | Syncfusion PDF Viewer: scroll continuo, zoom, ir a página, búsqueda con resaltado |
| ✍️ Selección | Menú contextual al seleccionar texto: **Preguntar a la IA**, **Explicar**, subrayar en 4 colores, copiar |
| 🖍️ Subrayados | Persistentes por documento (se guardan en SQLite y se reconstruyen al reabrir); listado con "ir a página" y borrado |
| 🤖 Chat IA | Panel lateral (split view redimensionable; overlay en pantallas estrechas), respuestas en streaming con Markdown, botón *detener* que conserva lo recibido |
| 🧠 Contexto | La página visible se envía como contexto (desactivable); selección adjunta con cita; opción de adjuntar el documento completo a una pregunta |
| 💬 Chats | Ligados a cada documento: historial por PDF en el panel, historial global con filtro, renombrar/eliminar, título automático |
| 🔀 Proveedores | **Claude (Anthropic)** y **OpenAI**, seleccionables por chat; catálogo de modelos + ID personalizado |
| 🔐 API keys | Guardadas en el almacén seguro del sistema (DPAPI en Windows, Llavero en iOS) |
| 🎨 Temas | Papel / Tinta / según el sistema |
| ⌨️ Atajos | Pensados para Windows (tabla abajo) |
| 📚 Biblioteca | Recientes con progreso de lectura; recuerda la última página |

## Puesta en marcha

Requisitos: **Flutter ≥ 3.27** (canal stable). Para Windows: Visual Studio 2022
con la carga «Desktop development with C++». Para iOS: Xcode.

El repo trae el código Dart, los assets y la configuración; los *runners*
nativos se generan en tu máquina con `flutter create` (no toca `lib/`):

```bash
git clone <este repo> folio && cd folio

# 1) Genera las plataformas nativas (una sola vez)
flutter create . --platforms=windows,ios --project-name folio --org com.pamies

# 2) Dependencias
flutter pub get

# 3) Ejecuta
flutter run -d windows     # o: flutter run -d <tu-iphone/ipad>
```

Después, abre **Ajustes** (⚙ o `Ctrl+,`) y pega tus API keys:

- Anthropic → <https://console.anthropic.com> → *API keys* (formato `sk-ant-…`)
- OpenAI → <https://platform.openai.com> → *API keys* (formato `sk-…`)

### Licencia de Syncfusion

El visor usa `syncfusion_flutter_pdfviewer`. Para uso personal entra en la
[licencia Community de Syncfusion](https://www.syncfusion.com/products/communitylicense)
(gratuita; regístrate en su web). No hace falta clave de licencia en el código.

## Atajos de teclado (Windows)

| Atajo | Acción |
|---|---|
| `Ctrl+O` | Abrir PDF |
| `Ctrl+N` | Nuevo chat (en el lector) |
| `Ctrl+B` | Mostrar/ocultar panel de IA |
| `Ctrl+L` | Foco en la entrada del chat |
| `Ctrl+F` | Buscar en el PDF |
| `Ctrl+H` | Historial global (desde la biblioteca) |
| `Ctrl+,` | Ajustes |
| `Ctrl++` / `Ctrl+-` / `Ctrl+0` | Zoom acercar / alejar / restablecer |
| `Ctrl+→` / `Ctrl+←` | Página siguiente / anterior |
| `Enter` / `Shift+Enter` | Enviar mensaje / salto de línea |
| `Esc` | Cerrar selección o búsqueda |

## Arquitectura

```
lib/
├── main.dart                  # arranque: ventana (Windows), SQLite, ajustes
├── app.dart                   # MaterialApp + providers + barra de título propia
├── core/
│   ├── theme/app_theme.dart   # AppColors (ThemeExtension), AppText, temas Papel/Tinta
│   └── format.dart            # fechas relativas en español
├── data/
│   ├── db/app_database.dart   # SQLite (sqflite; FFI en Windows). Esquema v1
│   ├── models/                # Doc, ChatSession, ChatMessage, Highlight
│   ├── repositories/          # documentos, chats+mensajes, subrayados
│   └── settings/              # SettingsController (prefs + secure storage)
├── services/
│   ├── ai/
│   │   ├── ai_provider.dart   # tipos comunes (AiRequest, AiStream, errores)
│   │   ├── anthropic_provider.dart  # POST /v1/messages, SSE, refusal+fallbacks
│   │   ├── openai_provider.dart     # POST /v1/chat/completions, SSE
│   │   ├── ai_catalog.dart    # catálogo de modelos por proveedor
│   │   └── sse.dart           # parser de líneas `data:` de SSE
│   └── pdf/pdf_text_service.dart    # extracción de texto (página/documento) con caché
├── state/
│   ├── library_controller.dart      # recientes, abrir/quitar, progreso
│   └── chat_controller.dart         # sesiones, mensajes, streaming, contexto
└── ui/
    ├── screens/               # biblioteca, lector (split view), ajustes, historial
    └── widgets/               # chat (panel/burbujas/entrada), menú de selección,
                               # barra de título Windows, componentes comunes
```

### Decisiones que conviene conocer

- **Contexto que se envía a la IA**: pregunta + texto de la página visible
  (toggle «Página actual») y, si preguntas desde una selección, el fragmento
  citado. «Documento entero» adjunta todo el texto (truncado a ~200k caracteres)
  solo en esa pregunta. En el historial de la conversación las selecciones
  antiguas viajan resumidas para no disparar el consumo de tokens.
- **Streaming**: cliente HTTP propio contra las APIs (SSE); *Detener* cancela el
  socket y conserva el texto parcial. Los errores HTTP se traducen a mensajes
  accionables (key inválida, rate limit, modelo inexistente…).
- **Claude Fable 5**: si lo eliges como modelo, la app activa automáticamente el
  parámetro `fallbacks` hacia Opus 4.8 para que un falso positivo de sus
  clasificadores no corte la respuesta.
- **Subrayados**: se guardan los rectángulos por línea en coordenadas de página
  (tabla `highlights`) y se recrean como anotaciones del visor al abrir. El PDF
  original nunca se modifica. Si tu versión de Syncfusion cambiara la firma de
  `PdfTextLine`/`HighlightAnnotation`, es el único punto a retocar
  (`reader_screen.dart → _addAnnotationFor`).
- **Chats por documento** con historial global; borrar un documento de
  recientes elimina en cascada sus chats y subrayados (el archivo PDF no se toca).

## Renombrar la app (el nombre es provisional)

1. Busca y reemplaza `Folio`/`folio` en `lib/` y `pubspec.yaml` (`name:`).
2. Borra `windows/` e `ios/` y vuelve a ejecutar
   `flutter create . --platforms=windows,ios --project-name <nuevo> --org com.pamies`.

## Ideas para después (no implementado)

- Icono de app propio para Windows/iOS.
- Notas ancladas a subrayados y exportación de subrayados a Markdown.
- Vista de miniaturas / índice (outline) del PDF.
- Búsqueda semántica en el documento (embeddings locales).
- Sincronización entre dispositivos (p. ej. carpeta en iCloud/OneDrive).

## Créditos de tipografías

[Inter](https://rsms.me/inter/) (Rasmus Andersson),
[Fraunces](https://github.com/undercasetype/Fraunces) (Undercase Type) y
[JetBrains Mono](https://www.jetbrains.com/lp/mono/) (JetBrains) — todas bajo
[SIL Open Font License 1.1](https://openfontlicense.org/); los `.ttf` viven en
`assets/fonts/`.
