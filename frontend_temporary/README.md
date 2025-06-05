# Artefacto - Aplikasi Jelajah Warisan Budaya Indonesia

Artefacto adalah aplikasi web yang memungkinkan pengguna untuk menjelajahi dan mempelajari warisan budaya Indonesia, khususnya candi dan artefak bersejarah.

## 🌟 Fitur Utama

### Untuk Pengunjung
- 🏛️ Jelajahi informasi lengkap tentang candi-candi bersejarah
- 📱 Pindai QR code untuk mendapatkan informasi detail tentang artefak
- 🎫 Beli tiket masuk candi secara online
- 📑 Simpan candi favorit di bookmark
- 👤 Kelola profil dan riwayat kunjungan

### Untuk Admin
- ✏️ Kelola data candi (tambah, edit, hapus)
- 📦 Kelola data artefak
- 🎟️ Atur tiket dan harga
- 💰 Pantau transaksi

## 🚀 Cara Menjalankan Aplikasi

### Persyaratan
- Node.js versi 14 atau lebih baru
- NPM atau Yarn

### Langkah-langkah Instalasi
1. Clone repository ini
   ```bash
   git clone [URL_REPOSITORY]
   ```

2. Masuk ke direktori proyek
   ```bash
   cd artefacto_frontend
   ```

3. Install dependencies
   ```bash
   npm install
   # atau
   yarn install
   ```

4. Jalankan aplikasi dalam mode development
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

5. Buka browser dan akses `http://localhost:5173`

## 🛠️ Teknologi yang Digunakan

- **React** - Library JavaScript untuk membangun antarmuka pengguna
- **Vite** - Build tool yang cepat untuk development
- **React Router** - Untuk navigasi antar halaman
- **Tailwind CSS** - Framework CSS untuk styling
- **Lucide Icons** - Untuk icon-icon yang digunakan
- **JWT** - Untuk autentikasi pengguna

## 📱 Halaman-halaman Aplikasi

### Halaman Publik
- **Onboarding** - Pengenalan fitur aplikasi
- **Login** - Masuk ke akun
- **Register** - Daftar akun baru

### Halaman Pengguna
- **Beranda** - Tampilan utama setelah login
- **Daftar Candi** - Lihat semua candi
- **Detail Candi** - Informasi lengkap tentang candi
- **Pemindai QR** - Scan artefak
- **Tiket** - Beli dan lihat tiket
- **Profil** - Pengaturan akun

### Halaman Admin
- **Dashboard Admin** - Kontrol panel utama
- **Manajemen Candi** - Kelola data candi
- **Manajemen Artefak** - Kelola data artefak
- **Manajemen Tiket** - Kelola tiket
- **Transaksi** - Lihat riwayat transaksi
