import { KoppenResult, KoppenCriterion } from "./climate-types";

/** ケッペン分類の日本語名称 */
const KOPPEN_NAMES: Record<string, { nameJa: string; nameEn: string; description: string }> = {
  Af:  { nameJa: "熱帯雨林気候", nameEn: "Tropical rainforest", description: "年中高温多雨" },
  Am:  { nameJa: "熱帯モンスーン気候", nameEn: "Tropical monsoon", description: "短い乾季がある熱帯" },
  Aw:  { nameJa: "サバナ気候", nameEn: "Tropical savanna", description: "明瞭な乾季と雨季" },
  BWh: { nameJa: "高温砂漠気候", nameEn: "Hot desert", description: "年中高温で極端に乾燥" },
  BWk: { nameJa: "低温砂漠気候", nameEn: "Cold desert", description: "低温で極端に乾燥" },
  BSh: { nameJa: "高温ステップ気候", nameEn: "Hot steppe", description: "高温の半乾燥地帯" },
  BSk: { nameJa: "低温ステップ気候", nameEn: "Cold steppe", description: "低温の半乾燥地帯" },
  Csa: { nameJa: "地中海性気候", nameEn: "Mediterranean hot summer", description: "夏乾燥・冬湿潤・夏暑い" },
  Csb: { nameJa: "西岸海洋性地中海気候", nameEn: "Mediterranean warm summer", description: "夏乾燥・冬湿潤・夏涼しい" },
  Csc: { nameJa: "冷涼地中海性気候", nameEn: "Mediterranean cold summer", description: "夏乾燥・冷涼な夏" },
  Cwa: { nameJa: "温暖冬季少雨気候", nameEn: "Humid subtropical dry winter", description: "冬乾燥・夏高温多雨" },
  Cwb: { nameJa: "高地温暖冬季少雨気候", nameEn: "Subtropical highland", description: "冬乾燥・夏冷涼" },
  Cwc: { nameJa: "冷涼冬季少雨気候", nameEn: "Cold subtropical highland", description: "冬乾燥・夏短く冷涼" },
  Cfa: { nameJa: "温暖湿潤気候", nameEn: "Humid subtropical", description: "年間湿潤・夏暑い" },
  Cfb: { nameJa: "西岸海洋性気候", nameEn: "Oceanic", description: "年間湿潤・夏涼しい" },
  Cfc: { nameJa: "冷涼海洋性気候", nameEn: "Subpolar oceanic", description: "年間湿潤・夏短い" },
  Dsa: { nameJa: "高温夏乾燥冷帯気候", nameEn: "Hot dry-summer continental", description: "夏暑く乾燥・冬寒い" },
  Dsb: { nameJa: "温暖夏乾燥冷帯気候", nameEn: "Warm dry-summer continental", description: "夏温暖で乾燥・冬寒い" },
  Dsc: { nameJa: "冷涼夏乾燥冷帯気候", nameEn: "Dry-summer subarctic", description: "夏乾燥・冬長く寒い" },
  Dsd: { nameJa: "極寒夏乾燥冷帯気候", nameEn: "Extremely cold dry-summer", description: "夏乾燥・冬極寒" },
  Dwa: { nameJa: "冷帯冬季少雨気候(暑夏)", nameEn: "Hot dry-winter continental", description: "冬乾燥・夏暑い" },
  Dwb: { nameJa: "冷帯冬季少雨気候(暖夏)", nameEn: "Warm dry-winter continental", description: "冬乾燥・夏温暖" },
  Dwc: { nameJa: "冷帯冬季少雨気候", nameEn: "Dry-winter subarctic", description: "冬乾燥・冬長く寒い" },
  Dwd: { nameJa: "極寒冬季少雨気候", nameEn: "Extremely cold dry-winter", description: "冬極寒・冬乾燥" },
  Dfa: { nameJa: "湿潤大陸性気候(暑夏)", nameEn: "Hot humid continental", description: "年間湿潤・夏暑い" },
  Dfb: { nameJa: "湿潤大陸性気候(暖夏)", nameEn: "Warm humid continental", description: "年間湿潤・夏温暖" },
  Dfc: { nameJa: "亜寒帯気候", nameEn: "Subarctic", description: "年間湿潤・冬長く寒い" },
  Dfd: { nameJa: "極寒亜寒帯気候", nameEn: "Extremely cold subarctic", description: "極端に寒い冬" },
  ET:  { nameJa: "ツンドラ気候", nameEn: "Tundra", description: "最暖月0〜10°C" },
  EF:  { nameJa: "氷雪気候", nameEn: "Ice cap", description: "年中氷点下" },
};

