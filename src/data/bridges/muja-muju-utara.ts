import type { BridgeData } from "./types";
import { r2Asset } from "@/lib/assets";

export const mujaMujuUtara: BridgeData = {
  id: null,
  slug: "muja-muju-utara",
  name: "Jembatan Muja Muju Utara",

  identity: {
    roadNumber: "N_2003",
    roadName: "Jl. Kusumanegara (Sisi Barat) dan Jl. Kusumanegara (Sisi Timur)",
    village: "Muja Muju",
    district: "Umbulharjo",
    city: "Kota Yogyakarta",
    latitude: -7.8022028,
    longitude: 110.3975111,
    latitudeText: `-7Â°48'7.93" LS`,
    longitudeText: `110Â°23'51.04" BT`,
    yearBuilt: 1979,
    operationalStatus: "Beroperasi",
    riverValue: 1,
    riverCondition: "Rusak Ringan",
  },

  dimensions: {
    length: 47,
    width: 7.4,
    spans: 1,
  },

  history: [
    { year: 2020, value: 3 },
    { year: 2021, value: 3 },
    { year: 2022, value: 3 },
    { year: 2023, value: 3 },
    { year: 2024, value: 4 },
  ],

  currentCondition: {
    score: 4,
    condition: "Kritis",
    stability: "Tidak Mantap",
    handlingPlan: "Memerlukan Penanganan Segera",
    construction: "Struktur Baja Callender Hamilton",
    damage: [
      "Plat lantai keropos",
      "Beton mengelupas",
      "Baja tulangan korosi",
    ],
    recommendations: [
      "Penggantian plat lantai",
      "Penggantian baja tulangan yang mengalami korosi parah",
      "Evaluasi struktur rangka baja karena usia jembatan mendekati umur rencana 50 tahun",
    ],
  },

  components: {
    superstructure: [
      {
        name: "Struktur Atas",
        type: "Baja Callender Hamilton",
        value: 4 },
      {
        name: "Sistem Lantai",
        type: "Aspal",
        value: 2 },
      { name: "Perlengkapan (Sandaran, Railing, Pipa Cucuran)",
        type: "Baja",
        value: 1 },
    ],
    substructure: [
      {
        name: "Abutmen/Pilar",
        type: "Beton",
        value: 2 },
      {
        name: "Pondasi",
        type: "Beton",
        value: 2 },
      {
        name: "Dinding Penahan",
        type: "Pasangan Batu",
        value: 1 },
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
      "https://www.google.com/maps/embed?pb=!4v1764650464738!6m8!1m7!1sJMi82tscw0vOS8QCPyqCyw!2m2!1d-7.802211127906!2d110.3978051710712!3f249.11938324031527!4f-16.01819179233206!5f0.4000000000000002",
  },

  photos: [
    { title: "Foto Jembatan Muja Muju Utara 1", url: r2Asset("landscape/mujamujuutara 1.jpg") },
    { title: "Foto Jembatan Muja Muju Utara 2", url: r2Asset("landscape/mujamujuutara 2.jpg") },
    { title: "Foto Jembatan Muja Muju Utara 3", url: r2Asset("landscape/mujamujuutara 3.jpg") },
    { title: "Foto Jembatan Muja Muju Utara 4", url: r2Asset("landscape/mujamujuutara 4.jpg") },
  ],
  documents: [
    {
      title: "Dokumen Teknis Rangka Baja Jembatan Sisi Utara",
      type: "pdf",
      url: r2Asset("Jembatan Rangka Baja Muja Muju Sisi Utara.pdf", "data") },
    {
      title: "Data DWG Jembatan Muja Muju Utara",
      type: "zip",
      url: r2Asset("jembatan_mujamuju_utara.zip", "data") },
    {
      title: "Peta Planimetris Jembatan Muja-Muju",
      type: "pdf",
      url: r2Asset("Peta Planimetris Jembatan Muja-Muju.pdf", "data") },
    {
      title: "Data Kontur Jembatan Muja-Muju",
      type: "zip",
      url: r2Asset("kontur_mujamuju.zip", "data") },
  ],
};
