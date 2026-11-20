# Catatan migrasi LINTAS

## Sudah disiapkan
- Next.js App Router + TypeScript.
- Login dua akun dari `AUTH_USERS_JSON`, bcrypt hash, JWT session cookie HttpOnly, dan middleware proteksi halaman.
- Enam halaman detail memakai konfigurasi Cesium dari PHP lama, termasuk asset Ion ID, terrain, imagery, clipping plane, dan logika tampilan aslinya.
- Route `/legacy/[slug]` menyajikan HTML Cesium setelah token diinjeksikan server-side dari `CESIUM_ION_TOKEN`.
- File PDF yang memang ada pada arsip sumber disalin ke `public/documents/`.
- PHP lama disimpan di `migration-reference/` sebagai bahan audit, dengan token rahasia diganti placeholder.

## Belum selesai / perlu sumber tambahan
1. `assets/` (logo, foto, ikon, profil) tidak ada pada ZIP sumber. Salin aset aslinya ke `public/assets/` atau beri key R2 yang valid.
2. Data tabel `jembatan`, `batas_administrasi`, `jalan_kota`, dan `jalan_lingkungan` berasal dari MySQL pada PHP lama. SQL dump/ekspor JSON belum ada pada arsip, jadi data atribut dan statistik belum dapat dimigrasikan secara akurat.
3. PDF yang tidak ada di ZIP sumber tidak ditampilkan. File DWG/ZIP juga tidak ada, jadi tombol unduh tidak diarahkan ke file palsu.
4. Konfigurasi object key dan respons Worker R2 belum dapat diverifikasi; jangan menebak URL/key.
5. Jalankan `npm install`, `npm run typecheck`, dan `npm run build` di komputer pengembang setelah dependency dapat diunduh. Build belum dapat diverifikasi di lingkungan penyusunan ini.

## Environment wajib
- `SESSION_SECRET`
- `AUTH_USERS_JSON`
- `CESIUM_ION_TOKEN` (buat token baru yang dibatasi; token lama sempat tertanam di source PHP)
- `NEXT_PUBLIC_R2_BASE_URL` (URL Worker yang benar)

Jangan deploy sebelum token Cesium diganti, aset yang hilang ditambahkan, data atribut/statistik disambungkan, dan build diuji.
