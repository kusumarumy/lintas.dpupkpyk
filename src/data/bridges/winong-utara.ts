import type { BridgeData } from "./types";
import { r2Asset } from "@/lib/assets";

export const winongUtara: BridgeData = {
  id: null,
  slug: "winong-utara",
  name: "Jembatan Winong Utara",

  identity: {
    roadNumber: "",
    roadName: "Jl. Perintis Kemerdekaan (Sisi Barat) dan Jl. Ngeksigondo (Sisi Timur)",
    village: "Pandeyan",
    district: "Umbulharjo",
    city: "Kota Yogyakarta",
    latitude: -7.8188806,
    longitude: 110.3945889,
    latitudeText: `-7°49'7.97" LS`,
    longitudeText: `110°23'40.52" BT`,
    yearBuilt: null,
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
    { year: 2020, value: 2 },
    { year: 2021, value: 2 },
    { year: 2022, value: 2 },
    { year: 2023, value: 3 },
    { year: 2024, value: 3 },
  ],

  currentCondition: {
    score: 3,
    condition: "Rusak Berat",
    stability: "",
    handlingPlan: "Memerlukan Perbaikan Secepatnya Dalam 1 Tahun",
    construction: "Baja Komposit",
    damage: [
      "Aspal aus",
      "Expansion joint retak",
      "Plat injak jembatan retak",
    ],
    recommendations: [
      "Pelapisan ulang aspal",
      "Penggantian expansion joint",
      "Penggantian plat injak jembatan",
    ],
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
    imageryAssetId: 4192790,
    mainAssetId: 4203737,
    areaAssetId: 4192793,
    riverAssetId: 4189964,
  },

  streetView: {
    embedUrl:
      "https://www.google.com/maps/embed?pb=!4v1764652516945!6m8!1m7!1sGIrA1PpoCqK1kIN4W4proQ!2m2!1d-7.818999649667473!2d110.3949022259342!3f316.1800276513624!4f5.704244351568903!5f0.4002417459977731",
  },

  photos: [
    { title: "Foto Jembatan Winong Utara - Atas", url: r2Asset("atas.jpg") },
    { title: "Foto Jembatan Winong Utara - Bawah", url: r2Asset("bawah.jpg") },
    { title: "Foto Jembatan Winong Utara - Kanan", url: r2Asset("kanan.jpg") },
    { title: "Foto Jembatan Winong Utara - Kiri", url: r2Asset("kiri.jpg") },
  ],

  documents: [
    { title: "Dokumen Teknis Jembatan Sisi Utara", type: "pdf", url: r2Asset("Jembatan Perintis Kemerdekaan Sisi Utara.pdf") },
    { title: "Data DWG Jembatan Winong Utara", type: "zip", url: r2Asset("jembatan_winong_utara.zip") },
    { title: "Peta Planimetris Jembatan Winong", type: "pdf", url: r2Asset("Peta Planimetris Jembatan Winong.pdf") },
    { title: "Data Kontur Jembatan Winong", type: "zip", url: r2Asset("kontur_kemerdekaan.zip") },
  ],
};