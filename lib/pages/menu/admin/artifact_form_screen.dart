import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../model/artifact_model.dart';

class ArtifactFormScreen extends StatefulWidget {
  final Artifact? artifact; // Jika ada artifact, berarti mode edit

  const ArtifactFormScreen({super.key, this.artifact});

  @override
  State<ArtifactFormScreen> createState() => _ArtifactFormScreenState();
}

class _ArtifactFormScreenState extends State<ArtifactFormScreen> {
  final _formKey = GlobalKey<FormState>();

  // Inisialisasi semua controller yang sesuai dengan properti di model Artifact
  late TextEditingController _templeIdController;
  late TextEditingController _titleController;
  late TextEditingController _descriptionController;
  late TextEditingController _detailPeriodController;
  late TextEditingController _detailMaterialController;
  late TextEditingController _detailSizeController;
  late TextEditingController _detailStyleController;
  late TextEditingController _funfactTitleController;
  late TextEditingController _funfactDescriptionController;
  late TextEditingController _locationUrlController;
  late TextEditingController _imageUrlController; // Untuk URL gambar yang ditampilkan

  @override
  void initState() {
    super.initState();
    // Inisialisasi controller dengan nilai dari widget.artifact jika ada
    _templeIdController = TextEditingController(text: widget.artifact?.templeID?.toString() ?? '');
    _titleController = TextEditingController(text: widget.artifact?.title ?? '');
    _descriptionController = TextEditingController(text: widget.artifact?.description ?? '');
    _detailPeriodController = TextEditingController(text: widget.artifact?.detailPeriod ?? '');
    _detailMaterialController = TextEditingController(text: widget.artifact?.detailMaterial ?? '');
    _detailSizeController = TextEditingController(text: widget.artifact?.detailSize ?? '');
    _detailStyleController = TextEditingController(text: widget.artifact?.detailStyle ?? '');
    _funfactTitleController = TextEditingController(text: widget.artifact?.funfactTitle ?? '');
    _funfactDescriptionController = TextEditingController(text: widget.artifact?.funfactDescription ?? '');
    _locationUrlController = TextEditingController(text: widget.artifact?.locationUrl ?? '');
    _imageUrlController = TextEditingController(text: widget.artifact?.imageUrl ?? ''); // Untuk tampilan lokal
  }

  @override
  void dispose() {
    // Pastikan semua controller di-dispose
    _templeIdController.dispose();
    _titleController.dispose();
    _descriptionController.dispose();
    _detailPeriodController.dispose();
    _detailMaterialController.dispose();
    _detailSizeController.dispose();
    _detailStyleController.dispose();
    _funfactTitleController.dispose();
    _funfactDescriptionController.dispose();
    _locationUrlController.dispose();
    _imageUrlController.dispose();
    super.dispose();
  }

  void _saveArtifact() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();

      // Untuk tujuan form lokal, jika mode tambah, kita bisa pakai 0
      // karena artifactID akan diberikan oleh backend.
      // Jika mode edit, gunakan artifactID yang sudah ada.
      final int artifactId = widget.artifact?.artifactID ?? 0;
      final int templeId = int.parse(_templeIdController.text);

      // In production, you would fetch the temple title based on templeId from your database
      // For now, we'll use a placeholder or the existing title if in edit mode
      final String templeTitle = widget.artifact?.templeTitle ?? 'Candi ${_templeIdController.text}';

      final newArtifact = Artifact(
        artifactID: artifactId,
        templeID: templeId,
        title: _titleController.text,
        description: _descriptionController.text,
        detailPeriod: _detailPeriodController.text,
        detailMaterial: _detailMaterialController.text,
        detailSize: _detailSizeController.text,
        detailStyle: _detailStyleController.text,
        funfactTitle: _funfactTitleController.text,
        funfactDescription: _funfactDescriptionController.text,
        locationUrl: _locationUrlController.text,
        imageUrl: _imageUrlController.text.isEmpty ? null : _imageUrlController.text,
        templeTitle: templeTitle, // Linked to templeId
        isBookmarked: false, // Initialized to false
        isRead: false, // Initialized to false
      );

      // Kembali ke list dengan data baru/diperbarui
      Navigator.pop(context, newArtifact);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.artifact == null ? "Tambah Artefak Baru" : "Edit Artefak",
          style: GoogleFonts.playfairDisplay(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xff233743),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage('assets/images/background.png'),
            fit: BoxFit.cover,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Form(
            key: _formKey,
            child: ListView(
              children: [
                _buildTextFormField(
                  controller: _templeIdController,
                  labelText: "ID Candi (Temple ID)",
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'ID Candi tidak boleh kosong';
                    }
                    if (int.tryParse(value) == null) {
                      return 'ID Candi harus berupa angka';
                    }
                    return null;
                  },
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 20),
                _buildTextFormField(
                  controller: _titleController,
                  labelText: "Judul Artefak",
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Judul artefak tidak boleh kosong';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                _buildTextFormField(
                  controller: _descriptionController,
                  labelText: "Deskripsi",
                  maxLines: 3,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Deskripsi tidak boleh kosong';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                _buildTextFormField(
                  controller: _detailPeriodController,
                  labelText: "Detail Periode",
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Detail Periode tidak boleh kosong';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                _buildTextFormField(
                  controller: _detailMaterialController,
                  labelText: "Detail Material",
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Detail Material tidak boleh kosong';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                _buildTextFormField(
                  controller: _detailSizeController,
                  labelText: "Detail Ukuran",
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Detail Ukuran tidak boleh kosong';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                _buildTextFormField(
                  controller: _detailStyleController,
                  labelText: "Detail Gaya",
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Detail Gaya tidak boleh kosong';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                _buildTextFormField(
                  controller: _funfactTitleController,
                  labelText: "Judul Funfact",
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Judul Funfact tidak boleh kosong';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                _buildTextFormField(
                  controller: _funfactDescriptionController,
                  labelText: "Deskripsi Funfact",
                  maxLines: 3,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Deskripsi Funfact tidak boleh kosong';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                _buildTextFormField(
                  controller: _locationUrlController,
                  labelText: "URL Lokasi",
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'URL Lokasi tidak boleh kosong';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                _buildTextFormField(
                  controller: _imageUrlController,
                  labelText: "URL Gambar (Opsional)",
                  // Validator di sini dihilangkan karena gambar bersifat opsional
                  // Anda bisa menambahkan validator untuk format URL jika diperlukan
                ),
                const SizedBox(height: 30),
                ElevatedButton(
                  onPressed: _saveArtifact,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xff233743),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    textStyle: GoogleFonts.merriweather(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  child: Text(widget.artifact == null ? "Tambah Artefak" : "Simpan Perubahan"),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Helper method untuk membuat TextFormField yang konsisten
  TextFormField _buildTextFormField({
    required TextEditingController controller,
    required String labelText,
    String? Function(String?)? validator,
    int? maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: labelText,
        labelStyle: GoogleFonts.openSans(),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
        filled: true,
        fillColor: Colors.white70,
      ),
      validator: validator,
      maxLines: maxLines,
      keyboardType: keyboardType,
    );
  }
}