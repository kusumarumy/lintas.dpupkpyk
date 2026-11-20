
"use client";

import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import type { Viewer } from "cesium";

type Props = {
  viewer: Viewer | null;
};

type Mode = "distance" | "area" | "height" | null;

export default function AnalysisPanel({ viewer }: Props) {
  const [mode, setMode] = useState<Mode>(null);
  const [result, setResult] = useState("");
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
  const entitiesRef = useRef<Cesium.Entity[]>([]);

  const clear = () => {
    if (handlerRef.current) {
      handlerRef.current.destroy();
      handlerRef.current = null;
    }

    if (viewer) {
      entitiesRef.current.forEach((entity) => {
        viewer.entities.remove(entity);
      });
    }

    entitiesRef.current = [];
    setMode(null);
    setResult("");
  };

  useEffect(() => {
    return () => {
      if (handlerRef.current) {
        handlerRef.current.destroy();
      }

      if (viewer && !viewer.isDestroyed()) {
        entitiesRef.current.forEach((entity) => {
          viewer.entities.remove(entity);
        });
      }
    };
  }, [viewer]);

  const startMeasurement = (nextMode: Mode) => {
    if (!viewer || !nextMode) return;

    clear();
    setMode(nextMode);

    const positions: Cesium.Cartesian3[] = [];

    const handler = new Cesium.ScreenSpaceEventHandler(
      viewer.scene.canvas
    );

    handlerRef.current = handler;

    handler.setInputAction(
      (click: { position: Cesium.Cartesian2 }) => {
        const position = viewer.scene.pickPosition(click.position);

        if (!Cesium.defined(position)) {
          const ray = viewer.camera.getPickRay(click.position);
          const ground = ray
            ? viewer.scene.globe.pick(ray, viewer.scene)
            : undefined;

          if (!ground) return;
          positions.push(ground);
        } else {
          positions.push(position);
        }

        if (nextMode === "distance" && positions.length === 2) {
          const distance = Cesium.Cartesian3.distance(
            positions[0],
            positions[1]
          );

          entitiesRef.current.push(
            viewer.entities.add({
              polyline: {
                positions: [...positions],
                width: 4,
                material: Cesium.Color.YELLOW,
              },
            })
          );

          const midpoint = Cesium.Cartesian3.midpoint(
            positions[0],
            positions[1],
            new Cesium.Cartesian3()
          );

          entitiesRef.current.push(
            viewer.entities.add({
              position: midpoint,
              label: {
                text: `${distance.toFixed(2)} m`,
                font: "16px sans-serif",
                fillColor: Cesium.Color.YELLOW,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 3,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
              },
            })
          );

          setResult(`Jarak: ${distance.toFixed(2)} meter`);
          handler.destroy();
          handlerRef.current = null;
          setMode(null);
        }

        if (nextMode === "height" && positions.length === 2) {
          const c1 = Cesium.Cartographic.fromCartesian(positions[0]);
          const c2 = Cesium.Cartographic.fromCartesian(positions[1]);

          const heightDifference = Math.abs(c2.height - c1.height);

          const horizontal = Cesium.Cartesian3.distance(
            Cesium.Cartesian3.fromRadians(
              c1.longitude,
              c1.latitude,
              0
            ),
            Cesium.Cartesian3.fromRadians(
              c2.longitude,
              c2.latitude,
              0
            )
          );

          const distance3D = Cesium.Cartesian3.distance(
            positions[0],
            positions[1]
          );

          const verticalFoot = Cesium.Cartesian3.fromRadians(
            c2.longitude,
            c2.latitude,
            c1.height
          );

          entitiesRef.current.push(
            viewer.entities.add({
              polyline: {
                positions: [positions[0], positions[1]],
                width: 4,
                material: Cesium.Color.YELLOW,
              },
            }),
            viewer.entities.add({
              polyline: {
                positions: [positions[0], verticalFoot],
                width: 3,
                material: Cesium.Color.CYAN,
              },
            }),
            viewer.entities.add({
              polyline: {
                positions: [verticalFoot, positions[1]],
                width: 3,
                material: Cesium.Color.MAGENTA,
              },
            })
          );

          const midpoint = Cesium.Cartesian3.midpoint(
            positions[0],
            positions[1],
            new Cesium.Cartesian3()
          );

          entitiesRef.current.push(
            viewer.entities.add({
              position: midpoint,
              label: {
                text: `3D: ${distance3D.toFixed(2)} m\nΔH: ${heightDifference.toFixed(2)} m\nHorizontal: ${horizontal.toFixed(2)} m`,
                font: "14px sans-serif",
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 3,
                showBackground: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
              },
            })
          );

          setResult(
            `Jarak 3D: ${distance3D.toFixed(2)} m · Beda tinggi: ${heightDifference.toFixed(2)} m`
          );

          handler.destroy();
          handlerRef.current = null;
          setMode(null);
        }

        if (nextMode === "area" && positions.length >= 3) {
          const points = positions.map((p) =>
            Cesium.Cartographic.fromCartesian(p)
          );

          let area = 0;
          const radius = 6378137;

          for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;

            area +=
              (points[j].longitude - points[i].longitude) *
              (2 + Math.sin(points[i].latitude) + Math.sin(points[j].latitude));
          }

          area = Math.abs((area * radius * radius) / 2);

          entitiesRef.current.push(
            viewer.entities.add({
              polygon: {
                hierarchy: new Cesium.PolygonHierarchy(positions),
                material: Cesium.Color.YELLOW.withAlpha(0.3),
                outline: true,
                outlineColor: Cesium.Color.YELLOW,
              },
            })
          );

          setResult(`Luas perkiraan: ${area.toFixed(2)} m²`);

          handler.destroy();
          handlerRef.current = null;
          setMode(null);
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );

    if (nextMode === "area") {
      handler.setInputAction(() => {
        handler.destroy();
        handlerRef.current = null;
        setMode(null);
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
  };

  return (
    <div className="dt-panel">
      <div className="dt-panel-header">
        <div>
          <span className="dt-eyebrow">SPATIAL ANALYTICS</span>
          <h3>Measurement Tools</h3>
        </div>
        <span className="dt-panel-icon">⌖</span>
      </div>

      <div className="dt-panel-content">
        <div className="dt-section-heading">
          GEOMETRIC MEASUREMENT
        </div>

        <button
          className={`dt-action-card ${mode === "distance" ? "selected" : ""}`}
          onClick={() => startMeasurement("distance")}
          disabled={!viewer}
        >
          <span className="dt-action-icon">↔</span>
          <span>
            <strong>Distance Measurement</strong>
            <small>Klik dua titik pada model</small>
          </span>
        </button>

        <button
          className={`dt-action-card ${mode === "area" ? "selected" : ""}`}
          onClick={() => startMeasurement("area")}
          disabled={!viewer}
        >
          <span className="dt-action-icon">▱</span>
          <span>
            <strong>Area Measurement</strong>
            <small>Klik minimal tiga titik, klik kanan untuk membatalkan</small>
          </span>
        </button>

        <button
          className={`dt-action-card ${mode === "height" ? "selected" : ""}`}
          onClick={() => startMeasurement("height")}
          disabled={!viewer}
        >
          <span className="dt-action-icon">↕</span>
          <span>
            <strong>Height Measurement</strong>
            <small>Analisis beda tinggi dua titik</small>
          </span>
        </button>

        {mode && (
          <div className="dt-measure-status">
            <span className="dt-status-dot" />
            Mode pengukuran aktif: {mode}
            <small>Klik pada permukaan model 3D</small>
          </div>
        )}

        {result && (
          <div className="dt-result-card">
            <span>MEASUREMENT RESULT</span>
            <strong>{result}</strong>
          </div>
        )}

        <button
          className="dt-secondary-button"
          onClick={clear}
          disabled={!viewer}
        >
          Clear Measurement
        </button>

        <p className="dt-helper">
          Pengukuran bergantung pada kedalaman permukaan yang
          dapat dipilih oleh Cesium.
        </p>
      </div>
    </div>
  );
}
