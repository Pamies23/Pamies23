import 'dart:io';

import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';

import '../../core/theme/app_theme.dart';

/// Barra de título propia para Windows: zona de arrastre, marca de la app y
/// botones de ventana dibujados con el estilo de Folio. En iOS no se monta.
class WindowTitleBar extends StatefulWidget {
  const WindowTitleBar({super.key});

  static bool get isSupported => Platform.isWindows;

  @override
  State<WindowTitleBar> createState() => _WindowTitleBarState();
}

class _WindowTitleBarState extends State<WindowTitleBar> with WindowListener {
  bool _maximized = false;

  @override
  void initState() {
    super.initState();
    windowManager.addListener(this);
    _syncMaximized();
  }

  Future<void> _syncMaximized() async {
    final value = await windowManager.isMaximized();
    if (mounted) setState(() => _maximized = value);
  }

  @override
  void onWindowMaximize() => setState(() => _maximized = true);

  @override
  void onWindowUnmaximize() => setState(() => _maximized = false);

  @override
  void dispose() {
    windowManager.removeListener(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Container(
      height: 40,
      decoration: BoxDecoration(
        color: c.bg,
        border: Border(bottom: BorderSide(color: c.border)),
      ),
      child: Row(
        children: [
          Expanded(
            child: DragToMoveArea(
              child: GestureDetector(
                behavior: HitTestBehavior.translucent,
                onDoubleTap: () async {
                  if (await windowManager.isMaximized()) {
                    await windowManager.unmaximize();
                  } else {
                    await windowManager.maximize();
                  }
                },
                child: Padding(
                  padding: const EdgeInsets.only(left: 14),
                  child: Row(
                    children: [
                      Text(
                        'Folio',
                        style: TextStyle(
                          fontFamily: kFontDisplay,
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: c.ink,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        width: 4,
                        height: 4,
                        decoration: BoxDecoration(
                          color: c.accent,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Lector con IA',
                        style: TextStyle(
                          fontFamily: kFontUi,
                          fontSize: 11.5,
                          color: c.inkFaint,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          _CaptionButton(
            icon: Icons.remove,
            onPressed: () => windowManager.minimize(),
          ),
          _CaptionButton(
            icon: _maximized ? Icons.filter_none : Icons.crop_square,
            iconSize: _maximized ? 12 : 14,
            onPressed: () async {
              if (_maximized) {
                await windowManager.unmaximize();
              } else {
                await windowManager.maximize();
              }
            },
          ),
          _CaptionButton(
            icon: Icons.close,
            isClose: true,
            onPressed: () => windowManager.close(),
          ),
        ],
      ),
    );
  }
}

class _CaptionButton extends StatefulWidget {
  const _CaptionButton({
    required this.icon,
    required this.onPressed,
    this.isClose = false,
    this.iconSize = 14,
  });

  final IconData icon;
  final VoidCallback onPressed;
  final bool isClose;
  final double iconSize;

  @override
  State<_CaptionButton> createState() => _CaptionButtonState();
}

class _CaptionButtonState extends State<_CaptionButton> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final bg = !_hover
        ? Colors.transparent
        : widget.isClose
            ? const Color(0xFFC42B1C)
            : c.hover;
    final fg = _hover && widget.isClose ? Colors.white : c.inkSecondary;
    return MouseRegion(
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: widget.onPressed,
        child: Container(
          width: 46,
          height: 40,
          color: bg,
          child: Icon(widget.icon, size: widget.iconSize, color: fg),
        ),
      ),
    );
  }
}
