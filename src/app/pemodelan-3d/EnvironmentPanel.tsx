"use client";

import { useRef, useState } from "react";
import * as Cesium from "cesium";
import type { Viewer, PostProcessStage } from "cesium";

type Props = {
  viewer: Viewer | null;
};

type LightingMode = "day" | "night" | "sunrise" | "sunset";

const BLOOM_SHADER = `
  uniform sampler2D colorTexture;
  varying vec2 v_textureCoordinates;

  void main() {
    vec4 color = texture2D(colorTexture, v_textureCoordinates);

    vec2 texel = 1.0 / czm_viewport.zw;

    vec3 glow = vec3(0.0);
    float totalWeight = 0.0;

    for (int x = -2; x <= 2; x++) {
      for (int y = -2; y <= 2; y++) {
        vec2 offset = vec2(float(x), float(y)) * texel * 2.0;
        vec3 sampleColor = texture2D(
          colorTexture,
          v_textureCoordinates + offset
        ).rgb;

        float brightness = max(
          max(sampleColor.r, sampleColor.g),
          sampleColor.b
        );

        float threshold = smoothstep(0.65, 1.0, brightness);
        float weight = 1.0 / (1.0 + float(x * x + y * y));

        glow += sampleColor * threshold * weight;
        totalWeight += weight;
      }
    }

    glow /= max(totalWeight, 0.001);

    vec3 result = color.rgb + glow * 0.45;

    gl_FragColor = vec4(result, color.a);
  }
`;

export default function EnvironmentPanel({ viewer }: Props) {
  const [lighting, setLighting] = useState<LightingMode>("day");
  const [atmosphere, setAtmosphere] = useState(true);
  const [sunEnabled, setSunEnabled] = useState(true);
  const [bloom, setBloom] = useState(false);

  const bloomStageRef = useRef<{
    viewer: Viewer;
    stage: PostProcessStage;
  } | null>(null);

  const setEnvironment = (mode: LightingMode) => {
    if (!viewer || viewer.isDestroyed()) return;

    const scene = viewer.scene;
    const globe = scene.globe;

    const hour =
      mode === "day"
        ? 12
        : mode === "night"
          ? 0
          : mode === "sunrise"
            ? 6
            : 17.5;

    const date = new Date();
    date.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);

    viewer.clock.currentTime = Cesium.JulianDate.fromDate(date);
    viewer.clock.shouldAnimate = false;

    scene.light = new Cesium.SunLight();

    globe.enableLighting = mode !== "day" || sunEnabled;

    if (scene.skyAtmosphere) {
      scene.skyAtmosphere.show = atmosphere;

      scene.skyAtmosphere.hueShift =
        mode === "sunset" ? -0.15 : mode === "sunrise" ? -0.1 : 0;

      scene.skyAtmosphere.saturationShift =
        mode === "sunset" ? 0.2 : mode === "sunrise" ? 0.1 : 0;

      scene.skyAtmosphere.brightnessShift =
        mode === "night"
          ? -0.35
          : mode === "sunset"
            ? -0.2
            : mode === "sunrise"
              ? -0.15
              : 0;
    }

    scene.globe.showGroundAtmosphere = atmosphere;

    setLighting(mode);
    scene.requestRender();
  };

  const toggleSun = () => {
    if (!viewer || viewer.isDestroyed()) return;

    const next = !sunEnabled;

    setSunEnabled(next);
    viewer.scene.globe.enableLighting = next;
    viewer.scene.light = new Cesium.SunLight();

    viewer.scene.requestRender();
  };

  const toggleAtmosphere = () => {
    if (!viewer || viewer.isDestroyed()) return;

    const next = !atmosphere;

    setAtmosphere(next);

    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.show = next;
    }

    viewer.scene.globe.showGroundAtmosphere = next;
    viewer.scene.requestRender();
  };

  const toggleBloom = () => {
    if (!viewer || viewer.isDestroyed()) return;

    const next = !bloom;
    const stages = viewer.scene.postProcessStages;

    let stage =
      bloomStageRef.current?.viewer === viewer
        ? bloomStageRef.current.stage
        : null;

    if (!stage) {
      stage = new Cesium.PostProcessStage({
        name: "lintas-bloom",
        fragmentShader: BLOOM_SHADER,
      });

      stages.add(stage);

      bloomStageRef.current = {
        viewer,
        stage,
      };
    }

    stage.enabled = next;

    setBloom(next);
    viewer.scene.requestRender();
  };

  return (
    <div className="dt-panel">
      <div className="dt-panel-header">
        <div>
          <span className="dt-eyebrow">ENVIRONMENT CONTROL</span>
          <h3>Lighting Studio</h3>
        </div>
        <span className="dt-panel-icon">☀</span>
      </div>

      <div className="dt-panel-content">
        <div className="dt-section-heading">LIGHTING PRESETS</div>

        <div className="dt-lighting-grid">
          {(
            [
              ["day", "☀", "Day"],
              ["night", "☾", "Night"],
              ["sunrise", "🌅", "Sunrise"],
              ["sunset", "🌇", "Sunset"],
            ] as const
          ).map(([value, icon, label]) => (
            <button
              key={value}
              type="button"
              className={`dt-lighting-card ${
                lighting === value ? "selected" : ""
              }`}
              disabled={!viewer}
              onClick={() => setEnvironment(value)}
            >
              <span>{icon}</span>
              <strong>{label}</strong>
            </button>
          ))}
        </div>

        <div className="dt-section-heading dt-section-spaced">
          ATMOSPHERIC EFFECTS
        </div>

        <div className="dt-setting-row">
          <div>
            <strong>Atmosphere</strong>
            <small>Sky and atmospheric scattering</small>
          </div>

          <label className="dt-switch">
            <input
              type="checkbox"
              checked={atmosphere}
              onChange={toggleAtmosphere}
              disabled={!viewer}
            />
            <span />
          </label>
        </div>

        <div className="dt-setting-row">
          <div>
            <strong>Sun Lighting</strong>
            <small>Dynamic solar illumination</small>
          </div>

          <label className="dt-switch">
            <input
              type="checkbox"
              checked={sunEnabled}
              onChange={toggleSun}
              disabled={!viewer}
            />
            <span />
          </label>
        </div>

        <div className="dt-setting-row">
          <div>
            <strong>Bloom Effect</strong>
            <small>Post-processing glow</small>
          </div>

          <label className="dt-switch">
            <input
              type="checkbox"
              checked={bloom}
              onChange={toggleBloom}
              disabled={!viewer}
            />
            <span />
          </label>
        </div>

        <p className="dt-helper">
          Lighting presets mengatur waktu simulasi dan atmosfer pada scene
          Cesium.
        </p>
      </div>
    </div>
  );
}