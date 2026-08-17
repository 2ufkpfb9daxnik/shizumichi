import type { DemoRoute, LatLng, NoiseSensor, PlaceMarker, RouteId } from "../types";

/** 撮影用に地図の見え方を固定する（東京都杉並区・蚕糸の森公園周辺） */
export const MAP_CENTER: LatLng = { lat: 35.6959, lng: 139.6569 };
export const MAP_ZOOM = 16;

export const HOME: PlaceMarker = {
  id: "home",
  name: "自宅",
  lat: 35.694322,
  lng: 139.654932,
};

export const LIBRARY: PlaceMarker = {
  id: "library",
  name: "市立ひだまり図書館",
  lat: 35.697696,
  lng: 139.659859,
};

export const SOUND_OPTIONS: { id: "cicada" | "train" | "car" | "construction"; label: string }[] = [
  { id: "cicada", label: "蝉" },
  { id: "train", label: "電車" },
  { id: "car", label: "自動車" },
  { id: "construction", label: "工事" },
];

export const SENSITIVITY_OPTIONS: { id: "standard" | "strong" | "very-strong"; label: string }[] = [
  { id: "standard", label: "標準" },
  { id: "strong", label: "強め" },
  { id: "very-strong", label: "とても強い" },
];

export const SEARCH_DELAY_MS = 1000;
export const NAV_DURATION_MS = 30000;

export const SAMPLE_NOTE = "提案検証用画面です。目的地・経路評価・騒音情報はサンプルデータです。";

/** 公園外周の簡略ポリゴン（OSM の公園境界に沿う） */
export const PARK_POLYGON: LatLng[] = [
  { lat: 35.697917, lng: 139.655705 },
  { lat: 35.697921, lng: 139.657059 },
  { lat: 35.697905, lng: 139.657510 },
  { lat: 35.697892, lng: 139.657905 },
  { lat: 35.697676, lng: 139.657903 },
  { lat: 35.697539, lng: 139.657852 },
  { lat: 35.696351, lng: 139.658119 },
  { lat: 35.696194, lng: 139.656428 },
  { lat: 35.696323, lng: 139.655345 },
  { lat: 35.697136, lng: 139.655525 },
  { lat: 35.697771, lng: 139.655650 },
];

/** 青梅街道（東高円寺駅付近）の騒音帯 */
export const RAIL_CORRIDOR: LatLng[] = [
  { lat: 35.69805, lng: 139.65600 },
  { lat: 35.69807, lng: 139.65679 },
  { lat: 35.69806, lng: 139.65771 },
  { lat: 35.69801, lng: 139.65811 },
  { lat: 35.69796, lng: 139.65846 },
  { lat: 35.69785, lng: 139.65931 },
  { lat: 35.69778, lng: 139.65979 },
];

export const SENSORS: NoiseSensor[] = [
  {
    id: "park",
    name: "公園沿い",
    lat: 35.69655,
    lng: 139.65735,
    score: 78,
    level: "high",
    sound: "蝉",
  },
  {
    id: "rail",
    name: "線路沿い",
    lat: 35.69802,
    lng: 139.65815,
    score: 66,
    level: "mid-high",
    sound: "電車",
  },
  {
    id: "town",
    name: "住宅街",
    lat: 35.69448,
    lng: 139.65605,
    score: 34,
    level: "low",
    sound: "生活音",
  },
];

