import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:artefacto/model/tiket_model.dart';
import 'package:artefacto/service/tiket_service.dart';
import 'buy_tiket.dart';

class TicketSelectionPage extends StatefulWidget {
  @override
  State<TicketSelectionPage> createState() => _TicketSelectionPageState();
}

class _TicketSelectionPageState extends State<TicketSelectionPage> {
  List<Ticket> _tickets = [];
  bool _isLoading = false;
  String _message = '';

  @override
  void initState() {
    super.initState();
    _fetchTickets();
  }

  Future<void> _fetchTickets() async {
    setState(() {
      _isLoading = true;
      _message = '';
    });

    try {
      final response = await TicketService.getTickets();
      if (response.status == 'sukses') {
        setState(() {
          _tickets = response.data?.tickets ?? [];
        });
      } else {
        setState(() => _message = response.message ?? 'Gagal memuat tiket');
      }
    } catch (e) {
      setState(() => _message = 'Terjadi kesalahan: ${e.toString()}');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Widget _buildTicketItem(Ticket ticket) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        title: Text(ticket.temple?.templeName ?? 'Tiket Wisata'),
        subtitle: Text(
            'Harga: Rp${NumberFormat('#,##0').format(ticket.price ?? 0)}\nLokasi: ${ticket.temple?.location ?? '-'}'),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => TicketPurchasePage(ticket: ticket),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pilih Tiket'),
        backgroundColor: Colors.white,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _tickets.isEmpty
          ? Center(child: Text(_message))
          : ListView.builder(
        itemCount: _tickets.length,
        itemBuilder: (_, i) => _buildTicketItem(_tickets[i]),
      ),
    );
  }
}
