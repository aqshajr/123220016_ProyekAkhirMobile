import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../model/artifact_model.dart';

class ArtifactDetailPage extends StatelessWidget {
  final Artifact artifact;

  const ArtifactDetailPage({super.key, required this.artifact});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(artifact.title, style: GoogleFonts.poppins()),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (artifact.imageUrl != null && artifact.imageUrl!.isNotEmpty)
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.network(
                  artifact.imageUrl!,
                  width: double.infinity,
                  height: 200,
                  fit: BoxFit.cover,
                ),
              ),
            const SizedBox(height: 16),
            Text(
              artifact.title,
              style: GoogleFonts.poppins(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Candi: ${artifact.templeTitle}',
              style: GoogleFonts.poppins(fontSize: 16, fontStyle: FontStyle.italic),
            ),
            const SizedBox(height: 16),
            Text(
              artifact.description,
              style: GoogleFonts.poppins(fontSize: 16),
              textAlign: TextAlign.justify,
            ),
            const SizedBox(height: 24),

            if (artifact.detailPeriod != null) _buildDetailItem("Periode", artifact.detailPeriod!),
            if (artifact.detailMaterial != null) _buildDetailItem("Material", artifact.detailMaterial!),
            if (artifact.detailSize != null) _buildDetailItem("Ukuran", artifact.detailSize!),
            if (artifact.detailStyle != null) _buildDetailItem("Gaya", artifact.detailStyle!),

            const SizedBox(height: 24),
            if (artifact.funfactTitle != null || artifact.funfactDescription != null)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Fun Fact:", style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  if (artifact.funfactTitle != null)
                    Text(
                      artifact.funfactTitle!,
                      style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                  if (artifact.funfactDescription != null)
                    Text(
                      artifact.funfactDescription!,
                      style: GoogleFonts.poppins(fontSize: 16),
                      textAlign: TextAlign.justify,
                    ),
                ],
              ),

            const SizedBox(height: 32),
            if (artifact.locationUrl != null && artifact.locationUrl!.isNotEmpty)
              ElevatedButton.icon(
                onPressed: () => _launchURL(context, artifact.locationUrl!),
                icon: const Icon(Icons.map),
                label: const Text("Lihat Lokasi di Peta"),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailItem(String title, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("$title: ", style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          Expanded(child: Text(value, style: GoogleFonts.poppins())),
        ],
      ),
    );
  }

  void _launchURL(BuildContext context, String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal membuka link lokasi')),
      );
    }
  }
}
