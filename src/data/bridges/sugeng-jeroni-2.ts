
import type { BridgeData } from "./types";

export const sugengJeroni2: BridgeData = {
  id: null,
  slug: "sugeng-jeroni-2",
  name: "Jembatan Sugeng Jeroni 2",

  identity: {
    roadNumber: "",
    roadName: "Jembatan Sugeng Jeroni 2",

    village: "",
    district: "",
    city: "Kota Yogyakarta",

    // Isi dengan koordinat lokasi jembatan yang sebenarnya
    latitude: 0,
    longitude: 0,

    latitudeText: "",
    longitudeText: "",

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
    mainAssetId: 6194297,
  },

  photos: [],

  documents: [],
};
