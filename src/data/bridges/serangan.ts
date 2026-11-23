import type { BridgeData } from "./types";
import { r2Asset } from "@/lib/assets";

export const sardjito: BridgeData = {
  id: null,
  slug: "serangan",
  name: "Jembatan Serangan",

  identity: {
    roadNumber: "N_4002",
    roadName: "Jembatan Serangan",
    village: "Wirobrajan",
    district: "Wirobrajan",
    city: "Kota Yogyakarta",

    // Titik tengah bounding envelope CityGML
    latitude: -7.801075,
    longitude: 110.35479722,

    latitudeText: `-7°48'3.87" LS`,
    longitudeText: `110°21'17.27" BT`,

    yearBuilt: ,
    operationalStatus: "Beroperasi",
    riverValue: 2,
    riverCondition: "Rusak Sedang",
  },

  dimensions: {
    length: 32.5,
    width: 15.2,
    spans: 1,
  },

  history: [{
      year: 2020,
      value: 2,
      note: "Rusak Ringan",
    },
    {
      year: 2021,
      value: 2,
      note: "Rusak Ringan",
    },
    {
      year: 2022,
      value: 2,
      note: "Rusak Ringan",
    },
    {
      year: 2023,
      value: 2,
      note: "Rusak Ringan",
    },
    {
      year: 2024,
      value: 2,
      note: "Rusak Ringan",
    },],

  currentCondition: {
    score: 3,
    condition: "Rusak Berat",
    stability: "",
    handlingPlan: "Memerlukan Perbaikan Secepatnya Dalam 1 tahun",
    construction: "Rangka Baja",
    damage: ["Cat Rangka Baja Secara Keseluruhan Sudah Mengelupas, Baja Penopang Lantai Jembatan Sudah Mengalami Krosi, Baja Tulangan Plat Lantai Sudah Terlihat dan Korosi"],
    recommendations: ["Pengecatan Kembali Rangka Baja, Membongkar Lantai Jembatan, Memperbaiki Rangka Baja Penopang Lantai (Dibangun Sejak 184,  Secara Umur Jembatan Sudah 40 Tahun, Umur Jembatan Rata-Rata Diprediksi 50 Tahun)"],
  },

  components: {
    superstructure: [
      {
        name: "Struktur Atas",
        type: "Rangka Baja",
        value: 3,
      },
      {
        name: "Sistem Lantai",
        type: "Aspal",
        value: 2,
      },
      {
        name: "Perlengkapan (Sandaran, Railing, Pipa Cucuran)",
        type: "Beton dan Pas. Bata",
        value: 1,
      },
    ],

    substructure: [
      {
        name: "Abutmen/Pilar",
        type: "Beton Bertulang",
        value: 0,
      },
      {
        name: "Pondasi",
        type: "Beton Bertulang",
        value: 0,
      },
      {
        name: "Dinding Penahan",
        type: "Pasangan Batu",
        value: 0,
      },
    ],
  },

  model: {
    mainAssetId: 6195655,
  },

  photos: [
    {
    title: "Foto Jembatan Sardjito 1",
    url: r2Asset("landscape/sardjito.JPG"),
  },
  ],

  documents: [
    {
      title: "Dokumen Teknis Jembatan Sardjito",
      type: "pdf",
      url: r2Asset("Jembatan Sardjito.pdf", "data"),
    },
    {
      title: "Data DWG Jembatan Sardjito",
      type: "zip",
      url: r2Asset("jembatan_sardjito.zip", "data"),
    },
  ],
};
