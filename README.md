# 🌱 LINAKAN - Platform Ekonomi Sirkular

**Platform yang menghubungkan limbah makanan dari IRT/Bakery/UMKM dengan peternak lokal untuk menciptakan ekonomi sirkular yang berkelanjutan.**

## 📋 Daftar Isi

1. [Ringkasan Proyek](#ringkasan-proyek)
2. [Fitur Utama](#fitur-utama)
3. [Struktur Proyek](#struktur-proyek)
4. [Panduan Pengguna](#panduan-pengguna)
5. [Teknologi](#teknologi)
6. [Cara Menggunakan](#cara-menggunakan)

## 🎯 Ringkasan Proyek

LINAKAN adalah platform ekonomi sirkular berbasis web yang memfasilitasi transaksi limbah makanan berkualitas tinggi antara:

- **Penjual (IRT/Bakery/UMKM)**: Penyedia limbah makanan dari proses produksi
- **Peternak**: Pembeli limbah untuk pakan ternak berkelanjutan
- **Admin**: Pemantau platform dan generator laporan

Platform mengimplementasikan:

- ✅ **Instant Matching Algorithm** - Menemukan peternak terbaik secara otomatis (85%+ compatibility)
- ✅ **Shelf-Life Management** - Tracking masa berlaku untuk setiap kategori limbah (1-14 hari)
- ✅ **Dynamic Pricing Engine** - Perhitungan harga berdasarkan berat dan kategori dengan multiplier
- ✅ **E-Wallet Revenue Model** - Sistem pembayaran digital dengan fee platform 5%
- ✅ **Geographic Matching** - Perhitungan jarak (max 15km) menggunakan Haversine formula

## ✨ Fitur Utama

### Untuk Peternak 🌾

- **Dashboard Instant Match**: Tampilkan limbah yang 85%+ compatible secara instant
- **Marketplace**: Browse semua limbah tersedia dengan filter kategori, harga, shelf-life
- **Listing Detail**: Lihat kompatibilitas detail, info penjual, dan checkout instant
- **Wallet**: Top-up saldo, riwayat transaksi, permintaan penarikan dana
- **Transaction History**: Pantau semua pembelian dan status transaksi

### Untuk Penjual 🏪

- **Dashboard Penjual**: Statistik listing aktif, berat tersedia, pendapatan
- **Create Listing**: Form lengkap dengan real-time price recommendation
- **Listings Management**: Lihat, edit, hapus semua limbah yang diposting
- **Transaction History**: Riwayat penjualan dan pending earnings
- **Price Override**: Harga custom dengan validasi ±50% dari rekomendasi

### Untuk Admin 👨‍💼

- **KPI Dashboard**: Statistik platform (listing aktif, waste available, matches, revenue)
- **Status Distribution**: Breakdown listing (available/reserved/completed/expired)
- **Category Analytics**: Limbah tersedia per kategori
- **Transaction Monitoring**: Tabel lengkap semua transaksi di platform
- **Listings Inventory**: Pantau semua listing dengan filter status

## 📁 Struktur Proyek

```
LINAKAN/
├── index.html                 # Landing page + role selection
├── assets/
│   ├── css/
│   │   ├── variables.css      # Design system (40+ CSS variables)
│   │   ├── base.css           # Global styles & element resets
│   │   ├── components.css     # UI components (buttons, cards, modals)
│   │   ├── layout.css         # Layout system & utilities
│   │   └── responsive.css     # Media queries & breakpoints
│   └── js/
│       ├── data.js            # DataManager - Data persistence layer
│       ├── shelf-life.js      # Shelf-life expiry calculations
│       ├── pricing.js         # Dynamic pricing engine
│       ├── matching.js        # Compatibility matching algorithm
│       ├── wallet.js          # E-wallet transactions
│       └── notifications.js   # Toast notifications
├── seller/
│   ├── dashboard.html         # Seller overview & statistics
│   ├── create-listing.html    # Form tambah limbah baru
│   ├── listings.html          # Manage all listings
│   └── transactions.html      # Sales & earnings history
├── farmer/
│   ├── dashboard.html         # Instant match interface
│   ├── marketplace.html       # Browse all waste listings
│   ├── listing-detail.html    # Full waste view + checkout
│   ├── transactions.html      # Purchase history
│   └── wallet.html            # Balance & top-up management
└── admin/
    └── dashboard.html         # Platform monitoring & KPIs
```

## 👥 Panduan Pengguna

### Landing Page (index.html)

1. Buka `index.html` di browser
2. Pilih peran: **Penjual** atau **Peternak**
3. Klik nama untuk login dengan akun demo
4. Atau klik **Admin Dashboard** untuk akses admin

### Demo Accounts

**Penjual:**

- Nama: PT Roti Sejahtera | Tipe: Bakery | Saldo: Rp 500.000
- Nama: UD Sayur Segar | Tipe: UMKM | Saldo: Rp 300.000

**Peternak:**

- Nama: Slamet Wonosobo | Ternak: Ayam, Bebek | Saldo: Rp 1.000.000
- Nama: Budi Bandung | Ternak: Sapi, Kambing | Saldo: Rp 800.000

### Alur Transaksi

**Peternak:**

1. Login → Dashboard melihat Instant Matches
2. Klik "Lihat Detail" → Lihat kompatibilitas lengkap
3. Klik "Konfirmasi & Beli" → Checkout dengan summary harga + fee
4. Konfirmasi → Transaksi selesai, listing status menjadi "reserved"
5. Wallet terupdate, history tersimpan di Transaksi

**Penjual:**

1. Login → Create Listing dengan form lengkap
2. Tentukan kategori, berat, kualitas, harga
3. Real-time price recommendation ditampilkan
4. Listing muncul di Marketplace dan ditampilkan ke compatible farmers
5. Tunggu pembelian → Lihat di Transaction History
6. Earnings dicatat di Wallet summary

**Admin:**

1. Login → Lihat KPI dashboard (total listings, weight, matches, revenue)
2. Monitor status distribution dan kategori limbah
3. Filter listings dan transaksi untuk analysis
4. Track platform health dan conversion metrics

## 🛠️ Teknologi

### Frontend Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties (variables), Grid/Flexbox, Responsive design
- **Vanilla JavaScript (ES6+)** - No frameworks, modular IIFE pattern

### Architecture

- **Modular JS Design** - 6 independent managers (Data, ShelfLife, Pricing, Matching, Wallet, Notifications)
- **LocalStorage Persistence** - All data stored locally (production would use database)
- **CSS Design System** - 40+ variables untuk consistent theming
- **Responsive Breakpoints** - Mobile (<640px), Tablet (641-1024px), Desktop (1400px+)

### Key Algorithms

1. **Matching Engine** - Weighted compatibility: category (40%) + location (40%) + capacity (20%)
2. **Shelf-Life Calculator** - Category-based expiry (1-14 days) with real-time countdown
3. **Pricing Engine** - Base price × weight multiplier × platform fee calculation
4. **Distance Calculation** - Haversine formula untuk geographic compatibility

## 🚀 Cara Menggunakan

### Setup

1. **Clone/Download** proyek ke folder lokal
2. Buka `index.html` dengan browser (Chrome, Firefox, Edge recommended)
3. Browser akan auto-initialize dummy data ke localStorage

### Navigasi

- **Navbar** di setiap halaman untuk navigasi antar section
- **Role-based routing** - Automatic redirect jika belum login
- **Breadcrumb** untuk navigasi kembali

### Testing

1. **Test Seller Flow**: Login sebagai seller → Create listing → Lihat di marketplace
2. **Test Farmer Flow**: Login sebagai farmer → Dashboard melihat instant matches → Checkout
3. **Test Admin**: Login as admin → Lihat KPI dan monitoring
4. **Test Wallet**: Top-up saldo, lihat transaction history
5. **Test Matching**: Verify compatibility scores (85%+ = instant match)

### Development Notes

- **Local Storage Keys**: linakan_sellers, linakan_farmers, linakan_listings, linakan_transactions, linakan_current_user
- **Configuration**: Edit DataManager.CONFIG untuk mengubah business rules
- **Dummy Data**: Edit DataManager.getDummy\* functions untuk mengubah test data
- **Styling**: Edit assets/css/variables.css untuk theme customization

## 📊 Business Logic

### Waste Categories

| Kategori            | Shelf-Life | Livestock              |
| ------------------- | ---------- | ---------------------- |
| Roti Kering         | 14 hari    | Ayam, Bebek, Unggas    |
| Tepung Afkir        | 14 hari    | Ayam, Bebek, Unggas    |
| Sisa Makanan Olahan | 1 hari     | Semua jenis            |
| Sayuran Mentah      | 2 hari     | Sapi, Kambing, Kelinci |

### Compatibility Scoring

- **Category Match**: 0% atau 100% (limbah cocok untuk ternak apa saja?)
- **Distance Match**: 100% di <5km, decreasing linear hingga 0% di 15km
- **Capacity Match**: 100% jika ≤50% kapasitas mingguan
- **Instant Match Threshold**: Score ≥85% = auto-highlight dengan badge ⚡

### Pricing Calculation

```
Base Price (kategori) × Weight × Multiplier (berat) = Subtotal
Subtotal + Fee (5%) = Total yang dibayar farmer
Subtotal - Fee (5%) = Earnings untuk seller
```

Weight Multipliers:

- 0-5kg: 1.0x | 5-20kg: 0.95x | 20-50kg: 0.9x | 50+kg: 0.85x

## ✅ Checklist Implementasi

### Core Features

- ✅ Role-based authentication (seller/farmer/admin)
- ✅ Instant matching algorithm dengan scoring 0-100%
- ✅ Shelf-life management untuk 4 waste categories
- ✅ Dynamic pricing dengan weight multipliers
- ✅ E-wallet dengan top-up dan penarikan
- ✅ Transaction processing dengan fee calculation
- ✅ Geographic compatibility menggunakan Haversine

### UI/UX

- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Design system dengan CSS variables
- ✅ Notification system dengan toast
- ✅ Modal untuk confirmation & forms
- ✅ Real-time data binding dari localStorage
- ✅ Form validation dengan price override

### Pages

- ✅ Landing page dengan role selection
- ✅ Seller: dashboard, create-listing, listings, transactions
- ✅ Farmer: dashboard, marketplace, listing-detail, transactions, wallet
- ✅ Admin: dashboard dengan KPI monitoring

## 📝 Lisensi

Prototype open-source untuk demonstration purposes.

---

**LINAKAN - Membangun Ekonomi Sirkular Melalui Teknologi** 🌱♻️💚
