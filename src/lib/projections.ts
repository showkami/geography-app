import * as d3 from "d3";
import {
  geoRobinson,
  geoMollweide,
  geoSinusoidal,
  geoAitoff,
  geoWinkel3,
  geoMiller,
} from "d3-geo-projection";

export interface ProjectionInfo {
  id: string;
  name: string;
  nameJa: string;
  category: "cylindrical" | "conic" | "azimuthal" | "pseudocylindrical" | "other";
  categoryJa: string;
  factory: () => d3.GeoProjection;
  properties: string[];
  propertiesJa: string[];
  description: string;
}

export const PROJECTIONS: ProjectionInfo[] = [
  // 円筒図法
  {
    id: "mercator",
    name: "Mercator",
    nameJa: "メルカトル図法",
    category: "cylindrical",
    categoryJa: "円筒図法",
    factory: () => d3.geoMercator(),
    properties: ["conformal"],
    propertiesJa: ["正角（角度・形状を保存）"],
    description:
      "航海図に使われる最も有名な図法。角度を正確に保つため航路の計算に適しますが、高緯度ほど面積が大きく歪みます。赤道から切り開いて投影します。",
  },
  {
    id: "transverseMercator",
    name: "Transverse Mercator",
    nameJa: "横メルカトル図法",
    category: "cylindrical",
    categoryJa: "円筒図法",
    factory: () => d3.geoTransverseMercator(),
    properties: ["conformal"],
    propertiesJa: ["正角"],
    description:
      "メルカトル図法を90度回転させた図法。UTM座標系の基礎として使われ、南北に細長い地域の地図に適しています。",
  },
  {
    id: "equirectangular",
    name: "Equirectangular (Plate Carrée)",
    nameJa: "正距円筒図法",
    category: "cylindrical",
    categoryJa: "円筒図法",
    factory: () => d3.geoEquirectangular(),
    properties: ["equidistant"],
    propertiesJa: ["経線上で正距"],
    description:
      "最も単純な図法で、緯度と経度をそのままX・Y座標に対応させます。特定の性質は保存しませんが、理解しやすく計算が簡単です。",
  },
  {
    id: "miller",
    name: "Miller Cylindrical",
    nameJa: "ミラー図法",
    category: "cylindrical",
    categoryJa: "円筒図法",
    factory: () => geoMiller(),
    properties: ["compromise"],
    propertiesJa: ["折衷"],
    description:
      "メルカトル図法を修正し、高緯度の面積歪みを軽減した図法。正角でも正積でもありませんが、バランスの良い世界地図が得られます。",
  },

  // 円錐図法
  {
    id: "albers",
    name: "Albers Equal-Area Conic",
    nameJa: "アルバース正積円錐図法",
    category: "conic",
    categoryJa: "円錐図法",
    factory: () => d3.geoAlbers().parallels([20, 50]).rotate([0, 0]),
    properties: ["equal-area"],
    propertiesJa: ["正積（面積を保存）"],
    description:
      "面積を正確に保つ円錐図法。中緯度地域の地図に適しており、アメリカの主題図でよく使われます。",
  },
  {
    id: "conicConformal",
    name: "Lambert Conformal Conic",
    nameJa: "ランベルト正角円錐図法",
    category: "conic",
    categoryJa: "円錐図法",
    factory: () => d3.geoConicConformal().parallels([30, 60]),
    properties: ["conformal"],
    propertiesJa: ["正角"],
    description:
      "角度と形状を保つ円錐図法。航空図や中緯度地域の地図に広く使われます。標準緯線付近で歪みが最小です。",
  },

  // 方位図法
  {
    id: "orthographic",
    name: "Orthographic",
    nameJa: "正射図法",
    category: "azimuthal",
    categoryJa: "方位図法",
    factory: () => d3.geoOrthographic(),
    properties: ["perspective"],
    propertiesJa: ["透視"],
    description:
      "宇宙から地球を見たような図法。地球儀のような自然な見た目ですが、半球しか表示できません。",
  },
  {
    id: "stereographic",
    name: "Stereographic",
    nameJa: "平射図法（ステレオ投影）",
    category: "azimuthal",
    categoryJa: "方位図法",
    factory: () => d3.geoStereographic(),
    properties: ["conformal"],
    propertiesJa: ["正角"],
    description:
      "球面上の点を対蹠点から平面に投影する図法。正角で、円は円として投影されます。極域の地図でよく使われます。",
  },
  {
    id: "gnomonic",
    name: "Gnomonic",
    nameJa: "心射図法",
    category: "azimuthal",
    categoryJa: "方位図法",
    factory: () => d3.geoGnomonic().clipAngle(60),
    properties: ["gnomonic"],
    propertiesJa: ["大圏航路が直線になる"],
    description:
      "球の中心から投影する図法。大圏（最短距離の経路）が直線で表されるため、航空路の計画に使われます。半球未満しか表示できません。",
  },

  // 擬円筒図法
  {
    id: "mollweide",
    name: "Mollweide",
    nameJa: "モルワイデ図法",
    category: "pseudocylindrical",
    categoryJa: "擬円筒図法",
    factory: () => geoMollweide(),
    properties: ["equal-area"],
    propertiesJa: ["正積"],
    description:
      "面積を正確に保つ楕円形の図法。世界全体の分布図に適していますが、周辺部で形の歪みがあります。",
  },
  {
    id: "robinson",
    name: "Robinson",
    nameJa: "ロビンソン図法",
    category: "pseudocylindrical",
    categoryJa: "擬円筒図法",
    factory: () => geoRobinson(),
    properties: ["compromise"],
    propertiesJa: ["折衷（見た目のバランスを重視）"],
    description:
      "面積・形状・距離のバランスを重視した折衷図法。教科書や一般的な世界地図に広く使われます。",
  },
  {
    id: "sinusoidal",
    name: "Sinusoidal",
    nameJa: "サンソン図法（正弦図法）",
    category: "pseudocylindrical",
    categoryJa: "擬円筒図法",
    factory: () => geoSinusoidal(),
    properties: ["equal-area"],
    propertiesJa: ["正積"],
    description:
      "中央経線上で距離が正確に保たれる正積図法。赤道付近では歪みが少ないですが、高緯度の端で大きく歪みます。",
  },

  // その他
  {
    id: "aitoff",
    name: "Aitoff",
    nameJa: "エイトフ図法",
    category: "other",
    categoryJa: "その他",
    factory: () => geoAitoff(),
    properties: ["compromise"],
    propertiesJa: ["折衷"],
    description:
      "方位正距図法を基にした折衷図法。楕円形で世界全体を表示し、歪みのバランスが良い図法です。",
  },
  {
    id: "winkel3",
    name: "Winkel Tripel",
    nameJa: "ヴィンケル図法",
    category: "other",
    categoryJa: "その他",
    factory: () => geoWinkel3(),
    properties: ["compromise"],
    propertiesJa: ["折衷"],
    description:
      "ナショナルジオグラフィック協会が採用した図法。面積・距離・角度の歪みを総合的に最小化します。",
  },
  {
    id: "naturalEarth",
    name: "Natural Earth",
    nameJa: "ナチュラルアース図法",
    category: "other",
    categoryJa: "その他",
    factory: () => d3.geoNaturalEarth1(),
    properties: ["compromise"],
    propertiesJa: ["折衷"],
    description:
      "トム・パターソンが開発した擬円筒図法。自然な見た目を重視し、世界地図に広く使われます。",
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  cylindrical: "円筒図法",
  conic: "円錐図法",
  azimuthal: "方位図法",
  pseudocylindrical: "擬円筒図法",
  other: "その他",
};
