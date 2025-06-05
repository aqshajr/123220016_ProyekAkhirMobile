import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../model/artifact_model.dart';
import '../../model/temple_model.dart';
import '../../service/artifact_service.dart';
import 'lbs_map_page.dart';

class ArtifactDetailPage extends StatefulWidget {
  final Artifact artifact;

  const ArtifactDetailPage({super.key, required this.artifact});

  @override
  State<ArtifactDetailPage> createState() => _ArtifactDetailPageState();
}

class _ArtifactDetailPageState extends State<ArtifactDetailPage> {
  late bool _isRead;
  late bool _isBookmarked;

  @override
  void initState() {
    super.initState();
    // Inisialisasi state lokal dari widget
    _isRead = widget.artifact.isRead;
    _isBookmarked = widget.artifact.isBookmarked;
  }

  @override
  Widget build(BuildContext context) {
    // Convert Artifact to Temple for LBSMapPage
    final temple = Temple(
      templeID: widget.artifact.templeID,
      title: widget.artifact.templeTitle,
      locationUrl: widget.artifact.locationUrl,
      latitude: widget.artifact.latitude,
      longitude: widget.artifact.longitude,
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.artifact.title, style: GoogleFonts.poppins()),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (widget.artifact.imageUrl != null &&
                widget.artifact.imageUrl!.isNotEmpty)
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.network(
                  widget.artifact.imageUrl!,
                  width: double.infinity,
                  height: 200,
                  fit: BoxFit.cover,
                ),
              ),
            const SizedBox(height: 16),
            Text(
              widget.artifact.title,
              style: GoogleFonts.poppins(
                  fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Candi: ${widget.artifact.templeTitle}',
              style: GoogleFonts.poppins(
                  fontSize: 16, fontStyle: FontStyle.italic),
            ),
            const SizedBox(height: 16),
            Text(
              widget.artifact.description,
              style: GoogleFonts.poppins(fontSize: 16),
              textAlign: TextAlign.justify,
            ),
            const SizedBox(height: 24),
            if (widget.artifact.detailPeriod != null)
              _buildDetailItem("Periode", widget.artifact.detailPeriod!),
            if (widget.artifact.detailMaterial != null)
              _buildDetailItem("Material", widget.artifact.detailMaterial!),
            if (widget.artifact.detailSize != null)
              _buildDetailItem("Ukuran", widget.artifact.detailSize!),
            if (widget.artifact.detailStyle != null)
              _buildDetailItem("Gaya", widget.artifact.detailStyle!),
            const SizedBox(height: 24),
            if (widget.artifact.funfactTitle != null ||
                widget.artifact.funfactDescription != null)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Fun Fact:",
                      style: GoogleFonts.poppins(
                          fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  if (widget.artifact.funfactTitle != null)
                    Text(
                      widget.artifact.funfactTitle!,
                      style: GoogleFonts.poppins(
                          fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                  if (widget.artifact.funfactDescription != null)
                    Text(
                      widget.artifact.funfactDescription!,
                      style: GoogleFonts.poppins(fontSize: 16),
                      textAlign: TextAlign.justify,
                    ),
                ],
              ),
            const SizedBox(height: 24),
            // Tombol Aksi Baru
            Row(
              children: [
                // Tombol Tandai Dibaca
                Expanded(
                  child: OutlinedButton.icon(
                    icon: Icon(_isRead
                        ? Icons.check_circle
                        : Icons.check_circle_outline),
                    label: Text(_isRead ? 'Sudah Dibaca' : 'Tandai Dibaca'),
                    onPressed: _isRead
                        ? null
                        : () async {
                            await ArtifactService.markArtifactAsRead(
                                widget.artifact.artifactID);
                            setState(() {
                              _isRead = true;
                            });
                          },
                    style: OutlinedButton.styleFrom(
                      foregroundColor:
                          _isRead ? Colors.green : const Color(0xff233743),
                      side: BorderSide(
                          color:
                              _isRead ? Colors.green : const Color(0xff233743)),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Tombol Bookmark
                Expanded(
                  child: OutlinedButton.icon(
                    icon: Icon(
                        _isBookmarked ? Icons.bookmark : Icons.bookmark_border),
                    label: Text(_isBookmarked ? 'Di-bookmark' : 'Bookmark'),
                    onPressed: () async {
                      if (_isBookmarked) {
                        await ArtifactService.unbookmarkArtifact(
                            widget.artifact.artifactID);
                      } else {
                        await ArtifactService.bookmarkArtifact(
                            widget.artifact.artifactID);
                      }
                      setState(() {
                        _isBookmarked = !_isBookmarked;
                      });
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xff233743),
                      side: const BorderSide(color: Color(0xff233743)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (widget.artifact.locationUrl != null &&
                widget.artifact.locationUrl!.isNotEmpty)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.location_on),
                  label: const Text('Lihat Lokasi'),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            LBSMapPage(candi: temple, mode: LbsMode.artifacts),
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

  Widget _buildDetailItem(String title, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("$title: ",
              style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          Expanded(child: Text(value, style: GoogleFonts.poppins())),
        ],
      ),
    );
  }
}
