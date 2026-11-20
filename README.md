# AniLayer

AniLayer adalah aplikasi pendamping desktop untuk Windows yang menampilkan animasi sebagai jendela transparan yang selalu berada di atas jendela lain. Aplikasi dibuat dengan Electron dan mendukung beberapa companion sekaligus.

## Fitur

- **Companion desktop transparan** — jendela tanpa bingkai, selalu di atas, dapat digeser bebas, dan dapat dibalik arahnya.
- **Multi-companion** — buat beberapa jendela independen; media, posisi, ukuran, arah, opacity, dan mode click-through disimpan otomatis.
- **Store & Search Hub** — tampilkan preset lokal, cari stiker/animasi melalui Tenor, telusuri kategori, dan pilih animasi acak. Hasil pencarian memerlukan koneksi internet.
- **Media kustom** — pilih atau seret file lokal, atau masukkan URL media langsung. Format yang didukung: GIF, WebP, PNG, MP4, dan WebM.
- **Kontrol companion** — ubah ukuran dan opacity, aktifkan Ghost Mode (click-through), hapus latar putih (chroma key), ganti media, atau tutup companion.
- **System Tray** — buka Hub, buat companion, tampilkan/sembunyikan semua companion, atau keluar dari aplikasi.
- **Penyimpanan state lokal** — posisi dan preferensi companion aktif dicatat di konfigurasi lokal. Companion yang ditutup akan dihapus dan tidak dipulihkan saat aplikasi dimulai ulang.

> Hasil pencarian dan media yang dimuat dari URL disediakan oleh layanan/pemiliknya masing-masing. Ketersediaan, ketentuan penggunaan, dan hak atas media tersebut tidak dikendalikan oleh AniLayer.

## Persyaratan

- Windows 10 atau lebih baru.
- Node.js 22.12 atau lebih baru dan npm untuk menjalankan dari source.

## Menjalankan dari source

```powershell
git clone https://github.com/calestinfisalia/anilayer.git
cd anilayer
npm ci
npm start
```

Untuk membuat aplikasi Windows portable:

```powershell
npm run build
```

Hasil build tersedia di direktori `dist/`. Dependensi Electron dan electron-builder dipasang melalui `npm ci`.

## Data dan privasi

Pengaturan companion disimpan secara lokal pada berkas `anilayer-config.json` di direktori `userData` Electron. Pencarian online mengirimkan istilah pencarian ke Tenor. AniLayer tidak menyediakan akun pengguna atau server backend sendiri.

## Kontribusi

Laporan bug, usulan fitur, dan pull request sangat diterima. Baca [CONTRIBUTING.md](CONTRIBUTING.md) sebelum berkontribusi dan ikuti [Code of Conduct](CODE_OF_CONDUCT.md).

## Lisensi

Kode sumber AniLayer dilisensikan di bawah **GNU General Public License v3.0 atau versi yang lebih baru**. Lihat [LICENSE](LICENSE).

Media di `assets/presets/` dapat memiliki hak atau ketentuan lisensi tersendiri dan tidak otomatis dilisensikan di bawah GPL. Lihat [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) sebelum menggunakan atau mendistribusikan ulang media. Lisensi kode tidak menggantikan izin yang diperlukan atas karya visual.

## Keamanan

Untuk melaporkan kerentanan secara privat, ikuti petunjuk di [SECURITY.md](SECURITY.md).
