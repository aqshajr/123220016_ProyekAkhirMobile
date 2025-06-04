import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../model/temple_model.dart';
import '../../service/temple_service.dart';
import 'detail_temples.dart';

class LBSMapPage extends StatefulWidget {
  final Temple candi;

  const LBSMapPage({super.key, required this.candi});

  @override
  State<LBSMapPage> createState() => _LBSMapPageState();
}

class _LBSMapPageState extends State<LBSMapPage> {
  // Variabel untuk Google Maps
  GoogleMapController? kontrolerPeta;
  Set<Marker> pinPeta = {};

  // Variabel untuk lokasi
  Position? lokasiUser;
  LatLng? koordinatCandi;
  double? jarakKeCandi;
  String? alamatCandi;
  List<Temple> candiTerdekat = [];

  // State management
  bool sedangMemuat = true;
  String? pesanError;

  // Default camera position (Indonesia)
  static const LatLng _posisiAwalKamera = LatLng(-7.7956, 110.3695);

  @override
  void initState() {
    super.initState();
    _inisialisasiPeta();
  }

  // Fungsi utama untuk setup semua data peta
  Future<void> _inisialisasiPeta() async {
    setState(() {
      sedangMemuat = true;
      pesanError = null;
    });

    try {
      // 1. Parse koordinat candi dari URL
      await _parseKoordinatCandi();

      // 2. Dapatkan lokasi user
      await _dapatkanLokasiUser();

      // 3. Hitung jarak dan setup pins
      if (lokasiUser != null && koordinatCandi != null) {
        _hitungJarakDanSetupPins();
      }

      // 4. Cari candi terdekat
      await _cariCandiTerdekat();

      // 5. Dapatkan alamat candi
      await _dapatkanAlamatCandi();
    } catch (e) {
      setState(() {
        pesanError = 'Gagal memuat peta: ${e.toString()}';
      });
    } finally {
      setState(() {
        sedangMemuat = false;
      });
    }
  }

  // Parse koordinat candi dari URL Google Maps
  Future<void> _parseKoordinatCandi() async {
    // PRIORITAS 1: Gunakan latitude/longitude langsung dari database jika ada
    if (widget.candi.latitude != null && widget.candi.longitude != null) {
      setState(() {
        koordinatCandi = LatLng(
          widget.candi.latitude!,
          widget.candi.longitude!,
        );
      });
      return;
    }

    // PRIORITAS 2: Parse dari URL jika koordinat langsung tidak ada
    if (widget.candi.locationUrl == null) {
      throw 'URL lokasi candi tidak tersedia';
    }

    try {
      final koordinat = _parseKoordinatDariUrl(widget.candi.locationUrl!);
      if (koordinat != null) {
        setState(() {
          koordinatCandi = LatLng(koordinat['lat']!, koordinat['lng']!);
        });
      } else {
        throw 'Tidak dapat mem-parse koordinat dari URL';
      }
    } catch (e) {
      throw 'Error parsing koordinat candi: $e';
    }
  }

