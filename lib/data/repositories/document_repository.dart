import 'package:path/path.dart' as p;

import '../db/app_database.dart';
import '../models/document.dart';

class DocumentRepository {
  DocumentRepository(this._db);

  final AppDatabase _db;

  /// [folderId] filtra por carpeta; pásalo como `-1` para "sin carpeta",
  /// o déjalo en null para ver todos los documentos.
  Future<List<Doc>> recent({int limit = 200, int? folderId}) async {
    final rows = await _db.db.query(
      'documents',
      where: folderId == null
          ? null
          : (folderId == -1 ? 'folder_id IS NULL' : 'folder_id = ?'),
      whereArgs: folderId == null || folderId == -1 ? null : [folderId],
      orderBy: 'last_opened_at DESC',
      limit: limit,
    );
    return rows.map(Doc.fromRow).toList();
  }

  Future<void> setFolder(int documentId, int? folderId) async {
    await _db.db.update(
      'documents',
      {'folder_id': folderId},
      where: 'id = ?',
      whereArgs: [documentId],
    );
  }

  /// Registra (o reactiva) un documento y devuelve su fila actual.
  Future<Doc> upsertByPath(String path) async {
    final now = DateTime.now().millisecondsSinceEpoch;
    final existing = await _db.db
        .query('documents', where: 'path = ?', whereArgs: [path], limit: 1);
    if (existing.isNotEmpty) {
      final doc = Doc.fromRow(existing.first);
      await _db.db.update(
        'documents',
        {'last_opened_at': now},
        where: 'id = ?',
        whereArgs: [doc.id],
      );
      return doc.copyWith(
          lastOpenedAt: DateTime.fromMillisecondsSinceEpoch(now));
    }
    final title = p.basenameWithoutExtension(path);
    final id = await _db.db.insert('documents', {
      'path': path,
      'title': title,
      'added_at': now,
      'last_opened_at': now,
      'last_page': 1,
    });
    return Doc(
      id: id,
      path: path,
      title: title,
      addedAt: DateTime.fromMillisecondsSinceEpoch(now),
      lastOpenedAt: DateTime.fromMillisecondsSinceEpoch(now),
    );
  }

  Future<void> saveProgress(int id, {int? lastPage, int? pageCount}) async {
    final values = <String, Object?>{};
    if (lastPage != null) values['last_page'] = lastPage;
    if (pageCount != null) values['page_count'] = pageCount;
    if (values.isEmpty) return;
    await _db.db
        .update('documents', values, where: 'id = ?', whereArgs: [id]);
  }

  /// Quita el documento de recientes (y en cascada sus chats y subrayados).
  Future<void> remove(int id) async {
    await _db.db.delete('documents', where: 'id = ?', whereArgs: [id]);
  }

  Future<Doc?> byId(int id) async {
    final rows = await _db.db
        .query('documents', where: 'id = ?', whereArgs: [id], limit: 1);
    return rows.isEmpty ? null : Doc.fromRow(rows.first);
  }
}
