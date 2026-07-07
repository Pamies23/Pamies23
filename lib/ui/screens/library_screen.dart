import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../core/format.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/document.dart';
import '../../state/library_controller.dart';
import '../widgets/common/ui.dart';
import 'history_screen.dart';
import 'reader_screen.dart';
import 'settings_screen.dart';

/// Pantalla de inicio: documentos recientes y acciones principales.
class LibraryScreen extends StatefulWidget {
  const LibraryScreen({super.key});

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<LibraryController>().refresh();
    });
  }

  Future<void> _openDoc(Doc doc) async {
    await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => ReaderScreen(doc: doc)),
    );
    if (mounted) context.read<LibraryController>().refresh();
  }

  Future<void> _pickPdf() async {
    final doc = await context.read<LibraryController>().pickPdf();
    if (doc != null && mounted) await _openDoc(doc);
  }

  Future<void> _openHistory() async {
    await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const HistoryScreen()),
    );
    if (mounted) context.read<LibraryController>().refresh();
  }

  void _openSettings() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const SettingsScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final library = context.watch<LibraryController>();

    return Scaffold(
      body: SafeArea(
        child: CallbackShortcuts(
          bindings: {
            const SingleActivator(LogicalKeyboardKey.keyO, control: true):
                _pickPdf,
            const SingleActivator(LogicalKeyboardKey.comma, control: true):
                _openSettings,
            const SingleActivator(LogicalKeyboardKey.keyH, control: true):
                _openHistory,
          },
          child: Focus(
            autofocus: true,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 26),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text('Folio', style: AppText.display(c)),
                              const SizedBox(width: 10),
                              Container(
                                width: 6,
                                height: 6,
                                margin: const EdgeInsets.only(top: 10),
                                decoration: BoxDecoration(
                                  color: c.accent,
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Tu lector de PDF con IA integrada',
                            style: AppText.secondary(c),
                          ),
                        ],
                      ),
                      const Spacer(),
                      FolioButton(
                        label: 'Historial',
                        icon: Icons.history,
                        onPressed: _openHistory,
                      ),
                      const SizedBox(width: 8),
                      FolioIconButton(
                        icon: Icons.settings_outlined,
                        tooltip: 'Ajustes (Ctrl+,)',
                        onPressed: _openSettings,
                      ),
                      const SizedBox(width: 8),
                      FolioButton(
                        label: 'Abrir PDF',
                        icon: Icons.file_open_outlined,
                        primary: true,
                        onPressed: _pickPdf,
                      ),
                    ],
                  ),
                  const SizedBox(height: 28),
                  if (library.recent.isNotEmpty) ...[
                    const SectionLabel('Recientes'),
                    const SizedBox(height: 12),
                  ],
                  Expanded(
                    child: !library.loaded
                        ? const SizedBox.shrink()
                        : library.recent.isEmpty
                            ? EmptyState(
                                icon: Icons.auto_stories_outlined,
                                title: 'Empieza abriendo un PDF',
                                subtitle:
                                    'Selecciona texto para preguntarle a la IA, '
                                    'subraya y conserva tus conversaciones por documento.',
                                action: FolioButton(
                                  label: 'Abrir PDF (Ctrl+O)',
                                  icon: Icons.file_open_outlined,
                                  primary: true,
                                  onPressed: _pickPdf,
                                ),
                              )
                            : GridView.builder(
                                gridDelegate:
                                    const SliverGridDelegateWithMaxCrossAxisExtent(
                                  maxCrossAxisExtent: 380,
                                  mainAxisExtent: 108,
                                  crossAxisSpacing: 14,
                                  mainAxisSpacing: 14,
                                ),
                                itemCount: library.recent.length,
                                itemBuilder: (context, index) {
                                  final doc = library.recent[index];
                                  return _DocCard(
                                    doc: doc,
                                    onOpen: () => _openDoc(doc),
                                    onRemove: () async {
                                      final ok = await confirm(
                                        context,
                                        title: 'Quitar de recientes',
                                        message:
                                            'Se quitará «${doc.title}» de recientes '
                                            'junto con sus chats y subrayados. '
                                            'El archivo PDF no se toca.',
                                        confirmLabel: 'Quitar',
                                      );
                                      if (ok && context.mounted) {
                                        await context
                                            .read<LibraryController>()
                                            .remove(doc);
                                      }
                                    },
                                  );
                                },
                              ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _DocCard extends StatefulWidget {
  const _DocCard({
    required this.doc,
    required this.onOpen,
    required this.onRemove,
  });

  final Doc doc;
  final VoidCallback onOpen;
  final VoidCallback onRemove;

  @override
  State<_DocCard> createState() => _DocCardState();
}

class _DocCardState extends State<_DocCard> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final doc = widget.doc;
    final progress = doc.pageCount != null && doc.pageCount! > 0
        ? 'pág. ${doc.lastPage} de ${doc.pageCount}'
        : 'pág. ${doc.lastPage}';

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: widget.onOpen,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 140),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: c.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: _hover ? c.accent : c.border,
              width: _hover ? 1.3 : 1,
            ),
            boxShadow: _hover
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.08),
                      blurRadius: 18,
                      offset: const Offset(0, 6),
                    ),
                  ]
                : null,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 42,
                height: 52,
                decoration: BoxDecoration(
                  color: c.accentSoft,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(Icons.picture_as_pdf_outlined,
                    size: 20, color: c.accent),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      doc.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppText.bodyStrong(c).copyWith(height: 1.25),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      relativeDate(doc.lastOpenedAt),
                      style: AppText.secondary(c).copyWith(fontSize: 11.5),
                    ),
                    const Spacer(),
                    Row(
                      children: [
                        Pill(text: progress, icon: Icons.bookmark_outlined),
                      ],
                    ),
                  ],
                ),
              ),
              if (_hover)
                FolioIconButton(
                  icon: Icons.close,
                  size: 14,
                  tooltip: 'Quitar de recientes',
                  onPressed: widget.onRemove,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
