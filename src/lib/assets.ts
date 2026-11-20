
const R2_BASE =
  process.env.NEXT_PUBLIC_R2_BASE_URL ??
  "https://lintas-dataset.ruli-andaru.workers.dev";

export function r2Asset(filename: string): string {
  return `${R2_BASE.replace(/\/$/, "")}/assets/${encodeURIComponent(filename)}`;
}

export const LINTAS_ASSETS = {
  jogja: r2Asset("jogja.png"),
  logo: r2Asset("logo.png"),
  profil: r2Asset("profil.jpg"),
  background: r2Asset("background.jpg"),
  profilIcon: r2Asset("profil.png"),
  statistika: r2Asset("statistika.png"),
  modeling: r2Asset("modeling.png"),

  baik: r2Asset("baik.png"),
  rusakRingan: r2Asset("rusak ringan.png"),
  rusakSedang: r2Asset("rusak sedang.png"),
  rusakBerat: r2Asset("rusak berat.png"),
  kritis: r2Asset("kritis.png"),
  runtuh: r2Asset("runtuh.png"),
};
