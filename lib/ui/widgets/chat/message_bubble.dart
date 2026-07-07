import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_markdown_plus/flutter_markdown_plus.dart';

import '../../../core/theme/app_theme.dart';
import '../../../data/models/chat.dart';

/// Mensaje del usuario: burbuja alineada a la derecha, con la selección del
/// PDF citada encima si la hubo.
class UserMessageBubble extends StatelessWidget {
  const UserMessageBubble({super.key, required this.message});

  final ChatMessage message;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final selection = message.selection;
    return Align(
      alignment: Alignment.centerRight,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 420),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            if (selection != null && selection.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
                decoration: BoxDecoration(
                  color: c.accentSoft.withValues(alpha: 0.6),
                  borderRadius: BorderRadius.circular(10),
                  border: Border(
                    left: BorderSide(color: c.accent, width: 3),
                    top: BorderSide(color: c.border),
                    right: BorderSide(color: c.border),
                    bottom: BorderSide(color: c.border),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      message.page != null
                          ? 'SELECCIÓN · PÁG. ${message.page}'
                          : 'SELECCIÓN',
                      style: AppText.label(c).copyWith(color: c.accent),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _truncate(selection, 280),
                      style: AppText.secondary(c)
                          .copyWith(fontStyle: FontStyle.italic),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 6),
            ],
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 10),
              decoration: BoxDecoration(
                color: c.userBubble,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(14),
                  topRight: Radius.circular(14),
                  bottomLeft: Radius.circular(14),
                  bottomRight: Radius.circular(4),
                ),
                border: Border.all(color: c.border),
              ),
              child: SelectableText(message.content, style: AppText.body(c)),
            ),
          ],
        ),
      ),
    );
  }

  static String _truncate(String text, int max) {
    final clean = text.replaceAll(RegExp(r'\s+'), ' ').trim();
    return clean.length <= max ? clean : '${clean.substring(0, max - 1)}…';
  }
}

/// Respuesta de la IA: sin burbuja, Markdown renderizado, botón de copiar.
class AssistantMessageView extends StatefulWidget {
  const AssistantMessageView({
    super.key,
    required this.content,
    this.streaming = false,
  });

  final String content;
  final bool streaming;

  @override
  State<AssistantMessageView> createState() => _AssistantMessageViewState();
}

class _AssistantMessageViewState extends State<AssistantMessageView> {
  bool _hover = false;
  bool _copied = false;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return MouseRegion(
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 18,
                height: 18,
                decoration: BoxDecoration(
                  color: c.accent,
                  borderRadius: BorderRadius.circular(5),
                ),
                alignment: Alignment.center,
                child: Text(
                  'F',
                  style: TextStyle(
                    fontFamily: kFontDisplay,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: c.onAccent,
                  ),
                ),
              ),
              const SizedBox(width: 7),
              Text('Asistente', style: AppText.label(c)),
              const Spacer(),
              if (_hover && !widget.streaming && widget.content.isNotEmpty)
                _CopyButton(
                  copied: _copied,
                  onCopy: () async {
                    await Clipboard.setData(
                        ClipboardData(text: widget.content));
                    if (mounted) setState(() => _copied = true);
                    Future<void>.delayed(const Duration(seconds: 2), () {
                      if (mounted) setState(() => _copied = false);
                    });
                  },
                ),
            ],
          ),
          const SizedBox(height: 6),
          if (widget.content.isEmpty && widget.streaming)
            _ThinkingDots(color: c.inkFaint)
          else
            MarkdownBody(
              data: widget.content,
              selectable: true,
              styleSheet: buildMarkdownStyle(c),
            ),
          if (widget.streaming && widget.content.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: _ThinkingDots(color: c.accent),
            ),
        ],
      ),
    );
  }
}

class _CopyButton extends StatelessWidget {
  const _CopyButton({required this.copied, required this.onCopy});

  final bool copied;
  final VoidCallback onCopy;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onCopy,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              copied ? Icons.check : Icons.content_copy,
              size: 13,
              color: copied ? c.accent : c.inkFaint,
            ),
            const SizedBox(width: 4),
            Text(
              copied ? 'Copiado' : 'Copiar',
              style: AppText.secondary(c).copyWith(
                fontSize: 11,
                color: copied ? c.accent : c.inkFaint,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Indicador de escritura (tres puntos con fundido).
class _ThinkingDots extends StatefulWidget {
  const _ThinkingDots({required this.color});

  final Color color;

  @override
  State<_ThinkingDots> createState() => _ThinkingDotsState();
}

class _ThinkingDotsState extends State<_ThinkingDots>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
  )..repeat();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (i) {
            final phase = (_controller.value + i * 0.2) % 1.0;
            final opacity = 0.25 + 0.75 * (1 - (phase - 0.5).abs() * 2);
            return Padding(
              padding: const EdgeInsets.only(right: 4),
              child: Opacity(
                opacity: opacity.clamp(0.25, 1.0).toDouble(),
                child: Container(
                  width: 5,
                  height: 5,
                  decoration: BoxDecoration(
                    color: widget.color,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            );
          }),
        );
      },
    );
  }
}

/// Hoja de estilos Markdown acorde al tema.
MarkdownStyleSheet buildMarkdownStyle(AppColors c) {
  final body = AppText.body(c);
  final mono = AppText.mono(c);
  return MarkdownStyleSheet(
    p: body,
    strong: body.copyWith(fontWeight: FontWeight.w700),
    em: body.copyWith(fontStyle: FontStyle.italic),
    a: body.copyWith(color: c.accent, decoration: TextDecoration.underline),
    h1: TextStyle(
        fontFamily: kFontDisplay,
        fontSize: 21,
        fontWeight: FontWeight.w600,
        height: 1.6,
        color: c.ink),
    h2: TextStyle(
        fontFamily: kFontDisplay,
        fontSize: 18,
        fontWeight: FontWeight.w600,
        height: 1.6,
        color: c.ink),
    h3: body.copyWith(fontWeight: FontWeight.w700, fontSize: 14.5),
    h4: body.copyWith(fontWeight: FontWeight.w700),
    h5: body.copyWith(fontWeight: FontWeight.w600),
    h6: body.copyWith(fontWeight: FontWeight.w600, color: c.inkSecondary),
    listBullet: body,
    blockquote: body.copyWith(color: c.inkSecondary),
    blockquoteDecoration: BoxDecoration(
      border: Border(left: BorderSide(color: c.borderStrong, width: 3)),
    ),
    blockquotePadding: const EdgeInsets.only(left: 12, top: 2, bottom: 2),
    code: mono.copyWith(
      backgroundColor: c.hover,
      fontSize: 12,
    ),
    codeblockDecoration: BoxDecoration(
      color: c.pdfBackdrop,
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: c.border),
    ),
    codeblockPadding: const EdgeInsets.all(12),
    horizontalRuleDecoration: BoxDecoration(
      border: Border(top: BorderSide(color: c.border)),
    ),
    tableHead: body.copyWith(fontWeight: FontWeight.w600),
    tableBody: body,
    tableBorder: TableBorder.all(color: c.border, width: 1),
    tableCellsPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
  );
}
