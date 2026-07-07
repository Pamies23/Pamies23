import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_theme.dart';
import '../../data/settings/settings_controller.dart';
import '../../services/ai/ai_catalog.dart';
import '../widgets/common/ui.dart';

/// Ajustes: tema, proveedor de IA por defecto, API keys y modelos.
class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final settings = context.watch<SettingsController>();

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
                  Text('Ajustes', style: AppText.title(c)),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 22),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 620),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionLabel('Apariencia'),
                        const SizedBox(height: 10),
                        _ThemeSelector(settings: settings),
                        const SizedBox(height: 30),
                        const SectionLabel('Inteligencia artificial'),
                        const SizedBox(height: 10),
                        _ProviderSelector(settings: settings),
                        const SizedBox(height: 18),
                        _ProviderCard(
                          provider: AiProviderId.anthropic,
                          settings: settings,
                          keyHint: 'sk-ant-…',
                          keyHelp:
                              'Crea una API key en console.anthropic.com → API keys.',
                        ),
                        const SizedBox(height: 14),
                        _ProviderCard(
                          provider: AiProviderId.openai,
                          settings: settings,
                          keyHint: 'sk-…',
                          keyHelp:
                              'Crea una API key en platform.openai.com → API keys.',
                        ),
                        const SizedBox(height: 18),
                        _MaxTokensField(settings: settings),
                        const SizedBox(height: 10),
                        Text(
                          'Las API keys se guardan en el almacén seguro del sistema '
                          '(DPAPI en Windows, Llavero en iOS) y solo se envían a su '
                          'proveedor correspondiente.',
                          style: AppText.secondary(c),
                        ),
                        const SizedBox(height: 30),
                        const SectionLabel('Acerca de'),
                        const SizedBox(height: 10),
                        Text(
                          'Folio · lector de PDF con IA integrada.\n'
                          'App personal — nombre provisional.',
                          style: AppText.secondary(c),
                        ),
                      ],
                    ),
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

class _ThemeSelector extends StatelessWidget {
  const _ThemeSelector({required this.settings});