  // Parse koordinat dari URL Google Maps atau LBS
  Map<String, double>? _parseKoordinatDariUrl(String url) {
    try {
      // Method 0: Parse Google Maps format !3d!4d (paling akurat untuk marker location)
      RegExp regex3d4d = RegExp(r'!3d([-]?\d+\.?\d*)!4d([-]?\d+\.?\d*)');
      var match = regex3d4d.firstMatch(url);

      if (match != null) {
        final lat = double.tryParse(match.group(1)!);
        final lng = double.tryParse(match.group(2)!);

        if (lat != null &&
            lng != null &&
            lat >= -11 &&
            lat <= 6 &&
            lng >= 95 &&
            lng <= 141) {
          return {'lat': lat, 'lng': lng};
        }
      }

      // Method 1: Parse format @lat,lng,zoom (Google Maps viewport)
      RegExp regexAtFormat = RegExp(
        r'@([-]?\d+\.?\d*),([-]?\d+\.?\d*),?\d*\.?\d*z?',
      );
      match = regexAtFormat.firstMatch(url);

      if (match != null) {
        final lat = double.tryParse(match.group(1)!);
        final lng = double.tryParse(match.group(2)!);

        if (lat != null &&
            lng != null &&
            lat >= -11 &&
            lat <= 6 &&
            lng >= 95 &&
            lng <= 141) {
          return {'lat': lat, 'lng': lng};
        }
      }

      // Method 2: Parse format /maps/place dengan koordinat
      RegExp regexPlace = RegExp(
        r'/maps/place/[^/]*/@([-]?\d+\.?\d*),([-]?\d+\.?\d*)',
      );
      match = regexPlace.firstMatch(url);

      if (match != null) {
        final lat = double.tryParse(match.group(1)!);
        final lng = double.tryParse(match.group(2)!);

        if (lat != null &&
            lng != null &&
            lat >= -11 &&
            lat <= 6 &&
            lng >= 95 &&
            lng <= 141) {
          return {'lat': lat, 'lng': lng};
        }
      }

      // Method 3: Regex untuk format biasa (lat,lng) - yang paling umum
      RegExp regexKoordinat = RegExp(r'([-]?\d+\.?\d*),([-]?\d+\.?\d*)');
      var matches = regexKoordinat.allMatches(url);

      for (var match in matches) {
        final koordinatString = match.group(0)!;
        final parts = koordinatString.split(',');

        if (parts.length == 2) {
          final lat = double.tryParse(parts[0]);
          final lng = double.tryParse(parts[1]);

          if (lat != null && lng != null) {
            // Validasi range koordinat yang masuk akal untuk Indonesia
            if (lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141) {
              return {'lat': lat, 'lng': lng};
            }
          }
        }
      }

      // Method 4: Parse format query parameter (?q=lat,lng)
      final uri = Uri.tryParse(url);
      if (uri != null) {
        final query = uri.queryParameters;
        if (query.containsKey('q')) {
          final qValue = query['q'];
          if (qValue != null) {
            final qMatch = RegExp(
              r'([-]?\d+\.?\d*),([-]?\d+\.?\d*)',
            ).firstMatch(qValue);
            if (qMatch != null) {
              final lat = double.tryParse(qMatch.group(1)!);
              final lng = double.tryParse(qMatch.group(2)!);

              if (lat != null &&
                  lng != null &&
                  lat >= -11 &&
                  lat <= 6 &&
                  lng >= 95 &&
                  lng <= 141) {
                return {'lat': lat, 'lng': lng};
              }
            }
          }
        }

        // Method 5: Parse parameter ll (latitude,longitude)
        if (query.containsKey('ll')) {
          final llValue = query['ll'];
          if (llValue != null) {
            final llMatch = RegExp(
              r'([-]?\d+\.?\d*),([-]?\d+\.?\d*)',
            ).firstMatch(llValue);
            if (llMatch != null) {
              final lat = double.tryParse(llMatch.group(1)!);
              final lng = double.tryParse(llMatch.group(2)!);

              if (lat != null &&
                  lng != null &&
                  lat >= -11 &&
                  lat <= 6 &&
                  lng >= 95 &&
                  lng <= 141) {
                return {'lat': lat, 'lng': lng};
              }
            }
          }
        }
      }

      // Fallback koordinat Yogyakarta jika parsing gagal
      return {'lat': -7.7956, 'lng': 110.3695};
    } catch (e) {
      return {
        'lat': -7.7956,
        'lng': 110.3695,
      }; // Return fallback instead of null
    }
  }

