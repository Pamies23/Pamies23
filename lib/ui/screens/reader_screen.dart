import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';

import '../../core/theme/app_theme.dart';
import '../../data/models/document.dart';
import '../../data/models/highlight.dart';
import '../../data/repositories/chat_repository.dart';
import '../../data/repositories/highlight_repository.dart';
import '../../data/settings/settings_controller.dart';
import '../../services/pdf/pdf_text_service.dart';
import '../../state/chat_controller.dart';
import '../../state/library_controller.dart';
import '../widgets/chat/chat_panel.dart';
import '../widgets/common/ui.dart';
import '../widgets/reader/selection_menu.dart';
import 'settings_screen.dart';

/// Lector: PDF a la izquierda, chat de IA a la derecha (split view con
/// divisor arrastrable). En pantallas estrechas el chat es un overlay.
class ReaderScreen extends StatefulWidget {
  const ReaderScreen({super.key, required this.doc, this.initialChatId});

  final Doc doc;
  final int? initialChatId;

  @override
  State<ReaderScreen> createState() => _ReaderScreenState();
}

class _ReaderScreenState extends State<ReaderScreen> {
  final _pdf = PdfViewerController();
  final _viewerKey = GlobalKey<SfPdfViewerState>();
  final _pdfAreaKey = GlobalKey();
  final _pdfText = PdfTextService();
  final _chatFocus = FocusNode();
  final _searchFieldFocus = FocusNode();

  late final ChatController _chat;
  late final HighlightRepository _highlightRepo;

  bool _fileMissing = false;
  String? _loadError;
  bool _documentReady = false;

  bool _chatVisible = true;
  double _chatWidth = 380;

  int _currentPage = 1;
  int _pageCount = 0;
  Timer? _progressTimer;

  // Selección activa en el visor.
  String? _selectionText;
  Rect? _selectionRegion; // coordenadas locales del área del PDF
  int _selectionPage = 1;

  // Búsqueda.
  bool _searchOpen = false;
  final _searchController = TextEditingController();
  PdfTextSearchResult? _searchResult;

  // Subrayados persistentes.
  List<Highlight> _highlights = [];
  final Map<int, Annotation> _annotationsById = {};

  @override
  void initState() {
    super.initState();
    _currentPage = widget.doc.lastPage;
    _fileMissing = !File(widget.doc.path).existsSync();
    _highlightRepo = context.read<HighlightRepository>();
    _chat = ChatController(
      chatRepo: context.read<ChatRepository>(),
      settings: context.read<SettingsController>(),
      document: widget.doc,
      pdfText: _pdfText,
    );
    _chat.init(initialChatId: widget.initialChatId);
  }

  @override
  void dispose() {
    _progressTimer?.cancel();
    _searchResult?.clear();
    _searchController.dispose();
    _chatFocus.dispose();
    _searchFieldFocus.dispose();
    _chat.dispose();
    _pdfText.detach();
    super.dispose();
  }

  // ── Documento ──────────────────────────────────────────────────────────

  void _onDocumentLoaded(PdfDocumentLoadedDetails details) {
    _pdfText.attach(details.document);
    _pageCount = details.document.pages.count;
    final library = context.read<LibraryController>();
    library.saveProgress(widget.doc.id, pageCount: _pageCount);
    if (widget.doc.lastPage > 1 && widget.doc.lastPage <= _pageCount) {
      _pdf.jumpToPage(widget.doc.lastPage);
    }
    _restoreHighlights();
    setState(() => _documentReady = true);
  }

  void _onPageChanged(PdfPageChangedDetails details) {
    _currentPage = details.newPageNumber;
    _progressTimer?.cancel();
    _progressTimer = Timer(const Duration(milliseconds: 600), () {
      if (!mounted) return;
      context
          .read<LibraryController>()
          .saveProgress(widget.doc.id, lastPage: _currentPage);
    });
    setState(() {});
  }

  // ── Selección ──────────────────────────────────────────────────────────

