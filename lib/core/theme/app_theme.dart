import 'package:flutter/material.dart';

/// Identidad visual de Folio.
///
/// Dos temas: «Papel» (claro, blanco roto editorial) y «Tinta» (oscuro,
/// grafito cálido). Acento cobre en ambos. Tipografía: Fraunces para
/// titulares, Inter para interfaz, JetBrains Mono para código.
class AppColors extends ThemeExtension<AppColors> {
  const AppColors({
    required this.bg,
    required this.surface,
    required this.raised,
    required this.ink,
    required this.inkSecondary,
    required this.inkFaint,
    required this.border,
    required this.borderStrong,
    required this.accent,
    required this.onAccent,
    required this.accentSoft,
    required this.userBubble,
    required this.danger,
    required this.dangerSoft,
    required this.pdfBackdrop,
    required this.hover,
  });

  /// Fondo general de la app.
  final Color bg;

  /// Paneles y tarjetas.
  final Color surface;

  /// Elementos elevados: menús, diálogos, tooltips.
  final Color raised;

  /// Texto principal.
  final Color ink;

  /// Texto secundario.
  final Color inkSecondary;

  /// Texto terciario / deshabilitado.
  final Color inkFaint;

  /// Bordes finos (hairlines).
  final Color border;

  /// Bordes marcados (inputs con foco suave, divisores activos).
  final Color borderStrong;

  /// Acento cobre.
  final Color accent;

  /// Texto/iconos sobre el acento.
  final Color onAccent;

  /// Fondo tintado con el acento (chips, selección suave).
  final Color accentSoft;

  /// Burbuja de mensajes del usuario en el chat.
  final Color userBubble;

  final Color danger;
  final Color dangerSoft;

  /// Lienzo tras las páginas del PDF.
  final Color pdfBackdrop;

  /// Fondo de hover en controles propios.
  final Color hover;

  static const light = AppColors(
    bg: Color(0xFFF7F4EE),
    surface: Color(0xFFFFFFFF),
    raised: Color(0xFFFFFFFF),
    ink: Color(0xFF211C16),
    inkSecondary: Color(0xFF6E665A),
    inkFaint: Color(0xFFA39A8C),
    border: Color(0xFFE7E1D6),
    borderStrong: Color(0xFFD3CABB),
    accent: Color(0xFFA65B2B),
    onAccent: Color(0xFFFFFFFF),
    accentSoft: Color(0xFFF4E6D9),
    userBubble: Color(0xFFF1EBE1),
    danger: Color(0xFFB03A2A),
    dangerSoft: Color(0xFFF7E4E0),
    pdfBackdrop: Color(0xFFECE7DD),
    hover: Color(0x14211C16),
  );

  static const dark = AppColors(
    bg: Color(0xFF161310),
    surface: Color(0xFF1E1A16),
    raised: Color(0xFF282320),
    ink: Color(0xFFECE5DA),
    inkSecondary: Color(0xFFA79C8C),
    inkFaint: Color(0xFF716858),
    border: Color(0xFF2E2924),
    borderStrong: Color(0xFF423A31),
    accent: Color(0xFFD68F55),
    onAccent: Color(0xFF241304),
    accentSoft: Color(0xFF33261A),
    userBubble: Color(0xFF2A241D),
    danger: Color(0xFFE06B57),
    dangerSoft: Color(0xFF3A211C),
    pdfBackdrop: Color(0xFF100E0B),
    hover: Color(0x14ECE5DA),
  );

  @override
  AppColors copyWith() => this;

  @override
  AppColors lerp(ThemeExtension<AppColors>? other, double t) {
    if (other is! AppColors) return this;
    Color l(Color a, Color b) => Color.lerp(a, b, t)!;
    return AppColors(
      bg: l(bg, other.bg),
      surface: l(surface, other.surface),
      raised: l(raised, other.raised),
      ink: l(ink, other.ink),
      inkSecondary: l(inkSecondary, other.inkSecondary),
      inkFaint: l(inkFaint, other.inkFaint),
      border: l(border, other.border),
      borderStrong: l(borderStrong, other.borderStrong),
      accent: l(accent, other.accent),
      onAccent: l(onAccent, other.onAccent),
      accentSoft: l(accentSoft, other.accentSoft),
      userBubble: l(userBubble, other.userBubble),
      danger: l(danger, other.danger),
      dangerSoft: l(dangerSoft, other.dangerSoft),
      pdfBackdrop: l(pdfBackdrop, other.pdfBackdrop),
      hover: l(hover, other.hover),
    );
  }
}

