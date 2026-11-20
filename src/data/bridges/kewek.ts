
import type { BridgeData } from "./types";
import { r2Asset } from "@/lib/assets";
export const kewek: BridgeData = {
  id: null,
  slug: "kewek",
  name: "Jembatan Kewek",

  identity: {
    roadNumber: "",
    roadName:
      "Jl. Abu Bakar Ali (Sisi Barat) dan Jl. Abu Bakar Ali (Sisi Utara)",

    village: "Suryatmajan",
    district: "Danurejan",
    city: "Kota Yogyakarta",

    latitude: -7.7905528,
    longitude: 110.3687139,

    latitudeText: `-7°47'25.99" LS`,
    longitudeText: `110°22'7.37" BT`,

    yearBuilt: 1924,
    operationalStatus: "Beroperasi",

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
      value: 3,
      note: "Rusak Berat",
    },
    {
      year: 2021,
      value: 3,
      note: "Rusak Berat",
    },
    {
      year: 2022,
      value: 2,
      note: "Rusak Sedang",
    },
    {
      year: 2023,
      value: 4,
      note: "Kritis",
    },
    {
      year: 2024,
      value: 4,
      note: "Kritis",
    },
  ],

  currentCondition: {
    score: null,
    condition: "",
    stability: "",
    handlingPlan: "",

    construction: "Balok T",

    damage: [
      "Keropos pada seluruh tumpuan balok beton",
      "Beton terkelupas",
      "Baja tulangan terlihat",
    ],

    recommendations: [
      "Penanganan sementara dilakukan dengan injeksi beton.",
      "Jembatan merupakan konstruksi lama.",
      "Untuk penanganan jangka panjang, disarankan penggantian jembatan.",
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
        name: "Perlengkapan",
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

    mainAssetId: 4203746,

    additionalAssetIds: [
      4203751,
      4203750,
    ],

    areaAssetId: 4203644,
    riverAssetId: 4204061,
  },

  streetView: {
    embedUrl:
      "https://www.google.com/maps/embed?pb=!4v1764650121688!6m8!1m7!1sLnuv7cdsRxWRwwmoDj43tA!2m2!1d-7.790499848189923!2d110.3688866896433!3f238.00851059391303!4f-10.73126729666403!5f0.7820865974627469",

    mapillaryKey: "420316100193524",
  },

  photos: [
  {
    title: "Foto Jembatan Kewek 1",
    url: r2Asset("landscape/kewek 3.jpg"),
  },
  {
    title: "Foto Jembatan Kewek 2",
    url: r2Asset("landscape/kewek 4.jpg"),
  },
],

documents: [
  {
    title: "Dokumen Teknis Jembatan Kewek",
    type: "pdf",
    url: r2Asset("Jembatan Kewek.pdf"),
  },
  {
    title: "Data DWG Jembatan Kewek",
    type: "zip",
    url: r2Asset("jembatan_kewek.zip"),
  },
  {
    title: "Peta Planimetris Jembatan Kewek",
    type: "pdf",
    url: r2Asset("Peta Planimetris Jembatan Kewek.pdf"),
  },
  {
    title: "Data Kontur Jembatan Kewek",
    type: "zip",
    url: r2Asset("kontur_kewek.zip"),
  },
],
};
