
import type { BridgeData } from "./types";
import { r2Asset } from "@/lib/assets";

export const kleringan: BridgeData = {
  id: null,
  slug: "kleringan",
  name: "Jembatan Kleringan (Amarta)",

  identity: {
    roadNumber: "",
    roadName:
      "Jl. Kleringan (Sisi Barat) dan Jl. Abu Bakar Ali (Sisi Timur)",
    village: "Suryatmajan",
    district: "Danurejan",
    city: "Kota Yogyakarta",

    latitude: -7.7897333,
    longitude: 110.3687889,
    latitudeText: `7°47'23.04" LS`,
    longitudeText: `110°22'7.64" BT`,

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
    {
      year: 2020,
      value: null,
      note: "Data tidak tersedia",
    },
    {
      year: 2021,
      value: null,
      note: "Data tidak tersedia",
    },
    {
      year: 2022,
      value: null,
      note: "Data tidak tersedia",
    },
    {
      year: 2023,
      value: null,
      note: "Data tidak tersedia",
    },
    {
      year: 2024,
      value: 1,
      note: "Rusak Ringan",
    },
  ],

  currentCondition: {
    score: 1,
    condition: "",
    stability: "",
    handlingPlan: "Memerlukan Perbaikan Secara Rutin",
    construction: "Girder Prategang",

    damage: [
      "Pasangan batu depan abutmen sudah mulai tergerus",
    ],

    recommendations: [
      "Perbaikan pasangan batu",
    ],
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
    terrainAssetId: 4185927,
    imageryAssetId: 4192817,
    mainAssetId: 4203750,
    additionalAssetIds: [
      4203746,
      4203751,
    ],
    areaAssetId: 4203644,
    riverAssetId: 4204061,
  },

  streetView: {
    embedUrl:
      "https://www.google.com/maps/embed?pb=!4v1764649960523!6m8!1m7!1smv7cUeIXdt8w7fychvTMcg!2m2!1d-7.78967193928313!2d110.3685835948526!3f107.51989308770047!4f-5.50203027577561!5f0.7820865974627469",
    mapillaryKey: "420316100193524",
  },

  photos: [
    {
      title: "Foto Jembatan Kleringan 1",
      url: r2Asset("landscape/kleringan 1.jpg"),
    },
    {
      title: "Foto Jembatan Kleringan 2",
      url: r2Asset("landscape/kleringan 2.jpg"),
    },
    {
      title: "Foto Jembatan Kleringan 3",
      url: r2Asset("landscape/kleringan 3.jpg"),
    },
    {
      title: "Foto Jembatan Kleringan 4",
      url: r2Asset("landscape/kleringan 4.jpg"),
    },
  ],

  documents: [
    {
      title: "Dokumen Teknis Jembatan Kleringan",
      type: "pdf",
      url: r2Asset("Jembatan Kleringan.pdf"),
    },
    {
      title: "Data DWG Jembatan Kleringan",
      type: "zip",
      url: r2Asset("jembatan_kleringan.zip"),
    },
  ],
};