  final SettingsController settings;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    Widget option(ThemeMode mode, IconData icon, String label) {
      final selected = settings.themeMode == mode;
      return Expanded(
        child: MouseRegion(
          cursor: SystemMouseCursors.click,
          child: GestureDetector(
            onTap: () => settings.setThemeMode(mode),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: selected ? c.accentSoft : Colors.transparent,
                borderRadius: BorderRadius.circular(9),
                border: Border.all(
                  color: selected ? c.accent : c.border,
                  width: selected ? 1.4 : 1,
                ),
              ),
              child: Column(
                children: [
                  Icon(icon, size: 18,
                      color: selected ? c.accent : c.inkSecondary),
                  const SizedBox(height: 6),
                  Text(
                    label,
                    style: AppText.secondary(c).copyWith(
                      color: selected ? c.accent : c.inkSecondary,
                      fontWeight:
                          selected ? FontWeight.w600 : FontWeight.w400,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Row(
      children: [
        option(ThemeMode.system, Icons.brightness_auto_outlined, 'Sistema'),
        const SizedBox(width: 10),
        option(ThemeMode.light, Icons.wb_sunny_outlined, 'Papel (claro)'),
        const SizedBox(width: 10),
        option(ThemeMode.dark, Icons.nightlight_outlined, 'Tinta (oscuro)'),
      ],
    );
  }
}

class _ProviderSelector extends StatelessWidget {
  const _ProviderSelector({required this.settings});

  final SettingsController settings;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Row(
      children: [
        Text('Proveedor por defecto', style: AppText.body(c)),
        const Spacer(),
        for (final p in AiProviderId.values) ...[
          MouseRegion(
            cursor: SystemMouseCursors.click,
            child: GestureDetector(
              onTap: () => settings.setProvider(p),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 120),
                margin: const EdgeInsets.only(left: 8),
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                decoration: BoxDecoration(
                  color: settings.provider == p
                      ? c.accentSoft
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: settings.provider == p ? c.accent : c.border,
                  ),
                ),
                child: Text(
                  p.label,
                  style: AppText.secondary(c).copyWith(
                    color: settings.provider == p ? c.accent : c.inkSecondary,
                    fontWeight: settings.provider == p
                        ? FontWeight.w600
                        : FontWeight.w400,
                  ),
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }
}

/// Tarjeta de configuración de un proveedor: API key + modelo.
class _ProviderCard extends StatefulWidget {
  const _ProviderCard({
    required this.provider,
    required this.settings,
    required this.keyHint,
    required this.keyHelp,
  });

  final AiProviderId provider;
  final SettingsController settings;
  final String keyHint;
  final String keyHelp;

  @override
  State<_ProviderCard> createState() => _ProviderCardState();
}

class _ProviderCardState extends State<_ProviderCard> {
  final _keyController = TextEditingController();
  final _customModelController = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _keyController.dispose();
    _customModelController.dispose();
    super.dispose();
  }

  Future<void> _saveKey() async {
    final value = _keyController.text.trim();
    if (value.isEmpty) return;
    await widget.settings.setApiKey(widget.provider, value);
    _keyController.clear();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('API key de ${widget.provider.label} guardada')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final settings = widget.settings;
    final provider = widget.provider;
    final hasKey = settings.hasKeyFor(provider);
    final currentModel = settings.modelFor(provider);
    final catalog = AiCatalog.modelsFor(provider);
    final isCustomModel = !catalog.any((m) => m.id == currentModel);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: c.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(provider.label, style: AppText.bodyStrong(c)),
              const SizedBox(width: 8),
              Pill(
                text: hasKey ? 'Key guardada' : 'Sin key',
                icon: hasKey ? Icons.check_circle_outline : Icons.key_off,
                accent: hasKey,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _keyController,
                  obscureText: _obscure,
                  style: AppText.mono(c).copyWith(fontSize: 12),
                  decoration: folioInputDecoration(
                    context,
                    hint: hasKey
                        ? '•••••••• (guardada — pega una nueva para sustituirla)'
                        : widget.keyHint,
                    suffixIcon: FolioIconButton(
                      icon: _obscure
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,
                      size: 15,
                      onPressed: () => setState(() => _obscure = !_obscure),
                    ),
                  ),
                  onSubmitted: (_) => _saveKey(),
                ),
              ),
              const SizedBox(width: 8),
              FolioButton(label: 'Guardar', primary: true, onPressed: _saveKey),
              if (hasKey) ...[
                const SizedBox(width: 6),
                FolioIconButton(
                  icon: Icons.delete_outline,
                  tooltip: 'Borrar API key',
                  danger: true,
                  onPressed: () => settings.setApiKey(provider, null),
                ),
              ],
            ],
          ),
          const SizedBox(height: 6),
          Text(widget.keyHelp, style: AppText.secondary(c)),
          const SizedBox(height: 14),
          Text('Modelo', style: AppText.label(c)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              for (final m in catalog)
                _ModelPill(
                  label: m.label,
                  note: m.note,
                  selected: currentModel == m.id,
                  onTap: () => settings.setModel(provider, m.id),
                ),
              _ModelPill(
                label: isCustomModel ? 'Personalizado: $currentModel' : 'Personalizado…',
                selected: isCustomModel,
                onTap: () async {
                  _customModelController.text =
                      isCustomModel ? currentModel : '';
                  final value = await _askCustomModel(context);
                  if (value != null && value.isNotEmpty) {
                    await settings.setModel(provider, value);
                  }
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<String?> _askCustomModel(BuildContext context) {
    return showFolioDialog<String>(
      context,
      maxWidth: 440,
      child: Builder(builder: (context) {
        final c = context.colors;
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('ID de modelo personalizado', style: AppText.title(c)),
              const SizedBox(height: 6),
              Text(
                'Útil cuando salga un modelo nuevo que aún no esté en la lista.',
                style: AppText.secondary(c),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: _customModelController,
                autofocus: true,
                style: AppText.mono(c).copyWith(fontSize: 12.5),
                decoration: folioInputDecoration(context,
                    hint: 'p. ej. claude-opus-4-8'),
                onSubmitted: (value) =>
                    Navigator.of(context).pop(value.trim()),
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
                    label: 'Usar modelo',
                    primary: true,
                    onPressed: () => Navigator.of(context)
                        .pop(_customModelController.text.trim()),
                  ),
                ],
              ),
            ],
          ),
        );
      }),
    );
  }
}

class _ModelPill extends StatelessWidget {
  const _ModelPill({
    required this.label,
    required this.selected,
    required this.onTap,
    this.note,
  });

  final String label;
  final String? note;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
          decoration: BoxDecoration(
            color: selected ? c.accentSoft : Colors.transparent,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: selected ? c.accent : c.border),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: AppText.secondary(c).copyWith(
                  color: selected ? c.accent : c.ink,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                ),
              ),
              if (note != null) ...[
                const SizedBox(width: 5),
                Text('· $note', style: AppText.secondary(c)),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _MaxTokensField extends StatefulWidget {
  const _MaxTokensField({required this.settings});

  final SettingsController settings;

  @override
  State<_MaxTokensField> createState() => _MaxTokensFieldState();
}

class _MaxTokensFieldState extends State<_MaxTokensField> {
  late final _controller =
      TextEditingController(text: '${widget.settings.maxTokens}');

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Longitud máxima de respuesta (tokens)',
                  style: AppText.body(c)),
              Text('Solo Claude lo exige; 8192 va bien para chat.',
                  style: AppText.secondary(c)),
            ],
          ),
        ),
        SizedBox(
          width: 110,
          child: TextField(
            controller: _controller,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            style: AppText.body(c),
            decoration: folioInputDecoration(context),
            onSubmitted: (value) {
              final parsed = int.tryParse(value);
              if (parsed != null) {
                widget.settings.setMaxTokens(parsed);
              }
              _controller.text = '${widget.settings.maxTokens}';
            },
          ),
        ),
      ],
    );
  }
}
