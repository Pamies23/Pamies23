import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';

import '../data/models/document.dart';
import '../data/models/folder.dart';
import '../data/repositories/document_repository.dart';
import '../data/repositories/folder_repository.dart';

/// Carpeta especial: ver todos los documentos, sin filtrar.
const int kAllDocsFolder = 0;

/// Carpeta especial: solo documentos sin carpeta asignada.
const int kNoFolder = -1;

class LibraryController extends ChangeNotifier {
  LibraryController(this._docs, this._folders);

  final DocumentRepository _docs;
  final FolderRepository _folders;

  List<Doc> recent = [];
  List<Folder> folders = [];
  bool loaded = false;

  /// kAllDocsFolder, kNoFolder, o el id de una carpeta.
  int selectedFolder = kAllDocsFolder;

  Future<void> refresh() async {
    folders = await _folders.all();
    recent = await _docs.recent(
      folderId: selectedFolder == kAllDocsFolder ? null : selectedFolder,
    );
    loaded = true;
    notifyListeners();
  }

  Future<void> selectFolder(int folderId) async {
    selectedFolder = folderId;
    await refresh();
  }

  Future<Folder> createFolder(String name) async {
    final folder = await _folders.create(name);
    await refresh();
    return folder;
  }

  Future<void> renameFolder(int id, String name) async {
    await _folders.rename(id, name);
    await refresh();
  }

  Future<void> deleteFolder(int id) async {
    await _folders.remove(id);
    if (selectedFolder == id) selectedFolder = kAllDocsFolder;
    await refresh();
  }

  Future<void> moveToFolder(Doc doc, int? folderId) async {
    await _docs.setFolder(doc.id, folderId);
    await refresh();
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
