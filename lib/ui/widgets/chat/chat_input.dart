import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_theme.dart';
import '../../../data/settings/settings_controller.dart';
import '../../../services/ai/ai_catalog.dart';
import '../../../state/chat_controller.dart';
import '../common/ui.dart';

/// Entrada del chat: campo multilínea (Enter envía, Shift+Enter salto de
/// línea), chips de contexto y selector rápido de proveedor/modelo.
class ChatInput extends StatefulWidget {
  const ChatInput({
    super.key,
    required this.onSend,
    required this.focusNode,
  });

  final void Function(String text) onSend;
  final FocusNode focusNode;

  @override
  State<ChatInput> createState() => _ChatInputState();
}

class _ChatInputState extends State<ChatInput> {
  final _controller = TextEditingController();
  bool _canSend = false;

  @override
  void initState() {
    super.initState();
    _controller.addListener(() {
      final can = _controller.text.trim().isNotEmpty;
      if (can != _canSend) setState(() => _canSend = can);
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    _controller.clear();
    widget.onSend(text);
  }

  KeyEventResult _handleKey(FocusNode node, KeyEvent event) {
    if (event is KeyDownEvent &&
        event.logicalKey == LogicalKeyboardKey.enter &&
        !HardwareKeyboard.instance.isShiftPressed) {
      _submit();
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final chat = context.watch<ChatController>();
    final settings = context.watch<SettingsController>();

    final pending = chat.pendingSelection;

    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
      decoration: BoxDecoration(
        color: c.surface,
        border: Border(top: BorderSide(color: c.border)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (pending != null) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(10, 7, 4, 7),
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: c.accentSoft.withValues(alpha: 0.55),
                borderRadius: BorderRadius.circular(9),
                border: Border(
                  left: BorderSide(color: c.accent, width: 3),
                  top: BorderSide(color: c.border),
                  right: BorderSide(color: c.border),
                  bottom: BorderSide(color: c.border),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'SELECCIÓN · PÁG. ${pending.page}',
                          style: AppText.label(c).copyWith(color: c.accent),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          pending.text.replaceAll(RegExp(r'\s+'), ' ').trim(),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: AppText.secondary(c)
                              .copyWith(fontStyle: FontStyle.italic),
                        ),
                      ],
                    ),
                  ),
                  FolioIconButton(
                    icon: Icons.close,
                    size: 13,
                    tooltip: 'Quitar selección',
                    onPressed: () => chat.setPendingSelection(null),
                  ),
                ],
              ),
            ),
          ],
          Row(
            children: [
              _ContextChip(
                icon: Icons.description_outlined,
                label: 'Página actual',
                active: settings.includePageContext,
                tooltip: settings.includePageContext
                    ? 'La página visible se envía como contexto'
                    : 'Sin contexto de página',
                onTap: () => settings
                    .setIncludePageContext(!settings.includePageContext),
              ),
              const SizedBox(width: 6),
              _ContextChip(
                icon: Icons.menu_book_outlined,
                label: 'Documento entero',
                active: chat.attachFullDocumentOnce,
                tooltip: chat.attachFullDocumentOnce
                    ? 'La próxima pregunta adjuntará todo el documento'
                    : 'Adjuntar el documento completo a la próxima pregunta',
                onTap: chat.toggleAttachFullDocument,
              ),
              const Spacer(),
              _ModelSwitcher(settings: settings),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: Focus(
                  onKeyEvent: _handleKey,
                  child: TextField(
                    controller: _controller,
                    focusNode: widget.focusNode,
                    minLines: 1,
                    maxLines: 6,
                    textInputAction: TextInputAction.newline,
                    style: AppText.body(c),
                    decoration: folioInputDecoration(
                      context,
                      hint: pending != null
                          ? 'Pregunta sobre la selección…'
                          : 'Pregunta sobre el documento…',
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              _SendButton(
                streaming: chat.isStreaming,
                enabled: _canSend || chat.isStreaming,
                onTap: chat.isStreaming ? chat.stop : _submit,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SendButton extends StatelessWidget {
  const _SendButton({
    required this.streaming,
    required this.enabled,
    required this.onTap,
  });

  final bool streaming;
  final bool enabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Tooltip(
      message: streaming ? 'Detener (conserva lo recibido)' : 'Enviar (Enter)',
      child: MouseRegion(
        cursor: enabled ? SystemMouseCursors.click : MouseCursor.defer,
        child: GestureDetector(
          onTap: enabled ? onTap : null,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: streaming
                  ? c.dangerSoft
                  : enabled
                      ? c.accent
                      : c.accent.withValues(alpha: 0.35),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              streaming ? Icons.stop_rounded : Icons.arrow_upward_rounded,
              size: 19,
              color: streaming ? c.danger : c.onAccent,
            ),
          ),
        ),
      ),
    );
  }
}

class _ContextChip extends StatelessWidget {
  const _ContextChip({
    required this.icon,
    required this.label,
    required this.active,
    required this.onTap,
    required this.tooltip,
  });

  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;
  final String tooltip;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Tooltip(
      message: tooltip,
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 120),
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
            decoration: BoxDecoration(
              color: active ? c.accentSoft : Colors.transparent,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: active ? c.accent : c.border),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 12.5,
                    color: active ? c.accent : c.inkFaint),
                const SizedBox(width: 5),
                Text(
                  label,
                  style: TextStyle(
                    fontFamily: kFontUi,
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: active ? c.accent : c.inkSecondary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Selector compacto de proveedor y modelo (persiste en Ajustes).
class _ModelSwitcher extends StatelessWidget {
  const _ModelSwitcher({required this.settings});

  final SettingsController settings;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final provider = settings.provider;
    final model = settings.activeModel;
    final known = AiCatalog.modelsFor(provider)
        .where((m) => m.id == model)
        .toList();
    final label = known.isNotEmpty ? known.first.label : model;

    return PopupMenuButton<(AiProviderId, String)>(
      tooltip: 'Cambiar modelo',
      position: PopupMenuPosition.over,
      onSelected: (value) {
        settings.setProvider(value.$1);
        settings.setModel(value.$1, value.$2);
      },
      itemBuilder: (context) => [
        for (final p in AiProviderId.values) ...[
          PopupMenuItem<(AiProviderId, String)>(
            enabled: false,
            height: 30,
            child: Text(p.label.toUpperCase(), style: AppText.label(c)),
          ),
          for (final m in AiCatalog.modelsFor(p))
            PopupMenuItem<(AiProviderId, String)>(
              value: (p, m.id),
              height: 36,
              child: Row(
                children: [
                  Icon(
                    provider == p && model == m.id
                        ? Icons.radio_button_checked
                        : Icons.radio_button_off,
                    size: 14,
                    color: provider == p && model == m.id
                        ? c.accent
                        : c.inkFaint,
                  ),
                  const SizedBox(width: 8),
                  Text(m.label, style: AppText.body(c)),
                  if (m.note != null) ...[
                    const SizedBox(width: 6),
                    Text('· ${m.note}', style: AppText.secondary(c)),
                  ],
                ],
              ),
            ),
        ],
      ],
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(7),
          border: Border.all(color: c.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.auto_awesome, size: 12, color: c.accent),
            const SizedBox(width: 5),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 130),
              child: Text(
                label,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: kFontUi,
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: c.inkSecondary,
                ),
              ),
            ),
            Icon(Icons.expand_more, size: 13, color: c.inkFaint),
          ],
        ),
      ),
    );
  }
}
