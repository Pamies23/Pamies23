import 'dart:io';

import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

/// SQLite local de la app. En Windows usa el backend FFI; en iOS el nativo.
class AppDatabase {
  AppDatabase._(this.db);

  final Database db;

  static Future<AppDatabase> open() async {
    if (Platform.isWindows || Platform.isLinux) {
      sqfliteFfiInit();
      databaseFactory = databaseFactoryFfi;
    }
    final dir = await getApplicationSupportDirectory();
    await dir.create(recursive: true);
    final database = await openDatabase(
      p.join(dir.path, 'folio.db'),
      version: 1,
      onConfigure: (db) async {
        await db.execute('PRAGMA foreign_keys = ON');
      },
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at INTEGER NOT NULL
          )
        ''');
        await db.execute('''
          CREATE TABLE documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            added_at INTEGER NOT NULL,
            last_opened_at INTEGER NOT NULL,
            last_page INTEGER NOT NULL DEFAULT 1,
            page_count INTEGER,
            folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL
          )
        ''');
        await db.execute('''
          CREATE TABLE chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            provider TEXT NOT NULL,
            model TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
          )
        ''');
        await db.execute('''
          CREATE TABLE messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            selection TEXT,
            page INTEGER,
            starred INTEGER NOT NULL DEFAULT 0
          )
        ''');
        await db.execute('''
          CREATE TABLE highlights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
            page INTEGER NOT NULL,
            rects TEXT NOT NULL,
            color INTEGER NOT NULL,
            text TEXT NOT NULL,
            created_at INTEGER NOT NULL
          )
        ''');
        await db.execute(
            'CREATE INDEX idx_chats_document ON chats(document_id, updated_at DESC)');
        await db.execute(
            'CREATE INDEX idx_messages_chat ON messages(chat_id, created_at)');
        await db.execute(
            'CREATE INDEX idx_highlights_document ON highlights(document_id, page)');
        await db.execute(
            'CREATE INDEX idx_documents_folder ON documents(folder_id)');
        await db.execute(
            'CREATE INDEX idx_messages_starred ON messages(starred)');
      },
    );
    return AppDatabase._(database);
  }
}
