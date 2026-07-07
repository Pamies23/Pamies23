/// Formateo de fechas relativo, en español y sin dependencias.
String relativeDate(DateTime date) {
  final now = DateTime.now();
  final today = DateTime(now.year, now.month, now.day);
  final day = DateTime(date.year, date.month, date.day);
  final diff = today.difference(day).inDays;

  String hhmm() =>
      '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';

  if (diff <= 0) return 'Hoy, ${hhmm()}';
  if (diff == 1) return 'Ayer, ${hhmm()}';
  if (diff < 7) return 'Hace $diff días';

  const months = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
  ];
  final month = months[date.month - 1];
  if (date.year == now.year) return '${date.day} $month';
  return '${date.day} $month ${date.year}';
}
