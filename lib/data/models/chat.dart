/// Una conversación con la IA, ligada (normalmente) a un documento.
class ChatSession {
  const ChatSession({
    required this.id,
    required this.documentId,
    required this.title,
    required this.provider,
    required this.model,
    required this.createdAt,
    required this.updatedAt,
  });

  final int id;
  final int? documentId;
  final String title;
  final String provider; // 'anthropic' | 'openai'
  final String model;
  final DateTime createdAt;
  final DateTime updatedAt;

  factory ChatSession.fromRow(Map<String, Object?> row) => ChatSession(
        id: row['id'] as int,
        documentId: row['document_id'] as int?,
        title: row['title'] as String,
        provider: row['provider'] as String,
        model: row['model'] as String,
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(row['created_at'] as int),
        updatedAt:
            DateTime.fromMillisecondsSinceEpoch(row['updated_at'] as int),
      );
}

/// Un mensaje dentro de una conversación.
class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.chatId,
    required this.role,
    required this.content,
    required this.createdAt,
    this.selection,
    this.page,
  });

  final int id;
  final int chatId;
  final String role; // 'user' | 'assistant'
  final String content;
  final DateTime createdAt;

  /// Fragmento del PDF seleccionado al hacer la pregunta (si lo hubo).
  final String? selection;

  /// Página del documento asociada a la pregunta (si la hubo).
  final int? page;

  bool get isUser => role == 'user';

  factory ChatMessage.fromRow(Map<String, Object?> row) => ChatMessage(
        id: row['id'] as int,
        chatId: row['chat_id'] as int,
        role: row['role'] as String,
        content: row['content'] as String,
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(row['created_at'] as int),
        selection: row['selection'] as String?,
        page: row['page'] as int?,
      );
}

/// Resultado del historial global: chat + título del documento al que pertenece.
class ChatWithDocument {
  const ChatWithDocument({required this.chat, this.documentTitle, this.documentPath});

  final ChatSession chat;
  final String? documentTitle;
  final String? documentPath;
}
