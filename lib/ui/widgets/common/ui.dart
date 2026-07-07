import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';

/// Botón de icono con hover propio (sin ripple Material).
class FolioIconButton extends StatefulWidget {
  const FolioIconButton({
    super.key,
    required this.icon,
    required this.onPressed,
    this.tooltip,
    this.size = 18,
    this.active = false,
    this.danger = false,
  });

  final IconData icon;
  final VoidCallback? onPressed;
  final String? tooltip;
  final double size;
  final bool active;
  final bool danger;

  @override
  State<FolioIconButton> createState() => _FolioIconButtonState();
}

class _FolioIconButtonState extends State<FolioIconButton> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final enabled = widget.onPressed != null;
    final color = !enabled
        ? c.inkFaint
        : widget.danger
            ? c.danger
            : widget.active
                ? c.accent
                : _hover
                    ? c.ink
                    : c.inkSecondary;

    Widget child = MouseRegion(
      cursor: enabled ? SystemMouseCursors.click : MouseCursor.defer,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: widget.onPressed,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: widget.active
                ? c.accentSoft
                : _hover && enabled
                    ? c.hover
                    : Colors.transparent,
            borderRadius: BorderRadius.circular(7),
          ),
          child: Icon(widget.icon, size: widget.size, color: color),
        ),
      ),
    );
    if (widget.tooltip != null) {
      child = Tooltip(message: widget.tooltip!, child: child);
    }
    return child;
  }
}

/// Botón principal / secundario de la app.
class FolioButton extends StatefulWidget {
  const FolioButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.primary = false,
    this.danger = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool primary;
  final bool danger;

  @override
  State<FolioButton> createState() => _FolioButtonState();
}

class _FolioButtonState extends State<FolioButton> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final enabled = widget.onPressed != null;

    final Color bg;
    final Color fg;
    final Color borderColor;
    if (widget.primary) {
      bg = enabled
          ? (_hover ? Color.lerp(c.accent, Colors.black, 0.08)! : c.accent)
          : c.accent.withValues(alpha: 0.4);
      fg = c.onAccent;
      borderColor = Colors.transparent;
    } else if (widget.danger) {
      bg = _hover ? c.dangerSoft : Colors.transparent;
      fg = c.danger;
      borderColor = c.border;
    } else {
      bg = _hover ? c.hover : Colors.transparent;
      fg = enabled ? c.ink : c.inkFaint;
      borderColor = c.border;
    }

    return MouseRegion(
      cursor: enabled ? SystemMouseCursors.click : MouseCursor.defer,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: widget.onPressed,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: borderColor),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (widget.icon != null) ...[
                Icon(widget.icon, size: 15, color: fg),
                const SizedBox(width: 7),
              ],
              Text(
                widget.label,
                style: TextStyle(
                  fontFamily: kFontUi,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
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

/// Etiqueta de sección en mayúsculas pequeñas.
class SectionLabel extends StatelessWidget {
  const SectionLabel(this.text, {super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Text(text.toUpperCase(), style: AppText.label(c));
  }
}

/// Chip informativo pequeño.
class Pill extends StatelessWidget {
  const Pill({super.key, required this.text, this.icon, this.accent = false});

  final String text;
  final IconData? icon;
  final bool accent;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final fg = accent ? c.accent : c.inkSecondary;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: accent ? c.accentSoft : c.hover,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: fg),
            const SizedBox(width: 4),
          ],
          Text(
            text,
            style: TextStyle(
              fontFamily: kFontUi,
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: fg,
            ),
          ),
        ],
      ),
    );
  }
}

/// Estado vacío con icono y texto.
class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.action,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 340),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: c.accentSoft,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 26, color: c.accent),
            ),
            const SizedBox(height: 16),
            Text(title, style: AppText.title(c), textAlign: TextAlign.center),
            if (subtitle != null) ...[
              const SizedBox(height: 6),
              Text(
                subtitle!,
                style: AppText.secondary(c),
                textAlign: TextAlign.center,
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: 18),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

/// Decoración estándar para campos de texto.
InputDecoration folioInputDecoration(
  BuildContext context, {
  String? hint,
  Widget? suffixIcon,
}) {
  final c = context.colors;
  OutlineInputBorder border(Color color) => OutlineInputBorder(
        borderRadius: BorderRadius.circular(9),
        borderSide: BorderSide(color: color),
      );
  return InputDecoration(
    hintText: hint,
    hintStyle: AppText.body(c).copyWith(color: c.inkFaint),
    isDense: true,
    filled: true,
    fillColor: c.surface,
    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
    enabledBorder: border(c.border),
    focusedBorder: border(c.accent),
    border: border(c.border),
    suffixIcon: suffixIcon,
  );
}

/// Diálogo con el estilo de la app.
Future<T?> showFolioDialog<T>(
  BuildContext context, {
  required Widget child,
  double maxWidth = 480,
}) {
  return showDialog<T>(
    context: context,
    barrierColor: Colors.black.withValues(alpha: 0.45),
    builder: (context) {
      final c = context.colors;
      return Dialog(
        backgroundColor: Colors.transparent,
        elevation: 0,
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: maxWidth),
          child: Container(
            decoration: BoxDecoration(
              color: c.raised,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: c.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.35),
                  blurRadius: 40,
                  offset: const Offset(0, 16),
                ),
              ],
            ),
            child: child,
          ),
        ),
      );
    },
  );
}

/// Confirmación sencilla. Devuelve true si el usuario acepta.
Future<bool> confirm(
  BuildContext context, {
  required String title,
  required String message,
  String confirmLabel = 'Eliminar',
}) async {
  final result = await showFolioDialog<bool>(
    context,
    maxWidth: 400,
    child: Builder(builder: (context) {
      final c = context.colors;
      return Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: AppText.title(c)),
            const SizedBox(height: 10),
            Text(message, style: AppText.body(c)),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                FolioButton(
                  label: 'Cancelar',
                  onPressed: () => Navigator.of(context).pop(false),
                ),
                const SizedBox(width: 8),
                FolioButton(
                  label: confirmLabel,
                  danger: true,
                  onPressed: () => Navigator.of(context).pop(true),
                ),
              ],
            ),
          ],
        ),
      );
    }),
  );
  return result ?? false;
}
