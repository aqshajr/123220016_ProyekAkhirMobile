import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class CurrencyConverterPage extends StatefulWidget {
  final double? initialAmount;
  // initialFromCurrency tidak lagi terlalu relevan jika selalu IDR,
  // tapi kita biarkan untuk kompatibilitas jika dipanggil dari tempat lain
  final String? initialFromCurrency;

  const CurrencyConverterPage({
    super.key,
    this.initialAmount,
    this.initialFromCurrency = 'IDR', // Default ke IDR
  });

  @override
  State<CurrencyConverterPage> createState() => _CurrencyConverterPageState();
}

class _CurrencyConverterPageState extends State<CurrencyConverterPage> {
  late TextEditingController _amountController;
  final String _fromCurrency = 'IDR'; // Hardcode ke IDR
  String? _toCurrency; // Akan dipilih pengguna
  double _convertedAmount = 0.0;
  bool _isLoading = false;
  String? _errorMessage;
  bool _lastConversionSuccessful = false; // Flag baru

  final List<String> _currencies = [
    'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', /*'IDR',*/ 'SGD',
    'MYR' // IDR dihilangkan dari pilihan tujuan jika asal sudah IDR
  ];

  final Map<String, String> _currencyNames = {
    'USD': 'Dolar Amerika',
    'EUR': 'Euro',
    'JPY': 'Yen Jepang',
    'GBP': 'Pound Sterling Inggris',
    'AUD': 'Dolar Australia',
    'CAD': 'Dolar Kanada',
    'CHF': 'Franc Swiss',
    'CNY': 'Yuan Tiongkok',
    'IDR': 'Rupiah Indonesia', // Untuk tampilan "Dari Mata Uang"
    'SGD': 'Dolar Singapura',
    'MYR': 'Ringgit Malaysia',
  };

