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
    
/* ==========================================
   LINTAS MODERN SEMI-3D HERO
========================================== */

.hero-section {
    position: relative;
    width: 100%;
    height: min(780px, 88vh);
    min-height: 580px;
    overflow: hidden;
    isolation: isolate;
    background: #003366;
}

/* Background image */

.hero-background {
    position: absolute;
    inset: 0;
    z-index: -3;
    overflow: hidden;
}

.hero-background img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 48%;
    transform: scale(1.04);
    animation: heroZoom 18s ease-in-out infinite alternate;
}

@keyframes heroZoom {
    from { transform: scale(1.04); }
    to   { transform: scale(1.12); }
}

/* Blue cinematic overlay */

.hero-overlay {
    position: absolute;
    inset: 0;
    z-index: -2;

    background:
        linear-gradient(
            90deg,
            rgba(0, 35, 75, .97) 0%,
            rgba(0, 51, 102, .91) 32%,
            rgba(0, 51, 102, .48) 62%,
            rgba(0, 30, 65, .20) 100%
        ),
        linear-gradient(
            0deg,
            rgba(0, 31, 65, .55),
            transparent 55%
        );
}

/* Geospatial grid decoration */

.hero-grid {
    position: absolute;
    inset: 0;
    z-index: -1;
    opacity: .16;

    background-image:
        linear-gradient(
            rgba(255,255,255,.12) 1px,
            transparent 1px
        ),
        linear-gradient(
            90deg,
            rgba(255,255,255,.12) 1px,
            transparent 1px
        );

    background-size: 65px 65px;

    mask-image: linear-gradient(
        90deg,
        black,
        transparent 75%
    );
}

/* Main content */

.hero-content {
    width: min(1200px, 90%);
    height: 100%;
    margin: auto;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 50px;
    padding: 70px 0;
}

/* Hero typography */

.hero-text {
    max-width: 690px;
    color: #fff;
    animation: heroFade .9s ease both;
}

.hero-label {
    display: inline-flex;
    align-items: center;
    gap: 10px;

    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;

    color: #ffd044;
    background: rgba(255,255,255,.10);

    border: 1px solid rgba(255,255,255,.22);
    border-radius: 30px;

    padding: 11px 18px;
    margin-bottom: 25px;

    backdrop-filter: blur(12px);
}

.hero-text h1 {
    font-size: clamp(34px, 4.3vw, 62px);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -1.5px;
    margin: 0;
    color: #fff;
}

.hero-text h1 span {
    color: #ffc400;
}

.hero-text h2 {
    font-size: clamp(38px, 4vw, 58px);
    font-weight: 900;
    letter-spacing: 7px;
    margin: 8px 0 15px;
    color: #fff;
}

.hero-line {
    width: 85px;
    height: 5px;
    border-radius: 10px;
    background: #f2b705;
    margin-bottom: 22px;
}

.hero-text p {
    max-width: 590px;
    font-size: 17px;
    line-height: 1.8;
    color: rgba(255,255,255,.88);
    margin-bottom: 30px;
}

/* Main button */

.hero-button {
    display: inline-flex;
    align-items: center;
    gap: 13px;

    padding: 15px 25px;
    border-radius: 12px;

    color: #003366;
    background: #f2b705;

    font-size: 14px;
    font-weight: 800;
    text-decoration: none;

    box-shadow: 0 12px 30px rgba(0,0,0,.22);

    transition: .3s ease;
}

.hero-button:hover {
    color: #003366;
    background: #ffd447;
    transform: translateY(-5px);
    box-shadow: 0 18px 35px rgba(0,0,0,.3);
}

/* Semi 3D floating panel */

.hero-floating-panel {
    width: 310px;
    flex-shrink: 0;

    padding: 25px;

    background: rgba(255,255,255,.13);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);

    border: 1px solid rgba(255,255,255,.35);
    border-radius: 22px;

    box-shadow:
        0 25px 60px rgba(0,0,0,.25),
        inset 0 1px 0 rgba(255,255,255,.25);

    transform: perspective(1000px) rotateY(-8deg) rotateX(3deg);

    animation: floatingPanel 5s ease-in-out infinite;
}

.floating-header {
    display: flex;
    align-items: center;
    gap: 9px;

    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.5px;

    color: #fff;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(255,255,255,.22);
}

.live-indicator {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #43e6a0;
    box-shadow: 0 0 12px #43e6a0;
}

