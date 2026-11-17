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

$kondisiMap = [
  "Baik" => 1,
  "Rusak Ringan" => 12,
  "Rusak Sedang" => 32,
  "Rusak Berat" => 6,
  "Kritis" => 3,
  "Runtuh" => 0
];
$mantap = 45;
$tidak_mantap = 9;
$sql = "SELECT kondisi FROM jembatan";
$result = $conn->query($sql);
$statsKondisi = [];
$total = 0;
if ($result->num_rows > 0) {
  while ($row = $result->fetch_assoc()) {
    $k = $row['kondisi'];
    if ($k == "Baik") $k = "Baik";
    else if ($k == "Rusak Ringan") $k = "Rusak Ringan";
    else if ($k == "Rusak Sedang") $k = "Rusak Sedang";
    else if ($k == "Rusak Berat") $k = "Rusak Berat";
    else if ($k == "Kritis") $k = "Kritis";
    else if ($k == "Runtuh") $k = "Runtuh";
    $statsKondisi[$k] = ($statsKondisi[$k] ?? 0) + 1;
    $total++;
  }
}
$sql_kemantren = "SELECT kemantren, COUNT(*) AS jumlah FROM jembatan GROUP BY kemantren ORDER BY kemantren";
$result_kemantren = $conn->query($sql_kemantren);
$statsKemantren = [];
if ($result_kemantren && $result_kemantren->num_rows > 0) {
  while ($row = $result_kemantren->fetch_assoc()) {
    $statsKemantren[$row['kemantren']] = (int)$row['jumlah'];
  }
}
$sql_kondisi_kemantren = "
    SELECT kemantren, kondisi, COUNT(*) AS jumlah
    FROM jembatan
    GROUP BY kemantren, kondisi
";
$result_kondisi_kemantren = $conn->query($sql_kondisi_kemantren);
$kondisiPerKemantren = [];
if ($result_kondisi_kemantren->num_rows > 0) {
    while ($row = $result_kondisi_kemantren->fetch_assoc()) {
        $kem = $row['kemantren'];
        $kon = $row['kondisi'];
        $jumlah = (int)$row['jumlah'];
        if (!isset($kondisiPerKemantren[$kem])) {
            $kondisiPerKemantren[$kem] = [
                "Baik" => 0,
                "Rusak Ringan" => 0,
                "Rusak Sedang" => 0,
                "Rusak Berat" => 0,
                "Kritis" => 0,
                "Runtuh" => 0
            ];
        }
        $kondisiPerKemantren[$kem][$kon] = $jumlah;
    }
}
$sql_kelurahan = "
    SELECT kelurahan, COUNT(*) AS jumlah 
    FROM jembatan 
    GROUP BY kelurahan 
    ORDER BY kelurahan
";
$result_kelurahan = $conn->query($sql_kelurahan);
$statsKelurahan = [];
if ($result_kelurahan && $result_kelurahan->num_rows > 0) {
  while ($row = $result_kelurahan->fetch_assoc()) {
    $statsKelurahan[$row['kelurahan']] = (int)$row['jumlah'];
  }
}
$sql_kondisi_kelurahan = "
    SELECT kelurahan, kondisi, COUNT(*) AS jumlah
    FROM jembatan
    GROUP BY kelurahan, kondisi
";
$result_kondisi_kelurahan = $conn->query($sql_kondisi_kelurahan);
$kondisiPerKelurahan = [];
if ($result_kondisi_kelurahan->num_rows > 0) {
    while ($row = $result_kondisi_kelurahan->fetch_assoc()) {
        $kel = $row['kelurahan'];
        $kon = $row['kondisi'];
        $jumlah = (int)$row['jumlah'];
        if (!isset($kondisiPerKelurahan[$kel])) {
            $kondisiPerKelurahan[$kel] = [
                "Baik" => 0,
                "Rusak Ringan" => 0,
                "Rusak Sedang" => 0,
                "Rusak Berat" => 0,
                "Kritis" => 0,
                "Runtuh" => 0
            ];
        }
        $kondisiPerKelurahan[$kel][$kon] = $jumlah;
    }
}
?>

