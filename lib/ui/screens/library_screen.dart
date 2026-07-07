import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../core/format.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/document.dart';
import '../../data/models/folder.dart';
import '../../state/library_controller.dart';
import '../widgets/common/ui.dart';
import 'history_screen.dart';
import 'reader_screen.dart';
import 'settings_screen.dart';
import 'starred_screen.dart';

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

  Future<void> _openStarred() async {
    await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const StarredScreen()),
    );
    if (mounted) context.read<LibraryController>().refresh();
  }

  void _openSettings() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const SettingsScreen()),
    );
  }

  Future<void> _createFolder() async {
    final controller = TextEditingController();
    final library = context.read<LibraryController>();
    await showFolioDialog<void>(
      context,
      maxWidth: 380,
      child: Builder(builder: (context) {
        final c = context.colors;
        Future<void> submit() async {
          final name = controller.text.trim();
          if (name.isEmpty) return;
          await library.createFolder(name);
          if (context.mounted) Navigator.of(context).pop();
        }

        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Nueva carpeta', style: AppText.title(c)),
              const SizedBox(height: 14),
              TextField(
                controller: controller,
                autofocus: true,
                style: AppText.body(c),
                decoration:
                    folioInputDecoration(context, hint: 'Nombre de la carpeta'),
                onSubmitted: (_) => submit(),
              ),
              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  FolioButton(
                    label: 'Cancelar',
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  const SizedBox(width: 8),
                  FolioButton(
                    label: 'Crear',
                    primary: true,
                    onPressed: submit,
                  ),
                ],
              ),
            ],
          ),
        );
      }),
    );
  }

  Future<void> _renameFolder(Folder folder) async {
    final controller = TextEditingController(text: folder.name);
    final library = context.read<LibraryController>();
    await showFolioDialog<void>(
      context,
      maxWidth: 380,
      child: Builder(builder: (context) {
        final c = context.colors;
        Future<void> submit() async {
          final name = controller.text.trim();
          if (name.isEmpty) return;
          await library.renameFolder(folder.id, name);
          if (context.mounted) Navigator.of(context).pop();
        }

        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Renombrar carpeta', style: AppText.title(c)),
              const SizedBox(height: 14),
              TextField(
                controller: controller,
                autofocus: true,
                style: AppText.body(c),
                decoration:
                    folioInputDecoration(context, hint: 'Nombre de la carpeta'),
                onSubmitted: (_) => submit(),
              ),
              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  FolioButton(
                    label: 'Cancelar',
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  const SizedBox(width: 8),
                  FolioButton(
                    label: 'Guardar',
                    primary: true,
                    onPressed: submit,
                  ),
                ],
              ),
            ],
          ),
        );
      }),
    );
  }

  Future<void> _deleteFolder(Folder folder) async {
    final ok = await confirm(
      context,
      title: 'Eliminar carpeta',
      message:
          'Se eliminará «${folder.name}». Los documentos que contiene no se '
          'borran, se quedan sin carpeta.',
      confirmLabel: 'Eliminar',
    );
    if (ok && mounted) {
      await context.read<LibraryController>().deleteFolder(folder.id);
    }
  }

  Future<void> _moveToFolder(Doc doc) async {
    final library = context.read<LibraryController>();
    final folders = library.folders;
    await showFolioDialog<void>(
      context,
      maxWidth: 340,
      child: Builder(builder: (context) {
        final c = context.colors;
        Widget option(String label, int? folderId) {
          final selected = (doc.folderId == folderId);
          return _MoveOptionTile(
            label: label,
            selected: selected,
            onTap: () async {
              await library.moveToFolder(doc, folderId);
              if (context.mounted) Navigator.of(context).pop();
            },
          );
        }

        return Padding(
          padding: const EdgeInsets.all(10),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 4),
                child: Text('Mover a carpeta', style: AppText.title(c)),
              ),
              option('Sin carpeta', null),
              for (final folder in folders) option(folder.name, folder.id),
            ],
          ),
        );
      }),
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
            const SingleActivator(LogicalKeyboardKey.keyD, control: true):
                _openStarred,
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
                      FolioButton(
                        label: 'Destacadas',
                        icon: Icons.star_outline,
                        onPressed: _openStarred,
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
                  const SizedBox(height: 22),
                  _folderRow(library),
                  const SizedBox(height: 18),
                  if (library.recent.isNotEmpty) ...[
                    SectionLabel(_sectionTitle(library)),
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
                                    onMove: () => _moveToFolder(doc),
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

  String _sectionTitle(LibraryController library) {
    if (library.selectedFolder == kAllDocsFolder) return 'Recientes';
    if (library.selectedFolder == kNoFolder) return 'Sin carpeta';
    final folder = library.folders
        .where((f) => f.id == library.selectedFolder)
        .toList();
    return folder.isEmpty ? 'Recientes' : folder.first.name;
  }

  Widget _folderRow(LibraryController library) {
    return SizedBox(
      height: 32,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _FolderChip(
            label: 'Todos',
            icon: Icons.apps,
            selected: library.selectedFolder == kAllDocsFolder,
            onTap: () => library.selectFolder(kAllDocsFolder),
          ),
          const SizedBox(width: 8),
          _FolderChip(
            label: 'Sin carpeta',
            icon: Icons.folder_off_outlined,
            selected: library.selectedFolder == kNoFolder,
            onTap: () => library.selectFolder(kNoFolder),
          ),
          for (final folder in library.folders) ...[
            const SizedBox(width: 8),
            _FolderChip(
              label: folder.name,
              icon: Icons.folder_outlined,
              selected: library.selectedFolder == folder.id,
              onTap: () => library.selectFolder(folder.id),
              onRename: () => _renameFolder(folder),
              onDelete: () => _deleteFolder(folder),
            ),
          ],
          const SizedBox(width: 8),
          _FolderChip(
            label: 'Nueva carpeta',
            icon: Icons.create_new_folder_outlined,
            selected: false,
            accent: true,
            onTap: _createFolder,
          ),
        ],
      ),
    );
  }
}

