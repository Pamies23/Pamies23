import 'dart:convert';
import 'dart:ui';

/// Un subrayado persistente sobre el PDF.
///
/// Se guardan los rectángulos (en coordenadas de página PDF) de cada línea
/// seleccionada, de modo que al reabrir el documento se reconstruye la
/// anotación en el visor.
class Highlight {
  const Highlight({
    required this.id,
    required this.documentId,
    required this.page,
    required this.rects,
    required this.colorValue,
    required this.text,
    required this.createdAt,
  });

  final int id;
  final int documentId;
  final int page; // 1-based
  final List<Rect> rects;
  final int colorValue;
  final String text;
  final DateTime createdAt;

  Color get color => Color(colorValue);

  static String encodeRects(List<Rect> rects) => jsonEncode([
        for (final r in rects) [r.left, r.top, r.width, r.height],
      ]);

  static List<Rect> decodeRects(String encoded) {
    final raw = jsonDecode(encoded) as List<dynamic>;
    return [
      for (final e in raw)
        Rect.fromLTWH(
          (e[0] as num).toDouble(),
          (e[1] as num).toDouble(),
          (e[2] as num).toDouble(),
          (e[3] as num).toDouble(),
        ),
    ];
  }

  factory Highlight.fromRow(Map<String, Object?> row) => Highlight(
        id: row['id'] as int,
        documentId: row['document_id'] as int,
        page: row['page'] as int,
        rects: decodeRects(row['rects'] as String),
        colorValue: row['color'] as int,
        text: row['text'] as String,
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(row['created_at'] as int),
      );
}
