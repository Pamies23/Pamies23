import 'package:syncfusion_flutter_pdf/pdf.dart';

/// Extrae texto del PDF abierto para dárselo como contexto a la IA.
/// El visor entrega su [PdfDocument] en `onDocumentLoaded`; aquí se cachea
/// el texto por página para no re-extraer en cada pregunta.
class PdfTextService {
  PdfDocument? _document;
  final Map<int, String> _pageCache = {};
  String? _fullTextCache;

  /// Máximo de caracteres al adjuntar el documento completo (~50k tokens).
  static const int fullTextMaxChars = 200000;

  void attach(PdfDocument document) {
    _document = document;
    _pageCache.clear();
    _fullTextCache = null;
  }

  void detach() {
    _document = null;
    _pageCache.clear();
    _fullTextCache = null;
  }

  bool get isReady => _document != null;

  int get pageCount => _document?.pages.count ?? 0;

  /// Texto de una página (1-based). Devuelve '' si no hay documento o la
  /// página no tiene capa de texto (PDF escaneado sin OCR).
  String pageText(int page) {
    final doc = _document;
    if (doc == null || page < 1 || page > doc.pages.count) return '';
    return _pageCache[page] ??= _extract(page - 1, page - 1);
  }

  /// Texto completo del documento, truncado a [fullTextMaxChars].
  /// Devuelve también si hubo truncado.
  (String, bool) fullText() {
    final doc = _document;
    if (doc == null) return ('', false);
    _fullTextCache ??= _extract(0, doc.pages.count - 1);
    final text = _fullTextCache!;
    if (text.length <= fullTextMaxChars) return (text, false);
    return (text.substring(0, fullTextMaxChars), true);
  }

  String _extract(int startIndex, int endIndex) {
    final doc = _document;
    if (doc == null) return '';
    try {
      return PdfTextExtractor(doc)
          .extractText(startPageIndex: startIndex, endPageIndex: endIndex)
          .trim();
    } catch (_) {
      return '';
    }
  }
}