<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Statistika</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css" />
</head>
  <style>
    body {
      background-color: #f8f9fa;
      margin-top: -30px;
    }

    .card {
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .chart-title {
      font-weight: 600;
      text-align: center;
      margin-bottom: 10px;
    }

    .table thead {
      background-color: #f0f0f0;
      cursor: pointer;
    }

    .kondisi-0 {
      background-color: #22ff00ff;
      color: white;
    }

    .kondisi-1 {
      background-color: #f6ff00ff;
      color: black;
    }

    .kondisi-2 {
      background-color: #ffbb00ff;
      color: white;
    }

    .kondisi-3 {
      background-color: #ff0000ff;
      color: white;
    }

    .kondisi-4 {
      background-color: #6c0000ff;
      color: white;
    }

    .kondisi-5 {
      background-color: #000000ff;
      color: white;
    }

    .section-title {
      font-weight: 700;
      font-size: 20px;
      color: #003366;
      border-left: 5px solid #ffc20e;
      padding-left: 10px;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .chart-header {
      background-color: #003366;
      color: white;
      padding: 10px 15px;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
    }

    .chart-header h5 {
      font-weight: 700;
      font-size: 16px;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chart-header h5 span {
      width: 7px;
      height: 25px;
      background-color: #ffcc00;
      border-radius: 2px;
    }

    .card {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }

    table th {
      cursor: pointer;
    }

    .kemantrean-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .kemantrean-item {
      display: flex;
      justify-content: space-between;
      background: #f9f9f9;
      border-radius: 8px;
      padding: 2px 5px;
      gap: 5px;
      font-size: 15px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .kemantrean-item:hover {
      background: #e7f0ff;
      transform: translateY(-2px);
    }

    .kemantrean-item .nama {
      color: #003366;
    }

    .kemantrean-item .jumlah {
      font-weight: 700;
      color: #005caa;
    }

    .info-panel {
      background: white;
      padding: 10px 14px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      font-size: 14px;
      color: #333;
    }

    .info.legend {
      background: white;
      padding: 10px;
      line-height: 18px;
      color: #333;
      font-size: 13px;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
      border-radius: 6px;
    }

    .info.legend i {
      width: 18px;
      height: 18px;
      float: left;
      margin-right: 8px;
      opacity: 0.7;
    }

    #summaryTable th,
    #summaryTable td {
      padding: 6px 8px !important;
      font-size: 13;
    }

    #summaryTable {
      width: 100%;
      border-collapse: collapse !important;
    }

    .card canvas {
      display: block;      
      max-width: 100%;
      width: 100%;
      height: auto;         
      box-sizing: border-box;
    }

    #chartKondisi,
    #chartMantap {
      max-height: 260px;
    }

    @media (max-width: 768px) {

      #chartKondisi,
      #chartMantap {
        max-height: 200px !important;
      }

      .card.p-3 {
        padding: 10px !important;
      }

      .chart-header h5 {
        font-size: 14px;
      }
    }

    @media (max-width: 768px) {
      .kemantrean-item {
        font-size: 14px;
        padding: 6px 10px;
      }
    }
  </style>

