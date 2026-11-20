
"use client";

import Header from "@/components/Header";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./statistika.css";

const R2_BASE_URL =
  process.env.NEXT_R2_BASE_URL?.replace(/\/$/, "");

const DATA_URL = R2_BASE_URL
  ? `${R2_BASE_URL}/vektor/Jembatan.geojson`
  : "";

type Raw = Record<string, unknown>;

type Bridge = {
  id: string;
  nama: string;
  kemantren: string;
  kelurahan: string;
  kabupaten: string;
  tahun: string;
  status: string;
  kondisi: string;
  kemantapan: string;
  panjang: number | null;
  lebar: number | null;
  bentang: number | null;
  mapped: boolean;
  components: {
    name: string;
    type: string;
    code: string;
  }[];
};

const COMPONENTS = [
  { name: "Struktur atas", type: "tipe_sa", condition: "kondisi_sa" },
  { name: "Lapis permukaan", type: "tipe_sl", condition: "kondisi_sl" },
  { name: "Pilar", type: "tipe_p", condition: "kondisi_p" },
  { name: "Abutment", type: "tipe_ab", condition: "kondisi_ab" },
  { name: "Fondasi", type: "tipe_fon", condition: "kondisi_po" },
  { name: "Dinding", type: "tipe_din", condition: "kondisi_di" },
  { name: "Komponen HU", type: "", condition: "kondisi_hu" },
];

function getText(p: Raw, key: string): string {
  const v = p[key] ?? p[key.toUpperCase()];

  if (
    v === null ||
    v === undefined ||
    String(v).trim() === "" ||
    String(v).toLowerCase() === "null"
  ) {
    return "";
  }

  return String(v).trim();
}

function getNumber(v: unknown): number | null {
  if (v === null || v === undefined || String(v).trim() === "") {
    return null;
  }

  const n = Number(String(v).trim().replace(",", "."));

  return Number.isFinite(n) ? n : null;
}

function normalize(feature: any, index: number): Bridge {
  const p: Raw = feature.properties ?? {};
  const geometry = feature.geometry;

  const coordinates =
    geometry?.type === "Point" &&
    Array.isArray(geometry.coordinates) &&
    Number.isFinite(Number(geometry.coordinates[0])) &&
    Number.isFinite(Number(geometry.coordinates[1]));

  const longitude = getNumber(p.longitude);
  const latitude = getNumber(p.latitude);

  return {
    id: getText(p, "id") || String(feature.id ?? index + 1),
    nama: getText(p, "nama") || `Jembatan ${index + 1}`,
    kemantren: getText(p, "kemantren") || "Belum diisi",
    kelurahan: getText(p, "kelurahan") || "Belum diisi",
    kabupaten: getText(p, "kabupaten") || "Belum diisi",
    tahun: getText(p, "tahun") || "Belum diisi",
    status: getText(p, "status_op") || "Belum diisi",
    kondisi: getText(p, "kondisi") || "Belum diisi",
    kemantapan: getText(p, "kemantapan") || "Belum diisi",
    panjang: getNumber(p.panjang),
    lebar: getNumber(p.lebar),
    bentang: getNumber(p.bentang),
    mapped: Boolean(
      coordinates ||
      (longitude !== null && latitude !== null)
    ),
    components: COMPONENTS.map((c) => ({
      name: c.name,
      type: c.type ? getText(p, c.type) : "",
      code: getText(p, c.condition),
    })),
  };
}

