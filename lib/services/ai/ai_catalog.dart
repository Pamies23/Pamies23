/// Proveedores soportados.
enum AiProviderId { anthropic, openai }

extension AiProviderIdX on AiProviderId {
  String get key => switch (this) {
        AiProviderId.anthropic => 'anthropic',
        AiProviderId.openai => 'openai',
      };

  String get label => switch (this) {
        AiProviderId.anthropic => 'Claude (Anthropic)',
        AiProviderId.openai => 'OpenAI',
      };

  static AiProviderId fromKey(String? key) => switch (key) {
        'openai' => AiProviderId.openai,
        _ => AiProviderId.anthropic,
      };
}

class AiModel {
  const AiModel(this.id, this.label, {this.note});

  final String id;
  final String label;
  final String? note;
}

/// Catálogo de modelos conocidos (jul. 2026). En Ajustes se puede escribir
/// además un ID personalizado, así el catálogo nunca es un límite.
class AiCatalog {
  static const anthropicModels = <AiModel>[
    AiModel('claude-opus-4-8', 'Claude Opus 4.8', note: 'recomendado'),
    AiModel('claude-sonnet-5', 'Claude Sonnet 5', note: 'rápido y capaz'),
    AiModel('claude-haiku-4-5', 'Claude Haiku 4.5', note: 'el más económico'),
    AiModel('claude-fable-5', 'Claude Fable 5', note: 'máxima capacidad'),
  ];

  static const openaiModels = <AiModel>[
    AiModel('gpt-5.1', 'GPT-5.1'),
    AiModel('gpt-5', 'GPT-5'),
    AiModel('gpt-5-mini', 'GPT-5 mini'),
    AiModel('gpt-4.1', 'GPT-4.1'),
  ];

  static List<AiModel> modelsFor(AiProviderId provider) =>
      switch (provider) {
        AiProviderId.anthropic => anthropicModels,
        AiProviderId.openai => openaiModels,
      };

  static String defaultModelFor(AiProviderId provider) =>
      modelsFor(provider).first.id;
}
