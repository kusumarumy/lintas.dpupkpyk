"use client";

import Header from "@/components/Header";
import { getBridgeBySlug, getBridgeConditionLabel } from "@/data/bridges";
import { getCesiumToken } from "@/lib/cesium";
import type { BridgeData } from "@/data/bridges/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type * as Cesium from "cesium";

import "cesium/Build/Cesium/Widgets/widgets.css";

type CesiumLayerState = {
  area: boolean;
  river: boolean;
};

const CONDITION_COLORS: Record<number, string> = {
  0: "#16a36a",
  1: "#e5a52e",
  2: "#e67e22",
  3: "#dc5656",
  4: "#a83232",
  5: "#541d35",
};

declare global {
  interface Window {
    CESIUM_BASE_URL: string;
    Cesium?: typeof import("cesium");
  }
}

// Menjaga satu proses pemuatan Cesium untuk seluruh halaman.
let cesiumLoadPromise: Promise<typeof import("cesium")> | null = null;

function loadCesiumRuntime(): Promise<typeof import("cesium")> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cesium hanya dapat dimuat di browser."));
  }

  // Lokasi seluruh aset runtime Cesium.
  window.CESIUM_BASE_URL = "/cesium/";

  // Jika Cesium sudah tersedia, gunakan kembali.
  if (window.Cesium) {
    return Promise.resolve(window.Cesium);
  }

  // Hindari memuat script berulang kali.
  if (cesiumLoadPromise) {
    return cesiumLoadPromise;
  }

  cesiumLoadPromise = new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(
      'script[data-cesium-runtime="true"]',
    );

    const handleLoad = () => {
      if (window.Cesium) {
        resolve(window.Cesium);
      } else {
        reject(
          new Error(
            "Cesium.js dimuat, tetapi objek window.Cesium tidak tersedia.",
          ),
        );
      }
    };

    const handleError = () => {
      reject(new Error("Gagal memuat runtime Cesium dari /cesium/Cesium.js."));
    };

    if (!script) {
      script = document.createElement("script");
      script.src = "/cesium/Cesium.js";
      script.async = true;
      script.dataset.cesiumRuntime = "true";
    }

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!script.isConnected) {
      document.head.appendChild(script);
    }
  });

  return cesiumLoadPromise.catch((error) => {
    cesiumLoadPromise = null;
    throw error;
  });
}

function getConditionColor(value: number | null) {
  if (value === null) return "#8993a4";
  return CONDITION_COLORS[value] ?? "#8993a4";
}

function formatCoordinate(value: number) {
  return Number.isFinite(value) ? value.toFixed(6) : "-";
}

function getLatestHistory(bridge: BridgeData) {
  return [...bridge.history]
    .filter((item) => item.value !== null)
    .sort((a, b) => b.year - a.year)[0];
}

function getConditionDescription(value: number | null) {
  const descriptions: Record<number, string> = {
    0: "Kondisi jembatan tergolong baik.",
    1: "Diperlukan pemeliharaan dan perbaikan rutin.",
    2: "Diperlukan penanganan terhadap kerusakan sedang.",
    3: "Diperlukan penanganan segera terhadap kerusakan berat.",
    4: "Kondisi kritis dan membutuhkan penanganan prioritas.",
    5: "Kondisi runtuh.",
  };

  if (value === null) return "Belum tersedia data kondisi.";
  return descriptions[value] ?? "Status kondisi belum diketahui.";
}

function getCurrentWibMinutes() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);

  return hour * 60 + minute;
}

function getWibJulianDate(
  CesiumRuntime: typeof import("cesium"),
  minutes: number,
) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  // WIB = UTC + 7 jam.
  const date = new Date(
    Date.UTC(year, month - 1, day, hour - 7, minute),
  );

  return CesiumRuntime.JulianDate.fromDate(date);
}

function formatWibTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}


