import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:artefacto/model/tiket_model.dart';

import 'auth_service.dart';

class TicketService {
  static const url = "https://artefacto-backend-749281711221.us-central1.run.app/api/tickets";

  // Mendapatkan headers dengan token
  static Future<Map<String, String>> _getHeaders() async {
    final token = await AuthService().getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // Get all tickets
  static Future<TicketResponse> getTickets() async {
    final headers = await _getHeaders();
    final response = await http.get(Uri.parse(url), headers: headers);

    if (response.statusCode == 200) {
      return TicketResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load tickets: ${response.statusCode}');
    }
  }

  // Create a new ticket
  static Future<TicketResponse> createTicket(TicketRequest ticketRequest) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse(url),
      headers: headers,
      body: jsonEncode(ticketRequest.toJson()),
    );

    if (response.statusCode == 201) {
      return TicketResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create ticket: ${response.statusCode}');
    }
  }

  // Delete a ticket by ID
  static Future<TicketResponse> deleteTicket(int id) async {
    final headers = await _getHeaders();
    final response = await http.delete(Uri.parse("$url/$id"), headers: headers);

    if (response.statusCode == 200) {
      return TicketResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to delete ticket: ${response.statusCode}');
    }
  }

  // Get ticket by ID
  static Future<TicketResponse> getTicketById(int id) async {
    final headers = await _getHeaders();
    final response = await http.get(Uri.parse("$url/$id"), headers: headers);

    if (response.statusCode == 200) {
      return TicketResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to get ticket: ${response.statusCode}');
    }
  }

  // Update ticket
  static Future<TicketResponse> updateTicket(int ticketId, TicketRequest ticketRequest) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse("$url/$ticketId"),
      headers: headers,
      body: jsonEncode(ticketRequest.toJson()),
    );

    if (response.statusCode == 200) {
      return TicketResponse.fromJson(jsonDecode(response.body));
    } else if (response.statusCode == 400) {
      // response error validasi, parse errors
      return TicketResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception("Failed to update ticket: ${response.statusCode}");
    }
  }
}
