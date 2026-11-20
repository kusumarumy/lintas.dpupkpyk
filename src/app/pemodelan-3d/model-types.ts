import type { Cesium3DTileset } from "cesium";

export type ModelCollection = {
  bridge: Cesium3DTileset | null;
  train: Cesium3DTileset | null;
  kleringan: Cesium3DTileset | null;
  area: Cesium3DTileset | null;
  river: Cesium3DTileset | null;
};