  void _onTextSelectionChanged(PdfTextSelectionChangedDetails details) {
    final text = details.selectedText;
    final region = details.globalSelectedRegion;
    if (text == null || text.trim().isEmpty || region == null) {
      if (_selectionText != null) {
        setState(() {
          _selectionText = null;
          _selectionRegion = null;
        });
      }
      return;
    }
    final box =
        _pdfAreaKey.currentContext?.findRenderObject() as RenderBox?;
    final local = box == null
        ? region
        : Rect.fromPoints(
            box.globalToLocal(region.topLeft),
            box.globalToLocal(region.bottomRight),
          );
    setState(() {
      _selectionText = text;
      _selectionRegion = local;
      _selectionPage = _pdf.pageNumber;
    });
  }

  void _clearSelection() {
    _pdf.clearSelection();
    setState(() {
      _selectionText = null;
      _selectionRegion = null;
    });
  }

  void _askAboutSelection() {
    final text = _selectionText;
    if (text == null) return;
    _chat.setPendingSelection(
        SelectionContext(text: text, page: _selectionPage));
    _clearSelection();
    setState(() => _chatVisible = true);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _chatFocus.requestFocus();
    });
  }

  void _explainSelection() {
    final text = _selectionText;
    if (text == null) return;
    final selection = SelectionContext(text: text, page: _selectionPage);
    _clearSelection();
    setState(() => _chatVisible = true);
    _chat.send(
      'Explica este fragmento con claridad.',
      selection: selection,
      currentPage: _pdf.pageNumber,
    );
  }

  Future<void> _copySelection() async {
    final text = _selectionText;
    if (text == null) return;
    await Clipboard.setData(ClipboardData(text: text));
    _clearSelection();
  }

  // ── Subrayados ─────────────────────────────────────────────────────────

  Future<void> _restoreHighlights() async {
    _highlights = await _highlightRepo.forDocument(widget.doc.id);
    for (final h in _highlights) {
      _addAnnotationFor(h);
    }
  }

  void _addAnnotationFor(Highlight h) {
    try {
      final lines = [
        for (final r in h.rects) PdfTextLine(r, h.text, h.page),
      ];
      final annotation = HighlightAnnotation(textBoundsCollection: lines);
      annotation.color = h.color;
      annotation.opacity = 0.45;
      _pdf.addAnnotation(annotation);
      _annotationsById[h.id] = annotation;
    } catch (_) {
      // Si el visor no puede reconstruir la anotación (PDF cambiado de
      // sitio/contenido), el subrayado sigue listado pero no se pinta.
    }
  }

  Future<void> _highlightSelection(Color color) async {
    final text = _selectionText;
    if (text == null) return;
    final lines = _viewerKey.currentState?.getSelectedTextLines() ??
        const <PdfTextLine>[];
    if (lines.isEmpty) {
      _clearSelection();
      return;
    }
    try {
      final annotation = HighlightAnnotation(textBoundsCollection: lines);
      annotation.color = color;
      annotation.opacity = 0.45;
      _pdf.addAnnotation(annotation);
      final saved = await _highlightRepo.add(
        documentId: widget.doc.id,
        page: lines.first.pageNumber,
        rects: [for (final l in lines) l.bounds],
        colorValue: color.toARGB32(),
        text: text,
      );
      _annotationsById[saved.id] = annotation;
      _highlights.add(saved);
    } catch (_) {
      // Ignorado: la anotación no pudo crearse.
    }
    _clearSelection();
  }

  Future<void> _removeHighlight(Highlight h) async {
    final annotation = _annotationsById.remove(h.id);
    if (annotation != null) {
      try {
        _pdf.removeAnnotation(annotation);
      } catch (_) {}
    }
    await _highlightRepo.remove(h.id);
    setState(() => _highlights.removeWhere((e) => e.id == h.id));
  }

  void _showHighlightsDialog() {
    showFolioDialog<void>(
      context,
      maxWidth: 460,
      child: StatefulBuilder(builder: (context, setDialogState) {
        final c = context.colors;
        return Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('Subrayados', style: AppText.title(c)),
                  const Spacer(),
                  FolioIconButton(
                    icon: Icons.close,
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              if (_highlights.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 24),
                  child: Text(
                    'Selecciona texto en el PDF y elige un color para subrayarlo.',
                    style: AppText.secondary(c),
                  ),
                )
              else
                ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 380),
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: _highlights.length,
                    separatorBuilder: (_, __) => Divider(color: c.border),
                    itemBuilder: (context, index) {
                      final h = _highlights[index];
                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            margin: const EdgeInsets.only(top: 5),
                            decoration: BoxDecoration(
                              color: h.color,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Página ${h.page}',
                                    style: AppText.label(c)),
                                const SizedBox(height: 2),
                                Text(
                                  h.text.replaceAll(RegExp(r'\s+'), ' '),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: AppText.secondary(c),
                                ),
                              ],
                            ),
                          ),
                          FolioIconButton(
                            icon: Icons.north_east,
                            size: 14,
                            tooltip: 'Ir a la página',
                            onPressed: () {
                              _pdf.jumpToPage(h.page);
                              Navigator.of(context).pop();
                            },
                          ),
                          FolioIconButton(
                            icon: Icons.delete_outline,
                            size: 14,
                            danger: true,
                            tooltip: 'Eliminar subrayado',
                            onPressed: () async {
                              await _removeHighlight(h);
                              setDialogState(() {});
                            },
                          ),
                        ],
                      );
                    },
                  ),
                ),
            ],
          ),
        );
      }),
    );
  }

  // ── Búsqueda ───────────────────────────────────────────────────────────

  void _toggleSearch() {
    setState(() {
      _searchOpen = !_searchOpen;
      if (!_searchOpen) {
        _searchResult?.clear();
        _searchResult = null;
        _searchController.clear();
      }
    });
    if (_searchOpen) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _searchFieldFocus.requestFocus();
      });
    }
  }

  void _runSearch(String query) {
    _searchResult?.clear();
    if (query.trim().isEmpty) {
      setState(() => _searchResult = null);
      return;
    }
    final result = _pdf.searchText(query.trim());
    result.addListener(() {
      if (mounted) setState(() {});
    });
    setState(() => _searchResult = result);
  }

  // ── Zoom y navegación ──────────────────────────────────────────────────

  void _zoomBy(double delta) {
    _pdf.zoomLevel = (_pdf.zoomLevel + delta).clamp(1.0, 4.0).toDouble();
  }

  void _zoomReset() => _pdf.zoomLevel = 1.0;

  Future<void> _openAnotherPdf() async {
    final library = context.read<LibraryController>();
    final doc = await library.pickPdf();
    if (doc != null && mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => ReaderScreen(doc: doc)),
      );
    }
  }

  void _openSettings() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const SettingsScreen()),
    );
  }

  // ── Atajos ─────────────────────────────────────────────────────────────

  Map<ShortcutActivator, VoidCallback> get _shortcuts => {
        const SingleActivator(LogicalKeyboardKey.keyO, control: true):
            _openAnotherPdf,
        const SingleActivator(LogicalKeyboardKey.keyN, control: true):
            () => _chat.newChat(),
        const SingleActivator(LogicalKeyboardKey.keyB, control: true): () =>
            setState(() => _chatVisible = !_chatVisible),
        const SingleActivator(LogicalKeyboardKey.keyL, control: true): () {
          setState(() => _chatVisible = true);
          _chatFocus.requestFocus();
        },
        const SingleActivator(LogicalKeyboardKey.keyF, control: true):
            _toggleSearch,
        const SingleActivator(LogicalKeyboardKey.comma, control: true):
            _openSettings,
        const SingleActivator(LogicalKeyboardKey.equal, control: true): () =>
            _zoomBy(0.25),
        const SingleActivator(LogicalKeyboardKey.minus, control: true): () =>
            _zoomBy(-0.25),
        const SingleActivator(LogicalKeyboardKey.digit0, control: true):
            _zoomReset,
        const SingleActivator(LogicalKeyboardKey.arrowRight, control: true):
            () {
          if (_currentPage < _pageCount) _pdf.jumpToPage(_currentPage + 1);
        },
        const SingleActivator(LogicalKeyboardKey.arrowLeft, control: true): () {
          if (_currentPage > 1) _pdf.jumpToPage(_currentPage - 1);
        },
        const SingleActivator(LogicalKeyboardKey.escape): () {
          if (_selectionText != null) {
            _clearSelection();
          } else if (_searchOpen) {
            _toggleSearch();
          }
        },
      };

  // ── Build ──────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return ChangeNotifierProvider<ChatController>.value(
      value: _chat,
      child: Scaffold(
        body: SafeArea(
          child: CallbackShortcuts(
            bindings: _shortcuts,
            child: Focus(
              autofocus: true,
              child: Column(
                children: [
                  _toolbar(),
                  Expanded(
                    child: LayoutBuilder(builder: (context, constraints) {
                      final narrow = constraints.maxWidth < 760;
                      if (narrow) {
                        return Stack(
                          children: [
                            Positioned.fill(child: _pdfArea()),
                            if (_chatVisible) ...[
                              Positioned.fill(
                                child: GestureDetector(
                                  onTap: () =>
                                      setState(() => _chatVisible = false),
                                  child: Container(
                                    color: Colors.black
                                        .withValues(alpha: 0.35),
                                  ),
                                ),
                              ),
                              Positioned(
                                top: 0,
                                right: 0,
                                bottom: 0,
                                width: constraints.maxWidth
                                    .clamp(0, 420)
                                    .toDouble(),
                                child: DecoratedBox(
                                  decoration: BoxDecoration(
                                    border: Border(
                                      left: BorderSide(color: c.border),
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black
                                            .withValues(alpha: 0.3),
                                        blurRadius: 30,
                                      ),
                                    ],
                                  ),
                                  child: ChatPanel(
                                    inputFocusNode: _chatFocus,
                                    currentPage: () => _pdf.pageNumber,
                                    onClose: () =>
                                        setState(() => _chatVisible = false),
                                  ),
                                ),
                              ),
                            ],
                          ],
                        );
                      }
                      final double maxChat = constraints.maxWidth - 420 < 300
                          ? 300.0
                          : constraints.maxWidth - 420;
                      final double chatWidth =
                          _chatWidth.clamp(300.0, maxChat).toDouble();
                      return Row(
                        children: [
                          Expanded(child: _pdfArea()),
                          if (_chatVisible) ...[
                            _ResizeHandle(
                              onDrag: (dx) => setState(() {
                                _chatWidth = (_chatWidth - dx)
                                    .clamp(300.0, maxChat)
                                    .toDouble();
                              }),
                            ),
                            SizedBox(
                              width: chatWidth,
                              child: ChatPanel(
                                inputFocusNode: _chatFocus,
                                currentPage: () => _pdf.pageNumber,
                              ),
                            ),
                          ],
                        ],
                      );
                    }),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _toolbar() {
    final c = context.colors;
    return Container(
      height: 46,
      padding: const EdgeInsets.symmetric(horizontal: 6),
      decoration: BoxDecoration(
        color: c.bg,
        border: Border(bottom: BorderSide(color: c.border)),
      ),
      child: Row(
        children: [
          FolioIconButton(
            icon: Icons.arrow_back,
            tooltip: 'Volver a la biblioteca',
            onPressed: () => Navigator.of(context).maybePop(),
          ),
          const SizedBox(width: 4),
          Expanded(
            flex: 3,
            child: Text(
              widget.doc.title,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontFamily: kFontDisplay,
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: c.ink,
              ),
            ),
          ),
          const Spacer(),
          if (_documentReady) ...[
            _PageIndicator(
              current: _currentPage,
              total: _pageCount,
              onJump: (page) => _pdf.jumpToPage(page),
            ),
            const SizedBox(width: 6),
            FolioIconButton(
              icon: Icons.remove,
              tooltip: 'Reducir (Ctrl+-)',
              onPressed: () => _zoomBy(-0.25),
            ),
            FolioIconButton(
              icon: Icons.add,
              tooltip: 'Ampliar (Ctrl++)',
              onPressed: () => _zoomBy(0.25),
            ),
            Container(
              width: 1,
              height: 20,
              margin: const EdgeInsets.symmetric(horizontal: 6),
              color: c.border,
            ),
            FolioIconButton(
              icon: Icons.search,
              tooltip: 'Buscar en el PDF (Ctrl+F)',
              active: _searchOpen,
              onPressed: _toggleSearch,
            ),
            FolioIconButton(
              icon: Icons.border_color_outlined,
              tooltip: 'Subrayados',
              onPressed: _showHighlightsDialog,
            ),
          ],
          FolioIconButton(
            icon: _chatVisible
                ? Icons.view_sidebar
                : Icons.view_sidebar_outlined,
            tooltip: _chatVisible
                ? 'Ocultar panel de IA (Ctrl+B)'
                : 'Mostrar panel de IA (Ctrl+B)',
            active: _chatVisible,
            onPressed: () => setState(() => _chatVisible = !_chatVisible),
          ),
          FolioIconButton(
            icon: Icons.settings_outlined,
            tooltip: 'Ajustes (Ctrl+,)',
            onPressed: _openSettings,
          ),
        ],
      ),
    );
  }

  Widget _pdfArea() {
    final c = context.colors;
    if (_fileMissing) {
      return Container(
        color: c.pdfBackdrop,
        child: EmptyState(
          icon: Icons.search_off,
          title: 'No se encuentra el archivo',
          subtitle: widget.doc.path,
          action: FolioButton(
            label: 'Quitar de recientes',
            danger: true,
            onPressed: () async {
              await context.read<LibraryController>().remove(widget.doc);
              if (mounted) Navigator.of(context).maybePop();
            },
          ),
        ),
      );
    }
    if (_loadError != null) {
      return Container(
        color: c.pdfBackdrop,
        child: EmptyState(
          icon: Icons.error_outline,
          title: 'No se pudo abrir el PDF',
          subtitle: _loadError,
          action: FolioButton(
            label: 'Volver',
            onPressed: () => Navigator.of(context).maybePop(),
          ),
        ),
      );
    }

    final desktop =
        Platform.isWindows || Platform.isLinux || Platform.isMacOS;

    return Container(
      color: c.pdfBackdrop,
      child: LayoutBuilder(builder: (context, constraints) {
        final areaSize = Size(constraints.maxWidth, constraints.maxHeight);
        return Stack(
          key: _pdfAreaKey,
          children: [
            Positioned.fill(
              child: SfPdfViewer.file(
              File(widget.doc.path),
              key: _viewerKey,
              controller: _pdf,
              interactionMode: desktop
                  ? PdfInteractionMode.selection
                  : PdfInteractionMode.pan,
              pageLayoutMode: PdfPageLayoutMode.continuous,
              canShowTextSelectionMenu: false,
              canShowScrollHead: false,
              maxZoomLevel: 4,
              onDocumentLoaded: _onDocumentLoaded,
              onDocumentLoadFailed: (details) {
                setState(() => _loadError = details.description);
              },
              onPageChanged: _onPageChanged,
              onTextSelectionChanged: _onTextSelectionChanged,
            ),
          ),
          if (_searchOpen)
            Positioned(
              top: 10,
              right: 14,
              child: _SearchBar(
                controller: _searchController,
                focusNode: _searchFieldFocus,
                result: _searchResult,
                onSearch: _runSearch,
                onClose: _toggleSearch,
              ),
            ),
            if (_selectionText != null && _selectionRegion != null)
              SelectionMenu(
                anchor: _selectionRegion!,
                areaSize: areaSize,
                onAsk: _askAboutSelection,
                onExplain: _explainSelection,
                onHighlight: _highlightSelection,
                onCopy: _copySelection,
              ),
          ],
        );
      }),
    );
  }
}

/// Divisor arrastrable entre el PDF y el chat.
class _ResizeHandle extends StatefulWidget {
  const _ResizeHandle({required this.onDrag});

  final void Function(double dx) onDrag;

  @override
  State<_ResizeHandle> createState() => _ResizeHandleState();
}

class _ResizeHandleState extends State<_ResizeHandle> {
  bool _hover = false;
  bool _dragging = false;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final active = _hover || _dragging;
    return MouseRegion(
      cursor: SystemMouseCursors.resizeLeftRight,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onHorizontalDragStart: (_) => setState(() => _dragging = true),
        onHorizontalDragEnd: (_) => setState(() => _dragging = false),
        onHorizontalDragUpdate: (details) => widget.onDrag(details.delta.dx),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          width: 7,
          color: Colors.transparent,
          alignment: Alignment.center,
          child: Container(
            width: active ? 3 : 1,
            color: active ? c.accent : c.border,
          ),
        ),
      ),
    );
  }
}

/// Indicador editable de página («12 / 340»).
class _PageIndicator extends StatefulWidget {
  const _PageIndicator({
    required this.current,
    required this.total,
    required this.onJump,
  });

  final int current;
  final int total;
  final void Function(int page) onJump;

  @override
  State<_PageIndicator> createState() => _PageIndicatorState();
}

class _PageIndicatorState extends State<_PageIndicator> {
  late final TextEditingController _controller =
      TextEditingController(text: '${widget.current}');
  final FocusNode _focus = FocusNode();

  @override
  void didUpdateWidget(_PageIndicator oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!_focus.hasFocus && widget.current != oldWidget.current) {
      _controller.text = '${widget.current}';
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _focus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 44,
          height: 28,
          child: TextField(
            controller: _controller,
            focusNode: _focus,
            textAlign: TextAlign.center,
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            style: AppText.secondary(c).copyWith(color: c.ink),
            decoration: InputDecoration(
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(vertical: 6),
              filled: true,
              fillColor: c.surface,
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(7),
                borderSide: BorderSide(color: c.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(7),
                borderSide: BorderSide(color: c.accent),
              ),
            ),
            onSubmitted: (value) {
              final page = int.tryParse(value);
              if (page != null && page >= 1 && page <= widget.total) {
                widget.onJump(page);
              } else {
                _controller.text = '${widget.current}';
              }
            },
          ),
        ),
        const SizedBox(width: 6),
        Text('/ ${widget.total}', style: AppText.secondary(c)),
      ],
    );
  }
}

