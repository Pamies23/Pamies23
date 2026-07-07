import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/theme/app_theme.dart';
import '../../services/ai/ai_catalog.dart';

/// Preset de estilo de respuesta: instrucciones adicionales que se añaden
/// al system prompt de la IA. El usuario guarda hasta 3 y activa una.
class ResponsePreset {
  const ResponsePreset({required this.name, required this.instructions});

  final String name;
  final String instructions;

  ResponsePreset copyWith({String? name, String? instructions}) =>
      ResponsePreset(
        name: name ?? this.name,
        instructions: instructions ?? this.instructions,
      );
}

/// Preferencias de la app. Las API keys van al almacén seguro del sistema
/// (DPAPI en Windows, Keychain en iOS); el resto a SharedPreferences.
class SettingsController extends ChangeNotifier {
  SettingsController._(this._prefs);

  static const _storage = FlutterSecureStorage();

  static const _kTheme = 'themeMode';
  static const _kProvider = 'provider';
  static const _kModelAnthropic = 'model.anthropic';
  static const _kModelOpenai = 'model.openai';
  static const _kMaxTokens = 'maxTokens';
  static const _kIncludePage = 'includePageContext';
  static const _kAnthropicKey = 'apiKey.anthropic';
  static const _kOpenaiKey = 'apiKey.openai';
  static const _kHighlightColorPrefix = 'highlightColor.';
  static const _kLastHighlightColor = 'lastHighlightColor';
  static const _kPresetNamePrefix = 'preset.name.';
  static const _kPresetTextPrefix = 'preset.text.';
  static const _kActivePreset = 'preset.active';

  static const _defaultPresets = [
    ResponsePreset(
      name: 'Conciso',
      instructions: 'Responde de forma breve y directa, sin rodeos. '
          'Usa como máximo un par de frases salvo que se pida detalle.',
    ),
    ResponsePreset(
      name: 'Detallado',
      instructions: 'Responde con explicaciones completas y bien '
          'estructuradas, usando ejemplos cuando ayuden a entender mejor.',
    ),
    ResponsePreset(
      name: 'Técnico',
      instructions: 'Responde con precisión técnica, usando la terminología '
          'propia del campo del documento sin simplificar en exceso.',
    ),
  ];

  final SharedPreferences _prefs;

  ThemeMode _themeMode = ThemeMode.system;
  AiProviderId _provider = AiProviderId.anthropic;
  String _anthropicModel = AiCatalog.defaultModelFor(AiProviderId.anthropic);
  String _openaiModel = AiCatalog.defaultModelFor(AiProviderId.openai);
  int _maxTokens = 8192;
  bool _includePageContext = true;

  String? _anthropicKey;
  String? _openaiKey;

  List<Color> _highlightColors = List.of(HighlightPalette.all);
  Color? _lastHighlightColor;

  List<ResponsePreset> _presets = List.of(_defaultPresets);

  /// -1 = sin preset activo (comportamiento por defecto).
  int _activePreset = -1;

  static Future<SettingsController> load() async {
    final prefs = await SharedPreferences.getInstance();
    final c = SettingsController._(prefs);
    c._themeMode = switch (prefs.getString(_kTheme)) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
    c._provider = AiProviderIdX.fromKey(prefs.getString(_kProvider));
    c._anthropicModel =
        prefs.getString(_kModelAnthropic) ?? c._anthropicModel;
    c._openaiModel = prefs.getString(_kModelOpenai) ?? c._openaiModel;
    c._maxTokens = prefs.getInt(_kMaxTokens) ?? c._maxTokens;
    c._includePageContext = prefs.getBool(_kIncludePage) ?? true;

    c._highlightColors = [
      for (var i = 0; i < HighlightPalette.all.length; i++)
        Color(prefs.getInt('$_kHighlightColorPrefix$i') ??
            HighlightPalette.all[i].toARGB32()),
    ];
    final lastColorValue = prefs.getInt(_kLastHighlightColor);
    c._lastHighlightColor =
        lastColorValue == null ? null : Color(lastColorValue);

    c._presets = [
      for (var i = 0; i < _defaultPresets.length; i++)
        ResponsePreset(
          name: prefs.getString('$_kPresetNamePrefix$i') ??
              _defaultPresets[i].name,
          instructions: prefs.getString('$_kPresetTextPrefix$i') ??
              _defaultPresets[i].instructions,
        ),
    ];
    c._activePreset = prefs.getInt(_kActivePreset) ?? -1;

    try {
      c._anthropicKey = await _storage.read(key: _kAnthropicKey);
      c._openaiKey = await _storage.read(key: _kOpenaiKey);
    } catch (_) {
      // Si el almacén seguro no está disponible, la app sigue funcionando;
      // simplemente habrá que volver a introducir la clave.
    }
    return c;
  }

