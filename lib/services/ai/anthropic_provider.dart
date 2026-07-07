import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'ai_provider.dart';
import 'sse.dart';

/// Cliente de la API de mensajes de Anthropic (streaming SSE).
/// Referencia: POST https://api.anthropic.com/v1/messages
class AnthropicClient implements AiClient {
  static const _endpoint = 'https://api.anthropic.com/v1/messages';
  static const _version = '2023-06-01';

  @override
  AiStream send(AiRequest request, {required String apiKey}) {
    final controller = StreamController<AiEvent>();
    final client = http.Client();
    var cancelled = false;

    Future<void> run() async {
      try {
        final headers = <String, String>{
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': _version,
        };
        final body = <String, Object?>{
          'model': request.model,
          'max_tokens': request.maxTokens,
          'stream': true,
          if (request.system != null && request.system!.isNotEmpty)
            'system': request.system,
          'messages': [
            for (final t in request.turns)
              {'role': t.role, 'content': t.content},
          ],
        };
        // Claude Fable 5 puede rechazar peticiones benignas por sus
        // clasificadores; con `fallbacks` la API reintenta la misma petición
        // con Opus 4.8 dentro de la misma llamada.
        if (request.model.startsWith('claude-fable-5') ||
            request.model.startsWith('claude-mythos-5')) {
          headers['anthropic-beta'] = 'server-side-fallback-2026-06-01';
          body['fallbacks'] = [
            {'model': 'claude-opus-4-8'},
          ];
        }

        final httpRequest = http.Request('POST', Uri.parse(_endpoint))
          ..headers.addAll(headers)
          ..body = jsonEncode(body);
        final response = await client.send(httpRequest);

        if (response.statusCode != 200) {
          final text = await response.stream.bytesToString();
          throw AiException(
            friendlyHttpError(
                response.statusCode, 'Anthropic', _apiErrorMessage(text)),
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
            case 'content_block_delta':
              final delta = event['delta'] as Map<String, dynamic>?;
              if (delta?['type'] == 'text_delta') {
                controller.add(AiTextDelta(delta!['text'] as String? ?? ''));
              }
            case 'message_delta':
              final delta = event['delta'] as Map<String, dynamic>?;
              stopReason = delta?['stop_reason'] as String? ?? stopReason;
            case 'error':
              final err = event['error'] as Map<String, dynamic>?;
              throw AiException(
                  err?['message'] as String? ?? 'Error de la API de Anthropic');
          }
        }

        if (!cancelled) {
          if (stopReason == 'refusal') {
            throw AiException(
                'El modelo rechazó la petición por sus filtros de seguridad. '
                'Prueba a reformularla o cambia de modelo en Ajustes.');
          }
          controller.add(AiDone(stopReason));
        }
      } catch (e) {
        if (!cancelled && !controller.isClosed) {
          controller.addError(e is AiException
              ? e
              : AiException('No se pudo conectar con Anthropic: $e'));
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
