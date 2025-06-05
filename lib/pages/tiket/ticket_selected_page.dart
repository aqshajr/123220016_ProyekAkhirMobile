import 'package:artefacto/model/temple_model.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
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

  @override
  void initState() {
    super.initState();
    _fetchTickets();
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
      // Batas deskripsi lebih pendek lagi
      description = '${description.substring(0, 72)}...';
    }

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => TicketPurchasePage(ticket: ticket),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 12.0),
        decoration: BoxDecoration(
          color: Colors.white, // Latar belakang utama kartu
          borderRadius:
              BorderRadius.circular(12.0), // Border radius lebih besar sedikit
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
                // Bagian Kiri (Konten Utama)
                Expanded(
                  flex: 10, // Proporsi lebih besar untuk konten
                  child: Padding(
                    padding: const EdgeInsets.all(16.0), // Padding seragam
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          ticket.temple?.templeName ?? 'Tiket Wisata',
                          style: GoogleFonts.poppins(
                            fontSize:
                                18, // Ukuran font judul sedikit lebih besar
                            fontWeight: FontWeight.w700, // Lebih tebal
                            color: const Color(0xff233743),
                            letterSpacing: 0.3,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          description,
                          style: GoogleFonts.poppins(
                            fontSize: 13, // Ukuran font deskripsi
                            color: Colors.black.withOpacity(0.65),
                            height: 1.45,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(
                            height:
                                16), // Jarak lebih besar antara deskripsi dan harga
                        Text(
                          'Rp$priceFormatted',
                          style: GoogleFonts.poppins(
                            fontSize: 19, // Ukuran font harga lebih besar
                            fontWeight: FontWeight.bold,
                            color: const Color(0xffB69574),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // Bagian Kanan ("Stub" Tiket)
                Expanded(
                  flex: 3, // Proporsi lebih kecil untuk stub
                  child: Container(
                    color: const Color(
                        0xffB69574), // Warna latar stub menggunakan warna aksen
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.arrow_forward_ios_rounded,
                          color:
                              Colors.white, // Ikon putih kontras dengan latar
                          size: 24,
                        ),
                        const SizedBox(height: 5),
                        Text(
                          'BELI', // Teks diubah menjadi "BELI" atau "PILIH"
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            fontWeight: FontWeight.bold, // Lebih tebal
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
        elevation: 2.0, // Sedikit shadow pada AppBar
      ),
      backgroundColor: const Color(0xfff0f2f5),
      body: _isLoading
          ? Center(
              child: CircularProgressIndicator(color: const Color(0xffB69574)))
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
                ))
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(
                      vertical: 12.0,
                      horizontal: 4.0), // Padding list sedikit disesuaikan
                  itemCount: _tickets.length,
                  itemBuilder: (_, i) => _buildTicketItem(_tickets[i]),
                ),
    );
  }
}
