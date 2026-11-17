<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}
?>
  <header class="header d-flex align-items-center justify-content-between px-4">
  <div class="logo-group d-flex align-items-center">
    <img src="/assets/jogja.png" alt="Logo Jogja">
    <img src="/assets/logo.png" alt="Logo DPUPKP">
    <div class="title-text">
      <h1>LINTAS</h1>
      <h2>Layanan Informasi Jembatan Kota Yogyakarta</h2>
      <h3>Dinas Pekerjaan Umum Perumahan dan Kawasan Permukiman</h3>
    </div>
  </div>
  <nav class="navbar navbar-expand-lg navbar-dark">
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item"><a class="nav-link" href="/index.php">Beranda</a></li>
        <?php if(isset($_SESSION['user'])): ?>
    <li class="nav-item"><a class="nav-link" href="/frontend/statistika.php">Statistika</a></li>
  <?php else: ?>
    <li class="nav-item">
      <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#signinModal">
        Statistika
      </a>
    </li>
  <?php endif; ?>

        <?php if(isset($_SESSION['user'])): ?>
    <li class="nav-item"><a class="nav-link" href="/frontend/detail_jembatan.php">Pemodelan 3D</a></li>
  <?php else: ?>
    <li class="nav-item">
      <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#signinModal">
        Pemodelan 3D
      </a>
    </li>
<?php endif; ?>

  <?php if(isset($_SESSION['user'])): ?>
    <li class="nav-item"><a class="nav-link" href="/backend/auth/signout.php">Sign Out</a></li>
  <?php else: ?>
    <li class="nav-item">
      <a class="nav-link" href="/backend/auth/signin.php">
        <i class="bi bi-box-arrow-in-right"></i> Sign In
      </a>
    </li>
  <?php endif; ?>
</ul>
    </div>
  </nav>
</header>
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
        <a href="/backend/auth/signin.php?redirect=<?php echo $_SERVER['REQUEST_URI']; ?>" class="btn btn-primary">
          <i class="bi bi-box-arrow-in-right"></i> Sign In
        </a>
      </div>
    </div>
  </div>
</div>
<?php endif; ?>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

<style>
  :root {
    --primary: #003366;
    --accent: #ffc20e;
    --font-main: 'Roboto', 'Inter', sans-serif;
  }
body {
  padding-top: 110px !important;
}
  .header {
    color: var(--primary);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 70px;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    font-family: var(--font-main);
    background-color: rgba(255, 255, 255, 0.4);
  }

  .logo-group img {
    height: 55px;
    margin-right: 10px;
  }

  .title-text h1 {
    font-size: 30px;
    font-weight: 700;
    margin: 0;
    letter-spacing: 1px;
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  }

  .title-text h2,
  .title-text h3 {
    font-size: 12px;
    color: var(--primary);
    font-weight: bold;
    margin: 0;
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  }

  .navbar-nav .nav-link {
    color: var(--primary) !important;
    font-weight: 500;
    padding: 0 12px;
  }

  .navbar-nav .nav-link:hover,
  .navbar-nav .nav-link:focus {
    color: var(--accent) !important;
  }

  .dropdown-menu {
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 6px;
    border: none;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  }
  
.dropdown-item {
    color: var(--primary);
  }
  
  .dropdown-item:hover {
    background-color: var(--accent);
    color: var(--primary);
    font-weight: 600;
  }

  @media (max-width: 992px) {
    .header {
      flex-wrap: wrap;
      height: auto;
      text-align: center;
      padding: 10px;
    }

    .navbar-collapse {
      width: 100%;
    }

    .navbar-nav {
      flex-direction: column;
      align-items: center;
      padding: 10px 0;
    }

    .nav-link {
      color: white !important;
    }
  }
</style>