function groupData(values: string[]) {
  const result = new Map<string, number>();

  values.forEach((value) => {
    const key = value || "Belum diisi";
    result.set(key, (result.get(key) ?? 0) + 1);
  });

  return [...result.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function average(values: (number | null)[]) {
  const valid = values.filter(
    (v): v is number => v !== null
  );

  if (!valid.length) return null;

  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function formatNumber(value: number | null) {
  if (value === null) return "—";

  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}

function percentage(a: number, b: number) {
  return b ? Math.round((a / b) * 100) : 0;
}

function BarChart({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <section className="st-card">
      <div className="st-card-head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      {data.length ? (
        <div className="st-bars">
          {data.slice(0, 10).map((item) => (
            <div className="st-bar-row" key={item.label}>
              <span title={item.label}>{item.label}</span>

              <div className="st-track">
                <i
                  style={{
                    width: `${(item.count / max) * 100}%`,
                  }}
                />
              </div>

              <b>{item.count}</b>
            </div>
          ))}
        </div>
      ) : (
        <div className="st-empty">Belum ada data.</div>
      )}
    </section>
  );
}

function DonutChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  const colors = [
    "#0f8178",
    "#e8a52d",
    "#64748b",
    "#3b82f6",
    "#a78bfa",
    "#df789d",
  ];

  const total = data.reduce((sum, item) => sum + item.count, 0);

  let cursor = 0;

  const gradient = data
    .map((item, index) => {
      const start = total ? (cursor / total) * 100 : 0;
      cursor += item.count;
      const end = total ? (cursor / total) * 100 : 100;

      return `${colors[index % colors.length]} ${start}% ${end}%`;
    })
    .join(",");

  return (
    <section className="st-card">
      <div className="st-card-head">
        <div>
          <h2>Kondisi Umum Jembatan</h2>
          <p>Distribusi berdasarkan kondisi aset.</p>
        </div>
      </div>

      <div className="st-donut-layout">
        <div
          className="st-donut"
          style={{
            background: `conic-gradient(${gradient || "#e8edf2 0% 100%"})`,
          }}
        >
          <div>
            <b>{total}</b>
            <small>Jembatan</small>
          </div>
        </div>

        <div className="st-legend">
          {data.map((item, index) => (
            <div key={item.label}>
              <i
                style={{
                  background: colors[index % colors.length],
                }}
              />
              <span>{item.label}</span>
              <b>{item.count}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function StatistikaPage() {
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [kemantren, setKemantren] = useState("Semua");
  const [condition, setCondition] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const [updated, setUpdated] = useState("");

  const loadData = useCallback(async () => {
    if (!DATA_URL) {
      setError(
        "URL GeoJSON belum dikonfigurasi pada environment."
      );
      setLoading(false);
      return;
    }

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
        throw new Error("Format GeoJSON tidak valid.");
      }

      setBridges(json.features.map(normalize));
      setUpdated(new Date().toLocaleString("id-ID"));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data GeoJSON."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const uniqueOptions = (
    key: "kemantren" | "kondisi" | "status"
  ) =>
    [...new Set(bridges.map((b) => b[key]))]
      .filter((v) => v !== "Belum diisi")
      .sort((a, b) => a.localeCompare(b, "id"));

  const filtered = useMemo(
    () =>
      bridges.filter(
        (b) =>
          (kemantren === "Semua" || b.kemantren === kemantren) &&
          (condition === "Semua" || b.kondisi === condition) &&
          (status === "Semua" || b.status === status)
      ),
    [bridges, kemantren, condition, status]
  );

  const conditionData = useMemo(
    () => groupData(filtered.map((b) => b.kondisi)),
    [filtered]
  );

  const statusData = useMemo(
    () => groupData(filtered.map((b) => b.status)),
    [filtered]
  );

  const regionData = useMemo(
    () => groupData(filtered.map((b) => b.kemantren)),
    [filtered]
  );

  const yearData = useMemo(
    () =>
      groupData(
        filtered
          .filter((b) => b.tahun !== "Belum diisi")
          .map((b) => b.tahun)
      ),
    [filtered]
  );

  const operating = filtered.filter(
    (b) => b.status.toLowerCase() === "beroperasi"
  ).length;

  const mantap = filtered.filter(
    (b) => b.kemantapan.toLowerCase() === "mantap"
  ).length;

  const mapped = filtered.filter((b) => b.mapped).length;

  const complete = filtered.filter(
    (b) =>
      b.kemantren !== "Belum diisi" &&
      b.kelurahan !== "Belum diisi" &&
      b.status !== "Belum diisi" &&
      b.kondisi !== "Belum diisi" &&
      b.panjang !== null &&
      b.lebar !== null
  ).length;

  const componentStats = COMPONENTS.filter(
    (c) => c.condition
  ).map((component) => {
    const values = filtered
      .map(
        (b) =>
          b.components.find(
            (item) => item.name === component.name
          )?.code
      )
      .filter((v): v is string => Boolean(v));

    return {
      name: component.name,
      baik: values.filter((v) => v === "0").length,
      code1: values.filter((v) => v === "1").length,
      code2: values.filter((v) => v === "2").length,
      other: values.filter(
        (v) => !["0", "1", "2"].includes(v)
      ).length,
      filled: values.length,
    };
  });

  const typeData = groupData(
    filtered.flatMap((b) =>
      b.components
        .filter((c) => c.type)
        .map((c) => `${c.name}: ${c.type}`)
    )
  );

  return (
    <div className="statistika-page">
      <Header />

      <main className="statistika-main">
        <header className="st-heading">
          <div>
            <div className="st-eyebrow">
              LINTAS · BRIDGE ANALYTICS
            </div>

            <h1>Statistika Jembatan</h1>

            <p>
              Dashboard inventarisasi, kondisi, dimensi,
              dan kelengkapan data aset jembatan.
            </p>
          </div>

          <div className="st-live">
            <i />
            {loading
              ? "Memuat data"
              : `${filtered.length} aset dianalisis`}
          </div>
        </header>

        <section className="st-filters">
          <label>
            Kemantren
            <select
              value={kemantren}
              onChange={(e) => setKemantren(e.target.value)}
            >
              <option>Semua</option>
              {uniqueOptions("kemantren").map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>

          <label>
            Kondisi umum
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option>Semua</option>
              {uniqueOptions("kondisi").map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>

          <label>
            Status operasional
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Semua</option>
              {uniqueOptions("status").map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
          >
            ↻ Perbarui Data
          </button>

          <button
            type="button"
            className="st-reset"
            onClick={() => {
              setKemantren("Semua");
              setCondition("Semua");
              setStatus("Semua");
            }}
          >
            Reset Filter
          </button>
        </section>

        {error && (
          <div className="st-error">
            <b>Data belum dapat dimuat.</b>
            {error}
            <button onClick={() => void loadData()}>
              Coba Lagi
            </button>
          </div>
        )}

        <section className="st-kpis">
          <article>
            <span>Total Jembatan</span>
            <b>{loading ? "…" : filtered.length}</b>
            <small>Sesuai filter aktif</small>
          </article>

          <article>
            <span>Beroperasi</span>
            <b>{loading ? "…" : operating}</b>
            <small>
              {percentage(operating, filtered.length)}% dari aset
            </small>
          </article>

          <article>
            <span>Kemantapan Mantap</span>
            <b>{loading ? "…" : mantap}</b>
            <small>
              {percentage(mantap, filtered.length)}% dari aset
            </small>
          </article>

          <article>
            <span>Kelengkapan Atribut Inti</span>
            <b>
              {loading
                ? "…"
                : `${percentage(complete, filtered.length)}%`}
            </b>
            <small>Wilayah, kondisi, status, dimensi</small>
          </article>
        </section>

        <section className="st-grid">
          <DonutChart data={conditionData} />

          <BarChart
            title="Status Operasional"
            subtitle="Jumlah aset berdasarkan status_op"
            data={statusData}
          />
        </section>

        <section className="st-grid">
          <BarChart
            title="Distribusi per Kemantren"
            subtitle="Jumlah jembatan berdasarkan wilayah"
            data={regionData}
          />

          <BarChart
            title="Tahun Pembangunan / Pencatatan"
            subtitle="Distribusi berdasarkan atribut tahun"
            data={yearData}
          />
        </section>

        <section className="st-section">
          <div className="st-section-title">
            <h2>Analisis Dimensi dan Geospasial</h2>
            <p>
              Statistik ukuran dan ketersediaan koordinat.
            </p>
          </div>

          <div className="st-dimensions">
            <article>
              <span>Rata-rata Panjang</span>
              <b>{formatNumber(average(filtered.map(b => b.panjang)))} <small>m</small></b>
              <p>{filtered.filter(b => b.panjang !== null).length} data valid</p>
            </article>

            <article>
              <span>Rata-rata Lebar</span>
              <b>{formatNumber(average(filtered.map(b => b.lebar)))} <small>m</small></b>
              <p>{filtered.filter(b => b.lebar !== null).length} data valid</p>
            </article>

            <article>
              <span>Rata-rata Bentang</span>
              <b>{formatNumber(average(filtered.map(b => b.bentang)))} <small>unit</small></b>
              <p>{filtered.filter(b => b.bentang !== null).length} data valid</p>
            </article>

            <article>
              <span>Koordinat Tersedia</span>
              <b>{mapped} <small>aset</small></b>
              <p>{percentage(mapped, filtered.length)}% terpetakan</p>
            </article>
          </div>
        </section>

        <section className="st-grid">
          <section className="st-card">
            <div className="st-card-head">
              <div>
                <h2>Kondisi Komponen Konstruksi</h2>
                <p>Kode 0 = Baik. Kode 1 dan 2 belum diberi interpretasi.</p>
              </div>
            </div>

            <div className="st-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Komponen</th>
                    <th>Baik (0)</th>
                    <th>Kode 1</th>
                    <th>Kode 2</th>
                    <th>Lainnya</th>
                    <th>Terisi</th>
                  </tr>
                </thead>

                <tbody>
                  {componentStats.map((r) => (
                    <tr key={r.name}>
                      <td>{r.name}</td>
                      <td><b className="st-good">{r.baik}</b></td>
                      <td>{r.code1}</td>
                      <td>{r.code2}</td>
                      <td>{r.other}</td>
                      <td>{r.filled}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="st-note">
              Nilai kosong tidak dihitung. Pemetaan kolom mengikuti
              atribut sumber dan perlu dikonfirmasi dengan kamus data.
            </p>
          </section>

          <BarChart
            title="Jenis Komponen Konstruksi"
            subtitle="Distribusi berdasarkan atribut tipe_*"
            data={typeData}
          />
        </section>

        <section className="st-card st-inventory">
          <div className="st-card-head">
            <div>
              <h2>Ringkasan Inventarisasi per Kemantren</h2>
              <p>
                Jumlah aset, status operasional, kemantapan,
                dan rata-rata panjang.
              </p>
            </div>

            <b>{filtered.length} Aset</b>
          </div>

          <div className="st-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kemantren</th>
                  <th>Jumlah</th>
                  <th>Beroperasi</th>
                  <th>Mantap</th>
                  <th>Rata-rata Panjang</th>
                </tr>
              </thead>

              <tbody>
                {regionData.map((region) => {
                  const subset = filtered.filter(
                    (b) => b.kemantren === region.label
                  );

                  return (
                    <tr key={region.label}>
                      <td>{region.label}</td>
                      <td>{subset.length}</td>
                      <td>
                        {subset.filter(
                          (b) => b.status.toLowerCase() === "beroperasi"
                        ).length}
                      </td>
                      <td>
                        {subset.filter(
                          (b) => b.kemantapan.toLowerCase() === "mantap"
                        ).length}
                      </td>
                      <td>
                        {formatNumber(
                          average(subset.map((b) => b.panjang))
                        )} m
                      </td>
                    </tr>
                  );
                })}

                {!regionData.length && (
                  <tr>
                    <td colSpan={5}>Tidak ada data.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="st-footer">
          <span>
            {updated ? `Terakhir diperbarui: ${updated}` : "Menunggu data"}
          </span>
          <span>
            Sumber: GeoJSON Inventarisasi LINTAS · Cloudflare R2
          </span>
        </footer>
      </main>
    </div>
  );
}
