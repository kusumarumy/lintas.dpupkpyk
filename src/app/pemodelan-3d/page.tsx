
"use client";

import Header from "@/components/Header";
import {
  bridges,
  getBridgeConditionLabel,
} from "@/data/bridges";
import type { BridgeData } from "@/data/bridges/types";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type * as Cesium from "cesium";
type ConditionFilter = "all" | "good" | "damaged" | "critical";

function getLatestCondition(bridge: BridgeData) {
  return [...bridge.history]
    .filter((item) => item.value !== null)
    .sort((a, b) => b.year - a.year)[0] ?? null;
}

function getConditionColor(value: number | null) {
  if (value === null) return "#8995a5";

  const colors: Record<number, string> = {
    0: "#169b70",
    1: "#d6a12d",
    2: "#e18a32",
    3: "#d65c50",
    4: "#a93838",
    5: "#63243c",
  };

  return colors[value] ?? "#8995a5";
}

function getConditionGroup(value: number | null): ConditionFilter {
  if (value === null) return "all";
  if (value === 0) return "good";
  if (value >= 1 && value <= 3) return "damaged";
  return "critical";
}

function getConditionDescription(value: number | null) {
  if (value === null) return "Data belum tersedia";

  const descriptions: Record<number, string> = {
    0: "Kondisi Baik",
    1: "Rusak Ringan",
    2: "Rusak Sedang",
    3: "Rusak Berat",
    4: "Kritis",
    5: "Runtuh",
  };

  return descriptions[value] ?? "Tidak diketahui";
}

function getLocation(bridge: BridgeData) {
  return [
    bridge.identity.village,
    bridge.identity.district,
  ]
    .filter(Boolean)
    .join(", ");
}

function BridgeCard({
  bridge,
}: {
  bridge: BridgeData;
}) {
  const router = useRouter();
  const latest = getLatestCondition(bridge);
  const conditionValue = latest?.value ?? null;
  const photo = bridge.photos[0];

  return (
    <article
      className="bridge-card"
      onClick={() => router.push(`/pemodelan-3d/${bridge.slug}`)}
      tabIndex={0}
      role="link"
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          router.push(`/pemodelan-3d/${bridge.slug}`);
        }
      }}
      aria-label={`Lihat detail ${bridge.name}`}
    >
      <div className="bridge-card-image">
        {photo?.url ? (
          <img
            src={photo.url}
            alt={photo.title || bridge.name}
            loading="lazy"
          />
        ) : (
          <div className="bridge-image-placeholder">
            <span>▤</span>
            <small>Dokumentasi belum tersedia</small>
          </div>
        )}

        <div className="bridge-image-overlay" />

        <span className="bridge-image-category">
          INFRASTRUCTURE
        </span>

        <span
          className="bridge-condition-badge"
          style={{
            color: getConditionColor(conditionValue),
            backgroundColor: "#ffffffed",
          }}
        >
          <i
            style={{
              backgroundColor: getConditionColor(conditionValue),
            }}
          />
          {getConditionDescription(conditionValue)}
        </span>
      </div>

      <div className="bridge-card-content">
        <div className="bridge-card-topline">
          <span>JEMBATAN KOTA YOGYAKARTA</span>
          <span className="bridge-card-arrow">↗</span>
        </div>

        <h3>{bridge.name}</h3>

        <div className="bridge-location">
          <span>⌖</span>
          {getLocation(bridge) || "Lokasi belum tersedia"}
        </div>

        <div className="bridge-card-divider" />

        <div className="bridge-card-meta">
          <div>
            <span>Tahun dibangun</span>
            <strong>{bridge.identity.yearBuilt ?? "—"}</strong>
          </div>

          <div>
            <span>Panjang</span>
            <strong>
              {bridge.dimensions.length !== null
                ? `${bridge.dimensions.length} m`
                : "—"}
            </strong>
          </div>

          <div>
            <span>Data kondisi</span>
            <strong>{latest?.year ?? "—"}</strong>
          </div>
        </div>

        <button
          className="bridge-card-button"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            router.push(`/pemodelan-3d/${bridge.slug}`);
          }}
        >
          Lihat Detail Jembatan
          <span>→</span>
        </button>
      </div>
    </article>
  );
}