  // Dapatkan lokasi GPS user
  Future<void> _dapatkanLokasiUser() async {
    try {
      // Cek apakah location service aktif
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw 'GPS tidak aktif. Silakan aktifkan lokasi di pengaturan.';
      }

      // Cek dan minta permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw 'Permission lokasi ditolak';
        }
      }

      if (permission == LocationPermission.deniedForever) {
        throw 'Permission lokasi ditolak permanen. Silakan aktifkan di pengaturan aplikasi.';
      }

      // Dapatkan posisi user
      lokasiUser = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      // Tidak throw error, biar masih bisa tampil peta candi saja
    }
  }

  // Hitung jarak dan setup pins di peta
  void _hitungJarakDanSetupPins() {
    if (lokasiUser == null || koordinatCandi == null) return;

    // Hitung jarak
    final jarakMeter = Geolocator.distanceBetween(
      lokasiUser!.latitude,
      lokasiUser!.longitude,
      koordinatCandi!.latitude,
      koordinatCandi!.longitude,
    );

    setState(() {
      jarakKeCandi = jarakMeter / 1000; // konversi ke km
    });

    // Setup pins/markers
    _setupPinsPeta();
  }

  // Setup pins/markers di peta
  void _setupPinsPeta() {
    Set<Marker> markers = {};

    // Pin lokasi candi (merah)
    if (koordinatCandi != null) {
      markers.add(
        Marker(
          markerId: const MarkerId('candi'),
          position: koordinatCandi!,
          infoWindow: InfoWindow(
            title: widget.candi.title ?? 'Candi',
            snippet: alamatCandi ?? 'Lokasi candi',
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        ),
      );
    }

    // Pin lokasi user (biru)
    if (lokasiUser != null) {
      markers.add(
        Marker(
          markerId: const MarkerId('user'),
          position: LatLng(lokasiUser!.latitude, lokasiUser!.longitude),
          infoWindow: const InfoWindow(
            title: 'Lokasi Anda',
            snippet: 'Lokasi Anda saat ini',
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
        ),
      );
    }

    setState(() {
      pinPeta = markers;
    });
  }

  // Cari candi-candi terdekat dalam radius 50km
  Future<void> _cariCandiTerdekat() async {
    if (lokasiUser == null) {
      return;
    }

    try {
      final semuaCandi = await TempleService.getTemples();
      List<Map<String, dynamic>> candiDenganJarak = [];

      for (final candi in semuaCandi) {
        // Skip candi yang sedang dilihat
        if (candi.templeID == widget.candi.templeID) continue;

        Map<String, double>? koordinatCandi;

        // Prioritas 1: Gunakan koordinat langsung dari database
        if (candi.latitude != null && candi.longitude != null) {
          koordinatCandi = {'lat': candi.latitude!, 'lng': candi.longitude!};
        }
        // Prioritas 2: Parse dari URL
        else {
          koordinatCandi = _parseKoordinatDariUrl(candi.locationUrl ?? '');
        }

        if (koordinatCandi != null) {
          // Gunakan jarak garis lurus HANYA untuk sorting/filtering
          // TIDAK ditampilkan ke user karena tidak akurat
          final jarak =
              Geolocator.distanceBetween(
                lokasiUser!.latitude,
                lokasiUser!.longitude,
                koordinatCandi['lat']!,
                koordinatCandi['lng']!,
              ) /
              1000; // konversi ke km

          // Hanya ambil candi dalam radius 50km
          if (jarak <= 50) {
            candiDenganJarak.add({'candi': candi, 'jarak': jarak});
          }
        }
      }

      // Sort berdasarkan jarak terdekat dan ambil 5 terdekat
      candiDenganJarak.sort((a, b) => a['jarak'].compareTo(b['jarak']));

      setState(() {
        candiTerdekat =
            candiDenganJarak
                .take(5)
                .map((item) => item['candi'] as Temple)
                .toList();
      });
    } catch (e) {
      // Handle error silently
    }
  }

  // Dapatkan alamat readable dari koordinat
  Future<void> _dapatkanAlamatCandi() async {
    if (koordinatCandi == null) return;

    try {
      final placemarks = await placemarkFromCoordinates(
        koordinatCandi!.latitude,
        koordinatCandi!.longitude,
      );

      if (placemarks.isNotEmpty) {
        final placemark = placemarks.first;

        // Buat alamat yang lebih detail
        List<String> alamatParts = [];

        // Tambahkan nomor dan nama jalan jika ada dan valid
        if (placemark.street != null && placemark.street!.isNotEmpty) {
          // Filter Plus Code (berbagai format)
          final isPlusCode =
              RegExp(r'[0-9A-Z]+\+[0-9A-Z]+').hasMatch(placemark.street!) ||
              placemark.street!.split(' ').any((part) => part.contains('+'));

          if (!isPlusCode) {
            // Hapus duplikasi nama jalan jika ada
            final streetName =
                placemark.street!
                    .replaceAll(
                      RegExp(r'Jalan|Jl\.?\s+', caseSensitive: false),
                      'Jl.',
                    )
                    .trim();
            if (streetName.isNotEmpty) {
              alamatParts.add(streetName);
            }
          }
        }

        // Tambahkan sub lokasi (kelurahan/desa) jika berbeda dengan nama jalan
        if (placemark.subLocality != null &&
            placemark.subLocality!.isNotEmpty &&
            !alamatParts.any(
              (part) => part.toLowerCase().contains(
                placemark.subLocality!.toLowerCase(),
              ),
            )) {
          alamatParts.add(placemark.subLocality!);
        }

        // Tambahkan kecamatan jika berbeda dengan kelurahan
        if (placemark.locality != null &&
            placemark.locality!.isNotEmpty &&
            !alamatParts.any(
              (part) => part.toLowerCase().contains(
                placemark.locality!.toLowerCase(),
              ),
            )) {
          alamatParts.add(placemark.locality!);
        }

        // Tambahkan kabupaten/kota jika ada dan berbeda
        if (placemark.subAdministrativeArea != null &&
            placemark.subAdministrativeArea!.isNotEmpty &&
            !alamatParts.any(
              (part) => part.toLowerCase().contains(
                placemark.subAdministrativeArea!.toLowerCase(),
              ),
            )) {
          // Standarisasi format Kabupaten/Kota
          String area = placemark.subAdministrativeArea!;
          if (!area.toLowerCase().startsWith('kab') &&
              !area.toLowerCase().startsWith('kota')) {
            area = 'Kabupaten $area';
          }
          alamatParts.add(area);
        }

        // Tambahkan provinsi
        if (placemark.administrativeArea != null &&
            placemark.administrativeArea!.isNotEmpty &&
            !alamatParts.any(
              (part) => part.toLowerCase().contains(
                placemark.administrativeArea!.toLowerCase(),
              ),
            )) {
          // Standarisasi nama provinsi
          final provinsi =
              placemark.administrativeArea!
                  .replaceAll('Daerah Istimewa', 'DI')
                  .replaceAll('Daerah Khusus Ibukota', 'DKI')
                  .trim();
          alamatParts.add(provinsi);
        }

        // Jika tidak ada detail jalan (hanya Plus Code), tambahkan deskripsi umum
        if (alamatParts.isEmpty &&
            placemark.thoroughfare != null &&
            placemark.thoroughfare!.isNotEmpty) {
          alamatParts.add('Area ${placemark.thoroughfare!}');
        }

        setState(() {
          alamatCandi =
              alamatParts.isNotEmpty
                  ? alamatParts.join(', ')
                  : 'Lokasi tidak memiliki alamat detail';
        });
      }
    } catch (e) {
      // Handle error silently
    }
  }

  // Callback ketika peta sudah siap
  void _onMapCreated(GoogleMapController controller) {
    kontrolerPeta = controller;

    // Set camera ke posisi yang tepat
    if (koordinatCandi != null && lokasiUser != null) {
      // Hitung bounds yang mencakup kedua lokasi
      _setCameraBounds();
    } else if (koordinatCandi != null) {
      // Jika hanya ada koordinat candi
      kontrolerPeta!.animateCamera(
        CameraUpdate.newLatLngZoom(koordinatCandi!, 15),
      );
    }
  }

  // Set camera agar mencakup user dan candi
  void _setCameraBounds() {
    if (lokasiUser == null || koordinatCandi == null) return;

    final userLatLng = LatLng(lokasiUser!.latitude, lokasiUser!.longitude);

    // Hitung bounds yang mencakup kedua titik
    double minLat = [
      userLatLng.latitude,
      koordinatCandi!.latitude,
    ].reduce((a, b) => a < b ? a : b);
    double maxLat = [
      userLatLng.latitude,
      koordinatCandi!.latitude,
    ].reduce((a, b) => a > b ? a : b);
    double minLng = [
      userLatLng.longitude,
      koordinatCandi!.longitude,
    ].reduce((a, b) => a < b ? a : b);
    double maxLng = [
      userLatLng.longitude,
      koordinatCandi!.longitude,
    ].reduce((a, b) => a > b ? a : b);

    // Tambah padding
    final padding = 0.01;

    kontrolerPeta!.animateCamera(
      CameraUpdate.newLatLngBounds(
        LatLngBounds(
          southwest: LatLng(minLat - padding, minLng - padding),
          northeast: LatLng(maxLat + padding, maxLng + padding),
        ),
        100.0, // padding
      ),
    );
  }

  // Build widget untuk info jarak
  Widget _buildInfoJarak() {
    if (pesanError != null) {
      return Card(
        color: Colors.orange.shade50,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                children: [
                  Icon(Icons.warning, color: Colors.orange.shade700),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      pesanError!,
                      style: TextStyle(color: Colors.orange.shade700),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ElevatedButton.icon(
                onPressed: _inisialisasiPeta,
                icon: const Icon(Icons.refresh),
                label: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
      );
    }

    if (koordinatCandi != null && alamatCandi != null) {
      return Card(
        color: Colors.blue.shade50,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.place, color: Colors.blue.shade700, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  alamatCandi!,
                  style: GoogleFonts.openSans(
                    fontSize: 14,
                    color: Colors.blue.shade600,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return const SizedBox();
  }

  // Build widget untuk candi terdekat
  Widget _buildCandiTerdekat() {
    if (candiTerdekat.isEmpty) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Text('Tidak ada candi terdekat dalam radius 50km'),
        ),
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Candi Terdekat Lainnya',
              style: GoogleFonts.playfairDisplay(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: const Color(0xff233743),
              ),
            ),
            const SizedBox(height: 12),
            ...candiTerdekat.map((candi) => _buildItemCandiTerdekat(candi)),
          ],
        ),
      ),
    );
  }

  // Build item candi terdekat
  Widget _buildItemCandiTerdekat(Temple candi) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(
            candi.imageUrl ?? 'https://via.placeholder.com/50',
            width: 50,
            height: 50,
            fit: BoxFit.cover,
            errorBuilder:
                (context, error, stackTrace) => Container(
                  width: 50,
                  height: 50,
                  color: Colors.grey.shade300,
                  child: const Icon(Icons.temple_buddhist),
                ),
          ),
        ),
        title: Text(
          candi.title ?? 'Candi',
          style: GoogleFonts.openSans(fontWeight: FontWeight.w600),
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: () {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => LBSMapPage(candi: candi)),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Lokasi ${widget.candi.title ?? "Candi"}'),
        backgroundColor: const Color(0xff233743),
        foregroundColor: Colors.white,
      ),
      body:
          sedangMemuat
              ? const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text(
                      'Memuat peta dan informasi lokasi...',
                      style: TextStyle(fontSize: 16),
                    ),
                  ],
                ),
              )
              : Column(
                children: [
                  // Google Maps
                  Expanded(
                    flex: 3,
                    child: GoogleMap(
                      onMapCreated: _onMapCreated,
                      initialCameraPosition: CameraPosition(
                        target: koordinatCandi ?? _posisiAwalKamera,
                        zoom: 15,
                      ),
                      markers: pinPeta,
                      myLocationEnabled: lokasiUser != null,
                      myLocationButtonEnabled: true,
                      mapType: MapType.normal,
                      zoomControlsEnabled: true,
                    ),
                  ),

                  // Info dan daftar candi terdekat
                  Expanded(
                    flex: 2,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          // Info alamat
                          _buildInfoJarak(),

                          const SizedBox(height: 16),

                          // Candi terdekat lainnya
                          _buildCandiTerdekat(),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
    );
  }
}
