import 'package:artefacto/model/temple_model.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz;
import 'package:artefacto/model/tiket_model.dart';
import 'package:artefacto/service/tiket_service.dart';
import 'package:google_fonts/google_fonts.dart';
import 'buy_tiket.dart';

class TicketSelectionPage extends StatefulWidget {
  const TicketSelectionPage({super.key});

  @override
  State<TicketSelectionPage> createState() => _TicketSelectionPageState();
}

class _TicketSelectionPageState extends State<TicketSelectionPage> {
  List<Ticket> _tickets = [];
  bool _isLoading = true;
  String _message = '';
  String _selectedTimezone = 'Asia/Jakarta'; // Default ke WIB
  bool _isWithinServiceHours = true;

  // Daftar timezone yang sering digunakan
  final List<Map<String, String>> _timezones = [
    {'id': 'Asia/Jakarta', 'label': 'WIB'},
    {'id': 'Asia/Makassar', 'label': 'WITA'},
    {'id': 'Asia/Jayapura', 'label': 'WIT'},
    {'id': 'Asia/Singapore', 'label': 'Singapore'},
    {'id': 'Asia/Tokyo', 'label': 'Japan'},
    {'id': 'Australia/Sydney', 'label': 'Sydney'},
    {'id': 'Europe/London', 'label': 'London'},
    {'id': 'America/New_York', 'label': 'New York'},
  ];

  @override
  void initState() {
    super.initState();
    tz.initializeTimeZones();
    _fetchTickets();
    _checkServiceHours();
  }

  void _checkServiceHours() {
    final jakartaTime = tz.TZDateTime.now(tz.getLocation('Asia/Jakarta'));
    final hour = jakartaTime.hour;
    setState(() {
      _isWithinServiceHours = hour >= 8 && hour < 17;
    });
  }

  String _convertServiceHours(String timezone) {
    final jakarta = tz.getLocation('Asia/Jakarta');
    final targetZone = tz.getLocation(timezone);

    // Konversi jam buka (08:00 WIB)
    final openTime = tz.TZDateTime(jakarta, DateTime.now().year,
        DateTime.now().month, DateTime.now().day, 8, 0);
    final openTimeConverted = tz.TZDateTime.from(openTime, targetZone);

    // Konversi jam tutup (17:00 WIB)
    final closeTime = tz.TZDateTime(jakarta, DateTime.now().year,
        DateTime.now().month, DateTime.now().day, 17, 0);
    final closeTimeConverted = tz.TZDateTime.from(closeTime, targetZone);

    return '${openTimeConverted.hour.toString().padLeft(2, '0')}:00 - '
        '${closeTimeConverted.hour.toString().padLeft(2, '0')}:00';
  }

  Widget _buildServiceHoursCard() {
    final selectedLabel =
        _timezones.firstWhere((tz) => tz['id'] == _selectedTimezone)['label'];

    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xff233743),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.access_time, color: Colors.white, size: 24),
                const SizedBox(width: 12),
                Text(
                  'Jam Layanan Tiket Online',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Waktu Layanan: 08:00 - 17:00 WIB',
                  style: GoogleFonts.poppins(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Di zonamu ($selectedLabel): ${_convertServiceHours(_selectedTimezone)}',
                  style: GoogleFonts.poppins(
                    fontSize: 15,
                    color: const Color(0xffB69574),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: _selectedTimezone,
                  decoration: InputDecoration(
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                  ),
                  items: _timezones.map((tz) {
                    return DropdownMenuItem(
                      value: tz['id'],
                      child: Text(
                        '${tz['label']}',
                        style: GoogleFonts.poppins(fontSize: 14),
                      ),
                    );
                  }).toList(),
                  onChanged: (value) {
                    if (value != null) {
                      setState(() {
                        _selectedTimezone = value;
                      });
                    }
                  },
                ),
                const SizedBox(height: 12),
                Text(
                  'Pembelian tiket hanya dapat dilakukan pada jam layanan untuk memastikan tiket dapat digunakan pada tanggal yang dipilih.',
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: Colors.grey[600],
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _fetchTickets() async {
    try {
      final response = await TicketService.getTickets();
      if (mounted) {
        if (response.status == 'sukses') {
          setState(() {
            _tickets = response.data?.tickets ?? [];
            if (_tickets.isEmpty) {
              _message = 'Tidak ada tiket tersedia saat ini.';
            }
          });
        } else {
          setState(() => _message = response.message ?? 'Gagal memuat tiket');
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _message = 'Terjadi kesalahan: ${e.toString()}');
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Widget _buildTicketItem(Ticket ticket) {
    final priceFormatted =
        NumberFormat('#,##0', 'id_ID').format(ticket.price ?? 0);
    String description = ticket.description ??
        'Informasi detail tiket akan ditampilkan di halaman selanjutnya.';
    if (description.length > 75) {
      description = '${description.substring(0, 72)}...';
    }

    final bool isEnabled = _isWithinServiceHours;
    final Color cardColor = isEnabled ? Colors.white : Colors.grey[200]!;
    final Color textColor =
        isEnabled ? const Color(0xff233743) : Colors.grey[600]!;
    final Color priceColor =
        isEnabled ? const Color(0xffB69574) : Colors.grey[500]!;
    final Color stubColor =
        isEnabled ? const Color(0xffB69574) : Colors.grey[400]!;

    return GestureDetector(
      onTap: isEnabled
          ? () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => TicketPurchasePage(ticket: ticket),
                ),
              );
            }
          : null,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 12.0),
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(12.0),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              spreadRadius: 2,
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12.0),
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  flex: 10,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          ticket.temple?.templeName ?? 'Tiket Wisata',
                          style: GoogleFonts.poppins(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: textColor,
                            letterSpacing: 0.3,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          description,
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            color: textColor.withOpacity(0.8),
                            height: 1.45,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Rp$priceFormatted',
                          style: GoogleFonts.poppins(
                            fontSize: 19,
                            fontWeight: FontWeight.bold,
                            color: priceColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Expanded(
                  flex: 3,
                  child: Container(
                    color: stubColor,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.arrow_forward_ios_rounded,
                          color: Colors.white,
                          size: 24,
                        ),
                        const SizedBox(height: 5),
                        Text(
                          'BELI',
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Pilih Tiket',
            style: GoogleFonts.poppins(
                color: Colors.white, fontWeight: FontWeight.w500)),
        backgroundColor: const Color(0xff233743),
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 2.0,
      ),
      backgroundColor: const Color(0xfff0f2f5),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xffB69574)))
          : _tickets.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Text(
                      _message.isNotEmpty
                          ? _message
                          : 'Tidak ada tiket tersedia.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                          fontSize: 16, color: Colors.grey[700]),
                    ),
                  ),
                )
              : Column(
                  children: [
                    _buildServiceHoursCard(),
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(
                            vertical: 12.0, horizontal: 4.0),
                        itemCount: _tickets.length,
                        itemBuilder: (_, i) => _buildTicketItem(_tickets[i]),
                      ),
                    ),
                  ],
                ),
    );
  }
}