.floating-item {
    display: flex;
    align-items: center;
    gap: 14px;

    padding: 17px 0;
    border-bottom: 1px solid rgba(255,255,255,.15);

    color: #fff;
}

.floating-icon {
    width: 43px;
    height: 43px;
    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    color: #003366;
    background: #f2b705;

    border-radius: 12px;
    font-size: 21px;
}

.floating-item strong {
    display: block;
    font-size: 14px;
}

.floating-item small {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: rgba(255,255,255,.75);
}

.floating-footer {
    padding-top: 18px;
    color: #ffd044;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 2px;
}

@keyframes floatingPanel {
    0%, 100% {
        transform: perspective(1000px)
                   rotateY(-8deg)
                   rotateX(3deg)
                   translateY(0);
    }

    50% {
        transform: perspective(1000px)
                   rotateY(-5deg)
                   rotateX(1deg)
                   translateY(-12px);
    }
}

/* Scroll indicator */

.hero-scroll {
    position: absolute;
    bottom: 25px;
    left: 50%;
    transform: translateX(-50%);

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    color: rgba(255,255,255,.8);
    font-size: 10px;
    letter-spacing: 2px;
}

.hero-scroll i {
    font-size: 20px;
    animation: scrollDown 1.5s infinite;
}

@keyframes scrollDown {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(7px); }
}

@keyframes heroFade {
    from {
        opacity: 0;
        transform: translateY(25px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive */

@media(max-width: 992px) {
    .hero-section {
        height: auto;
        min-height: 720px;
    }

    .hero-content {
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 30px;
        padding: 100px 0 80px;
    }

    .hero-floating-panel {
        width: min(100%, 420px);
        transform: none;
        animation: none;
    }
}

@media(max-width: 576px) {
    .hero-section {
        min-height: 750px;
    }

    .hero-content {
        width: 88%;
        padding-top: 75px;
    }

    .hero-text h1 {
        font-size: 34px;
    }

    .hero-text h2 {
        font-size: 40px;
    }

    .hero-text p {
        font-size: 14px;
    }

    .hero-label {
        font-size: 9px;
    }

    .hero-floating-panel {
        padding: 18px;
    }

    .hero-scroll {
        display: none;
    }
}

@media(prefers-reduced-motion: reduce) {
    .hero-background img,
    .hero-floating-panel,
    .hero-text,
    .hero-scroll i {
        animation: none !important;
    }
}

/* =========================================
   LINTAS - FINAL HOMEPAGE MOCKUP DESIGN
========================================= */

html {
    scroll-behavior: smooth;
}

html,
body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100%;
    overflow-x: hidden;
    font-family: 'Roboto', sans-serif;
}

body {
    background: #f4f8ff;
}

/* HERO */

.hero-section {
    position: relative;
    width: 100%;
    height: min(780px, 92vh);
    min-height: 650px;
    overflow: hidden;
    isolation: isolate;
    background: #003366;
}

/* Background image */

.hero-background {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
}

.hero-background img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 48%;
    transform: scale(1.04);
    animation: heroZoom 20s ease-in-out infinite alternate;
}

@keyframes heroZoom {
    from { transform: scale(1.04); }
    to { transform: scale(1.13); }
}

/* Overlay */

.hero-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;

    background:
        linear-gradient(
            90deg,
            rgba(0,31,70,.91) 0%,
            rgba(0,43,88,.79) 32%,
            rgba(0,43,88,.37) 62%,
            rgba(0,30,65,.10) 100%
        ),
        linear-gradient(
            0deg,
            rgba(0,31,65,.62) 0%,
            transparent 50%
        );
}

/* Grid decoration */

.hero-grid {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    opacity: .13;

    background-image:
        linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px);

    background-size: 65px 65px;

    mask-image: linear-gradient(
        90deg,
        black,
        transparent 80%
    );
}

/* Main content */

.hero-content {
    position: relative;
    z-index: 3;

    width: min(1440px, 88%);
    height: 100%;
    margin: auto;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 45px;
    padding: 100px 0 70px;
}

/* LEFT TEXT */

.hero-text {
    max-width: 720px;
    color: #fff;
    animation: heroFade .9s ease both;
}

.hero-label {
    display: inline-flex;
    align-items: center;
    gap: 10px;

    padding: 11px 17px;
    margin-bottom: 23px;

    color: #fff;
    background: rgba(0,75,135,.42);

    border: 1px solid rgba(255,255,255,.4);
    border-radius: 30px;

    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;

    backdrop-filter: blur(10px);
}

