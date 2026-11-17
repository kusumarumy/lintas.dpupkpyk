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
$query = "
    SELECT * 
    FROM jembatan 
    WHERE nama IN ('Jembatan Kewek', 'Jembatan Kleringan (Amarta)')
";
$result = mysqli_query($conn, $query);
$kewek = null;
$kleringan = null;
while ($row = mysqli_fetch_assoc($result)) {
  if ($row['nama'] == 'Jembatan Kewek') {
    $kewek = $row;
  } elseif ($row['nama'] == 'Jembatan Kleringan (Amarta)') {
    $kleringan = $row;
  }
}
$kondisiMap = [
  0 => 'Baik',
  1 => 'Rusak Ringan',
  2 => 'Rusak Sedang',
  3 => 'Rusak Berat',
  4 => 'Kritis',
  5 => 'Runtuh'
];
?>

<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informasi Jembatan</title>
  <script src="https://cesium.com/downloads/cesiumjs/releases/1.135/Build/Cesium/Cesium.js"></script>
  <link href="https://cesium.com/downloads/cesiumjs/releases/1.135/Build/Cesium/Widgets/widgets.css" rel="stylesheet">
  <script src="https://unpkg.com/mapillary-js@4.1.1/dist/mapillary.min.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/mapillary-js@4.1.1/dist/mapillary.min.css" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <style>
    body {
      background-color: #f8f9fa;
      font-family: 'Segoe UI', sans-serif;
    }

    html:fullscreen,
    body:fullscreen {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }

    #cesiumContainer:-webkit-full-screen,
    #cesiumContainer:-moz-full-screen,
    #cesiumContainer:-ms-fullscreen,
    #cesiumContainer:fullscreen {
      width: 100% !important;
      height: 100% !important;
      display: block;
      margin: 0;
      padding: 0;
      border: none;
    }

    h4.section-title {
      text-align: center;
      margin-top: 2rem;
      margin-bottom: 1rem;
      font-weight: bold;
      color: #002F87;
      position: relative;
    }

    h4.section-title::before,
    h4.section-title::after {
      content: "";
      display: inline-block;
      width: 40px;
      height: 2px;
      background-color: #ffb703;
      vertical-align: middle;
      margin: 0 10px;
    }

    .table-informasi {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;
    }

    .table-informasi td {
      border: 1px solid #dee2e6;
      padding: 10px 12px;
      vertical-align: top;
      font-size: 14px;
    }

    .label {
      font-weight: 600;
      color: #002F87;
      width: 25%;
      background: #f1f5ff;
    }

    .value {
      width: 25%;
    }

    #cesiumContainer {
      height: 650px;
      width: 100%;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    #map {
      height: 400px;
      width: 100%;
      border-radius: 10px;
      margin-bottom: 2rem;
    }

    .foto-jembatan img {
      border-radius: 10px;
      width: 100%;
      height: auto;
      object-fit: cover;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    }

    .cesium-custom-control {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 1000;
      display: flex;
      gap: 5px;
      background: rgba(30, 30, 30, 0.6);
      padding: 6px 8px;
      border-radius: 8px;
      backdrop-filter: blur(4px);
    }

    .ctrl-btn {
      border: none;
      background: #007bff;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: 0.2s;
    }

    .ctrl-btn:hover {
      background: #0056b3;
    }

    html,
    body {
      height: 100%;
    }

    .foto-mini {
      max-width: 100%;
      max-height: 350px;
      object-fit: cover;
      padding: 20px;
    }

    .dokumen-btn {
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .dokumen-btn:hover {
      background-color: #213878;
      color: #fff;
    }
  </style>
</head>

<body>
  <div id="header"></div>
  <div class="container py-5">
    <h4 class="text-center mb-4" style="margin-top: -60px; color: #002F87; font-weight: bold;">Informasi Jembatan Kleringan (Amarta)</h4>
    <table class="table-informasi">
      <tr>
        <td class="label">Nama Ruas Jalan</td>
        <td class="value">Jl. Kleringan (Sisi Barat) dan Jl. Abu Bakar Ali (Sisi Timur)</td>
        <td class="label">Latitude</td>
        <td class="value">−7°47'23.04" LS</td>
      </tr>
      <tr>
        <td class="label">Kelurahan</td>
        <td class="value">Suryatmajan</td>
        <td class="label">Longitude</td>
        <td class="value">110°22'7.64" BT</td>
      </tr>
      <tr>
        <td class="label">Kecamatan</td>
        <td class="value">Danurejan</td>
      </tr>
    </table>
    <h4 class="section-title">Visualisasi 3D Jembatan</h4>
    <div id="cesiumContainer"></div>
    <div class="container py-5" style="margin-top: -55px;">
      <h4 class="section-title">Google Earth Street View</h4>
      <div class="ratio ratio-16x9">
        <iframe
          src="https://www.google.com/maps/embed?pb=!4v1764649960523!6m8!1m7!1smv7cUeIXdt8w7fychvTMcg!2m2!1d-7.78967193928313!2d110.3685835948526!3f107.51989308770047!4f-5.50203027577561!5f0.7820865974627469"
          style="border:0; width:100%; height:470px;" allowfullscreen="" allow="accelerometer; gyroscope" loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    </div>
    <h4 class="section-title d-flex align-items-center justify-content-between"
      data-bs-toggle="collapse"
      data-bs-target="#collapsePendukungUtara"
      style="cursor:pointer; margin-top: -280px">
      Informasi Pendukung Jembatan Kleringan (Amarta)
      <i class="bi bi-chevron-down" id="iconPendukungUtara"></i>
    </h4>
    <hr class="mb-3">
    <div id="collapsePendukungUtara" class="collapse">
      <?php if ($kleringan): ?>
        <div class="card mb-4">
          <div class="card-header">📄 Informasi Umum</div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <table class="table table-bordered table-striped">
                  <tbody>
                    <tr>
                      <th style="width: 40%">ID Jembatan</th>
                      <td><?= $kleringan['id'] ?></td>
                    </tr>
                    <tr>
                      <th>Nama Jembatan</th>
                      <td><?= htmlspecialchars($kleringan['nama']) ?></td>
                    </tr>
                    <tr>
                      <th>Nomor Ruas Jalan</th>
                      <td><?= htmlspecialchars($kleringan['no_ruas']) ?></td>
                    </tr>
                    <tr>
                      <th>Nama Ruas Jalan</th>
                      <td><?= htmlspecialchars($kleringan['ruas_jalan']) ?></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="col-md-6">
                <table class="table table-bordered table-striped">
                  <tbody>
                    <tr>
                      <th>Tahun Pembangunan</th>
                      <td>-</td>
                    </tr>
                    <tr>
                      <th>Status Jembatan</th>
                      <td><?= $kleringan['status_op'] ?></td>
                    </tr>
                    <tr>
                      <th>Nilai Aliran Sungai</th>
                      <td><?= $kleringan['kondisi_hu'] ?></td>
                    </tr>
                    <tr>
                      <th style="width: 30%;">Kondisi Aliran Sungai</th>
                      <td><?= $kondisiMap[$kleringan['kondisi_hu']] ?? '-' ?></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="card mb-4">
          <div class="card-header" style="font-weight:600;">
            📜 Riwayat Kondisi Jembatan (2020–2024)
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-bordered table-sm text-center align-middle" style="font-size: 14px;">
                <thead>
                  <tr>
                    <th colspan="5" style="width: 18%;">Kondisi Umum Jembatan</th>
                    <th rowspan="2" style="width: 5%;">Jenis Konstruksi</th>
                    <th rowspan="2" style="width: 10%;">Kerusakan</th>
                    <th rowspan="2" style="width: 18%;">Rekomendasi</th>
                  </tr>
                  <tr>
                    <th>2020</th>
                    <th>2021</th>
                    <th>2022</th>
                    <th>2023</th>
                    <th>2024</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>1 (Rusak Ringan)</td>
                    <td>Girder Prategang</td>
                    <td>Pas. Batu Depan Abt Sudah Mulai Tergerus</td>
                    <td>Perbaikan Pas. Batu
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header">📏 Dimensi Jembatan</div>
                <div class="card-body">
                  <table class="table table-bordered table-striped">
                    <tbody>
                      <tr>
                        <th style="width: 40%">Panjang</th>
                        <td><?= $kleringan['panjang'] !== '' ? $kleringan['panjang'] . ' m' : '-' ?></td>
                      </tr>
                      <tr>
                        <th>Lebar</th>
                        <td><?= $kleringan['lebar'] !== '' ? $kleringan['lebar'] . ' m' : '-' ?></td>
                      </tr>
                      <tr>
                        <th>Jumlah Bentang</th>
                        <td><?= $kleringan['bentang'] ?></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <?php
            $rekap = $kleringan['rekap'];
            if ($rekap == 0) {
              $rencana = "Kondisi Baik";
            } elseif ($rekap == 1) {
              $rencana = "Memerlukan Perbaikan Secara Rutin";
            } elseif ($rekap == 2) {
              $rencana = "Memerlukan Perbaikan Berkala";
            } elseif ($rekap == 3) {
              $rencana = "Memerlukan Perbaikan Secepatnya Dalam 1 Tahun";
            } elseif ($rekap == 4) {
              $rencana = "Memerlukan Penanganan Segera";
            } elseif ($rekap == 5) {
              $rencana = "Jembatan Runtuh";
            } else {
              $rencana = "Tidak Diketahui";
            }
            ?>
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header">🛠️ Kondisi Jembatan</div>
                <div class="card-body">
                  <table class="table table-bordered table-striped">
                    <tbody>
                      <tr>
                        <th>Penilaian Jembatan</th>
                        <td><?= $kleringan['rekap'] ?></td>
                      </tr>
                      <tr>
                        <th>Kondisi Nilai Jembatan</th>
                        <td><?= htmlspecialchars($kleringan['kondisi']) ?></td>
                      </tr>
                      <tr>
                        <th>Kondisi Kemantapan Jembatan</th>
                        <td><?= htmlspecialchars($kleringan['kemantapan']) ?></td>
                      </tr>
                      <tr>
                        <th>Rencana Penanganan</th>
                        <td><?= $rencana ?></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="card mb-4">
            <div class="card-header" style="font-weight:600;">
              🏗️ Bangunan Atas
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <h6 class="fw-bold">🧱 Struktur Atas</h6>
                  <table class="table table-sm table-bordered">
                    <tr>
                      <th style="width: 40%;">Tipe</th>
                      <td><?= $kleringan['tipe_sa'] ?></td>
                    </tr>
                    <tr>
                      <th>Nilai</th>
                      <td><?= $kleringan['kondisi_sa'] ?></td>
                    </tr>
                    <tr>
                      <th style="width: 30%;">Kondisi</th>
                      <td><?= $kondisiMap[$kleringan['kondisi_sa']] ?? '-' ?></td>
                    </tr>
                  </table>
                </div>
                <div class="col-md-4 mb-3">
                  <h6 class="fw-bold">🛤️ Sistem Lantai</h6>
                  <table class="table table-sm table-bordered">
                    <tr>
                      <th style="width: 40%;">Tipe</th>
                      <td><?= $kleringan['tipe_sl'] ?></td>
                    </tr>
                    <tr>
                      <th>Nilai</th>
                      <td><?= $kleringan['kondisi_sl'] ?></td>
                    </tr>
                    <tr>
                      <th style="width: 30%;">Kondisi</th>
                      <td><?= $kondisiMap[$kleringan['kondisi_sl']] ?? '-' ?></td>
                    </tr>
                  </table>
                </div>
                <div class="col-md-4 mb-3">
                  <h6 class="fw-bold">🪛 Perlengkapan (Sandaran, Railing, Pipa Cucuran)</h6>
                  <table class="table table-sm table-bordered">
                    <tr>
                      <th>Tipe</th>
                      <td><?= $kleringan['tipe_p'] ?></td>
                    </tr>
                    <tr>
                      <th>Nilai</th>
                      <td><?= $kleringan['kondisi_p'] ?></td>
                    </tr>
                    <tr>
                      <th style="width: 30%;">Kondisi</th>
                      <td><?= $kondisiMap[$kleringan['kondisi_p']] ?? '-' ?></td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="card mb-4">
            <div class="card-header" style="font-weight:600;">
              ⚙️ Bangunan Bawah
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <h6 class="fw-bold">🔩 Abutmen/Pilar</h6>
                  <table class="table table-sm table-bordered">
                    <tr>
                      <th style="width: 40%;">Tipe</th>
                      <td><?= $kleringan['tipe_ab'] ?></td>
                    </tr>
                    <tr>
                      <th>Nilai</th>
                      <td><?= $kleringan['kondisi_ab'] ?></td>
                    </tr>
                    <tr>
                      <th style="width: 30%;">Kondisi</th>
                      <td><?= $kondisiMap[$kleringan['kondisi_ab']] ?? '-' ?></td>
                    </tr>
                  </table>
                </div>
                <div class="col-md-4 mb-3">
                  <h6 class="fw-bold">🛢️ Pondasi</h6>
                  <table class="table table-sm table-bordered">
                    <tr>
                      <th style="width: 40%;">Tipe</th>
                      <td><?= $kleringan['tipe_fon'] ?></td>
                    </tr>
                    <tr>
                      <th>Nilai</th>
                      <td><?= $kleringan['kondisi_po'] ?></td>
                    </tr>
                    <tr>
                      <th style="width: 30%;">Kondisi</th>
                      <td><?= $kondisiMap[$kleringan['kondisi_po']] ?? '-' ?></td>
                    </tr>
                  </table>
                </div>
                <div class="col-md-4 mb-3">
                  <h6 class="fw-bold">🚧 Dinding Penahan</h6>
                  <table class="table table-sm table-bordered">
                    <tr>
                      <th>Tipe</th>
                      <td><?= $kleringan['tipe_din'] ?></td>
                    </tr>
                    <tr>
                      <th>Nilai</th>
                      <td><?= $kleringan['kondisi_di'] ?></td>
                    </tr>
                    <tr>
                      <th style="width: 30%;">Kondisi</th>
                      <td><?= $kondisiMap[$kleringan['kondisi_di']] ?? '-' ?></td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>
        <?php endif; ?>
        </div>
    </div>

  <h4 class="section-title text-center fw-bold" style="margin-top: 30px; color:#213878;">
    Dokumen Teknis Jembatan
  </h4>
  <div class="d-flex justify-content-center gap-2 mt-3 flex-nowrap">
      <button class="btn btn-outline-primary dokumen-btn px-4 py-2"
        data-pdf="../data/Jembatan Kleringan.pdf">
        📄 Dokumen Teknis Jembatan Kleringan
      </button>  
      <button 
  class="btn btn-outline-primary dokumen-btn px-4 py-2"
  onclick="window.location.href='../data/jembatan_kleringan.zip'">
  📐 Download DWG Jembatan Kleringan
</button>
      <button class="btn btn-outline-primary dokumen-btn px-4 py-2"
        data-pdf="../data/Peta Planimetris Jembatan Kewek.pdf">
        📄 Peta Kontur Jembatan Kleringan
      </button>
      <button class="btn btn-outline-primary dokumen-btn px-4 py-2"
        data-pdf="../data/kontur_kewek.zip">
        📄 Data Kontur Jembatan Kleringan
      </button>
    </div>
  <div class="modal fade" id="pdfModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content bg-dark">
        <div class="modal-header border-0">
          <h5 class="modal-title text-white">📑 Pratinjau Dokumen</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body p-0">
          <iframe id="pdfViewer" src="" width="100%" height="100%" style="border:none;"></iframe>
        </div>
      </div>
    </div>
  </div>

  <h4 class="section-title" style="margin-top: 60px;">Foto Jembatan</h4>
  <div class="row foto-jembatan g-3">
      <div class="col-md-6">
        <img src="../assets/landscape/kleringan 1.jpg" alt="Foto 1" class="img-fluid foto-mini">
      </div>
      <div class="col-md-6">
        <img src="../assets/landscape/kleringan 2.jpg" alt="Foto 2" class="img-fluid foto-mini">
      </div>
      <div class="col-md-6">
        <img src="../assets/landscape/kleringan 3.jpg" alt="Foto 3" class="img-fluid foto-mini">
      </div>
      <div class="col-md-6">
        <img src="../assets/landscape/kleringan 4.jpg" alt="Foto 4" class="img-fluid foto-mini">
      </div>
    </div>

  <script>
    (async function initCesium() {
        document.addEventListener("DOMContentLoaded", async () => {
          Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4NzdjYTJhYS1mZWUxLTQwMzUtOTJlZC00MmNiOTczY2NmMGYiLCJpZCI6MzY2MDUzLCJpYXQiOjE3NjQ4MTY0NTB9.4JbVzL19VRTuft4bd_0v-PYFRO11XCzdqmHdjPpuZYA";
          const viewer = new Cesium.Viewer("cesiumContainer", {
            imageryProvider: true,
            baseLayerPicker: true,
            terrain: new Cesium.Terrain(
              Cesium.CesiumTerrainProvider.fromIonAssetId(4185927)
            ),
            geocoder: false,
            homeButton: true,
            sceneModePicker: true,
            navigationHelpButton: false,
            animation: true,
            timeline: true,
            fullscreenButton: true
          });

          const ortho = await Cesium.IonImageryProvider.fromAssetId(4192817);
          viewer.imageryLayers.addImageryProvider(ortho);
          let tileset5;
          let riverVisible = true;

          (async function() {
            const tileset1 = await Cesium.Cesium3DTileset.fromIonAssetId(4203750); //kleringan
            const tileset2 = await Cesium.Cesium3DTileset.fromIonAssetId(4203746); //kewek
            const tileset3 = await Cesium.Cesium3DTileset.fromIonAssetId(4203751); //kereta
            const tileset4 = await Cesium.Cesium3DTileset.fromIonAssetId(4203644); //area
            tileset5 = await Cesium.Cesium3DTileset.fromIonAssetId(4204061); //sungai
            viewer.scene.primitives.add(tileset1);
            viewer.scene.primitives.add(tileset2);
            viewer.scene.primitives.add(tileset3);
            viewer.scene.primitives.add(tileset4);
            viewer.scene.primitives.add(tileset5);
            viewer.flyTo(tileset1);
            await tileset1.readyPromise;
              console.log("CENTER:", tileset1.boundingSphere.center);
console.log("RADIUS:", tileset1.boundingSphere.radius);
console.log("TRANSFORM:", tileset1.root.transform);

            tileset1.show = true;
            tileset1.style = new Cesium.Cesium3DTileStyle({
              color: "color('white', 1.0)"
            });
            const boundingSphere = tileset1.boundingSphere;
            const radius = boundingSphere.radius;
            const slider = document.getElementById("clippingSlider");
            const R = boundingSphere.radius;
            const verticalPlane = new Cesium.ClippingPlane(
  new Cesium.Cartesian3(0.0, 0.0, 1.0),
  0.0
);

const horizontalPlane = new Cesium.ClippingPlane(
  new Cesium.Cartesian3(1.0, 0.0, 0.0),
  0.0
);

            let activePlane = verticalPlane;
            const clipCollection = new Cesium.ClippingPlaneCollection({
              planes: [activePlane],
              edgeWidth: 0.0,
              unionClippingRegions: true
            });
              clipCollection.modelMatrix = tileset1.root.transform;
            tileset1.clippingPlanes = null;
            const maxDistance = R * 2;
            slider.min = -maxDistance;
            slider.max = maxDistance;
            slider.value = -maxDistance;
activePlane.distance = -maxDistance;
 
            let isClippingActive = false;
            slider.addEventListener("input", (e) => {
              if (!isClippingActive) {
                tileset1.clippingPlanes = clipCollection;
                isClippingActive = true;
              }
              activePlane.distance = Number(e.target.value);
            });
            document.querySelectorAll('input[name="clipDirection"]').forEach(radio => {
              radio.addEventListener("change", (e) => {
                if (e.target.value === "z") {
                  activePlane = verticalPlane;
                }
                if (e.target.value === "x") {
                  activePlane = horizontalPlane;
                }
                clipCollection.removeAll();
                clipCollection.add(activePlane);
                if (activePlane === verticalPlane) {
                  slider.value = -maxDistance;
                  activePlane.distance = -maxDistance;
                } else {
                  slider.value = 0;
                  activePlane.distance = 0;
                }
              });
            });

            const transparencyControl = document.getElementById("transparencyControl");
            transparencyControl.addEventListener("input", () => {
              const alpha = Number(transparencyControl.value);
              tileset1.style = new Cesium.Cesium3DTileStyle({
                color: `color('white', ${alpha})`
              });
            });
            tileset1.backFaceCulling = false;
            viewer.scene.shadowMap.enabled = false;
            })();
            
          viewer.scene.globe.depthTestAgainstTerrain = true;
          viewer.scene.pickTranslucentDepth = true;
          viewer.screenSpaceEventHandler.setInputAction(function(click) {
            const pickedPosition = viewer.scene.pickPosition(click.position);
            if (Cesium.defined(pickedPosition)) {
              const cartographic = Cesium.Cartographic.fromCartesian(pickedPosition);
              const lon = Cesium.Math.toDegrees(cartographic.longitude);
              const lat = Cesium.Math.toDegrees(cartographic.latitude);
              const height = cartographic.height.toFixed(2);
              console.log(`Longitude: ${lon}, Latitude: ${lat}, Height: ${height}`);
              viewer.entities.add({
                position: pickedPosition,
                point: {
                  pixelSize: 10,
                  color: Cesium.Color.RED,
                },
                label: {
                  text: `(${lon.toFixed(5)}, ${lat.toFixed(5)})`,
                  font: "14px sans-serif",
                  pixelOffset: new Cesium.Cartesian2(0, -20),
                },
              });
            } else {
              console.log("Klik tidak mengenai permukaan 3D.");
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

          const controlDiv = document.createElement("div");
          controlDiv.className = "cesium-custom-control";
          controlDiv.style.display = "none";
          controlDiv.style.flexDirection = "column";
          controlDiv.style.alignItems = "stretch";
          controlDiv.style.padding = "8px 14px";
          controlDiv.style.width = "230px";
          controlDiv.style.background = "rgba(0,0,0,0.65)";
          controlDiv.style.backdropFilter = "blur(5px)";
          controlDiv.style.borderRadius = "10px";
          controlDiv.style.color = "white";
          controlDiv.innerHTML = `
        <h6 style="font-weight:bold; text-align:center; color:#ffcc00; margin-bottom:2px;">⚙️ Kontrol Fitur</h6>
        <div style="margin-bottom:5px;">
          <label class="fw-bold d-block mb-1" style="color:#80d0ff;">💡 Efek Pencahayaan</label>
          <div style="display:flex; flex-wrap:wrap; gap:2px; justify-content:center;">
            <button id="btnDay" class="ctrl-btn">☀️ Day</button>
            <button id="btnNight" class="ctrl-btn">🌙 Night</button>
            <button id="btnSunrise" class="ctrl-btn">🌇 Sunrise</button>
        <button id="btnSunset" class="ctrl-btn">🌆 Sunset</button>
            <button id="btnAtmos" class="ctrl-btn">💨 Atmosfer</button>
            <button id="btnSun" class="ctrl-btn">🌞 Sun</button>
          </div>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.3); margin:8px 0;"></div>
        <div>
          <label class="fw-bold d-block mb-1" style="color:#80d0ff;">✂️ Pemotongan Model</label>
          <div class="mt-1">
            <input type="radio" id="clipZ" name="clipDirection" value="z" checked>
            <label for="clipZ">Vertikal</label>
            <input type="radio" id="clipX" name="clipDirection" value="x" style="margin-left:10px;">
            <label for="clipX">Horizontal</label>
          </div>
          <input type="range" min="-50" max="50" step="0.5" value="50" id="clippingSlider" class="form-range mt-2">
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.3); margin:8px 0;"></div>
        <div>
          <label class="fw-bold d-block mb-1" style="color:#80d0ff;">🟦 Transparansi Model</label>
          <input id="transparencyControl" type="range" min="0.2" max="1" step="0.05" value="1" class="form-range mt-1">
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.3); margin:8px 0;"></div>
      <button class="ctrl-btn" id="btnMeasureDistance">📏 Pengukuran Jarak</button>
      <button class="ctrl-btn" id="btnMeasureArea">🗺️ Pengukuran Area</button>
      <button class="ctrl-btn" id="btnFullHeight">📐 Pengukuran Tinggi</button>
      <button class="ctrl-btn" id="btnTopView">🔼 Top View</button>
      <button class="ctrl-btn" id="btnNorth">🧭 North</button>
      <button class="ctrl-btn" id="btnBloom">✨ Bloom</button>
      <button class="ctrl-btn" id="btnStreetView">🚶 Street View</button>
      <button class="ctrl-btn" id="btnToggleSungai">💧 Matikan Sungai</button>
      `;
          viewer.container.appendChild(controlDiv);
          document.getElementById("btnToggleSungai").addEventListener("click", () => {
          riverVisible = !riverVisible;
          tileset5.show = riverVisible;
          document.getElementById("btnToggleSungai").innerText = riverVisible 
            ? "💧 Matikan Sungai" 
            : "💧 Hidupkan Sungai";
        });

      document.addEventListener("fullscreenchange", () => {
        const cesiumContainer = document.getElementById("cesiumContainer");
        if (document.fullscreenElement === cesiumContainer) {
          controlDiv.style.display = "flex";
        } else {
          controlDiv.style.display = "none";
        }
      });
      document.getElementById("btnDay").addEventListener("click", () => {
        viewer.scene.light = new Cesium.SunLight();
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.globe.enableLighting = false;
      });
      document.getElementById("btnNight").addEventListener("click", () => {
        viewer.scene.light = new Cesium.DirectionalLight({
          direction: new Cesium.Cartesian3(1, 0, 0),
        });
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.globe.enableLighting = true;
      });
      document.getElementById("btnSunset").addEventListener("click", function() {
        const localDate = new Date();
        localDate.setHours(17, 30, 0);
        const julian = Cesium.JulianDate.fromDate(localDate);
        viewer.scene.globe.enableLighting = true;
        viewer.scene.light = new Cesium.SunLight();
        viewer.clock.currentTime = julian;
        viewer.scene.skyAtmosphere.hueShift = -0.15;
        viewer.scene.skyAtmosphere.saturationShift = 0.2;
        viewer.scene.skyAtmosphere.brightnessShift = -0.2;
      });
      document.getElementById("btnSunrise").addEventListener("click", function() {
        const now = Cesium.JulianDate.now();
        const sunsetTime = Cesium.JulianDate.addHours(now, +2, new Cesium.JulianDate());
        viewer.scene.globe.enableLighting = true;
        viewer.scene.light = new Cesium.SunLight();
        viewer.clock.currentTime = sunsetTime;
        viewer.scene.skyAtmosphere.hueShift = -0.1;
        viewer.scene.skyAtmosphere.saturationShift = 0.1;
        viewer.scene.skyAtmosphere.brightnessShift = -0.15;
      });
      document.getElementById("btnAtmos").addEventListener("click", () => {
        viewer.scene.skyAtmosphere.show = !viewer.scene.skyAtmosphere.show;
      });
      document.getElementById("btnSun").addEventListener("click", () => {
        const globe = viewer.scene.globe;
        const scene = viewer.scene;
        globe.enableLighting = !globe.enableLighting;
        if (globe.enableLighting) {
          scene.light = new Cesium.SunLight();
          globe.dynamicAtmosphereLighting = true;
          globe.dynamicAtmosphereLightingFromSun = true;
          viewer.clock.currentTime = Cesium.JulianDate.now();
          viewer.clock.shouldAnimate = true;
        } else {
          globe.dynamicAtmosphereLighting = false;
          globe.dynamicAtmosphereLightingFromSun = false;
          scene.light = new Cesium.DirectionalLight({
            direction: new Cesium.Cartesian3(1, 0, 0),
          });
        }
      });

      viewer.fullscreenButton.viewModel.command.beforeExecute.addEventListener(function(commandInfo) {
        commandInfo.cancel = true;
        const container = document.getElementById("cesiumContainer");
        if (!document.fullscreenElement) {
          container.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      });
      viewer.scene.globe.enableLighting = true;
      viewer.scene.highDynamicRange = true;
      viewer.shadows = true;
      viewer.scene.shadowMap.softShadows = true;
      viewer.scene.light = new Cesium.SunLight();

      const povPoints = [{
          name: "POV 1",
          lon: 110.36857079743095,
          lat: -7.790512204323662,
          pKey: "420316100193524"
        }];
      document.getElementById("btnStreetView").addEventListener("click", () => {
          const pov1 = povPoints[0];
          window.open(`https://www.mapillary.com/app/?pKey=${pov1.pKey}`, "_blank");
        });
        document.getElementById("btnTopView").addEventListener("click", () => {
          const scene = viewer.scene;
          const camera = viewer.camera;
          const center = Cesium.Cartesian3.fromDegrees(110.36872229849645, -7.790544245418813, 0);
          camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(110.36872229849645, -7.790544245418813, 150),
            orientation: {
              heading: 0,
              pitch: -Math.PI / 2,
              roll: 0
            }
          });
        });
        document.getElementById("btnNorth").addEventListener("click", () => {
          const cam = viewer.camera;
          const position = Cesium.Cartesian3.clone(cam.positionWC);
          const up = Cesium.Cartesian3.clone(cam.upWC);
          cam.setView({
            destination: position,
            orientation: {
              heading: 0.0,
              pitch: cam.pitch,
              roll: 0.0
            }
          });
        });
        document.getElementById("btnBloom").addEventListener("click", () => {
          let bloom = viewer.scene.postProcessStages.bloom;
          if (!bloom) {
            bloom = Cesium.PostProcessStageLibrary.createBloomStage();
            viewer.scene.postProcessStages.add(bloom);
            viewer.scene.postProcessStages.bloom = bloom;
          }
          bloom.enabled = !bloom.enabled;
        });
      document.querySelectorAll('.dokumen-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const pdfUrl = btn.getAttribute('data-pdf');
          const viewer = document.getElementById('pdfViewer');
          viewer.src = pdfUrl;
          const modal = new bootstrap.Modal(document.getElementById('pdfModal'));
          modal.show();
        });
      });

      const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

      let measureHandler = null;
        let measureEntities = [];
        let activeMeasureMode = null;
        function clearMeasurements() {
          if (measureHandler) {
            measureHandler.destroy();
            measureHandler = null;
          }
          measureEntities.forEach(ent => viewer.entities.remove(ent));
          measureEntities = [];
          activeMeasureMode = null;
        }
        function toggleMeasure(mode) {
          if (activeMeasureMode === mode) {
            clearMeasurements();
            return;
          }
          clearMeasurements();
          activeMeasureMode = mode;
          let positions = [];
          measureHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
          measureHandler.setInputAction((click) => {
            const pos = viewer.scene.pickPosition(click.position);
            if (!Cesium.defined(pos)) return;
            positions.push(pos);
            if (mode === "distance" && positions.length === 2) {
              const distance = Cesium.Cartesian3.distance(positions[0], positions[1]);
              measureEntities.push(viewer.entities.add({
                polyline: {
                  positions: positions,
                  width: 3,
                  material: Cesium.Color.YELLOW
                }
              }));
              const mid = Cesium.Cartesian3.midpoint(positions[0], positions[1], new Cesium.Cartesian3());
              measureEntities.push(viewer.entities.add({
                position: mid,
                label: {
                  text: `${distance.toFixed(2)} m`,
                  font: "20px sans-serif",
                  fillColor: Cesium.Color.BLACK,
                  outlineColor: Cesium.Color.WHITE,
                  outlineWidth: 3,
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                }
              }));
              measureHandler.destroy();
              measureHandler = null;
              positions = [];
              activeMeasureMode = null;
            }
            if (mode === "area" && positions.length >= 3) {
              const cartoPositions = positions.map(p => Cesium.Cartographic.fromCartesian(p));
              let area = 0;
              const R = 6378137;
              for (let i = 0; i < cartoPositions.length; i++) {
                const j = (i + 1) % cartoPositions.length;
                const xi = cartoPositions[i].longitude;
                const yi = cartoPositions[i].latitude;
                const xj = cartoPositions[j].longitude;
                const yj = cartoPositions[j].latitude;
                area += (xj - xi) * (2 + Math.sin(yi) + Math.sin(yj));
              }
              area = Math.abs(area * R * R / 2);
              const hierarchy = new Cesium.PolygonHierarchy(positions);
              measureEntities.push(viewer.entities.add({
                polygon: {
                  hierarchy: hierarchy,
                  material: Cesium.Color.YELLOW.withAlpha(0.25),
                  outline: true,
                  outlineColor: Cesium.Color.YELLOW
                }
              }));
              const center = positions.reduce((acc, val) => {
                acc.x += val.x;
                acc.y += val.y;
                acc.z += val.z;
                return acc;
              }, {
                x: 0,
                y: 0,
                z: 0
              });
              center.x /= positions.length;
              center.y /= positions.length;
              center.z /= positions.length;
              measureEntities.push(viewer.entities.add({
                position: new Cesium.Cartesian3(center.x, center.y, center.z),
                label: {
                  text: `${area.toFixed(2)} m²`,
                  font: "20px sans-serif",
                  fillColor: Cesium.Color.BLACK,
                  outlineColor: Cesium.Color.WHITE,
                  outlineWidth: 3,
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE
                }
              }));
              measureHandler.destroy();
              measureHandler = null;
              positions = [];
              activeMeasureMode = null;
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
          measureHandler.setInputAction(() => {
            clearMeasurements();
          }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }

        function activateFullHeightMeasure() {
          clearMeasurements();
          measureHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
          let points = [];
          measureHandler.setInputAction((movement) => {
            const pos = viewer.scene.pickPosition(movement.position);
            if (!Cesium.defined(pos)) return;
            points.push(pos);
            if (points.length === 2) {
              const p1 = points[0];
              const p2 = points[1];
              const c1 = Cesium.Cartographic.fromCartesian(p1);
              const c2 = Cesium.Cartographic.fromCartesian(p2);
              const h1 = c1.height;
              const h2 = c2.height;
              const vertical = h2 - h1;
              const horizontal = Cesium.Cartesian3.distance(
                Cesium.Cartesian3.fromRadians(c1.longitude, c1.latitude, h1),
                Cesium.Cartesian3.fromRadians(c2.longitude, c2.latitude, h1)
              );
              const distance3D = Cesium.Cartesian3.distance(p1, p2);
              const slopePercent = (vertical / horizontal) * 100;
              const slopeDegree = Math.atan(vertical / horizontal) * (180 / Math.PI);
              const p2VerticalFoot = Cesium.Cartesian3.fromRadians(
                c2.longitude,
                c2.latitude,
                h1
              );
              const avgElevation = (h1 + h2) / 2;
              const deltaLon = c2.longitude - c1.longitude;
              const deltaLat = c2.latitude - c1.latitude;
              const azimuth = Math.atan2(deltaLon, deltaLat) * (180 / Math.PI);
              measureEntities.push(
                viewer.entities.add({
                  polyline: {
                    positions: [p1, p2],
                    width: 3,
                    material: Cesium.Color.YELLOW,
                  },
                })
              );
              measureEntities.push(
                viewer.entities.add({
                  polyline: {
                    positions: [p1, p2VerticalFoot],
                    width: 3,
                    material: Cesium.Color.CYAN,
                  },
                })
              );
              measureEntities.push(
                viewer.entities.add({
                  polyline: {
                    positions: [p2VerticalFoot, p2],
                    width: 3,
                    material: Cesium.Color.MAGENTA,
                  },
                })
              );
              const mid3D = Cesium.Cartesian3.midpoint(p1, p2, new Cesium.Cartesian3());
              const midH = Cesium.Cartesian3.midpoint(p1, p2VerticalFoot, new Cesium.Cartesian3());
              const midV = Cesium.Cartesian3.midpoint(p2VerticalFoot, p2, new Cesium.Cartesian3());
              measureEntities.push(
                viewer.entities.add({
                  position: mid3D,
                  label: {
                    text: `3D: ${distance3D.toFixed(2)} m`,
                    font: "15px sans-serif",
                    fillColor: Cesium.Color.YELLOW,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    showBackground: true,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  },
                })
              );
              measureEntities.push(
                viewer.entities.add({
                  position: midH,
                  label: {
                    text: `Horizontal: ${horizontal.toFixed(2)} m`,
                    font: "15px sans-serif",
                    fillColor: Cesium.Color.CYAN,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    showBackground: true,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  },
                })
              );
              measureEntities.push(
                viewer.entities.add({
                  position: midV,
                  label: {
                    text: `Vertical: ${vertical.toFixed(2)} m`,
                    font: "15px sans-serif",
                    fillColor: Cesium.Color.MAGENTA,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    showBackground: true,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  },
                })
              );
              measureEntities.push(
                viewer.entities.add({
                  position: mid3D,
                  label: {
                    text: `Slope: ${slopePercent.toFixed(2)}%`,
                    pixelOffset: new Cesium.Cartesian2(0, -25),
                    font: "14px sans-serif",
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    showBackground: true,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  },
                })
              );
              measureEntities.push(
                viewer.entities.add({
                  position: mid3D,
                  label: {
                    text: `Slope °: ${slopeDegree.toFixed(2)}°`,
                    pixelOffset: new Cesium.Cartesian2(0, -40),
                    font: "14px sans-serif",
                    fillColor: Cesium.Color.LIME,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    showBackground: true,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                  }
                })
              );
              measureEntities.push(
                viewer.entities.add({
                  position: mid3D,
                  label: {
                    text: `Azimuth: ${azimuth.toFixed(2)}°`,
                    pixelOffset: new Cesium.Cartesian2(0, 40),
                    font: "14px sans-serif",
                    fillColor: Cesium.Color.ORANGE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    showBackground: true,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                  }
                })
              );
              measureEntities.push(
                viewer.entities.add({
                  position: mid3D,
                  label: {
                    text: `Avg Elevation: ${avgElevation.toFixed(2)} m`,
                    pixelOffset: new Cesium.Cartesian2(0, 55),
                    font: "14px sans-serif",
                    fillColor: Cesium.Color.BLUE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    showBackground: true,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                  }
                })
              );
              measureHandler.destroy();
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }

        document.getElementById("btnMeasureDistance").onclick = () => toggleMeasure("distance");
        document.getElementById("btnMeasureArea").onclick = () => toggleMeasure("area");
        document.getElementById("btnFullHeight").onclick = () => {
          activateFullHeightMeasure();
        };
        if (!activeMeasureMode) return;
        const offsetPos = Cesium.Cartesian3.clone(pos);
        offsetPos.z += 7.5;
        positions.push(pos);
        const point = viewer.entities.add({
          position: offsetPos,
          point: {
            pixelSize: 15,
            color: Cesium.Color.YELLOW,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          }
        });
        measurementEntities.push(point);
        if (positions.length >= 2 && activeMeasureMode === "distance") {
          const len = Cesium.Cartesian3.distance(positions[0], positions[1]);
          const label = viewer.entities.add({
            position: positions[1],
            label: {
              text: `Jarak: ${len.toFixed(2)} m`,
              fillColor: Cesium.Color.CYAN
            }
          });
          measurementEntities.push(label);
          activeMeasureMode = null;
        }
        if (positions.length >= 3 && activeMeasureMode === "area") {
          const area = computeArea(positions);
          const label = viewer.entities.add({
            position: positions[0],
            label: {
              text: `Luas: ${area.toFixed(2)} m²`,
              fillColor: Cesium.Color.CYAN
            }
          });
          measurementEntities.push(label);
          activeMeasureMode = null;
        }
        handler.setInputAction(function(click) {
          const pos = viewer.scene.pickPosition(click.position);
          if (!Cesium.defined(pos)) return;
          if (!startPoint) startPoint = pos;
          else {
            const dist = Cesium.Cartesian3.distance(startPoint, pos);
            alert(`Jarak: ${dist.toFixed(2)} meter`);
            startPoint = null;
          }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
      });
})();
    </script>
</body>
</html>
