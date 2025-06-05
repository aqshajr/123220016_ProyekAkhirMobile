import 'package:artefacto/model/artifact_model.dart';
import 'package:artefacto/model/temple_model.dart';
import 'package:artefacto/pages/menu/detail_temples.dart';
import 'package:artefacto/service/artifact_service.dart';
import 'package:artefacto/service/temple_service.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// Helper class untuk menyimpan progres
class TempleLearningProgress {
  final int totalArtifacts;
  final int readArtifacts;
  final double progressPercent;

  TempleLearningProgress({
    this.totalArtifacts = 0,
    this.readArtifacts = 0,
    this.progressPercent = 0.0,
  });
}

// Helper class untuk menggabungkan candi dengan progresnya
class TempleCardData {
  final Temple temple;
  final TempleLearningProgress progress;

  TempleCardData({required this.temple, required this.progress});
}

class LearningPage extends StatefulWidget {
  const LearningPage({Key? key}) : super(key: key);

  @override
  State<LearningPage> createState() => _LearningPageState();
}

class _LearningPageState extends State<LearningPage> {
  late Future<List<TempleCardData>> _templeCardDataFuture;

  @override
  void initState() {
    super.initState();
    _templeCardDataFuture = _fetchTempleDataWithProgress();
  }

  // Fungsi baru untuk refresh data
  void _refreshData() {
    setState(() {
      _templeCardDataFuture = _fetchTempleDataWithProgress();
    });
  }

