
<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$isUser = isset($_SESSION['user']);
?>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

<header class="lintas-header">
    <a href="/index.php" class="header-brand">
        <img src="/assets/jogja.png" alt="Logo Pemerintah Kota Yogyakarta">
        <img src="/assets/logo.png" alt="Logo DPUPKP">

        <div class="header-brand-text">
            <h1>LINTAS</h1>
            <p>Layanan Informasi Jembatan<br>Kota Yogyakarta</p>
        </div>
    </a>

    <button class="mobile-toggle" type="button"
            data-bs-toggle="collapse"
            data-bs-target="#lintasNavigation"
            aria-label="Buka navigasi">
        <i class="bi bi-list"></i>
    </button>

    <nav class="lintas-navigation collapse" id="lintasNavigation">
        <a href="/index.php" class="nav-link-custom active">
            <i class="bi bi-house-door-fill"></i>
            <span>Beranda</span>
        </a>

        <?php if ($isUser): ?>
            <a href="/frontend/statistika.php" class="nav-link-custom">
                <i class="bi bi-bar-chart-line-fill"></i>
                <span>Statistika</span>
            </a>

            <a href="/frontend/persebaran.php" class="nav-link-custom">
                <i class="bi bi-layers-fill"></i>
                <span>Persebaran</span>
            </a>

            <a href="/frontend/detail_jembatan.php" class="nav-link-custom">
                <i class="bi bi-box"></i>
                <span>Pemodelan 3D</span>
            </a>

            <a href="/backend/auth/signout.php" class="nav-link-custom">
                <i class="bi bi-box-arrow-right"></i>
                <span>Sign Out</span>
            </a>
        <?php else: ?>
            <a href="#" class="nav-link-custom"
               data-bs-toggle="modal" data-bs-target="#signinModal">
                <i class="bi bi-bar-chart-line-fill"></i>
                <span>Statistika</span>
            </a>

            <a href="#" class="nav-link-custom"
               data-bs-toggle="modal" data-bs-target="#signinModal">
                <i class="bi bi-layers-fill"></i>
                <span>Persebaran</span>
            </a>

            <a href="#" class="nav-link-custom"
               data-bs-toggle="modal" data-bs-target="#signinModal">
                <i class="bi bi-box"></i>
                <span>Pemodelan 3D</span>
            </a>
        <?php endif; ?>
    </nav>
</header>

<style>
.lintas-header {
    position: fixed;
    top: 16px;
    left: 4%;
    width: 92%;
    height: 74px;
    z-index: 10000;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 8px 30px;

    background: rgba(255,255,255,.83);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);

    border: 1px solid rgba(255,255,255,.8);
    border-radius: 22px;

    box-shadow: 0 8px 30px rgba(0,35,75,.14);
}

.header-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    min-width: 0;
}

.header-brand img {
    height: 53px;
    width: auto;
    object-fit: contain;
}

.header-brand-text h1 {
    color: #003366;
    font-size: 25px;
    font-weight: 900;
    letter-spacing: 1px;
    margin: 0;
}

.header-brand-text p {
    color: #003366;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.25;
    margin: 0;
}

.lintas-navigation {
    display: flex;
    align-items: center;
    gap: 18px;
}

.nav-link-custom {
    position: relative;
    min-width: 100px;
    padding: 9px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    color: #003366;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    transition: .3s ease;
}

.nav-link-custom i {
    font-size: 22px;
}

.nav-link-custom:hover {
    color: #e9a900;
    transform: translateY(-2px);
}

.nav-link-custom.active::after {
    content: "";
    position: absolute;
    bottom: -8px;
    width: 65%;
    height: 4px;
    background: #f2b705;
    border-radius: 5px;
}

.mobile-toggle {
    display: none;
    border: 0;
    background: transparent;
    color: #003366;
    font-size: 28px;
}

@media(max-width: 992px) {
    .lintas-header {
        left: 3%;
        width: 94%;
        height: auto;
        min-height: 68px;
        padding: 8px 16px;
        flex-wrap: wrap;
    }

    .header-brand img {
        height: 43px;
    }

    .header-brand-text h1 {
        font-size: 21px;
    }

    .header-brand-text p {
        font-size: 9px;
    }

    .mobile-toggle {
        display: block;
    }

    .lintas-navigation {
        display: none;
        width: 100%;
        padding: 15px 0 8px;
        flex-direction: column;
        gap: 5px;
    }

    .lintas-navigation.show {
        display: flex;
    }

    .nav-link-custom {
        flex-direction: row;
        justify-content: center;
        width: 100%;
        padding: 10px;
    }

    .nav-link-custom.active::after {
        display: none;
    }
}
</style>
