/** ケッペンフローチャートの静的データ定義 */

export interface FlowchartNode {
  id: string;
  type: "start" | "decision" | "result";
  label: string;
  sublabel?: string;
  group?: "E" | "B" | "A" | "C" | "D";
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
}

export interface GroupRegion {
  group: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── ノード定義 ───────────────────────────────────────
// viewBox: 0 0 1200 720
// 座標はノード中心

export const NODES: FlowchartNode[] = [
  // Level 0: Start
  { id: "start", type: "start", label: "Start", x: 480, y: 25, width: 72, height: 26 },

  // Level 1: E群判定
  { id: "e_check", type: "decision", label: "Tmax < 10°C?", sublabel: "最暖月平均気温", x: 480, y: 82, width: 148, height: 34 },

  // Level 2: E群内分岐 / B群判定
  { id: "e_sub", type: "decision", label: "Tmax < 0°C?", sublabel: "最暖月平均気温", group: "E", x: 130, y: 164, width: 132, height: 34 },
  { id: "b_check", type: "decision", label: "Pann < 乾燥限界?", sublabel: "年降水量", x: 700, y: 164, width: 185, height: 34 },

  // Level 3: E結果 / B群内分岐 / A群判定
  { id: "EF", type: "result", label: "EF", sublabel: "氷雪気候", group: "E", x: 65, y: 250, width: 70, height: 42 },
  { id: "ET", type: "result", label: "ET", sublabel: "ツンドラ気候", group: "E", x: 195, y: 250, width: 70, height: 42 },
  { id: "b_desert", type: "decision", label: "Pann < 限界/2?", sublabel: "砂漠/ステップ判定", group: "B", x: 460, y: 250, width: 162, height: 34 },
  { id: "a_check", type: "decision", label: "Tmin ≥ 18°C?", sublabel: "最寒月平均気温", x: 880, y: 250, width: 155, height: 34 },

  // Level 4: BW/BS温度判定 / A群降水判定 / C/D判定
  { id: "bw_temp", type: "decision", label: "Tann ≥ 18°C?", sublabel: "年平均気温 (砂漠)", group: "B", x: 345, y: 336, width: 148, height: 34 },
  { id: "bs_temp", type: "decision", label: "Tann ≥ 18°C?", sublabel: "年平均気温 (ステップ)", group: "B", x: 565, y: 336, width: 148, height: 34 },
  { id: "a_pmin60", type: "decision", label: "Pmin ≥ 60mm?", sublabel: "最少月降水量", group: "A", x: 760, y: 336, width: 150, height: 34 },
  { id: "cd_check", type: "decision", label: "Tmin > −3°C?", sublabel: "最寒月平均気温", x: 1070, y: 336, width: 150, height: 34 },

  // Level 5: B結果 / Af / Am判定 / C群・D群
  { id: "BWh", type: "result", label: "BWh", sublabel: "高温砂漠", group: "B", x: 283, y: 418, width: 60, height: 38 },
  { id: "BWk", type: "result", label: "BWk", sublabel: "低温砂漠", group: "B", x: 400, y: 418, width: 60, height: 38 },
  { id: "BSh", type: "result", label: "BSh", sublabel: "高温ステップ", group: "B", x: 505, y: 418, width: 60, height: 38 },
  { id: "BSk", type: "result", label: "BSk", sublabel: "低温ステップ", group: "B", x: 622, y: 418, width: 60, height: 38 },
  { id: "Af", type: "result", label: "Af", sublabel: "熱帯雨林", group: "A", x: 700, y: 418, width: 60, height: 38 },
  { id: "a_am", type: "decision", label: "Pmin ≥ Am閾値?", sublabel: "100−Pann/25", group: "A", x: 820, y: 418, width: 162, height: 34 },
  { id: "c_group", type: "decision", label: "C群", sublabel: "降水型 + 温度型", group: "C", x: 995, y: 418, width: 90, height: 34 },
  { id: "d_group", type: "decision", label: "D群", sublabel: "降水型 + 温度型", group: "D", x: 1175, y: 418, width: 90, height: 34 },

  // Level 6: Am/Aw結果
  { id: "Am", type: "result", label: "Am", sublabel: "熱帯モンスーン", group: "A", x: 770, y: 496, width: 60, height: 38 },
  { id: "Aw", type: "result", label: "Aw", sublabel: "サバナ", group: "A", x: 870, y: 496, width: 60, height: 38 },

  // C群マトリクス (3×3) — cols: a=953, b=1000, c=1047 / rows: s=530, w=576, f=622
  { id: "Csa", type: "result", label: "Csa", group: "C", x: 953, y: 530, width: 44, height: 32 },
  { id: "Csb", type: "result", label: "Csb", group: "C", x: 1000, y: 530, width: 44, height: 32 },
  { id: "Csc", type: "result", label: "Csc", group: "C", x: 1047, y: 530, width: 44, height: 32 },
  { id: "Cwa", type: "result", label: "Cwa", group: "C", x: 953, y: 576, width: 44, height: 32 },
  { id: "Cwb", type: "result", label: "Cwb", group: "C", x: 1000, y: 576, width: 44, height: 32 },
  { id: "Cwc", type: "result", label: "Cwc", group: "C", x: 1047, y: 576, width: 44, height: 32 },
  { id: "Cfa", type: "result", label: "Cfa", group: "C", x: 953, y: 622, width: 44, height: 32 },
  { id: "Cfb", type: "result", label: "Cfb", group: "C", x: 1000, y: 622, width: 44, height: 32 },
  { id: "Cfc", type: "result", label: "Cfc", group: "C", x: 1047, y: 622, width: 44, height: 32 },

  // D群マトリクス (3×4) — cols: a=1120, b=1160, c=1200, d=1240 / rows: s=530, w=576, f=622
  { id: "Dsa", type: "result", label: "Dsa", group: "D", x: 1120, y: 530, width: 38, height: 32 },
  { id: "Dsb", type: "result", label: "Dsb", group: "D", x: 1160, y: 530, width: 38, height: 32 },
  { id: "Dsc", type: "result", label: "Dsc", group: "D", x: 1200, y: 530, width: 38, height: 32 },
  { id: "Dsd", type: "result", label: "Dsd", group: "D", x: 1240, y: 530, width: 38, height: 32 },
  { id: "Dwa", type: "result", label: "Dwa", group: "D", x: 1120, y: 576, width: 38, height: 32 },
  { id: "Dwb", type: "result", label: "Dwb", group: "D", x: 1160, y: 576, width: 38, height: 32 },
  { id: "Dwc", type: "result", label: "Dwc", group: "D", x: 1200, y: 576, width: 38, height: 32 },
  { id: "Dwd", type: "result", label: "Dwd", group: "D", x: 1240, y: 576, width: 38, height: 32 },
  { id: "Dfa", type: "result", label: "Dfa", group: "D", x: 1120, y: 622, width: 38, height: 32 },
  { id: "Dfb", type: "result", label: "Dfb", group: "D", x: 1160, y: 622, width: 38, height: 32 },
  { id: "Dfc", type: "result", label: "Dfc", group: "D", x: 1200, y: 622, width: 38, height: 32 },
  { id: "Dfd", type: "result", label: "Dfd", group: "D", x: 1240, y: 622, width: 38, height: 32 },
];

// ─── エッジ定義 ───────────────────────────────────────

export const EDGES: FlowchartEdge[] = [
  // メインフロー
  { from: "start", to: "e_check" },
  { from: "e_check", to: "e_sub", label: "Yes" },
  { from: "e_check", to: "b_check", label: "No" },
  { from: "e_sub", to: "EF", label: "Yes" },
  { from: "e_sub", to: "ET", label: "No" },
  { from: "b_check", to: "b_desert", label: "Yes" },
  { from: "b_check", to: "a_check", label: "No" },
  { from: "b_desert", to: "bw_temp", label: "Yes" },
  { from: "b_desert", to: "bs_temp", label: "No" },
  { from: "bw_temp", to: "BWh", label: "Yes" },
  { from: "bw_temp", to: "BWk", label: "No" },
  { from: "bs_temp", to: "BSh", label: "Yes" },
  { from: "bs_temp", to: "BSk", label: "No" },
  { from: "a_check", to: "a_pmin60", label: "Yes" },
  { from: "a_check", to: "cd_check", label: "No" },
  { from: "a_pmin60", to: "Af", label: "Yes" },
  { from: "a_pmin60", to: "a_am", label: "No" },
  { from: "a_am", to: "Am", label: "Yes" },
  { from: "a_am", to: "Aw", label: "No" },
  { from: "cd_check", to: "c_group", label: "Yes" },
  { from: "cd_check", to: "d_group", label: "No" },

  // C群マトリクスへのエッジ
  { from: "c_group", to: "Csa" },
  { from: "c_group", to: "Csb" },
  { from: "c_group", to: "Csc" },
  { from: "c_group", to: "Cwa" },
  { from: "c_group", to: "Cwb" },
  { from: "c_group", to: "Cwc" },
  { from: "c_group", to: "Cfa" },
  { from: "c_group", to: "Cfb" },
  { from: "c_group", to: "Cfc" },

  // D群マトリクスへのエッジ
  { from: "d_group", to: "Dsa" },
  { from: "d_group", to: "Dsb" },
  { from: "d_group", to: "Dsc" },
  { from: "d_group", to: "Dsd" },
  { from: "d_group", to: "Dwa" },
  { from: "d_group", to: "Dwb" },
  { from: "d_group", to: "Dwc" },
  { from: "d_group", to: "Dwd" },
  { from: "d_group", to: "Dfa" },
  { from: "d_group", to: "Dfb" },
  { from: "d_group", to: "Dfc" },
  { from: "d_group", to: "Dfd" },
];

// ─── グループ背景領域 ────────────────────────────────

export const GROUP_REGIONS: GroupRegion[] = [
  { group: "E", label: "E 寒帯", x: 20, y: 132, width: 248, height: 178 },
  { group: "B", label: "B 乾燥帯", x: 250, y: 218, width: 420, height: 256 },
  { group: "A", label: "A 熱帯", x: 678, y: 218, width: 235, height: 332 },
  { group: "C", label: "C 温帯", x: 920, y: 386, width: 158, height: 284 },
  { group: "D", label: "D 冷帯", x: 1082, y: 386, width: 192, height: 284 },
];

// ─── C/Dマトリクスのヘッダー ──────────────────────────

export interface MatrixHeader {
  label: string;
  key: string;          // "a","b","c","d" or "s","w","f"
  x?: number;
  y?: number;
  tip: string;          // ツールチップの説明文
}

export const C_MATRIX = {
  colHeaders: [
    { label: "a", key: "a", x: 953,
      tip: "温度型 a（暑夏）\nTmax ≥ 22°C\n最暖月平均気温が22°C以上" },
    { label: "b", key: "b", x: 1000,
      tip: "温度型 b（温暖夏）\nTmax < 22°C かつ Nwarm ≥ 4\n月平均10°C以上の月が4ヶ月以上" },
    { label: "c", key: "c", x: 1047,
      tip: "温度型 c（冷涼夏）\nNwarm < 4\n月平均10°C以上の月が3ヶ月以下" },
  ] as MatrixHeader[],
  rowHeaders: [
    { label: "s 夏乾燥", key: "s", y: 530,
      tip: "降水型 s（夏季乾燥）\nPsmin < 40mm かつ Psmin < Pwmax/3\n夏の最少雨月が40mm未満で冬の最多雨月の1/3未満" },
    { label: "w 冬乾燥", key: "w", y: 576,
      tip: "降水型 w（冬季乾燥）\nPwmin < Psmax/10\n冬の最少雨月が夏の最多雨月の1/10未満" },
    { label: "f 湿潤", key: "f", y: 622,
      tip: "降水型 f（湿潤）\ns にも w にも該当しない\n年間を通じて明瞭な乾季がない" },
  ] as MatrixHeader[],
  headerY: 505,
  headerX: 915,
};

export const D_MATRIX = {
  colHeaders: [
    { label: "a", key: "a", x: 1120,
      tip: "温度型 a（暑夏）\nTmax ≥ 22°C\n最暖月平均気温が22°C以上" },
    { label: "b", key: "b", x: 1160,
      tip: "温度型 b（温暖夏）\nTmax < 22°C かつ Nwarm ≥ 4\n月平均10°C以上の月が4ヶ月以上" },
    { label: "c", key: "c", x: 1200,
      tip: "温度型 c（冷涼夏）\nNwarm < 4\n月平均10°C以上の月が3ヶ月以下" },
    { label: "d", key: "d", x: 1240,
      tip: "温度型 d（極寒冬）\nTmin < −38°C\n最寒月平均気温が−38°C未満\nD群のみ: C群は Tmin > −3°C なので該当しない" },
  ] as MatrixHeader[],
  rowHeaders: [
    { label: "s", key: "s", y: 530,
      tip: "降水型 s（夏季乾燥）\nPsmin < 40mm かつ Psmin < Pwmax/3\n夏の最少雨月が40mm未満で冬の最多雨月の1/3未満" },
    { label: "w", key: "w", y: 576,
      tip: "降水型 w（冬季乾燥）\nPwmin < Psmax/10\n冬の最少雨月が夏の最多雨月の1/10未満" },
    { label: "f", key: "f", y: 622,
      tip: "降水型 f（湿潤）\ns にも w にも該当しない\n年間を通じて明瞭な乾季がない" },
  ] as MatrixHeader[],
  headerY: 505,
  headerX: 1098,
};

// ─── ノードメトリクス（ツールチップ用） ───────────────

export interface NodeMetricResult {
  condition: string;
  value: string;
  passed: boolean;
}

function round(v: number): number {
  return Math.round(v * 10) / 10;
}

export function getNodeMetric(
  nodeId: string,
  temperature: number[],
  precipitation: number[],
  latitude: number
): NodeMetricResult | null {
  const Tann = temperature.reduce((a, b) => a + b, 0) / 12;
  const Tmax = Math.max(...temperature);
  const Tmin = Math.min(...temperature);
  const Pann = precipitation.reduce((a, b) => a + b, 0);
  const Pmin = Math.min(...precipitation);

  const summerMonths =
    latitude >= 0 ? [3, 4, 5, 6, 7, 8] : [0, 1, 2, 9, 10, 11];
  const winterMonths =
    latitude >= 0 ? [0, 1, 2, 9, 10, 11] : [3, 4, 5, 6, 7, 8];
  const Ps = summerMonths.map((m) => precipitation[m]);
  const Pw = winterMonths.map((m) => precipitation[m]);
  const Psmin = Math.min(...Ps);
  const Pwmin = Math.min(...Pw);
  const Psmax = Math.max(...Ps);
  const Pwmax = Math.max(...Pw);
  const PsTotal = Ps.reduce((a, b) => a + b, 0);
  const Nwarm = temperature.filter((t) => t >= 10).length;

  const summerFrac = PsTotal / (Pann || 1);
  let Pthreshold: number;
  if (summerFrac >= 0.7) {
    Pthreshold = 20 * Tann + 280;
  } else if (summerFrac <= 0.3) {
    Pthreshold = 20 * Tann;
  } else {
    Pthreshold = 20 * Tann + 140;
  }

  switch (nodeId) {
    case "e_check":
      return {
        condition: "Tmax < 10°C?",
        value: `${round(Tmax)}°C`,
        passed: Tmax < 10,
      };
    case "e_sub":
      return {
        condition: "Tmax < 0°C?",
        value: `${round(Tmax)}°C`,
        passed: Tmax < 0,
      };
    case "b_check":
      return {
        condition: `Pann < ${round(Pthreshold)}mm?`,
        value: `${round(Pann)}mm`,
        passed: Pann < Pthreshold,
      };
    case "b_desert":
      return {
        condition: `Pann < ${round(Pthreshold / 2)}mm?`,
        value: `${round(Pann)}mm`,
        passed: Pann < Pthreshold / 2,
      };
    case "bw_temp":
    case "bs_temp":
      return {
        condition: "Tann ≥ 18°C?",
        value: `${round(Tann)}°C`,
        passed: Tann >= 18,
      };
    case "a_check":
      return {
        condition: "Tmin ≥ 18°C?",
        value: `${round(Tmin)}°C`,
        passed: Tmin >= 18,
      };
    case "a_pmin60":
      return {
        condition: "Pmin ≥ 60mm?",
        value: `${round(Pmin)}mm`,
        passed: Pmin >= 60,
      };
    case "a_am": {
      const amTh = 100 - Pann / 25;
      return {
        condition: `Pmin ≥ ${round(amTh)}mm?`,
        value: `${round(Pmin)}mm`,
        passed: Pmin >= amTh,
      };
    }
    case "cd_check":
      return {
        condition: "Tmin > −3°C?",
        value: `${round(Tmin)}°C`,
        passed: Tmin > -3,
      };
    case "c_group":
    case "d_group": {
      const isDrySummer = Psmin < 40 && Psmin < Pwmax / 3;
      const isDryWinter = Pwmin < Psmax / 10;
      const precip = isDrySummer ? "s" : isDryWinter ? "w" : "f";
      let temp: string;
      if (Tmax >= 22) temp = "a";
      else if (Nwarm >= 4) temp = "b";
      else if (nodeId === "d_group" && Tmin < -38) temp = "d";
      else temp = "c";
      const group = nodeId === "c_group" ? "C" : "D";
      return {
        condition: `降水型=${precip}, 温度型=${temp}`,
        value: `→ ${group}${precip}${temp}`,
        passed: true,
      };
    }
    default:
      return null;
  }
}

// ─── マトリクスヘッダー用メトリクス ──────────────────

export interface MatrixHeaderMetricResult {
  values: string;
  matched: boolean;
}

export function getMatrixHeaderMetric(
  headerKey: string,
  headerType: "col" | "row",
  group: "C" | "D",
  temperature: number[],
  precipitation: number[],
  latitude: number
): MatrixHeaderMetricResult | null {
  const Tmax = Math.max(...temperature);
  const Tmin = Math.min(...temperature);
  const Nwarm = temperature.filter((t) => t >= 10).length;

  const summerMonths =
    latitude >= 0 ? [3, 4, 5, 6, 7, 8] : [0, 1, 2, 9, 10, 11];
  const winterMonths =
    latitude >= 0 ? [0, 1, 2, 9, 10, 11] : [3, 4, 5, 6, 7, 8];
  const Ps = summerMonths.map((m) => precipitation[m]);
  const Pw = winterMonths.map((m) => precipitation[m]);
  const Psmin = Math.min(...Ps);
  const Pwmin = Math.min(...Pw);
  const Psmax = Math.max(...Ps);
  const Pwmax = Math.max(...Pw);

  if (headerType === "col") {
    switch (headerKey) {
      case "a":
        return { values: `Tmax = ${round(Tmax)}°C`, matched: Tmax >= 22 };
      case "b":
        return {
          values: `Tmax = ${round(Tmax)}°C, Nwarm = ${Nwarm}ヶ月`,
          matched: Tmax < 22 && Nwarm >= 4,
        };
      case "c":
        if (group === "D") {
          return {
            values: `Nwarm = ${Nwarm}ヶ月, Tmin = ${round(Tmin)}°C`,
            matched: !(Tmax >= 22) && !(Tmax < 22 && Nwarm >= 4) && Tmin >= -38,
          };
        }
        return {
          values: `Nwarm = ${Nwarm}ヶ月`,
          matched: !(Tmax >= 22) && !(Tmax < 22 && Nwarm >= 4),
        };
      case "d":
        return { values: `Tmin = ${round(Tmin)}°C`, matched: Tmin < -38 };
      default:
        return null;
    }
  } else {
    const isDrySummer = Psmin < 40 && Psmin < Pwmax / 3;
    const isDryWinter = Pwmin < Psmax / 10;
    switch (headerKey) {
      case "s":
        return {
          values: `Psmin = ${round(Psmin)}mm, Pwmax = ${round(Pwmax)}mm`,
          matched: isDrySummer,
        };
      case "w":
        return {
          values: `Pwmin = ${round(Pwmin)}mm, Psmax = ${round(Psmax)}mm`,
          matched: isDryWinter,
        };
      case "f":
        return {
          values: isDrySummer ? "→ s 該当" : isDryWinter ? "→ w 該当" : "s/w 非該当",
          matched: !isDrySummer && !isDryWinter,
        };
      default:
        return null;
    }
  }
}

// ─── エッジパス計算 ─────────────────────────────────

const nodeMap = new Map(NODES.map((n) => [n.id, n]));

export function computeEdgePath(edge: FlowchartEdge): string {
  const from = nodeMap.get(edge.from)!;
  const to = nodeMap.get(edge.to)!;

  // 出発点: 親ノード下端中央（Yes/Noで左右にオフセット）
  let exitX = from.x;
  if (edge.label === "Yes" && to.x < from.x) {
    exitX = from.x - from.width / 4;
  } else if (edge.label === "No" && to.x > from.x) {
    exitX = from.x + from.width / 4;
  } else if (edge.label === "Yes" && to.x > from.x) {
    exitX = from.x - from.width / 4;
  } else if (edge.label === "No" && to.x < from.x) {
    exitX = from.x + from.width / 4;
  }
  const exitY = from.y + from.height / 2;

  // 到達点: 子ノード上端中央
  const entryX = to.x;
  const entryY = to.y - to.height / 2;

  // 直下なら直線
  if (Math.abs(exitX - entryX) < 3) {
    return `M${exitX},${exitY} L${entryX},${entryY}`;
  }

  // L字型: 下→横→下
  const junctionY = exitY + (entryY - exitY) * 0.4;
  return `M${exitX},${exitY} L${exitX},${junctionY} L${entryX},${junctionY} L${entryX},${entryY}`;
}

// マトリクスエッジ用の特殊パス（ファン状）
export function computeMatrixEdgePath(edge: FlowchartEdge): string {
  const from = nodeMap.get(edge.from)!;
  const to = nodeMap.get(edge.to)!;

  const exitX = from.x;
  const exitY = from.y + from.height / 2;
  const entryX = to.x;
  const entryY = to.y - to.height / 2;

  // 中間Y（グループノードの下）
  const midY = exitY + 16;

  return `M${exitX},${exitY} L${exitX},${midY} L${entryX},${midY} L${entryX},${entryY}`;
}

// エッジがマトリクスエッジかどうか判定
export function isMatrixEdge(edge: FlowchartEdge): boolean {
  return edge.from === "c_group" || edge.from === "d_group";
}
