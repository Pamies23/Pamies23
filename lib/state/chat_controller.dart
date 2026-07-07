import 'dart:async';

import 'package:flutter/foundation.dart';

import '../data/models/chat.dart';
import '../data/models/document.dart';
import '../data/repositories/chat_repository.dart';
import '../data/settings/settings_controller.dart';
import '../services/ai/ai_catalog.dart';
import '../services/ai/ai_provider.dart';
import '../services/ai/anthropic_provider.dart';
import '../services/ai/openai_provider.dart';
import '../services/pdf/pdf_text_service.dart';

/// Fragmento del PDF seleccionado al lanzar una pregunta.
class SelectionContext {
  const SelectionContext({required this.text, required this.page});

  final String text;
  final int page;
}

/// Estado del panel de chat de un documento: sesiones, mensajes y streaming.
class ChatController extends ChangeNotifier {
  ChatController({
    required ChatRepository chatRepo,
    required SettingsController settings,
    required this.document,
    required this.pdfText,
  })  : _chatRepo = chatRepo,
        _settings = settings;

  final ChatRepository _chatRepo;
  final SettingsController _settings;
  final Doc document;
  final PdfTextService pdfText;

  List<ChatSession> sessions = [];
  ChatSession? active;
  List<ChatMessage> messages = [];

  bool isStreaming = false;
  String streamingText = '';
  String? error;

  /// Si está activo, la próxima pregunta adjunta el texto completo del PDF.
  bool attachFullDocumentOnce = false;

  /// Selección hecha en el PDF pendiente de usarse en la próxima pregunta
  /// (flujo «Preguntar a la IA» del menú de selección).
  SelectionContext? pendingSelection;

  AiStream? _stream;
  StreamSubscription<AiEvent>? _subscription;
  bool _disposed = false;

  Future<void> init({int? initialChatId}) async {
    sessions = await _chatRepo.chatsForDocument(document.id);
    if (initialChatId != null) {
      final match = sessions.where((s) => s.id == initialChatId);
      if (match.isNotEmpty) {
        await selectSession(match.first);
        return;
      }
    }
    if (sessions.isNotEmpty) {
      await selectSession(sessions.first);
    } else {
      _safeNotify();
    }
  }

  Future<void> selectSession(ChatSession session) async {
    if (isStreaming) stop();
    active = session;
    messages = await _chatRepo.messages(session.id);
    error = null;
    _safeNotify();
  }

  /// Deja el panel en estado "chat nuevo"; la sesión se crea con la primera
  /// pregunta.
  void newChat() {
    if (isStreaming) stop();
    active = null;
    messages = [];
    error = null;
    attachFullDocumentOnce = false;
    _safeNotify();
  }

  Future<void> deleteChat(ChatSession session) async {
    await _chatRepo.deleteChat(session.id);
    sessions = await _chatRepo.chatsForDocument(document.id);
    if (active?.id == session.id) {
      active = null;
      messages = [];
    }
    _safeNotify();
  }

  Future<void> renameActiveChat(String title) async {
    final chat = active;
    if (chat == null || title.trim().isEmpty) return;
    await _chatRepo.renameChat(chat.id, title.trim());
    sessions = await _chatRepo.chatsForDocument(document.id);
    active = sessions.firstWhere((s) => s.id == chat.id, orElse: () => chat);
    _safeNotify();
  }

  void toggleAttachFullDocument() {
    attachFullDocumentOnce = !attachFullDocumentOnce;
    _safeNotify();
  }

  void setPendingSelection(SelectionContext? selection) {
    pendingSelection = selection;
    _safeNotify();
  }

  void clearError() {
    error = null;
    _safeNotify();
  }

  Future<void> toggleStar(ChatMessage message) async {
    final newValue = !message.starred;
    await _chatRepo.setStarred(message.id, newValue);
    final index = messages.indexWhere((m) => m.id == message.id);
    if (index != -1) {
      messages[index] = messages[index].copyWith(starred: newValue);
      _safeNotify();
    }
  }

  /// Envía una pregunta. [selection] llega desde "Preguntar a la IA" sobre
  /// texto seleccionado; [currentPage] es la página visible en el visor.
  Future<void> send(
    String text, {
    SelectionContext? selection,
    required int currentPage,
  }) async {
    final question = text.trim();
    if (question.isEmpty || isStreaming) return;

    final effectiveSelection = selection ?? pendingSelection;
    pendingSelection = null;

    final provider = _settings.provider;
    final apiKey = _settings.apiKeyFor(provider);
    if (apiKey == null || apiKey.isEmpty) {
      error =
          'Falta la API key de ${provider.label}. Añádela en Ajustes (Ctrl+,).';
      _safeNotify();
      return;
    }

    // Historial previo (sin el mensaje que estamos a punto de añadir).
    final history = List<ChatMessage>.of(messages);

    // Crea la sesión de forma perezosa con la primera pregunta.
    active ??= await _chatRepo.createChat(
      documentId: document.id,
      provider: provider.key,
      model: _settings.activeModel,
      title: _titleFrom(question),
    );
    final chat = active!;

    final userMessage = await _chatRepo.addMessage(
      chatId: chat.id,
      role: 'user',
      content: question,
      selection: effectiveSelection?.text,
      page: effectiveSelection?.page ?? currentPage,
    );
    messages.add(userMessage);

    final includeFullDoc = attachFullDocumentOnce;
    attachFullDocumentOnce = false;

    isStreaming = true;
    streamingText = '';
    error = null;
    _safeNotify();

    final request = _buildRequest(
      question: question,
      history: history,
      selection: effectiveSelection,
      currentPage: currentPage,
      includeFullDoc: includeFullDoc,
    );

    final AiClient client = switch (provider) {
      AiProviderId.anthropic => AnthropicClient(),
      AiProviderId.openai => OpenAiClient(),
    };

    final buffer = StringBuffer();
    var failed = false;
    _stream = client.send(request, apiKey: apiKey);
    _subscription = _stream!.events.listen(
      (event) {
        if (event is AiTextDelta) {
          buffer.write(event.text);
          streamingText = buffer.toString();
          _safeNotify();
        }
      },
      onError: (Object e) {
        failed = true;
        _finishSend(chat, provider, buffer.toString(), errorText: '$e');
      },
      onDone: () {
        if (!failed) _finishSend(chat, provider, buffer.toString());
      },
    );
  }

