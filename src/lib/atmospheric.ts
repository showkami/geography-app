/**
 * 大気大循環の計算ユーティリティ
 * 気圧帯・風系・循環セル・ITCZの季節移動に関する関数とデータ
 */

import { solarDeclination } from "./solar";

// --- 循環セル定義 ---

export type CellId = "hadley" | "ferrel" | "polar";
export type PressureZoneId = "itcz" | "subtropical_high" | "subpolar_low" | "polar_high";
export type WindZoneId = "trade" | "westerly" | "polar_easterly";
export type TopicId = CellId | "coriolis" | "itcz_migration";

export interface CellDefinition {
  id: CellId;
  name: string;
  latRange: [number, number];
  direction: "direct" | "indirect";
  color: string;
  surfaceWind: string;
  upperWind: string;
}

export interface PressureZone {
  id: PressureZoneId;
  name: string;
  baseLat: number;
  type: "low" | "high";
  color: string;
}

export interface WindZone {
  id: WindZoneId;
  name: string;
  latRange: [number, number];
  directionNH: number;
  directionSH: number;
  color: string;
}

export const CELLS: CellDefinition[] = [
  {
    id: "hadley",
    name: "ハドレー循環",
    latRange: [0, 30],
    direction: "direct",
    color: "#ef5350",
    surfaceWind: "貿易風（赤道方向）",
    upperWind: "高層では極方向に流れ、亜熱帯で下降",
  },
  {
    id: "ferrel",
    name: "フェレル循環",
    latRange: [30, 60],
    direction: "indirect",
    color: "#42a5f5",
    surfaceWind: "偏西風（極方向）",
    upperWind: "高層では赤道方向に流れる間接循環",
  },
  {
    id: "polar",
    name: "極循環",
    latRange: [60, 90],
    direction: "direct",
    color: "#ab47bc",
    surfaceWind: "極偏東風（赤道方向）",
    upperWind: "高層では極方向に流れ、極で下降",
  },
];

export const PRESSURE_ZONES: PressureZone[] = [
  { id: "itcz", name: "赤道低圧帯（ITCZ）", baseLat: 0, type: "low", color: "#ef5350" },
  { id: "subtropical_high", name: "亜熱帯高圧帯", baseLat: 30, type: "high", color: "#ff9800" },
  { id: "subpolar_low", name: "亜極低圧帯", baseLat: 60, type: "low", color: "#42a5f5" },
  { id: "polar_high", name: "極高圧帯", baseLat: 90, type: "high", color: "#ab47bc" },
];

export const WIND_ZONES: WindZone[] = [
  { id: "trade", name: "貿易風", latRange: [0, 30], directionNH: 225, directionSH: 315, color: "#ef5350" },
  { id: "westerly", name: "偏西風", latRange: [30, 60], directionNH: 225, directionSH: 315, color: "#42a5f5" },
  { id: "polar_easterly", name: "極偏東風", latRange: [60, 90], directionNH: 45, directionSH: 135, color: "#ab47bc" },
];

// --- ITCZ 季節移動 ---

/**
 * 通日からITCZの緯度位置を計算する。
 * 太陽赤緯を追従するが、振幅は抑制され遅延がある。
 * 海洋の熱慣性を反映して、実際のITCZは太陽赤緯の約40-60%の振幅で移動する。
 */
export function itczLatitude(dayOfYear: number): number {
  const decl = solarDeclination(dayOfYear);
  const lagDays = 25;
  const laggedDecl = solarDeclination(dayOfYear - lagDays);

  // 全球平均のITCZは年平均で北半球側に偏るため、定数オフセットを加える。
  // また、太陽赤緯に対する応答振幅は抑制して過大な南北移動を避ける。
  const meanNorthBias = 2.5;
  const lat = laggedDecl * 0.22 + decl * 0.08 + meanNorthBias;
  return Math.max(-6, Math.min(14, lat));
}

/**
 * 通日から各気圧帯の実効緯度を計算する（ITCZ移動に連動）。
 * 気圧帯全体がITCZの移動に伴い南北にシフトする。
 */
export function getPressureZoneLatitude(zone: PressureZone, dayOfYear: number): number {
  const itczShift = itczLatitude(dayOfYear);
  const dampingFactor = 1 - zone.baseLat / 120;
  return zone.baseLat + itczShift * dampingFactor;
}

/**
 * 通日から循環セルの境界緯度を計算する。
 * 太陽直射点の季節移動に伴い、気圧帯パターン全体が同じ方向に南北シフトする。
 * ITCZが最も大きく移動し、高緯度の境界ほど移動幅は小さい。
 * NH/SH を分けて返す（両半球とも同方向にシフトさせるため）。
 */
export interface CellBoundaries {
  itczLat: number;
  nhSubtropicalLat: number;
  shSubtropicalLat: number;
  nhSubpolarLat: number;
  shSubpolarLat: number;
}

export function getCellBoundaries(dayOfYear: number): CellBoundaries {
  const itcz = itczLatitude(dayOfYear);
  const subtropicalShift = itcz * 0.4;
  const subpolarShift = itcz * 0.2;
  return {
    itczLat: itcz,
    nhSubtropicalLat: 30 + subtropicalShift,
    shSubtropicalLat: -30 + subtropicalShift,
    nhSubpolarLat: 60 + subpolarShift,
    shSubpolarLat: -60 + subpolarShift,
  };
}

/**
 * 通日と緯度から地表風の方向（度、北が0、時計回り）を計算する。
 * コリオリの力による偏向を含む。
 */
export function surfaceWindDirection(latitude: number, dayOfYear: number): number {
  const itczLat = itczLatitude(dayOfYear);
  const isNH = latitude >= itczLat;
  const absDistFromITCZ = Math.abs(latitude - itczLat);

  if (absDistFromITCZ < 30) {
    // 貿易風帯: 赤道に向かう風 + コリオリ偏向
    return isNH ? 225 : 315;
  } else if (absDistFromITCZ < 60) {
    // 偏西風帯
    return isNH ? 45 : 135;
  } else {
    // 極偏東風帯
    return isNH ? 225 : 315;
  }
}


export const MONTH_NAMES_JA = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

/**
 * 月（1-12）を通日（月の中間日）に変換する
 */
export function monthToDayOfYear(month: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let doy = 0;
  for (let i = 0; i < month - 1; i++) {
    doy += daysInMonth[i];
  }
  return doy + Math.floor(daysInMonth[month - 1] / 2);
}
