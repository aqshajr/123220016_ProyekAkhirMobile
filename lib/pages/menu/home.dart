import 'package:artefacto/model/user_model.dart';
import 'package:artefacto/pages/menu/profile.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../notif_page.dart';
import 'camera.dart';
import 'eksplorasi.dart';
import 'visit_notes.dart';
// import 'package:artefacto/pages/menu/notification_page.dart'; // Commented out due to missing file

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;
  late Future<Map<String, dynamic>> _userDataFuture;

  @override
  void initState() {
    super.initState();
    _userDataFuture = _loadUserData();
  }

  Future<Map<String, dynamic>> _loadUserData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      dynamic userId = prefs.get('userId');
      if (userId == null) {
        throw Exception('User ID not found');
      }
      return {
        'userId': userId.toString(),
        'username': prefs.getString('username') ?? 'Guest',
        'email': prefs.getString('email') ?? '',
        'profilePicture': prefs.getString('profilePicture') ?? '',
      };
    } catch (e) {
      debugPrint('Error loading user data: $e');
      // Kembalikan error agar FutureBuilder bisa menanganinya
      rethrow;
    }
  }

  Widget _buildProfilePage(Map<String, dynamic> userData) {
    return ProfilePage(userData: userData);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: _userDataFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        if (snapshot.hasError || !snapshot.hasData) {
          // Tampilkan halaman error jika data gagal dimuat
          return Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Gagal memuat data pengguna.'),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () {
                      setState(() {
                        _userDataFuture = _loadUserData();
                      });
                    },
                    child: const Text('Coba Lagi'),
                  ),
                ],
              ),
            ),
          );
        }

        final userData = snapshot.data!;

        final List<Widget> widgetOptions = <Widget>[
          EksplorasiPage(username: userData['username']),
          const CameraPage(),
          const VisitNotesPage(),
          _buildProfilePage(userData),
        ];

        const List<BottomNavigationBarItem> navItems =
            <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.camera_alt),
            label: 'Scan Artefak',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.book),
            label: 'Catatan',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ];

        return SafeArea(
          child: Scaffold(
            appBar: AppBar(
              backgroundColor: Colors.white,
              surfaceTintColor: Colors.white,
              elevation: 0,
              actions: [
                IconButton(
                  icon: const Icon(Icons.notifications),
                  color: const Color(0xff233743),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text('Halaman Notifikasi belum tersedia.')),
                    );
                  },
                ),
                const SizedBox(width: 16.0)
              ],
              automaticallyImplyLeading: false,
              toolbarHeight: 60,
            ),
            body: Container(
              color: Colors.white,
              child: widgetOptions.elementAt(_selectedIndex),
            ),
            bottomNavigationBar: BottomNavigationBar(
              items: navItems,
              currentIndex: _selectedIndex,
              backgroundColor: Colors.white,
              type: BottomNavigationBarType.fixed,
              unselectedItemColor: Colors.grey[600],
              selectedFontSize: 12.0,
              selectedItemColor: const Color(0xff233743),
              onTap: (index) {
                if (index == 2 && userData['userId'].isEmpty) {
                  setState(() {
                    _userDataFuture = _loadUserData();
                  });
                }
                setState(() => _selectedIndex = index);
              },
            ),
          ),
        );
      },
    );
  }
}
