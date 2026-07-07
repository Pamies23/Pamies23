import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/format.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/chat.dart';
import '../../data/repositories/chat_repository.dart';
import '../../data/repositories/document_repository.dart';
import '../widgets/common/ui.dart';
import 'reader_screen.dart';

/// Respuestas de la IA marcadas con estrella, para consultarlas más tarde.
class StarredScreen extends StatefulWidget {
  const StarredScreen({super.key});

  @override
  State<StarredScreen> createState() => _StarredScreenState();
}

class _StarredScreenState extends State<StarredScreen> {
  List<StarredAnswer> _all = [];
  bool _loaded = false;
  String _filter = '';

  @override
  void initState() {
    super.initState();
    _reload();
  }

  Future<void> _reload() async {
    final answers = await context.read<ChatRepository>().starredAnswers();
    if (!mounted) return;
    setState(() {
      _all = answers;
      _loaded = true;
    });
  }

  Future<void> _open(StarredAnswer answer) async {
    final documentId = answer.documentId;
    if (documentId == null) return;
    final doc = await context.read<DocumentRepository>().byId(documentId);
    if (doc == null || !mounted) return;
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ReaderScreen(doc: doc, initialChatId: answer.chatId),
      ),
    );
    if (mounted) await _reload();
  }

  Future<void> _unstar(StarredAnswer answer) async {
    await context.read<ChatRepository>().setStarred(answer.message.id, false);
    await _reload();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final query = _filter.trim().toLowerCase();
    final visible = query.isEmpty
        ? _all
        : _all
            .where((a) =>
                a.message.content.toLowerCase().contains(query) ||
                (a.question ?? '').toLowerCase().contains(query) ||
                (a.documentTitle ?? '').toLowerCase().contains(query))
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
                  Text('Respuestas destacadas', style: AppText.title(c)),
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
                        padding: const EdgeInsets.fromLTRB(20, 18, 20, 6),
                        child: TextField(
                          style: AppText.body(c),
                          decoration: folioInputDecoration(
                            context,
                            hint: 'Filtrar por pregunta, respuesta o documento…',
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
                                    icon: Icons.star_outline,
                                    title: query.isEmpty
                                        ? 'Todavía no hay respuestas destacadas'
                                        : 'Sin resultados',
                                    subtitle: query.isEmpty
                                        ? 'Marca con la estrella las respuestas de la IA '
                                            'que quieras volver a consultar.'
                                        : 'Prueba con otros términos.',
                                  )
                                : ListView.separated(
                                    padding: const EdgeInsets.fromLTRB(
                                        20, 10, 20, 24),
                                    itemCount: visible.length,
                                    separatorBuilder: (_, __) =>
                                        const SizedBox(height: 8),
                                    itemBuilder: (context, index) {
                                      final answer = visible[index];
                                      return _StarredRow(
                                        answer: answer,
                                        onOpen: () => _open(answer),
                                        onUnstar: () => _unstar(answer),
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

class _StarredRow extends StatefulWidget {
  const _StarredRow({
    required this.answer,
    required this.onOpen,
    required this.onUnstar,
  });

  final StarredAnswer answer;
  final VoidCallback onOpen;
  final VoidCallback onUnstar;

  @override
  State<_StarredRow> createState() => _StarredRowState();
}

class _StarredRowState extends State<_StarredRow> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final answer = widget.answer;
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.star, size: 16, color: c.accent),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (answer.question != null && answer.question!.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Text(
                          answer.question!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppText.bodyStrong(c),
                        ),
                      ),
                    Text(
                      answer.message.content,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppText.secondary(c),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      [
                        if (answer.documentTitle != null) answer.documentTitle!,
                        relativeDate(answer.message.createdAt),
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
                  icon: Icons.star,
                  size: 15,
                  active: true,
                  tooltip: 'Quitar de destacadas',
                  onPressed: widget.onUnstar,
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
