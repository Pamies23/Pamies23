import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';

import '../data/models/document.dart';
import '../data/repositories/document_repository.dart';

class LibraryController extends ChangeNotifier {
  LibraryController(this._docs);

  final DocumentRepository _docs;

  List<Doc> recent = [];
  bool loaded = false;

  Future<void> refresh() async {
    recent = await _docs.recent();
    loaded = true;
    notifyListeners();
  }

  /// Abre el diálogo de sistema para elegir un PDF. Devuelve el documento
  /// registrado, o null si el usuario canceló.
  Future<Doc?> pickPdf() async {
    final result = await FilePicker.platform.pickFiles(
      dialogTitle: 'Abrir PDF',
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );
    final path = result?.files.single.path;
    if (path == null) return null;
    return openPath(path);
  }

  Future<Doc> openPath(String path) async {
    final doc = await _docs.upsertByPath(path);
    await refresh();
    return doc;
  }

  Future<void> remove(Doc doc) async {
    await _docs.remove(doc.id);
    await refresh();
  }

  Future<void> saveProgress(int id, {int? lastPage, int? pageCount}) =>
      _docs.saveProgress(id, lastPage: lastPage, pageCount: pageCount);
}
