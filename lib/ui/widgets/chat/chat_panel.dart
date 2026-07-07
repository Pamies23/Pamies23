import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/format.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/chat.dart';
import '../../../state/chat_controller.dart';
import '../common/ui.dart';
import 'chat_input.dart';
import 'message_bubble.dart';

/// Panel lateral de chat: cabecera con gestión de conversaciones, lista de
/// mensajes con streaming y entrada de texto.
class ChatPanel extends StatefulWidget {
  const ChatPanel({
    super.key,
    required this.inputFocusNode,
    required this.currentPage,
    this.onClose,
    this.onJumpToPage,
  });

  final FocusNode inputFocusNode;
  final int Function() currentPage;

  /// En pantallas estrechas el panel es un overlay y puede cerrarse.
  final VoidCallback? onClose;

  /// Salta a una página del PDF (al pulsar una cita de selección).
  final void Function(int page)? onJumpToPage;

  @override
  State<ChatPanel> createState() => _ChatPanelState();
}

class _ChatPanelState extends State<ChatPanel> {
  final _scroll = ScrollController();
  int _lastCount = -1;
  int _lastStreamLength = 0;

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  void _send(String text) {
    context.read<ChatController>().send(text, currentPage: widget.currentPage());
  }

  void _maybeAutoScroll(ChatController chat) {
    final count = chat.messages.length;
    final streamLength = chat.streamingText.length;
    if (count == _lastCount && streamLength == _lastStreamLength) return;
    final grew = count > _lastCount;
    _lastCount = count;
    _lastStreamLength = streamLength;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scroll.hasClients) return;
      final pos = _scroll.position;
      final nearBottom = pos.maxScrollExtent - pos.pixels < 140;
      if (grew || nearBottom) {
        _scroll.jumpTo(pos.maxScrollExtent);
      }
    });
  }

  Future<void> _renameActive(ChatController chat) async {
    final controller = TextEditingController(text: chat.active?.title ?? '');
    await showFolioDialog<void>(
      context,
      maxWidth: 420,
      child: Builder(builder: (context) {
        final c = context.colors;
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Renombrar chat', style: AppText.title(c)),
              const SizedBox(height: 14),
              TextField(
                controller: controller,
                autofocus: true,
                style: AppText.body(c),
                decoration:
                    folioInputDecoration(context, hint: 'Título del chat'),
                onSubmitted: (_) {
                  chat.renameActiveChat(controller.text);
                  Navigator.of(context).pop();
                },
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
                    onPressed: () {
                      chat.renameActiveChat(controller.text);
                      Navigator.of(context).pop();
                    },
                  ),
                ],
              ),
            ],
          ),
        );
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final chat = context.watch<ChatController>();
    _maybeAutoScroll(chat);

    return Container(
      color: c.surface,
      child: Column(
        children: [
          _header(chat),
          if (chat.error != null) _errorBanner(chat),
          Expanded(
            child: chat.messages.isEmpty && !chat.isStreaming
                ? _emptyState(chat)
                : _messageList(chat),
          ),
          ChatInput(onSend: _send, focusNode: widget.inputFocusNode),
        ],
      ),
    );
  }

  Widget _header(ChatController chat) {
    final c = context.colors;
    return Container(
      height: 46,
      padding: const EdgeInsets.only(left: 8, right: 6),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: c.border)),
      ),
      child: Row(
        children: [
          Expanded(
            child: PopupMenuButton<Object>(
              tooltip: 'Chats de este documento',
              position: PopupMenuPosition.under,
              onSelected: (value) {
                if (value is ChatSession) chat.selectSession(value);
                if (value == 'new') chat.newChat();
              },
              itemBuilder: (context) => [
                PopupMenuItem<Object>(
                  value: 'new',
                  height: 38,
                  child: Row(
                    children: [
                      Icon(Icons.add, size: 15, color: c.accent),
                      const SizedBox(width: 8),
                      Text('Nuevo chat',
                          style: AppText.body(c)
                              .copyWith(fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                if (chat.sessions.isNotEmpty) const PopupMenuDivider(),
                for (final s in chat.sessions)
                  PopupMenuItem<Object>(
                    value: s,
                    height: 42,
                    child: Row(
                      children: [
                        Icon(
                          s.id == chat.active?.id
                              ? Icons.chat_bubble
                              : Icons.chat_bubble_outline,
                          size: 14,
                          color: s.id == chat.active?.id
                              ? c.accent
                              : c.inkFaint,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(s.title,
                                  overflow: TextOverflow.ellipsis,
                                  style: AppText.body(c)),
                              Text(relativeDate(s.updatedAt),
                                  style: AppText.secondary(c)
                                      .copyWith(fontSize: 10.5)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
              child: Row(
                children: [
                  Icon(Icons.forum_outlined, size: 16, color: c.accent),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      chat.active?.title ?? 'Nuevo chat',
                      overflow: TextOverflow.ellipsis,
                      style: AppText.bodyStrong(context.colors),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(Icons.expand_more, size: 15, color: c.inkFaint),
                ],
              ),
            ),
          ),
          FolioIconButton(
            icon: Icons.add_comment_outlined,
            tooltip: 'Nuevo chat (Ctrl+N)',
            onPressed: chat.newChat,
          ),
          if (chat.active != null)
            PopupMenuButton<String>(
              tooltip: 'Opciones del chat',
              position: PopupMenuPosition.under,
              onSelected: (value) async {
                if (value == 'rename') await _renameActive(chat);
                if (value == 'delete') {
                  final session = chat.active!;
                  final ok = await confirm(
                    context,
                    title: 'Eliminar chat',
                    message:
                        'Se eliminará «${session.title}» y todos sus mensajes.',
                  );
                  if (ok) await chat.deleteChat(session);
                }
              },
              itemBuilder: (context) => [
                PopupMenuItem(
                  value: 'rename',
                  height: 36,
                  child: Text('Renombrar', style: AppText.body(c)),
                ),
                PopupMenuItem(
                  value: 'delete',
                  height: 36,
                  child: Text('Eliminar',
                      style: AppText.body(c).copyWith(color: c.danger)),
                ),
              ],
              child: Padding(
                padding: const EdgeInsets.all(6),
                child: Icon(Icons.more_horiz, size: 18, color: c.inkSecondary),
              ),
            ),
          if (widget.onClose != null)
            FolioIconButton(
              icon: Icons.close,
              tooltip: 'Cerrar panel',
              onPressed: widget.onClose,
            ),
        ],
      ),
    );
  }

  Widget _errorBanner(ChatController chat) {
    final c = context.colors;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(12, 8, 6, 8),
      color: c.dangerSoft,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.error_outline, size: 15, color: c.danger),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              chat.error!,
              style: AppText.secondary(c).copyWith(color: c.danger),
            ),
          ),
          FolioIconButton(
            icon: Icons.close,
            size: 14,
            onPressed: chat.clearError,
          ),
        ],
      ),
    );
  }

  Widget _messageList(ChatController chat) {
    return ListView.separated(
      controller: _scroll,
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
      itemCount: chat.messages.length + (chat.isStreaming ? 1 : 0),
      separatorBuilder: (_, __) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        if (index >= chat.messages.length) {
          return AssistantMessageView(
            content: chat.streamingText,
            streaming: true,
          );
        }
        final message = chat.messages[index];
        return message.isUser
            ? UserMessageBubble(message: message, onJumpToPage: widget.onJumpToPage)
            : AssistantMessageView(
                content: message.content,
                starred: message.starred,
                onToggleStar: () => chat.toggleStar(message),
              );
      },
    );
  }

  Widget _emptyState(ChatController chat) {
    final c = context.colors;
    final suggestions = [
      'Resume esta página en tres puntos',
      '¿Cuáles son las ideas clave del documento?',
      'Explícame esto como si tuviera 15 años',
    ];
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Icon(Icons.auto_awesome, size: 26, color: c.accent),
          const SizedBox(height: 12),
          Text(
            'Pregunta sobre el documento',
            textAlign: TextAlign.center,
            style: AppText.title(c),
          ),
          const SizedBox(height: 6),
          Text(
            'Selecciona texto en el PDF y elige «Preguntar a la IA», '
            'o escribe aquí directamente.',
            textAlign: TextAlign.center,
            style: AppText.secondary(c),
          ),
          const SizedBox(height: 20),
          for (final s in suggestions)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: _SuggestionCard(text: s, onTap: () => _send(s)),
            ),
        ],
      ),
    );
  }
}

class _SuggestionCard extends StatefulWidget {
  const _SuggestionCard({required this.text, required this.onTap});

  final String text;
  final VoidCallback onTap;

  @override
  State<_SuggestionCard> createState() => _SuggestionCardState();
}

class _SuggestionCardState extends State<_SuggestionCard> {
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
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: _hover ? c.hover : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: _hover ? c.borderStrong : c.border),
          ),
          child: Row(
            children: [
              Icon(Icons.north_east, size: 12, color: c.accent),
              const SizedBox(width: 8),
              Expanded(child: Text(widget.text, style: AppText.secondary(c))),
            ],
          ),
        ),
      ),
    );
  }
}
