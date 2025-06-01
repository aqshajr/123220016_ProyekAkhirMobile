import 'package:artefacto/pages/menu/profile.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../notif_page.dart';
import 'camera.dart';
import 'eksplorasi.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;
  Map<String, dynamic> userData = {
    'userId': '',
    'username': '',
    'email': '',
    'profilePicture': '',
  };
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    setState(() => _isLoading = true);

    try {
      final prefs = await SharedPreferences.getInstance();

      // Handle kemungkinan tipe data int atau String
      dynamic userId = prefs.get('userId'); // Gunakan get() bukan getString()
      if (userId == null) {
        throw Exception('User ID not found in local storage');
      }

      setState(() {
        userData = {
          'userId': userId.toString(), // Pastikan selalu String
          'username': prefs.getString('username') ?? 'Guest',
          'email': prefs.getString('email') ?? '',
          'profilePicture': prefs.getString('profilePicture') ?? '',
        };
      });
    } catch (e) {
      debugPrint('Error loading user data: $e');
      // Tambahkan penanganan error lebih spesifik
      if (e is TypeError) {
        debugPrint('TypeError: Pastikan tipe data di SharedPreferences konsisten');
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Widget _buildProfilePage() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (userData['userId'].isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            const Text(
              'User data not available',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _loadUserData,
              child: const Text('Try Again'),
            ),
          ],
        ),
      );
    }

    return ProfilePage(userData: userData);
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> _widgetOptions = <Widget>[
      EksplorasiPage(username: userData['username']),
      const CameraPage(),
      _buildProfilePage(),
    ];

    const List<BottomNavigationBarItem> navItems = <BottomNavigationBarItem>[
      BottomNavigationBarItem(
        icon: Icon(Icons.home),
        label: 'Home',
      ),
      BottomNavigationBarItem(
        icon: Icon(Icons.camera_alt),
        label: 'Scan Artefak',
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
          elevation: 0,
          title: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Artefacto',
                  style: TextStyle(
                    color: Color(0xff233743),
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.notifications),
                  color: const Color(0xff233743),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const NotificationPage(),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          automaticallyImplyLeading: false,
          toolbarHeight: 60,
        ),
        body: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          color: Colors.white,
          child: _widgetOptions.elementAt(_selectedIndex),
        ),
        bottomNavigationBar: BottomNavigationBar(
          items: navItems,
          currentIndex: _selectedIndex,
          unselectedItemColor: Colors.black26,
          selectedFontSize: 12.0,
          selectedItemColor: const Color(0xff233743),
          onTap: (index) {
            if (index == 2 && userData['userId'].isEmpty) {
              _loadUserData();
            }
            setState(() => _selectedIndex = index);
          },
        ),
      ),
    );
  }
}