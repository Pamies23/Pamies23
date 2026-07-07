import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';

/// Menú flotante que aparece sobre el texto seleccionado en el PDF:
/// preguntar a la IA, explicar directamente, subrayar en color y copiar.
class SelectionMenu extends StatelessWidget {
  const SelectionMenu({
    super.key,
    required this.anchor,
    required this.areaSize,
    required this.onAsk,
    required this.onExplain,
    required this.onHighlight,
    required this.onCopy,
    this.highlightColors = HighlightPalette.all,
  });

  /// Región seleccionada, en coordenadas locales del área del PDF.
  final Rect anchor;

  /// Tamaño del área del PDF (para no salirnos de ella).
  final Size areaSize;

  final VoidCallback onAsk;
  final VoidCallback onExplain;
  final ValueChanged<Color> onHighlight;
  final VoidCallback onCopy;

  /// Colores de subrayado configurados por el usuario en Ajustes.
  final List<Color> highlightColors;

  static const _width = 404.0;
  static const _height = 44.0;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;

    final maxLeft = areaSize.width - _width - 8;
    final left = (anchor.center.dx - _width / 2)
        .clamp(8.0, maxLeft < 8 ? 8.0 : maxLeft)
        .toDouble();
    final above = anchor.top - _height - 10;
    final rawTop = above >= 8 ? above : (anchor.bottom + 10);
    final maxTop = areaSize.height - _height - 8;
    final top = rawTop.clamp(8.0, maxTop < 8 ? 8.0 : maxTop).toDouble();

    return Positioned(
      left: left,
      top: top,
      child: Material(
        color: Colors.transparent,
        child: Container(
          width: _width,
          height: _height,
          padding: const EdgeInsets.symmetric(horizontal: 6),
          decoration: BoxDecoration(
            color: c.raised,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: c.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.25),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            children: [
              _MenuAction(
                icon: Icons.auto_awesome,
                label: 'Preguntar a la IA',
                accent: true,
                onTap: onAsk,
              ),
              _MenuAction(
                icon: Icons.lightbulb_outline,
                label: 'Explicar',
                onTap: onExplain,
              ),
              _divider(c),
              for (final color in highlightColors)
                _ColorDot(
                  color: color,
                  tooltip: 'Subrayar (espacio para repetir el último color)',
                  onTap: () => onHighlight(color),
                ),
              _divider(c),
              Tooltip(
                message: 'Copiar',
                child: _IconTap(
                  icon: Icons.copy_outlined,
                  onTap: onCopy,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _divider(AppColors c) => Container(
        width: 1,
        height: 20,
        margin: const EdgeInsets.symmetric(horizontal: 5),
        color: c.border,
      );
}

class _MenuAction extends StatefulWidget {
  const _MenuAction({
    required this.icon,
    required this.label,
    required this.onTap,
    this.accent = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool accent;

  @override
  State<_MenuAction> createState() => _MenuActionState();
}

class _MenuActionState extends State<_MenuAction> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final fg = widget.accent ? c.accent : c.ink;
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          decoration: BoxDecoration(
            color: _hover
                ? (widget.accent ? c.accentSoft : c.hover)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(7),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(widget.icon, size: 14, color: fg),
              const SizedBox(width: 5),
              Text(
                widget.label,
                style: TextStyle(
                  fontFamily: kFontUi,
                  fontSize: 12,
                  fontWeight:
                      widget.accent ? FontWeight.w600 : FontWeight.w500,
                  color: fg,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ColorDot extends StatefulWidget {
  const _ColorDot({
    required this.color,
    required this.onTap,
    required this.tooltip,
  });

  final Color color;
  final VoidCallback onTap;
  final String tooltip;

  @override
  State<_ColorDot> createState() => _ColorDotState();
}

class _ColorDotState extends State<_ColorDot> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: widget.tooltip,
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        onEnter: (_) => setState(() => _hover = true),
        onExit: (_) => setState(() => _hover = false),
        child: GestureDetector(
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 100),
            margin: const EdgeInsets.symmetric(horizontal: 3),
            width: _hover ? 18 : 15,
            height: _hover ? 18 : 15,
            decoration: BoxDecoration(
              color: widget.color,
              shape: BoxShape.circle,
              border: Border.all(
                color: Colors.black.withValues(alpha: 0.15),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _IconTap extends StatefulWidget {
  const _IconTap({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  State<_IconTap> createState() => _IconTapState();
}

class _IconTapState extends State<_IconTap> {
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
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: _hover ? c.hover : Colors.transparent,
            borderRadius: BorderRadius.circular(7),
          ),
          child: Icon(widget.icon, size: 14, color: c.inkSecondary),
        ),
      ),
    );
  }
}
