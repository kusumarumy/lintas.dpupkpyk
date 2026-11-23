"use client";

import { useEffect, useRef } from "react";
import type { BridgeMapItem } from "./types";
import { getBridgeAssetIds } from "./bridgeAssets";
import { r2Asset } from "@/lib/assets";
type BasemapType = "esri" | "osm";

type Props = {
  bridges: BridgeMapItem[];
  selectedKelurahan: string | null;
  onSelectKelurahan: (nama: string, kemantren: string) => void;
  selectedBridge: BridgeMapItem | null;
  flyToSignal: number;
  modelSignal: number;
  onSelect: (bridge: BridgeMapItem) => void;
  basemap: BasemapType;
  compassSignal: number;
  measurementMode: MeasurementMode;
  clearMeasurementSignal: number;
  onMeasurementUpdate: (result: MeasurementResult) => void;
};
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
const DATA_URL = "/api/geojson/jembatan";
const KELURAHAN_DATA_URL = "/api/geojson/kelurahan";
const DTM_ASSET_ID = 4185927;

function createBasemapProvider(
  Cesium: any,
  basemap: BasemapType
) {
  if (basemap === "esri") {
    return new Cesium.UrlTemplateImageryProvider({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      credit:
        "Tiles © Esri — Sources: Esri, Maxar, Earthstar Geographics",
      maximumLevel: 19,
    });
  }

  return new Cesium.UrlTemplateImageryProvider({
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    credit: "© OpenStreetMap contributors",
    maximumLevel: 19,
  });
}