  @override
  void initState() {
    super.initState();
    _amountController = TextEditingController(
        text: widget.initialAmount?.toStringAsFixed(0) ?? '');
    // Pilih _toCurrency default yang bukan IDR
    _toCurrency = _currencies.isNotEmpty ? _currencies.first : null;
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _convertCurrency() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _convertedAmount = 0.0;
      _lastConversionSuccessful = false; // Reset flag
    });

    if (_amountController.text.isEmpty || _toCurrency == null) {
      setState(() {
        _errorMessage = 'Pastikan jumlah dan mata uang tujuan dipilih.';
        _isLoading = false;
      });
      return;
    }

    final double? amount =
        double.tryParse(_amountController.text.replaceAll(',', '.'));
    if (amount == null || amount < 0) {
      setState(() {
        _errorMessage = 'Jumlah tidak valid (harus angka positif atau 0).';
        _isLoading = false;
      });
      return;
    }

    if (amount == 0) {
      setState(() {
        _convertedAmount = 0.0;
        _isLoading = false;
        _lastConversionSuccessful = true;
      });
      return;
    }

    try {
      final String apiUrl =
          'https://api.frankfurter.app/latest?amount=$amount&from=$_fromCurrency&to=$_toCurrency';

      final response = await http.get(Uri.parse(apiUrl));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['rates'] != null && data['rates'][_toCurrency] != null) {
          setState(() {
            _convertedAmount = data['rates'][_toCurrency].toDouble();
            _lastConversionSuccessful = true;
          });
        } else {
          throw Exception(
              'Gagal mendapatkan nilai tukar. Periksa pasangan mata uang.');
        }
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['message'] ??
            'Gagal memuat data: Server error ${response.statusCode}');
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    bool isAmountReadOnly = widget.initialAmount != null;

    return WillPopScope(
      onWillPop: () async {
        if (_lastConversionSuccessful && _toCurrency != null) {
          Navigator.pop(context, {
            'amount': _convertedAmount,
            'currency': _toCurrency,
          });
          return false;
        }
        return true;
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text('Konversi Mata Uang',
              style: GoogleFonts.poppins()), // Judul AppBar disederhanakan
          backgroundColor: const Color(0xff233743),
          foregroundColor: Colors.white,
          iconTheme: const IconThemeData(color: Colors.white),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // --- Input Section wrapped in a Card-like Container ---
              Container(
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.15),
                      spreadRadius: 1,
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Konversi dari Rupiah Indonesia (IDR)',
                      style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xff233743)),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _amountController,
                      readOnly: isAmountReadOnly,
                      style: GoogleFonts.poppins(
                          fontSize: 18,
                          color: isAmountReadOnly
                              ? Colors.black54
                              : Colors.black87),
                      decoration: InputDecoration(
                        labelText: 'Jumlah (IDR)',
                        labelStyle:
                            GoogleFonts.poppins(color: const Color(0xff233743)),
                        prefixIcon: const Icon(Icons.calculate_outlined,
                            color: Color(0xff233743)),
                        filled: isAmountReadOnly,
                        fillColor: isAmountReadOnly
                            ? Colors.grey[200]
                            : Colors.transparent,
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8.0)),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8.0),
                          borderSide: const BorderSide(
                              color: Color(0xffB69574), width: 2),
                        ),
                      ),
                      keyboardType:
                          const TextInputType.numberWithOptions(decimal: true),
                      onChanged: (value) {
                        if (!isAmountReadOnly) {
                          setState(() {
                            _lastConversionSuccessful = false;
                            _errorMessage = null;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 16),
                    _buildCurrencyDropdown(
                      label: 'Konversi ke Mata Uang',
                      value: _toCurrency,
                      onChanged: (newValue) {
                        setState(() {
                          _toCurrency = newValue;
                          _lastConversionSuccessful = false;
                          _errorMessage = null;
                        });
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
              ElevatedButton.icon(
                icon: _isLoading
                    ? Container(
                        width: 20,
                        height: 20,
                        margin: const EdgeInsets.only(right: 8),
                        child: const CircularProgressIndicator(
                            strokeWidth: 3, color: Colors.white))
                    : const Icon(Icons.swap_horiz, color: Colors.white),
                label: Text(
                  _isLoading ? 'Mengonversi...' : 'Konversi',
                  style: GoogleFonts.poppins(
                      fontSize: 16,
                      color: Colors.white,
                      fontWeight: FontWeight.w600),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xffB69574),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  elevation: 3,
                ),
                onPressed: _isLoading ? null : _convertCurrency,
              ),
              const SizedBox(height: 24),
              _buildResultSection(),
              const SizedBox(height: 20), // Bottom padding
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResultSection() {
    if (_errorMessage != null) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
            color: Colors.red.shade50,
            borderRadius: BorderRadius.circular(8.0),
            border: Border.all(color: Colors.red.shade200)),
        child: Text(
          'Error: $_errorMessage',
          style: GoogleFonts.poppins(
              color: Colors.red.shade700,
              fontSize: 14,
              fontWeight: FontWeight.w500),
          textAlign: TextAlign.center,
        ),
      );
    }
    if (_lastConversionSuccessful) {
      return Container(
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
            color: Colors.green.shade50,
            borderRadius: BorderRadius.circular(8.0),
            border: Border.all(color: Colors.green.shade200)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              'Hasil Konversi:',
              style: GoogleFonts.poppins(
                  fontSize: 16,
                  color: Colors.green.shade800,
                  fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),
            Text(
              _convertedAmount.toStringAsFixed(2),
              style: GoogleFonts.poppins(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Colors.green.shade900,
              ),
            ),
            Text(
              '${_currencyNames[_toCurrency ?? ''] ?? (_toCurrency ?? '')} (${_toCurrency ?? ''})',
              style: GoogleFonts.poppins(
                  fontSize: 16, color: Colors.green.shade800),
            ),
          ],
        ),
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildCurrencyDropdown({
    required String label,
    required String? value,
    required ValueChanged<String?> onChanged,
  }) {
    return DropdownButtonFormField<String>(
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.poppins(color: const Color(0xff233743)),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8.0)),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
          borderSide: const BorderSide(color: Color(0xffB69574), width: 2),
        ),
      ),
      value: value,
      isExpanded: true,
      dropdownColor: Colors.white,
      icon: const Icon(Icons.arrow_drop_down_rounded,
          size: 28, color: Color(0xff233743)),
      items: _currencies.map<DropdownMenuItem<String>>((String code) {
        return DropdownMenuItem<String>(
          value: code,
          child: Text('${_currencyNames[code] ?? code} ($code)',
              style: GoogleFonts.poppins(color: Colors.black87)),
        );
      }).toList(),
      onChanged: onChanged,
      validator: (value) => value == null ? 'Pilih mata uang' : null,
      style: GoogleFonts.poppins(color: Colors.black87),
    );
  }
}
