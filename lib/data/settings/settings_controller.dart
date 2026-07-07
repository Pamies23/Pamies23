import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../services/ai/ai_catalog.dart';

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

  final SharedPreferences _prefs;

  ThemeMode _themeMode = ThemeMode.system;
  AiProviderId _provider = AiProviderId.anthropic;
  String _anthropicModel = AiCatalog.defaultModelFor(AiProviderId.anthropic);
  String _openaiModel = AiCatalog.defaultModelFor(AiProviderId.openai);
  int _maxTokens = 8192;
  bool _includePageContext = true;

  String? _anthropicKey;
  String? _openaiKey;

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
}