export default function CesiumViewer({
  bridges,
  selectedKelurahan,
  onSelectKelurahan,
  selectedBridge,
  flyToSignal,
  modelSignal,
  onSelect,
  basemap,
  compassSignal,
  measurementMode,
  clearMeasurementSignal,
  onMeasurementUpdate,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

const viewerRef = useRef<any>(null);
const cesiumRef = useRef<any>(null);
const dataSourceRef = useRef<any>(null);
const kelurahanDataSourceRef = useRef<any>(null);
const loadedTilesetsRef = useRef<any[]>([]);
const terrainLoadedRef = useRef(false);
const imageryLayerRef = useRef<any>(null);
const basemapRef = useRef<BasemapType>(basemap);
const measurementModeRef = useRef<MeasurementMode>(measurementMode);
const measurementCallbackRef = useRef(onMeasurementUpdate);

const measurementPositionsRef = useRef<any[]>([]);
const measurementPointEntitiesRef = useRef<any[]>([]);
const measurementShapeEntityRef = useRef<any>(null);

const terrainPromiseRef = useRef<Promise<any> | null>(null);

measurementModeRef.current = measurementMode;
measurementCallbackRef.current = onMeasurementUpdate;
basemapRef.current = basemap;
  const bridgesRef = useRef(bridges);
  const selectedBridgeRef = useRef(selectedBridge);
  const selectedKelurahanRef = useRef(selectedKelurahan);
  const onSelectKelurahanRef = useRef(onSelectKelurahan);
  const onSelectRef = useRef(onSelect);

  bridgesRef.current = bridges;
  selectedBridgeRef.current = selectedBridge;
  selectedKelurahanRef.current = selectedKelurahan;
  onSelectKelurahanRef.current = onSelectKelurahan;
  onSelectRef.current = onSelect;

  // =========================================================
  // HELPER: MENCARI DATA JEMBATAN BERDASARKAN ENTITY CESIUM
  // =========================================================
function clearMeasurementEntities() {
  const viewer = viewerRef.current;

  if (!viewer || viewer.isDestroyed()) return;

  for (const entity of measurementPointEntitiesRef.current) {
    viewer.entities.remove(entity);
  }

  measurementPointEntitiesRef.current = [];

  if (measurementShapeEntityRef.current) {
    viewer.entities.remove(measurementShapeEntityRef.current);
    measurementShapeEntityRef.current = null;
  }

  measurementPositionsRef.current = [];
}

function calculateDistance(Cesium: any, positions: any[]) {
  let total = 0;

  for (let i = 1; i < positions.length; i++) {
    const start = Cesium.Cartographic.fromCartesian(positions[i - 1]);
    const end = Cesium.Cartographic.fromCartesian(positions[i]);

    const geodesic = new Cesium.EllipsoidGeodesic(start, end);

    total += geodesic.surfaceDistance;
  }

  return total;
}

function calculateGeodesicArea(Cesium: any, positions: any[]) {
  if (positions.length < 3) return 0;

  const cartographics = positions.map((position) =>
    Cesium.Cartographic.fromCartesian(position)
  );

  const radius = Cesium.Ellipsoid.WGS84.maximumRadius;
  let sum = 0;

  for (let i = 0; i < cartographics.length; i++) {
    const current = cartographics[i];
    const next = cartographics[(i + 1) % cartographics.length];

    sum +=
      (next.longitude - current.longitude) *
      (2 + Math.sin(current.latitude) + Math.sin(next.latitude));
  }

  return Math.abs((sum * radius * radius) / 2);
}

function drawMeasurement(Cesium: any) {
  const viewer = viewerRef.current;

  if (!viewer || viewer.isDestroyed()) return;

  const positions = measurementPositionsRef.current;

  // Hapus bentuk sebelumnya, tetapi pertahankan marker titik.
  if (measurementShapeEntityRef.current) {
    viewer.entities.remove(measurementShapeEntityRef.current);
    measurementShapeEntityRef.current = null;
  }

  const mode = measurementModeRef.current;

  if (mode === "distance" && positions.length >= 2) {
    measurementShapeEntityRef.current = viewer.entities.add({
      polyline: {
        positions,
        width: 4,
        material: Cesium.Color.fromCssColorString("#FFD166"),
        clampToGround: true,
      },
    });

    const distanceM = calculateDistance(Cesium, positions);

    measurementCallbackRef.current({
      mode: "distance",
      distanceM,
      pointCount: positions.length,
    });
  }

  if (mode === "area" && positions.length >= 2) {
    const shape: any = {
      polyline: {
        positions:
          positions.length >= 3
            ? [...positions, positions[0]]
            : positions,
        width: 3,
        material: Cesium.Color.fromCssColorString("#FFD166"),
        clampToGround: true,
      },
    };

    if (positions.length >= 3) {
      shape.polygon = {
        hierarchy: new Cesium.PolygonHierarchy(positions),
        material: Cesium.Color.fromCssColorString("#00D4FF")
          .withAlpha(0.22),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString("#00D4FF"),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      };
    }

    measurementShapeEntityRef.current = viewer.entities.add(shape);

    const areaM2 =
      positions.length >= 3
        ? calculateGeodesicArea(Cesium, positions)
        : undefined;

    measurementCallbackRef.current({
      mode: "area",
      areaM2,
      pointCount: positions.length,
    });
  }
}
function ensureTerrainLoaded(
  Cesium: any,
  viewer: any
): Promise<any> {
  if (terrainLoadedRef.current) {
    return Promise.resolve(viewer.terrainProvider);
  }

  if (terrainPromiseRef.current) {
    return terrainPromiseRef.current;
  }

  const promise: Promise<any> = Cesium.CesiumTerrainProvider
    .fromIonAssetId(DTM_ASSET_ID)
    .then((terrain: any) => {
      if (viewer.isDestroyed()) {
        throw new Error("Cesium viewer sudah dihentikan.");
      }

      viewer.terrainProvider = terrain;
      terrainLoadedRef.current = true;

      console.log("DTM berhasil dimuat:", DTM_ASSET_ID);

      return terrain;
    })
    .catch((error: unknown) => {
      terrainPromiseRef.current = null;

      console.error("DTM gagal dimuat:", error);

      throw error;
    });

  terrainPromiseRef.current = promise;

  return promise;
}
  function findBridgeForEntity(entity: any, Cesium: any) {
    const currentBridges = bridgesRef.current;

    const entityId = String(entity.id ?? "");
    const entityName = String(entity.name ?? "").trim().toLowerCase();

    const time = Cesium.JulianDate.now();

    let longitude: number | null = null;
    let latitude: number | null = null;

    if (entity.position) {
      const position = entity.position.getValue(time);

      if (position) {
        const cartographic =
          Cesium.Cartographic.fromCartesian(position);

        longitude = Cesium.Math.toDegrees(cartographic.longitude);
        latitude = Cesium.Math.toDegrees(cartographic.latitude);
      }
    }

    // Cocokkan berdasarkan ID atau nama.
    let matched = currentBridges.find((bridge) => {
      return (
        String(bridge.id) === entityId ||
        bridge.nama.trim().toLowerCase() === entityName
      );
    });

    // Jika ID/nama tidak cocok, gunakan koordinat terdekat.
    if (!matched && longitude !== null && latitude !== null) {
      let nearestDistance = Infinity;

      for (const bridge of currentBridges) {
        if (
          bridge.longitude === null ||
          bridge.latitude === null
        ) {
          continue;
        }

        const distance = Math.hypot(
          bridge.longitude - longitude,
          bridge.latitude - latitude
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          matched = bridge;
        }
      }

      // Maksimum toleransi sekitar 20 meter.
      if (nearestDistance > 0.0002) {
        matched = undefined;
      }
    }

    return matched ?? null;
  }

  // =========================================================
  // HELPER: MENGATUR TAMPILAN ENTITY GEOJSON
  // =========================================================

  function getConditionIconUrl(condition: unknown): string | null {
    const value = String(condition ?? "").trim().toLowerCase();

    // Data kondisi pada GeoJSON: 0 = Baik sampai 5 = Runtuh.
    // Mendukung nilai numerik ("0", "1", dst.) maupun label teks.
    let code: number | null = null;

    const numericMatch = value.match(/^([0-5])(?:\s|[:.-]|$)/);
    if (numericMatch) {
      code = Number(numericMatch[1]);
    } else if (/^(baik|mantap)$/.test(value)) {
      code = 0;
    } else if (value.includes("rusak ringan")) {
      code = 1;
    } else if (value.includes("rusak sedang")) {
      code = 2;
    } else if (value.includes("rusak berat")) {
      code = 3;
    } else if (value.includes("kritis")) {
      code = 4;
    } else if (value.includes("runtuh")) {
      code = 5;
    }

    const filenames: Record<number, string> = {
      0: "baik.png",
      1: "rusak ringan.png",
      2: "rusak sedang.png",
      3: "rusak berat.png",
      4: "kritis.png",
      5: "runtuh.png",
    };

    return code === null ? null : r2Asset(filenames[code]);
  }

  function styleGeoJsonEntities(
    dataSource: any,
    Cesium: any
  ) {
    const entities = dataSource.entities.values;

    for (const entity of entities) {
      const bridge = findBridgeForEntity(entity, Cesium);

      const isSelected =
        bridge !== null &&
        selectedBridgeRef.current?.id === bridge.id;

      // Simbol marker PNG mengikuti nilai field "kondisi" dari GeoJSON R2.
      if (entity.position) {
        const propertyCondition = entity.properties?.kondisi;
        const geoJsonCondition =
          propertyCondition && typeof propertyCondition.getValue === "function"
            ? propertyCondition.getValue(Cesium.JulianDate.now())
            : propertyCondition;
        const condition = bridge?.kondisi || geoJsonCondition || "";
        const iconUrl = getConditionIconUrl(condition);

        if (iconUrl) {
          entity.point = undefined;
          entity.billboard = new Cesium.BillboardGraphics({
            image: iconUrl,
            width: isSelected ? 38 : 32,
            height: isSelected ? 38 : 32,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: 100000,
          });
        } else {
          // Fallback untuk nilai kondisi kosong/tidak dikenal.
          entity.billboard = undefined;
          entity.point = new Cesium.PointGraphics({
            pixelSize: isSelected ? 15 : 10,
            color: isSelected
              ? Cesium.Color.ORANGE
              : Cesium.Color.fromCssColorString("#00D4FF"),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: 100000,
          });
        }

        entity.label = new Cesium.LabelGraphics({
          text: bridge?.nama || entity.name || "Jembatan",
          font: "12px sans-serif",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -24),
          scale: isSelected ? 1.0 : 0.85,
          show: isSelected,
          disableDepthTestDistance: 100000,
        });
      }

      // Styling apabila GeoJSON memiliki geometri garis.
      if (entity.polyline) {
        entity.polyline.width = isSelected ? 5 : 3;
        entity.polyline.material = isSelected
          ? Cesium.Color.ORANGE
          : Cesium.Color.CYAN;
        entity.polyline.clampToGround = true;
      }
    }
  }
function getPropertyValue(entity: any, key: string, Cesium: any) {
  const property = entity.properties?.[key];
  if (property && typeof property.getValue === "function") {
    return property.getValue(Cesium.JulianDate.now());
  }
  return property ?? "";
}

function normalizeAreaName(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function styleKelurahanEntities(
  dataSource: any,
  Cesium: any,
  selectedName: string | null,
  basemap: BasemapType
) {
  if (!dataSource) return;

  const selectedKey = normalizeAreaName(selectedName);

  // Satu warna untuk seluruh kelurahan dalam kemantren yang sama.
  // Palet pastel dibuat berbeda agar batas kelompok wilayah mudah dikenali,
  // tetapi tetap lembut di atas basemap satelit maupun OSM.
  const satellitePalette = [
    "#B8D8C7", // sage green
    "#B9CBE8", // soft blue
    "#E9C5D7", // dusty pink
    "#E9D5AE", // warm beige
    "#C9BCE3", // lavender
    "#B8D9DF", // soft teal
    "#D8D6B5", // muted olive
    "#E8C4B2", // soft terracotta
    "#C4D5B5", // pale moss
    "#D3C6B8", // stone
    "#C3C8E3", // periwinkle
    "#E4D0DF", // mauve
    "#C6D8D0", // eucalyptus
    "#E5D7B8", // sand
  ];

  // OSM memakai warna pastel yang lebih vivid dan jenuh,
  // mendekati tampilan tematik yang cerah tanpa kehilangan karakter lembut.
  const osmPalette = [
    "#83D18C", // fresh green
    "#8DB8F0", // clear blue
    "#E6A0D2", // vivid dusty pink
    "#E9C978", // warm golden yellow
    "#B8A0E8", // lavender
    "#72D1D0", // turquoise
    "#C6D985", // fresh olive
    "#EBA184", // coral
    "#9BD59B", // mint green
    "#D8B99A", // sand
    "#9BADEB", // periwinkle
    "#E5A4B8", // rose
    "#83CDB5", // eucalyptus
    "#E5CF8D", // soft amber
  ];

  const entities = dataSource.entities.values;
  const kemantrenKeys: string[] = Array.from(
    new Set<string>(
      entities
        .filter((entity: any) => entity.polygon)
        .map((entity: any): string =>
          normalizeAreaName(getPropertyValue(entity, "NAME_3", Cesium))
        )
        .filter((name: string) => name.length > 0)
    )
  ).sort();

  // Urutan warna ditentukan dari daftar kemantren yang ditemukan,
  // sehingga warna setiap kemantren konsisten pada seluruh polygon.
  const isOsm = basemap === "osm";
  const kemantrenPalette = isOsm ? osmPalette : satellitePalette;

  const kemantrenColorByKey = new Map<string, string>();
  kemantrenKeys.forEach((key, index) => {
    kemantrenColorByKey.set(
      key,
      kemantrenPalette[index % kemantrenPalette.length]
    );
  });

  for (const entity of entities) {
    if (!entity.polygon) continue;

    const kelurahanName = getPropertyValue(entity, "NAME_4", Cesium);
    const kemantrenName = getPropertyValue(entity, "NAME_3", Cesium);
    const kemantrenKey = normalizeAreaName(kemantrenName);
    const isSelected =
      selectedKey !== "" &&
      normalizeAreaName(kelurahanName) === selectedKey;

    const fillColor =
      kemantrenColorByKey.get(kemantrenKey) ?? "#D4DCE5";

    // OSM memakai warna lebih vivid dan outline putih agar batas
    // kelurahan terbaca jelas di atas detail jalan dan label.
    // Satellite tetap memakai palet pastel awal tanpa perubahan.
    const fillAlpha = isSelected
      ? isOsm ? 0.86 : 0.60
      : isOsm ? 0.76 : 0.35;

    entity.polygon.material = Cesium.Color.fromCssColorString(
      fillColor
    ).withAlpha(fillAlpha);

    entity.polygon.outline = true;
    entity.polygon.outlineColor = isSelected
      ? Cesium.Color.fromCssColorString(
          isOsm ? "#294B63" : "#174A70"
        ).withAlpha(0.98)
      : Cesium.Color.fromCssColorString("#FFFFFF").withAlpha(
          isOsm ? 0.94 : 0.82
        );
    entity.polygon.outlineWidth = isSelected ? 3 : isOsm ? 2 : 1;

    entity.polygon.height = 0;
    entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
  }
}

// HAPUS MODEL LAMA KETIKA PENGGUNA BERPINDAH JEMBATAN
useEffect(() => {
  const viewer = viewerRef.current;

  if (!viewer || viewer.isDestroyed()) return;

  for (const tileset of loadedTilesetsRef.current) {
    viewer.scene.primitives.remove(tileset);
  }

  loadedTilesetsRef.current = [];
}, [selectedBridge?.id]);
  // =========================================================
  // 1. INISIALISASI CESIUM
  // =========================================================

  useEffect(() => {
    let cancelled = false;
    let localViewer: any = null;

    async function initializeCesium() {
      try {
        const Cesium = await import("cesium");

        if (cancelled || !containerRef.current) return;

        cesiumRef.current = Cesium;

        const token =
          process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN_A ?? "";

        if (token) {
          Cesium.Ion.defaultAccessToken = token;
        }

        (window as any).CESIUM_BASE_URL = "/cesium/";

        localViewer = new Cesium.Viewer(containerRef.current, {
  animation: false,
  timeline: false,
  baseLayerPicker: false,
  geocoder: false,
  homeButton: true,
  sceneModePicker: true,
  navigationHelpButton: false,
  fullscreenButton: false,
  infoBox: false,
  selectionIndicator: false,
  baseLayer: false,
  terrainProvider: new Cesium.EllipsoidTerrainProvider(),
  scene3DOnly: false,
  shouldAnimate: true,
});

        if (cancelled) {
          localViewer.destroy();
          return;
        }

        viewerRef.current = localViewer;

        // Pastikan kontrol kamera Cesium tetap menerima input pengguna.
        localViewer.scene.screenSpaceCameraController.enableInputs = true;

        imageryLayerRef.current =
  localViewer.imageryLayers.addImageryProvider(
    createBasemapProvider(Cesium, basemapRef.current)
  );

        localViewer.scene.globe.depthTestAgainstTerrain = false;
        localViewer.scene.globe.enableLighting = true;
        localViewer.scene.globe.showGroundAtmosphere = true;
        localViewer.scene.highDynamicRange = true;
// Muat DTM secara mandiri, tanpa menunggu Load 3D Model.
void ensureTerrainLoaded(Cesium, localViewer).catch(
  (error: unknown) => {
    console.warn(
      "DTM belum tersedia. Pengukuran sementara menggunakan ellipsoid.",
      error
    );
  }
);
        
// =====================================================
// CINEMATIC INITIAL CAMERA
// Globe view -> Yogyakarta
// =====================================================

// Posisi awal dari ketinggian global.
localViewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(
    105,
    -2,
    25000000
  ),
  orientation: {
    heading: 0,
    pitch: Cesium.Math.toRadians(-90),
    roll: 0,
  },
});

// Animasi menuju Kota Yogyakarta.
localViewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(
    110.3695,
    -7.8556,
    18000
  ),
  duration: 6,
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-75),
    roll: 0,
  },
  easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
});
;

        // 2. LOAD GEOJSON MELALUI API SERVER

