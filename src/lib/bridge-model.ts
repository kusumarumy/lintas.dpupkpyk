import type { CesiumAccount } from "@/lib/cesium";

export type BridgeModel = {
  id: string;
  name: string;
  assetId: number;
  account: CesiumAccount;
  longitude: number;
  latitude: number;
  height?: number;
};

export const BRIDGE_MODELS: BridgeModel[] = [
  {
    id: "jembatan-kewek",
    name: "Jembatan Kewek",
    assetId: 0, // Ganti dengan Cesium Asset ID
    account: "accountA",
    longitude: 0, // Ganti koordinat sebenarnya
    latitude: 0,
  },
  {
    id: "jembatan-sayidan",
    name: "Jembatan Sayidan",
    assetId: 0,
    account: "accountB",
    longitude: 0,
    latitude: 0,
  },
];