.hero-label i {
    color: #ffc20e;
    font-size: 17px;
}

.hero-text h1 {
    font-size: clamp(36px, 4vw, 59px);
    font-weight: 800;
    line-height: 1.12;
    letter-spacing: -1.5px;
    color: #fff;
    margin: 0;
}

.hero-text h1 span {
    color: #ffc20e;
}

.hero-line {
    width: 110px;
    height: 5px;
    border-radius: 10px;
    background: #ffc20e;
    margin: 23px 0;
}

.hero-text p {
    max-width: 570px;
    font-size: 17px;
    line-height: 1.55;
    color: rgba(255,255,255,.94);
    margin-bottom: 28px;
}

/* CTA BUTTON */

.hero-button {
    display: inline-flex;
    align-items: center;
    gap: 12px;

    padding: 15px 26px;

    background: linear-gradient(135deg,#ffcf29,#f2b705);
    color: #003366;

    border-radius: 40px;
    text-decoration: none;

    font-size: 15px;
    font-weight: 800;

    box-shadow: 0 12px 30px rgba(0,0,0,.25);
    transition: .3s ease;
}

.hero-button:hover {
    background: #ffdc58;
    color: #003366;
    transform: translateY(-4px);
    box-shadow: 0 18px 35px rgba(0,0,0,.32);
}

/* RIGHT GLASS PANEL */

.hero-floating-panel {
    width: 285px;
    flex-shrink: 0;

    padding: 23px 20px;

    background: rgba(0,55,105,.69);

    border: 1px solid rgba(255,255,255,.42);
    border-radius: 22px;

    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);

    box-shadow:
        0 25px 55px rgba(0,0,0,.30),
        inset 0 1px 0 rgba(255,255,255,.25);

    transform: perspective(1000px) rotateY(-5deg);

    animation: floatingPanel 5s ease-in-out infinite;
}

.floating-header {
    display: flex;
    align-items: center;
    gap: 10px;

    padding-bottom: 17px;

    color: white;
    font-size: 15px;
    font-weight: 800;

    border-bottom: 1px solid rgba(255,255,255,.2);
}

.live-indicator {
    width: 11px;
    height: 11px;
    background: #28ed91;
    border-radius: 50%;
    box-shadow: 0 0 12px #28ed91;
}

.floating-item {
    display: flex;
    align-items: center;
    gap: 14px;

    padding: 16px 0;

    color: white;
    border-bottom: 1px solid rgba(255,255,255,.17);
}

.floating-icon {
    width: 48px;
    height: 48px;
    flex-shrink: 0;

    display: flex;
    justify-content: center;
    align-items: center;

    background: rgba(255,255,255,.16);
    border: 1px solid rgba(255,255,255,.16);
    border-radius: 12px;

    color: #fff;
    font-size: 24px;
}

.floating-item strong {
    display: block;
    font-size: 14px;
}

.floating-item small {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: rgba(255,255,255,.78);
}

.floating-footer {
    padding-top: 16px;
    color: #ffc20e;
    font-size: 12px;
    font-weight: 800;
}

.floating-footer-line {
    width: 110px;
    height: 4px;
    background: #ffc20e;
    border-radius: 10px;
    margin-bottom: 10px;
}

@keyframes floatingPanel {
    0%,100% {
        transform: perspective(1000px)
                   rotateY(-5deg)
                   translateY(0);
    }

    50% {
        transform: perspective(1000px)
                   rotateY(-3deg)
                   translateY(-10px);
    }
}

/* SCROLL */

.hero-scroll {
    position: absolute;
    z-index: 4;
    bottom: 33px;
    left: 50%;
    transform: translateX(-50%);

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;

    color: white;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
}

.hero-scroll i {
    font-size: 19px;
}

.hero-scroll i:last-child {
    animation: scrollDown 1.5s infinite;
}

@keyframes scrollDown {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(7px); }
}

/* HERO TO ABOUT TRANSITION */

.hero-section::after {
    content: "";
    position: absolute;
    z-index: 5;
    bottom: -54px;
    left: -5%;
    width: 110%;
    height: 95px;

    background: #f4f8ff;
    border-radius: 50% 50% 0 0;
}

/* ABOUT SECTION */

.about-section {
    position: relative;
    background: linear-gradient(
        180deg,
        #f4f8ff 0%,
        #ffffff 100%
    ) !important;

    padding: 75px 0 85px !important;
}

.about-wrapper {
    gap: 55px !important;
}