console.log("Memuat GeoJSON melalui API:", DATA_URL);

const dataSource =
  await Cesium.GeoJsonDataSource.load(DATA_URL, {
    clampToGround: true,
    markerSize: 10,
    markerColor: Cesium.Color.CYAN,
    stroke: Cesium.Color.CYAN,
    strokeWidth: 3,
  });

        if (
          cancelled ||
          localViewer.isDestroyed()
        ) {
          return;
        }

        await localViewer.dataSources.add(dataSource);

        dataSourceRef.current = dataSource;

        styleGeoJsonEntities(dataSource, Cesium);

        // Muat batas administrasi kelurahan dari Cloudflare R2.
        try {
          const kelurahanSource = await Cesium.GeoJsonDataSource.load(
            KELURAHAN_DATA_URL,
            { clampToGround: true, stroke: Cesium.Color.WHITE, strokeWidth: 1, fill: Cesium.Color.TRANSPARENT }
          );

          if (!cancelled && !localViewer.isDestroyed()) {
            await localViewer.dataSources.add(kelurahanSource);
            kelurahanDataSourceRef.current = kelurahanSource;
            styleKelurahanEntities(
              kelurahanSource,
              Cesium,
              selectedKelurahanRef.current,
              basemapRef.current
            );
            console.log(
              "GeoJSON kelurahan berhasil dimuat:",
              kelurahanSource.entities.values.length,
              "kelurahan"
            );
          }
        } catch (kelurahanError) {
          console.error("GeoJSON kelurahan gagal dimuat:", kelurahanError);
        }

        console.log(
          "GeoJSON berhasil dimuat ke Cesium:",
          dataSource.entities.values.length,
          "entities"
        );

        // =====================================================
        // 3. KLIK ENTITY UNTUK MEMILIH JEMBATAN
        // =====================================================
