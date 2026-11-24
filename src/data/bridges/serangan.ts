import type { BridgeData } from "./types";
import { r2Asset } from "@/lib/assets";

export const serangan: BridgeData = {
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

    yearBuilt: 0,
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
      note: "Rusak Sedang",
    },
    {
      year: 2021,
      value: 2,
      note: "Rusak Sedang",
    },
    {
      year: 2022,
      value: 2,
      note: "Rusak Sedang",
    },
    {
      year: 2023,
      value: 2,
      note: "Rusak Sedang",
    },
    {
      year: 2024,
      value: 2,
      note: "Rusak Sedang",
    },],

  currentCondition: {
    score: 2,
    condition: "Rusak Sedang",
    stability: "",
    handlingPlan: "",
    construction: "",
    damage: [""],
    recommendations: [""],
  },

  components: {
    superstructure: [
      {
        name: "Struktur Atas",
        type: "",
        value: 3,
      },
      {
        name: "Sistem Lantai",
        type: "",
        value: 2,
      },
      {
        name: "Perlengkapan (Sandaran, Railing, Pipa Cucuran)",
        type: "",
        value: 1,
      },
    ],

    substructure: [
      {
        name: "Abutmen/Pilar",
        type: "",
        value: 0,
      },
      {
        name: "Pondasi",
        type: "",
        value: 0,
      },
      {
        name: "Dinding Penahan",
        type: "",
        value: 0,
      },
    ],
  },

  model: {
    mainAssetId: 6195655,
  },

  photos: [
    {
    title: "Foto Jembatan Serangan 1",
    url: r2Asset("landscape/serangan.jpg"),
  },
  ],

  documents: [
    {
      title: "Dokumen Teknis Jembatan Serangan",
      type: "pdf",
      url: r2Asset("Jembatan Serangan.pdf", "data"),
    },
    {
      title: "Data DWG Jembatan Serangan",
      type: "zip",
      url: r2Asset("jembatan_serangan.zip", "data"),
    },
  ],
};
