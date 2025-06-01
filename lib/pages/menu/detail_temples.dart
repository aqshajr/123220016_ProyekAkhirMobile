import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../model/temple_model.dart';

class TempleDetailPage extends StatelessWidget {
  final Temple temple;

  const TempleDetailPage({super.key, required this.temple});

  void _launchMapUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not launch $url';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(temple.title ?? 'Detail Candi'),
      ),
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
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 12),

            // Deskripsi Candi
            if (temple.description != null && temple.description!.isNotEmpty)
              Text(
                temple.description!,
                style: const TextStyle(fontSize: 16),
              ),

            const SizedBox(height: 24),

            // Fun Fact Title
            if (temple.funfactTitle != null && temple.funfactTitle!.isNotEmpty)
              Text(
                temple.funfactTitle!,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),

            const SizedBox(height: 8),

            // Fun Fact Description
            if (temple.funfactDescription != null && temple.funfactDescription!.isNotEmpty)
              Text(
                temple.funfactDescription!,
                style: const TextStyle(fontSize: 16, fontStyle: FontStyle.italic),
              ),

            const SizedBox(height: 24),

            // Tombol Lokasi (Maps)
            if (temple.locationUrl != null && temple.locationUrl!.isNotEmpty)
              ElevatedButton.icon(
                icon: const Icon(Icons.map),
                label: const Text('Lihat Lokasi'),
                onPressed: () => _launchMapUrl(temple.locationUrl!),
              ),
          ],
        ),
      ),
    );
  }
}