localViewer.screenSpaceEventHandler.setInputAction(
  async (movement: any) => {
    const mode = measurementModeRef.current;

    // =====================================================
    // MODE PENGUKURAN
    // =====================================================

    if (mode !== "none") {
      const scene = localViewer.scene;
      const camera = localViewer.camera;

      const ray = camera.getPickRay(movement.position);

      let cartesian = ray
        ? scene.globe.pick(ray, scene)
        : undefined;

      // Fallback jika terrain belum tersedia atau globe.pick gagal.
      if (!cartesian) {
        cartesian = camera.pickEllipsoid(
          movement.position,
          Cesium.Ellipsoid.WGS84
        );
      }

      if (!cartesian) return;

      const cartographic =
        Cesium.Cartographic.fromCartesian(cartesian);

      // IDENTIFIKASI KOORDINAT DAN ELEVASI
      if (mode === "identify") {
        let elevationM = cartographic.height;

        try {
          if (
            terrainLoadedRef.current &&
            viewerRef.current?.terrainProvider
          ) {
            const sampled = await Cesium.sampleTerrainMostDetailed(
              viewerRef.current.terrainProvider,
              [
                Cesium.Cartographic.fromDegrees(
                  Cesium.Math.toDegrees(cartographic.longitude),
                  Cesium.Math.toDegrees(cartographic.latitude)
                ),
              ]
            );

            if (
              sampled[0] &&
              Number.isFinite(sampled[0].height)
            ) {
              elevationM = sampled[0].height;
            }
          }
        } catch (error) {
          console.warn("Gagal mengambil elevasi DTM:", error);
        }

        measurementCallbackRef.current({
          mode: "identify",
          longitude: Cesium.Math.toDegrees(cartographic.longitude),
          latitude: Cesium.Math.toDegrees(cartographic.latitude),
          elevationM,
          pointCount: 1,
        });

        // Tandai lokasi identifikasi.
        clearMeasurementEntities();

        const marker = localViewer.entities.add({
          position: cartesian,
          point: {
            pixelSize: 13,
            color: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });

        measurementPointEntitiesRef.current.push(marker);

        return;
      }

      // JARAK DAN LUAS
      measurementPositionsRef.current.push(cartesian);

      const marker = localViewer.entities.add({
        position: cartesian,
        point: {
          pixelSize: 10,
          color: Cesium.Color.fromCssColorString("#FFD166"),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.NONE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });

      measurementPointEntitiesRef.current.push(marker);

      drawMeasurement(Cesium);

      return;
    }

    // =====================================================
    // MODE NORMAL: PILIH MARKER JEMBATAN
    // =====================================================

    const picked = localViewer.scene.pick(movement.position);

    if (!Cesium.defined(picked) || !picked.id) {
      return;
    }

    const entity = picked.id;

    const bridge = findBridgeForEntity(entity, Cesium);

    if (bridge) {
      onSelectRef.current(bridge);
      return;
    }

    // Klik polygon batas kelurahan untuk membuka ringkasan statistik.
    const kelurahanName = getPropertyValue(entity, "NAME_4", Cesium);
    const kemantrenName = getPropertyValue(entity, "NAME_3", Cesium);
    if (entity.polygon && String(kelurahanName ?? "").trim()) {
      onSelectKelurahanRef.current(
        String(kelurahanName).trim(),
        String(kemantrenName ?? "").trim()
      );
    }
  },
  Cesium.ScreenSpaceEventType.LEFT_CLICK
);

      } catch (error) {
        console.error(
          "Cesium initialization / GeoJSON error:",
          error
        );
      }
    }

    void initializeCesium();

    return () => {
  cancelled = true;

  if (
    localViewer &&
    !localViewer.isDestroyed()
  ) {
    localViewer.destroy();
  }

  viewerRef.current = null;
  imageryLayerRef.current = null;
  dataSourceRef.current = null;
  kelurahanDataSourceRef.current = null;
  cesiumRef.current = null;
  loadedTilesetsRef.current = [];
  terrainLoadedRef.current = false;
  terrainPromiseRef.current = null;
measurementPositionsRef.current = [];
measurementPointEntitiesRef.current = [];
measurementShapeEntityRef.current = null;
};
  }, []);
  // =========================================================