.about-image {
    width: 100%;
    max-width: 590px;
    height: 350px;
    object-fit: cover;
    border: 2px solid rgba(255,255,255,.9);
    box-shadow: 0 15px 40px rgba(0,51,102,.18);
}

.about-right h2 {
    font-size: 40px;
    font-weight: 800;
    color: #003366;
}

.about-right h2 span {
    color: #f2b705;
}

.about-right p {
    font-size: 17px;
    line-height: 1.55;
    color: #263b56;
    text-align: left;
}

/* FEATURE SECTION */

#fitur {
    background: #f4f8ff !important;
}

/* RESPONSIVE */

@media(max-width: 992px) {
    .hero-section {
        height: auto;
        min-height: 900px;
    }

    .hero-content {
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 35px;
        padding: 140px 0 100px;
    }

    .hero-text {
        max-width: 100%;
    }

    .hero-floating-panel {
        width: min(100%, 420px);
        transform: none;
        animation: none;
    }

    .hero-section::after {
        bottom: -60px;
    }
}

@media(max-width: 576px) {
    .hero-section {
        min-height: 850px;
    }

    .hero-content {
        width: 88%;
        padding-top: 125px;
    }

    .hero-text h1 {
        font-size: 35px;
    }

    .hero-text p {
        font-size: 14px;
    }

    .hero-label {
        font-size: 9px;
        padding: 9px 12px;
    }

    .hero-floating-panel {
        padding: 18px;
    }

    .hero-scroll {
        display: none;
    }

    .about-image {
        height: 250px;
    }

    .about-right h2 {
        font-size: 30px;
    }

    .about-right p {
        font-size: 15px;
    }
}

@media(prefers-reduced-motion: reduce) {
    .hero-background img,
    .hero-floating-panel,
    .hero-scroll i {
        animation: none !important;
    }
}

  </style>
</head>

<body>
  <?php include __DIR__ . "/partials/header.php"; ?>

<section class="hero-section">

    <!-- Foto drone sebagai background utama -->
    <div class="hero-background">
        <img src="assets/profil.jpg"
             alt="Landscape infrastruktur jembatan Kota Yogyakarta">
    </div>

    <!-- Overlay sinematik -->
    <div class="hero-overlay"></div>

    <!-- Ornamen geospasial -->
    <div class="hero-grid"></div>

    <div class="hero-content">

        <!-- Konten sebelah kiri -->
        <div class="hero-text">

            <span class="hero-label">
                <i class="bi bi-geo-alt-fill"></i>
                GEOSPATIAL INFORMATION SYSTEM
            </span>

            <h1>
                Layanan Informasi<br>
                <span>Jembatan Kota Yogyakarta</span>
                <br>(LINTAS)
            </h1>

            <div class="hero-line"></div>

            <p>
                Platform informasi geospasial untuk visualisasi,
                pemantauan, pengelolaan, dan perencanaan
                infrastruktur jembatan Kota Yogyakarta.
            </p>

            <a href="#fitur" class="hero-button">
                <i class="bi bi-map-fill"></i>
                Jelajahi WebGIS
                <i class="bi bi-chevron-right"></i>
            </a>

        </div>

        <!-- Panel informasi sebelah kanan -->
        <div class="hero-floating-panel">

            <div class="floating-header">
                <span class="live-indicator"></span>
                Informasi Geospasial
            </div>

            <div class="floating-item">
                <div class="floating-icon">
                    <i class="bi bi-cone-striped"></i>
                </div>

                <div>
                    <strong>Data Jembatan</strong>
                    <small>Informasi Infrastruktur</small>
                </div>
            </div>

            <div class="floating-item">
                <div class="floating-icon">
                    <i class="bi bi-geo-alt-fill"></i>
                </div>

                <div>
                    <strong>Data Spasial</strong>
                    <small>Informasi Lokasi</small>
                </div>
            </div>

            <div class="floating-item">
                <div class="floating-icon">
                    <i class="bi bi-box"></i>
                </div>

                <div>
                    <strong>Pemodelan 3D</strong>
                    <small>Visualisasi Infrastruktur</small>
                </div>
            </div>

            <div class="floating-footer">
                <div class="floating-footer-line"></div>
                DPUPKP KOTA YOGYAKARTA
            </div>

        </div>

    </div>

    <div class="hero-scroll">
        <i class="bi bi-mouse"></i>
        <span>SCROLL UNTUK MENJELAJAHI</span>
        <i class="bi bi-chevron-down"></i>
    </div>

</section>

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
