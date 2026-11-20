<?php
include '../backend/db/koneksi.php';

$sql_jembatan = "SELECT id, nama, kemantren, kelurahan, latitude, longitude, geotagging, kondisi, status_op, ruas_jalan, no_ruas, panjang, lebar, sungai, bentang, km_post, rekap, tipe_sa, kondisi_sa, tipe_sl, kondisi_sl, tipe_p, kondisi_p, tipe_ab, kondisi_ab, tipe_fon, kondisi_po, tipe_din, kondisi_di, kondisi_hu, kemantapan 
                 FROM jembatan 
                 WHERE latitude IS NOT NULL AND longitude IS NOT NULL";
$result_jembatan = $conn->query($sql_jembatan);
$jembatan = [];
while ($row = $result_jembatan->fetch_assoc()) $jembatan[] = $row;

$sql_batas = "SELECT id_kel, kemantren, kelurahan, luas, ST_AsGeoJSON(geometri) AS geojson 
              FROM batas_administrasi";
$result_batas = $conn->query($sql_batas);
$batas = [];
while ($row = $result_batas->fetch_assoc()) {
    $geo = json_decode($row['geojson'], true);
    if ($geo) {
        $batas[] = [
            "type" => "Feature",
            "geometry" => $geo,
            "properties" => [
                "id_kel" => $row['id_kel'],
                "kemantren" => $row['kemantren'],
                "kelurahan" => $row['kelurahan'],
                "luas" => $row['luas']
            ]
        ];
    }
}

$sql_jalan_kota = "SELECT id_jalan, nama_jalan, ST_AsGeoJSON(geometri) AS geojson FROM jalan_kota";
$result_jalan_kota = $conn->query($sql_jalan_kota);
$jalan_kota = [];
while ($row = $result_jalan_kota->fetch_assoc()) {
    $geo = json_decode($row['geojson'], true);
    if ($geo) {
        $jalan_kota[] = [
            "type" => "Feature",
            "geometry" => $geo,
            "properties" => [
                "id_jalan" => $row['id_jalan'],
                "nama_jalan" => $row['nama_jalan']
            ]
        ];
    }
}

$sql_jalan_lingkungan = "SELECT id_jalan, nama_jalan, ST_AsGeoJSON(geometri) AS geojson FROM jalan_lingkungan";
$result_jalan_lingkungan = $conn->query($sql_jalan_lingkungan);
$jalan_lingkungan = [];
while ($row = $result_jalan_lingkungan->fetch_assoc()) {
    $geo = json_decode($row['geojson'], true);
    if ($geo) {
        $jalan_lingkungan[] = [
            "type" => "Feature",
            "geometry" => $geo,
            "properties" => [
                "id_jalan" => $row['id_jalan'],
                "nama_jalan" => $row['nama_jalan']
            ]
        ];
    }
}
?>