class _MoveOptionTile extends StatefulWidget {
  const _MoveOptionTile({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  State<_MoveOptionTile> createState() => _MoveOptionTileState();
}

class _MoveOptionTileState extends State<_MoveOptionTile> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
          margin: const EdgeInsets.symmetric(vertical: 1),
          decoration: BoxDecoration(
            color: _hover ? c.hover : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Icon(
                widget.selected
                    ? Icons.radio_button_checked
                    : Icons.radio_button_unchecked,
                size: 16,
                color: widget.selected ? c.accent : c.inkFaint,
              ),
              const SizedBox(width: 10),
              Expanded(child: Text(widget.label, style: AppText.body(c))),
            ],
          ),
        ),
      ),
    );
  }
}

class _FolderChip extends StatefulWidget {
  const _FolderChip({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
    this.accent = false,
    this.onRename,
    this.onDelete,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final bool accent;
  final VoidCallback onTap;
  final VoidCallback? onRename;
  final VoidCallback? onDelete;

  @override
  State<_FolderChip> createState() => _FolderChipState();
}

class _FolderChipState extends State<_FolderChip> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final canManage = widget.onRename != null || widget.onDelete != null;
    final fg = widget.selected
        ? c.accent
        : widget.accent
            ? c.accent
            : c.inkSecondary;

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: widget.onTap,
        onSecondaryTapDown: canManage
            ? (details) => _showMenu(context, details.globalPosition)
            : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: widget.selected
                ? c.accentSoft
                : _hover
                    ? c.hover
                    : Colors.transparent,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: widget.selected ? c.accent : c.border,
              width: widget.selected ? 1.2 : 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(widget.icon, size: 14, color: fg),
              const SizedBox(width: 6),
              Text(
                widget.label,
                style: TextStyle(
                  fontFamily: kFontUi,
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: fg,
                ),
              ),
              if (canManage && _hover) ...[
                const SizedBox(width: 6),
                GestureDetector(
                  onTap: () => _showMenu(context, null),
                  child: Icon(Icons.more_horiz, size: 14, color: c.inkFaint),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _showMenu(BuildContext context, Offset? position) async {
    final c = context.colors;
    final overlay =
        Overlay.of(context).context.findRenderObject() as RenderBox;
    final anchor = position ??
        (context.findRenderObject() as RenderBox)
            .localToGlobal(Offset.zero, ancestor: overlay);
    final value = await showMenu<String>(
      context: context,
      position: RelativeRect.fromLTRB(
        anchor.dx,
        anchor.dy,
        overlay.size.width - anchor.dx,
        overlay.size.height - anchor.dy,
      ),
      color: c.raised,
      items: [
        if (widget.onRename != null)
          PopupMenuItem(
            value: 'rename',
            height: 36,
            child: Text('Renombrar', style: AppText.body(c)),
          ),
        if (widget.onDelete != null)
          PopupMenuItem(
            value: 'delete',
            height: 36,
            child: Text('Eliminar', style: AppText.body(c).copyWith(color: c.danger)),
          ),
      ],
    );
    if (value == 'rename') widget.onRename?.call();
    if (value == 'delete') widget.onDelete?.call();
  }
}

class _DocCard extends StatefulWidget {
  const _DocCard({
    required this.doc,
    required this.onOpen,
    required this.onRemove,
    required this.onMove,
  });

  final Doc doc;
  final VoidCallback onOpen;
  final VoidCallback onRemove;
  final VoidCallback onMove;

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
              if (_hover) ...[
                FolioIconButton(
                  icon: Icons.drive_file_move_outline,
                  size: 14,
                  tooltip: 'Mover a carpeta',
                  onPressed: widget.onMove,
                ),
                FolioIconButton(
                  icon: Icons.close,
                  size: 14,
                  tooltip: 'Quitar de recientes',
                  onPressed: widget.onRemove,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
