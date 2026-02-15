/**
 * 太陽位置計算ユーティリティ
 * 地軸の傾き（デフォルト23.4度）による昼夜の長さの変化を計算する
 */

/** 地軸の傾きのデフォルト値（度） */
export const AXIAL_TILT_DEFAULT = 23.4;

/** @deprecated Use AXIAL_TILT_DEFAULT instead */
export const AXIAL_TILT = AXIAL_TILT_DEFAULT;

/**
 * 年間の日数から太陽赤緯（度）を計算する
 * 太陽赤緯 = 太陽が天の赤道からどれだけ傾いているか
 * @param dayOfYear 1月1日からの日数 (1-366)
 * @param axialTilt 地軸の傾き（度）。デフォルトは23.4°
 * @returns 太陽赤緯（度）
 */
export function solarDeclination(
  dayOfYear: number,
  axialTilt: number = AXIAL_TILT_DEFAULT
): number {
  // 夏至（約172日目）で最大値(+tilt°)、冬至（約355日目）で最小値(-tilt°)
  return axialTilt * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81));
}

/**
 * ある緯度における昼間の長さ（時間）を計算する
 * @param latitude 緯度（度、北緯が正）
 * @param dayOfYear 1月1日からの日数 (1-366)
 * @param axialTilt 地軸の傾き（度）。デフォルトは23.4°
 * @returns 昼間の長さ（時間）
 */
export function daylightHours(
  latitude: number,
  dayOfYear: number,
  axialTilt: number = AXIAL_TILT_DEFAULT
): number {
  const decl = solarDeclination(dayOfYear, axialTilt);
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
 * @param axialTilt 地軸の傾き（度）。デフォルトは23.4°
 * @returns [経度, 緯度]
 */
export function subsolarPoint(
  dayOfYear: number,
  hourUTC: number = 12,
  axialTilt: number = AXIAL_TILT_DEFAULT
): [number, number] {
  const decl = solarDeclination(dayOfYear, axialTilt);
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

/**
 * ある緯度・日における太陽の南中高度（度）を計算する
 * 南中高度 = 90° - |緯度 - 太陽赤緯|
 * @param latitude 緯度（度、北緯が正）
 * @param dayOfYear 1月1日からの日数 (1-366)
 * @param axialTilt 地軸の傾き（度）。デフォルトは23.4°
 * @returns 南中高度（度）。0未満の場合は0（太陽が昇らない）
 */
export function solarNoonAltitude(
  latitude: number,
  dayOfYear: number,
  axialTilt: number = AXIAL_TILT_DEFAULT
): number {
  const decl = solarDeclination(dayOfYear, axialTilt);
  const altitude = 90 - Math.abs(latitude - decl);
  return Math.max(0, Math.min(90, altitude));
}

/**
 * 地軸の傾きに基づいて回帰線の緯度を返す
 * @param axialTilt 地軸の傾き（度）
 * @returns 回帰線の緯度（正の値）
 */
export function tropicLatitude(
  axialTilt: number = AXIAL_TILT_DEFAULT
): number {
  return axialTilt;
}

/**
 * 地軸の傾きに基づいて極圏の緯度を返す
 * @param axialTilt 地軸の傾き（度）
 * @returns 極圏の緯度（正の値）
 */
export function arcticCircleLatitude(
  axialTilt: number = AXIAL_TILT_DEFAULT
): number {
  return 90 - axialTilt;
}

/** 代表的な緯度のプリセット（地軸の傾きに応じた動的生成） */
export function getLatitudePresets(axialTilt: number = AXIAL_TILT_DEFAULT) {
  const tropic = tropicLatitude(axialTilt);
  const arctic = arcticCircleLatitude(axialTilt);
  return [
    { label: `北極圏 (${arctic.toFixed(1)}°N)`, value: arctic },
    { label: "北緯45° (札幌付近)", value: 45 },
    { label: `北回帰線 (${tropic.toFixed(1)}°N)`, value: tropic },
    { label: "赤道 (0°)", value: 0 },
    { label: `南回帰線 (${tropic.toFixed(1)}°S)`, value: -tropic },
    { label: "南緯45°", value: -45 },
    { label: `南極圏 (${arctic.toFixed(1)}°S)`, value: -arctic },
  ];
}

/** @deprecated Use getLatitudePresets(axialTilt) instead */
export const LATITUDE_PRESETS = getLatitudePresets(AXIAL_TILT_DEFAULT);