export default function Pemodelan3DPage() {
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [conditionFilter, setConditionFilter] =
    useState<ConditionFilter>("all");

  const districts = useMemo(() => {
    return Array.from(
      new Set(
        bridges
          .map((bridge) => bridge.identity.district)
          .filter(Boolean)
      )
    ).sort();
  }, []);

  const statistics = useMemo(() => {
    const values = bridges.map((bridge) => ({
      bridge,
      latest: getLatestCondition(bridge),
    }));

    const good = values.filter(
      ({ latest }) => latest?.value === 0
    ).length;

    const damaged = values.filter(
      ({ latest }) =>
        latest?.value !== null &&
        latest?.value !== undefined &&
        latest.value >= 1 &&
        latest.value <= 3
    ).length;

    const critical = values.filter(
      ({ latest }) =>
        latest?.value !== null &&
        latest?.value !== undefined &&
        latest.value >= 4
    ).length;

    const unavailable = values.filter(
      ({ latest }) => !latest
    ).length;

    return {
      total: bridges.length,
      good,
      damaged,
      critical,
      unavailable,
    };
  }, []);

  const filteredBridges = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return bridges.filter((bridge) => {
      const searchable = [
        bridge.name,
        bridge.identity.roadName,
        bridge.identity.village,
        bridge.identity.district,
        bridge.identity.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !keyword || searchable.includes(keyword);

      const matchesDistrict =
        districtFilter === "all" ||
        bridge.identity.district === districtFilter;

      const latest = getLatestCondition(bridge);
      const group = getConditionGroup(latest?.value ?? null);

      const matchesCondition =
        conditionFilter === "all" ||
        group === conditionFilter;

      return (
        matchesSearch &&
        matchesDistrict &&
        matchesCondition
      );
    });
  }, [search, districtFilter, conditionFilter]);

  const resetFilters = () => {
    setSearch("");
    setDistrictFilter("all");
    setConditionFilter("all");
  };

  return (
    <>
      <Header />

      <main className="lintas-directory">
        <section className="directory-hero">
          <div className="directory-hero-background" />

          <div className="directory-container directory-hero-content">
            <div className="hero-eyebrow">
              <span className="hero-live-dot" />
              LAYANAN INFORMASI JEMBATAN KOTA YOGYAKARTA
            </div>

            <div className="hero-main">
              <div className="hero-text">
                <h1>
                  3D Visualization <br />
                  <span>Infrastruktur Jembatan</span>
                </h1>

                <p>
                  Platform informasi dan visualisasi infrastruktur
                  jembatan berbasis data spasial dan model tiga dimensi
                  untuk mendukung pemantauan kondisi serta pengelolaan
                  aset infrastruktur.
                </p>

                <div className="hero-actions">
                  <a href="#direktori" className="hero-primary-button">
                    Jelajahi Jembatan
                    <span>↓</span>
                  </a>

                  <div className="hero-data-label">
                    <span className="hero-data-icon">◈</span>
                    <span>
                      <strong>Spatial Data Platform</strong>
                      <small>3D Visualization & Asset Information</small>
                    </span>
                  </div>
                </div>
              </div>

              <div className="hero-visual">
                <div className="hero-visual-frame">
                  <div className="hero-visual-grid" />

                  <div className="hero-visual-orbit orbit-one" />
                  <div className="hero-visual-orbit orbit-two" />

                  <div className="hero-visual-center">
                    <span className="hero-visual-symbol">⌘</span>
                    <strong>LINTAS</strong>
                    <small>DIGITAL INFRASTRUCTURE</small>
                  </div>

                  <div className="hero-floating-tag tag-top">
                    <span className="floating-dot" />
                    SPATIAL INFORMATION
                  </div>

                  <div className="hero-floating-tag tag-bottom">
                    <span>3D</span>
                    VISUALIZATION
                  </div>

                  <div className="hero-coordinate-label">
                    YOGYAKARTA · INDONESIA
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-bottom">
              <span>INTEGRATED BRIDGE INFORMATION SYSTEM</span>
              <span>EXPLORE · MONITOR · ANALYZE</span>
            </div>
          </div>
        </section>

        <div className="directory-container">
          <section className="statistics-section">
            <div className="statistics-heading">
              <div>
                <span className="section-eyebrow">
                  INFRASTRUCTURE OVERVIEW
                </span>
                <h2>Ringkasan Data Jembatan</h2>
              </div>

              <span className="statistics-period">
                DATA TERSEDIA DALAM SISTEM
              </span>
            </div>

            <div className="statistics-grid">
              <div className="stat-card stat-total">
                <div className="stat-icon">▦</div>
                <div className="stat-content">
                  <span>Total Jembatan</span>
                  <strong>{statistics.total}</strong>
                  <small>Aset terdaftar</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-green">✓</div>
                <div className="stat-content">
                  <span>Kondisi Baik</span>
                  <strong>{statistics.good}</strong>
                  <small>Skor kondisi 0</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-orange">◈</div>
                <div className="stat-content">
                  <span>Perlu Penanganan</span>
                  <strong>{statistics.damaged}</strong>
                  <small>Rusak ringan hingga berat</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-red">!</div>
                <div className="stat-content">
                  <span>Kritis / Runtuh</span>
                  <strong>{statistics.critical}</strong>
                  <small>Skor kondisi 4–5</small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-gray">—</div>
                <div className="stat-content">
                  <span>Belum Ada Data</span>
                  <strong>{statistics.unavailable}</strong>
                  <small>Riwayat kondisi kosong</small>
                </div>
              </div>
            </div>
          </section>

          <section className="directory-section" id="direktori">
            <div className="directory-heading">
              <div>
                <span className="section-eyebrow">
                  BRIDGE ASSET DIRECTORY
                </span>
                <h2>Direktori Jembatan</h2>
                <p>
                  Pilih jembatan untuk melihat informasi teknis,
                  riwayat kondisi, dokumentasi, dan model 3D.
                </p>
              </div>

              <div className="directory-total">
                <strong>{filteredBridges.length}</strong>
                <span>dari {bridges.length} jembatan</span>
              </div>
            </div>

            <div className="directory-toolbar">
              <div className="search-box">
                <span className="search-icon">⌕</span>
                <input
                  type="search"
                  placeholder="Cari nama jembatan, ruas jalan, atau lokasi..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Hapus pencarian"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="filter-control">
                <label htmlFor="district-filter">Kecamatan</label>
                <select
                  id="district-filter"
                  value={districtFilter}
                  onChange={(event) =>
                    setDistrictFilter(event.target.value)
                  }
                >
                  <option value="all">Semua Kecamatan</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-control">
                <label htmlFor="condition-filter">Kondisi</label>
                <select
                  id="condition-filter"
                  value={conditionFilter}
                  onChange={(event) =>
                    setConditionFilter(
                      event.target.value as ConditionFilter
                    )
                  }
                >
                  <option value="all">Semua Kondisi</option>
                  <option value="good">Baik</option>
                  <option value="damaged">Rusak Ringan–Berat</option>
                  <option value="critical">Kritis / Runtuh</option>
                </select>
              </div>

              <button
                className="reset-filter"
                type="button"
                onClick={resetFilters}
              >
                ↺ Reset
              </button>
            </div>

            <div className="directory-results">
              {filteredBridges.length > 0 ? (
                <div className="bridge-directory-grid">
                  {filteredBridges.map((bridge) => (
                    <BridgeCard
                      key={bridge.slug}
                      bridge={bridge}
                    />
                  ))}
                </div>
              ) : (
                <div className="directory-empty">
                  <div>⌕</div>
                  <h3>Jembatan tidak ditemukan</h3>
                  <p>
                    Coba gunakan kata kunci atau filter yang berbeda.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                  >
                    Tampilkan Semua Jembatan
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="directory-information">
            <div className="information-icon">◈</div>
            <div>
              <strong>Informasi Infrastruktur Terintegrasi</strong>
              <p>
                Setiap aset jembatan memiliki halaman informasi
                tersendiri yang mengintegrasikan profil aset, data
                kondisi, dokumentasi lapangan, dokumen teknis, serta
                visualisasi model tiga dimensi.
              </p>
            </div>
          </section>

          <footer className="directory-footer">
            <div>
              <strong>LINTAS</strong>
              <span>
                Layanan Informasi Jembatan Kota Yogyakarta
              </span>
            </div>

            <span>
              DIGITAL INFRASTRUCTURE INFORMATION PLATFORM
            </span>
          </footer>
        </div>
      </main>

      <DirectoryStyles />
    </>
  );
}

function DirectoryStyles() {
  return (
    <style jsx global>{`
      .lintas-directory {
        min-height: calc(100vh - 70px);
        background: #f4f6f9;
        color: #1c3044;
        font-family: inherit;
      }

      .directory-container {
        width: min(1440px, calc(100% - 56px));
        margin: 0 auto;
      }

      .directory-hero {
        position: relative;
        overflow: hidden;
        background: #11283b;
        color: white;
      }

      .directory-hero-background {
        position: absolute;
        inset: 0;
        opacity: 0.55;
        background:
          radial-gradient(
            ellipse at 78% 45%,
            rgba(37, 133, 171, 0.36),
            transparent 37%
          ),
          radial-gradient(
            ellipse at 10% 100%,
            rgba(24, 91, 124, 0.28),
            transparent 40%
          ),
          linear-gradient(115deg, #10263a, #17384f);
      }

      .directory-hero-content {
        position: relative;
        z-index: 1;
        padding-top: 39px;
      }

      .hero-eyebrow {
        display: flex;
        align-items: center;
        gap: 9px;
        color: #a8c2d4;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 1.6px;
      }

      .hero-live-dot {
        width: 7px;
        height: 7px;
        background: #47d6a1;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(71, 214, 161, 0.8);
      }

      .hero-main {
        min-height: 400px;
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        align-items: center;
        gap: 35px;
      }

      .hero-text h1 {
        margin: 0;
        color: white;
        font-size: clamp(36px, 4.5vw, 58px);
        font-weight: 850;
        line-height: 1.12;
        letter-spacing: -2px;
      }

      .hero-text h1 span {
        color: #73c6df;
      }

      .hero-text > p {
        max-width: 600px;
        margin: 20px 0 24px;
        color: #b6c9d7;
        font-size: 13px;
        line-height: 1.9;
      }

      .hero-actions {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 22px;
      }

      .hero-primary-button {
        display: inline-flex;
        align-items: center;
        gap: 18px;
        padding: 12px 17px;
        color: #15334a;
        background: #80d0e5;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 800;
        text-decoration: none;
        transition: background 0.2s ease;
      }

      .hero-primary-button:hover {
        background: #a1e0ed;
      }

      .hero-primary-button span {
        font-size: 16px;
      }

      .hero-data-label {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .hero-data-icon {
        width: 35px;
        height: 35px;
        display: grid;
        place-items: center;
        color: #80d0e5;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        font-size: 17px;
      }

      .hero-data-label strong,
      .hero-data-label small {
        display: block;
      }

      .hero-data-label strong {
        color: #e3edf4;
        font-size: 10px;
      }

      .hero-data-label small {
        margin-top: 4px;
        color: #91a9bb;
        font-size: 9px;
      }

      .hero-visual {
        min-width: 0;
        display: flex;
        justify-content: center;
      }

      .hero-visual-frame {
        width: min(100%, 420px);
        height: 275px;
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(145, 197, 220, 0.22);
        border-radius: 15px;
        background:
          linear-gradient(
            135deg,
            rgba(50, 105, 135, 0.18),
            rgba(11, 34, 52, 0.4)
          );
      }

      .hero-visual-grid {
        position: absolute;
        inset: 0;
        opacity: 0.3;
        background-image:
          linear-gradient(rgba(150, 204, 226, 0.15) 1px, transparent 1px),
          linear-gradient(
            90deg,
            rgba(150, 204, 226, 0.15) 1px,
            transparent 1px
          );
        background-size: 27px 27px;
        transform: perspective(450px) rotateX(15deg) scale(1.2);
      }

      .hero-visual-orbit {
        position: absolute;
        left: 50%;
        top: 50%;
        border: 1px solid rgba(108, 196, 223, 0.35);
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }

      .orbit-one {
        width: 220px;
        height: 220px;
      }

      .orbit-two {
        width: 300px;
        height: 130px;
        transform: translate(-50%, -50%) rotate(-28deg);
      }

      .hero-visual-center {
        position: absolute;
        left: 50%;
        top: 50%;
        display: flex;
        align-items: center;
        flex-direction: column;
        transform: translate(-50%, -50%);
      }

      .hero-visual-symbol {
        width: 75px;
        height: 75px;
        display: grid;
        place-items: center;
        color: #a4e1ee;
        background: rgba(86, 165, 197, 0.13);
        border: 1px solid rgba(142, 219, 238, 0.5);
        border-radius: 20px;
        font-size: 40px;
        box-shadow: 0 0 35px rgba(76, 172, 208, 0.15);
      }

      .hero-visual-center strong {
        margin-top: 13px;
        color: white;
        font-size: 19px;
        letter-spacing: 4px;
      }

      .hero-visual-center small {
        margin-top: 5px;
        color: #8fb5c9;
        font-size: 7px;
        letter-spacing: 1.5px;
      }

      .hero-floating-tag {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 8px 10px;
        color: #c9e1ed;
        background: rgba(10, 29, 45, 0.82);
        border: 1px solid rgba(154, 201, 222, 0.2);
        border-radius: 6px;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.7px;
      }

      .tag-top {
        top: 18px;
        right: 17px;
      }

      .tag-bottom {
        left: 17px;
        bottom: 35px;
      }

      .tag-bottom span {
        color: #75cce5;
        font-size: 13px;
      }

      .floating-dot {
        width: 6px;
        height: 6px;
        background: #46d7a3;
        border-radius: 50%;
      }

      .hero-coordinate-label {
        position: absolute;
        right: 17px;
        bottom: 15px;
        color: #7294aa;
        font-size: 7px;
        letter-spacing: 1px;
      }

      .hero-bottom {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.13);
        color: #85a4b8;
        font-size: 8px;
        font-weight: 750;
        letter-spacing: 1.2px;
      }

      .statistics-section {
        padding-top: 38px;
      }

      .statistics-heading,
      .directory-heading {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 20px;
        margin-bottom: 17px;
      }

      .section-eyebrow {
        color: #8192a3;
        font-size: 9px;
        font-weight: 850;
        letter-spacing: 1.5px;
      }

      .statistics-heading h2,
      .directory-heading h2 {
        margin: 6px 0 0;
        color: #21374b;
        font-size: 22px;
        font-weight: 850;
        letter-spacing: -0.6px;
      }

      .statistics-period {
        padding: 7px 10px;
        color: #7890a5;
        background: #e9eff4;
        border-radius: 5px;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.8px;
      }

      .statistics-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 12px;
      }

      .stat-card {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
        min-height: 104px;
        padding: 17px 15px;
        background: #fff;
        border: 1px solid #e7edf2;
        border-radius: 11px;
        box-shadow: 0 3px 12px rgba(31, 53, 75, 0.025);
      }

      .stat-icon {
        width: 37px;
        height: 37px;
        flex: 0 0 auto;
        display: grid;
        place-items: center;
        color: #3d82a9;
        background: #eaf3f8;
        border-radius: 9px;
        font-size: 17px;
        font-weight: 800;
      }

      .stat-green {
        color: #169b70;
        background: #e7f5ef;
      }

      .stat-orange {
        color: #d58c31;
        background: #fbf2e5;
      }

      .stat-red {
        color: #c34d49;
        background: #f9eceb;
      }

      .stat-gray {
        color: #8793a1;
        background: #eef1f4;
      }

      .stat-content {
        min-width: 0;
      }

      .stat-content span,
      .stat-content strong,
      .stat-content small {
        display: block;
      }

      .stat-content span {
        color: #8291a1;
        font-size: 9px;
        font-weight: 700;
      }

      .stat-content strong {
        margin-top: 4px;
        color: #263b50;
        font-size: 25px;
        font-weight: 850;
        line-height: 1.1;
      }

      .stat-content small {
        margin-top: 5px;
        color: #a0aab5;
        font-size: 8px;
      }

      .directory-section {
        padding-top: 48px;
        scroll-margin-top: 90px;
      }

      .directory-heading {
        margin-bottom: 20px;
      }

      .directory-heading p {
        margin: 7px 0 0;
        color: #8291a0;
        font-size: 11px;
        line-height: 1.7;
      }

      .directory-total {
        display: flex;
        align-items: baseline;
        gap: 6px;
        color: #8a98a6;
        font-size: 10px;
      }

      .directory-total strong {
        color: #315f7e;
        font-size: 23px;
        font-weight: 850;
      }

      .directory-toolbar {
        display: grid;
        grid-template-columns: minmax(240px, 1fr) 190px 190px auto;
        gap: 10px;
        align-items: end;
        margin-bottom: 19px;
        padding: 14px;
        background: #fff;
        border: 1px solid #e5ebf0;
        border-radius: 11px;
      }

      .search-box {
        min-width: 0;
        height: 39px;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 0 11px;
        background: #f7f9fb;
        border: 1px solid #e8edf2;
        border-radius: 6px;
      }

      .search-icon {
        color: #7890a4;
        font-size: 19px;
      }

      .search-box input {
        width: 100%;
        min-width: 0;
        color: #344b60;
        background: transparent;
        border: 0;
        outline: none;
        font-family: inherit;
        font-size: 10px;
      }

      .search-box input::placeholder {
        color: #a2adba;
      }

      .search-box button {
        color: #8a98a6;
        background: transparent;
        border: 0;
        cursor: pointer;
        font-size: 18px;
      }

      .filter-control {
        min-width: 0;
      }

      .filter-control label {
        display: block;
        margin-bottom: 5px;
        color: #8190a0;
        font-size: 9px;
        font-weight: 750;
      }

      .filter-control select {
        width: 100%;
        height: 39px;
        padding: 0 9px;
        color: #41566b;
        background: #f7f9fb;
        border: 1px solid #e8edf2;
        border-radius: 6px;
        outline: none;
        font-family: inherit;
        font-size: 10px;
      }

      .reset-filter {
        height: 39px;
        padding: 0 13px;
        color: #5b7f99;
        background: #edf4f8;
        border: 1px solid #e0ebf1;
        border-radius: 6px;
        font-family: inherit;
        font-size: 10px;
        font-weight: 750;
        cursor: pointer;
      }

      .reset-filter:hover {
        background: #e1eef5;
      }

      .bridge-directory-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 17px;
      }

      .bridge-card {
        min-width: 0;
        overflow: hidden;
        background: white;
        border: 1px solid #e5ebf0;
        border-radius: 12px;
        cursor: pointer;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease,
          border-color 0.2s ease;
      }

      .bridge-card:hover,
      .bridge-card:focus-visible {
        transform: translateY(-4px);
        border-color: #b7d0df;
        box-shadow: 0 12px 28px rgba(28, 55, 78, 0.09);
        outline: none;
      }

      .bridge-card-image {
        height: 190px;
        position: relative;
        overflow: hidden;
        background: #e4ebef;
      }

      .bridge-card-image > img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.45s ease;
      }

      .bridge-card:hover .bridge-card-image > img {
        transform: scale(1.045);
      }

      .bridge-image-placeholder {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 9px;
        color: #8b9ba9;
        background:
          linear-gradient(135deg, #e7edf1, #d8e3e9);
      }

      .bridge-image-placeholder span {
        font-size: 35px;
      }

      .bridge-image-placeholder small {
        font-size: 9px;
      }

      .bridge-image-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(
          to bottom,
          rgba(12, 30, 44, 0.22),
          transparent 40%,
          rgba(12, 30, 44, 0.12)
        );
      }

      .bridge-image-category {
        position: absolute;
        top: 13px;
        left: 13px;
        padding: 7px 9px;
        color: white;
        background: rgba(14, 36, 53, 0.77);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 5px;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.9px;
      }

      .bridge-condition-badge {
        position: absolute;
        right: 12px;
        bottom: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 7px 9px;
        border-radius: 5px;
        font-size: 9px;
        font-weight: 800;
      }

      .bridge-condition-badge i {
        width: 7px;
        height: 7px;
        border-radius: 50%;
      }

      .bridge-card-content {
        padding: 17px;
      }

      .bridge-card-topline {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #9aa7b3;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.8px;
      }

      .bridge-card-arrow {
        color: #6a9cba;
        font-size: 15px;
      }

      .bridge-card h3 {
        margin: 9px 0 7px;
        color: #263b50;
        font-size: 18px;
        font-weight: 850;
        letter-spacing: -0.4px;
      }

      .bridge-location {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #8b98a6;
        font-size: 10px;
      }

      .bridge-location span {
        color: #5485a3;
        font-size: 14px;
      }

      .bridge-card-divider {
        height: 1px;
        margin: 17px 0 13px;
        background: #edf0f3;
      }

      .bridge-card-meta {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 7px;
      }

      .bridge-card-meta > div {
        min-width: 0;
      }

      .bridge-card-meta span,
      .bridge-card-meta strong {
        display: block;
      }

      .bridge-card-meta span {
        color: #98a4b0;
        font-size: 8px;
      }

      .bridge-card-meta strong {
        margin-top: 5px;
        color: #41576c;
        font-size: 12px;
        font-weight: 800;
      }

      .bridge-card-button {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding: 11px 12px;
        color: #39799f;
        background: #eef5f9;
        border: 1px solid #e4eef4;
        border-radius: 6px;
        font-family: inherit;
        font-size: 10px;
        font-weight: 800;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .bridge-card-button:hover {
        background: #e0eef5;
      }

      .bridge-card-button span {
        font-size: 15px;
      }

      .directory-empty {
        padding: 55px 20px;
        background: white;
        border: 1px dashed #d7e0e8;
        border-radius: 12px;
        text-align: center;
      }

      .directory-empty > div {
        color: #86a0b3;
        font-size: 35px;
      }

      .directory-empty h3 {
        color: #334a5f;
        font-size: 17px;
      }

      .directory-empty p {
        color: #8d9aa7;
        font-size: 11px;
      }

      .directory-empty button {
        margin-top: 10px;
        padding: 10px 14px;
        color: white;
        background: #276d96;
        border: 0;
        border-radius: 6px;
        font-size: 10px;
        cursor: pointer;
      }

      .directory-information {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        margin-top: 35px;
        padding: 19px 21px;
        background: #eaf2f7;
        border: 1px solid #dce9f0;
        border-radius: 10px;
      }

      .information-icon {
        width: 36px;
        height: 36px;
        flex: 0 0 auto;
        display: grid;
        place-items: center;
        color: #397da5;
        background: #d8eaf4;
        border-radius: 8px;
        font-size: 18px;
      }

      .directory-information strong {
        display: block;
        color: #385970;
        font-size: 11px;
      }

      .directory-information p {
        margin: 6px 0 0;
        color: #758b9e;
        font-size: 10px;
        line-height: 1.7;
      }

      .directory-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
        margin-top: 36px;
        padding: 20px 0 25px;
        border-top: 1px solid #dfe6ec;
      }

      .directory-footer strong,
      .directory-footer span {
        display: block;
      }

      .directory-footer strong {
        color: #315f7d;
        font-size: 14px;
        letter-spacing: 1.5px;
      }

      .directory-footer div span {
        margin-top: 4px;
        color: #8b98a6;
        font-size: 9px;
      }

      .directory-footer > span {
        color: #98a5b1;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 1px;
      }

      @media (max-width: 1100px) {
        .statistics-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .bridge-directory-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .directory-toolbar {
          grid-template-columns: minmax(200px, 1fr) 160px 160px;
        }

        .reset-filter {
          grid-column: 3;
        }
      }

      @media (max-width: 700px) {
        .directory-container {
          width: calc(100% - 28px);
        }

        .directory-hero-content {
          padding-top: 27px;
        }

        .hero-main {
          grid-template-columns: 1fr;
          padding-top: 32px;
          gap: 26px;
        }

        .hero-text h1 {
          font-size: 37px;
        }

        .hero-text > p {
          font-size: 11px;
        }

        .hero-visual-frame {
          height: 230px;
        }

        .hero-bottom {
          font-size: 7px;
        }

        .statistics-heading,
        .directory-heading {
          align-items: flex-start;
          flex-direction: column;
        }

        .statistics-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .stat-card {
          min-height: 90px;
          gap: 8px;
          padding: 12px 9px;
        }

        .stat-icon {
          width: 30px;
          height: 30px;
          font-size: 14px;
        }

        .stat-content span {
          font-size: 8px;
        }

        .stat-content strong {
          font-size: 22px;
        }

        .stat-content small {
          font-size: 7px;
        }

        .directory-toolbar {
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .search-box {
          grid-column: 1 / -1;
        }

        .reset-filter {
          grid-column: auto;
        }

        .bridge-directory-grid {
          grid-template-columns: 1fr;
        }

        .bridge-card-image {
          height: 205px;
        }

        .directory-total {
          align-self: flex-start;
        }

        .directory-footer {
          align-items: flex-start;
          flex-direction: column;
        }

        .directory-footer > span {
          line-height: 1.7;
        }
      }
    `}</style>
  );
}
