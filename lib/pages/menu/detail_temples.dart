import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../model/temple_model.dart';
import 'lbs_map_page.dart';

class TempleDetailPage extends StatelessWidget {
  final Temple temple;

  const TempleDetailPage({super.key, required this.temple});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(temple.title ?? 'Detail Candi')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Gambar Candi
            if (temple.imageUrl != null && temple.imageUrl!.isNotEmpty)
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.network(
                  temple.imageUrl!,
                  fit: BoxFit.cover,
                  width: double.infinity,
                  height: 200,
                ),
              ),

            const SizedBox(height: 16),

            // Nama Candi
            Text(
              temple.title ?? '',
              style: GoogleFonts.playfairDisplay(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 16),

            // Deskripsi Candi
            if (temple.description != null && temple.description!.isNotEmpty)
              Text(
                temple.description!,
                style: GoogleFonts.openSans(fontSize: 16),
                textAlign: TextAlign.justify,
              ),

            const SizedBox(height: 24),

            // Fun Fact Title
            if (temple.funfactTitle != null && temple.funfactTitle!.isNotEmpty)
              Text(
                temple.funfactTitle!,
                style: GoogleFonts.playfairDisplay(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),

            const SizedBox(height: 8),

            // Fun Fact Description
            if (temple.funfactDescription != null &&
                temple.funfactDescription!.isNotEmpty)
              Text(
                temple.funfactDescription!,
                style: GoogleFonts.openSans(
                  fontSize: 16,
                  fontStyle: FontStyle.italic,
                ),
              ),

            const SizedBox(height: 24),

            // Tombol Lihat Lokasi (menuju halaman LBS)
            if (temple.locationUrl != null && temple.locationUrl!.isNotEmpty)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.location_on),
                  label: const Text('Lihat Lokasi'),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => LBSMapPage(candi: temple),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xff233743),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
