<?php
session_start();

// Cek apakah user sudah login
if (!isset($_SESSION['user'])) {
  // Simpan halaman tujuan (opsional, biar balik lagi setelah login)
  $redirect = urlencode($_SERVER['REQUEST_URI']);
  
  header("Location: /backend/auth/signin.php");
  exit();
}

include '../backend/db/koneksi.php';
include '../partials/header.php';
include '../data/data.php';
?>

<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Detail Jembatan</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css">
  <style>
    .container {
      margin-top: -50px;
    }

    table {
      border-radius: 10px;
      overflow: hidden;
    }

    thead th {
      vertical-align: middle;
    }

    .btn-primary {
      background-color: #0066FF;
      border: none;
    }

    .btn-primary:hover {
      background-color: #004BCC;
    }

    h4 {
      margin-bottom: 10px;
      margin-top: 100px;
    }

    p.text-muted {
      font-size: 14px;
    }

    .table th {
      background-color: #003366;
      color: #E6F0FF;
    }

    #map {
      height: 400px;
      border-radius: 10px;
      margin-top: 2rem;
    }
  </style>
</head>

<body>
  <main class="container py-5">
    <h3 class="text-center fw-bold mb-2" style="color:#002F87;">
      Model 3D dan Informasi Detail Penunjang Jembatan Kota Yogyakarta
    </h3>
    <div class="table-responsive">
      <table class="table table-bordered table-striped align-middle shadow-sm">
        <thead style="background-color: #E6F0FF;">
          <tr class="text-center fw-semibold">
            <th>No</th>
            <th>Nama Jembatan</th>
            <th>Lokasi</th>
            <th>Ruas Jalan</th>
            <th>Sisi</th>
            <th>Lintas Sungai</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Tahun Dibangun</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">1</td>
            <td>Jembatan Kewek</td>
            <td>Jl. Abu Bakar Ali, Suryatmajan, Danurejan, Kota Yogyakarta</td>
            <td>Jl. Abu Bakar Ali (Sisi Barat) dan Jl. Abu Bakar Ali (Sisi Utara)</td>
            <td>Sisi Selatan</td>
            <td>Sungai Code</td>
            <td>−7°47'25.99" LS</td>
            <td>110°22'7.37" BT</td>
            <td>1924</td>
            <td class="text-center">
              <a href="jembatan_kewek.php" class="btn btn-warning btn-sm px-3">Lihat Detail</a>
            </td>
          </tr>
          <tr>
            <td class="text-center">2</td>
            <td>Jembatan Kleringan (Amarta)</td>
            <td>Jl. Abu Bakar Ali, Suryatmajan, Danurejan, Kota Yogyakarta</td>
            <td>Jl. Kleringan (Sisi Barat) dan Jl. Abu Bakar Ali (Sisi Timur)</td>
            <td>Sisi Utara</td>
            <td>Sungai Code</td>
            <td>−7°47'23.04" LS</td>
            <td>110°22'7.64" BT</td>
            <td>-</td>
            <td class="text-center">
              <a href="jembatan_kleringan.php" class="btn btn-warning btn-sm px-3">Lihat Detail</a>
            </td>
          </tr>
          <tr>
            <td class="text-center">3</td>
            <td>Jembatan Muja Muju Selatan</td>
            <td>Jl. Kusumanegara, Muja Muju, Umbulharjo, Kota Yogyakarta</td>
            <td>Jl. Kusumanegara (Sisi Barat) dan Jl. Kusumanegara (Sisi Timur)</td>
            <td>Sisi Selatan</td>
            <td>Sungai Gajah Wong</td>
            <td>-7°48'8.34" LS</td>
            <td>110°23'51.14" BT</td>
            <td>2019</td>
            <td class="text-center">
              <a href="jembatan_mujamuju_selatan.php" class="btn btn-warning btn-sm px-3">Lihat Detail</a>
            </td>
          </tr>
          <tr>
            <td class="text-center">4</td>
            <td>Jembatan Muja Muju Utara</td>
            <td>Jl. Kusumanegara, Muja Muju, Umbulharjo, Kota Yogyakarta</td>
            <td>Jl. Kusumanegara (Sisi Barat) dan Jl. Kusumanegara (Sisi Timur)</td>
            <td>Sisi Utara</td>
            <td>Sungai Gajah Wong</td>
            <td>-7°48'7.93" LS</td>
            <td>110°23'51.04" BT</td>
            <td>1979</td>
            <td class="text-center">
              <a href="jembatan_mujamuju_utara.php" class="btn btn-warning btn-sm px-3">Lihat Detail</a>
            </td>
          </tr>
          <tr>
            <td class="text-center">5</td>
            <td>Jembatan Winong Selatan</td>
            <td>Jl. Perintis Kemerdekaan, Pandeyan, Umbulharjo, Kota Yogyakarta</td>
            <td>Jl. Perintis Kemerdekaan (Sisi Barat) dan Jl. Ngeksigondo (Sisi Timur)</td>
            <td>Sisi Selatan</td>
            <td>Sungai Gadjah Wong</td>
            <td>-7°49'8.30" LS</td>
            <td>110°23'40.43" BT</td>
            <td>1984</td>
            <td class="text-center">
              <a href="jembatan_winong_selatan.php" class="btn btn-warning btn-sm px-3">Lihat Detail</a>
            </td>
          </tr>
          <tr>
            <td class="text-center">6</td>
            <td>Jembatan Winong Utara</td>
            <td>Jl. Perintis Kemerdekaan, Pandeyan, Umbulharjo, Kota Yogyakarta</td>
            <td>Jl. Perintis Kemerdekaan (Sisi Barat) dan Jl. Ngeksigondo (Sisi Timur)</td>
            <td>Sisi Utara</td>
            <td>Sungai Gadjah Wong</td>
            <td>-7°49'7.97" LS</td>
            <td>110°23'40.52" BT</td>
            <td>-</td>
            <td class="text-center">
              <a href="jembatan_winong_utara.php" class="btn btn-warning btn-sm px-3">Lihat Detail</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>