/// Colores disponibles para subrayar en el PDF.
class HighlightPalette {
  static const yellow = Color(0xFFF5C842);
  static const green = Color(0xFF8CCB7E);
  static const blue = Color(0xFF7AB8F5);
  static const pink = Color(0xFFF08FB5);

  static const all = [yellow, green, blue, pink];

  static String nameOf(Color color) => switch (color) {
        yellow => 'Amarillo',
        green => 'Verde',
        blue => 'Azul',
        pink => 'Rosa',
        _ => 'Color',
      };
}

const kFontUi = 'Inter';
const kFontDisplay = 'Fraunces';
const kFontMono = 'JetBrainsMono';

/// Estilos de texto de la app (accesibles vía [AppText]).
class AppText {
  static TextStyle display(AppColors c) => TextStyle(
        fontFamily: kFontDisplay,
        fontWeight: FontWeight.w600,
        fontSize: 30,
        height: 1.15,
        color: c.ink,
      );

  static TextStyle title(AppColors c) => TextStyle(
        fontFamily: kFontDisplay,
        fontWeight: FontWeight.w600,
        fontSize: 19,
        height: 1.2,
        color: c.ink,
      );

  static TextStyle body(AppColors c) => TextStyle(
        fontFamily: kFontUi,
        fontWeight: FontWeight.w400,
        fontSize: 13.5,
        height: 1.5,
        color: c.ink,
      );

  static TextStyle bodyStrong(AppColors c) =>
      body(c).copyWith(fontWeight: FontWeight.w600);

  static TextStyle secondary(AppColors c) =>
      body(c).copyWith(color: c.inkSecondary, fontSize: 12.5);

  static TextStyle label(AppColors c) => TextStyle(
        fontFamily: kFontUi,
        fontWeight: FontWeight.w600,
        fontSize: 11,
        height: 1.2,
        letterSpacing: 0.7,
        color: c.inkSecondary,
      );

  static TextStyle mono(AppColors c) => TextStyle(
        fontFamily: kFontMono,
        fontWeight: FontWeight.w400,
        fontSize: 12.5,
        height: 1.5,
        color: c.ink,
      );
}

ThemeData buildTheme(Brightness brightness) {
  final colors =
      brightness == Brightness.light ? AppColors.light : AppColors.dark;

  final colorScheme = ColorScheme(
    brightness: brightness,
    primary: colors.accent,
    onPrimary: colors.onAccent,
    secondary: colors.accent,
    onSecondary: colors.onAccent,
    error: colors.danger,
    onError: colors.onAccent,
    surface: colors.surface,
    onSurface: colors.ink,
    outline: colors.border,
    surfaceContainerHighest: colors.raised,
  );

  final baseText = Typography.blackMountainView.apply(
    fontFamily: kFontUi,
    bodyColor: colors.ink,
    displayColor: colors.ink,
  );

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: colors.bg,
    canvasColor: colors.surface,
    dividerColor: colors.border,
    fontFamily: kFontUi,
    textTheme: baseText,
    splashFactory: NoSplash.splashFactory,
    highlightColor: colors.hover,
    hoverColor: colors.hover,
    focusColor: colors.accentSoft,
    iconTheme: IconThemeData(color: colors.inkSecondary, size: 20),
    dividerTheme: DividerThemeData(color: colors.border, thickness: 1),
    scrollbarTheme: ScrollbarThemeData(
      thumbColor: WidgetStatePropertyAll(colors.inkFaint.withValues(alpha: 0.45)),
      radius: const Radius.circular(8),
      thickness: const WidgetStatePropertyAll(6),
    ),
    tooltipTheme: TooltipThemeData(
      waitDuration: const Duration(milliseconds: 450),
      decoration: BoxDecoration(
        color: colors.raised,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: colors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.18),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      textStyle: TextStyle(
        fontFamily: kFontUi,
        fontSize: 12,
        color: colors.ink,
      ),
    ),
    textSelectionTheme: TextSelectionThemeData(
      cursorColor: colors.accent,
      selectionColor: colors.accent.withValues(alpha: 0.28),
      selectionHandleColor: colors.accent,
    ),
    popupMenuTheme: PopupMenuThemeData(
      color: colors.raised,
      surfaceTintColor: Colors.transparent,
      elevation: 8,
      shadowColor: Colors.black.withValues(alpha: 0.3),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: colors.border),
      ),
      textStyle: AppText.body(colors),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: colors.raised,
      contentTextStyle: AppText.body(colors),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: colors.border),
      ),
    ),
    extensions: [colors],
  );
}

extension AppColorsContext on BuildContext {
  AppColors get colors => Theme.of(this).extension<AppColors>()!;
}