<body>
  <div class="container-fluid my-4">
    <div class="row g-3">
      <div class="col-md-3">
        <div class="chart-header">
          <h5><span></span> STATISTIKA KONDISI JEMBATAN</h5>
        </div>
        <div class="card p-3 mb-3">
          <canvas id="chartKondisi"></canvas>
        </div>
      </div>
      <div class="col-md-3">
        <div class="chart-header">
          <h5><span></span> TABEL KONDISI JEMBATAN</h5>
        </div>
        <div class="card p-3">
          <table class="table table-bordered text-center align-middle" id="summaryTable">
            <thead class="table-light text-center" style="font-size: 12px;">
              <tr>
                <th onclick="sortTable(0)">Nilai</th>
                <th onclick="sortTable(1)">Kondisi</th>
                <th onclick="sortTable(2)">Jumlah</th>
                <th onclick="sortTable(3)">Persentase</th>
                <th onclick="sortTable(4)">Kemantapan</th>
              </tr>
            </thead>

            <tbody>
              <?php foreach ($kondisiMap as $k => $v):
                $jml = $statsKondisi[$k] ?? 0;
                $pct = $total ? number_format($jml / $total * 100, 2) : 0;
                $kemantapan = in_array($k, ['Baik','Rusak Ringan','Rusak Sedang'])
                  ? 'Mantap'
                  : 'Tidak Mantap';
              ?>
              <tr class="kondisi-<?= $v ?>">
                <td><?= $v ?></td>
                <td><?= $k ?></td>
                <td><?= $jml ?></td>
                <td><?= $pct ?>%</td>
                <td><?= $kemantapan ?></td>
              </tr>
              <?php endforeach; ?>
            </tbody>
            <tfoot>
              <tr class="fw-bold">
                <td colspan="2">Total</td>
                <td><?= $total ?></td>
                <td>100%</td>
                <td>-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <div class="col-md-6">
        <div class="chart-header">
          <h5><span></span> PETA SEBARAN JEMBATAN</h5>
        </div>
        <div class="card p-3">
          <div id="mapKemantrean" style="height:500px;"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const total = <?= $total ?>;
    const labels = <?= json_encode(array_keys($kondisiMap)) ?>;
    const dataValues = <?= json_encode(array_map(fn($k) => $statsKondisi[$k] ?? 0, array_keys($kondisiMap))) ?>;
    const colors = ['#22ff00ff', '#f6ff00ff', '#ffbb00ff', '#ff7373ff', '#c10000ff', '#4c0000ff'];
    const totalMantap = <?= ($statsKondisi['Baik'] ?? 0)
                     + ($statsKondisi['Rusak Ringan'] ?? 0)
                     + ($statsKondisi['Rusak Sedang'] ?? 0) ?>;
    const totalTidak = <?= ($statsKondisi['Rusak Berat'] ?? 0)
                        + ($statsKondisi['Kritis'] ?? 0)
                        + ($statsKondisi['Runtuh'] ?? 0) ?>;
    const ctx = document.getElementById('chartKondisi').getContext('2d');
    const kemantapanLabels = ['Mantap', 'Tidak Mantap'];
    const chartKondisi = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: dataValues,
            backgroundColor: colors,
            borderWidth: 1,
            hoverBorderColor: '#fc3cffff',
            hoverBorderWidth: 2,
            _isKemantapan: false,
            weight: 1
          },
          {
            data: [totalMantap, totalTidak],
            backgroundColor: ['#00ffd5ff', '#f12054ff'],
            borderWidth: 1,
            hoverBorderColor: '#fc3cffff',
            hoverBorderWidth: 2,
            _isKemantapan: true,
            weight: 0.6
          }
        ]
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 10 },
              generateLabels(chart) {
                let legends = [];
                chart.data.datasets.forEach((ds, di) => {
                  if (ds._isKemantapan) {
                    kemantapanLabels.forEach((lbl, i) => {
                      legends.push({
                        text: lbl,
                        fillStyle: ds.backgroundColor[i],
                        datasetIndex: di,
                        index: i
                      });
                    });
                  } else {
                    chart.data.labels.forEach((lbl, i) => {
                      legends.push({
                        text: lbl,
                        fillStyle: ds.backgroundColor[i],
                        datasetIndex: di,
                        index: i
                      });
                    });
                  }
                });
                return legends;
              }
            }
          },
          tooltip: {
          callbacks: {
            title(context) {
              const ds = context[0].dataset;
              const index = context[0].dataIndex;
              if (ds._isKemantapan) {
                return kemantapanLabels[index];
              }
              return labels[index];
            },
            label(context) {
              const ds = context.dataset;
              const index = context.dataIndex;
              const value = context.raw;
              if (ds._isKemantapan) {
                const label = kemantapanLabels[index];
                return `${label}: ${value} jembatan`;
              }
              const label = labels[index];
              const pct = total ? (value / total * 100).toFixed(1) : 0;
              return `${label}: ${value} jembatan (${pct}%)`;
            }
          }
        },
          datalabels: {
            color: '#000000ff',
            font: { weight: 'bold', size: 12 },
            clamp: true,
            formatter(value, context) {
              const ds = context.dataset;
              if (ds._isKemantapan) {
                const totalKM = ds.data[0] + ds.data[1];
                const pct = totalKM ? (value / totalKM * 100).toFixed(1) : 0;
                return pct > 0 ? pct + '%' : '';
              }
              const pct = total ? (value / total * 100).toFixed(1) : 0;
              return pct > 0 ? pct + '%' : '';
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });
    
    function sortTable(n) {
      const table = document.getElementById("summaryTable");
      let switching = true,
        dir = "asc";
      while (switching) {
        switching = false;
        let rows = table.rows;
        for (let i = 1; i < rows.length - 2; i++) {
          let shouldSwitch = false;
          let x = rows[i].getElementsByTagName("TD")[n];
          let y = rows[i + 1].getElementsByTagName("TD")[n];
          let xv = isNaN(x.innerHTML) ? x.innerHTML.toLowerCase() : parseFloat(x.innerHTML);
          let yv = isNaN(y.innerHTML) ? y.innerHTML.toLowerCase() : parseFloat(y.innerHTML);
          if ((dir == "asc" && xv > yv) || (dir == "desc" && xv < yv)) {
            shouldSwitch = true;
            break;
          }
        }
        if (shouldSwitch) {
          rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
          switching = true;
        } else if (dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
    const statsKemantren = <?= json_encode($statsKemantren) ?>;
    const statsKelurahan = <?= json_encode($statsKelurahan) ?>;
const batas = {
    "type": "FeatureCollection",
    "features": <?= json_encode($batas) ?>
};
const jembatan = <?= json_encode($jembatan) ?>;
    const map = L.map('mapKemantrean', {
      zoomControl: true
    }).setView([-7.802, 110.378], 13);
    const baseMaps = {
      "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }),
      "Google Satellite": L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '© Google Satellite'
      }),
      "Google Hybrid": L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        attribution: '© Google Hybrid'
      })
    };
    baseMaps["OpenStreetMap"].addTo(map);
    L.control.layers(baseMaps, null, {
      position: 'topleft'
    }).addTo(map);
    function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