/**
 * ケッペン気候区分を判定する
 * @param temperature 月平均気温 [1月..12月] (°C)
 * @param precipitation 月降水量 [1月..12月] (mm)
 * @param latitude 緯度（南北半球の判定に使用）
 */
export function classifyKoppen(
  temperature: number[],
  precipitation: number[],
  latitude: number
): KoppenResult {
  const Tann = temperature.reduce((a, b) => a + b, 0) / 12;
  const Tmax = Math.max(...temperature);
  const Tmin = Math.min(...temperature);
  const Pann = precipitation.reduce((a, b) => a + b, 0);
  const Pmin = Math.min(...precipitation);

  // 夏半年・冬半年の定義（北半球: 4-9月が夏、南半球: 10-3月が夏）
  const summerMonths = latitude >= 0
    ? [3, 4, 5, 6, 7, 8]  // Apr-Sep (0-indexed)
    : [0, 1, 2, 9, 10, 11]; // Oct-Mar (0-indexed)
  const winterMonths = latitude >= 0
    ? [0, 1, 2, 9, 10, 11]
    : [3, 4, 5, 6, 7, 8];

  const Ps = summerMonths.map((m) => precipitation[m]);
  const Pw = winterMonths.map((m) => precipitation[m]);
  const Psmin = Math.min(...Ps);
  const Psmax = Math.max(...Ps);
  const Pwmin = Math.min(...Pw);
  const Pwmax = Math.max(...Pw);
  const PsTotal = Ps.reduce((a, b) => a + b, 0);

  // 暖かい月の数（10°C以上）
  const Nwarm = temperature.filter((t) => t >= 10).length;

  const criteria: KoppenCriterion[] = [];

  // --- E群（寒帯）判定 ---
  if (Tmax < 10) {
    criteria.push({ label: "最暖月気温", value: round(Tmax), threshold: "< 10°C", met: true });
    if (Tmax < 0) {
      criteria.push({ label: "最暖月気温", value: round(Tmax), threshold: "< 0°C (氷雪)", met: true });
      return makeResult("EF", "E", criteria);
    } else {
      criteria.push({ label: "最暖月気温", value: round(Tmax), threshold: ">= 0°C (ツンドラ)", met: true });
      return makeResult("ET", "E", criteria);
    }
  }

  // --- B群（乾燥帯）判定 ---
  // 降水の季節偏り判定
  const summerPrecipFraction = PsTotal / (Pann || 1);
  let Pthreshold: number;
  let seasonLabel: string;
  if (summerPrecipFraction >= 0.7) {
    Pthreshold = 20 * Tann + 280;
    seasonLabel = "夏雨型 (20×T+280)";
  } else if (summerPrecipFraction <= 0.3) {
    Pthreshold = 20 * Tann;
    seasonLabel = "冬雨型 (20×T)";
  } else {
    Pthreshold = 20 * Tann + 140;
    seasonLabel = "通年型 (20×T+140)";
  }

  criteria.push({
    label: "乾燥限界値",
    value: round(Pann),
    threshold: `${seasonLabel} = ${round(Pthreshold)}mm`,
    met: Pann < Pthreshold,
  });

  if (Pann < Pthreshold) {
    const isDesert = Pann < Pthreshold / 2;
    criteria.push({
      label: "砂漠/ステップ判定",
      value: round(Pann),
      threshold: `< ${round(Pthreshold / 2)}mm → 砂漠`,
      met: isDesert,
    });
    const tempSuffix = Tann >= 18 ? "h" : "k";
    criteria.push({
      label: "年平均気温",
      value: round(Tann),
      threshold: ">= 18°C → h(高温)",
      met: Tann >= 18,
    });

    const code = (isDesert ? "BW" : "BS") + tempSuffix;
    return makeResult(code, "B", criteria);
  }

  // --- A群（熱帯）判定 ---
  if (Tmin >= 18) {
    criteria.push({ label: "最寒月気温", value: round(Tmin), threshold: ">= 18°C (熱帯)", met: true });

    if (Pmin >= 60) {
      criteria.push({ label: "最少月降水量", value: round(Pmin), threshold: ">= 60mm (雨林)", met: true });
      return makeResult("Af", "A", criteria);
    }

    const amThreshold = 100 - Pann / 25;
    criteria.push({
      label: "最少月降水量",
      value: round(Pmin),
      threshold: `>= ${round(amThreshold)}mm (モンスーン)`,
      met: Pmin >= amThreshold,
    });

    if (Pmin >= amThreshold) {
      return makeResult("Am", "A", criteria);
    }
    return makeResult("Aw", "A", criteria);
  }

  // --- C群・D群の共通判定 ---
  const isD = Tmin <= -3;
  const groupLetter = isD ? "D" : "C";
  criteria.push({
    label: "最寒月気温",
    value: round(Tmin),
    threshold: isD ? "<= -3°C (冷帯)" : "> -3°C (温帯)",
    met: true,
  });

  // 第2文字: s/w/f
  let secondLetter: string;
  const isDrySummer = Psmin < 40 && Psmin < Pwmax / 3;
  const isDryWinter = Pwmin < Psmax / 10;

  if (isDrySummer) {
    secondLetter = "s";
    criteria.push({
      label: "夏季乾燥",
      value: round(Psmin),
      threshold: `< 40mm かつ < ${round(Pwmax / 3)}mm`,
      met: true,
    });
  } else if (isDryWinter) {
    secondLetter = "w";
    criteria.push({
      label: "冬季乾燥",
      value: round(Pwmin),
      threshold: `< ${round(Psmax / 10)}mm`,
      met: true,
    });
  } else {
    secondLetter = "f";
    criteria.push({ label: "乾季判定", value: 0, threshold: "明瞭な乾季なし → f", met: true });
  }

  // 第3文字: a/b/c/d
  let thirdLetter: string;
  if (Tmax >= 22) {
    thirdLetter = "a";
    criteria.push({ label: "最暖月気温", value: round(Tmax), threshold: ">= 22°C → a(暑夏)", met: true });
  } else if (Nwarm >= 4) {
    thirdLetter = "b";
    criteria.push({ label: "10°C以上の月数", value: Nwarm, threshold: ">= 4 → b(温暖夏)", met: true });
  } else if (isD && Tmin < -38) {
    thirdLetter = "d";
    criteria.push({ label: "最寒月気温", value: round(Tmin), threshold: "< -38°C → d(極寒冬)", met: true });
  } else {
    thirdLetter = "c";
    criteria.push({ label: "10°C以上の月数", value: Nwarm, threshold: "< 4 → c(冷涼夏)", met: true });
  }

  const code = groupLetter + secondLetter + thirdLetter;
  return makeResult(code, groupLetter, criteria);
}

