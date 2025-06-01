import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:artefacto/model/temple_model.dart';
import 'auth_service.dart';

class TempleService {
  static const String baseUrl = "https://artefacto-backend-749281711221.us-central1.run.app/api/temples";

  // Mendapatkan headers dengan token
  static Future<Map<String, String>> _getHeaders() async {
    final token = await AuthService().getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // Ambil semua temple (list)
  static Future<List<Temple>> getTemples() async {
    final headers = await _getHeaders();
    final response = await http.get(Uri.parse(baseUrl), headers: headers);

    if (response.statusCode == 200) {
      final jsonResponse = jsonDecode(response.body);
      final templeModel = TempleModel.fromJson(jsonResponse);
      return templeModel.data?.temples ?? [];
    } else if (response.statusCode == 401) {
      throw Exception('Session expired, please login again');
    } else {
      throw Exception('Failed to load temples: ${response.statusCode}');
    }
  }

  // Ambil temple berdasarkan ID
  static Future<Temple> getTempleById(int id) async {
    final headers = await _getHeaders();
    final response = await http.get(Uri.parse("$baseUrl/$id"), headers: headers);

    if (response.statusCode == 200) {
      final jsonResponse = jsonDecode(response.body);
      final templeJson = jsonResponse['data']['temple'] ?? jsonResponse['data'];
      return Temple.fromJson(templeJson);
    } else if (response.statusCode == 401) {
      throw Exception('Session expired, please login again');
    } else {
      throw Exception('Failed to get temple: ${response.statusCode}');
    }
  }

  // Membuat temple baru
  static Future<Temple> createTemple(Temple temple, File? selectedImageFile) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse(baseUrl),
      headers: headers,
      body: jsonEncode(temple.toJson()),
    );

    if (response.statusCode == 201) {
      final jsonResponse = jsonDecode(response.body);
      final templeJson = jsonResponse['data']['temple'] ?? jsonResponse['data'];
      return Temple.fromJson(templeJson);
    } else if (response.statusCode == 401) {
      throw Exception('Session expired, please login again');
    } else {
      throw Exception('Failed to create temple: ${response.statusCode}');
    }
  }

  // Menghapus temple
  static Future<String> deleteTemple(int id) async {
    final headers = await _getHeaders();
    final response = await http.delete(Uri.parse("$baseUrl/$id"), headers: headers);

    if (response.statusCode == 200) {
      final jsonResponse = jsonDecode(response.body);
      return jsonResponse['message'] ?? 'Temple deleted successfully';
    } else if (response.statusCode == 401) {
      throw Exception('Session expired, please login again');
    } else {
      throw Exception('Failed to delete temple: ${response.statusCode}');
    }
  }

  // Memperbarui temple (dengan file gambar opsional)
  static Future<Temple> updateTempleWithImage(Temple temple, File? imageFile) async {
    final token = await AuthService().getToken();
    final uri = Uri.parse("$baseUrl/${temple.templeID}");
    final request = http.MultipartRequest('PUT', uri);

    request.headers['Authorization'] = 'Bearer $token';

    // Menambahkan field teks
    request.fields['title'] = temple.title ?? '';
    request.fields['description'] = temple.description ?? '';
    request.fields['funfactTitle'] = temple.funfactTitle ?? '';
    request.fields['funfactDescription'] = temple.funfactDescription ?? '';
    request.fields['locationUrl'] = temple.locationUrl ?? '';

    // Jika ada file gambar
    if (imageFile != null) {
      request.files.add(await http.MultipartFile.fromPath('image', imageFile.path));
    }

    final response = await request.send();
    final responseBody = await response.stream.bytesToString();

    if (response.statusCode == 200) {
      final jsonResponse = jsonDecode(responseBody);
      final templeJson = jsonResponse['data']['temple'] ?? jsonResponse['data'];
      return Temple.fromJson(templeJson);
    } else if (response.statusCode == 401) {
      throw Exception('Session expired, please login again');
    } else {
      throw Exception("Failed to update temple: ${response.statusCode}");
    }
  }
}
