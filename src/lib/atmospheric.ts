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

// --- 解説テキスト ---

export interface TopicInfo {
  id: TopicId;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  color: string;
  icon: string;
}

export const TOPIC_INFO: Record<TopicId, TopicInfo> = {
  hadley: {
    id: "hadley",
    title: "ハドレー循環",
    subtitle: "赤道〜緯度30° の直接循環",
    description:
      "赤道付近で強い日射により暖められた空気が上昇し、上層で極方向に流れ、緯度約30°付近で冷えて下降する大規模な対流セル。3つの循環の中で最も規模が大きく活発。",
    details: [
      "赤道付近の強い日射で空気が加熱され、対流圏界面付近まで上昇",
      "上層では極方向に流れ、コリオリの力で東向きに偏向",
      "緯度約30°で冷却・収束して下降 → 亜熱帯高圧帯を形成",
      "地表では赤道に向かって流れ、貿易風となる",
      "1735年にジョージ・ハドレーが提唱（コリオリの力は当時未知）",
    ],
    color: "#ef5350",
    icon: "🔴",
  },
  ferrel: {
    id: "ferrel",
    title: "フェレル循環",
    subtitle: "緯度30°〜60° の間接循環",
    description:
      "ハドレー循環と極循環に挟まれた中緯度の循環セル。熱的な駆動力ではなく、隣接する2つのセルに「引きずられて」動く間接循環。",
    details: [
      "ハドレー循環と極循環に挟まれた間接循環（熱力学的に直接駆動されない）",
      "地表では極方向に流れ、コリオリの力で偏西風となる",
      "ジェット気流（亜熱帯・寒帯ジェット）がこの循環帯の上空に存在",
      "温帯低気圧や前線活動が活発なのはこの循環帯",
      "1856年にウィリアム・フェレルが提唱",
    ],
    color: "#42a5f5",
    icon: "🔵",
  },
  polar: {
    id: "polar",
    title: "極循環",
    subtitle: "緯度60°〜90° の直接循環",
    description:
      "極で冷却された空気が下降し、地表で低緯度方向に流れ、緯度約60°付近で上昇する循環セル。3つの循環の中で最も規模が小さい。",
    details: [
      "極では放射冷却により空気が冷え、高密度になって下降 → 極高圧帯を形成",
      "地表では低緯度方向に流れ、コリオリの力で極偏東風となる",
      "緯度約60°で暖かい偏西風と衝突して上昇 → 亜極低圧帯（寒帯前線）を形成",
      "3つの循環の中で最も弱く、不安定",
      "寒帯前線で温帯低気圧が発生しやすい",
    ],
    color: "#ab47bc",
    icon: "🟣",
  },
  coriolis: {
    id: "coriolis",
    title: "コリオリの力",
    subtitle: "地球の自転が生む見かけの力",
    description:
      "地球が自転しているために、地表上を移動する物体（空気）に働く見かけの力。北半球では進行方向の右側に、南半球では左側に偏向する。",
    details: [
      "地球の自転による慣性力の一種（見かけの力）",
      "北半球: 進行方向の右側に偏向",
      "南半球: 進行方向の左側に偏向",
      "赤道上ではゼロ、極に向かうほど強くなる",
      "南北に流れる風を東西方向に曲げ、貿易風や偏西風のパターンを決定する",
      "風速に比例して力が大きくなる",
    ],
    color: "#26a69a",
    icon: "🌀",
  },
  itcz_migration: {
    id: "itcz_migration",
    title: "ITCZの季節移動",
    subtitle: "熱帯収束帯の南北移動",
    description:
      "太陽直射点の移動に伴い、ITCZ（熱帯収束帯）は季節ごとに南北に移動する。7月頃は北半球側に、1月頃は南半球側に偏る。",
    details: [
      "ITCZ = 南北の貿易風が収束する帯（激しい上昇気流と降水が特徴）",
      "太陽直射点を追いかけるように南北に移動するが、海洋の熱慣性により1〜2か月遅れる",
      "7月頃: ITCZ は北緯5°〜15° 付近（アジアモンスーンと関連）",
      "1月頃: ITCZ は赤道〜南緯5° 付近",
      "大陸上では海洋上より大きく振れる（インド洋・アフリカで顕著）",
      "モンスーン気候や熱帯雨林の分布と密接に関連",
    ],
    color: "#ff7043",
    icon: "🌊",
  },
};

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
