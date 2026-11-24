import type { BridgeData } from "./types";

import { kewek } from "./kewek";
import { kleringan } from "./kleringan";
import { mujaMujuSelatan } from "./muja-muju-selatan";
import { mujaMujuUtara } from "./muja-muju-utara";
import { winongSelatan } from "./winong-selatan";
import { winongUtara } from "./winong-utara";
import { sardjito } from "./sardjito";
import { tamansariBaru } from "./tamansari-baru";
import { serangan } from "./serangan";

export const bridges: BridgeData[] = [
  kewek,
  kleringan,
  mujaMujuSelatan,
  mujaMujuUtara,
  winongSelatan,
  winongUtara,
  sardjito,
  tamansariBaru,
  serangan,
];

export function getBridgeBySlug(slug: string) {
  return bridges.find((bridge) => bridge.slug === slug);
}

export function getBridgeConditionLabel(value: number | null) {
  if (value === null) return "Data tidak tersedia";

  const labels: Record<number, string> = {
    0: "Baik",
    1: "Rusak Ringan",
    2: "Rusak Sedang",
    3: "Rusak Berat",
    4: "Kritis",
    5: "Runtuh",
  };

  return labels[value] ?? "Tidak diketahui";
}
