import 'dart:convert';

/// Convierte un stream de bytes de una respuesta Server-Sent Events en los
/// payloads de sus líneas `data:` (sin el prefijo). Ignora comentarios,
/// líneas `event:` y líneas vacías.
Stream<String> sseDataLines(Stream<List<int>> body) async* {
  final lines = body.transform(utf8.decoder).transform(const LineSplitter());
  await for (final line in lines) {
    if (!line.startsWith('data:')) continue;
    var payload = line.substring(5);
    if (payload.startsWith(' ')) payload = payload.substring(1);
    if (payload.isEmpty) continue;
    yield payload;
  }
}
