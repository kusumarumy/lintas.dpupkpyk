<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();
?>

<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LINTAS</title>
  <link href="css/style.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
  <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
  <meta http-equiv="Permissions-Policy" content="accelerometer=(), gyroscope=(), magnetometer=(), camera=()">

  <style>
    html {
      scroll-behavior: smooth;
    }

    :root {
      --biru-pupr: #003366;
      --kuning-pupr: #f2b705;
      --abu-lembut: #f9fafc;
      --abu-teks: #555;
      --putih: #ffffff;
    }

    html,
    body {
      margin-top: -40px;
      padding: 0;
      overflow-x: hidden;
      overflow-y: auto;
      font-family: 'Roboto', sans-serif;
      background-color: var(--abu-lembut);
      color: var(--abu-teks);
    }

    .main {
      margin-left: 0;
      min-height: 100vh;
      margin-top: -3px;
    }

    .hero-section {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }

    .bg-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }

    .hero-caption {
      position: relative;
      z-index: 2;
      text-align: center;
      color: #fff;
      top: 50%;
      transform: translateY(-50%);
      padding: 0 10%;
    }

    .hero-caption h1 {
      font-size: clamp(28px, 4vw, 55px);
      font-weight: 700;
      color: #fff;
    }

    .hero-caption p {
      font-size: 17px;
      line-height: 1.5;
      color: #f0f0f0;
      max-width: 800px;
      margin: 0 auto 20px auto;
    }

    .btn-explore {
      background-color: var(--kuning-pupr);
      color: var(--biru-pupr);
      border: none;
      border-radius: 20px;
      font-weight: 700;
      font-size: 14px;
      padding: 10px 24px;
      cursor: pointer;
      transition: 0.3s ease;
    }

    .btn-explore:hover {
      background-color: #ffd84d;
      transform: translateY(-3px);
    }

    .footer-custom {
      margin-top: 0;
      width: 100%;
      font-family: 'Roboto', sans-serif;
    }

    .footer-top {
      background-color: #003366;
      padding: 10px 0;
    }

    .footer-bottom {
      background-color: #f2b705;
      padding: 10px 5px;
      text-align: center;
    }

    .social-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      color: #fff;
      font-size: 1.2rem;
      transition: all 0.3s ease;
    }

    .social-icon:hover {
      background: #ffb400;
      color: #002b5b;
      transform: scale(1.1);
    }
    
    .social-links {
      display: flex;
      gap: 15px;
    }

    .map-container iframe {
      width: 100%;
      height: 368px;
      border: none;
      filter: grayscale(0.2) brightness(0.95);
      transition: all 0.5s ease;
    }

    .map-container:hover iframe {
      filter: grayscale(0) brightness(1);
    }

    .fitur-card {
      background: #fff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border-radius: 16px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .fitur-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    }

    .icon-wrapper {
      width: 80px;
      height: 80px;
      margin: 0 auto 10px auto;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0077b6 0%, #00b4d8 100%);
      color: white;
      font-size: 40px;
    }

    .fitur-info {
      font-size: 0.85rem;
      color: #6c757d;
      margin-top: 4px;
    }
    
    @media (max-width: 992px) {
      .map-container {
        margin-top: 20px;
      }
    }

    @media (max-width: 576px) {
      .social-links {
        justify-content: center;
      }
    }

    #fitur .fitur-card {
      position: relative;
      background: #ffffff;
      border: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 10px rgba(0, 51, 102, 0.05);
      cursor: pointer;
      overflow: hidden;
    }

    #fitur .fitur-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 10px 25px rgba(0, 51, 102, 0.15);
    }

    #fitur .icon-wrapper {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: #e9f2ff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      transition: all 0.3s ease;
    }

    #fitur .icon-wrapper i {
      font-size: 32px;
      color: #004aad;
      transition: all 0.3s ease;
    }

    #fitur .fitur-card:hover .icon-wrapper {
      background: #004aad;
      transform: scale(1.1);
    }

    #fitur .fitur-card:hover .icon-wrapper i {
      color: #fff;
    }

    #fitur h6 {
      color: #002b5b;
      margin-top: 0.5rem;
      font-weight: 600;
      font-size: 0.95rem;
    }

    #fitur .fitur-info {
      position: absolute;
      bottom: -100%;
      left: 0;
      right: 0;
      background: rgba(0, 42, 90, 0.95);
      color: #fff;
      font-size: 13px;
      padding: 0.8rem;
      opacity: 0;
      transition: all 0.35s ease;
      border-radius: 0 0 1rem 1rem;
    }

    #fitur .fitur-card:hover .fitur-info {
      bottom: 0;
      opacity: 1;
    }

    @media (max-width: 768px) {
      #fitur .icon-wrapper {
        width: 55px;
        height: 55px;
      }

      #fitur .icon-wrapper i {
        font-size: 26px;
      }

      #fitur h6 {
        font-size: 0.85rem;
      }
    }

    .footer-logo {
      height: 60px;
      width: auto;
    }

    .contact-info i:hover {
      animation: bounce 0.6s;
    }

    .about-section {
      background: linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
      padding: 80px 0;
    }

    .about-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .about-left {
      flex: 1;
      text-align: center;
    }

    .about-image {
      width: 100%;
      max-width: 500px;
      border-radius: 20px;
      object-fit: cover;
      transition: transform 0.6s ease, box-shadow 0.6s ease;
    }

    .about-image:hover {
      transform: scale(1.03);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .about-right {
      flex: 1;
      color: #1b1b1b;
    }

    .about-right h2 {
      font-size: 2.2rem;
      color: #002b5b;
    }

    .about-right h2 span {
      color: #ffb400;
    }

    .about-right p {
      font-size: 1rem;
      line-height: 1.8;
      color: #444;
      margin-bottom: 1rem;
    }

    @media (max-width: 992px) {
      .about-wrapper {
        flex-direction: column;
        text-align: center;
      }

      .about-right {
        padding: 0 15px;
      }

      .about-right h2 {
        font-size: 1.8rem;
      }

      .about-image {
        max-width: 400px;
        margin-bottom: 30px;
      }
    }

    @media (max-width: 576px) {
      .about-right p {
        font-size: 0.95rem;
      }

      .btn-learn-more {
        padding: 8px 18px;
        font-size: 0.9rem;
      }
    }

    .section-title h2 {
      font-size: 40px;
      font-weight: 800;
      color: var(--biru-pupr);
      margin-bottom: 8px;
    }

    .section-title h2 span {
      color: var(--kuning-pupr);
    }

    .underline {
      width: 80px;
      height: 4px;
      background: var(--kuning-pupr);
      margin-bottom: 30px;
      border-radius: 2px;
    }

    .about-right p {
      font-size: 17px;
      line-height: 1.8;
      color: #333;
      margin-bottom: 18px;
      text-align: justify;
    }

    .btn-learn-more {
      background: var(--biru-pupr);
      color: #fff;
      padding: 12px 30px;
      border-radius: 30px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: 0.3s ease;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
    }

    .btn-learn-more:hover {
      background: var(--kuning-pupr);
      color: var(--biru-pupr);
      transform: translateY(-3px);
    }
.hero-section {
  position: relative;
}

.hero-caption {
  position: absolute;
  top: 50%;                
  left: 50%;                
  transform: translate(-50%, -50%);
  width: 100%;
  padding: 0 20px;         
  text-shadow: 0 2px 8px rgba(0,0,0,0.7);
}
    @keyframes switchWord {

      0%,
      25% {
        transform: translateY(0);
      }

      50%,
      75% {
        transform: translateY(-1em);
      }

      100% {
        transform: translateY(0);
      }
    }

    @keyframes bounce {

      0%,
      20%,
      50%,
      80%,
      100% {
        transform: translateY(0);
      }

      40% {
        transform: translateY(-10px);
      }

      60% {
        transform: translateY(-5px);
      }
    }

    @media (max-width: 992px) {
      .about-wrapper {
        flex-direction: column;
      }

      .about-right {
        text-align: center;
      }

      .about-right p {
        text-align: justify;
      }

      .section-title h2 {
        text-align: center;
      }

      .underline {
        margin: 0 auto 30px auto;
      }
    }
  </style>
</head>

<body>
  <?php include __DIR__ . "/partials/header.php"; ?>

    <div class="hero-section position-relative">
  <img src="assets/profil.jpg" alt="Profil" style="width:100%; height:auto; display:block;">

  <div class="hero-caption text-center text-white">
    <h1 class="fw-bold">Layanan Informasi Jembatan Kota Yogyakarta</h1>
    <h1>(LINTAS)</h1>
  </div>
</div>
    <section id="tentang-lintas" class="about-section py-5" style="background:linear-gradient(180deg,#eaf5ff 0%,#ffffff 100%);">
      <div class="container">
        <div class="about-wrapper d-flex flex-column flex-lg-row align-items-center gap-5">
          <div class="about-left flex-shrink-0" data-aos="fade-right" data-aos-duration="1000">
            <img src="assets/background.jpg" alt="Jembatan Kota Yogyakarta" class="about-image rounded-4 shadow-lg">
          </div>
          <div class="about-right" data-aos="fade-left" data-aos-duration="1000">
            <div class="section-title mb-4">
              <h2 class="fw-bold">Tentang <span>LINTAS</span></h2>
              <div class="underline"></div>
            </div>
            <p class="lead">
              <strong>Layanan Informasi Jembatan Kota Yogyakarta (LINTAS)</strong> merupakan platform digital internal
              yang dikembangkan oleh <strong>Dinas Pekerjaan Umum, Perumahan dan Kawasan Permukiman Kota Yogyakarta</strong>.
            </p>
            <p>LINTAS menyajikan <strong>pemodelan 3D jembatan</strong>, kondisi lingkungan sekitar, serta informasi
              pendukung lainnya untuk mendukung proses pengelolaan, pemantauan, dan perencanaan infrastruktur jembatan.</p>
          </div>
        </div>
      </div>
    </section>
    <section id="fitur" class="py-5" style="background:linear-gradient(180deg,#eaf5ff 0%,#ffffff 100%);">
    <div class="container text-center">
      <h2 class="fw-bold mb-4" style="color:#002b5b;">
        Fitur Utama <span style="color:#ffb400;">WEBGIS LINTAS</span>
      </h2>
      <div class="row justify-content-center g-4">
        <?php
$fitur = [
    ["profil.png", "Profil DPUPKP, Bidang dan UPT Terkait", "Menampilkan profil DPUPKP dan beberapa bidang serta UPT terkait.", "#organisasi"],
    ["statistika.png", "Statistika Jembatan", "Menampilkan data statistik jumlah, kondisi, dan klasifikasi jembatan.", "/frontend/statistika.php"],
    ["modeling.png", "Pemodelan Jembatan", "Visualisasi 3D jembatan untuk analisis teknik.", "/frontend/detail_jembatan.php"],
];

foreach ($fitur as $f) {
    $isUser = isset($_SESSION['user']);
    $link = $isUser ? $f[3] : "#";
    $modalAttr = $isUser ? "" : "data-bs-toggle='modal' data-bs-target='#signinModal'";
    if($f[3] === "#organisasi") {
        $link = $f[3];
        $modalAttr = "";
    } else {
        $link = $isUser ? $f[3] : "#"; 
        $modalAttr = $isUser ? "" : "data-bs-toggle='modal' data-bs-target='#signinModal'";
    }
    echo "
    <div class='col-6 col-md-4 col-lg-2'>
        <a href='{$link}' {$modalAttr} style='text-decoration:none;'>
        <div class='fitur-card p-4 rounded-4 text-center'>
            <div class='icon-wrapper mb-3'>
                <img src='assets/{$f[0]}' alt='{$f[1]}' class='img-fluid fitur-icon'>
            </div>
            <h6 class='fw-bold mb-1'>{$f[1]}</h6>
            <div class='fitur-info'>{$f[2]}</div>
        </div>
        </a>
    </div>";
}
?>
      </div>
    </div>
  </section>
  <?php if(!isset($_SESSION['user'])): ?>
<div class="modal fade" id="signinModal" tabindex="-1" aria-labelledby="signinModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header" style="background-color:#f2b705;">
        <h5 class="modal-title" id="signinModalLabel" style="color: #fff; font-weight: bold">
          <i class="bi bi-info-circle-fill"></i> Informasi
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body text-center">
        <p style="font-size: 18px;">Silahkan Anda <b>Sign In</b> untuk mengakses fitur ini.</p>
      </div>
      <div class="modal-footer justify-content-center">
        <a href="/backend/auth/sign_in.php?redirect=<?php echo $_SERVER['REQUEST_URI']; ?>" class="btn btn-primary">
          <i class="bi bi-box-arrow-in-right"></i> Sign In
        </a>
      </div>
    </div>
  </div>
</div>
<?php endif; ?>
  
    <footer class="footer-custom">
      <div class="footer-top">
        <div class="container d-flex justify-content-between align-items-center">
          <div class="footer-left text-white d-flex align-items-center gap-3">
            <img src="assets/logo.png" alt="Logo DPUPKP" class="footer-logo">
            <p class="fw-semibold mb-0">
              Dinas Pekerjaan Umum, Perumahan dan Kawasan Permukiman<br>
              Kota Yogyakarta
            </p>
          </div>
          <div class="footer-right text-center">
            <h6 class="text-white fw-bold mb-2">Kontak Kami</h6>
            <div class="social-links d-flex justify-content-center gap-3">
              <a href="https://youtube.com/@dinaspupkpkotayogyakarta" class="social-icon"><i class="bi bi-youtube"></i></a>
              <a href="https://www.instagram.com/dpupkpkotajogja" class="social-icon"><i class="bi bi-instagram"></i></a>
              <a href="https://pu.jogjakota.go.id/" class="social-icon"><i class="bi bi-globe"></i></a>
              <a href="mailto:puperkim@jogjakota.go.id" class="social-icon"><i class="bi bi-envelope-fill"></i></a>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="text-black mb-0" style="font-weight: bold;">
          © Hak Cipta 2025 Dinas Pekerjaan Umum, Perumahan dan Kawasan Permukiman Kota Yogyakarta
        </p>
      </div>
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
      document.addEventListener("DOMContentLoaded", function() {
        AOS.init({
          duration: 1000,
          once: true
        });
      });
    </script>
  </body>
</html>
