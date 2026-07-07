import '../db/app_database.dart';
import '../models/chat.dart';

class ChatRepository {
  ChatRepository(this._db);

  final AppDatabase _db;

  Future<List<ChatSession>> chatsForDocument(int documentId) async {
    final rows = await _db.db.query(
      'chats',
      where: 'document_id = ?',
      whereArgs: [documentId],
      orderBy: 'updated_at DESC',
    );
    return rows.map(ChatSession.fromRow).toList();
  }

  /// Historial global: todos los chats con el título de su documento.
  Future<List<ChatWithDocument>> allChats() async {
    final rows = await _db.db.rawQuery('''
      SELECT c.*, d.title AS doc_title, d.path AS doc_path
      FROM chats c
      LEFT JOIN documents d ON d.id = c.document_id
      ORDER BY c.updated_at DESC
    ''');
    return [
      for (final row in rows)
        ChatWithDocument(
          chat: ChatSession.fromRow(row),
          documentTitle: row['doc_title'] as String?,
          documentPath: row['doc_path'] as String?,
        ),
    ];
  }

  Future<ChatSession> createChat({
    required int? documentId,
    required String provider,
    required String model,
    String title = 'Nuevo chat',
  }) async {
    final now = DateTime.now().millisecondsSinceEpoch;
    final id = await _db.db.insert('chats', {
      'document_id': documentId,
      'title': title,
      'provider': provider,
      'model': model,
      'created_at': now,
      'updated_at': now,
    });
    return ChatSession(
      id: id,
      documentId: documentId,
      title: title,
      provider: provider,
      model: model,
      createdAt: DateTime.fromMillisecondsSinceEpoch(now),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(now),
    );
  }

  Future<void> renameChat(int chatId, String title) async {
    await _db.db.update('chats', {'title': title},
        where: 'id = ?', whereArgs: [chatId]);
  }

  Future<void> touchChat(int chatId, {String? provider, String? model}) async {
    final values = <String, Object?>{
      'updated_at': DateTime.now().millisecondsSinceEpoch,
    };
    if (provider != null) values['provider'] = provider;
    if (model != null) values['model'] = model;
    await _db.db
        .update('chats', values, where: 'id = ?', whereArgs: [chatId]);
  }

  Future<void> deleteChat(int chatId) async {
    await _db.db.delete('chats', where: 'id = ?', whereArgs: [chatId]);
  }

  Future<List<ChatMessage>> messages(int chatId) async {
    final rows = await _db.db.query(
      'messages',
      where: 'chat_id = ?',
      whereArgs: [chatId],
      orderBy: 'created_at ASC, id ASC',
    );
    return rows.map(ChatMessage.fromRow).toList();
  }

  Future<ChatMessage> addMessage({
    required int chatId,
    required String role,
    required String content,
    String? selection,
    int? page,
  }) async {
    final now = DateTime.now().millisecondsSinceEpoch;
    final id = await _db.db.insert('messages', {
      'chat_id': chatId,
      'role': role,
      'content': content,
      'created_at': now,
      'selection': selection,
      'page': page,
    });
    return ChatMessage(
      id: id,
      chatId: chatId,
      role: role,
      content: content,
      createdAt: DateTime.fromMillisecondsSinceEpoch(now),
      selection: selection,
      page: page,
    );
  }

  Future<void> updateMessageContent(int messageId, String content) async {
    await _db.db.update('messages', {'content': content},
        where: 'id = ?', whereArgs: [messageId]);
  }

  Future<void> deleteMessage(int messageId) async {
    await _db.db.delete('messages', where: 'id = ?', whereArgs: [messageId]);
  }

  Future<void> setStarred(int messageId, bool starred) async {
    await _db.db.update(
      'messages',
      {'starred': starred ? 1 : 0},
      where: 'id = ?',
      whereArgs: [messageId],
    );
  }

  /// Todas las respuestas de la IA marcadas con estrella, con la pregunta
  /// que las originó y el documento/chat al que pertenecen.
  Future<List<StarredAnswer>> starredAnswers() async {
    final rows = await _db.db.rawQuery('''
      SELECT m.*,
             c.title AS chat_title,
             c.document_id AS document_id,
             d.title AS doc_title,
             (SELECT content FROM messages um
              WHERE um.chat_id = m.chat_id AND um.role = 'user' AND um.id < m.id
              ORDER BY um.id DESC LIMIT 1) AS question
      FROM messages m
      JOIN chats c ON c.id = m.chat_id
      LEFT JOIN documents d ON d.id = c.document_id
      WHERE m.starred = 1 AND m.role = 'assistant'
      ORDER BY m.created_at DESC
    ''');
    return [
      for (final row in rows)
        StarredAnswer(
          message: ChatMessage.fromRow(row),
          question: row['question'] as String?,
          chatId: row['chat_id'] as int,
          chatTitle: row['chat_title'] as String,
          documentId: row['document_id'] as int?,
          documentTitle: row['doc_title'] as String?,
        ),
    ];
  }
}
