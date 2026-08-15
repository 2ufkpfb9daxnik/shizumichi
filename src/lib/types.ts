export type LatLng = {
  lat: number;
  lng: number;
};

export type RouteId = "shortest" | "balance" | "quiet";

export type SoundType = "cicada" | "train" | "car" | "construction";

export type Sensitivity = "standard" | "strong" | "very-strong";

export type Quietness = "low" | "mid" | "high";

export type NoiseLevel = "low" | "mid" | "mid-high" | "high";

export type AppPhase = "idle" | "searching" | "compare" | "navigate" | "arrived";

export type NavCue = {
  /** 0–1 along the selected route */
  at: number;
  text: string;
  notice?: boolean;
};

export type DemoRoute = {
  id: RouteId;
  name: string;
  color: string;
  dashArray: string;
  durationMin: number;
  distanceLabel: string;
  distanceMeters: number;
  noiseScore: number;
  quietness: Quietness;
  extraLabel: string;
  extraValue: string;
  description: string;
  path: LatLng[];
  cues: NavCue[];
  arrivalNote: string;
};

export type NoiseSensor = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  score: number;
  level: NoiseLevel;
  sound: string;
};

export type PlaceMarker = {
  id: "home" | "library";
  name: string;
  lat: number;
  lng: number;
};