// UPDATE MODE PENGUKURAN
// =========================================================

useEffect(() => {
  measurementModeRef.current = measurementMode;

  if (measurementMode === "none") return;

  clearMeasurementEntities();
}, [measurementMode]);

// =========================================================
// HAPUS HASIL PENGUKURAN
// =========================================================

useEffect(() => {
  if (clearMeasurementSignal <= 0) return;

  clearMeasurementEntities();

  measurementCallbackRef.current({
    mode: measurementModeRef.current,
    pointCount: 0,
  });
}, [clearMeasurementSignal]);
useEffect(() => {
  const viewer = viewerRef.current;
  const Cesium = cesiumRef.current;

  if (
    !viewer ||
    viewer.isDestroyed() ||
    !Cesium
  ) {
    return;
  }

  const previousLayer = imageryLayerRef.current;

  if (previousLayer) {
    viewer.imageryLayers.remove(previousLayer, true);
    imageryLayerRef.current = null;
  }

  const newLayer = viewer.imageryLayers.addImageryProvider(
    createBasemapProvider(Cesium, basemap)
  );

  imageryLayerRef.current = newLayer;
}, [basemap]);
useEffect(() => {
  const viewer = viewerRef.current;
  const Cesium = cesiumRef.current;
  const source = kelurahanDataSourceRef.current;
  if (!viewer || viewer.isDestroyed() || !Cesium || !source) return;
  styleKelurahanEntities(source, Cesium, selectedKelurahan, basemap);
}, [selectedKelurahan, basemap]);

