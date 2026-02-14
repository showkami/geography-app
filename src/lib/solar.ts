/**
 * 太陽位置計算ユーティリティ
 * 地軸の傾き(23.4度)による昼夜の長さの変化を計算する
 */

/** 地軸の傾き（度） */
export const AXIAL_TILT = 23.4;

/**
 * 年間の日数から太陽赤緯（度）を計算する
 * 太陽赤緯 = 太陽が天の赤道からどれだけ傾いているか
 * @param dayOfYear 1月1日からの日数 (1-366)
 * @returns 太陽赤緯（度）
 */
export function solarDeclination(dayOfYear: number): number {
  // 夏至（約172日目）で最大値(+23.4°)、冬至（約355日目）で最小値(-23.4°)
  return AXIAL_TILT * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81));
}

/**
 * ある緯度における昼間の長さ（時間）を計算する
 * @param latitude 緯度（度、北緯が正）
 * @param dayOfYear 1月1日からの日数 (1-366)
 * @returns 昼間の長さ（時間）
 */
export function daylightHours(latitude: number, dayOfYear: number): number {
  const decl = solarDeclination(dayOfYear);
  const latRad = (latitude * Math.PI) / 180;
  const declRad = (decl * Math.PI) / 180;

  const cosHourAngle = -Math.tan(latRad) * Math.tan(declRad);

  // 白夜（常に昼）
  if (cosHourAngle < -1) return 24;
  // 極夜（常に夜）
  if (cosHourAngle > 1) return 0;

  const hourAngle = Math.acos(cosHourAngle);
  return (2 * hourAngle * 180) / Math.PI / 15;
}

/**
 * 太陽直下点の座標を計算する
 * @param dayOfYear 1月1日からの日数 (1-366)
 * @param hourUTC UTC時刻（0-24の小数）
 * @returns [経度, 緯度]
 */
export function subsolarPoint(
  dayOfYear: number,
  hourUTC: number = 12
): [number, number] {
  const decl = solarDeclination(dayOfYear);
  // 太陽直下点の経度 = 12時UTCのとき経度0度、1時間で15度西へ
  const lon = -(hourUTC - 12) * 15;
  return [lon, decl];
}

/**
 * 日付から年間の通算日を計算する
 * @param month 月 (1-12)
 * @param day 日 (1-31)
 * @returns 通算日 (1-366)
 */
export function dayOfYear(month: number, day: number): number {
  const date = new Date(2024, month - 1, day);
  const start = new Date(2024, 0, 1);
  return Math.floor((date.getTime() - start.getTime()) / 86400000) + 1;
}

/**
 * 通算日から月と日を返す
 * @param doy 通算日 (1-366)
 * @returns { month, day } 月(1-12)と日(1-31)
 */
export function doyToDate(doy: number): { month: number; day: number } {
  const date = new Date(2024, 0, doy);
  return { month: date.getMonth() + 1, day: date.getDate() };
}

/** 月名（日本語） */
export const MONTH_NAMES_JA = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

/** 代表的な緯度のプリセット */
export const LATITUDE_PRESETS = [
  { label: "北極圏 (66.5°N)", value: 66.5 },
  { label: "北緯45° (札幌付近)", value: 45 },
  { label: "北回帰線 (23.4°N)", value: 23.4 },
  { label: "赤道 (0°)", value: 0 },
  { label: "南回帰線 (23.4°S)", value: -23.4 },
  { label: "南緯45°", value: -45 },
  { label: "南極圏 (66.5°S)", value: -66.5 },
];
