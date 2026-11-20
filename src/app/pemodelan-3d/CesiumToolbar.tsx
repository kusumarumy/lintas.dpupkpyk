
"use client";

import * as Cesium from "cesium";
import type { Viewer } from "cesium";

type Panel = "layers" | "analysis" | "environment" | null;

type Props = {
  viewer: Viewer | null;
  activePanel: Panel;
  onPanelChange: (panel: Panel) => void;
};

export default function CesiumToolbar({
  viewer,
  activePanel,
  onPanelChange,
}: Props) {
  const toggle = (panel: Panel) => {
    onPanelChange(activePanel === panel ? null : panel);
  };

  const home = () => {
    if (!viewer) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        110.3687,
        -7.7905,
        900
      ),
      duration: 1.8,
    });
  };

  const topView = () => {
    if (!viewer) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        110.3687,
        -7.7905,
        180
      ),
      orientation: {
        heading: 0,
        pitch: -Math.PI / 2,
        roll: 0,
      },
      duration: 1.5,
    });
  };

  const north = () => {
    if (!viewer) return;

    viewer.camera.setView({
      destination: viewer.camera.positionWC,
      orientation: {
        heading: 0,
        pitch: viewer.camera.pitch,
        roll: 0,
      },
    });
  };

  const fullscreen = async () => {
    if (!viewer) return;

    const container = viewer.container;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }

      viewer.resize();
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  return (
    <div className="dt-toolbar">

      <div className="dt-toolbar-group">
        <button
          title="Home View"
          onClick={home}
          disabled={!viewer}
        >
          <span>⌂</span>
        </button>

        <button
          title="Top View"
          onClick={topView}
          disabled={!viewer}
        >
          <span>⬆</span>
        </button>

        <button
          title="North Orientation"
          onClick={north}
          disabled={!viewer}
        >
          <span>N</span>
        </button>
      </div>

      <div className="dt-toolbar-divider" />

      <div className="dt-toolbar-group">
        <button
          className={activePanel === "layers" ? "active" : ""}
          title="Layers"
          onClick={() => toggle("layers")}
        >
          <span>▤</span>
        </button>

        <button
          className={activePanel === "analysis" ? "active" : ""}
          title="Spatial Analysis"
          onClick={() => toggle("analysis")}
        >
          <span>⌖</span>
        </button>

        <button
          className={activePanel === "environment" ? "active" : ""}
          title="Environment & Lighting"
          onClick={() => toggle("environment")}
        >
          <span>☀</span>
        </button>
      </div>

      <div className="dt-toolbar-divider" />

      <div className="dt-toolbar-group">
        <button
          title="Fullscreen"
          onClick={fullscreen}
          disabled={!viewer}
        >
          <span>⛶</span>
        </button>
      </div>

    </div>
  );
}
