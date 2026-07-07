/// Tipos comunes de la capa de IA. Cada proveedor (Anthropic, OpenAI)
/// implementa [AiClient] y produce un stream de deltas de texto.
library;

class AiTurn {
  const AiTurn.user(this.content) : role = 'user';
  const AiTurn.assistant(this.content) : role = 'assistant';

  final String role;
  final String content;
}

class AiRequest {
  const AiRequest({
    required this.model,
    required this.turns,
    this.system,
    this.maxTokens = 8192,
  });

  final String model;
  final List<AiTurn> turns;
  final String? system;
  final int maxTokens;
}

sealed class AiEvent {}

class AiTextDelta extends AiEvent {
  AiTextDelta(this.text);
  final String text;
}

class AiDone extends AiEvent {
  AiDone(this.stopReason);
  final String? stopReason;
}

class AiException implements Exception {
  AiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

/// Stream en curso: los eventos y una forma de cancelarlo (cierra el socket).
class AiStream {
  const AiStream({required this.events, required this.cancel});

  final Stream<AiEvent> events;
  final void Function() cancel;
}

abstract class AiClient {
  AiStream send(AiRequest request, {required String apiKey});
}

/// Mensaje de error legible a partir de un código HTTP de una API de IA.
String friendlyHttpError(int status, String providerLabel, String? apiMessage) {
  final detail =
      (apiMessage == null || apiMessage.isEmpty) ? '' : '\n$apiMessage';
  return switch (status) {
    401 => 'API key de $providerLabel inválida o revocada. Revísala en Ajustes.$detail',
    403 => 'La API key de $providerLabel no tiene permiso para esta operación.$detail',
    404 => 'Modelo no encontrado en $providerLabel. Comprueba el ID del modelo en Ajustes.$detail',
    429 => 'Límite de peticiones de $providerLabel alcanzado. Espera unos segundos y reintenta.$detail',
    529 => '$providerLabel está saturado en este momento. Reintenta en breve.$detail',
    >= 500 => 'Error temporal del servidor de $providerLabel ($status). Reintenta.$detail',
    _ => 'Error de $providerLabel (HTTP $status).$detail',
  };
}
