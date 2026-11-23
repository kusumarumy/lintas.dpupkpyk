
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
    latitudeText: `7Â°47'23.04" LS`,
    longitudeText: `110Â°22'7.64" BT`,

    yearBuilt: null,
    operationalStatus: "Beroperasi",
    riverValue: 1,
    riverCondition: "Rusak Ringan",
  },

  dimensions: {
    length: 36,
    width: 17,
    spans: 1,
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
    condition: "Rusak Ringan",
    stability: "Mantap",
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
        type: "Girder Prategang",
        value: 0,
      },
      {
        name: "Sistem Lantai",
        type: "Aspal",
        value: 1,
      },
      {
        name: "Perlengkapan (Sandaran, Railing, Pipa Cucuran)",
        type: "Beton",
        value: 1,
      },
    ],

    substructure: [
      {
        name: "Abutmen/Pilar",
        type: "Beton Bertulang",
        value: 1,
      },
      {
        name: "Pondasi",
        type: "Beton",
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
      url: r2Asset("Jembatan Kleringan.pdf", "data"),
    },
    {
      title: "Data DWG Jembatan Kleringan",
      type: "zip",
      url: r2Asset("jembatan_kleringan.zip", "data"),
    },
    {
      title: "Peta Planimetris Jembatan Kleringan",
      type: "pdf",
      url: r2Asset("Peta Planimetris Jembatan Kewek.pdf", "data"),
    },
   {
    title: "Data Kontur Jembatan Kleringan",
    type: "zip",
    url: r2Asset("kontur_kewek.zip", "data"),
   },
  ],
};
