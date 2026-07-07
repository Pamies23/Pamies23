/// Un PDF conocido por la app (aparece en "Recientes").
class Doc {
  const Doc({
    required this.id,
    required this.path,
    required this.title,
    required this.addedAt,
    required this.lastOpenedAt,
    this.lastPage = 1,
    this.pageCount,
    this.folderId,
  });

  final int id;
  final String path;
  final String title;
  final DateTime addedAt;
  final DateTime lastOpenedAt;
  final int lastPage;
  final int? pageCount;
  final int? folderId;

  Doc copyWith({
    int? lastPage,
    int? pageCount,
    DateTime? lastOpenedAt,
    int? folderId,
    bool clearFolder = false,
  }) =>
      Doc(
        id: id,
        path: path,
        title: title,
        addedAt: addedAt,
        lastOpenedAt: lastOpenedAt ?? this.lastOpenedAt,
        lastPage: lastPage ?? this.lastPage,
        pageCount: pageCount ?? this.pageCount,
        folderId: clearFolder ? null : (folderId ?? this.folderId),
      );

  factory Doc.fromRow(Map<String, Object?> row) => Doc(
        id: row['id'] as int,
        path: row['path'] as String,
        title: row['title'] as String,
        addedAt: DateTime.fromMillisecondsSinceEpoch(row['added_at'] as int),
        lastOpenedAt:
            DateTime.fromMillisecondsSinceEpoch(row['last_opened_at'] as int),
        lastPage: (row['last_page'] as int?) ?? 1,
        pageCount: row['page_count'] as int?,
        folderId: row['folder_id'] as int?,
      );

  Map<String, Object?> toRow() => {
        'path': path,
        'title': title,
        'added_at': addedAt.millisecondsSinceEpoch,
        'last_opened_at': lastOpenedAt.millisecondsSinceEpoch,
        'last_page': lastPage,
        'page_count': pageCount,
        'folder_id': folderId,
      };
}
