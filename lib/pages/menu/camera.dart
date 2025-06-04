import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter/services.dart';

import '../../service/model_service.dart';

class CameraPage extends StatefulWidget {
  const CameraPage({super.key});

  @override
  State<CameraPage> createState() => _CameraPageState();
}

class _CameraPageState extends State<CameraPage> {
  File? _imageFile;
  String _predictionResult = '';
  bool _isLoading = false;
  final ImagePicker _picker = ImagePicker();
  final ModelService _modelService = ModelService();

  final Color _primaryDarkBlue = const Color(0xff233743);
  final Color _errorRed = const Color(0xFFE57373);
  final Color _accentBrown = const Color(0xffB69574);

  Future<bool> _requestGalleryPermission() async {
    try {
      if (Platform.isAndroid) {
        // Android 13+ (API 33) menggunakan media permissions
        if (await Permission.mediaLibrary.isRestricted) {
          return false;
        }

        final status = await Permission.mediaLibrary.request();
        if (status.isGranted) return true;
        if (status.isPermanentlyDenied) {
          _showSettingsDialog();
          return false;
        }

        // Fallback untuk Android <13
        final storageStatus = await Permission.storage.request();
        return storageStatus.isGranted;
      } else {
        // iOS
        final status = await Permission.photos.request();
        if (status.isGranted) return true;
        if (status.isPermanentlyDenied) {
          _showSettingsDialog();
          return false;
        }
        return false;
      }
    } on PlatformException catch (e) {
      debugPrint('Permission error: $e');
      return false;
    }
  }

  Future<bool> _requestCameraPermission() async {
    try {
      if (await Permission.camera.isRestricted) {
        return false;
      }

      final status = await Permission.camera.request();
      if (status.isGranted) return true;
      if (status.isPermanentlyDenied) {
        _showSettingsDialog();
        return false;
      }
      return false;
    } on PlatformException catch (e) {
      debugPrint('Camera permission error: $e');
      return false;
    }
  }

  void _showSettingsDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) => AlertDialog(
        title: Text('Permission Required',
            style: GoogleFonts.openSans(fontWeight: FontWeight.bold)),
        content: Text('Please enable permissions in app settings',
            style: GoogleFonts.openSans()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => openAppSettings().then((_) => Navigator.pop(context)),
            child: const Text('Open Settings'),
          ),
        ],
      ),
    );
  }

  Future<void> _pickImageFromGallery() async {
    try {
      final hasPermission = await _requestGalleryPermission();
      if (!hasPermission) {
        _showError('Gallery permission denied');
        return;
      }

      final XFile? pickedFile = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );

      if (pickedFile != null) {
        setState(() {
          _imageFile = File(pickedFile.path);
          _predictionResult = '';
        });
      }
    } catch (e) {
      _showError('Failed to pick image: ${e.toString()}');
      debugPrint('Image picker error: $e');
    }
  }

  Future<void> _captureImageFromCamera() async {
    try {
      final hasPermission = await _requestCameraPermission();
      if (!hasPermission) {
        _showError('Camera permission denied');
        return;
      }

      final XFile? pickedFile = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 85,
        preferredCameraDevice: CameraDevice.rear,
      );

      if (pickedFile != null) {
        setState(() {
          _imageFile = File(pickedFile.path);
          _predictionResult = '';
        });
      }
    } catch (e) {
      _showError('Failed to capture image: ${e.toString()}');
      debugPrint('Camera error: $e');
    }
  }

  Future<void> _predict() async {
    if (_imageFile == null) {
      _showError('Please select or capture an artifact image first');
      return;
    }

    setState(() {
      _isLoading = true;
      _predictionResult = '';
    });

    try {
      final prediction = await _modelService.predictArtifact(_imageFile!);
      setState(() {
        _predictionResult = prediction;
      });
    } catch (e) {
      _showError(e.toString());
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: _errorRed,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final availableHeight =
        mediaQuery.size.height - mediaQuery.padding.top - kToolbarHeight;

    return Scaffold(
      body: Stack(
        children: [
          Positioned.fill(
            child: Image.asset(
              'assets/images/background.png',
              fit: BoxFit.cover,
            ),
          ),
          SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                _buildImageContainer(availableHeight * 0.35),
                const SizedBox(height: 30),
                _buildActionButtons(),
                const SizedBox(height: 30),
                _buildPredictButton(),
                const SizedBox(height: 30),
                _buildResultsSection(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageContainer(double height) {
    return Container(
      height: height,
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: _primaryDarkBlue.withOpacity(0.1),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: _imageFile != null
            ? Image.file(_imageFile!, fit: BoxFit.cover)
            : Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.image_search,
                size: 60, color: _accentBrown.withOpacity(0.5)),
            const SizedBox(height: 15),
            Text(
              'No image selected',
              style: GoogleFonts.openSans(
                color: _primaryDarkBlue.withOpacity(0.5),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons() {
    return Card(
      elevation: 5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildIconButton(
              icon: Icons.photo_library,
              label: 'Gallery',
              onPressed: _pickImageFromGallery,
            ),
            _buildIconButton(
              icon: Icons.camera_alt,
              label: 'Camera',
              onPressed: _captureImageFromCamera,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIconButton({
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
  }) {
    return Column(
      children: [
        Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: _primaryDarkBlue.withOpacity(0.2),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: CircleAvatar(
            backgroundColor: Colors.white,
            radius: 30,
            child: IconButton(
              icon: Icon(icon, size: 28),
              color: _accentBrown,
              onPressed: onPressed,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: GoogleFonts.openSans(
            color: _primaryDarkBlue,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildPredictButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: _primaryDarkBlue,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 5,
        ),
        onPressed: _isLoading ? null : _predict,
        child: _isLoading
            ? const SizedBox(
          height: 24,
          width: 24,
          child: CircularProgressIndicator(
            color: Colors.white,
            strokeWidth: 3,
          ),
        )
            : Text(
          'SCAN ARTIFACT',
          style: GoogleFonts.openSans(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildResultsSection() {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      child: _predictionResult.isEmpty
          ? const SizedBox.shrink()
          : Container(
        key: ValueKey<String>(_predictionResult),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white70,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: _primaryDarkBlue.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Text(
          'Result:\n$_predictionResult',
          style: GoogleFonts.openSans(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: _primaryDarkBlue,
          ),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}