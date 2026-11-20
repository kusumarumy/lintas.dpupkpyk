<<<<<<< HEAD
# LINTAS — Next.js + TypeScript

Migrasi fondasi dari aplikasi PHP Native. UI lama dijadikan acuan; file PHP sumber disimpan di `migration-reference/` untuk audit perbandingan selama proses migrasi. Aplikasi runtime tidak membutuhkan PHP atau MySQL.

## Persiapan

1. Install Node.js 20.9+.
2. Jalankan `npm install`.
3. Salin `.env.example` menjadi `.env.local`.
4. Buat hash password untuk masing-masing dari dua akun:

   ```bash
   npm run auth:hash -- "password-akun-1"
   npm run auth:hash -- "password-akun-2"
   ```

5. Masukkan username dan hash ke `AUTH_USERS_JSON`. Jangan masukkan password plaintext.
6. Isi `SESSION_SECRET` dengan secret acak minimal 32 karakter. Contoh generator: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.
7. Isi `NEXT_R2_BASE_URL` dengan URL Worker Cloudflare yang benar-benar digunakan. Jangan menebak URL atau object key.
8. Jalankan `npm run dev`.

## Perintah

- `npm run dev`
- `npm run typecheck`
- `npm run build`

## Keamanan

- Seluruh route aplikasi selain `/login` dan endpoint autentikasi dilindungi `middleware.ts`.
- Session JWT ditandatangani HS256, disimpan dalam cookie HttpOnly, SameSite=Lax, Secure pada production, dan kedaluwarsa 8 jam.
- Kedua akun memiliki akses yang sama.
- Kredensial dibaca server-side dari environment variable; tidak ada database.
- File di R2 yang public URL-nya diketahui tetap dapat diakses langsung di luar aplikasi. Jika aset juga harus privat, Worker perlu memvalidasi session/token sebelum mengirim objek.

## Status migrasi

Fondasi Next.js, TypeScript, autentikasi, route utama, daftar enam jembatan, dan helper R2 telah dibuat. Detail dinamis jembatan dan dashboard statistika belum disambungkan ke data R2 karena key objek, skema GeoJSON, dan perilaku Worker belum diverifikasi. Halaman detail masih berupa kerangka migrasi; jangan deploy sebagai pengganti produksi sebelum integrasi data dan uji UI selesai.

## Enam halaman Cesium

Enam halaman detail jembatan memakai snapshot HTML dari implementasi PHP lama di `public/legacy/`. Halaman tersebut tetap memuat CesiumJS 1.135, konfigurasi terrain, imagery, asset Ion, clipping plane, kamera, dan interaksi asli yang tertulis pada masing-masing halaman. Next.js menampilkan snapshot itu di iframe same-origin melalui route `/legacy/[slug]`; route tersebut tetap melewati middleware autentikasi.

Isi `CESIUM_ION_TOKEN` pada `.env.local` dan Vercel Environment Variables. Token Ion lama ditemukan tertanam langsung di source PHP; rotasi token lama dan pembatasan token baru sangat disarankan sebelum deploy. Token baru tidak disimpan di repository.

## Batas migrasi saat ini

- PHP session dan query MySQL tidak dijalankan. Blok PHP dari halaman lama dibuang ketika membuat snapshot HTML; bagian yang sebelumnya diisi query database perlu dipetakan ke data JSON/GeoJSON R2.
- PDF yang ada di ZIP disalin ke `public/documents/` sebagai fallback sementara. Setelah key dan endpoint Worker R2 dipastikan, pindahkan URL dokumen ke R2.
- Folder `assets/` asli (logo, foto, profil, dan ikon) tidak terdapat di ZIP yang diterima. Referensi path lama dipertahankan ke `/assets/`, sehingga aset itu perlu disalin dari sumber aslinya atau diarahkan ke key R2 yang benar.
- Halaman statistika masih menunggu skema dan data GeoJSON R2; tidak ada angka yang dibuat-buat.
=======
LINTAS
>>>>>>> 6043b82385faceb4dc1440e3e4ffd8c72008b61c
