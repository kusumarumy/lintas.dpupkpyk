import type { BridgeData } from "./types";
import { r2Asset } from "@/lib/assets";
export const tamansariBaru: BridgeData = {
  id: null,
  slug: "tamansariBaru",
  name: "Jembatan Tamansari Baru (Sugeng Jeroni)",

  identity: {
    roadNumber: "N_3048",
    roadName:
      "Jl. Sugeng Jeroni (Sisi Barat) dan Jl. Sugeng Jeroni (Sisi Timur)",

    village: "Patangpuluhan",
    district: "Wirobrajan",
    city: "Kota Yogyakarta",

    latitude: -7.812283,
    longitude: 110.3520840,
    latitudeText: `7°48'44.22" LS`,
    longitudeText: `110°21'07.50" BT`,
    yearBuilt: 1980,
    operationalStatus: "Beroperasi",

    riverValue: 0,
    riverCondition: "Baik",
  },

  dimensions: {
    length: 51,
    width: 14.5,
    spans: 1,
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
      value: 3,
      note: "Rusak Berat",
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
    },
  ],

  currentCondition: {
    score: 2,
    condition: "Rusak Sedang",
    stability: "Tidak Mantap",
    handlingPlan: "Memerlukan Penanganan Segera",

    construction: "Rangka Baja",

    damage: [
      "Permukaan aspal sudah aus.",
    ],

    recommendations: [
      "Pelapisan permukaan aspal ulang.",
    ],
  },

  components: {
    superstructure: [
      {
        name: "Struktur Atas",
        type: "Rangka Baja",
        value: 0,
      },
      {
        name: "Sistem Lantai",
        type: "Aspal",
        value: 2,
      },
      {
        name: "Perlengkapan (Sandaran, Railing, Pipa Cucuran)",
        type: "Beton dan Pipa Baja",
        value: 0,
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
    //terrainAssetId: 4185927,
    //imageryAssetId: 4192817,

    mainAssetId: 6194297,

    //additionalAssetIds: [
   //   4203751,
   //   4203750,
   // ],

   // areaAssetId: 4203644,
    // riverAssetId: 4204061,
  },

  streetView: {
    embedUrl:
      "https://www.google.com/maps/embed?pb=!4v1795409312010!6m8!1m7!1stxeKHh9ivZNQVrHI50NFVw!2m2!1d-7.812248727251065!2d110.3518873606307!3f103.93489089806391!4f-4.8826376279177595!5f0.7820865974627469",

    mapillaryKey: "1381192707067192",
  },

  photos: [
  {
    title: "Foto Jembatan Tamansari Baru 1",
    url: r2Asset("landscape/tamansaribaru_1.JPG"),
  },
     {
    title: "Foto Jembatan Tamansari Baru 2",
    url: r2Asset("landscape/tamansaribaru_2.JPG"),
  },
     {
    title: "Foto Jembatan Tamansari Baru 3",
    url: r2Asset("landscape/tamansaribaru_3.JPG"),
  },
     {
    title: "Foto Jembatan Tamansari Baru 4",
    url: r2Asset("landscape/tamansaribaru_4.JPG"),
  },
],

documents: [
  {
    title: "Dokumen Teknis Jembatan Tamansari Baru",
    type: "pdf",
    url: r2Asset("Jembatan Taman Sari Baru.pdf.pdf", "data"),
  },
  {
    title: "Data DWG Jembatan Tamansari Baru",
    type: "zip",
    url: r2Asset("jembatan_taman_sari_baru.zip", "data"),
  },
  {
    title: "Peta Planimetris Jembatan Tamansari Baru",
    type: "pdf",
    url: r2Asset("Peta Planimetris Jembatan Kewek.pdf", "data"),
  },
  {
    title: "Data Kontur Jembatan Tamansari Baru",
    type: "zip",
    url: r2Asset("kontur_kewek.zip", "data"),
  },
],
};