  Future<List<TempleCardData>> _fetchTempleDataWithProgress() async {
    try {
      // Ambil data candi dan artefak secara bersamaan
      final results = await Future.wait([
        TempleService.getTemples(),
        ArtifactService.getArtifacts(), // Menggunakan nama metode yang benar
      ]);

      final List<Temple> temples = results[0] as List<Temple>;
      // Pastikan casting aman, atau tambahkan pengecekan tipe jika perlu
      final List<Artifact> allArtifacts = (results[1] as List<dynamic>)
          .map((e) => e
              as Artifact) // Contoh casting yang lebih aman jika results[1] adalah List<dynamic>
          .toList();

      List<TempleCardData> templeCardDataList = [];

      for (var temple in temples) {
        final templeArtifacts = allArtifacts
            .where((artifact) => artifact.templeID == temple.templeID)
            .toList();
        final readArtifactsCount =
            templeArtifacts.where((artifact) => artifact.isRead).length;
        final totalTempleArtifacts = templeArtifacts.length;
        final progressPercent = totalTempleArtifacts > 0
            ? (readArtifactsCount / totalTempleArtifacts) * 100
            : 0.0;

        templeCardDataList.add(TempleCardData(
          temple: temple,
          progress: TempleLearningProgress(
            totalArtifacts: totalTempleArtifacts,
            readArtifacts: readArtifactsCount,
            progressPercent: progressPercent,
          ),
        ));
      }
      return templeCardDataList;
    } catch (e) {
      debugPrint('Error fetching temple data with progress: $e');
      throw Exception(
          'Gagal memuat data pembelajaran: ${e.toString()}'); // Dilempar agar FutureBuilder bisa menangani
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDFBF5),
      appBar: AppBar(
        title: Text(
          'Mulai Pembelajaran',
          style: GoogleFonts.playfairDisplay(
            fontWeight: FontWeight.bold,
            color: const Color(0xff233743),
          ),
        ),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: Color(0xff233743)),
      ),
      body: FutureBuilder<List<TempleCardData>>(
        future: _templeCardDataFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(color: Color(0xFFB69574)));
          }
          if (snapshot.hasError) {
            return _buildErrorWidget(snapshot.error.toString());
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return _buildEmptyStateWidget();
          }

          final List<TempleCardData> templeDataList = snapshot.data!;
          // double cardHeight = 320; // Tidak lagi diperlukan untuk list vertikal
          // double cardWidth = MediaQuery.of(context).size.width * 0.8; // Tidak lagi diperlukan

          return _buildTempleList(templeDataList);
        },
      ),
    );
  }

  Widget _buildTempleList(List<TempleCardData> templesData) {
    return ListView.builder(
      // Dihilangkan Container dengan fixed height
      scrollDirection: Axis.vertical, // Kembali ke vertikal
      padding: const EdgeInsets.all(16.0), // Padding untuk keseluruhan list
      itemCount: templesData.length,
      itemBuilder: (context, index) {
        final templeCardData = templesData[index];
        final temple = templeCardData.temple;
        final progress = templeCardData.progress;

        return Card(
          // Menghilangkan SizedBox wrapper
          color: Colors.white, // Pastikan warna kartu putih
          elevation: 3.0, // Sedikit shadow agar terlihat di atas latar
          margin: const EdgeInsets.only(bottom: 16.0), // Margin antar kartu
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15.0),
          ),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            borderRadius: BorderRadius.circular(15.0),
            onTap: () {
              // Gunakan .then() untuk memicu refresh saat kembali
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) =>
                      TempleDetailPage(temple: templeCardData.temple),
                ),
              ).then((_) => _refreshData());
            },
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize:
                  MainAxisSize.min, // Agar Column mengambil tinggi seperlunya
              children: [
                _buildTempleImage(temple,
                    180), // Tinggi gambar disesuaikan untuk list vertikal
                Padding(
                  // Padding dipindahkan ke sini agar konten kartu punya ruang
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        temple.title ?? 'Tanpa Judul',
                        style: GoogleFonts.playfairDisplay(
                          fontSize:
                              20, // Ukuran font judul sedikit lebih besar untuk vertikal
                          fontWeight: FontWeight.bold,
                          color: const Color(0xff233743),
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        temple.description != null &&
                                temple.description!.length > 100
                            ? '${temple.description!.substring(0, 100)}...'
                            : temple.description ?? 'Tidak ada deskripsi.',
                        style: GoogleFonts.poppins(
                          fontSize: 13, // Ukuran font deskripsi
                          color: Colors.grey[700],
                          height: 1.4,
                        ),
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 12), // Spasi sebelum progress bar
                      _buildProgressBar(progress, context),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildTempleImage(Temple temple, double height) {
    if (temple.imageUrl != null && temple.imageUrl!.isNotEmpty) {
      return ClipRRect(
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(15.0), // Sudut atas gambar melengkung
          topRight: Radius.circular(15.0),
        ),
        child: Image.network(
          temple.imageUrl!,
          height: height,
          width: double.infinity,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            return Container(
              height: height,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(15.0),
                  topRight: Radius.circular(15.0),
                ),
              ),
              child:
                  Icon(Icons.broken_image, color: Colors.grey[400], size: 40),
            );
          },
        ),
      );
    } else {
      return Container(
        height: height,
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.grey[200],
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(15.0),
            topRight: Radius.circular(15.0),
          ),
        ),
        child: Icon(Icons.account_balance_outlined,
            color: Colors.grey[500], size: 50),
      );
    }
  }

  Widget _buildProgressBar(
      TempleLearningProgress progress, BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Progress Eksplorasi',
              style: GoogleFonts.poppins(
                  fontSize: 11,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w500),
            ),
            Text(
              '${progress.progressPercent.toStringAsFixed(0)}%',
              style: GoogleFonts.poppins(
                  fontSize: 11,
                  color: const Color(0xFFB69574),
                  fontWeight: FontWeight.bold),
            ),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: LinearProgressIndicator(
            value: progress.progressPercent / 100,
            backgroundColor: Colors.grey[300],
            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFB69574)),
            minHeight: 6, // Tinggi bar progress
          ),
        ),
        const SizedBox(height: 2),
        Text(
          '${progress.readArtifacts} dari ${progress.totalArtifacts} artefak dipelajari',
          style: GoogleFonts.poppins(fontSize: 9, color: Colors.grey[600]),
        ),
      ],
    );
  }

  Widget _buildErrorWidget(String errorMsg) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline_rounded,
                size: 60, color: Colors.red.shade400),
            const SizedBox(height: 20),
            Text(
              errorMsg, // Menampilkan pesan error dari snapshot
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(fontSize: 16, color: Colors.grey[700]),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              icon: const Icon(Icons.refresh_rounded, color: Colors.white),
              label: Text('Coba Lagi',
                  style: GoogleFonts.poppins(
                      color: Colors.white, fontWeight: FontWeight.w500)),
              style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xffB69574),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.0))),
              onPressed: _refreshData,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyStateWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.school_outlined, size: 60, color: Colors.grey[400]),
          const SizedBox(height: 20),
          Text(
            'Belum ada data pembelajaran candi.',
            style: GoogleFonts.poppins(fontSize: 16, color: Colors.grey[700]),
          ),
        ],
      ),
    );
  }
}
