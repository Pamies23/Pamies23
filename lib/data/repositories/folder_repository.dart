import '../db/app_database.dart';
import '../models/folder.dart';

class FolderRepository {
  FolderRepository(this._db);

  final AppDatabase _db;

  Future<List<Folder>> all() async {
    final rows = await _db.db.query('folders', orderBy: 'name COLLATE NOCASE');
    return rows.map(Folder.fromRow).toList();
  }

  Future<Folder> create(String name) async {
    final now = DateTime.now().millisecondsSinceEpoch;
    final id = await _db.db.insert('folders', {
      'name': name,
      'created_at': now,
    });
    return Folder(id: id, name: name, createdAt: DateTime.fromMillisecondsSinceEpoch(now));
  }

  Future<void> rename(int id, String name) async {
    await _db.db.update('folders', {'name': name}, where: 'id = ?', whereArgs: [id]);
  }

  /// Elimina la carpeta; los documentos que estaban en ella quedan sin
  /// carpeta (ON DELETE SET NULL), no se borran.
  Future<void> remove(int id) async {
    await _db.db.delete('folders', where: 'id = ?', whereArgs: [id]);
  }
}
