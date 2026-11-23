import type { BridgeData } from "./types";
import { r2Asset } from "@/lib/assets";

export const sardjito: BridgeData = {
  id: null,
  slug: "sardjito",
  name: "Jembatan Sardjito",

  identity: {
    roadNumber: "",
    roadName: "Jembatan Sardjito",
    village: "Belum diisi",
    district: "Belum diisi",
    city: "Kota Yogyakarta",

    // Titik tengah bounding envelope CityGML
    latitude: -7.7784538073,
    longitude: 110.3705295862,

    latitudeText: `-7°46'42.43" LS`,
    longitudeText: `110°22'13.91" BT`,

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

  history: [],

  currentCondition: {
    score: null,
    condition: "",
    stability: "",
    handlingPlan: "",
    construction: "",
    damage: [],
    recommendations: [],
  },

  components: {
    superstructure: [
      {
        name: "Struktur Atas",
        type: "",
        value: null,
      },
      {
        name: "Sistem Lantai",
        type: "",
        value: null,
      },
      {
        name: "Perlengkapan (Sandaran, Railing, Pipa Cucuran)",
        type: "",
        value: null,
      },
    ],

    substructure: [
      {
        name: "Abutmen/Pilar",
        type: "",
        value: null,
      },
      {
        name: "Pondasi",
        type: "",
        value: null,
      },
      {
        name: "Dinding Penahan",
        type: "",
        value: null,
      },
    ],
  },

  model: {
    mainAssetId: 6194239,
  },

  photos: [
    {
    title: "Foto Jembatan Sardjito 1",
    url: r2Asset("landscape/sardjito.JPG"),
  },
  ],

  documents: [
    // Tambahkan dokumen teknis Sardjito dari Cloudflare R2 di sini
  ],
};
