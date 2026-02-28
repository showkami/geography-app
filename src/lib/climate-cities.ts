import { CityLocation } from "./climate-types";

export const CITY_COLORS = [
  "#e53935", // red
  "#1e88e5", // blue
  "#43a047", // green
  "#fb8c00", // orange
  "#8e24aa", // purple
  "#00acc1", // cyan
  "#6d4c41", // brown
  "#546e7a", // blue-grey
] as const;

export const MAX_CITIES = 8;

export interface PresetCity {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

/** 主要な気候帯を網羅するプリセット都市 */
export const PRESET_CITIES: PresetCity[] = [
  { name: "東京", country: "日本", latitude: 35.68, longitude: 139.69 },
  { name: "シンガポール", country: "シンガポール", latitude: 1.29, longitude: 103.85 },
  { name: "カイロ", country: "エジプト", latitude: 30.04, longitude: 31.24 },
  { name: "ロンドン", country: "イギリス", latitude: 51.51, longitude: -0.13 },
  { name: "モスクワ", country: "ロシア", latitude: 55.76, longitude: 37.62 },
  { name: "ローマ", country: "イタリア", latitude: 41.89, longitude: 12.50 },
  { name: "バロー", country: "アメリカ", latitude: 71.29, longitude: -156.79 },
  { name: "ナイロビ", country: "ケニア", latitude: -1.29, longitude: 36.82 },
];

export function makeCityId(lat: number, lon: number): string {
  return `${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

export function assignColor(index: number): string {
  return CITY_COLORS[index % CITY_COLORS.length];
}
