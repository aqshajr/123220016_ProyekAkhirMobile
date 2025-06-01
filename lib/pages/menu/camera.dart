import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:permission_handler/permission_handler.dart';

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

  // Color Scheme matching EksplorasiPage
  final Color _primaryDarkBlue = const Color(0xff233743);
  final Color _errorRed = const Color(0xFFE57373);
  final Color _accentBrown = const Color(0xffB69574);

  Future<bool> _checkAndRequestPermissions(bool isCamera) async {
    try {
      if (await Permission.photos.isRestricted) {
        return false;
      }

      Map<Permission, PermissionStatus> statuses = await [
        if (isCamera) Permission.camera,
        Permission.storage,
        Permission.photos,
      ].request();

      if (statuses.containsValue(PermissionStatus.permanentlyDenied)) {
        _showSettingsDialog();
        return false;
      }

      return statuses.values.every((status) => status.isGranted);
    } catch (e) {
      _showError('Error checking permissions: ${e.toString()}');
      return false;
    }
  }

  void _showSettingsDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) => AlertDialog(
        title: Text('Permission Required',
            style: GoogleFonts.openSans(fontWeight: FontWeight.bold)),
        content: Text(
            'Please enable permissions in app settings',
            style: GoogleFonts.openSans()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () => openAppSettings().then((_) => Navigator.pop(context)),
            child: Text('Open Settings'),
          ),
        ],
      ),
    );
  }

  Future<void> _pickImageFromGallery() async {
    try {
      final hasPermission = await _checkAndRequestPermissions(false);
      if (!hasPermission) return;

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
    }
  }

  Future<void> _captureImageFromCamera() async {
    try {
      final hasPermission = await _checkAndRequestPermissions(true);
      if (!hasPermission) return;

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

    // TODO: Replace with actual API call
    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      _isLoading = false;
      _predictionResult = 'Borobudur Statue successfully recognized!';
    });
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
    final availableHeight = mediaQuery.size.height -
        mediaQuery.padding.top -
        kToolbarHeight;

    return Scaffold(
      body: Stack(
        children: [
          // Background image only (no gradient overlay)
          Positioned.fill(
            child: Image.asset(
              'assets/images/background.png',
              fit: BoxFit.cover,
            ),
          ),
          // Content directly on top of background image
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
      child: _isLoading
          ? const CircularProgressIndicator()
          : _predictionResult.isEmpty
          ? _buildInstructions()
          : _buildPredictionResult(),
    );
  }

  Widget _buildInstructions() {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Icon(Icons.info_outline,
                size: 40, color: _accentBrown.withOpacity(0.7)),
            const SizedBox(height: 15),
            Text(
              'How to use:',
              style: GoogleFonts.playfairDisplay(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              '1. Select image from gallery or take photo\n'
                  '2. Press "Scan Artifact" button\n'
                  '3. Wait for identification results',
              style: GoogleFonts.openSans(height: 1.5),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPredictionResult() {
    return Card(
      elevation: 5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Icon(Icons.verified, size: 50, color: Colors.green.shade600),
            const SizedBox(height: 15),
            Text(
              'IDENTIFICATION RESULT',
              style: GoogleFonts.playfairDisplay(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 15),
            Text(
              _predictionResult,
              style: GoogleFonts.openSans(
                fontSize: 17,
                fontWeight: FontWeight.w600,
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: _primaryDarkBlue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 30,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              onPressed: () {
                // TODO: Navigate to detail page
              },
              child: Text(
                'VIEW DETAILS',
                style: GoogleFonts.openSans(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}