  ThemeMode get themeMode => _themeMode;
  AiProviderId get provider => _provider;
  int get maxTokens => _maxTokens;
  bool get includePageContext => _includePageContext;
  List<Color> get highlightColors => List.unmodifiable(_highlightColors);
  Color? get lastHighlightColor => _lastHighlightColor;
  List<ResponsePreset> get presets => List.unmodifiable(_presets);
  int get activePresetIndex => _activePreset;
  ResponsePreset? get activePreset =>
      (_activePreset >= 0 && _activePreset < _presets.length)
          ? _presets[_activePreset]
          : null;

  String modelFor(AiProviderId provider) => switch (provider) {
        AiProviderId.anthropic => _anthropicModel,
        AiProviderId.openai => _openaiModel,
      };

  String get activeModel => modelFor(_provider);

  String? apiKeyFor(AiProviderId provider) => switch (provider) {
        AiProviderId.anthropic => _anthropicKey,
        AiProviderId.openai => _openaiKey,
      };

  bool hasKeyFor(AiProviderId provider) {
    final key = apiKeyFor(provider);
    return key != null && key.trim().isNotEmpty;
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    await _prefs.setString(_kTheme, switch (mode) {
      ThemeMode.light => 'light',
      ThemeMode.dark => 'dark',
      ThemeMode.system => 'system',
    });
    notifyListeners();
  }

  Future<void> setProvider(AiProviderId provider) async {
    _provider = provider;
    await _prefs.setString(_kProvider, provider.key);
    notifyListeners();
  }

  Future<void> setModel(AiProviderId provider, String model) async {
    if (provider == AiProviderId.anthropic) {
      _anthropicModel = model;
      await _prefs.setString(_kModelAnthropic, model);
    } else {
      _openaiModel = model;
      await _prefs.setString(_kModelOpenai, model);
    }
    notifyListeners();
  }

  Future<void> setMaxTokens(int value) async {
    _maxTokens = value.clamp(256, 64000).toInt();
    await _prefs.setInt(_kMaxTokens, _maxTokens);
    notifyListeners();
  }

  Future<void> setIncludePageContext(bool value) async {
    _includePageContext = value;
    await _prefs.setBool(_kIncludePage, value);
    notifyListeners();
  }

  Future<void> setApiKey(AiProviderId provider, String? key) async {
    final trimmed = key?.trim();
    final storageKey =
        provider == AiProviderId.anthropic ? _kAnthropicKey : _kOpenaiKey;
    if (provider == AiProviderId.anthropic) {
      _anthropicKey = trimmed;
    } else {
      _openaiKey = trimmed;
    }
    try {
      if (trimmed == null || trimmed.isEmpty) {
        await _storage.delete(key: storageKey);
      } else {
        await _storage.write(key: storageKey, value: trimmed);
      }
    } catch (_) {
      // Sin almacén seguro la clave vive solo en memoria durante la sesión.
    }
    notifyListeners();
  }

  Future<void> setHighlightColor(int index, Color color) async {
    if (index < 0 || index >= _highlightColors.length) return;
    _highlightColors = List.of(_highlightColors);
    _highlightColors[index] = color;
    await _prefs.setInt('$_kHighlightColorPrefix$index', color.toARGB32());
    notifyListeners();
  }

  Future<void> setLastHighlightColor(Color color) async {
    _lastHighlightColor = color;
    await _prefs.setInt(_kLastHighlightColor, color.toARGB32());
    notifyListeners();
  }

  Future<void> setPreset(int index, {String? name, String? instructions}) async {
    if (index < 0 || index >= _presets.length) return;
    _presets = List.of(_presets);
    _presets[index] = _presets[index].copyWith(
      name: name,
      instructions: instructions,
    );
    if (name != null) {
      await _prefs.setString('$_kPresetNamePrefix$index', name);
    }
    if (instructions != null) {
      await _prefs.setString('$_kPresetTextPrefix$index', instructions);
    }
    notifyListeners();
  }

  /// Activa el preset [index], o -1 para no aplicar ninguno.
  Future<void> setActivePreset(int index) async {
    _activePreset = index;
    await _prefs.setInt(_kActivePreset, index);
    notifyListeners();
  }
}
