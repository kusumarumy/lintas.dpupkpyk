
import type { BridgeMapItem } from "./types";

export function normalizeBridgeText(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function getBridgeAssetIds(bridge: BridgeMapItem): number[] {
  // Identifikasi hanya berdasarkan NAMA JEMBATAN.
  const nama = normalizeBridgeText(bridge.nama);

  if (nama.includes("kewek")) return [4203746, 4203751];
  if (nama.includes("kleringan")) return [4203750, 4203751];
  if (nama.includes("mujamuju")) return [4204004];
  if (nama.includes("winong")) return [4203737];

  // Jembatan lain tidak memiliki model 3D.
  return [];
}

export function hasBridge3DModel(bridge: BridgeMapItem): boolean {
  return getBridgeAssetIds(bridge).length > 0;
}

export function getBridgeOperationalStatus(
  bridge: Pick<BridgeMapItem, "nama">
): string {
  const nama = normalizeBridgeText(bridge.nama);

  return nama.includes("kewek")
    ? "Tidak Beroperasi"
    : "Beroperasi";
}
