import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:artefacto/model/tiket_model.dart';
import 'package:artefacto/model/transaction_model.dart';
import 'package:artefacto/service/transaksi_service.dart';
import 'package:artefacto/pages/menu/currency_converter_page.dart';
import 'package:google_fonts/google_fonts.dart';

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

  // State untuk menyimpan hasil konversi terakhir
  double? _lastConvertedAmount;
  String? _lastConvertedCurrencyCode;
  final Map<String, String> _currencyNames = {
    // Salin dari CurrencyConverterPage untuk display
    'USD': 'Dolar Amerika',
    'EUR': 'Euro',
    'JPY': 'Yen Jepang',
    'GBP': 'Pound Sterling',
    'AUD': 'Dolar Australia',
    'CAD': 'Dolar Kanada',
    'CHF': 'Franc Swiss',
    'CNY': 'Yuan Tiongkok',
    'IDR': 'Rupiah Indonesia',
    'SGD': 'Dolar Singapura',
    'MYR': 'Ringgit Malaysia',
  };

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
      builder: (context, child) {
        // Optional: Themeing the date picker
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xffB69574), // header background color
              onPrimary: Colors.white, // header text color
              onSurface: Color(0xff233743), // body text color
            ),
            textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(
                foregroundColor: const Color(0xffB69574), // button text color
              ),
            ),
          ),
          child: child!,
        );
      },
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
            content: Text(response.message ?? 'Transaksi berhasil',
                style: GoogleFonts.poppins()),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
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
      SnackBar(
        content: Text(message, style: GoogleFonts.poppins()),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ticket = widget.ticket;
    final priceFormatted =
        NumberFormat('#,##0', 'id_ID').format(ticket.price ?? 0);

    // Bangun teks harga dengan tambahan hasil konversi jika ada
    String displayPrice = 'Rp $priceFormatted';
    if (_lastConvertedAmount != null && _lastConvertedCurrencyCode != null) {
      String convertedAmountFormatted =
          _lastConvertedAmount!.toStringAsFixed(2);
      displayPrice +=
          ' ≈ $convertedAmountFormatted $_lastConvertedCurrencyCode';
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Pembelian Tiket', style: GoogleFonts.poppins()),
        backgroundColor: const Color(0xff233743),
        foregroundColor: Colors.white,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0), // Increased padding
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              // --- Ticket Info Section ---
              Container(
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.15),
                      spreadRadius: 2,
                      blurRadius: 5,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ticket.temple?.templeName ?? 'Tiket Wisata',
                      style: GoogleFonts.poppins(
                        fontSize: 22, // Slightly larger title
                        fontWeight: FontWeight.bold,
                        color: const Color(0xff233743),
                      ),
                    ),
                    if (ticket.description != null &&
                        ticket.description!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(
                        ticket.description!,
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          color: Colors.black87,
                          height: 1.5, // Improved line height
                        ),
                        textAlign: TextAlign.justify,
                      ),
                    ],
                    const SizedBox(height: 12),
                    Text(
                      displayPrice,
                      style: GoogleFonts.poppins(
                          fontSize: 17,
                          fontWeight: FontWeight.w500,
                          color: const Color(
                              0xffB69574)), // Accent color for price
                    ),
                    const SizedBox(height: 4),
                    Align(
                      // Align to the right or left as preferred
                      alignment: Alignment.centerLeft,
                      child: TextButton.icon(
                        icon: const Icon(Icons.sync_alt,
                            color: Color(0xff233743), size: 18),
                        label: Text('Konversi Mata Uang',
                            style: GoogleFonts.poppins(
                                color: const Color(0xff233743),
                                fontSize: 13,
                                fontWeight: FontWeight.w500)),
                        onPressed: () async {
                          final result = await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => CurrencyConverterPage(
                                initialAmount: ticket.price,
                              ),
                            ),
                          );
                          if (result != null &&
                              result is Map<String, dynamic>) {
                            setState(() {
                              _lastConvertedAmount =
                                  result['amount'] as double?;
                              _lastConvertedCurrencyCode =
                                  result['currency'] as String?;
                            });
                          }
                        },
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24), // Space before form fields

              // --- Form Fields Section ---
              TextFormField(
                controller: _dateController,
                decoration: InputDecoration(
                  labelText: 'Tanggal Kunjungan',
                  labelStyle:
                      GoogleFonts.poppins(color: const Color(0xff233743)),
                  hintText: 'Pilih tanggal',
                  hintStyle: GoogleFonts.poppins(),
                  prefixIcon: const Icon(Icons.calendar_today,
                      color: Color(0xff233743)),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.0)),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8.0),
                    borderSide:
                        const BorderSide(color: Color(0xffB69574), width: 2),
                  ),
                ),
                style: GoogleFonts.poppins(),
                readOnly: true,
                onTap: () => _selectDate(context),
                validator: (value) => value == null || value.isEmpty
                    ? 'Pilih tanggal kunjungan'
                    : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _quantityController,
                decoration: InputDecoration(
                  labelText: 'Jumlah Tiket',
                  labelStyle:
                      GoogleFonts.poppins(color: const Color(0xff233743)),
                  hintText: 'Minimal 1',
                  hintStyle: GoogleFonts.poppins(),
                  prefixIcon: const Icon(Icons.confirmation_number_outlined,
                      color: Color(0xff233743)),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.0)),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8.0),
                    borderSide:
                        const BorderSide(color: Color(0xffB69574), width: 2),
                  ),
                ),
                style: GoogleFonts.poppins(),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty)
                    return 'Masukkan jumlah tiket';
                  final n = int.tryParse(value);
                  if (n == null) return 'Format jumlah tidak valid';
                  if (n < 1) return 'Minimal 1 tiket';
                  return null;
                },
              ),

              const SizedBox(height: 30), // Space before purchase button

              // --- Purchase Button ---
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: _isLoading
                      ? Container(
                          width: 20,
                          height: 20,
                          margin: const EdgeInsets.only(right: 8),
                          child: const CircularProgressIndicator(
                              strokeWidth: 3, color: Colors.white))
                      : const Icon(Icons.shopping_cart_checkout,
                          color: Colors.white),
                  label: Text(
                    _isLoading ? 'Memproses...' : 'Beli Tiket',
                    style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xffB69574), // Accent color
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    elevation: 3,
                  ),
                  onPressed: _isLoading ? null : _processPurchase,
                ),
              ),

              if (_message.isNotEmpty) ...[
                const SizedBox(height: 16),
                Text(
                  _message,
                  style: GoogleFonts.poppins(color: Colors.red, fontSize: 14),
                  textAlign: TextAlign.center,
                ),
              ],
              const SizedBox(height: 20), // Bottom padding
            ],
          ),
        ),
      ),
    );
  }
}
