"use client";

import React from "react";
import {
  CELLS,
  getCellBoundaries,
  monthToDayOfYear,
  type CellId,
} from "@/lib/atmospheric";

interface CirculationCrossSectionProps {
  month: number;
  highlightedCell: CellId | null;
  showPressureZones: boolean;
  showWindArrows: boolean;
  showCells: boolean;
  width?: number;
  height?: number;
}

const CELL_ALT: Record<CellId, number> = {
  hadley: 0.92,
  ferrel: 0.58,
  polar: 0.40,
};

const DEG = Math.PI / 180;

function formatLat(lat: number): string {
  if (Math.abs(lat) < 0.5) return "0°";
  const v = Math.round(Math.abs(lat));
  return lat > 0 ? `${v}°N` : `${v}°S`;
}

export default function CirculationCrossSection({
  month,
  highlightedCell,
  showPressureZones,
  showWindArrows,
  showCells,
  width = 780,
  height = 480,
}: CirculationCrossSectionProps) {
  const doy = monthToDayOfYear(month);
  const {
    itczLat,
    nhSubtropicalLat,
    shSubtropicalLat,
    nhSubpolarLat,
    shSubpolarLat,
  } = getCellBoundaries(doy);

  /* ---- geometry ---- */
  const cx = width / 2;
  const cy = height - 50;
  const outerR = Math.min(cx - 15, cy - 28);
  const earthR = outerR * 0.62;
  const atmosH = outerR - earthR;

  const latA = (lat: number) => (90 - lat) * DEG;
  const pX = (a: number, r: number) => cx + r * Math.cos(a);
  const pY = (a: number, r: number) => cy - r * Math.sin(a);
  const cR = (id: CellId) => earthR + CELL_ALT[id] * atmosH;
  const findDef = (id: CellId) => CELLS.find((c) => c.id === id)!;

  /* ---- cell data ---- */
  const cells = [
    { key: "shPolar", cid: "polar" as CellId, lat1: -90, lat2: shSubpolarLat, dir: "cw" as const },
    { key: "shFerrel", cid: "ferrel" as CellId, lat1: shSubpolarLat, lat2: shSubtropicalLat, dir: "ccw" as const },
    { key: "shHadley", cid: "hadley" as CellId, lat1: shSubtropicalLat, lat2: itczLat, dir: "cw" as const },
    { key: "nhHadley", cid: "hadley" as CellId, lat1: itczLat, lat2: nhSubtropicalLat, dir: "ccw" as const },
    { key: "nhFerrel", cid: "ferrel" as CellId, lat1: nhSubtropicalLat, lat2: nhSubpolarLat, dir: "cw" as const },
    { key: "nhPolar", cid: "polar" as CellId, lat1: nhSubpolarLat, lat2: 90, dir: "ccw" as const },
  ].map((c) => ({
    ...c,
    def: findDef(c.cid),
    a1: latA(c.lat1),
    a2: latA(c.lat2),
    oR: cR(c.cid),
  }));

  /* ---- SVG arc helpers ----
   * Sweep convention (SVG y-down, clockwise = positive angle):
   *   sweep=1 (CW): left → top → right  (our "south → north" arcs)
   *   sweep=0 (CCW): right → top → left  (our "north → south" arcs)
   */
  function svgArc(r: number, from: number, to: number, sweep: 0 | 1) {
    const large = Math.abs(from - to) > Math.PI ? 1 : 0;
    return `A ${r} ${r} 0 ${large} ${sweep} ${pX(to, r)} ${pY(to, r)}`;
  }

  function sectorFill(a1: number, a2: number, rIn: number, rOut: number) {
    return [
      `M ${pX(a1, rIn)} ${pY(a1, rIn)}`,
      svgArc(rIn, a1, a2, 1),
      `L ${pX(a2, rOut)} ${pY(a2, rOut)}`,
      svgArc(rOut, a2, a1, 0),
      "Z",
    ].join(" ");
  }

  function flowLoop(
    a1: number,
    a2: number,
    rIn: number,
    rOut: number,
    dir: "cw" | "ccw"
  ) {
    const ins = 7;
    const iR = rIn + ins;
    const oR = rOut - ins;
    const aIns = ins / ((iR + oR) / 2);
    const sa = a1 - aIns;
    const ea = a2 + aIns;
    if (ea >= sa) return "";

    if (dir === "cw") {
      return [
        `M ${pX(sa, iR)} ${pY(sa, iR)}`,
        svgArc(iR, sa, ea, 1),
        `L ${pX(ea, oR)} ${pY(ea, oR)}`,
        svgArc(oR, ea, sa, 0),
        "Z",
      ].join(" ");
    }
    return [
      `M ${pX(ea, iR)} ${pY(ea, iR)}`,
      svgArc(iR, ea, sa, 0),
      `L ${pX(sa, oR)} ${pY(sa, oR)}`,
      svgArc(oR, sa, ea, 1),
      "Z",
    ].join(" ");
  }

  /* ---- arrow angle helpers ---- */
  function tangentAngle(theta: number, decreasing: boolean): number {
    const s = Math.sin(theta), c = Math.cos(theta);
    return Math.atan2(decreasing ? c : -c, decreasing ? s : -s) * (180 / Math.PI);
  }

  function radialAngle(theta: number, outward: boolean): number {
    return (
      Math.atan2(
        outward ? -Math.sin(theta) : Math.sin(theta),
        outward ? Math.cos(theta) : -Math.cos(theta)
      ) *
      (180 / Math.PI)
    );
  }

  function arrowsFor(c: (typeof cells)[number]) {
    const ins = 10;
    const iR = earthR + ins;
    const oRi = c.oR - ins;
    const mid = (c.a1 + c.a2) / 2;
    const mR = (iR + oRi) / 2;
    const surfDec = c.dir === "cw";
    const riseA = surfDec ? c.a2 : c.a1;
    const sinkA = surfDec ? c.a1 : c.a2;
    return [
      { x: pX(mid, iR), y: pY(mid, iR), rot: tangentAngle(mid, surfDec) },
      { x: pX(riseA, mR), y: pY(riseA, mR), rot: radialAngle(riseA, true) },
      { x: pX(mid, oRi), y: pY(mid, oRi), rot: tangentAngle(mid, !surfDec) },
      { x: pX(sinkA, mR), y: pY(sinkA, mR), rot: radialAngle(sinkA, false) },
    ];
  }

  /* ---- static data ---- */
  const pressureZones = [
    { lat: -90, type: "H", color: "#ab47bc" },
    { lat: shSubpolarLat, type: "L", color: "#42a5f5" },
    { lat: shSubtropicalLat, type: "H", color: "#ff9800" },
    { lat: itczLat, type: "L", color: "#ef5350" },
    { lat: nhSubtropicalLat, type: "H", color: "#ff9800" },
    { lat: nhSubpolarLat, type: "L", color: "#42a5f5" },
    { lat: 90, type: "H", color: "#ab47bc" },
  ];

  const windLabels = [
    "極偏東風", "偏西風", "貿易風", "貿易風", "偏西風", "極偏東風",
  ];

  const refLats = [-90, -60, -30, 0, 30, 60, 90];

  /* ---- composite paths ---- */
  const earthPath = `M ${cx - earthR} ${cy} ${svgArc(earthR, Math.PI, 0, 1)} Z`;

  const atmosPath = [
    `M ${cx - outerR} ${cy}`,
    svgArc(outerR, Math.PI, 0, 1),
    `L ${cx + earthR} ${cy}`,
    svgArc(earthR, 0, Math.PI, 0),
    "Z",
  ].join(" ");

  const tropopauseRadius = (lat: number) => {
    // 対流圏界面は熱帯で高く、高緯度ほど低くなる（模式的な緯度依存）。
    const frac = 0.58 + 0.30 * Math.cos(Math.abs(lat) * DEG);
    return earthR + frac * atmosH;
  };
  const tropopauseLats = Array.from({ length: 73 }, (_, i) => -90 + i * 2.5);
  const tropopausePath = tropopauseLats
    .map((lat, i) => {
      const a = latA(lat);
      const r = tropopauseRadius(lat);
      return `${i === 0 ? "M" : "L"} ${pX(a, r)} ${pY(a, r)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ maxWidth: "100%", height: "auto" }}
    >
      <style>{`
        .cell-flow-path {
          fill: none;
          stroke-dasharray: 8 6;
          animation: cellDashFlow 1.5s linear infinite;
        }
        @keyframes cellDashFlow {
          from { stroke-dashoffset: 14; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>

      <defs>
        <radialGradient id="earthG" cx="50%" cy="100%" r="75%">
          <stop offset="0%" stopColor="#d7ccc8" />
          <stop offset="100%" stopColor="#a1887f" />
        </radialGradient>
        <radialGradient id="atmosG" cx="50%" cy="100%" r="100%" fx="50%" fy="100%">
          <stop offset="0%" stopColor="#e3f2fd" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e8eaf6" stopOpacity="0.08" />
        </radialGradient>
      </defs>

      {/* Earth body */}
      <path d={earthPath} fill="url(#earthG)" opacity={0.3} />

      {/* Atmosphere background */}
      <path d={atmosPath} fill="url(#atmosG)" />

      {/* Latitude radial grid lines */}
      {refLats.map((lat) => {
        const a = latA(lat);
        return (
          <line
            key={`grid-${lat}`}
            x1={pX(a, earthR)}
            y1={pY(a, earthR)}
            x2={pX(a, outerR)}
            y2={pY(a, outerR)}
            stroke={lat === 0 ? "#bdbdbd" : "#e0e0e0"}
            strokeWidth={lat === 0 ? 1 : 0.5}
            strokeDasharray={lat === 0 ? undefined : "3,3"}
          />
        );
      })}

      {/* Tropopause reference arc */}
      <path
        d={tropopausePath}
        fill="none"
        stroke="#9e9e9e"
        strokeWidth={0.5}
        strokeDasharray="6,4"
      />
      <text
        x={pX(latA(12), tropopauseRadius(12))}
        y={pY(latA(12), tropopauseRadius(12)) + 13}
        fontSize={9}
        fill="#9e9e9e"
        textAnchor="start"
      >
        対流圏界面
      </text>

      {/* Circulation cells */}
      {showCells &&
        cells.map((c) => {
          const span = Math.abs(c.a1 - c.a2);
          if (span < 3 * DEG) return null;
          const hl = !highlightedCell || highlightedCell === c.cid;
          return (
            <g key={c.key}>
              <path
                d={sectorFill(c.a1, c.a2, earthR, c.oR)}
                fill={c.def.color}
                opacity={hl ? 0.15 : 0.04}
              />
              {span > 6 * DEG && (
                <path
                  d={flowLoop(c.a1, c.a2, earthR, c.oR, c.dir)}
                  className="cell-flow-path"
                  stroke={c.def.color}
                  strokeWidth={hl ? 2.5 : 1.2}
                  opacity={hl ? 0.7 : 0.18}
                />
              )}
              {span > 12 * DEG &&
                arrowsFor(c).map((ar, i) => (
                  <polygon
                    key={`ar-${c.key}-${i}`}
                    points="-5,-3.5 5,0 -5,3.5"
                    fill={c.def.color}
                    opacity={hl ? 0.6 : 0.1}
                    transform={`translate(${ar.x},${ar.y}) rotate(${ar.rot})`}
                  />
                ))}
              {span > 18 * DEG &&
                (() => {
                  const mid = (c.a1 + c.a2) / 2;
                  const lr = (earthR + c.oR) / 2;
                  const midLat = 90 - mid / DEG;
                  return (
                    <text
                      x={pX(mid, lr)}
                      y={pY(mid, lr)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={span > 25 * DEG ? 13 : 11}
                      fontWeight={600}
                      fill={c.def.color}
                      opacity={hl ? 0.85 : 0.25}
                      transform={`rotate(${midLat}, ${pX(mid, lr)}, ${pY(mid, lr)})`}
                    >
                      {c.def.name.replace("循環", "")}
                    </text>
                  );
                })()}
            </g>
          );
        })}

      {/* ITCZ marker */}
      <line
        x1={pX(latA(itczLat), earthR - 5)}
        y1={pY(latA(itczLat), earthR - 5)}
        x2={pX(latA(itczLat), outerR + 5)}
        y2={pY(latA(itczLat), outerR + 5)}
        stroke="#ef5350"
        strokeWidth={2}
        strokeDasharray="5,3"
      />
      <text
        x={pX(latA(itczLat), outerR + 18)}
        y={pY(latA(itczLat), outerR + 18)}
        textAnchor="middle"
        fontSize={11}
        fontWeight="bold"
        fill="#ef5350"
      >
        ITCZ
      </text>

      {/* Earth surface arc */}
      <path
        d={`M ${cx - earthR} ${cy} ${svgArc(earthR, Math.PI, 0, 1)}`}
        fill="none"
        stroke="#8d6e63"
        strokeWidth={2}
      />

      {/* Pressure zone markers on surface */}
      {showPressureZones &&
        pressureZones.map((pz, i) => {
          const a = latA(pz.lat);
          return (
            <g key={`pz-${i}`}>
              <circle
                cx={pX(a, earthR)}
                cy={pY(a, earthR)}
                r={10}
                fill={pz.color}
                opacity={0.2}
              />
              <text
                x={pX(a, earthR)}
                y={pY(a, earthR)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fontWeight="bold"
                fill={pz.color}
              >
                {pz.type}
              </text>
            </g>
          );
        })}

      {/* Wind name labels (inside Earth body, along surface) */}
      {showWindArrows &&
        cells.map((c, i) => {
          const span = Math.abs(c.a1 - c.a2);
          if (span < 15 * DEG) return null;
          const hl = !highlightedCell || highlightedCell === c.cid;
          const mid = (c.a1 + c.a2) / 2;
          const midLat = 90 - mid / DEG;
          const lr = earthR - 18;
          return (
            <text
              key={`wind-${i}`}
              x={pX(mid, lr)}
              y={pY(mid, lr)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={span > 22 * DEG ? 10 : 8}
              fill={c.def.color}
              fontWeight={500}
              opacity={hl ? 0.85 : 0.25}
              transform={`rotate(${midLat}, ${pX(mid, lr)}, ${pY(mid, lr)})`}
            >
              {windLabels[i]}
            </text>
          );
        })}

      {/* Latitude tick marks + labels */}
      {refLats.map((lat) => {
        const a = latA(lat);
        const tickR = outerR + 6;
        const labelR = outerR + 18;
        const x = pX(a, labelR);
        const y = pY(a, labelR);
        const anchor: "start" | "middle" | "end" =
          lat < -15 ? "end" : lat > 15 ? "start" : "middle";
        return (
          <g key={`lat-${lat}`}>
            <line
              x1={pX(a, outerR)}
              y1={pY(a, outerR)}
              x2={pX(a, tickR)}
              y2={pY(a, tickR)}
              stroke="#bbb"
              strokeWidth={1}
            />
            <text
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={10}
              fill="#999"
            >
              {formatLat(lat)}
            </text>
          </g>
        );
      })}

      {/* Hemisphere labels */}
      <text
        x={cx - outerR * 0.45}
        y={cy + 22}
        textAnchor="middle"
        fontSize={10}
        fill="#bbb"
      >
        南半球
      </text>
      <text
        x={cx + outerR * 0.45}
        y={cy + 22}
        textAnchor="middle"
        fontSize={10}
        fill="#bbb"
      >
        北半球
      </text>

      {/* Outer atmosphere boundary + diameter */}
      <path
        d={`M ${cx - outerR} ${cy} ${svgArc(outerR, Math.PI, 0, 1)}`}
        fill="none"
        stroke="#e0e0e0"
        strokeWidth={0.5}
      />
      <line
        x1={cx - outerR - 5}
        y1={cy}
        x2={cx + outerR + 5}
        y2={cy}
        stroke="#e0e0e0"
        strokeWidth={0.5}
      />
    </svg>
  );
}