const kemantrenColors = {};
batas.features.forEach(f => {
  kemantrenColors[f.properties.kemantren] = getRandomColor();
});
const kondisiPerKemantren = <?= json_encode($kondisiPerKemantren) ?>;
const kondisiPerKelurahan = <?= json_encode($kondisiPerKelurahan) ?>;
    const infoPanel = L.control({ position: 'topright' });

infoPanel.onAdd = function () {
  this._div = L.DomUtil.create('div', 'info-panel');
  this.update();
  return this._div;
};
infoPanel.update = function (props) {
  this._div.innerHTML = props ? `
    <div style="font-size:11px; line-height:1.3; padding:2px 4px;">
      <h6 class="fw-semibold text-primary mb-1" style="font-size:14px;">
        ${props.kemantren}
      </h6>
      <h6 class="fw-semibold text-warning mb-1" style="font-size:12px;">
        ${props.kelurahan}
      </h6>
      <p class="mb-1" style="font-size:11px;">
        Jumlah jembatan: 
        <strong style="color:#003366;">
          ${statsKelurahan[props.kelurahan] || 0}
        </strong>
      </p>
      <div style="
        margin-top:6px;
        padding-top:6px;
        border-top:1px solid #ddd;
        font-size:10px;
      ">
  <div style="display:flex; justify-content:space-between; margin:2px 0;">
    <span>Baik</span>
    <strong>${(kondisiPerKelurahan[props.kelurahan]?.["Baik"] ?? 0)}</strong>
  </div>
  <div style="display:flex; justify-content:space-between; margin:2px 0;">
    <span>Rusak Ringan</span>
    <strong>${(kondisiPerKelurahan[props.kelurahan]?.["Rusak Ringan"] ?? 0)}</strong>
  </div>
  <div style="display:flex; justify-content:space-between; margin:2px 0;">
    <span>Rusak Sedang</span>
    <strong>${(kondisiPerKelurahan[props.kelurahan]?.["Rusak Sedang"] ?? 0)}</strong>
  </div>
  <div style="display:flex; justify-content:space-between; margin:2px 0;">
    <span>Rusak Berat</span>
    <strong>${(kondisiPerKelurahan[props.kelurahan]?.["Rusak Berat"] ?? 0)}</strong>
  </div>
  <div style="display:flex; justify-content:space-between; margin:2px 0;">
    <span>Kritis</span>
    <strong>${(kondisiPerKelurahan[props.kelurahan]?.["Kritis"] ?? 0)}</strong>
  </div>
  <div style="display:flex; justify-content:space-between; margin:2px 0;">
    <span>Runtuh</span>
    <strong>${(kondisiPerKelurahan[props.kelurahan]?.["Runtuh"] ?? 0)}</strong>
  </div>
</div>
    </div>
  ` : `
    <div style="font-size:11px; line-height:1.3; padding:2px 4px;">
      <h6 class="fw-semibold text-primary mb-1" style="font-size:12px;">
        Info Kemantren
      </h6>
      <p class="text-muted mb-0" style="font-size:10px;">
        Klik kemantren untuk melihat detail.
      </p>
    </div>
  `;
};

