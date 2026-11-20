import type { BridgeData } from "./types";
import { r2Asset } from "@/lib/assets";

export const mujaMujuSelatan: BridgeData = {
  id: null,
  slug: "muja-muju-selatan",
  name: "Jembatan Muja Muju Selatan",

  identity: {
    roadNumber: "",
    roadName: "Jl. Kusumanegara (Sisi Barat) dan Jl. Kusumanegara (Sisi Timur)",
    village: "Muja Muju",
    district: "Umbulharjo",
    city: "Kota Yogyakarta",
    latitude: -7.8023167,
    longitude: 110.3975389,
    latitudeText: `-7°48'8.34" LS`,
    longitudeText: `110°23'51.14" BT`,
    yearBuilt: 2019,
    operationalStatus: "",
    riverValue: null,
    riverCondition: "",
  },

  dimensions: {
    length: null,
    width: null,
    spans: null,
  },

  history: [
    { year: 2020, value: 1 },
    { year: 2021, value: 2 },
    { year: 2022, value: 0 },
    { year: 2023, value: 1 },
    { year: 2024, value: 1 },
  ],

  currentCondition: {
    score: 1,
    condition: "Rusak Ringan",
    stability: "",
    handlingPlan: "Memerlukan Perbaikan Secara Rutin",
    construction: "Girder Prategang",
    damage: ["Cat parapet dan railing pudar"],
    recommendations: ["Pengecatan ulang"],
  },

  components: {
    superstructure: [
      { name: "Struktur Atas", type: "", value: null },
      { name: "Sistem Lantai", type: "", value: null },
      { name: "Perlengkapan", type: "", value: null },
    ],
    substructure: [
      { name: "Abutmen/Pilar", type: "", value: null },
      { name: "Pondasi", type: "", value: null },
      { name: "Dinding Penahan", type: "", value: null },
    ],
  },

  model: {
    terrainAssetId: 4185927,
    imageryAssetId: 4189699,
    mainAssetId: 4204004,
    areaAssetId: 4198986,
    riverAssetId: 4209075,
  },

  streetView: {
    embedUrl:
      "https://www.google.com/maps/embed?pb=!4v1764650679970!6m8!1m7!1seNQ4IlnQJZF2SevSNN-elg!2m2!1d-7.802328093880369!2d110.3978462638444!3f248.49475950751562!4f-6.676195784161592!5f0.7820865974627469",
  },

  photos: [
    { title: "Foto Jembatan Muja Muju Selatan 1", url: r2Asset("landscape/mujamujuselatan 1.jpg") },
    { title: "Foto Jembatan Muja Muju Selatan 2", url: r2Asset("landscape/mujamujuselatan 2.jpg") },
    { title: "Foto Jembatan Muja Muju Selatan 3", url: r2Asset("landscape/mujamujuselatan 3.jpg") },
    { title: "Foto Jembatan Muja Muju Selatan 4", url: r2Asset("landscape/mujamujuselatan 4.jpg") },
  ],

  documents: [
    { title: "Dokumen Teknis PCI Girder Jembatan Sisi Selatan", type: "pdf", url: r2Asset("Jembatan PCI Muja Muju Sisi Selatan.pdf") },
    { title: "Data DWG PCI Girder Jembatan", type: "zip", url: r2Asset("jembatan_mujamuju_selatan.zip") },
    { title: "Peta Planimetris Jembatan Muja-Muju", type: "pdf", url: r2Asset("Peta Planimetris Jembatan Muja-Muju.pdf") },
    { title: "Data Kontur Jembatan Muja-Muju", type: "zip", url: r2Asset("kontur_mujamuju.zip") },
  ],
};