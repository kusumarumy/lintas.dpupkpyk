
const homeContent = `
<div class="home-landing">

  <!-- HERO -->
  <section class="hero-section">

    <img
      class="hero-background"
      src="assets/profil.JPG"
      alt="Tampilan udara kawasan jembatan Kota Yogyakarta"
    >

    <div class="hero-overlay"></div>
    <div class="hero-grid-pattern"></div>

    <div class="hero-inner">

      <!-- KONTEN KIRI -->
      <div class="hero-copy">

        <div class="hero-eyebrow">
          <i class="bi bi-geo-alt-fill"></i>
          <span>GEOSPATIAL INFORMATION SYSTEM</span>
        </div>

        <h1>
          <span class="hero-title-white">Layanan Informasi</span>
          <span class="hero-title-yellow">Jembatan Kota Yogyakarta</span>
          <span class="hero-title-white">(LINTAS)</span>
        </h1>

        <div class="hero-title-line"></div>

        <p class="hero-description">
          Platform informasi geospasial untuk visualisasi,
          pemantauan, pengelolaan, dan perencanaan
          infrastruktur jembatan Kota Yogyakarta.
        </p>

        <a href="/persebaran" class="hero-cta">
          <i class="bi bi-map-fill"></i>
          <span>Jelajahi WebGIS</span>
          <i class="bi bi-chevron-right"></i>
        </a>

      </div>

      <!-- KARTU INFORMASI KANAN -->
      <aside class="hero-info-card">

        <div class="hero-info-heading">
          <span class="status-dot"></span>
          <strong>Informasi Geospasial</strong>
        </div>

        <div class="hero-info-item">
          <div class="hero-info-icon">
            <i class="bi bi-cone-striped"></i>
          </div>
          <div>
            <strong>Data Jembatan</strong>
            <span>Informasi Infrastruktur</span>
          </div>
        </div>

        <div class="hero-info-item">
          <div class="hero-info-icon">
            <i class="bi bi-geo-alt-fill"></i>
          </div>
          <div>
            <strong>Data Spasial</strong>
            <span>Informasi Lokasi</span>
          </div>
        </div>

        <div class="hero-info-item">
          <div class="hero-info-icon">
            <i class="bi bi-box"></i>
          </div>
          <div>
            <strong>Pemodelan 3D</strong>
            <span>Visualisasi Infrastruktur</span>
          </div>
        </div>

        <div class="hero-card-footer">
          <span></span>
          <strong>DPUPKP KOTA YOGYAKARTA</strong>
        </div>

      </aside>

    </div>

    <div class="hero-scroll-indicator">
      <i class="bi bi-mouse"></i>
      <span>
        <i class="bi bi-chevron-down"></i>
        <i class="bi bi-chevron-down"></i>
        SCROLL UNTUK MENJELAJAHI
      </span>
    </div>

    <!-- LENGKUNGAN BAWAH HERO -->
    <svg class="hero-wave" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,65 C250,5 440,30 680,62 C930,95 1190,55 1440,12 L1440,100 L0,100 Z" fill="#ffffff"/>
    </svg>

  </section>

  <!-- TENTANG LINTAS -->
  <section id="tentang-lintas" class="about-section">
    <div class="about-container">

      <div class="about-left" data-aos="fade-right">
        <img
          src="assets/background.jpg"
          alt="Jembatan dan kawasan Kota Yogyakarta"
          class="about-image"
        >
      </div>

      <div class="about-right" data-aos="fade-left">

        <div class="about-heading">
          <h2>Tentang <span>LINTAS</span></h2>
          <div class="about-underline"></div>
        </div>

        <p>
          <strong>Layanan Informasi Jembatan Kota Yogyakarta (LINTAS)</strong>
          merupakan platform digital internal yang dikembangkan oleh
          <strong>Dinas Pekerjaan Umum, Perumahan dan Kawasan Permukiman
          Kota Yogyakarta.</strong>
        </p>

        <p>
          LINTAS menyajikan <strong>pemodelan 3D jembatan</strong>,
          kondisi lingkungan sekitar, serta informasi pendukung lainnya
          untuk mendukung proses pengelolaan, pemantauan, dan perencanaan
          infrastruktur jembatan.
        </p>

      </div>

    </div>
  </section>

  <!-- FITUR -->
  <section id="fitur" class="features-section">
    <div class="features-container">

      <div class="features-heading">
        <span>LAYANAN DIGITAL</span>
        <h2>Fitur Utama <strong>WEBGIS LINTAS</strong></h2>
        <p>Akses informasi dan visualisasi infrastruktur jembatan Kota Yogyakarta.</p>
      </div>

      <div class="features-grid">

        <a href="#organisasi" class="feature-card">
          <div class="feature-icon"><i class="bi bi-building"></i></div>
          <h3>Profil DPUPKP</h3>
          <p>Profil DPUPKP, bidang, dan UPT terkait.</p>
        </a>

        <a href="/statistika" class="feature-card">
          <div class="feature-icon"><i class="bi bi-bar-chart-line-fill"></i></div>
          <h3>Statistika Jembatan</h3>
          <p>Statistik jumlah, kondisi, dan klasifikasi jembatan.</p>
        </a>

        <a href="/pemodelan-3d" class="feature-card">
          <div class="feature-icon"><i class="bi bi-box"></i></div>
          <h3>Pemodelan 3D</h3>
          <p>Visualisasi tiga dimensi infrastruktur jembatan.</p>
        </a>

        <a href="/jembatan" class="feature-card">
          <div class="feature-icon"><i class="bi bi-geo-alt-fill"></i></div>
          <h3>Daftar Jembatan</h3>
          <p>Informasi enam jembatan di Kota Yogyakarta.</p>
        </a>

      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer-custom">
    <div class="footer-top">
      <div class="footer-container">

        <div class="footer-left">
          <img src="assets/logo.png" alt="Logo DPUPKP" class="footer-logo">
          <p>
            Dinas Pekerjaan Umum, Perumahan dan Kawasan Permukiman<br>
            Kota Yogyakarta
          </p>
        </div>

        <div class="footer-right">
          <h3>Kontak Kami</h3>
          <div class="social-links">
            <a href="https://youtube.com/@dinaspupkpkotayogyakarta" class="social-icon" aria-label="YouTube">
              <i class="bi bi-youtube"></i>
            </a>
            <a href="https://www.instagram.com/dpupkpkotajogja" class="social-icon" aria-label="Instagram">
              <i class="bi bi-instagram"></i>
            </a>
            <a href="https://pu.jogjakota.go.id/" class="social-icon" aria-label="Website DPUPKP">
              <i class="bi bi-globe"></i>
            </a>
            <a href="mailto:puperkim@jogjakota.go.id" class="social-icon" aria-label="Email">
              <i class="bi bi-envelope-fill"></i>
            </a>
          </div>
        </div>

      </div>
    </div>

    <div class="footer-bottom">
      © Hak Cipta 2025 Dinas Pekerjaan Umum, Perumahan dan Kawasan Permukiman Kota Yogyakarta
    </div>
  </footer>

</div>
`;
export default homeContent;