infoPanel.addTo(map);
map.on('contextmenu', () => infoPanel.update());
    function highlightFeature(e) {
      const layer = e.target;
      layer.setStyle({
        weight: 3,
        color: '#003366',
        fillOpacity: 0.9
      });
      layer.bringToFront();
      infoPanel.update(layer.feature.properties);
    }
    function resetHighlight(e) {
      geojson.resetStyle(e.target);
      infoPanel.update();
    }
    function zoomToFeature(e) {
      map.fitBounds(e.target.getBounds());
    }
    function onEachFeature(feature, layer) {
      const kemantren = feature.properties.kemantren;
      const kelurahan = feature.properties.kelurahan;
      layer.bindTooltip(
        `<strong>${kemantren}</strong><br><strong>${kelurahan}</strong>`, {
          direction: 'top'
        }
      );
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
      });
    }
    const geojson = L.geoJSON(batas, {
  style: feature => ({
    color: 'white',
    weight: 2,
    fillColor: kemantrenColors[feature.properties.kemantren],
    fillOpacity: 0.36
  }),
  onEachFeature: onEachFeature
}).addTo(map);
const iconBaik = L.icon({
  iconUrl:'../assets/baik.png',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25]
});
const iconRingan = L.icon({
  iconUrl:'../assets/rusak ringan.png',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25]
});
const iconSedang = L.icon({
  iconUrl:'../assets/rusak sedang.png',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25]
});
const iconBerat = L.icon({
  iconUrl:'../assets/rusak berat.png',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25]
});

const iconKritis = L.icon({
  iconUrl:'../assets/kritis.png',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25]
});

const iconRuntuh = L.icon({
  iconUrl:'../assets/runtuh.png',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25]
});
function getBridgeIcon(kondisi) {
    switch (kondisi.toLowerCase()) {
        case "baik": return iconBaik;
        case "rusak ringan": return iconRingan;
        case "rusak sedang": return iconSedang;
        case "rusak berat": return iconBerat;
        case "kritis": return iconKritis;
        case "runtuh": return iconRuntuh;
        default: return iconBaik;
    }
}

const jembatanLayer = L.layerGroup();
jembatan.forEach(j => {
    if (j.latitude && j.longitude) {
        L.marker([parseFloat(j.latitude), parseFloat(j.longitude)], { icon: getBridgeIcon(j.kondisi) })
            .bindTooltip(`<strong>${j.nama}</strong><br>${j.kemantren} - ${j.kelurahan}<br>${j.kondisi}`, { direction: 'top' })
            .addTo(jembatanLayer);
    }
});
jembatanLayer.addTo(map);

    
  </script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>
