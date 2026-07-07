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
    this.starred = false,
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

  /// Si la respuesta se ha marcado como destacada.
  final bool starred;

  bool get isUser => role == 'user';

  ChatMessage copyWith({bool? starred}) => ChatMessage(
        id: id,
        chatId: chatId,
        role: role,
        content: content,
        createdAt: createdAt,
        selection: selection,
        page: page,
        starred: starred ?? this.starred,
      );

  factory ChatMessage.fromRow(Map<String, Object?> row) => ChatMessage(
        id: row['id'] as int,
        chatId: row['chat_id'] as int,
        role: row['role'] as String,
        content: row['content'] as String,
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(row['created_at'] as int),
        selection: row['selection'] as String?,
        page: row['page'] as int?,
        starred: (row['starred'] as int? ?? 0) != 0,
      );
}

/// Resultado del historial global: chat + título del documento al que pertenece.
class ChatWithDocument {
  const ChatWithDocument({required this.chat, this.documentTitle, this.documentPath});

  final ChatSession chat;
  final String? documentTitle;
  final String? documentPath;
}

/// Una respuesta destacada (con la pregunta que la originó y el documento).
class StarredAnswer {
  const StarredAnswer({
    required this.message,
    required this.question,
    required this.chatId,
    required this.chatTitle,
    this.documentId,
    this.documentTitle,
  });

  final ChatMessage message; // el mensaje 'assistant' marcado con estrella
  final String? question; // el mensaje 'user' inmediatamente anterior
  final int chatId;
  final String chatTitle;
  final int? documentId;
  final String? documentTitle;
}
