import 'package:artefacto/pages/tiket/ticket_selected_page.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:artefacto/service/temple_service.dart';
import 'package:artefacto/service/artifact_service.dart';
import 'package:artefacto/model/temple_model.dart';
import 'package:artefacto/model/artifact_model.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'detail_artifact.dart';
import 'detail_temples.dart';

class EksplorasiPage extends StatefulWidget {
  const EksplorasiPage({Key? key, required username}) : super(key: key);

  @override
  State<EksplorasiPage> createState() => _EksplorasiPageState();
}

class _EksplorasiPageState extends State<EksplorasiPage> {
  final Map<String, String> jamBuka = {
    'WIB': '08:00 - 17:00',
    'WITA': '09:00 - 18:00',
    'WIT': '10:00 - 19:00',
  };

  bool isLoading = true;
  bool hasError = false;
  String errorMessage = '';
  List<Temple> temples = [];
  List<Artifact> artifacts = [];
  String? username;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    await _getUsername();
    await _loadData();
  }

  Future<void> _getUsername() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      username = prefs.getString('username') ?? 'Pengguna';
    });
  }

  Future<void> _loadData() async {
    try {
      setState(() {
        isLoading = true;
        hasError = false;
      });

      final results = await Future.wait([
        TempleService.getTemples(),
        ArtifactService.getArtifacts(),
      ]);

      setState(() {
        temples = results[0] as List<Temple>;
        artifacts = results[1] as List<Artifact>;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        hasError = true;
        errorMessage = 'Gagal memuat data: ${e.toString()}';
        isLoading = false;
      });
      debugPrint('Error loading data: $e');
    }
  }

  Future<void> _refreshData() async {
    await _loadData();
  }

  Widget _buildSectionBox({required String title, required Widget content}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: const Color(0xFFFBF8F3),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.merriweather(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: const Color(0xff233743),
            ),
          ),
          const SizedBox(height: 12),
          content,
        ],
      ),
    );
  }

  Widget _buildCard({
    required String title,
    required String? imageUrl,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 160,
        margin: const EdgeInsets.only(right: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
          image: DecorationImage(
            image: NetworkImage(
              imageUrl?.isNotEmpty == true
                  ? imageUrl!
                  : 'https://via.placeholder.com/160x200?text=No+Image',
            ),
            fit: BoxFit.cover,
            colorFilter: ColorFilter.mode(
              Colors.black.withOpacity(0.4),
              BlendMode.darken,
            ),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.playfairDisplay(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              if (subtitle != null) ...[
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: GoogleFonts.openSans(
                    color: Colors.white70,
                    fontSize: 13,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 48, color: Colors.red),
          const SizedBox(height: 16),
          Text(
            errorMessage,
            style: const TextStyle(fontSize: 16),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _refreshData,
            child: const Text('Coba Lagi'),
          ),
        ],
      ),
    );
  }

  Future<void> _launchUrlWithFeedback(String urlString) async {
    final Uri url = Uri.parse(urlString);
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Membuka artikel di browser...")),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Tidak dapat membuka URL")),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Terjadi kesalahan: $e")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading || username == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (hasError) {
      return Scaffold(body: _buildErrorWidget());
    }

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _refreshData,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 16, bottom: 24),
                child: Text(
                  "Halo, $username!",
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xff233743),
                    shadows: [
                      Shadow(
                        offset: const Offset(1.5, 1.5),
                        blurRadius: 4,
                        color: Colors.black.withOpacity(0.3),
                      ),
                    ],
                  ),
                ),
              ),
              _buildSectionBox(
                title: "Pelayanan Tiket",
                content: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Jam operasional pelayanan tiket:",
                      style: GoogleFonts.openSans(fontSize: 15, color: Colors.black87),
                    ),
                    const SizedBox(height: 8),
                    ...jamBuka.entries.map((entry) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 2.0),
                        child: Text(
                          "${entry.key}: ${entry.value}",
                          style: GoogleFonts.openSans(fontSize: 15, color: Colors.black87),
                        ),
                      );
                    }).toList(),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => TicketSelectionPage()),
                        );
                      },
                      icon: const Icon(Icons.confirmation_num),
                      label: const Text("Beli Tiket"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xff233743),
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
              if (temples.isNotEmpty)
                _buildSectionBox(
                  title: "Jelajahi Candi Populer",
                  content: SizedBox(
                    height: 200,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: temples.length,
                      itemBuilder: (context, index) {
                        final temple = temples[index];
                        return _buildCard(
                          title: temple.title ?? 'Tanpa Judul',
                          imageUrl: temple.imageUrl,
                          subtitle: temple.locationUrl,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => TempleDetailPage(temple: temple),
                              ),
                            );
                          },
                        );
                      },
                    ),
                  ),
                ),
              if (artifacts.isNotEmpty)
                _buildSectionBox(
                  title: "Jelajahi Artefak",
                  content: SizedBox(
                    height: 160,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: artifacts.length,
                      itemBuilder: (context, index) {
                        final artifact = artifacts[index];
                        return _buildCard(
                          title: artifact.title ?? 'Tanpa Judul',
                          imageUrl: artifact.imageUrl,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => ArtifactDetailPage(artifact: artifact),
                              ),
                            );
                          },
                        );
                      },
                    ),
                  ),
                ),
              _buildSectionBox(
                title: "Informasi Penting & Artikel Terbaru",
                content: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Temukan informasi terbaru seputar pemeliharaan candi dan artikel menarik tentang sejarah Artefak Indonesia.",
                      style: GoogleFonts.openSans(fontSize: 15, color: Colors.black87),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      onPressed: () {
                        _launchUrlWithFeedback(
                          'https://artefacts.id/2024/11/11/artefak-indonesia-di-manca-negara-jejak-sejarah-dan-warisan-budaya-dan-pengaruhnya-di-kancah-global/',
                        );
                      },
                      icon: const Icon(Icons.article),
                      label: const Text("Baca Artikel"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xff233743),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