const SHORTEST_PATH: LatLng[] = [
  { lat: 35.694322, lng: 139.654932 },
  { lat: 35.694336, lng: 139.655035 },
  { lat: 35.694440, lng: 139.655264 },
  { lat: 35.694511, lng: 139.655774 },
  { lat: 35.694693, lng: 139.656007 },
  { lat: 35.694795, lng: 139.656273 },
  { lat: 35.694994, lng: 139.656256 },
  { lat: 35.695467, lng: 139.656201 },
  { lat: 35.695738, lng: 139.656180 },
  { lat: 35.695989, lng: 139.656154 },
  { lat: 35.696222, lng: 139.656160 },
  { lat: 35.696210, lng: 139.656231 },
  { lat: 35.696178, lng: 139.656341 },
  { lat: 35.696171, lng: 139.656425 },
  { lat: 35.696192, lng: 139.656556 },
  { lat: 35.696211, lng: 139.656680 },
  { lat: 35.696200, lng: 139.656823 },
  { lat: 35.696234, lng: 139.656965 },
  { lat: 35.696254, lng: 139.657075 },
  { lat: 35.696239, lng: 139.657251 },
  { lat: 35.696266, lng: 139.657392 },
  { lat: 35.696284, lng: 139.657528 },
  { lat: 35.696274, lng: 139.657685 },
  { lat: 35.696310, lng: 139.657856 },
  { lat: 35.696324, lng: 139.658009 },
  { lat: 35.696351, lng: 139.658119 },
  { lat: 35.696469, lng: 139.658070 },
  { lat: 35.696585, lng: 139.658021 },
  { lat: 35.696727, lng: 139.657938 },
  { lat: 35.696850, lng: 139.657910 },
  { lat: 35.696964, lng: 139.657894 },
  { lat: 35.697072, lng: 139.657837 },
  { lat: 35.697165, lng: 139.657815 },
  { lat: 35.697296, lng: 139.657857 },
  { lat: 35.697433, lng: 139.657879 },
  { lat: 35.697543, lng: 139.657870 },
  { lat: 35.697674, lng: 139.657925 },
  { lat: 35.697817, lng: 139.657950 },
  { lat: 35.697960, lng: 139.657913 },
  { lat: 35.69796, lng: 139.65846 },
  { lat: 35.69791, lng: 139.65880 },
  { lat: 35.69785, lng: 139.65931 },
  { lat: 35.69778, lng: 139.65979 },
  { lat: 35.697696, lng: 139.659859 },
];

const BALANCE_PATH: LatLng[] = [
  { lat: 35.694322, lng: 139.654932 },
  { lat: 35.694337, lng: 139.654630 },
  { lat: 35.694371, lng: 139.654471 },
  { lat: 35.694383, lng: 139.654413 },
  { lat: 35.69459, lng: 139.65435 },
  { lat: 35.69553, lng: 139.65438 },
  { lat: 35.69611, lng: 139.65444 },
  { lat: 35.69734, lng: 139.65464 },
  { lat: 35.69770, lng: 139.65470 },
  { lat: 35.69800, lng: 139.65471 },
  { lat: 35.69805, lng: 139.65481 },
  { lat: 35.69806, lng: 139.65535 },
  { lat: 35.69807, lng: 139.65600 },
  { lat: 35.69807, lng: 139.65679 },
  { lat: 35.69806, lng: 139.65771 },
  { lat: 35.69801, lng: 139.65811 },
  { lat: 35.69796, lng: 139.65846 },
  { lat: 35.69791, lng: 139.65880 },
  { lat: 35.69785, lng: 139.65931 },
  { lat: 35.69778, lng: 139.65979 },
  { lat: 35.697696, lng: 139.659859 },
];

const QUIET_PATH: LatLng[] = [
  { lat: 35.694322, lng: 139.654932 },
  { lat: 35.694336, lng: 139.655035 },
  { lat: 35.694440, lng: 139.655264 },
  { lat: 35.694511, lng: 139.655774 },
  { lat: 35.694693, lng: 139.656007 },
  { lat: 35.694795, lng: 139.656273 },
  { lat: 35.694839, lng: 139.656430 },
  { lat: 35.694904, lng: 139.656705 },
  { lat: 35.694901, lng: 139.656882 },
  { lat: 35.694850, lng: 139.657225 },
  { lat: 35.694712, lng: 139.657519 },
  { lat: 35.694757, lng: 139.657751 },
  { lat: 35.694753, lng: 139.658043 },
  { lat: 35.694702, lng: 139.658295 },
  { lat: 35.694598, lng: 139.658511 },
  { lat: 35.694772, lng: 139.658635 },
  { lat: 35.694926, lng: 139.658716 },
  { lat: 35.694644, lng: 139.658955 },
  { lat: 35.694520, lng: 139.659061 },
  { lat: 35.69466, lng: 139.65947 },
  { lat: 35.695225, lng: 139.659681 },
  { lat: 35.69580, lng: 139.65901 },
  { lat: 35.696054, lng: 139.658976 },
  { lat: 35.696436, lng: 139.658926 },
  { lat: 35.696493, lng: 139.659682 },
  { lat: 35.696542, lng: 139.660032 },
  { lat: 35.696593, lng: 139.660325 },
  { lat: 35.696957, lng: 139.660158 },
  { lat: 35.697160, lng: 139.660056 },
  { lat: 35.697350, lng: 139.659976 },
  { lat: 35.697645, lng: 139.659866 },
  { lat: 35.697696, lng: 139.659859 },
];

