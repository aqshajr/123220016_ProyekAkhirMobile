import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:artefacto/model/user_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UserApi {
  static const baseUrl = "https://artefacto-backend-749281711221.us-central1.run.app/api/auth";

  // Helper method untuk mendapatkan headers dengan token
  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token') ?? '';
    return {
      'Content-Type': 'application/json',
      if (token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  static Future<Map<String, dynamic>> getUsers() async {
    final headers = await _getHeaders();
    final response = await http.get(Uri.parse("$baseUrl/profile"), headers: headers);
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> createUser(User user) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse(baseUrl),
      headers: headers,
      body: jsonEncode(user.toJson()),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> deleteUser(int id) async {
    final headers = await _getHeaders();
    final response = await http.delete(Uri.parse("$baseUrl/$id"), headers: headers);
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> getUserById(int id) async {
    final headers = await _getHeaders();
    final response = await http.get(Uri.parse("$baseUrl/$id"), headers: headers);
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> updateUserWithImage(User user, File? imageFile) async {
    final uri = Uri.parse("$baseUrl/${user.id}");
    final request = http.MultipartRequest('PUT', uri);

    // Ambil token dari SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token != null && token.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    // Tambahkan fields yang ingin dikirim
    if (user.username != null) request.fields['username'] = user.username!;
    if (user.email != null) request.fields['email'] = user.email!;
    if (user.currentPassword != null) {
      request.fields['currentPassword'] = user.currentPassword!;
    }
    if (user.newPassword != null) {
      request.fields['newPassword'] = user.newPassword!;
    }
    if (user.confirmNewPassword != null) {
      request.fields['confirmNewPassword'] = user.confirmNewPassword!;
    }

    // Upload file jika ada
    if (imageFile != null) {
      request.files.add(await http.MultipartFile.fromPath(
        'image',
        imageFile.path,
      ));
    }

    final streamedResponse = await request.send();
    final responseBody = await streamedResponse.stream.bytesToString();

    return jsonDecode(responseBody);
  }

  static Future<User> getProfile() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    final response = await http.get(
      Uri.parse("$baseUrl/profile"),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return User.fromJson(data['data']);
    } else {
      throw Exception('Failed to load profile');
    }
  }
}
