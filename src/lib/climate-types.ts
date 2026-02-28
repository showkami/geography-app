/** 都市の位置情報 */
export interface CityLocation {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  color: string;
}

/** 月別気候平年値（各12要素） */
export interface MonthlyNormals {
  temperature: number[]; // [1月..12月] 月平均気温 (°C)
  precipitation: number[]; // [1月..12月] 月降水量 (mm)
}

/** ケッペン分類の判定基準 */
export interface KoppenCriterion {
  label: string;
  value: number;
  threshold: string;
  met: boolean;
}

/** ケッペン分類結果 */
export interface KoppenResult {
  code: string;
  nameJa: string;
  nameEn: string;
  group: string;
  description: string;
  criteria: KoppenCriterion[];
}

/** 都市ごとの気候データ（ロード状態含む） */
export interface CityClimateData {
  city: CityLocation;
  normals: MonthlyNormals | null;
  koppen: KoppenResult | null;
  loading: boolean;
  error: string | null;
}

/** Open-Meteo Geocoding APIのレスポンス */
export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  country: string;
  admin1?: string;
}

export const MONTH_NAMES_JA = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
] as const;
