import type { BridgeData } from "./types";
import { r2Asset } from "@/lib/assets";

export const winongSelatan: BridgeData = {
  id: 51,
  slug: "winong-selatan",
  name: "Jembatan Winong Selatan",

  identity: {
    roadNumber: "N_2133",
    roadName: "Jl. Perintis Kemerdekaan (Sisi Barat) dan Jl. Ngeksigondo (Sisi Timur)",
    village: "Pandeyan",
    district: "Umbulharjo",
    city: "Kota Yogyakarta",
    latitude: -7.8190662,
    longitude: 110.3945639,
    latitudeText: `-7°49'8.30" LS`,
    longitudeText: `110°23'40.43" BT`,
    yearBuilt: 1984,
    operationalStatus: "Beroperasi",
    riverValue: 1,
    riverCondition: "Rusak Ringan",
  },

  dimensions: {
    length: 67.4,
    width: 8.55,
    spans: 3,
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
    stability: "Tidak Mantap",
    handlingPlan: "Memerlukan Perbaikan Secepatnya Dalam 1 Tahun",
    construction: "Baja Komposit",
    damage: [
      "Plat lantai beton mengelupas",
      "Baja tulangan mengalami korosi",
    ],
    recommendations: [
      "Penggantian plat lantai",
      "Penggantian baja tulangan yang mengalami kerusakan",
    ],
  },

  components: {
    superstructure: [
      { name: "Struktur Atas", type: "Baja Komposit", value: 3 },
      { name: "Sistem Lantai", type: "Aspal", value: 2 },
      { name: "Perlengkapan (Sandaran, Railing, Pipa Cucuran)", type: "Beton dan Pasangan Batu", value: 1 },
    ],
    substructure: [
      { name: "Abutmen/Pilar", type: "Beton Bertulang", value: 0 },
      { name: "Pondasi", type: "Beton", value: 0 },
      { name: "Dinding Penahan", type: "Pasangan Batu", value: 0 },
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
      "https://www.google.com/maps/embed?pb=!4v1764652897003!6m8!1m7!1stBWLlctCV6nCEm2MzBpcoA!2m2!1d-7.81906620231961!2d110.3948560421717!3f257.61020601729!4f-0.6113906229958559!5f0.40023029412639716",
  },

  photos: [
    { title: "Foto Jembatan Winong Selatan - Atas", url: r2Asset("atas.jpg") },
    { title: "Foto Jembatan Winong Selatan - Bawah", url: r2Asset("bawah.jpg") },
    { title: "Foto Jembatan Winong Selatan - Kanan", url: r2Asset("kanan.jpg") },
    { title: "Foto Jembatan Winong Selatan - Kiri", url: r2Asset("kiri.jpg") },
  ],

  documents: [
    { title: "Dokumen Teknis Jembatan Sisi Selatan", type: "pdf", url: r2Asset("Jembatan Perintis Kemerdekaan Sisi Selatan.pdf", "data") },
    { title: "Data DWG Jembatan Winong Selatan", type: "zip", url: r2Asset("jembatan_winong_selatan.zip", "data") },
    { title: "Peta Planimetris Jembatan Winong", type: "pdf", url: r2Asset("Peta Planimetris Jembatan Winong.pdf", "data") },
    { title: "Data Kontur Jembatan Winong", type: "zip", url: r2Asset("kontur_kemerdekaan.zip", "data") },
  ],
};