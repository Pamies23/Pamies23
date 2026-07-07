import 'dart:ui';

import '../db/app_database.dart';
import '../models/highlight.dart';

class HighlightRepository {
  HighlightRepository(this._db);

  final AppDatabase _db;

  Future<List<Highlight>> forDocument(int documentId) async {
    final rows = await _db.db.query(
      'highlights',
      where: 'document_id = ?',
      whereArgs: [documentId],
      orderBy: 'page ASC, created_at ASC',
    );
    return rows.map(Highlight.fromRow).toList();
  }

  Future<Highlight> add({
    required int documentId,
    required int page,
    required List<Rect> rects,
    required int colorValue,
    required String text,
  }) async {
    final now = DateTime.now().millisecondsSinceEpoch;
    final id = await _db.db.insert('highlights', {
      'document_id': documentId,
      'page': page,
      'rects': Highlight.encodeRects(rects),
      'color': colorValue,
      'text': text,
      'created_at': now,
    });
    return Highlight(
      id: id,
      documentId: documentId,
      page: page,
      rects: rects,
      colorValue: colorValue,
      text: text,
      createdAt: DateTime.fromMillisecondsSinceEpoch(now),
    );
  }

  Future<void> remove(int id) async {
    await _db.db.delete('highlights', where: 'id = ?', whereArgs: [id]);
  }
}
