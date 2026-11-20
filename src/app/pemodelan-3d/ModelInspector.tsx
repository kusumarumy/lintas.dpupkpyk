"use client";

import type { ModelCollection } from "./model-types";

type Props = {
  models: ModelCollection;
};

export default function ModelInspector({ models }: Props) {
  const items = [
    {
      key: "bridge",
      name: "Jembatan Kewek",
      category: "Bridge Infrastructure",
    },
    {
      key: "kleringan",
      name: "Jembatan Kleringan",
      category: "Bridge Infrastructure",
    },
    {
      key: "train",
      name: "Infrastruktur Kereta",
      category: "Railway Infrastructure",
    },
    {
      key: "area",
      name: "Area Sekitar",
      category: "Urban Environment",
    },
    {
      key: "river",
      name: "Sungai",
      category: "Hydrology",
    },
  ] as const;

  const loadedCount = items.filter(
    (item) => models[item.key] !== null
  ).length;

  return (
    <div className="dt-panel">
      <div className="dt-panel-header">
        <div>
          <span className="dt-eyebrow">SCENE MANAGEMENT</span>
          <h3>Layer Explorer</h3>
        </div>

        <span className="dt-panel-icon">▤</span>
      </div>

      <div className="dt-panel-content">
        <div className="dt-section-heading">3D SCENE CONTENT</div>

        {items.map((item) => {
          const model = models[item.key];
          const loaded = model !== null;

          return (
            <div className="dt-layer-item" key={item.key}>
              <div className="dt-layer-info">
                <span className="dt-layer-indicator">
                  {loaded ? "◈" : "○"}
                </span>

                <div>
                  <strong>{item.name}</strong>
                  <small>{item.category}</small>
                </div>
              </div>

              <label className="dt-switch">
                <input
                  type="checkbox"
                  checked={model?.show ?? false}
                  disabled={!loaded}
                  onChange={(event) => {
                    if (model) {
                      model.show = event.target.checked;
                    }
                  }}
                />

                <span />
              </label>
            </div>
          );
        })}

        <div className="dt-section-heading dt-section-spaced">
          MODEL INFORMATION
        </div>

        <div className="dt-info-card">
          <span>Loaded Assets</span>
          <strong>{loadedCount} / {items.length}</strong>
        </div>

        <p className="dt-helper">
          Aktifkan atau nonaktifkan setiap model untuk mengatur
          visualisasi lingkungan infrastruktur.
        </p>
      </div>
    </div>
  );
}