function CesiumBridgeViewer({ bridge }: { bridge: BridgeData }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const cesiumModuleRef = useRef<typeof import("cesium") | null>(null);

  const mainTilesetRef = useRef<Cesium.Cesium3DTileset | null>(null);
  const tilesetsRef = useRef<{
    area?: Cesium.Cesium3DTileset;
    river?: Cesium.Cesium3DTileset;
  }>({});
  const measurementHandlerRef =
    useRef<Cesium.ScreenSpaceEventHandler | null>(null);
  const measurementEntitiesRef = useRef<Cesium.Entity[]>([]);
  const measurementPointsRef = useRef<Cesium.Cartesian3[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  const [layers, setLayers] = useState<CesiumLayerState>({
    area: true,
    river: true,
  });

  const [lighting, setLighting] = useState("day");
  const [transparency, setTransparency] = useState(100);
  const [clipping, setClipping] = useState(false);
  const [clipAxis, setClipAxis] = useState<"x" | "y">("x");
  const [clipPosition, setClipPosition] = useState(0);

  const [bloom, setBloom] = useState(false);
  const [streetViewOpen, setStreetViewOpen] = useState(false);

  const [measurementMode, setMeasurementMode] = useState<
    "none" | "distance" | "area" | "height"
  >("none");

  const [measurementResult, setMeasurementResult] = useState("");

  // =====================================================
  // INITIALIZE CESIUM
  // =====================================================

  useEffect(() => {
    let cancelled = false;
    let localViewer: Cesium.Viewer | null = null;

    async function initializeCesium() {
      if (!containerRef.current) return;

      try {
        setLoading(true);
        setError("");

        const CesiumRuntime = await loadCesiumRuntime();

        if (cancelled || !containerRef.current) return;

        cesiumModuleRef.current = CesiumRuntime;

        const token = getCesiumToken("accountA");

        if (!token) {
          throw new Error(
            "Token Cesium Account A belum tersedia. Periksa environment.",
          );
        }

        CesiumRuntime.Ion.defaultAccessToken = token;

        const terrainProvider = bridge.model.terrainAssetId
          ? await CesiumRuntime.CesiumTerrainProvider.fromIonAssetId(
              bridge.model.terrainAssetId,
            )
          : await CesiumRuntime.CesiumTerrainProvider.fromIonAssetId(1);

        if (cancelled || !containerRef.current) return;

        localViewer = new CesiumRuntime.Viewer(containerRef.current, {
          animation: false,
          timeline: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          infoBox: false,
          selectionIndicator: false,
          scene3DOnly: true,
          shouldAnimate: true,
          terrainProvider,
        });

        viewerRef.current = localViewer;

        localViewer.scene.globe.enableLighting = true;
        localViewer.scene.globe.depthTestAgainstTerrain = false;
        localViewer.scene.globe.baseColor =
          CesiumRuntime.Color.fromCssColorString("#dce5e8");

        if (localViewer.scene.skyAtmosphere) {
          localViewer.scene.skyAtmosphere.show = true;
        }

        localViewer.scene.fog.enabled = true;
        localViewer.scene.screenSpaceCameraController.enableCollisionDetection =
          true;

        // IMAGERY
        if (bridge.model.imageryAssetId) {
          try {
            const imagery =
              await CesiumRuntime.IonImageryProvider.fromAssetId(
                bridge.model.imageryAssetId,
              );

            if (cancelled) return;

            localViewer.imageryLayers.removeAll();
            localViewer.imageryLayers.addImageryProvider(imagery);
          } catch (err) {
            console.warn("Imagery tidak berhasil dimuat:", err);
          }
        }

        // MAIN BRIDGE MODEL
        if (bridge.model.mainAssetId) {
          const mainTileset =
            await CesiumRuntime.Cesium3DTileset.fromIonAssetId(
              bridge.model.mainAssetId,
            );

          if (cancelled) return;

          localViewer.scene.primitives.add(mainTileset);
          mainTilesetRef.current = mainTileset;

          await localViewer.flyTo(mainTileset, {
            duration: 2,
            offset: new CesiumRuntime.HeadingPitchRange(
              0,
              CesiumRuntime.Math.toRadians(-25),
              Math.max(mainTileset.boundingSphere.radius * 2.8, 100),
            ),
          });
        } else {
          await localViewer.camera.flyTo({
            destination: CesiumRuntime.Cartesian3.fromDegrees(
              bridge.identity.longitude,
              bridge.identity.latitude,
              800,
            ),
          });
        }

        if (cancelled) return;

        // AREA MODEL
        if (bridge.model.areaAssetId) {
          try {
            const area = await CesiumRuntime.Cesium3DTileset.fromIonAssetId(
              bridge.model.areaAssetId,
            );

            if (cancelled) return;

            localViewer.scene.primitives.add(area);
            area.show = layers.area;
            tilesetsRef.current.area = area;
          } catch (err) {
            console.warn("Model area tidak berhasil dimuat:", err);
          }
        }

        // RIVER MODEL
        if (bridge.model.riverAssetId) {
          try {
            const river = await CesiumRuntime.Cesium3DTileset.fromIonAssetId(
              bridge.model.riverAssetId,
            );

            if (cancelled) return;

            localViewer.scene.primitives.add(river);
            river.show = layers.river;
            tilesetsRef.current.river = river;
          } catch (err) {
            console.warn("Model sungai tidak berhasil dimuat:", err);
          }
        }

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err) {
        console.error("Cesium initialization error:", err);

        if (localViewer && !localViewer.isDestroyed()) {
          localViewer.destroy();
        }

        if (!cancelled) {
          viewerRef.current = null;
          mainTilesetRef.current = null;
          tilesetsRef.current = {};

          setError(
            err instanceof Error
              ? err.message
              : "Gagal memuat model 3D.",
          );

          setLoading(false);
        }
      }
    }

    initializeCesium();

    return () => {
      cancelled = true;

      if (
        measurementHandlerRef.current &&
        !measurementHandlerRef.current.isDestroyed()
      ) {
        measurementHandlerRef.current.destroy();
      }

      measurementHandlerRef.current = null;

      if (localViewer && !localViewer.isDestroyed()) {
        localViewer.destroy();
      }

      viewerRef.current = null;
      mainTilesetRef.current = null;
      cesiumModuleRef.current = null;
      tilesetsRef.current = {};
      measurementEntitiesRef.current = [];
      measurementPointsRef.current = [];
    };
  }, [bridge]);

  // =====================================================
  // LAYER CONTROL
  // =====================================================

  useEffect(() => {
    if (tilesetsRef.current.area) {
      tilesetsRef.current.area.show = layers.area;
    }

    if (tilesetsRef.current.river) {
      tilesetsRef.current.river.show = layers.river;
    }
  }, [layers, loading]);

  // =====================================================
  // LIGHTING CONTROL
  // =====================================================

  const applyLighting = useCallback(
    (mode: string) => {
      const viewer = viewerRef.current;
      const CesiumRuntime = cesiumModuleRef.current;

      if (!viewer || viewer.isDestroyed() || !CesiumRuntime) return;

      const scene = viewer.scene;
      const atmosphere = scene.skyAtmosphere;

      scene.globe.enableLighting = true;
      scene.sun.show = true;
      scene.moon.show = true;

      if (atmosphere) {
        atmosphere.show = true;
        atmosphere.hueShift = 0;
        atmosphere.saturationShift = 0;
        atmosphere.brightnessShift = 0;
      }

      switch (mode) {
        case "day":
          scene.backgroundColor = CesiumRuntime.Color.BLACK;
          if (atmosphere) atmosphere.brightnessShift = 0.1;
          break;

        case "night":
          scene.backgroundColor =
            CesiumRuntime.Color.fromCssColorString("#071426");
          if (atmosphere) {
            atmosphere.brightnessShift = -0.5;
            atmosphere.saturationShift = -0.2;
          }
          break;

        case "sunrise":
          if (atmosphere) {
            atmosphere.hueShift = 0.05;
            atmosphere.saturationShift = 0.3;
            atmosphere.brightnessShift = 0.15;
          }
          break;

        case "sunset":
          if (atmosphere) {
            atmosphere.hueShift = -0.08;
            atmosphere.saturationShift = 0.5;
            atmosphere.brightnessShift = -0.05;
          }
          break;

        case "atmosphere":
          if (atmosphere) {
            atmosphere.show = true;
            atmosphere.saturationShift = 0.4;
            atmosphere.brightnessShift = 0.2;
          }
          break;

        case "sun":
          scene.sun.show = true;
          scene.moon.show = false;
          scene.globe.enableLighting = true;
          break;
      }

      setLighting(mode);
    },
    [],
  );

  // =====================================================
  // TRANSPARENCY
  // =====================================================

  useEffect(() => {
    const main = mainTilesetRef.current;
    const CesiumRuntime = cesiumModuleRef.current;

    if (!main || !CesiumRuntime || main.isDestroyed()) return;

    if (transparency >= 100) {
      main.style = undefined;
    } else {
      const alpha = Math.max(0.05, transparency / 100);

      main.style = new CesiumRuntime.Cesium3DTileStyle({
        color: `color('white', ${alpha})`,
      });
    }
  }, [transparency, loading]);

  // =====================================================
  // CLIPPING
  // =====================================================

  useEffect(() => {
    const main = mainTilesetRef.current;
    const CesiumRuntime = cesiumModuleRef.current;

    if (!main || !CesiumRuntime || main.isDestroyed()) return;

    if (!clipping) {
      main.clippingPlanes = undefined;
      return;
    }

    const normal =
      clipAxis === "x"
        ? new CesiumRuntime.Cartesian3(1, 0, 0)
        : new CesiumRuntime.Cartesian3(0, 1, 0);

    main.clippingPlanes = new CesiumRuntime.ClippingPlaneCollection({
      planes: [
        new CesiumRuntime.ClippingPlane(
          normal,
          clipPosition,
        ),
      ],
      edgeWidth: 1.5,
      edgeColor: CesiumRuntime.Color.CYAN,
      enabled: true,
    });
  }, [clipping, clipAxis, clipPosition, loading]);

  // =====================================================
  // BLOOM
  // =====================================================

  useEffect(() => {
    const viewer = viewerRef.current;

    if (!viewer || viewer.isDestroyed()) return;

    const bloomStage = viewer.scene.postProcessStages.bloom;

    if (bloomStage) {
      bloomStage.enabled = bloom;
    }
  }, [bloom, loading]);

  // =====================================================
  // NAVIGATION
  // =====================================================

  const resetCamera = useCallback(() => {
    const viewer = viewerRef.current;
    const main = mainTilesetRef.current;
    const CesiumRuntime = cesiumModuleRef.current;

    if (!viewer || viewer.isDestroyed() || !CesiumRuntime) return;

    if (main && !main.isDestroyed()) {
      viewer.flyTo(main, {
        duration: 1.5,
        offset: new CesiumRuntime.HeadingPitchRange(
          0,
          CesiumRuntime.Math.toRadians(-25),
          Math.max(main.boundingSphere.radius * 2.8, 100),
        ),
      });
    } else {
      viewer.camera.flyTo({
        destination: CesiumRuntime.Cartesian3.fromDegrees(
          bridge.identity.longitude,
          bridge.identity.latitude,
          800,
        ),
      });
    }
  }, [bridge]);

 
const setCameraView = useCallback(
  (view: "top" | "north") => {
    const viewer = viewerRef.current;
    const CesiumRuntime = cesiumModuleRef.current;

    if (!viewer || viewer.isDestroyed() || !CesiumRuntime) return;

    const main = mainTilesetRef.current;

    if (main && !main.isDestroyed()) {
      const pitch =
        view === "top"
          ? -CesiumRuntime.Math.PI_OVER_TWO
          : CesiumRuntime.Math.toRadians(-35);

      viewer.flyToBoundingSphere(main.boundingSphere, {
        duration: 1.3,
        offset: new CesiumRuntime.HeadingPitchRange(
          0,
          pitch,
          Math.max(main.boundingSphere.radius * 2.8, 100),
        ),
      });
    } else {
      viewer.camera.flyTo({
        destination: CesiumRuntime.Cartesian3.fromDegrees(
          bridge.identity.longitude,
          bridge.identity.latitude,
          800,
        ),
        orientation: {
          heading: 0,
          pitch: CesiumRuntime.Math.toRadians(-45),
          roll: 0,
        },
        duration: 1.3,
      });
    }
  },
  [bridge],
);

  // =====================================================
  // MEASUREMENT
  // =====================================================

  const clearMeasurements = useCallback(() => {
    const viewer = viewerRef.current;

    if (!viewer || viewer.isDestroyed()) return;

    measurementEntitiesRef.current.forEach((entity) => {
      viewer.entities.remove(entity);
    });

    measurementEntitiesRef.current = [];
    measurementPointsRef.current = [];
    setMeasurementResult("");
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    const CesiumRuntime = cesiumModuleRef.current;

    if (
      !viewer ||
      viewer.isDestroyed() ||
      !CesiumRuntime ||
      measurementMode === "none"
    ) {
      return;
    }

    if (
      measurementHandlerRef.current &&
      !measurementHandlerRef.current.isDestroyed()
    ) {
      measurementHandlerRef.current.destroy();
    }

    measurementPointsRef.current = [];

    const handler = new CesiumRuntime.ScreenSpaceEventHandler(
      viewer.scene.canvas,
    );

    measurementHandlerRef.current = handler;

    const addPoint = (position: Cesium.Cartesian3) => {
      measurementPointsRef.current.push(position);

      const entity = viewer.entities.add({
        position,
        point: {
          pixelSize: 9,
          color: CesiumRuntime.Color.YELLOW,
          outlineColor: CesiumRuntime.Color.WHITE,
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });

      measurementEntitiesRef.current.push(entity);
    };

    const getPosition = (movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const picked = viewer.scene.pickPosition(movement.position);

      if (CesiumRuntime.defined(picked)) return picked;

      const ray = viewer.camera.getPickRay(movement.position);

      return ray ? viewer.scene.globe.pick(ray, viewer.scene) : undefined;
    };

    const addResultLabel = (
      position: Cesium.Cartesian3,
      text: string,
    ) => {
      const entity = viewer.entities.add({
        position,
        label: {
          text,
          font: "14px sans-serif",
          fillColor: CesiumRuntime.Color.WHITE,
          outlineColor: CesiumRuntime.Color.BLACK,
          outlineWidth: 3,
          style: CesiumRuntime.LabelStyle.FILL_AND_OUTLINE,
          showBackground: true,
          backgroundColor: CesiumRuntime.Color.fromCssColorString(
            "#142638",
          ).withAlpha(0.9),
          pixelOffset: new CesiumRuntime.Cartesian2(0, -20),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });

      measurementEntitiesRef.current.push(entity);
    };

    const finishMeasurement = () => {
      const points = measurementPointsRef.current;

      if (measurementMode === "distance" && points.length >= 2) {
        const distance = CesiumRuntime.Cartesian3.distance(
          points[0],
          points[1],
        );

        viewer.entities.add({
          polyline: {
            positions: points.slice(0, 2),
            width: 4,
            material: CesiumRuntime.Color.YELLOW,
            clampToGround: false,
          },
        });

        const midpoint = CesiumRuntime.Cartesian3.midpoint(
          points[0],
          points[1],
          new CesiumRuntime.Cartesian3(),
        );

        addResultLabel(midpoint, `${distance.toFixed(2)} meter`);
        setMeasurementResult(`Jarak: ${distance.toFixed(2)} meter`);
        setMeasurementMode("none");
      }

      if (measurementMode === "height" && points.length >= 2) {
        const first = CesiumRuntime.Cartographic.fromCartesian(points[0]);
        const second = CesiumRuntime.Cartographic.fromCartesian(points[1]);

        const height = Math.abs(second.height - first.height);

        viewer.entities.add({
          polyline: {
            positions: points.slice(0, 2),
            width: 4,
            material: CesiumRuntime.Color.CYAN,
          },
        });

        const midpoint = CesiumRuntime.Cartesian3.midpoint(
          points[0],
          points[1],
          new CesiumRuntime.Cartesian3(),
        );

        addResultLabel(midpoint, `${height.toFixed(2)} meter`);
        setMeasurementResult(`Tinggi: ${height.toFixed(2)} meter`);
        setMeasurementMode("none");
      }

      if (measurementMode === "area" && points.length >= 3) {
        const origin = points[0];

        const enu = CesiumRuntime.Transforms.eastNorthUpToFixedFrame(
          origin,
        );

        const inverse = CesiumRuntime.Matrix4.inverseTransformation(
          enu,
          new CesiumRuntime.Matrix4(),
        );

        const localPoints = points.map((point) =>
          CesiumRuntime.Matrix4.multiplyByPoint(
            inverse,
            point,
            new CesiumRuntime.Cartesian3(),
          ),
        );

        let area = 0;

        for (let i = 0; i < localPoints.length; i++) {
          const current = localPoints[i];
          const next = localPoints[(i + 1) % localPoints.length];

          area += current.x * next.y - next.x * current.y;
        }

        area = Math.abs(area) / 2;
const line = viewer.entities.add({
  polyline: {
    positions: points.slice(0, 2),
    width: 4,
    material: CesiumRuntime.Color.YELLOW,
    clampToGround: false,
  },
});

measurementEntitiesRef.current.push(line);
        const polygon = viewer.entities.add({
          polygon: {
            hierarchy: new CesiumRuntime.PolygonHierarchy(points),
            material: CesiumRuntime.Color.CYAN.withAlpha(0.3),
            outline: true,
            outlineColor: CesiumRuntime.Color.CYAN,
          },
        });

        measurementEntitiesRef.current.push(polygon);

        addResultLabel(origin, `${area.toFixed(2)} m²`);
        setMeasurementResult(`Luas: ${area.toFixed(2)} m²`);
        setMeasurementMode("none");
      }
    };

    handler.setInputAction(
      (movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const position = getPosition(movement);

        if (!position) return;

        addPoint(position);

        if (
          (measurementMode === "distance" ||
            measurementMode === "height") &&
          measurementPointsRef.current.length === 2
        ) {
          finishMeasurement();
        }
      },
      CesiumRuntime.ScreenSpaceEventType.LEFT_CLICK,
    );

    if (measurementMode === "area") {
      handler.setInputAction(() => {
        finishMeasurement();
      }, CesiumRuntime.ScreenSpaceEventType.RIGHT_CLICK);
    }

    return () => {
      if (!handler.isDestroyed()) handler.destroy();

      if (measurementHandlerRef.current === handler) {
        measurementHandlerRef.current = null;
      }
    };
  }, [measurementMode, loading]);

  // =====================================================
  // FULLSCREEN
  // =====================================================

  const toggleFullscreen = useCallback(async () => {
    const element = containerRef.current?.parentElement;

    if (!element) return;

    try {
      if (!document.fullscreenElement) {
        await element.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  useEffect(() => {
    const handleFullscreen = () => {
      setFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreen);
    };
  }, []);

  // =====================================================
  // USER INTERFACE
  // =====================================================

  return (
    <div className="viewer-shell">

      <div className="cesium-map" ref={containerRef} />

      {/* RIGHT CONTROL PANEL */}
      <aside className="cesium-control-panel">

        <div className="cesium-panel-header">
          <strong>⚙ Kontrol Visualisasi</strong>
          <span>LINTAS 3D WEBGIS</span>
        </div>

        {/* LIGHTING */}
        <div className="cesium-control-group">
          <h4>💡 Efek Pencahayaan</h4>

          <div className="cesium-button-grid">
            {[
              ["day", "☀ Day"],
              ["night", "🌙 Night"],
              ["sunrise", "🌅 Sunrise"],
              ["sunset", "🌇 Sunset"],
              ["atmosphere", "🌤 Atmosfer"],
              ["sun", "🌞 Sun"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={lighting === value ? "active" : ""}
                onClick={() => applyLighting(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* CLIPPING */}
        <div className="cesium-control-group">
          <div className="cesium-control-title">
            <h4>✂ Pemotongan Model</h4>
            <label className="cesium-switch">
              <input
                type="checkbox"
                checked={clipping}
                onChange={(e) => setClipping(e.target.checked)}
              />
              <span />
            </label>
          </div>

          <div className="cesium-inline-options">
            <label>
              <input
                type="radio"
                checked={clipAxis === "x"}
                onChange={() => setClipAxis("x")}
              />
              Vertikal X
            </label>

            <label>
              <input
                type="radio"
                checked={clipAxis === "y"}
                onChange={() => setClipAxis("y")}
              />
              Vertikal Y
            </label>
          </div>

          <input
            className="cesium-range"
            type="range"
            min="-100"
            max="100"
            value={clipPosition}
            onChange={(e) => setClipPosition(Number(e.target.value))}
          />

          <span className="cesium-hint">
            Geser untuk mengubah posisi bidang potong
          </span>
        </div>

        {/* TRANSPARENCY */}
        <div className="cesium-control-group">
          <h4>◧ Transparansi Model</h4>

          <input
            className="cesium-range"
            type="range"
            min="5"
            max="100"
            value={transparency}
            onChange={(e) => setTransparency(Number(e.target.value))}
          />

          <span className="cesium-hint">
            Opasitas model: {transparency}%
          </span>
        </div>

        {/* MEASUREMENT */}
        <div className="cesium-control-group">
          <h4>📐 Pengukuran</h4>

          <div className="cesium-control-buttons">
            <button
              className={measurementMode === "distance" ? "active" : ""}
              onClick={() => {
                clearMeasurements();
                setMeasurementMode("distance");
              }}
              type="button"
            >
              📏 Ukur Jarak
            </button>

            <button
              className={measurementMode === "area" ? "active" : ""}
              onClick={() => {
                clearMeasurements();
                setMeasurementMode("area");
              }}
              type="button"
            >
              🗺 Ukur Luas Area
            </button>

            <button
              className={measurementMode === "height" ? "active" : ""}
              onClick={() => {
                clearMeasurements();
                setMeasurementMode("height");
              }}
              type="button"
            >
              📐 Ukur Tinggi
            </button>

            <button
              onClick={() => {
                setMeasurementMode("none");
                clearMeasurements();
              }}
              type="button"
            >
              ✕ Hapus Pengukuran
            </button>
          </div>

          {measurementMode !== "none" && (
            <p className="cesium-hint">
              {measurementMode === "distance" &&
                "Klik dua titik untuk mengukur jarak."}
              {measurementMode === "height" &&
                "Klik titik bawah dan titik atas."}
              {measurementMode === "area" &&
                "Klik minimal tiga titik, lalu klik kanan untuk menyelesaikan."}
            </p>
          )}

          {measurementResult && (
            <div className="cesium-result">
              {measurementResult}
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <div className="cesium-control-group">
          <h4>🧭 Navigasi Kamera</h4>

          <div className="cesium-control-buttons">
            <button onClick={resetCamera} type="button">
              ⌖ Reset View
            </button>

            <button onClick={() => setCameraView("top")} type="button">
              ▣ Top View
            </button>

            <button onClick={() => setCameraView("north")} type="button">
              🧭 North
            </button>
          </div>
        </div>

        {/* BLOOM */}
        <div className="cesium-control-group">
          <div className="cesium-control-title">
            <h4>✨ Bloom Effect</h4>

            <label className="cesium-switch">
              <input
                type="checkbox"
                checked={bloom}
                onChange={(e) => setBloom(e.target.checked)}
              />
              <span />
            </label>
          </div>
        </div>

        {/* STREET VIEW */}
        <div className="cesium-control-group">
          <h4>🚶 Street View</h4>

          <button
            className="cesium-full-button"
            type="button"
            disabled={!bridge.streetView?.embedUrl}
            onClick={() => setStreetViewOpen((value) => !value)}
          >
            {streetViewOpen ? "Tutup Street View" : "Buka Street View"}
          </button>

          {!bridge.streetView?.embedUrl && (
            <span className="cesium-hint">
              Street View belum tersedia.
            </span>
          )}
        </div>

        {/* RIVER */}
        <div className="cesium-control-group">
          <div className="cesium-control-title">
            <h4>💧 Model Sungai</h4>

            <label className="cesium-switch">
              <input
                type="checkbox"
                checked={layers.river}
                disabled={!bridge.model.riverAssetId}
                onChange={(e) =>
                  setLayers((previous) => ({
                    ...previous,
                    river: e.target.checked,
                  }))
                }
              />
              <span />
            </label>
          </div>

          <div className="cesium-control-title">
            <span className="cesium-secondary-label">Area sekitar</span>

            <label className="cesium-switch">
              <input
                type="checkbox"
                checked={layers.area}
                disabled={!bridge.model.areaAssetId}
                onChange={(e) =>
                  setLayers((previous) => ({
                    ...previous,
                    area: e.target.checked,
                  }))
                }
              />
              <span />
            </label>
          </div>
        </div>

        <button
          className="cesium-full-button cesium-fullscreen-button"
          onClick={toggleFullscreen}
          type="button"
        >
          {fullscreen ? "↙ Keluar Fullscreen" : "⛶ Fullscreen"}
        </button>

      </aside>

      {/* STREET VIEW OVERLAY */}
      {streetViewOpen && bridge.streetView?.embedUrl && (
        <div className="cesium-streetview-overlay">
          <div className="cesium-streetview-header">
            <strong>Street View – {bridge.name}</strong>
            <button
              onClick={() => setStreetViewOpen(false)}
              type="button"
            >
              ✕
            </button>
          </div>

          <iframe
            src={bridge.streetView.embedUrl}
            title={`Street View ${bridge.name}`}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="viewer-loading">
          <div className="loading-spinner" />
          <strong>Memuat Visualisasi 3D</strong>
          <span>
            Menyiapkan terrain dan model 3D jembatan...
          </span>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="viewer-error">
          <strong>Model 3D belum dapat ditampilkan</strong>
          <span>{error}</span>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Muat ulang halaman
          </button>
        </div>
      )}

      <div className="viewer-coordinate">
        {formatCoordinate(bridge.identity.latitude)},{" "}
        {formatCoordinate(bridge.identity.longitude)}
      </div>
    </div>
  );
}

function ConditionHistory({ bridge }: { bridge: BridgeData }) {
  const history = useMemo(
    () => [...bridge.history].sort((a, b) => a.year - b.year),
    [bridge.history],
  );

  return (
    <div className="history-chart">
      <div className="history-axis">
        <span>Kritis / Runtuh</span>
        <span>Rusak Berat</span>
        <span>Rusak Sedang</span>
        <span>Rusak Ringan</span>
        <span>Baik</span>
      </div>

      <div className="history-bars">
        {history.map((item) => (
          <div className="history-column" key={item.year}>
            <div className="history-bar-area">
              {item.value !== null ? (
                <div
                  className="history-bar"
                  style={{
                    height: `${((item.value + 1) / 6) * 100}%`,
                    backgroundColor: getConditionColor(item.value),
                  }}
                  title={getBridgeConditionLabel(item.value)}
                >
                  <span>{item.value}</span>
                </div>
              ) : (
                <div className="history-no-data">-</div>
              )}
            </div>
            <span className="history-year">{item.year}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComponentList({
  title,
  items,
}: {
  title: string;
  items: BridgeData["components"]["superstructure"];
}) {
  return (
    <div className="component-card">
      <h3>{title}</h3>

      {items.map((item, index) => (
        <div className="component-row" key={`${item.name}-${index}`}>
          <div>
            <strong>{item.name}</strong>
            <span>{item.type || "Belum ada rincian tipe"}</span>
          </div>

          <span
            className="component-status"
            style={{
              color: getConditionColor(item.value),
            }}
          >
            {item.value === null
              ? "Belum dinilai"
              : getBridgeConditionLabel(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function BridgeDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const bridge = getBridgeBySlug(slug);

  const latest = bridge ? getLatestHistory(bridge) : undefined;

  if (!bridge) {
    return (
      <>
        <Header />
        <main className="bridge-not-found">
          <div className="not-found-card">
            <span className="not-found-icon">!</span>
            <h1>Jembatan Tidak Ditemukan</h1>
            <p>
              Data jembatan dengan alamat tersebut belum tersedia dalam
              direktori LINTAS.
            </p>
            <button type="button" onClick={() => router.push("/pemodelan-3d")}>
              Kembali ke Direktori Jembatan
            </button>
          </div>
        </main>
        <BridgeStyles />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="bridge-detail-page">
        <div className="bridge-container">
          <div className="breadcrumb">
            <button type="button" onClick={() => router.push("/pemodelan-3d")}>
              Direktori Jembatan
            </button>
            <span>/</span>
            <span>{bridge.name}</span>
          </div>

          <section className="bridge-heading">
            <div>
              <div className="eyebrow">
                3D VISUALIZATION OF BRIDGE INFRASTRUCTURE AND SURROUNDING AREA
              </div>

              <h1>{bridge.name}</h1>

              <p>
                {bridge.identity.roadName || "Ruas jalan belum tersedia"}
                {" · "}
                {bridge.identity.district}, {bridge.identity.city}
              </p>
            </div>

            <div
              className="condition-pill"
              style={{
                backgroundColor: `${getConditionColor(
                  bridge.currentCondition.score,
                )}18`,
                color: getConditionColor(bridge.currentCondition.score),
                borderColor: `${getConditionColor(
                  bridge.currentCondition.score,
                )}55`,
              }}
            >
              <span
                className="condition-dot"
                style={{
                  backgroundColor: getConditionColor(
                    bridge.currentCondition.score,
                  ),
                }}
              />
              {bridge.currentCondition.condition || "Kondisi belum tersedia"}
            </div>
          </section>

          <section className="bridge-kpis">
            <div className="kpi-card">
              <span className="kpi-label">TAHUN DIBANGUN</span>
              <strong>{bridge.identity.yearBuilt ?? "—"}</strong>
              <span className="kpi-subtitle">Tahun pembangunan</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">PANJANG JEMBATAN</span>
              <strong>
                {bridge.dimensions.length !== null
                  ? `${bridge.dimensions.length} m`
                  : "—"}
              </strong>
              <span className="kpi-subtitle">Panjang total</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">LEBAR JEMBATAN</span>
              <strong>
                {bridge.dimensions.width !== null
                  ? `${bridge.dimensions.width} m`
                  : "—"}
              </strong>
              <span className="kpi-subtitle">Lebar total</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">JUMLAH BENTANG</span>
              <strong>{bridge.dimensions.spans ?? "—"}</strong>
              <span className="kpi-subtitle">Bentang jembatan</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">DATA KONDISI TERBARU</span>
              <strong>{latest?.year ?? "—"}</strong>
              <span className="kpi-subtitle">
                {latest
                  ? getBridgeConditionLabel(latest.value)
                  : "Belum tersedia"}
              </span>
            </div>
          </section>

          <section className="detail-section">
            <div className="section-heading">
              <div>
                <span className="section-eyebrow">SPATIAL VISUALIZATION</span>
                <h2>Model 3D Jembatan</h2>
                <p>
                  Visualisasi model 3D Jembatan dan lingkungan sekitar
                  jembatan.
                </p>
              </div>

              <span className="section-tag">CESIUM 3D</span>
            </div>

            <CesiumBridgeViewer bridge={bridge} />
          </section>

          <section className="detail-grid">
            <div className="detail-panel identity-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-eyebrow">BRIDGE PROFILE</span>
                  <h2>Informasi Umum</h2>
                </div>
                <span className="panel-icon">⌖</span>
              </div>

              <div className="identity-table">
                <div>
                  <span>Nama Jembatan</span>
                  <strong>{bridge.name}</strong>
                </div>

                <div>
                  <span>Nama Ruas Jalan</span>
                  <strong>
                    {bridge.identity.roadName || "Belum tersedia"}
                  </strong>
                </div>
                <div>
                  <span>Nomor Ruas Jalan</span>
                  <strong>
                    {bridge.identity.roadNumber || "Belum tersedia"}
                  </strong>
                </div>
                <div>
                  <span>Kelurahan</span>
                  <strong>{bridge.identity.village || "Belum tersedia"}</strong>
                </div>

                <div>
                  <span>Kecamatan</span>
                  <strong>
                    {bridge.identity.district || "Belum tersedia"}
                  </strong>
                </div>

                <div>
                  <span>Kota</span>
                  <strong>{bridge.identity.city}</strong>
                </div>

                <div>
                  <span>Jenis Konstruksi</span>
                  <strong>
                    {bridge.currentCondition.construction || "Belum tersedia"}
                  </strong>
                </div>

                <div>
                  <span>Status Operasional</span>
                  <strong>
                    {bridge.identity.operationalStatus || "Belum tersedia"}
                  </strong>
                </div>

                <div>
                  <span>Koordinat</span>
                  <strong className="coordinate-value">
                    {bridge.identity.latitudeText}
                    <br />
                    {bridge.identity.longitudeText}
                  </strong>
                </div>
              </div>
            </div>

            <div className="detail-panel condition-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-eyebrow">STRUCTURAL CONDITION</span>
                  <h2>Kondisi Jembatan</h2>
                </div>
                <span className="panel-icon">◈</span>
              </div>

              <div
                className="condition-score"
                style={{
                  borderColor: getConditionColor(bridge.currentCondition.score),
                }}
              >
                <strong
                  style={{
                    color: getConditionColor(bridge.currentCondition.score),
                  }}
                >
                  {bridge.currentCondition.score ?? "—"}
                </strong>
                <span>Skor kondisi</span>
              </div>

              <h3>{bridge.currentCondition.condition || "Belum tersedia"}</h3>

              <p className="condition-description">
                {getConditionDescription(bridge.currentCondition.score)}
              </p>

              <div className="condition-info-row">
                <span>Stabilitas</span>
                <strong>
                  {bridge.currentCondition.stability || "Belum tersedia"}
                </strong>
              </div>

              <div className="condition-info-row">
                <span>Rencana Penanganan</span>
                <strong>
                  {bridge.currentCondition.handlingPlan || "Belum tersedia"}
                </strong>
              </div>
            </div>
          </section>

          <section className="detail-section">
            <div className="section-heading">
              <div>
                <span className="section-eyebrow">HISTORICAL MONITORING</span>
                <h2>Riwayat Kondisi Jembatan</h2>
                <p>
                  Perubahan kondisi berdasarkan data pemeriksaan tahun
                  2020–2024.
                </p>
              </div>
            </div>

            <div className="detail-panel history-panel">
              <div className="history-header">
                <div>
                  <strong>Tren Kondisi Umum</strong>
                  <span>Skala kondisi 0–5</span>
                </div>

                <div className="history-legend">
                  {[
                    ["#16a36a", "Baik"],
                    ["#e5a52e", "Rusak Ringan"],
                    ["#e67e22", "Rusak Sedang"],
                    ["#dc5656", "Rusak Berat"],
                    ["#a83232", "Kritis"],
                  ].map(([color, label]) => (
                    <span key={label}>
                      <i style={{ backgroundColor: color }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <ConditionHistory bridge={bridge} />

              <div className="history-note">
                <span>ⓘ</span>
                Skor 0 menunjukkan kondisi baik, sedangkan skor 5 menunjukkan
                kondisi runtuh. Data yang tidak tersedia tidak ditampilkan
                sebagai nilai.
              </div>
            </div>
          </section>
          <section className="detail-section">
            <div className="section-heading">
              <div>
                <span className="section-eyebrow">RIVER ENVIRONMENT</span>
                <h2>Kondisi Lingkungan Sungai</h2>
                <p>
                  Hasil penilaian kondisi aliran sungai di sekitar jembatan.
                </p>
              </div>
              <span className="section-tag">RIVER ASSESSMENT</span>
            </div>

            <div className="detail-panel">
              <div className="condition-info-row">
                <span>Nilai Aliran Sungai</span>
                <strong>1</strong>
              </div>
              <div className="condition-info-row">
                <span>Kondisi Aliran Sungai</span>
                <strong>Rusak Ringan</strong>
              </div>
            </div>
          </section>
          <section className="detail-section">
            <div className="section-heading">
              <div>
                <span className="section-eyebrow">STRUCTURAL COMPONENTS</span>
                <h2>Evaluasi Komponen Jembatan</h2>
                <p>
                  Identifikasi dan penilaian komponen struktur bangunan atas dan
                  struktur bangunan bawah.
                </p>
              </div>
            </div>

            <div className="detail-grid component-grid">
              <ComponentList
                title="Struktur Bangunan Atas"
                items={bridge.components.superstructure}
              />

              <ComponentList
                title="Struktur Bangunan Bawah"
                items={bridge.components.substructure}
              />
            </div>
          </section>

          <section className="detail-grid">
            <div className="detail-panel damage-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-eyebrow">DAMAGE ASSESSMENT</span>
                  <h2>Identifikasi Kerusakan</h2>
                </div>
                <span className="panel-icon">⚠</span>
              </div>

              {bridge.currentCondition.damage.length > 0 ? (
                <ul className="assessment-list damage-list">
                  {bridge.currentCondition.damage.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-text">
                  Belum tersedia informasi kerusakan.
                </p>
              )}
            </div>

            <div className="detail-panel recommendation-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-eyebrow">MAINTENANCE PLAN</span>
                  <h2>Rekomendasi Penanganan</h2>
                </div>
                <span className="panel-icon">✓</span>
              </div>

              {bridge.currentCondition.recommendations.length > 0 ? (
                <ul className="assessment-list recommendation-list">
                  {bridge.currentCondition.recommendations.map(
                    (item, index) => (
                      <li key={index}>{item}</li>
                    ),
                  )}
                </ul>
              ) : (
                <p className="empty-text">
                  Belum tersedia rekomendasi penanganan.
                </p>
              )}
            </div>
          </section>

          <section className="detail-section">
            <div className="section-heading">
              <div>
                <span className="section-eyebrow">FIELD DOCUMENTATION</span>
                <h2>Dokumentasi Foto</h2>
                <p>Dokumentasi visual Jembatan.</p>
              </div>

              <span className="section-tag">{bridge.photos.length} FOTO</span>
            </div>

            {bridge.photos.length > 0 ? (
              <div className="photo-grid">
                {bridge.photos.map((photo, index) => (
                  <a
                    className="photo-card"
                    href={photo.url}
                    target="_blank"
                    rel="noreferrer"
                    key={`${photo.url}-${index}`}
                  >
                    <img src={photo.url} alt={photo.title} loading="lazy" />
                    <div className="photo-caption">
                      <strong>{photo.title}</strong>
                      <span>↗</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-panel">
                Dokumentasi foto belum tersedia.
              </div>
            )}
          </section>

          <section className="detail-section">
            <div className="section-heading">
              <div>
                <span className="section-eyebrow">TECHNICAL ARCHIVE</span>
                <h2>Dokumen Teknis</h2>
                <p>Berkas teknis dan data pendukung Jembatan.</p>
              </div>
            </div>

            {bridge.documents.length > 0 ? (
              <div className="document-grid">
                {bridge.documents.map((document, index) => (
                  <a
                    className="document-card"
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    key={`${document.url}-${index}`}
                  >
                    <div className="document-icon">
                      {document.type === "pdf"
                        ? "PDF"
                        : document.type.toUpperCase()}
                    </div>

                    <div className="document-info">
                      <strong>{document.title}</strong>
                      <span>File {document.type.toUpperCase()}</span>
                    </div>

                    <span className="document-arrow">↗</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-panel">Dokumen teknis belum tersedia.</div>
            )}
          </section>

          {bridge.streetView?.embedUrl && (
            <section className="detail-section">
              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">GROUND-LEVEL VIEW</span>
                  <h2>Street View</h2>
                  <p>
                    Kondisi lingkungan jembatan dari perspektif permukaan jalan.
                  </p>
                </div>

                <span className="section-tag">GOOGLE STREET VIEW</span>
              </div>

              <div className="streetview-frame">
                <iframe
                  src={bridge.streetView.embedUrl}
                  title={`Street View ${bridge.name}`}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </section>
          )}

          <footer className="bridge-footer">
            <div>
              <strong>LINTAS</strong>
              <span>Layanan Informasi Jembatan Kota Yogyakarta</span>
            </div>

            <button type="button" onClick={() => router.push("/pemodelan-3d")}>
              ← Kembali ke Direktori
            </button>
          </footer>
        </div>
      </main>

      <BridgeStyles />
    </>
  );
}

function BridgeStyles() {
  return (
    <style jsx global>{`
      .bridge-detail-page {
        min-height: calc(100vh - 70px);
        background: #f4f6f9;
        color: #172638;
        padding: 34px 0 55px;
        font-family: inherit;
      }

      .bridge-container {
        width: min(1440px, calc(100% - 56px));
        margin: 0 auto;
      }

      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #8995a5;
        font-size: 12px;
        margin-bottom: 28px;
      }

      .breadcrumb button {
        background: none;
        border: 0;
        padding: 0;
        color: #54718e;
        cursor: pointer;
      }

      .breadcrumb button:hover {
        color: #0e67a4;
      }

      .bridge-heading {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 26px;
      }

      .eyebrow,
      .section-eyebrow {
        color: #74869a;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1.6px;
      }

      .bridge-heading h1 {
        margin: 9px 0 7px;
        color: #172638;
        font-size: clamp(26px, 3vw, 38px);
        font-weight: 800;
        letter-spacing: -1.2px;
      }

      .bridge-heading p {
        margin: 0;
        color: #718096;
        font-size: 13px;
      }

      .condition-pill {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        padding: 10px 15px;
        border: 1px solid;
        border-radius: 30px;
        font-size: 12px;
        font-weight: 750;
        white-space: nowrap;
      }

      .condition-dot,
      .live-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }

      .bridge-kpis {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 13px;
        margin-bottom: 38px;
      }

      .kpi-card {
        min-height: 118px;
        padding: 19px 20px;
        background: #fff;
        border: 1px solid #e8edf2;
        border-radius: 13px;
        box-shadow: 0 3px 12px rgba(30, 50, 75, 0.025);
      }

      .kpi-label {
        display: block;
        color: #8a98a9;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 1px;
        margin-bottom: 12px;
      }

      .kpi-card strong {
        display: block;
        color: #20344a;
        font-size: 27px;
        line-height: 1.15;
        font-weight: 800;
      }

      .kpi-subtitle {
        display: block;
        color: #93a0af;
        font-size: 10px;
        margin-top: 7px;
      }

      .detail-section {
        margin-top: 39px;
      }

      .section-heading {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 18px;
        margin-bottom: 17px;
      }

      .section-heading h2,
      .panel-heading h2 {
        margin: 6px 0 5px;
        color: #1d3044;
        font-size: 21px;
        font-weight: 800;
        letter-spacing: -0.5px;
      }

      .section-heading p {
        margin: 0;
        color: #8190a1;
        font-size: 12px;
      }

      .section-tag {
        color: #477da4;
        background: #e9f2f8;
        border: 1px solid #d7e7f2;
        padding: 7px 11px;
        border-radius: 6px;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.8px;
        white-space: nowrap;
      }

      .viewer-shell {
        height: 590px;
        position: relative;
        overflow: hidden;
        border-radius: 15px;
        background: #101b29;
        border: 1px solid #dce4eb;
        box-shadow: 0 10px 35px rgba(24, 43, 64, 0.09);
      }

      .cesium-map {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }

      .viewer-topbar {
        position: absolute;
        z-index: 5;
        left: 17px;
        right: 17px;
        top: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        pointer-events: none;
      }

      .viewer-label,
      .viewer-actions {
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 9px;
      }

      .viewer-label {
        background: rgba(14, 28, 43, 0.86);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 7px;
        padding: 10px 13px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1px;
        backdrop-filter: blur(12px);
      }

      .live-dot {
        background: #36d49a;
        box-shadow: 0 0 9px #36d49a;
      }

      .viewer-actions button {
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(14, 28, 43, 0.86);
        color: white;
        border-radius: 7px;
        padding: 9px 12px;
        font-size: 10px;
        cursor: pointer;
        backdrop-filter: blur(12px);
      }

      .viewer-actions button:hover {
        background: #1e5f89;
      }

      .viewer-layer-panel {
        position: absolute;
        z-index: 5;
        right: 17px;
        bottom: 45px;
        width: 155px;
        padding: 13px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 9px;
        background: rgba(14, 28, 43, 0.87);
        color: #fff;
        backdrop-filter: blur(12px);
      }

      .layer-panel-title {
        font-size: 10px;
        font-weight: 800;
        margin-bottom: 11px;
        color: #dbe9f4;
      }

      .viewer-layer-panel label {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 9px;
        color: #d0dbe6;
        font-size: 10px;
        cursor: pointer;
      }

      .viewer-layer-panel input {
        accent-color: #36a5df;
      }

      .viewer-coordinate {
        position: absolute;
        z-index: 5;
        left: 17px;
        bottom: 15px;
        color: white;
        background: rgba(14, 28, 43, 0.8);
        border-radius: 5px;
        padding: 7px 10px;
        font-size: 9px;
        font-family: monospace;
      }

      .viewer-loading,
      .viewer-error {
        position: absolute;
        z-index: 4;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 10px;
        color: #fff;
        background: rgba(10, 22, 36, 0.91);
        text-align: center;
        padding: 25px;
      }

      .viewer-loading strong,
      .viewer-error strong {
        font-size: 16px;
      }

      .viewer-loading span,
      .viewer-error span {
        max-width: 420px;
        color: #aabccc;
        font-size: 12px;
        line-height: 1.6;
      }

      .loading-spinner {
        width: 35px;
        height: 35px;
        border: 3px solid rgba(255, 255, 255, 0.18);
        border-top-color: #46b6ec;
        border-radius: 50%;
        animation: lintas-spin 0.8s linear infinite;
      }

      @keyframes lintas-spin {
        to {
          transform: rotate(360deg);
        }
      }

      .viewer-error button {
        margin-top: 8px;
        padding: 9px 15px;
        color: white;
        background: #226c9a;
        border: 0;
        border-radius: 6px;
        cursor: pointer;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-top: 25px;
      }

      .detail-panel,
      .component-card {
        background: #fff;
        border: 1px solid #e6ecf1;
        border-radius: 13px;
        padding: 23px;
        box-shadow: 0 3px 12px rgba(30, 50, 75, 0.025);
      }

      .panel-heading {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 22px;
      }

      .panel-heading h2 {
        font-size: 18px;
      }

      .panel-icon {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        color: #397da6;
        background: #edf5fa;
        border-radius: 9px;
        font-size: 18px;
      }

      .identity-table > div {
        display: grid;
        grid-template-columns: 130px minmax(0, 1fr);
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #edf0f3;
      }

      .identity-table > div:last-child {
        border-bottom: 0;
      }

      .identity-table span,
      .condition-info-row span {
        color: #8996a5;
        font-size: 11px;
      }

      .identity-table strong,
      .condition-info-row strong {
        color: #34485c;
        font-size: 11px;
        font-weight: 700;
        overflow-wrap: anywhere;
      }

      .coordinate-value {
        line-height: 1.7;
      }

      .condition-score {
        width: 90px;
        height: 90px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 3px solid;
        border-radius: 50%;
        margin-bottom: 15px;
      }

      .condition-score strong {
        font-size: 30px;
        line-height: 1;
      }

      .condition-score span {
        margin-top: 5px;
        color: #8b99a8;
        font-size: 9px;
      }

      .condition-panel h3 {
        color: #283d52;
        font-size: 17px;
        margin: 0 0 7px;
      }

      .condition-description {
        color: #8491a0;
        font-size: 11px;
        line-height: 1.7;
        margin-bottom: 18px;
      }

      .condition-info-row {
        display: flex;
        justify-content: space-between;
        gap: 15px;
        padding: 12px 0;
        border-top: 1px solid #edf0f3;
      }

      .condition-info-row strong {
        max-width: 65%;
        text-align: right;
      }

      .history-panel {
        padding: 24px;
      }

      .history-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 20px;
      }

      .history-header > div:first-child strong,
      .history-header > div:first-child span {
        display: block;
      }

      .history-header > div:first-child strong {
        color: #35495d;
        font-size: 13px;
      }

      .history-header > div:first-child span {
        margin-top: 5px;
        color: #97a3b0;
        font-size: 10px;
      }

      .history-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .history-legend span {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #7e8b99;
        font-size: 9px;
      }

      .history-legend i {
        width: 7px;
        height: 7px;
        border-radius: 2px;
      }

      .history-chart {
        display: grid;
        grid-template-columns: 105px minmax(0, 1fr);
        gap: 12px;
        height: 225px;
        margin-top: 26px;
      }

      .history-axis {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 4px 0 27px;
        color: #8b98a6;
        font-size: 9px;
      }

      .history-bars {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 15px;
      }

      .history-column {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .history-bar-area {
        height: 195px;
        width: 100%;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        border-bottom: 1px solid #dfe5eb;
        background: repeating-linear-gradient(
          to top,
          transparent 0,
          transparent calc(20% - 1px),
          #edf1f4 calc(20% - 1px),
          #edf1f4 20%
        );
      }

      .history-bar {
        width: min(48px, 70%);
        min-height: 5px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding-top: 7px;
        border-radius: 5px 5px 0 0;
        color: #fff;
        font-size: 10px;
        font-weight: 800;
        transition: height 0.3s ease;
      }

      .history-no-data {
        color: #a0aab5;
        margin-bottom: 8px;
      }

      .history-year {
        color: #718194;
        font-size: 10px;
        margin-top: 8px;
      }

      .history-note {
        margin-top: 18px;
        padding: 11px 13px;
        color: #75879a;
        background: #f5f8fa;
        border-radius: 7px;
        font-size: 10px;
        line-height: 1.6;
      }

      .history-note span {
        color: #4386ae;
        margin-right: 6px;
      }

      .component-grid {
        margin-top: 0;
      }

      .component-card h3 {
        margin: 0 0 15px;
        color: #293e52;
        font-size: 15px;
      }

      .component-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 14px 0;
        border-top: 1px solid #edf0f3;
      }

      .component-row strong,
      .component-row span {
        display: block;
      }

      .component-row strong {
        color: #40546a;
        font-size: 11px;
      }

      .component-row div > span {
        margin-top: 4px;
        color: #9aa5b1;
        font-size: 9px;
      }

      .component-status {
        font-size: 10px;
        font-weight: 750;
        text-align: right;
        white-space: nowrap;
      }

      .assessment-list {
        padding-left: 20px;
        margin: 0;
      }

      .assessment-list li {
        padding: 10px 0 10px 4px;
        color: #506174;
        border-bottom: 1px solid #edf0f3;
        font-size: 11px;
        line-height: 1.7;
      }

      .assessment-list li:last-child {
        border-bottom: 0;
      }

      .damage-list li::marker {
        color: #d76a60;
      }

      .recommendation-list li::marker {
        color: #279b78;
      }

      .empty-text {
        color: #9aa5b1;
        font-size: 11px;
      }

      .photo-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 13px;
      }

      .photo-card {
        display: block;
        min-width: 0;
        overflow: hidden;
        background: white;
        border: 1px solid #e4eaf0;
        border-radius: 11px;
        text-decoration: none;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
      }

      .photo-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 22px rgba(26, 48, 71, 0.09);
      }

      .photo-card img {
        display: block;
        width: 100%;
        height: 190px;
        object-fit: cover;
        background: #e9eef2;
      }

      .photo-caption {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        padding: 12px;
        color: #4c6075;
        font-size: 10px;
      }

      .photo-caption span {
        color: #4286b0;
      }

      .document-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 11px;
      }

      .document-card {
        display: flex;
        align-items: center;
        gap: 13px;
        padding: 16px;
        color: inherit;
        background: white;
        border: 1px solid #e5ebf0;
        border-radius: 10px;
        text-decoration: none;
        transition:
          border-color 0.2s ease,
          transform 0.2s ease;
      }

      .document-card:hover {
        border-color: #8eb8d3;
        transform: translateY(-2px);
      }

      .document-icon {
        width: 43px;
        height: 43px;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        color: #397da6;
        background: #eaf3f8;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 900;
      }

      .document-info {
        min-width: 0;
        flex: 1;
      }

      .document-info strong,
      .document-info span {
        display: block;
      }

      .document-info strong {
        color: #3c5064;
        font-size: 11px;
        line-height: 1.6;
      }

      .document-info span {
        color: #9aa6b2;
        font-size: 9px;
        margin-top: 5px;
      }

      .document-arrow {
        color: #4b89ae;
        font-size: 16px;
      }

      .empty-panel {
        padding: 30px;
        color: #8d9aa8;
        background: white;
        border: 1px dashed #d8e0e7;
        border-radius: 10px;
        text-align: center;
        font-size: 12px;
      }

      .streetview-frame {
        height: 470px;
        overflow: hidden;
        background: #e7edf1;
        border: 1px solid #e1e8ee;
        border-radius: 13px;
      }

      .streetview-frame iframe {
        width: 100%;
        height: 100%;
        border: 0;
      }

      .bridge-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
        margin-top: 50px;
        padding-top: 23px;
        border-top: 1px solid #dfe6ec;
      }

      .bridge-footer strong,
      .bridge-footer span {
        display: block;
      }

      .bridge-footer strong {
        color: #315e7e;
        font-size: 14px;
        letter-spacing: 1px;
      }

      .bridge-footer span {
        color: #8a98a7;
        font-size: 10px;
        margin-top: 4px;
      }

      .bridge-footer button {
        padding: 10px 14px;
        color: #427b9e;
        background: #fff;
        border: 1px solid #dce6ed;
        border-radius: 7px;
        font-size: 10px;
        cursor: pointer;
      }

      .bridge-not-found {
        min-height: calc(100vh - 70px);
        display: grid;
        place-items: center;
        padding: 30px;
        background: #f4f6f9;
      }

      .not-found-card {
        width: min(460px, 100%);
        padding: 40px;
        background: white;
        border: 1px solid #e4eaf0;
        border-radius: 15px;
        text-align: center;
      }

      .not-found-icon {
        width: 48px;
        height: 48px;
        display: grid;
        place-items: center;
        margin: 0 auto 18px;
        color: #c56c5d;
        background: #fff0ed;
        border-radius: 50%;
        font-size: 22px;
        font-weight: 800;
      }

      .not-found-card h1 {
        color: #253b50;
        font-size: 21px;
      }

      .not-found-card p {
        color: #8492a1;
        font-size: 12px;
        line-height: 1.7;
      }

      .not-found-card button {
        margin-top: 12px;
        padding: 11px 16px;
        color: white;
        background: #276d98;
        border: 0;
        border-radius: 7px;
        font-size: 11px;
        cursor: pointer;
      }

      @media (max-width: 1050px) {
        .bridge-kpis {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .photo-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .viewer-shell {
          height: 500px;
        }
      }

      @media (max-width: 700px) {
        .bridge-container {
          width: calc(100% - 28px);
        }

        .bridge-detail-page {
          padding-top: 23px;
        }

        .bridge-heading {
          align-items: flex-start;
          flex-direction: column;
        }

        .bridge-kpis {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .kpi-card {
          min-height: 105px;
          padding: 14px;
        }

        .kpi-card strong {
          font-size: 22px;
        }

        .detail-grid {
          grid-template-columns: 1fr;
        }

        .viewer-shell {
          height: 430px;
        }

        .viewer-topbar {
          left: 9px;
          right: 9px;
          top: 9px;
          align-items: flex-start;
          flex-direction: column;
        }

        .viewer-actions {
          flex-wrap: wrap;
        }

        .viewer-layer-panel {
          right: 9px;
          bottom: 42px;
        }

        .history-header {
          flex-direction: column;
        }

        .history-chart {
          grid-template-columns: 75px minmax(0, 1fr);
          gap: 6px;
        }

        .history-axis {
          font-size: 8px;
        }

        .history-bars {
          gap: 7px;
        }

        .photo-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .photo-card img {
          height: 130px;
        }

        .document-grid {
          grid-template-columns: 1fr;
        }

        .streetview-frame {
          height: 330px;
        }

        .bridge-footer {
          align-items: flex-start;
          flex-direction: column;
        }

        .identity-table > div {
          grid-template-columns: 105px minmax(0, 1fr);
        }

        .section-heading {
          align-items: flex-start;
          flex-direction: column;
        }
      }
      
/* =========================================
   LINTAS - 3D ENVIRONMENT CONTROL PANEL
   ========================================= */

.viewer-control-panel {
  position: absolute;
  z-index: 8;
  top: 76px;
  right: 17px;
  bottom: 48px;
  width: 320px;
  max-height: calc(100% - 135px);
  overflow-y: auto;
  padding: 17px;
  color: #f4f5f2;
  background: rgba(31, 32, 29, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.32);
}

.viewer-control-panel.collapsed {
  bottom: auto;
  width: auto;
  padding: 10px;
}

.control-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.control-panel-header > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.control-eyebrow {
  color: #a6a99b;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.control-panel-header strong {
  color: #fff;
  font-size: 14px;
}

.control-panel-header button {
  width: 30px;
  height: 30px;
  color: #fff;
  background: rgba(255,255,255,0.09);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 50%;
  cursor: pointer;
}

.control-section {
  margin-top: 16px;
  padding: 13px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 12px;
}

.control-section-title {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 15px;
}

.control-section-title > span {
  color: #ffba35;
  font-size: 18px;
}

.control-section-title strong {
  color: #f1f1ec;
  font-size: 12px;
  font-weight: 750;
}

.control-time {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 15px;
}

.control-time strong {
  color: #fff;
  font-size: 29px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.control-time span {
  color: #a5a59c;
  font-size: 10px;
}

.time-slider input {
  width: 100%;
  height: 5px;
  accent-color: #ffb000;
  cursor: pointer;
}

.time-scale {
  display: flex;
  justify-content: space-between;
  margin-top: 7px;
  color: #999b91;
  font-size: 9px;
}

.time-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: 15px;
}

.time-presets button {
  padding: 9px 3px;
  color: #d3d3cc;
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  font-size: 9px;
  cursor: pointer;
  transition: 0.2s ease;
}

.time-presets button:hover,
.time-presets button.active {
  color: #ffcb54;
  border-color: #e9aa35;
  background: rgba(255, 178, 35, 0.12);
}

.live-time-button {
  width: 100%;
  margin-top: 12px;
  padding: 9px;
  color: #c3c4b9;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  font-size: 10px;
  cursor: pointer;
}

.live-time-button.active {
  color: #42d7a4;
  border-color: rgba(54, 211, 157, 0.4);
}

.environment-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 11px 0;
  border-top: 1px solid rgba(255,255,255,0.08);
  cursor: pointer;
}

.environment-toggle > span {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.environment-toggle strong {
  color: #ecece5;
  font-size: 11px;
  font-weight: 650;
}

.environment-toggle small {
  color: #999b91;
  font-size: 9px;
}

.environment-toggle input {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  accent-color: #e9ad38;
  cursor: pointer;
}

.viewer-control-panel::-webkit-scrollbar {
  width: 4px;
}

.viewer-control-panel::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.22);
  border-radius: 10px;
}

/* Fullscreen */
.viewer-shell:fullscreen {
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
  border: 0;
  border-radius: 0;
  background: #101820;
}

.viewer-shell:fullscreen .viewer-control-panel {
  top: 78px;
  right: 22px;
  width: 340px;
  max-height: calc(100% - 125px);
}

.viewer-shell:fullscreen .viewer-topbar {
  top: 20px;
  left: 22px;
  right: 22px;
}

/* Responsive */
@media (max-width: 700px) {
  .viewer-control-panel {
    top: 105px;
    right: 9px;
    bottom: 43px;
    width: min(290px, calc(100% - 18px));
    max-height: calc(100% - 155px);
    padding: 12px;
  }

  .viewer-shell:fullscreen .viewer-control-panel {
    top: 100px;
    right: 9px;
    width: min(290px, calc(100% - 18px));
  }

  .control-time strong {
    font-size: 25px;
  }

  .viewer-coordinate {
    left: 9px;
    bottom: 9px;
  }
}

/* ==========================================
   LINTAS CESIUM ADVANCED CONTROL PANEL
   ========================================== */

.cesium-control-panel {
  position: absolute;
  z-index: 10;
  top: 14px;
  right: 14px;
  bottom: 14px;
  width: 285px;
  padding: 15px;
  overflow-y: auto;
  overflow-x: hidden;
  color: #f1f6fb;
  background: rgba(12, 25, 37, 0.93);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(15px);
  scrollbar-width: thin;
  scrollbar-color: #50718a transparent;
}

.cesium-panel-header {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255,255,255,0.16);
}

.cesium-panel-header strong {
  color: #f5c84b;
  font-size: 16px;
}

.cesium-panel-header span {
  color: #8da9bf;
  font-size: 9px;
  letter-spacing: 1.2px;
  font-weight: 800;
}

.cesium-control-group {
  padding: 15px 0;
  border-bottom: 1px solid rgba(255,255,255,0.14);
}

.cesium-control-group h4 {
  margin: 0 0 11px;
  color: #80cfff;
  font-size: 12px;
  font-weight: 800;
}

.cesium-button-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.cesium-button-grid button,
.cesium-control-buttons button,
.cesium-full-button {
  width: 100%;
  min-height: 32px;
  padding: 7px 9px;
  color: white;
  background: #087ce9;
  border: 1px solid #087ce9;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 650;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.cesium-button-grid button:hover,
.cesium-control-buttons button:hover,
.cesium-full-button:hover {
  background: #075fb6;
  border-color: #5cb8f3;
}

.cesium-button-grid button.active,
.cesium-control-buttons button.active {
  background: #145b80;
  border-color: #63c4f3;
}

.cesium-control-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cesium-control-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.cesium-control-title h4 {
  margin-bottom: 0;
}

.cesium-secondary-label {
  color: #c5d5e2;
  font-size: 11px;
}

.cesium-inline-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin: 12px 0;
}

.cesium-inline-options label {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #dce8f1;
  font-size: 10px;
}

.cesium-inline-options input {
  accent-color: #1689f5;
}

.cesium-range {
  display: block;
  width: 100%;
  margin: 13px 0 5px;
  accent-color: #1689f5;
  cursor: pointer;
}

.cesium-hint {
  display: block;
  margin-top: 8px;
  color: #9fb1c1;
  font-size: 9px;
  line-height: 1.6;
}

.cesium-result {
  margin-top: 10px;
  padding: 10px;
  color: #9be8c7;
  background: rgba(36, 156, 111, 0.15);
  border: 1px solid rgba(36, 156, 111, 0.3);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 750;
}

.cesium-switch {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 18px;
  flex: 0 0 auto;
}

.cesium-switch input {
  width: 0;
  height: 0;
  opacity: 0;
}

.cesium-switch span {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: #526171;
  cursor: pointer;
  transition: 0.2s;
}

.cesium-switch span::before {
  content: "";
  position: absolute;
  width: 12px;
  height: 12px;
  left: 3px;
  top: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.2s;
}

.cesium-switch input:checked + span {
  background: #087ce9;
}

.cesium-switch input:checked + span::before {
  transform: translateX(16px);
}

.cesium-switch input:disabled + span {
  opacity: 0.4;
  cursor: not-allowed;
}

.cesium-fullscreen-button {
  margin-top: 13px;
  min-height: 38px;
}

.cesium-full-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cesium-streetview-overlay {
  position: absolute;
  z-index: 20;
  left: 15px;
  bottom: 15px;
  width: min(500px, calc(100% - 330px));
  height: 300px;
  overflow: hidden;
  background: #122337;
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.4);
}

.cesium-streetview-header {
  height: 38px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  color: white;
  font-size: 11px;
}

.cesium-streetview-header button {
  color: white;
  background: transparent;
  border: 0;
  font-size: 17px;
  cursor: pointer;
}

.cesium-streetview-overlay iframe {
  display: block;
  width: 100%;
  height: calc(100% - 38px);
  border: 0;
}

@media (max-width: 700px) {
  .cesium-control-panel {
    top: 8px;
    right: 8px;
    bottom: 8px;
    width: 225px;
    padding: 11px;
  }

  .cesium-panel-header strong {
    font-size: 13px;
  }

  .cesium-control-group {
    padding: 11px 0;
  }

  .cesium-streetview-overlay {
    left: 8px;
    bottom: 8px;
    width: calc(100% - 250px);
    height: 230px;
  }
}

    `}</style>
  );
}