// RESET KOMPAS: arah utara berada di atas
useEffect(() => {
  const viewer = viewerRef.current;
  const Cesium = cesiumRef.current;

  if (
    !viewer ||
    viewer.isDestroyed() ||
    !Cesium ||
    compassSignal <= 0
  ) {
    return;
  }

  viewer.camera.setView({
    destination: viewer.camera.position,
    orientation: {
      heading: 0,
      pitch: viewer.camera.pitch,
      roll: 0,
    },
  });
}, [compassSignal]);
  // =========================================================
  // 5. UPDATE MARKER KETIKA JEMBATAN DIPILIH
  // =========================================================

  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    const dataSource = dataSourceRef.current;

    if (
      !viewer ||
      viewer.isDestroyed() ||
      !Cesium ||
      !dataSource
    ) {
      return;
    }

    styleGeoJsonEntities(dataSource, Cesium);
  }, [selectedBridge]);

  
useEffect(() => {
  const viewer = viewerRef.current;
  const Cesium = cesiumRef.current;
  const selected = selectedBridge;

  if (
    !viewer ||
    viewer.isDestroyed() ||
    !Cesium ||
    selected === null ||
    flyToSignal <= 0
  ) {
    return;
  }

  const bridge: BridgeMapItem = selected;

  const longitude = bridge.longitude;
  const latitude = bridge.latitude;

  if (
    longitude === null ||
    latitude === null
  ) {
    console.warn(
      "Koordinat jembatan tidak tersedia:",
      bridge.nama
    );
    return;
  }

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      1200
    ),
    duration: 1.8,
  });
}, [flyToSignal, selectedBridge]);



