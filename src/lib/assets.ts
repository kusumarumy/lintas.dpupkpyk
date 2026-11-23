export function r2Asset(
  filename: string,
  folder: "assets" | "data" = "assets"
): string {
  const encodedPath = [folder, ...filename.split("/")]
    .map(encodeURIComponent)
    .join("/");

  return `/api/r2/${encodedPath}`;
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
