
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { r2Asset } from "@/lib/assets";
import "./Header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [loginRedirect, setLoginRedirect] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  // Gaya header mengambang seperti Beranda di semua halaman
  const isHome = true;

  useEffect(() => {
    let active = true;

    async function checkSession() {
      setAuthChecked(false);

      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });

        const data = await response.json();

        if (active) {
          setAuthenticated(
            response.ok && data.authenticated === true
          );
        }
      } catch {
        if (active) setAuthenticated(false);
      } finally {
        if (active) setAuthChecked(true);
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [pathname]);

  const closeMenu = () => setMenuOpen(false);

  const isActive = (path: string) =>
    pathname === path ? "active" : "";

  // Pemeriksaan akses fitur WebGIS
  function handleProtectedNavigation(
    e: MouseEvent<HTMLAnchorElement>,
    target: string
  ) {
    closeMenu();

    if (!authChecked) {
      e.preventDefault();
      return;
    }

    if (!authenticated) {
      e.preventDefault();
      setLoginRedirect(target);
    }
  }

  // Menuju halaman Sign In
  function goToLogin() {
    if (!loginRedirect) return;

    const target = loginRedirect;
    setLoginRedirect(null);

    router.push(
      `/login?redirect=${encodeURIComponent(target)}`
    );
  }

  // Tutup modal
  function closeLoginModal() {
    setLoginRedirect(null);
  }

  // Sign Out
  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Gagal keluar dari akun.");
      }

      setAuthenticated(false);
      closeMenu();

      router.replace("/login");
      router.refresh();
    } catch {
      setLogoutError(
        "Tidak dapat keluar. Silakan coba kembali."
      );
      setLoggingOut(false);
    }
  }

  const destinationName =
    loginRedirect === "/statistika"
      ? "Statistika"
      : loginRedirect === "/persebaran"
        ? "Persebaran Jembatan"
        : "Pemodelan 3D";

  return (
    <>
      <header
        className={`lintas-header ${
          isHome ? "lintas-header-home" : ""
        }`}
      >
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
              <span className="lintas-brand-title">
                LINTAS
              </span>

              <span className="lintas-brand-subtitle">
                Layanan Informasi Jembatan
              </span>

              <span className="lintas-brand-agency">
                Kota Yogyakarta
              </span>
            </div>
          </Link>

          <button
            type="button"
            className={`lintas-menu-toggle ${
              menuOpen ? "active" : ""
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Buka atau tutup menu navigasi"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <nav
            className={`lintas-navigation ${
              menuOpen ? "open" : ""
            }`}
            aria-label="Navigasi utama"
          >
            <Link
              href="/"
              className={isActive("/")}
              onClick={closeMenu}
            >
              <i
                className="bi bi-house-door-fill"
                aria-hidden="true"
              />
              <span>Beranda</span>
            </Link>

            <Link
              href="/statistika"
              className={isActive("/statistika")}
              onClick={(e) =>
                handleProtectedNavigation(e, "/statistika")
              }
            >
              <i
                className="bi bi-bar-chart-line"
                aria-hidden="true"
              />
              <span>Statistika</span>
            </Link>

            <Link
              href="/persebaran"
              className={isActive("/persebaran")}
              onClick={(e) =>
                handleProtectedNavigation(e, "/persebaran")
              }
            >
              <i
                className="bi bi-stack"
                aria-hidden="true"
              />
              <span>Persebaran</span>
            </Link>

            <Link
              href="/pemodelan-3d"
              className={isActive("/pemodelan-3d")}
              onClick={(e) =>
                handleProtectedNavigation(e, "/pemodelan-3d")
              }
            >
              <i
                className="bi bi-box"
                aria-hidden="true"
              />
              <span>Pemodelan 3D</span>
            </Link>

            {authChecked &&
              pathname !== "/login" &&
              (authenticated ? (
                <button
                  type="button"
                  className="lintas-logout"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <i
                    className="bi bi-box-arrow-right"
                    aria-hidden="true"
                  />
                  <span>
                    {loggingOut ? "Keluar..." : "Sign Out"}
                  </span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="lintas-login"
                  onClick={closeMenu}
                >
                  <i
                    className="bi bi-box-arrow-in-right"
                    aria-hidden="true"
                  />
                  <span>Sign In</span>
                </Link>
              ))}
          </nav>
        </div>

        {logoutError && (
          <div
            className="lintas-logout-error"
            role="alert"
          >
            {logoutError}
          </div>
        )}
      </header>

      {/* MODAL NOTIFIKASI SIGN IN */}
      {loginRedirect && (
        <div
          className="lintas-auth-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeLoginModal();
            }
          }}
        >
          <div
            className="lintas-auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lintas-auth-title"
          >
            <div className="lintas-auth-top">
              <div className="lintas-auth-brand">
                <div className="lintas-auth-brand-icon">
                  <i className="bi bi-geo-alt-fill" />
                </div>

                <div>
                  <strong>LINTAS</strong>
                  <span>Kota Yogyakarta</span>
                </div>
              </div>

              <span className="lintas-auth-badge">
                Akses terbatas
              </span>
            </div>

            <div className="lintas-auth-content">
              <div className="lintas-auth-lock">
                <i className="bi bi-lock-fill" />
              </div>

              <h2 id="lintas-auth-title">
                Login Diperlukan
              </h2>

              <p>
                Silakan Sign In terlebih dahulu untuk
                mengakses fitur WebGIS LINTAS.
              </p>

              <div className="lintas-auth-destination">
                <span>AKSES YANG DIPILIH</span>

                <strong>{destinationName}</strong>

                <small>
                  Layanan Informasi Jembatan Kota Yogyakarta
                </small>
              </div>

              <button
                type="button"
                className="lintas-auth-primary"
                onClick={goToLogin}
              >
                <i className="bi bi-box-arrow-in-right" />
                Sign In Sekarang
                <i className="bi bi-arrow-right" />
              </button>

              <button
                type="button"
                className="lintas-auth-secondary"
                onClick={closeLoginModal}
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