/// Barra de búsqueda flotante sobre el PDF.
class _SearchBar extends StatelessWidget {
  const _SearchBar({
    required this.controller,
    required this.focusNode,
    required this.result,
    required this.onSearch,
    required this.onClose,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final PdfTextSearchResult? result;
  final void Function(String) onSearch;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final r = result;
    final hasResults = r != null && r.hasResult && r.totalInstanceCount > 0;
    return Container(
      width: 330,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: c.raised,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: c.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Icon(Icons.search, size: 15, color: c.inkFaint),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: controller,
              focusNode: focusNode,
              style: AppText.body(c),
              decoration: InputDecoration(
                isCollapsed: true,
                border: InputBorder.none,
                hintText: 'Buscar en el documento…',
                hintStyle: AppText.body(c).copyWith(color: c.inkFaint),
              ),
              onSubmitted: onSearch,
            ),
          ),
          if (r != null) ...[
            Text(
              hasResults
                  ? '${r.currentInstanceIndex}/${r.totalInstanceCount}'
                  : '0',
              style: AppText.secondary(c),
            ),
            FolioIconButton(
              icon: Icons.keyboard_arrow_up,
              size: 16,
              onPressed: hasResults ? () => r.previousInstance() : null,
            ),
            FolioIconButton(
              icon: Icons.keyboard_arrow_down,
              size: 16,
              onPressed: hasResults ? () => r.nextInstance() : null,
            ),
          ],
          FolioIconButton(icon: Icons.close, size: 15, onPressed: onClose),
        ],
      ),
    );
  }
}
