import type { BridgeData } from "./types";
import { r2Asset } from "@/lib/assets";

export const sardjito: BridgeData = {
  id: null,
  slug: "sardjito",
  name: "Jembatan Sardjito",

  identity: {
    roadNumber: "N_1138",
    roadName: "Jembatan Sardjito",
    village: "Cokrodiningratan ",
    district: "Jetis",
    city: "Kota Yogyakarta",

    // Titik tengah bounding envelope CityGML
    latitude: -7.7784538073,
    longitude: 110.3705295862,

    latitudeText: `-7°46'42.43" LS`,
    longitudeText: `110°22'13.91" BT`,

    yearBuilt: null,
    operationalStatus: "Beroperasi",
    riverValue: 3,
    riverCondition: "Rusak Berat",
  },

  dimensions: {
    length: 62,
    width: 8.9,
    spans: 1,
  },

  history: [],

  currentCondition: {
    score: 3,
    condition: "Rusak Berat",
    stability: "",
    handlingPlan: "Memerlukan Perbaikan Secepatnya Dalam 1 tahun",
    construction: "",
    damage: [],
    recommendations: [],
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
    mainAssetId: 6194239,
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
