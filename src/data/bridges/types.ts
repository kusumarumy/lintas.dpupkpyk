export type ConditionValue = 0 | 1 | 2 | 3 | 4 | 5;

export interface BridgeConditionHistory {
  year: number;
  value: ConditionValue | null;
  note?: string;
}

export interface BridgeComponent {
  name: string;
  type: string;
  value: ConditionValue | null;
}

export interface BridgeDocument {
  title: string;
  type: "pdf" | "dwg" | "zip" | "other";
  url: string;
}

export interface BridgePhoto {
  title: string;
  url: string;
  year?: number;
  description?: string;
}

export interface BridgeModel {
  terrainAssetId?: number;
  imageryAssetId?: number;
  mainAssetId?: number;
  areaAssetId?: number;
  riverAssetId?: number;
  additionalAssetIds?: number[];
}

export interface BridgeData {
  id: number | null;
  slug: string;
  name: string;

  identity: {
    roadNumber: string;
    roadName: string;
    village: string;
    district: string;
    city: string;
    latitude: number;
    longitude: number;
    latitudeText: string;
    longitudeText: string;
    yearBuilt: number | null;
    operationalStatus: string;
    riverValue: number | null;
    riverCondition: string;
  };

  dimensions: {
    length: number | null;
    width: number | null;
    spans: number | null;
  };

  history: BridgeConditionHistory[];

  currentCondition: {
    score: ConditionValue | null;
    condition: string;
    stability: string;
    handlingPlan: string;
    construction: string;
    damage: string[];
    recommendations: string[];
  };

  components: {
    superstructure: BridgeComponent[];
    substructure: BridgeComponent[];
  };

  model: BridgeModel;

  streetView?: {
    embedUrl?: string;
    mapillaryKey?: string;
  };

  photos: BridgePhoto[];
  documents: BridgeDocument[];
}