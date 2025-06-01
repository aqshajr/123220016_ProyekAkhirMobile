import 'dart:convert';
import 'dart:io';
import 'package:artefacto/model/artifact_model.dart';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class ArtifactService {
  static const baseUrl = "https://artefacto-backend-749281711221.us-central1.run.app/api/artifacts";

  static Future<Map<String, String>> _getHeaders() async {
    final token = await AuthService().getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  static Future<List<Artifact>> getArtifacts() async {
    final headers = await _getHeaders();
    final response = await http.get(Uri.parse(baseUrl), headers: headers);

    if (response.statusCode == 200) {
      final jsonBody = jsonDecode(response.body);
      final artifactsJson = jsonBody['data']['artifacts'] as List;
      return artifactsJson.map((json) => Artifact.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load artifacts: ${response.statusCode}');
    }
  }

  static Future<Artifact> getArtifactById(int id) async {
    final headers = await _getHeaders();
    final response = await http.get(Uri.parse("$baseUrl/$id"), headers: headers);

    if (response.statusCode == 200) {
      final jsonBody = jsonDecode(response.body);
      final artifactJson = jsonBody['data']['artifact'];
      return Artifact.fromJson(artifactJson);
    } else {
      throw Exception('Failed to get artifact: ${response.statusCode}');
    }
  }

  static Future<Artifact> createArtifact(ArtifactRequest request) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse(baseUrl),
      headers: headers,
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 201) {
      final jsonBody = jsonDecode(response.body);
      final artifactJson = jsonBody['data']['artifact'];
      return Artifact.fromJson(artifactJson);
    } else {
      throw Exception('Failed to create artifact: ${response.statusCode}');
    }
  }

  static Future<Artifact> updateArtifactWithImage(Artifact artifact, File? imageFile) async {
    final headers = await _getHeaders();
    final uri = Uri.parse("$baseUrl/${artifact.artifactID}");
    final request = http.MultipartRequest('PUT', uri);

    request.headers.addAll(headers);

    request.fields['templeID'] = artifact.templeID.toString();
    request.fields['title'] = artifact.title;
    request.fields['description'] = artifact.description;

    if (artifact.detailPeriod != null) request.fields['detailPeriod'] = artifact.detailPeriod!;
    if (artifact.detailMaterial != null) request.fields['detailMaterial'] = artifact.detailMaterial!;
    if (artifact.detailSize != null) request.fields['detailSize'] = artifact.detailSize!;
    if (artifact.detailStyle != null) request.fields['detailStyle'] = artifact.detailStyle!;
    if (artifact.funfactTitle != null) request.fields['funfactTitle'] = artifact.funfactTitle!;
    if (artifact.funfactDescription != null) request.fields['funfactDescription'] = artifact.funfactDescription!;
    if (artifact.locationUrl != null) request.fields['locationUrl'] = artifact.locationUrl!;

    if (imageFile != null) {
      request.files.add(await http.MultipartFile.fromPath('image', imageFile.path));
    }

    final response = await request.send();
    final responseBody = await response.stream.bytesToString();

    if (response.statusCode == 200) {
      return Artifact.fromJson(jsonDecode(responseBody));
    } else {
      throw Exception('Failed to update artifact: ${response.statusCode}');
    }
  }

  static Future<void> deleteArtifact(int id) async {
    final headers = await _getHeaders();
    final response = await http.delete(Uri.parse("$baseUrl/$id"), headers: headers);

    if (response.statusCode != 200) {
      throw Exception('Failed to delete artifact: ${response.statusCode}');
    }
  }
}