  Future<void> _finishSend(
    ChatSession chat,
    AiProviderId provider,
    String content, {
    String? errorText,
  }) async {
    if (_disposed) return;
    if (content.isNotEmpty) {
      final message = await _chatRepo.addMessage(
        chatId: chat.id,
        role: 'assistant',
        content: content,
      );
      messages.add(message);
    }
    await _chatRepo.touchChat(
      chat.id,
      provider: provider.key,
      model: _settings.activeModel,
    );
    sessions = await _chatRepo.chatsForDocument(document.id);
    if (active != null) {
      active = sessions.firstWhere((s) => s.id == active!.id,
          orElse: () => active!);
    }
    isStreaming = false;
    streamingText = '';
    error = errorText;
    _stream = null;
    _subscription = null;
    _safeNotify();
  }

  /// Detiene el streaming; el texto recibido hasta el momento se conserva.
  void stop() {
    _stream?.cancel();
  }

  AiRequest _buildRequest({
    required String question,
    required List<ChatMessage> history,
    required SelectionContext? selection,
    required int currentPage,
    required bool includeFullDoc,
  }) {
    final turns = <AiTurn>[];
    for (final m in history) {
      if (m.isUser) {
        var content = m.content;
        final sel = m.selection;
        if (sel != null && sel.isNotEmpty) {
          content =
              '[Sobre una selección de la página ${m.page ?? '?'}: «${_truncate(sel, 220)}»]\n$content';
        }
        turns.add(AiTurn.user(content));
      } else {
        turns.add(AiTurn.assistant(m.content));
      }
    }

    final parts = <String>[];
    if (includeFullDoc) {
      final (text, truncated) = pdfText.fullText();
      if (text.isNotEmpty) {
        parts.add('Texto completo del documento'
            '${truncated ? ' (truncado por longitud)' : ''}:\n"""\n$text\n"""');
      }
    }
    if (selection != null) {
      if (_settings.includePageContext && !includeFullDoc) {
        final page = pdfText.pageText(selection.page);
        if (page.isNotEmpty) {
          parts.add(
              'Texto completo de la página ${selection.page}:\n"""\n$page\n"""');
        }
      }
      parts.add(
          'Fragmento seleccionado por el usuario en la página ${selection.page}:\n"""\n${selection.text}\n"""');
    } else if (_settings.includePageContext && !includeFullDoc) {
      final page = pdfText.pageText(currentPage);
      if (page.isNotEmpty) {
        parts.add(
            'El usuario está viendo la página $currentPage. Texto de esa página:\n"""\n$page\n"""');
      }
    }

    final content = parts.isEmpty
        ? question
        : '${parts.join('\n\n')}\n\nPregunta del usuario:\n$question';
    turns.add(AiTurn.user(content));

    return AiRequest(
      model: _settings.activeModel,
      system: _systemPrompt(),
      turns: turns,
      maxTokens: _settings.maxTokens,
    );
  }

  String _systemPrompt() {
    final pages =
        pdfText.pageCount > 0 ? ' (${pdfText.pageCount} páginas)' : '';
    final base = 'Eres el asistente de lectura integrado en Folio, un lector de PDF. '
        'El usuario está leyendo el documento «${document.title}»$pages. '
        'Responde siempre en el idioma en el que escribe el usuario. '
        'Sé claro y directo. Cuando uses información del contexto del documento, '
        'menciona la página de la que procede. Si el contexto proporcionado no '
        'basta para responder con seguridad, dilo explícitamente en lugar de inventar. '
        'Usa Markdown con moderación (listas y negritas cuando aporten claridad).';
    final preset = _settings.activePreset;
    if (preset == null || preset.instructions.trim().isEmpty) return base;
    return '$base\n\nEstilo de respuesta preferido por el usuario ("${preset.name}"): '
        '${preset.instructions.trim()}';
  }

  static String _titleFrom(String question) {
    final clean = question.replaceAll(RegExp(r'\s+'), ' ').trim();
    return clean.length <= 48 ? clean : '${clean.substring(0, 47)}…';
  }

  static String _truncate(String text, int max) {
    final clean = text.replaceAll(RegExp(r'\s+'), ' ').trim();
    return clean.length <= max ? clean : '${clean.substring(0, max - 1)}…';
  }

  void _safeNotify() {
    if (!_disposed) notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    _subscription?.cancel();
    _stream?.cancel();
    super.dispose();
  }
}