useEffect(() => {
  const viewer = viewerRef.current;
  const Cesium = cesiumRef.current;
  const selected = selectedBridge;

  if (
    !viewer ||
    viewer.isDestroyed() ||
    !Cesium ||
    selected === null ||
    modelSignal <= 0
  ) {
    return;
  }

  const activeBridge: BridgeMapItem = selected;
  let cancelled = false;

  async function loadBridge3D() {
    try {
      // A. HAPUS MODEL JEMBATAN SEBELUMNYA
      for (const oldTileset of loadedTilesetsRef.current) {
        viewer.scene.primitives.remove(oldTileset);
      }

      loadedTilesetsRef.current = [];

      if (cancelled || viewer.isDestroyed()) return;

      // B. VALIDASI KOORDINAT
      if (
        activeBridge.longitude === null ||
        activeBridge.latitude === null
      ) {
        console.warn(
          "Koordinat tidak tersedia:",
          activeBridge.nama
        );
        return;
      }

      // C. PERIKSA KETERSEDIAAN MODEL
      const assetIds = getBridgeAssetIds(activeBridge);

      if (assetIds.length === 0) {
        console.log(
          "Jembatan tidak memiliki model 3D:",
          activeBridge.nama
        );
        return;
      }

      console.log("Jembatan:", activeBridge.nama);
      console.log("Asset IDs:", assetIds);

      // D. LOAD DTM
      if (!terrainLoadedRef.current) {
  console.log("Memastikan DTM tersedia:", DTM_ASSET_ID);

  await ensureTerrainLoaded(Cesium, viewer);

  if (cancelled || viewer.isDestroyed()) return;
}

      if (cancelled || viewer.isDestroyed()) return;

      // E. LOAD SEMUA MODEL 3D
      const newTilesets: any[] = [];

      for (const assetId of assetIds) {
        if (cancelled || viewer.isDestroyed()) return;

        console.log("Memuat Asset ID:", assetId);

        const tileset =
          await Cesium.Cesium3DTileset.fromIonAssetId(
            assetId
          );

        if (cancelled || viewer.isDestroyed()) {
          tileset.destroy();
          return;
        }

        viewer.scene.primitives.add(tileset);
        newTilesets.push(tileset);

        loadedTilesetsRef.current = [...newTilesets];

        console.log("Model berhasil dimuat:", assetId);
      }

      // F. ARAHKAN KAMERA KE MODEL
      if (
        newTilesets.length > 0 &&
        !cancelled &&
        !viewer.isDestroyed()
      ) {
        await viewer.flyTo(newTilesets[0], {
          duration: 2,
          offset: new Cesium.HeadingPitchRange(
            0,
            Cesium.Math.toRadians(-30),
            350
          ),
        });
      }

      console.log(
        "Load 3D selesai:",
        activeBridge.nama,
        assetIds
      );

    } catch (error) {
      if (!cancelled) {
        console.error(
          "Gagal memuat model 3D:",
          activeBridge.nama,
          error
        );
      }
    }
  }

  void loadBridge3D();

  return () => {
    cancelled = true;
  };
}, [modelSignal]);


  // =========================================================
  // RENDER CONTAINER
  // =========================================================

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        background: "#dce6ed",
        position: "absolute",
        inset: 0,
      }}
    />
  );
}