function makeResult(code: string, group: string, criteria: KoppenCriterion[]): KoppenResult {
  const info = KOPPEN_NAMES[code] ?? {
    nameJa: code,
    nameEn: code,
    description: "",
  };
  return {
    code,
    nameJa: info.nameJa,
    nameEn: info.nameEn,
    group,
    description: info.description,
    criteria,
  };
}

function round(v: number): number {
  return Math.round(v * 10) / 10;
}

/** ケッペン大分類のカラー */
export const KOPPEN_GROUP_COLORS: Record<string, string> = {
  A: "#ff1744",
  B: "#ff9100",
  C: "#76ff03",
  D: "#00b0ff",
  E: "#b0bec5",
};

// ─── フローチャート判定パス追跡 ─────────────────────

export interface KoppenTracePath {
  visitedNodes: string[];
  finalNode: string;
}

/**
 * ケッペン分類の判定パスを追跡する（フローチャートのハイライト用）
 * classifyKoppen と同じ判定ロジックを使い、通過したノードIDの配列を返す
 */
export function traceKoppenPath(
  temperature: number[],
  precipitation: number[],
  latitude: number
): KoppenTracePath {
  const visited: string[] = ["start"];
  const Tann = temperature.reduce((a, b) => a + b, 0) / 12;
  const Tmax = Math.max(...temperature);
  const Tmin = Math.min(...temperature);
  const Pann = precipitation.reduce((a, b) => a + b, 0);
  const Pmin = Math.min(...precipitation);

  const summerMonths = latitude >= 0
    ? [3, 4, 5, 6, 7, 8]
    : [0, 1, 2, 9, 10, 11];
  const winterMonths = latitude >= 0
    ? [0, 1, 2, 9, 10, 11]
    : [3, 4, 5, 6, 7, 8];

  const Ps = summerMonths.map((m) => precipitation[m]);
  const Pw = winterMonths.map((m) => precipitation[m]);
  const Psmin = Math.min(...Ps);
  const Psmax = Math.max(...Ps);
  const Pwmin = Math.min(...Pw);
  const Pwmax = Math.max(...Pw);
  const PsTotal = Ps.reduce((a, b) => a + b, 0);
  const Nwarm = temperature.filter((t) => t >= 10).length;

  // E群判定
  visited.push("e_check");
  if (Tmax < 10) {
    visited.push("e_sub");
    if (Tmax < 0) {
      visited.push("EF");
      return { visitedNodes: visited, finalNode: "EF" };
    } else {
      visited.push("ET");
      return { visitedNodes: visited, finalNode: "ET" };
    }
  }

  // B群判定
  const summerPrecipFraction = PsTotal / (Pann || 1);
  let Pthreshold: number;
  if (summerPrecipFraction >= 0.7) {
    Pthreshold = 20 * Tann + 280;
  } else if (summerPrecipFraction <= 0.3) {
    Pthreshold = 20 * Tann;
  } else {
    Pthreshold = 20 * Tann + 140;
  }

  visited.push("b_check");
  if (Pann < Pthreshold) {
    visited.push("b_desert");
    const isDesert = Pann < Pthreshold / 2;
    if (isDesert) {
      visited.push("bw_temp");
      const code = Tann >= 18 ? "BWh" : "BWk";
      visited.push(code);
      return { visitedNodes: visited, finalNode: code };
    } else {
      visited.push("bs_temp");
      const code = Tann >= 18 ? "BSh" : "BSk";
      visited.push(code);
      return { visitedNodes: visited, finalNode: code };
    }
  }

  // A群判定
  visited.push("a_check");
  if (Tmin >= 18) {
    visited.push("a_pmin60");
    if (Pmin >= 60) {
      visited.push("Af");
      return { visitedNodes: visited, finalNode: "Af" };
    }
    visited.push("a_am");
    const amThreshold = 100 - Pann / 25;
    if (Pmin >= amThreshold) {
      visited.push("Am");
      return { visitedNodes: visited, finalNode: "Am" };
    }
    visited.push("Aw");
    return { visitedNodes: visited, finalNode: "Aw" };
  }

  // C/D判定
  visited.push("cd_check");
  const isD = Tmin <= -3;
  const groupLetter = isD ? "D" : "C";
  visited.push(isD ? "d_group" : "c_group");

  // 降水型
  const isDrySummer = Psmin < 40 && Psmin < Pwmax / 3;
  const isDryWinter = Pwmin < Psmax / 10;
  let secondLetter: string;
  if (isDrySummer) {
    secondLetter = "s";
  } else if (isDryWinter) {
    secondLetter = "w";
  } else {
    secondLetter = "f";
  }

  // 温度型
  let thirdLetter: string;
  if (Tmax >= 22) {
    thirdLetter = "a";
  } else if (Nwarm >= 4) {
    thirdLetter = "b";
  } else if (isD && Tmin < -38) {
    thirdLetter = "d";
  } else {
    thirdLetter = "c";
  }

  const code = groupLetter + secondLetter + thirdLetter;
  visited.push(code);
  return { visitedNodes: visited, finalNode: code };
}
