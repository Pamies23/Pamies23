/// Una carpeta para organizar documentos en la biblioteca.
class Folder {
  const Folder({required this.id, required this.name, required this.createdAt});

  final int id;
  final String name;
  final DateTime createdAt;

  factory Folder.fromRow(Map<String, Object?> row) => Folder(
        id: row['id'] as int,
        name: row['name'] as String,
        createdAt: DateTime.fromMillisecondsSinceEpoch(row['created_at'] as int),
      );
}
