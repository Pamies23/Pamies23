import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'ai_provider.dart';
import 'sse.dart';

/// Cliente de la Responses API de OpenAI (streaming SSE).
/// Referencia: POST https://api.openai.com/v1/responses
///
/// A diferencia de la antigua Chat Completions API, el system prompt va en
/// el campo `instructions` (no dentro de `input`), y los eventos de
/// streaming traen su tipo en `type` (`response.output_text.delta`,
/// `response.completed`, `response.failed`, ...).
class OpenAiClient implements AiClient {
  static const _endpoint = 'https://api.openai.com/v1/responses';

  @override
  AiStream send(AiRequest request, {required String apiKey}) {
    final controller = StreamController<AiEvent>();
    final client = http.Client();
    var cancelled = false;

    Future<void> run() async {
      try {
        final body = <String, Object?>{
          'model': request.model,
          'stream': true,
          'max_output_tokens': request.maxTokens,
          if (request.system != null && request.system!.isNotEmpty)
            'instructions': request.system,
          'input': [
            for (final t in request.turns)
              {'role': t.role, 'content': t.content},
          ],
        };

        final httpRequest = http.Request('POST', Uri.parse(_endpoint))
          ..headers.addAll({
            'content-type': 'application/json',
            'authorization': 'Bearer $apiKey',
          })
          ..body = jsonEncode(body);
        final response = await client.send(httpRequest);

        if (response.statusCode != 200) {
          final text = await response.stream.bytesToString();
          throw AiException(
            friendlyHttpError(
                response.statusCode, 'OpenAI', _apiErrorMessage(text)),
            statusCode: response.statusCode,
          );
        }

        String? stopReason;
        await for (final data in sseDataLines(response.stream)) {
          if (cancelled) break;
          final Map<String, dynamic> event;
          try {
            event = jsonDecode(data) as Map<String, dynamic>;
          } catch (_) {
            continue;
          }
          switch (event['type']) {
            case 'response.output_text.delta':
              final delta = event['delta'] as String?;
              if (delta != null && delta.isNotEmpty) {
                controller.add(AiTextDelta(delta));
              }
            case 'response.completed':
              stopReason = 'stop';
            case 'response.incomplete':
              stopReason = 'incomplete';
            case 'response.failed':
            case 'error':
              final err = event['response'] is Map
                  ? (event['response'] as Map)['error']
                  : event['error'];
              final message = err is Map ? err['message'] as String? : null;
              throw AiException(
                  message ?? 'Error de la Responses API de OpenAI');
          }
        }

        if (!cancelled) controller.add(AiDone(stopReason));
      } catch (e) {
        if (!cancelled && !controller.isClosed) {
          controller.addError(e is AiException
              ? e
              : AiException('No se pudo conectar con OpenAI: $e'));
        }
      } finally {
        client.close();
        if (!controller.isClosed) await controller.close();
      }
    }

    run();
    return AiStream(
      events: controller.stream,
      cancel: () {
        cancelled = true;
        client.close();
      },
    );
  }

  String? _apiErrorMessage(String body) {
    try {
      final json = jsonDecode(body) as Map<String, dynamic>;
      final error = json['error'] as Map<String, dynamic>?;
      return error?['message'] as String?;
    } catch (_) {
      return null;
    }
  }
}
