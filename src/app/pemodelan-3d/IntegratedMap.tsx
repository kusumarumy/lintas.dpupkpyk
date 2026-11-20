"use client";

import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import { getCesiumToken } from "@/lib/cesium";
import type { ModelCollection } from "./model-types";

type Props = {
  onViewerReady: (viewer: Cesium.Viewer | null) => void;
  onModelsReady: (models: ModelCollection) => void;
  onLoadingChange: (loading: boolean) => void;
  onModelCountChange: (count: number) => void;
  onError: (error: string) => void;
};

const MODEL_ASSETS = [
  { key: "bridge", id: 4203746 },
  { key: "train", id: 4203751 },
  { key: "kleringan", id: 4203750 },
  { key: "area", id: 4203644 },
  { key: "river", id: 4204061 },
] as const;

export default function IntegratedMap({
  onViewerReady,
  onModelsReady,
  onLoadingChange,
  onModelCountChange,
  onError,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    let disposed = false;
    let viewer: Cesium.Viewer | null = null;

    const loadedModels: ModelCollection = {
      bridge: null,
      train: null,
      kleringan: null,
      area: null,
      river: null,
    };

    const initialize = async () => {
      try {
  // Arahkan aset runtime Cesium ke folder public Next.js.
  (
    window as Window & {
      CESIUM_BASE_URL?: string;
    }
  ).CESIUM_BASE_URL = "/cesium/";

  Cesium.Ion.defaultAccessToken = getCesiumToken("accountA");

  const activeViewer = new Cesium.Viewer(container, {
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
          shouldAnimate: true,
          scene3DOnly: true,
          requestRenderMode: false,
          terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        });

        viewer = activeViewer;

        activeViewer.scene.backgroundColor =
          Cesium.Color.fromCssColorString("#101c2b");

        activeViewer.scene.globe.baseColor =
          Cesium.Color.fromCssColorString("#172a3b");

        activeViewer.scene.globe.enableLighting = true;
        activeViewer.scene.globe.depthTestAgainstTerrain = true;

        activeViewer.scene.highDynamicRange = true;
        activeViewer.scene.postProcessStages.fxaa.enabled = true;

        activeViewer.scene.screenSpaceCameraController.enableCollisionDetection =
          true;

        if (activeViewer.scene.skyAtmosphere) {
          activeViewer.scene.skyAtmosphere.show = true;
        }

        activeViewer.scene.globe.showGroundAtmosphere = true;
        activeViewer.scene.light = new Cesium.SunLight();

        onViewerReady(activeViewer);

        // TERRAIN
        try {
          const terrain =
            await Cesium.CesiumTerrainProvider.fromIonAssetId(4185927);

          if (!disposed && !activeViewer.isDestroyed()) {
            activeViewer.terrainProvider = terrain;
          }
        } catch (error) {
          console.warn("Terrain tidak dapat dimuat:", error);
        }

        if (disposed || activeViewer.isDestroyed()) return;

        // IMAGERY
        try {
          const imagery =
            await Cesium.IonImageryProvider.fromAssetId(4192817);

          if (!disposed && !activeViewer.isDestroyed()) {
            activeViewer.imageryLayers.removeAll();
            activeViewer.imageryLayers.addImageryProvider(imagery);
          }
        } catch (error) {
          console.warn("Imagery tidak dapat dimuat:", error);
        }

        if (disposed || activeViewer.isDestroyed()) return;

        // 3D MODELS
        let count = 0;

        for (const asset of MODEL_ASSETS) {
          if (disposed || activeViewer.isDestroyed()) break;

          try {
            const tileset =
              await Cesium.Cesium3DTileset.fromIonAssetId(asset.id);

            if (disposed || activeViewer.isDestroyed()) {
              if (!tileset.isDestroyed()) {
                tileset.destroy();
              }
              break;
            }

            activeViewer.scene.primitives.add(tileset);

            loadedModels[asset.key] = tileset;

            count++;

            onModelsReady({ ...loadedModels });
            onModelCountChange(count);

            console.info(`3D asset ${asset.id} berhasil dimuat`);

            if (asset.key === "river") {
              tileset.show = true;
            }
          } catch (error) {
            console.error(
              `Gagal memuat Cesium Asset ${asset.id}:`,
              error
            );
          }
        }

        if (disposed || activeViewer.isDestroyed()) return;

        // INITIAL CAMERA
        if (loadedModels.bridge) {
          await activeViewer.flyTo(loadedModels.bridge, {
            duration: 2.5,
            offset: new Cesium.HeadingPitchRange(
              Cesium.Math.toRadians(15),
              Cesium.Math.toRadians(-35),
              180
            ),
          });
        } else {
          activeViewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(
              110.3687,
              -7.7905,
              800
            ),
          });
        }

        if (!disposed) {
          onLoadingChange(false);
        }
      } catch (error) {
        console.error("Cesium initialization error:", error);

        if (!disposed) {
          onError(
            error instanceof Error
              ? error.message
              : "Gagal menginisialisasi Cesium"
          );

          onLoadingChange(false);
        }
      }
    };

    void initialize();

    return () => {
      disposed = true;
      onViewerReady(null);

      if (viewer && !viewer.isDestroyed()) {
        viewer.destroy();
      }
    };
  }, [
    onViewerReady,
    onModelsReady,
    onLoadingChange,
    onModelCountChange,
    onError,
  ]);

  return (
    <div
      ref={containerRef}
      className="dt-cesium-container"
      aria-label="Peta digital twin infrastruktur"
    />
  );
}