# Panduan Kontribusi

Terima kasih telah mempertimbangkan kontribusi untuk AniLayer.

## Sebelum mulai

- Untuk perubahan besar atau fitur baru, buka issue terlebih dahulu agar arah implementasi dapat dibahas.
- Periksa issue dan pull request yang sudah ada untuk menghindari pekerjaan duplikat.
- Kontribusi kode harus kompatibel dengan GPL-3.0-or-later. Untuk media atau aset visual, sertakan sumber, pemilik, dan izin/lisensi redistribusinya; jangan mengasumsikan lisensi kode mencakup aset.

## Alur kerja

1. Fork repository dan buat branch dari `main` dengan nama yang deskriptif.
2. Pasang dependensi menggunakan `npm ci`.
3. Buat perubahan sekecil mungkin dan ikuti pola JavaScript yang sudah ada.
4. Jalankan pemeriksaan yang sesuai:

   ```powershell
   npm start
   npm run build
   ```

   Pastikan aplikasi dapat dibuka dan perubahan terkait berfungsi. Proyek saat ini belum memiliki test otomatis.
5. Buat pull request ke branch `main`. Sertakan ringkasan, alasan perubahan, langkah untuk menguji, dan screenshot untuk perubahan UI bila relevan.

## Panduan pull request

- Pisahkan perubahan yang tidak berkaitan.
- Jangan sertakan `node_modules/`, hasil build `dist/`, konfigurasi lokal, kredensial, atau data pribadi.
- Jelaskan perubahan yang memengaruhi kompatibilitas, privasi, atau perilaku pengguna.
- Pastikan workflow CI berhasil sebelum meminta review.

Dengan mengirimkan kontribusi, Anda menyetujui bahwa kontribusi kode Anda dilisensikan di bawah GPL-3.0-or-later. Ketentuan tersebut tidak secara otomatis berlaku pada aset media yang Anda kirimkan; izin dan ketentuan aset harus dijelaskan secara terpisah.
