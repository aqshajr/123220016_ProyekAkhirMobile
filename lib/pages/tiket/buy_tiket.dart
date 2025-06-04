import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:artefacto/model/tiket_model.dart';
import 'package:artefacto/model/transaction_model.dart';
import 'package:artefacto/service/transaksi_service.dart';

class TicketPurchasePage extends StatefulWidget {
  final Ticket ticket;

  const TicketPurchasePage({Key? key, required this.ticket}) : super(key: key);

  @override
  State<TicketPurchasePage> createState() => _TicketPurchasePageState();
}

class _TicketPurchasePageState extends State<TicketPurchasePage> {
  final _formKey = GlobalKey<FormState>();
  final _dateController = TextEditingController();
  final _quantityController = TextEditingController(text: '1');

  String _validDate = '';
  String _message = '';
  bool _isLoading = false;

  @override
  void dispose() {
    _dateController.dispose();
    _quantityController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (picked != null) {
      setState(() {
        _validDate = DateFormat('yyyy-MM-dd').format(picked);
        _dateController.text = _validDate;
      });
    }
  }

  Future<void> _processPurchase() async {
    if (!_formKey.currentState!.validate()) return;

    final quantity = int.tryParse(_quantityController.text) ?? 1;

    setState(() => _isLoading = true);

    try {
      final request = TransactionRequest(
        ticketId: widget.ticket.ticketID!,
        validDate: _validDate,
        quantity: quantity,
      );

      final response = await TransaksiService.createTransaction(request);

      if (response.status == 'sukses') {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.message ?? 'Transaksi berhasil'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context); // kembali ke halaman sebelumnya
      } else {
        _showError(response.message ?? 'Gagal memproses transaksi');
      }
    } catch (e) {
      _showError('Terjadi kesalahan: ${e.toString()}');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    setState(() => _message = message);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ticket = widget.ticket;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pembelian Tiket'),
        backgroundColor: Colors.white,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              Text(
                ticket.temple?.templeName ?? 'Tiket Wisata',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Harga: Rp${NumberFormat('#,##0').format(ticket.price ?? 0)}',
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _dateController,
                decoration: InputDecoration(
                  labelText: 'Tanggal Berkunjung',
                  prefixIcon: const Icon(Icons.calendar_today),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.date_range),
                    onPressed: () => _selectDate(context),
                  ),
                  border: OutlineInputBorder(),
                ),
                readOnly: true,
                validator: (val) {
                  if (val == null || val.isEmpty) return 'Tanggal wajib diisi';
                  final now = DateTime.now();
                  final inputDate = DateTime.tryParse(val);
                  if (inputDate == null) return 'Format tanggal tidak valid';
                  if (!inputDate.isAfter(now.subtract(const Duration(days: 1))))
                    return 'Tanggal harus masa depan';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _quantityController,
                decoration: const InputDecoration(
                  labelText: 'Jumlah Tiket',
                  prefixIcon: Icon(Icons.confirmation_number),
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                validator: (val) {
                  final qty = int.tryParse(val ?? '');
                  if (qty == null || qty <= 0)
                    return 'Jumlah tiket wajib diisi, minimal 1';
                  return null;
                },
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _processPurchase,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xffB69574),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child:
                _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('PROSES PEMBELIAN'),
              ),
              if (_message.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(
                    _message,
                    style: TextStyle(
                      color:
                      _message.contains("Gagal")
                          ? Colors.red
                          : Colors.green,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
