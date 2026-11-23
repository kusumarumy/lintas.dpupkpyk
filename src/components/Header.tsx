
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { r2Asset } from "@/lib/assets";
import "./Header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setMenuOpen(false);

  const isActive = (path: string) =>
    pathname === path ? "active" : "";

  
const isHome = pathname === "/";

return (
  <header className={`lintas-header ${isHome ? "lintas-header-home" : ""}`}>
    <div className="lintas-header-container">
      <Link
        href="/"
        className="lintas-brand"
        onClick={closeMenu}
        aria-label="LINTAS Beranda"
      >
        <div className="lintas-brand-logos">
          <img
            src={r2Asset("jogja.png")}
            alt="Logo Pemerintah Kota Yogyakarta"
            className="lintas-logo lintas-logo-jogja"
          />
          <img
            src={r2Asset("logo.png")}
            alt="Logo DPUPKP"
            className="lintas-logo lintas-logo-dpupkp"
          />
        </div>

        <div className="lintas-brand-text">
          <span className="lintas-brand-title">LINTAS</span>
          <span className="lintas-brand-subtitle">
            Layanan Informasi Jembatan
          </span>
          <span className="lintas-brand-agency">Kota Yogyakarta</span>
        </div>
      </Link>

      <button
        type="button"
        className={`lintas-menu-toggle ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Buka atau tutup menu navigasi"
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        className={`lintas-navigation ${menuOpen ? "open" : ""}`}
        aria-label="Navigasi utama"
      >
        <Link href="/" className={isActive("/")} onClick={closeMenu}>
          <i className="bi bi-house-door-fill" aria-hidden="true" />
          <span>Beranda</span>
        </Link>

        <Link href="/statistika" className={isActive("/statistika")} onClick={closeMenu}>
          <i className="bi bi-bar-chart-line" aria-hidden="true" />
          <span>Statistika</span>
        </Link>

        <Link href="/persebaran" className={isActive("/persebaran")} onClick={closeMenu}>
          <i className="bi bi-stack" aria-hidden="true" />
          <span>Persebaran</span>
        </Link>

        <Link href="/pemodelan-3d" className={isActive("/pemodelan-3d")} onClick={closeMenu}>
          <i className="bi bi-box" aria-hidden="true" />
          <span>Pemodelan 3D</span>
        </Link>
      </nav>
    </div>
  </header>
);

}
