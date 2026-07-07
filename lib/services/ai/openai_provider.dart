import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'ai_provider.dart';
import 'sse.dart';

/// Cliente de la API Chat Completions de OpenAI (streaming SSE).
/// Referencia: POST https://api.openai.com/v1/chat/completions
class OpenAiClient implements AiClient {
  static const _endpoint = 'https://api.openai.com/v1/chat/completions';

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
          'messages': [
            if (request.system != null && request.system!.isNotEmpty)
              {'role': 'system', 'content': request.system},
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

        String? finishReason;
        await for (final data in sseDataLines(response.stream)) {
          if (cancelled) break;
          if (data == '[DONE]') break;
          final Map<String, dynamic> event;
          try {
            event = jsonDecode(data) as Map<String, dynamic>;
          } catch (_) {
            continue;
          }
          final choices = event['choices'] as List<dynamic>?;
          if (choices == null || choices.isEmpty) continue;
          final choice = choices.first as Map<String, dynamic>;
          final delta = choice['delta'] as Map<String, dynamic>?;
          final content = delta?['content'];
          if (content is String && content.isNotEmpty) {
            controller.add(AiTextDelta(content));
          }
          finishReason =
              choice['finish_reason'] as String? ?? finishReason;
        }

        if (!cancelled) controller.add(AiDone(finishReason));
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
