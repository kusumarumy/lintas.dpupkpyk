"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import type { BridgeMapItem } from "./types";
import "./persebaran.css";
import {
  getBridgeOperationalStatus,
  hasBridge3DModel,
} from "./bridgeAssets";
const CesiumViewer = dynamic(
  () => import("./CesiumViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="lintas-map-loading">
        <div className="lintas-spinner" />
        <span>Menyiapkan Cesium 3D...</span>
      </div>
    ),
  }
);
const DATA_URL = "/api/geojson/jembatan";

type MeasurementMode = "none" | "distance" | "area" | "identify";

type MeasurementResult = {
  mode: MeasurementMode;
  distanceM?: number;
  areaM2?: number;
  longitude?: number;
  latitude?: number;
  elevationM?: number;
  pointCount: number;
};
type Raw = Record<string, any>;

function textValue(value: unknown, fallback = "Belum diisi") {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === "" ||
    String(value).toLowerCase() === "null"
  ) {
    return fallback;
  }

  return String(value).trim();
}

function numberValue(value: unknown): number | null {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }

  const result = Number(String(value).trim().replace(",", "."));
  return Number.isFinite(result) ? result : null;
}

function normalizeAreaName(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function conditionCode(value: unknown): number | null {
  const text = String(value ?? "").trim().toLowerCase();
  const numeric = text.match(/^([0-5])(?:\s|[:.-]|$)/);
  if (numeric) return Number(numeric[1]);
  if (/^(baik|mantap)$/.test(text)) return 0;
  if (text.includes("rusak ringan")) return 1;
  if (text.includes("rusak sedang")) return 2;
  if (text.includes("rusak berat")) return 3;
  if (text.includes("kritis")) return 4;
  if (text.includes("runtuh")) return 5;
  return null;
}

const CONDITION_LABELS = [
  "Baik",
  "Rusak Ringan",
  "Rusak Sedang",
  "Rusak Berat",
  "Kritis",
  "Runtuh",
];

function findValue(properties: Raw, keys: string[]) {
  for (const key of keys) {
    const value = properties[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return "";
}

function normalizeFeature(feature: Raw, index: number): BridgeMapItem {
  const properties: Raw = feature.properties ?? {};
  const coordinates = feature.geometry?.coordinates;

  let longitude = numberValue(properties.longitude);
  let latitude = numberValue(properties.latitude);

  if (
    feature.geometry?.type === "Point" &&
    Array.isArray(coordinates)
  ) {
    longitude = numberValue(coordinates[0]);
    latitude = numberValue(coordinates[1]);
  }

  // Jangan tampilkan koordinat yang bukan WGS84.
  if (
    longitude === null ||
    latitude === null ||
    longitude < -180 ||
    longitude > 180 ||
    latitude < -90 ||
    latitude > 90
  ) {
    longitude = null;
    latitude = null;
  }

  const rawPhoto = findValue(properties, [
    "foto_url",
    "photo_url",
    "foto",
    "gambar",
    "image_url",
    "thumbnail",
  ]);

  const rawModel = findValue(properties, [
    "model_url",
    "model3d_url",
    "glb_url",
    "gltf_url",
    "url_model",
    "model_3d",
  ]);

  const resolveR2 = (value: unknown) => {
    const url = String(value ?? "").trim();

    if (!url) return "";

    if (/^https?:\/\//i.test(url)) return url;

    const key = url
      .replace(/^\/+/, "")
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    return key ? `/api/r2/${key}` : "";
  };
const nama = textValue(
  properties.nama,
  `Jembatan ${index + 1}`
);

const kemantren = textValue(properties.kemantren);
const kelurahan = textValue(properties.kelurahan);
const ruasJalan = textValue(properties.ruas_jalan);

return {
  id: textValue(
    properties.id,
    String(feature.id ?? index + 1)
  ),

  nama,

  kemantren,
  kelurahan,

  kabupaten: textValue(properties.kabupaten),
  ruasJalan,

  // Status operasional ditentukan berdasarkan nama jembatan.
  status: getBridgeOperationalStatus({
    nama,
  }),

  kondisi: textValue(properties.kondisi),
  kemantapan: textValue(properties.kemantapan),

  longitude,
  latitude,

  photoUrl: resolveR2(rawPhoto),
  modelUrl: resolveR2(rawModel),
};

}

export default function PersebaranPage() {
  const [bridges, setBridges] = useState<BridgeMapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [sort, setSort] = useState("nama");

  const [selectedBridge, setSelectedBridge] =
    useState<BridgeMapItem | null>(null);
  const [selectedKelurahan, setSelectedKelurahan] = useState<{
    nama: string;
    kemantren: string;
  } | null>(null);

  const [flyToSignal, setFlyToSignal] = useState(0);
  const [modelSignal, setModelSignal] = useState(0);
const [basemap, setBasemap] = useState<"esri" | "osm">("esri");
const [basemapOpen, setBasemapOpen] = useState(false);
const [showInspector, setShowInspector] = useState(false);
const [fullscreen, setFullscreen] = useState(false);
const [compassSignal, setCompassSignal] = useState(0);
const [measurementMode, setMeasurementMode] =
  useState<MeasurementMode>("none");

const [measurementResult, setMeasurementResult] =
  useState<MeasurementResult | null>(null);

const [clearMeasurementSignal, setClearMeasurementSignal] =
  useState(0);

const startMeasurement = (mode: MeasurementMode) => {
  setMeasurementResult(null);
  setMeasurementMode(mode);
  setClearMeasurementSignal((value) => value + 1);
};

const finishMeasurement = () => {
  setMeasurementMode("none");
};

const clearMeasurement = () => {
  setMeasurementMode("none");
  setMeasurementResult(null);
  setClearMeasurementSignal((value) => value + 1);
};

const handleMeasurementUpdate = (result: MeasurementResult) => {
  setMeasurementResult(result);
};
  const [updated, setUpdated] = useState("");

  const loadData = useCallback(async () => {

    setLoading(true);
    setError("");

    try {
      const response = await fetch(DATA_URL, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();

      if (!Array.isArray(json.features)) {
        throw new Error("Struktur GeoJSON tidak memiliki features.");
      }


const normalized: BridgeMapItem[] = (
  json.features as Raw[]
).map((feature, index) => normalizeFeature(feature, index));

setBridges(normalized);

console.table(
  normalized.map((bridge: BridgeMapItem) => ({
    nama: bridge.nama,
    kemantren: bridge.kemantren,
    kelurahan: bridge.kelurahan,
    kabupaten: bridge.kabupaten,
    ruasJalan: bridge.ruasJalan,
  }))
);

      setUpdated(new Date().toLocaleString("id-ID"));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredBridges = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    const result = bridges.filter((bridge) => {
      const searchable = [
        bridge.nama,
        bridge.kemantren,
        bridge.kelurahan,
        bridge.kabupaten,
        bridge.ruasJalan,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchable.includes(keyword);

      const matchesFilter =
        filter === "Semua" ||
        bridge.status.toLowerCase() === filter.toLowerCase();

      return matchesSearch && matchesFilter;
    });

    result.sort((a, b) => {
      if (sort === "nama") {
        return a.nama.localeCompare(b.nama, "id");
      }

      if (sort === "kondisi") {
        return a.kondisi.localeCompare(b.kondisi, "id");
      }

      return 0;
    });

    return result;
  }, [bridges, search, filter, sort]);

  const mappedCount = bridges.filter(
    (bridge) =>
      bridge.longitude !== null && bridge.latitude !== null
  ).length;

const selectedKelurahanStats = useMemo(() => {
  if (!selectedKelurahan) return null;
  const key = normalizeAreaName(selectedKelurahan.nama);
  const inArea = bridges.filter(
    (bridge) => normalizeAreaName(bridge.kelurahan) === key
  );
  const counts = CONDITION_LABELS.map((label, code) => ({
    label,
    count: inArea.filter((bridge) => conditionCode(bridge.kondisi) === code).length,
  }));
  const unknown = inArea.filter((bridge) => conditionCode(bridge.kondisi) === null).length;
  return { total: inArea.length, counts, unknown };
}, [bridges, selectedKelurahan]);

const handleSelectKelurahan = (nama: string, kemantren: string) => {
  setSelectedBridge(null);
  setSelectedKelurahan({ nama, kemantren });
  setShowInspector(false);
};

const handleFlyTo = (bridge: BridgeMapItem) => {
  setSelectedKelurahan(null);
  setSelectedBridge(bridge);
  setShowInspector(true);
  setFlyToSignal((value) => value + 1);
};

  const handleLoadModel = (bridge: BridgeMapItem) => {
    setSelectedBridge(bridge);
    setModelSignal((value) => value + 1);
  };

  return (
    <div
      className={`lintas-persebaran-page ${
        fullscreen ? "is-fullscreen" : ""
      }`}
    >
      <Header />

      <main className="lintas-workspace">
        {/* SIDEBAR */}
        <aside className="lintas-sidebar">
          <div className="lintas-sidebar-top">
            <h1>Persebaran Jembatan</h1>

            <p>Inventarisasi dan pemantauan aset jembatan</p>
          </div>

          <div className="lintas-search-box">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Cari nama atau lokasi jembatan..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button onClick={() => setSearch("")} aria-label="Hapus pencarian">
                ×
              </button>
            )}
          </div>

          <div className="lintas-filter-row">
            {["Semua", "Beroperasi", "Tidak Beroperasi"].map((item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="lintas-list-toolbar">
            <span>
              {loading
                ? "Memuat aset..."
                : `${filteredBridges.length} aset`}
            </span>

            <div>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Urutkan aset"
              >
                <option value="nama">Nama</option>
                <option value="kondisi">Kondisi</option>
              </select>

              <button
                onClick={() => void loadData()}
                disabled={loading}
                title="Refresh data"
              >
                ↻
              </button>
            </div>
          </div>

          {error && (
            <div className="lintas-error-box">
              <strong>Data gagal dimuat</strong>
              <span>{error}</span>
              <button onClick={() => void loadData()}>Coba lagi</button>
            </div>
          )}

          <div className="lintas-asset-list">
            {filteredBridges.map((bridge) => (
              <article
                key={bridge.id}
                className={`lintas-asset-card ${
                  selectedBridge?.id === bridge.id ? "active" : ""
                }`}
              >
                <button
                  className="lintas-asset-main"
                  onClick={() => handleFlyTo(bridge)}
                >
                  {bridge.photoUrl ? (
                    <img
                      src={bridge.photoUrl}
                      alt={bridge.nama}
                      loading="lazy"
                    />
                  ) : (
                    <div className="lintas-asset-placeholder">
                      <span>▤</span>
                    </div>
                  )}

                  <div className="lintas-asset-info">
                    <strong>{bridge.nama}</strong>
                    <small>
                      {bridge.kelurahan !== "Belum diisi"
                        ? `${bridge.kelurahan}, `
                        : ""}
                      {bridge.kemantren}
                    </small>
                    <span className="lintas-status-pill">
                      {bridge.status}
                    </span>
                  </div>
                </button>

                <div className="lintas-asset-actions">
                  <span className="lintas-condition">
                    {bridge.kondisi}
                  </span>

                  <button
                    className="lintas-fly-button"
                    onClick={() => handleFlyTo(bridge)}
                  >
                    ↗ Fly To
                  </button>

                  <button
  className="lintas-load-button"
  onClick={() => handleLoadModel(bridge)}
  disabled={!hasBridge3DModel(bridge)}
  title={
    hasBridge3DModel(bridge)
      ? "Muat model 3D"
      : "Model 3D belum tersedia untuk jembatan ini"
  }
>
  ◈ Load 3D
</button>
                </div>
              </article>
            ))}

            {!loading && filteredBridges.length === 0 && (
              <div className="lintas-empty">
                Tidak ada aset yang cocok dengan pencarian.
              </div>
            )}
          </div>

          <div className="lintas-sidebar-footer">
            <span>
              {updated ? `Update: ${updated}` : "Menunggu data"}
            </span>
            <span>Cloudflare R2</span>
          </div>
        </aside>

        {/* CESIUM MAP */}
        <section className="lintas-map-stage">
<CesiumViewer
  bridges={bridges}
  selectedKelurahan={selectedKelurahan?.nama ?? null}
  onSelectKelurahan={handleSelectKelurahan}
  selectedBridge={selectedBridge}
  flyToSignal={flyToSignal}
  modelSignal={modelSignal}
  onSelect={handleFlyTo}
  basemap={basemap}
  compassSignal={compassSignal}
  measurementMode={measurementMode}
  clearMeasurementSignal={clearMeasurementSignal}
  onMeasurementUpdate={handleMeasurementUpdate}
/>
{selectedKelurahan && selectedKelurahanStats && (
  <aside className="lintas-kelurahan-summary">
    <div className="lintas-kelurahan-summary-head">
      <div>
        <strong>{selectedKelurahan.nama}</strong>
        <span>{selectedKelurahan.kemantren || "Kota Yogyakarta"}</span>
      </div>
      <button type="button" onClick={() => setSelectedKelurahan(null)} aria-label="Tutup statistik kelurahan">×</button>
    </div>
    <div className="lintas-kelurahan-total">
      <strong>{selectedKelurahanStats.total}</strong>
      <span>Jumlah jembatan</span>
    </div>
    <div className="lintas-kelurahan-breakdown">
      {selectedKelurahanStats.counts.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>{item.count}</strong>
        </div>
      ))}
      {selectedKelurahanStats.unknown > 0 && (
        <div><span>Kondisi belum terklasifikasi</span><strong>{selectedKelurahanStats.unknown}</strong></div>
      )}
    </div>
  </aside>
)}
<div className="lintas-map-toolbar">

  {/* KOMPAS */}
  <button
    type="button"
    className="lintas-map-tool"
    title="Reset orientasi kompas"
    aria-label="Reset orientasi kompas"
    onClick={() =>
      setCompassSignal((value) => value + 1)
    }
  >
    <span className="lintas-tool-icon">🧭</span>
  </button>
{/* PENGUKURAN JARAK */}
<button
  type="button"
  className={`lintas-map-tool ${
    measurementMode === "distance" ? "active" : ""
  }`}
  title="Ukur jarak"
  aria-label="Ukur jarak"
  onClick={() =>
    startMeasurement(
      measurementMode === "distance" ? "none" : "distance"
    )
  }
>
  <span className="lintas-tool-icon">↔</span>
</button>

{/* PENGUKURAN LUAS */}
<button
  type="button"
  className={`lintas-map-tool ${
    measurementMode === "area" ? "active" : ""
  }`}
  title="Ukur luas"
  aria-label="Ukur luas"
  onClick={() =>
    startMeasurement(
      measurementMode === "area" ? "none" : "area"
    )
  }
>
  <span className="lintas-tool-icon">⬠</span>
</button>

{/* IDENTIFIKASI KOORDINAT DAN ELEVASI */}
<button
  type="button"
  className={`lintas-map-tool ${
    measurementMode === "identify" ? "active" : ""
  }`}
  title="Identifikasi koordinat dan elevasi"
  aria-label="Identifikasi koordinat dan elevasi"
  onClick={() =>
    startMeasurement(
      measurementMode === "identify" ? "none" : "identify"
    )
  }
>
  <span className="lintas-tool-icon">⌖</span>
</button>
  {/* BASEMAP */}
  <div className="lintas-tool-wrapper">
    <button
      type="button"
      className={`lintas-map-tool ${
        basemapOpen ? "active" : ""
      }`}
      title="Pilih basemap"
      aria-label="Pilih basemap"
      aria-expanded={basemapOpen}
      onClick={() => setBasemapOpen((value) => !value)}
    >
      <span className="lintas-tool-icon">▱</span>
    </button>

    {basemapOpen && (
      <div className="lintas-basemap-panel">
        <strong>Pilih Basemap</strong>

        <button
          type="button"
          className={basemap === "esri" ? "active" : ""}
          onClick={() => {
            setBasemap("esri");
            setBasemapOpen(false);
          }}
        >
          <span className="lintas-basemap-thumb satellite" />
          <span>
            <b>Satellite</b>
            <small>Esri World Imagery</small>
          </span>
          {basemap === "esri" && <span>✓</span>}
        </button>

        <button
          type="button"
          className={basemap === "osm" ? "active" : ""}
          onClick={() => {
            setBasemap("osm");
            setBasemapOpen(false);
          }}
        >
          <span className="lintas-basemap-thumb street" />
          <span>
            <b>Street Map</b>
            <small>OpenStreetMap</small>
          </span>
          {basemap === "osm" && <span>✓</span>}
        </button>
      </div>
    )}
  </div>

  {/* INFORMASI JEMBATAN */}
  <button
    type="button"
    className={`lintas-map-tool ${
      showInspector ? "active" : ""
    }`}
    title="Informasi jembatan"
    aria-label="Tampilkan informasi jembatan"
    onClick={() => setShowInspector((value) => !value)}
  >
    <span className="lintas-tool-icon">ⓘ</span>
  </button>

</div>
          <div className="lintas-map-instruction">
            Pilih aset di sidebar atau marker untuk melihat lokasi jembatan.
          </div>

          {showInspector && (
            <aside className="lintas-inspector">
              <div className="lintas-inspector-heading">
                <span>ASSET INFORMATION</span>
                <button
                  onClick={() => setShowInspector(false)}
                  aria-label="Tutup panel"
                >
                  ×
                </button>
              </div>

              {selectedBridge ? (
                <>
                  <h2>{selectedBridge.nama}</h2>
                  <p>
                    {selectedBridge.kelurahan},{" "}
                    {selectedBridge.kemantren}
                  </p>

                  <div className="lintas-inspector-grid">
                    <div>
                      <span>Kondisi</span>
                      <strong>{selectedBridge.kondisi}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{selectedBridge.status}</strong>
                    </div>
                    <div>
                      <span>Kemantapan</span>
                      <strong>{selectedBridge.kemantapan}</strong>
                    </div>
                    <div>
                      <span>Kabupaten/Kota</span>
                      <strong>{selectedBridge.kabupaten}</strong>
                    </div>
                  </div>

                  <button
  className="lintas-inspector-load"
  onClick={() => handleLoadModel(selectedBridge)}
  disabled={!hasBridge3DModel(selectedBridge)}
>
  ◈ Load 3D Model
</button>
                </>
              ) : (
                <div className="lintas-inspector-empty">
                  <span>◎</span>
                  <strong>Belum ada aset dipilih</strong>
                  <p>
                    Pilih marker atau jembatan dari daftar untuk melihat
                    informasi aset.
                  </p>
                </div>
              )}

              <div className="lintas-inspector-layers">
                <strong>LAYERS</strong>
                <div>
                  <span className="layer-dot" />
                  Inventaris jembatan
                  <span className="layer-state">ON</span>
                </div>
                <div>
                  <span className="layer-dot terrain" />
                  Terrain
                  <span className="layer-state">DEFAULT</span>
                </div>
              </div>
            </aside>
          )}

          <div className="lintas-map-bottom">
            <span>WGS 84 · EPSG:4326</span>
            <span>{mappedCount} titik terpetakan</span>
          </div>
          {(measurementMode !== "none" || measurementResult !== null) && (
  <div className="lintas-measure-panel">
    <div className="lintas-measure-heading">
      <strong>
        {measurementMode === "distance"
          ? "PENGUKURAN JARAK"
          : measurementMode === "area"
            ? "PENGUKURAN LUAS"
            : "IDENTIFIKASI TITIK"}
      </strong>

      <button
        type="button"
        onClick={finishMeasurement}
        title="Selesai"
      >
        ×
      </button>
    </div>

    <p>
      {measurementMode === "distance"
        ? "Klik beberapa titik pada peta untuk mengukur jarak."
        : measurementMode === "area"
          ? "Klik minimal tiga titik untuk membentuk area."
          : "Klik satu titik pada peta untuk melihat koordinat dan elevasi."}
    </p>

    {measurementResult && (
      <div className="lintas-measure-result">
        {measurementMode === "distance" &&
          measurementResult.distanceM !== undefined && (
            <div>
              <span>Total jarak</span>
              <strong>
                {measurementResult.distanceM >= 1000
                  ? `${(measurementResult.distanceM / 1000).toFixed(3)} km`
                  : `${measurementResult.distanceM.toFixed(2)} m`}
              </strong>
            </div>
          )}

        {measurementMode === "area" &&
          measurementResult.areaM2 !== undefined && (
            <div>
              <span>Luas area</span>
              <strong>
                {measurementResult.areaM2 >= 10000
                  ? `${(measurementResult.areaM2 / 10000).toFixed(4)} ha`
                  : `${measurementResult.areaM2.toFixed(2)} m²`}
              </strong>
            </div>
          )}

        {measurementMode === "identify" && (
          <>
            {measurementResult.longitude !== undefined && (
              <div>
                <span>Longitude</span>
                <strong>{measurementResult.longitude.toFixed(7)}</strong>
              </div>
            )}

            {measurementResult.latitude !== undefined && (
              <div>
                <span>Latitude</span>
                <strong>{measurementResult.latitude.toFixed(7)}</strong>
              </div>
            )}

            {measurementResult.elevationM !== undefined && (
              <div>
                <span>Elevasi DTM</span>
                <strong>
                  {measurementResult.elevationM.toFixed(2)} m
                </strong>
              </div>
            )}
          </>
        )}

        {measurementMode !== "identify" && (
          <div>
            <span>Jumlah titik</span>
            <strong>{measurementResult.pointCount}</strong>
          </div>
        )}
      </div>
    )}

    <div className="lintas-measure-actions">
      <button type="button" onClick={clearMeasurement}>
        Hapus
      </button>

      {measurementMode !== "identify" && (
        <button type="button" onClick={finishMeasurement}>
          Selesai
        </button>
      )}
    </div>
  </div>
)}
        </section>
      </main>
    </div>
  );
}
