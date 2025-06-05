import 'package:hive/hive.dart';
import '../model/visit_note_model.dart';
import 'auth_service.dart'; // Untuk mendapatkan User ID

class VisitNoteService {
  static const String _boxName = 'visitNotesBox';

  // Membuka box Hive
  static Future<Box<VisitNote>> _openBox() async {
    return await Hive.openBox<VisitNote>(_boxName);
  }

  // Mendapatkan semua catatan untuk user yang sedang login
  static Future<List<VisitNote>> getAllNotes() async {
    final box = await _openBox();
    final currentUserId = await AuthService().getUserId();
    if (currentUserId == null) {
      return []; // Atau throw exception jika user harus login
    }
    // Filter catatan berdasarkan userID
    return box.values.where((note) => note.userID == currentUserId).toList();
  }

  // Menambah catatan baru
  static Future<void> addNote({
    required String namaCandi,
    required DateTime tanggalKunjungan,
    required String kesanPesan,
  }) async {
    final box = await _openBox();
    final currentUserId = await AuthService().getUserId();
    if (currentUserId == null) {
      throw Exception("User tidak terautentikasi.");
    }

    final newNote = VisitNote(
      id: DateTime.now().millisecondsSinceEpoch.toString(), // ID unik
      namaCandi: namaCandi,
      tanggalKunjungan: tanggalKunjungan,
      kesanPesan: kesanPesan,
      userID: currentUserId,
    );

    await box.put(newNote.id, newNote);
  }

  // Memperbarui catatan yang ada
  static Future<void> updateNote(VisitNote note) async {
    final box = await _openBox();
    // Cukup simpan kembali objek dengan key yang sama
    await box.put(note.id, note);
  }

  // Menghapus catatan
  static Future<void> deleteNote(String id) async {
    final box = await _openBox();
    await box.delete(id);
  }
}