function stitchLatLngPaths(segments: LatLng[][]): LatLng[] {
  const out: LatLng[] = [];
  for (const segment of segments) {
    for (const point of segment) {
      const last = out[out.length - 1];
      if (!last || last.lat !== point.lat || last.lng !== point.lng) {
        out.push(point);
      }
    }
  }
  return out;
}

/** 録音デモ用の歩行パス（画面上には出さない・住宅街の実在道路に沿う） */
export const RECORDING_DEMO_PATH: LatLng[] = stitchLatLngPaths([
  QUIET_PATH.slice(0, 19),
  QUIET_PATH.slice(7, 19).reverse(),
  QUIET_PATH.slice(4, 13),
]);

export const ROUTES: DemoRoute[] = [
  {
    id: "shortest",
    name: "最短ルート",
    color: "#d4524a",
    dashArray: "",
    durationMin: 12,
    distanceLabel: "850m",
    distanceMeters: 850,
    noiseScore: 82,
    quietness: "low",
    extraLabel: "蝉の多い区間",
    extraValue: "約230m",
    description: "最も早く到着しますが、蝉の多い公園沿いを通ります。",
    path: SHORTEST_PATH,
    cues: [
      { at: 0.08, text: "120m先を右折します" },
      { at: 0.28, text: "この先に騒音が予想される区間があります", notice: true },
      { at: 0.42, text: "この先に騒音スコアの高い区間があります", notice: true },
      { at: 0.88, text: "まもなく目的地です" },
    ],
    arrivalNote: "最短ルートで到着しました。公園沿いの騒音区間を通過しています。",
  },
  {
    id: "balance",
    name: "バランスルート",
    color: "#d8891a",
    dashArray: "14, 9",
    durationMin: 14,
    distanceLabel: "930m",
    distanceMeters: 930,
    noiseScore: 49,
    quietness: "mid",
    extraLabel: "騒音区間",
    extraValue: "約90m",
    description: "公園を避け、時間と静かさのバランスを取った経路です。",
    path: BALANCE_PATH,
    cues: [
      { at: 0.1, text: "120m先を右折します" },
      { at: 0.36, text: "住宅街の比較的静かな区間を移動中です" },
      { at: 0.58, text: "この先に騒音が予想される区間があります", notice: true },
      { at: 0.66, text: "この先に騒音スコアの高い区間があります", notice: true },
      { at: 0.9, text: "まもなく目的地です" },
    ],
    arrivalNote: "バランスルートで到着しました。公園は避け、大通り沿いを短時間通過しています。",
  },
  {
    id: "quiet",
    name: "静音ルート",
    color: "#1f7a66",
    dashArray: "5, 9",
    durationMin: 16,
    distanceLabel: "970m",
    distanceMeters: 970,
    noiseScore: 24,
    quietness: "high",
    extraLabel: "遠回り",
    extraValue: "約4分",
    description: "約4分遠回りして、騒音の大きい区間をできるだけ避けます。",
    path: QUIET_PATH,
    cues: [
      { at: 0.08, text: "120m先を右折します" },
      { at: 0.22, text: "公園沿いを避ける経路を移動しています" },
      { at: 0.4, text: "住宅街の比較的静かな区間を移動中です" },
      { at: 0.88, text: "まもなく目的地です" },
    ],
    arrivalNote: "騒音の大きい公園沿いを避けて移動しました。",
  },
];

export const ROUTE_ORDER: RouteId[] = ["shortest", "balance", "quiet"];

export function getRoute(id: RouteId): DemoRoute {
  return ROUTES.find((r) => r.id === id) ?? ROUTES[2];
}

export const LEVEL_LABEL: Record<NoiseSensor["level"], string> = {
  low: "低",
  mid: "中",
  "mid-high": "中から高",
  high: "高",
};

export const QUIETNESS_LABEL: Record<DemoRoute["quietness"], string> = {
  low: "低",
  mid: "中",
  high: "高",
};
