import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/format.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/chat.dart';
import '../../data/repositories/chat_repository.dart';
import '../../data/repositories/document_repository.dart';
import '../widgets/common/ui.dart';
import 'reader_screen.dart';

/// Historial global: todas las conversaciones, agrupadas por fecha, con el
/// documento al que pertenecen. Abrir una lleva al lector con ese chat.
class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<ChatWithDocument> _all = [];
  bool _loaded = false;
  String _filter = '';

  @override
  void initState() {
    super.initState();
    _reload();
  }

  Future<void> _reload() async {
    final chats = await context.read<ChatRepository>().allChats();
    if (!mounted) return;
    setState(() {
      _all = chats;
      _loaded = true;
    });
  }

  Future<void> _open(ChatWithDocument entry) async {
    final documentId = entry.chat.documentId;
    if (documentId == null) return;
    final doc = await context.read<DocumentRepository>().byId(documentId);
    if (doc == null || !mounted) return;
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ReaderScreen(doc: doc, initialChatId: entry.chat.id),
      ),
    );
    if (mounted) await _reload();
  }

  Future<void> _delete(ChatWithDocument entry) async {
    final ok = await confirm(
      context,
      title: 'Eliminar chat',
      message: 'Se eliminará «${entry.chat.title}» y todos sus mensajes.',
    );
    if (!ok || !mounted) return;
    await context.read<ChatRepository>().deleteChat(entry.chat.id);
    await _reload();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final query = _filter.trim().toLowerCase();
    final visible = query.isEmpty
        ? _all
        : _all
            .where((e) =>
                e.chat.title.toLowerCase().contains(query) ||
                (e.documentTitle ?? '').toLowerCase().contains(query))
            .toList();

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Container(
              height: 46,
              padding: const EdgeInsets.symmetric(horizontal: 6),
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: c.border)),
              ),
              child: Row(
                children: [
                  FolioIconButton(
                    icon: Icons.arrow_back,
                    tooltip: 'Volver',
                    onPressed: () => Navigator.of(context).maybePop(),
                  ),
                  const SizedBox(width: 6),
                  Text('Historial de chats', style: AppText.title(c)),
                ],
              ),
            ),
            Expanded(
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 720),
                  child: Column(
                    children: [
                      Padding(
                        padding:
                            const EdgeInsets.fromLTRB(20, 18, 20, 6),
                        child: TextField(
                          style: AppText.body(c),
                          decoration: folioInputDecoration(
                            context,
                            hint: 'Filtrar por título o documento…',
                          ),
                          onChanged: (value) =>
                              setState(() => _filter = value),
                        ),
                      ),
                      Expanded(
                        child: !_loaded
                            ? const SizedBox.shrink()
                            : visible.isEmpty
                                ? EmptyState(
                                    icon: Icons.forum_outlined,
                                    title: query.isEmpty
                                        ? 'Todavía no hay conversaciones'
                                        : 'Sin resultados',
                                    subtitle: query.isEmpty
                                        ? 'Abre un PDF y pregunta a la IA: '
                                            'cada documento guarda sus propios chats.'
                                        : 'Prueba con otros términos.',
                                  )
                                : ListView.separated(
                                    padding: const EdgeInsets.fromLTRB(
                                        20, 10, 20, 24),
                                    itemCount: visible.length,
                                    separatorBuilder: (_, __) =>
                                        const SizedBox(height: 8),
                                    itemBuilder: (context, index) {
                                      final entry = visible[index];
                                      return _HistoryRow(
                                        entry: entry,
                                        onOpen: () => _open(entry),
                                        onDelete: () => _delete(entry),
                                      );
                                    },
                                  ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HistoryRow extends StatefulWidget {
  const _HistoryRow({
    required this.entry,
    required this.onOpen,
    required this.onDelete,
  });

  final ChatWithDocument entry;
  final VoidCallback onOpen;
  final VoidCallback onDelete;

  @override
  State<_HistoryRow> createState() => _HistoryRowState();
}

class _HistoryRowState extends State<_HistoryRow> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final chat = widget.entry.chat;
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: widget.onOpen,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: c.surface,
            borderRadius: BorderRadius.circular(11),
            border: Border.all(color: _hover ? c.accent : c.border),
          ),
          child: Row(
            children: [
              Icon(Icons.chat_bubble_outline, size: 16, color: c.accent),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      chat.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppText.bodyStrong(c),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      [
                        if (widget.entry.documentTitle != null)
                          widget.entry.documentTitle!,
                        relativeDate(chat.updatedAt),
                        chat.model,
                      ].join('  ·  '),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppText.secondary(c).copyWith(fontSize: 11.5),
                    ),
                  ],
                ),
              ),
              if (_hover) ...[
                FolioIconButton(
                  icon: Icons.delete_outline,
                  size: 15,
                  danger: true,
                  tooltip: 'Eliminar chat',
                  onPressed: widget.onDelete,
                ),
                const SizedBox(width: 2),
                Icon(Icons.north_east, size: 14, color: c.inkFaint),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
