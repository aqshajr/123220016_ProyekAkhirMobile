import 'package:hive/hive.dart';

part 'visit_note_model.g.dart';

@HiveType(typeId: 0)
class VisitNote extends HiveObject {
  @HiveField(0)
  String id;

  @HiveField(1)
  String namaCandi;

  @HiveField(2)
  DateTime tanggalKunjungan;

  @HiveField(3)
  String kesanPesan;

  @HiveField(4, defaultValue: '')
  late String userID;

  VisitNote({
    required this.id,
    required this.namaCandi,
    required this.tanggalKunjungan,
    required this.kesanPesan,
    String? userID,
  }) {
    this.userID = userID ?? '';
  }

  // Helper method untuk mengkonversi userID
  static String normalizeUserId(dynamic userId) {
    if (userId == null) return '';
    return userId.toString();
  }
}
