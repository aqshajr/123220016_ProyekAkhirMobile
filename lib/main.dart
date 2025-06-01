import 'package:artefacto/pages/splash_page.dart';
import 'package:flutter/material.dart';
import 'package:artefacto/import_pages/import_pages.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false, // Menghilangkan tulisan debug
      title: 'Artefacto',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Color(0xFFF61313),
        ),
        useMaterial3: true, // kalau pakai Material 3
      ),
      home: const LoginPage(), // Halaman pertama
    );
  }
}
