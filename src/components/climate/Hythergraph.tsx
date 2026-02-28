"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import * as d3 from "d3";
import { CityClimateData, MONTH_NAMES_JA } from "@/lib/climate-types";

interface HythergraphProps {
  cities: CityClimateData[];
}

const MARGIN = { top: 20, right: 30, bottom: 50, left: 60 };
const THRESHOLD_TEMPS = [
  { value: -3, label: "-3°C (C/D境界)", color: "#42a5f5" },
  { value: 10, label: "10°C (D/E境界)", color: "#66bb6a" },
  { value: 18, label: "18°C (A/C境界)", color: "#ffa726" },
  { value: 22, label: "22°C (a/b境界)", color: "#ef5350" },
];

const ZONE_BANDS = [
  { min: -Infinity, max: -3, label: "冷帯 D", color: "rgba(33,150,243,0.08)" },
  { min: -3, max: 18, label: "温帯 C", color: "rgba(76,175,80,0.08)" },
  { min: 18, max: Infinity, label: "熱帯 A", color: "rgba(255,152,0,0.08)" },
];

export default function Hythergraph({ cities }: HythergraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const allPoints = useMemo(() => {
    const pts: { t: number; p: number; month: number; cityIdx: number }[] = [];
    cities.forEach((cd, ci) => {
      if (!cd.normals) return;
      for (let m = 0; m < 12; m++) {
        pts.push({
          t: cd.normals.temperature[m],
          p: cd.normals.precipitation[m],
          month: m,
          cityIdx: ci,
        });
      }
    });
    return pts;
  }, [cities]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    svg.selectAll("*").remove();

    const containerWidth = svgRef.current?.parentElement?.clientWidth ?? 600;
    const width = Math.max(400, containerWidth);
    const height = Math.min(500, width * 0.65);
    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    if (cities.length === 0) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#94a3b8")
        .attr("font-size", 14)
        .text("都市を追加するとハイサーグラフが表示されます");
      return;
    }

    // スケール（選択中の都市データに合わせる）
    const tExtent = d3.extent(allPoints, (d) => d.t) as [number, number];
    const pExtent = d3.extent(allPoints, (d) => d.p) as [number, number];
    const tRange = tExtent[1] - tExtent[0];
    const pRange = pExtent[1] - pExtent[0];
    const tPad = Math.max(2, tRange * 0.15);
    const pPad = Math.max(10, pRange * 0.15);

    const xMin = tExtent[0] - tPad;
    const xMax = tExtent[1] + tPad;
    const yMax = pExtent[1] + pPad;

    const x = d3.scaleLinear().domain([xMin, xMax]).range([0, innerW]);
    const y = d3.scaleLinear().domain([0, yMax]).range([innerH, 0]);

    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // 背景ゾーン
    for (const zone of ZONE_BANDS) {
      const zoneLeft = Math.max(x(zone.min === -Infinity ? xMin : zone.min), 0);
      const zoneRight = Math.min(x(zone.max === Infinity ? xMax : zone.max), innerW);
      if (zoneRight > zoneLeft) {
        g.append("rect")
          .attr("x", zoneLeft)
          .attr("y", 0)
          .attr("width", zoneRight - zoneLeft)
          .attr("height", innerH)
          .attr("fill", zone.color);

        g.append("text")
          .attr("x", (zoneLeft + zoneRight) / 2)
          .attr("y", 12)
          .attr("text-anchor", "middle")
          .attr("fill", "rgba(148,163,184,0.5)")
          .attr("font-size", 10)
          .text(zone.label);
      }
    }

    // 閾値線
    for (const th of THRESHOLD_TEMPS) {
      const xPos = x(th.value);
      if (xPos >= 0 && xPos <= innerW) {
        g.append("line")
          .attr("x1", xPos).attr("y1", 0)
          .attr("x2", xPos).attr("y2", innerH)
          .attr("stroke", th.color)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4,3")
          .attr("opacity", 0.4);
      }
    }

    // 60mm 降水閾値線
    const y60 = y(60);
    if (y60 >= 0 && y60 <= innerH) {
      g.append("line")
        .attr("x1", 0).attr("y1", y60)
        .attr("x2", innerW).attr("y2", y60)
        .attr("stroke", "#22d3ee")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,3")
        .attr("opacity", 0.4);
      g.append("text")
        .attr("x", innerW - 2)
        .attr("y", y60 - 3)
        .attr("text-anchor", "end")
        .attr("fill", "#22d3ee")
        .attr("font-size", 9)
        .attr("opacity", 0.6)
        .text("60mm");
    }

    // 乾燥限界線（ケッペンB群境界、通年型近似を月あたりに変換）
    // BS/C境界: Pann = 20*Tann + 140 → 月あたり: P_m = (20*T + 140) / 12
    // BW/BS境界: Pann = (20*Tann + 140) / 2 → 月あたり: P_m = (20*T + 140) / 24
    const aridLines = [
      { slope: 20 / 12, intercept: 140 / 12, label: "乾燥限界 (BS)", color: "#fbbf24", dash: "6,3" },
      { slope: 20 / 24, intercept: 140 / 24, label: "砂漠限界 (BW)", color: "#f97316", dash: "3,3" },
    ];
    for (const al of aridLines) {
      const x0 = xMin, x1 = xMax;
      const py0 = al.slope * x0 + al.intercept;
      const py1 = al.slope * x1 + al.intercept;
      // 描画範囲内にクリップ
      if (py1 >= 0) {
        const lineData: [number, number][] = [
          [Math.max(x(x0), 0), Math.min(y(py0), innerH)],
          [Math.min(x(x1), innerW), Math.max(y(py1), 0)],
        ];
        g.append("line")
          .attr("x1", lineData[0][0]).attr("y1", lineData[0][1])
          .attr("x2", lineData[1][0]).attr("y2", lineData[1][1])
          .attr("stroke", al.color)
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", al.dash)
          .attr("opacity", 0.5);
        // ラベル（右端）
        const labelX = Math.min(x(x1), innerW) - 2;
        const labelY = Math.max(y(py1), 0) - 4;
        if (labelY > 10) {
          g.append("text")
            .attr("x", labelX)
            .attr("y", labelY)
            .attr("text-anchor", "end")
            .attr("fill", al.color)
            .attr("font-size", 9)
            .attr("opacity", 0.8)
            .text(al.label);
        }
      }
    }

    // 軸
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(8))
      .call((sel) => sel.select(".domain").attr("stroke", "rgba(148,163,184,0.3)"))
      .call((sel) => sel.selectAll(".tick line").attr("stroke", "rgba(148,163,184,0.2)"))
      .call((sel) => sel.selectAll(".tick text").attr("fill", "#94a3b8"));

    g.append("g")
      .call(d3.axisLeft(y).ticks(6))
      .call((sel) => sel.select(".domain").attr("stroke", "rgba(148,163,184,0.3)"))
      .call((sel) => sel.selectAll(".tick line").attr("stroke", "rgba(148,163,184,0.2)"))
      .call((sel) => sel.selectAll(".tick text").attr("fill", "#94a3b8"));

    // 軸ラベル
    svg
      .append("text")
      .attr("x", MARGIN.left + innerW / 2)
      .attr("y", height - 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8")
      .attr("font-size", 12)
      .text("月平均気温 (°C)");

    svg
      .append("text")
      .attr("transform", `rotate(-90)`)
      .attr("x", -(MARGIN.top + innerH / 2))
      .attr("y", 16)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8")
      .attr("font-size", 12)
      .text("月降水量 (mm)");

    // 都市ごとのポリゴンを描画
    const lineGen = d3
      .line<{ t: number; p: number }>()
      .x((d) => x(d.t))
      .y((d) => y(d.p))
      .curve(d3.curveLinearClosed);

    cities.forEach((cd, ci) => {
      if (!cd.normals) return;
      const points = cd.normals.temperature.map((t, m) => ({
        t,
        p: cd.normals!.precipitation[m],
      }));

      // ポリゴン塗り
      g.append("path")
        .datum(points)
        .attr("d", lineGen)
        .attr("fill", cd.city.color)
        .attr("fill-opacity", 0.12)
        .attr("stroke", cd.city.color)
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.8)
        .attr("class", `polygon-${ci}`);

      // 月ポイント
      points.forEach((pt, m) => {
        g.append("circle")
          .attr("cx", x(pt.t))
          .attr("cy", y(pt.p))
          .attr("r", 4)
          .attr("fill", cd.city.color)
          .attr("stroke", "rgba(12,18,34,0.6)")
          .attr("stroke-width", 1.5)
          .attr("class", `point-${ci}-${m}`)
          .style("cursor", "pointer")
          .on("mouseenter", (event) => {
            d3.select(event.currentTarget).attr("r", 7);
            g.select(`.polygon-${ci}`)
              .attr("stroke-width", 3)
              .attr("stroke-opacity", 1)
              .attr("fill-opacity", 0.2);

            tooltip
              .style("opacity", 1)
              .style("left", `${event.offsetX + 12}px`)
              .style("top", `${event.offsetY - 10}px`)
              .html(
                `<strong>${cd.city.name}</strong> ${MONTH_NAMES_JA[m]}<br/>` +
                `気温: ${pt.t.toFixed(1)}°C<br/>` +
                `降水量: ${pt.p.toFixed(1)}mm`
              );
          })
          .on("mouseleave", (event) => {
            d3.select(event.currentTarget).attr("r", 4);
            g.select(`.polygon-${ci}`)
              .attr("stroke-width", 2)
              .attr("stroke-opacity", 0.8)
              .attr("fill-opacity", 0.12);
            tooltip.style("opacity", 0);
          });

        // 月番号ラベル
        const labelOffset = 10;
        const angle = Math.atan2(
          y(pt.p) - innerH / 2,
          x(pt.t) - innerW / 2
        );
        g.append("text")
          .attr("x", x(pt.t) + Math.cos(angle) * labelOffset)
          .attr("y", y(pt.p) + Math.sin(angle) * labelOffset)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", cd.city.color)
          .attr("font-size", 9)
          .attr("font-weight", 600)
          .attr("opacity", 0.9)
          .text(m + 1);
      });

      // 重心点（年平均値）: (Tann, Pann/12) = ポリゴン頂点の算術平均
      const Tann = cd.normals!.temperature.reduce((a, b) => a + b, 0) / 12;
      const PannPerMonth = cd.normals!.precipitation.reduce((a, b) => a + b, 0) / 12;
      const Pann = cd.normals!.precipitation.reduce((a, b) => a + b, 0);

      // 菱形マーカー
      const diamond = d3.symbol().type(d3.symbolDiamond).size(120);
      g.append("path")
        .attr("d", diamond()!)
        .attr("transform", `translate(${x(Tann)},${y(PannPerMonth)})`)
        .attr("fill", cd.city.color)
        .attr("stroke", "rgba(12,18,34,0.6)")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseenter", (event) => {
          d3.select(event.currentTarget)
            .attr("d", d3.symbol().type(d3.symbolDiamond).size(250)()!);
          g.select(`.polygon-${ci}`)
            .attr("stroke-width", 3)
            .attr("stroke-opacity", 1)
            .attr("fill-opacity", 0.2);
          tooltip
            .style("opacity", 1)
            .style("left", `${event.offsetX + 12}px`)
            .style("top", `${event.offsetY - 10}px`)
            .html(
              `<strong>${cd.city.name}</strong> 年平均${cd.koppen ? ` [${cd.koppen.code}]` : ""}<br/>` +
              `年平均気温: ${Tann.toFixed(1)}°C<br/>` +
              `年降水量: ${Pann.toFixed(0)}mm (月平均 ${PannPerMonth.toFixed(1)}mm)`
            );
        })
        .on("mouseleave", (event) => {
          d3.select(event.currentTarget)
            .attr("d", d3.symbol().type(d3.symbolDiamond).size(120)()!);
          g.select(`.polygon-${ci}`)
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.8)
            .attr("fill-opacity", 0.12);
          tooltip.style("opacity", 0);
        });
    });

    // 凡例
    const legend = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left + 10}, ${MARGIN.top + 10})`);

    cities.forEach((cd, i) => {
      const ly = i * 18;
      legend
        .append("line")
        .attr("x1", 0).attr("y1", ly)
        .attr("x2", 16).attr("y2", ly)
        .attr("stroke", cd.city.color)
        .attr("stroke-width", 2);
      legend
        .append("circle")
        .attr("cx", 8).attr("cy", ly)
        .attr("r", 3)
        .attr("fill", cd.city.color);
      legend
        .append("text")
        .attr("x", 22).attr("y", ly)
        .attr("dominant-baseline", "middle")
        .attr("font-size", 11)
        .attr("fill", "#e2e8f0")
        .text(`${cd.city.name}${cd.koppen ? ` (${cd.koppen.code})` : ""}`);
    });

    // 凡例: 菱形 = 年平均
    const diamondLegendY = cities.length * 18;
    legend
      .append("path")
      .attr("d", d3.symbol().type(d3.symbolDiamond).size(60)()!)
      .attr("transform", `translate(8,${diamondLegendY})`)
      .attr("fill", "#94a3b8");
    legend
      .append("text")
      .attr("x", 22).attr("y", diamondLegendY)
      .attr("dominant-baseline", "middle")
      .attr("font-size", 10)
      .attr("fill", "#94a3b8")
      .text("= 年平均値");
  }, [cities, allPoints]);

  return (
    <Box sx={{ position: "relative", bgcolor: "rgba(12,18,34,0.5)", borderRadius: 2, p: 1 }}>
      <svg
        ref={svgRef}
        style={{ width: "100%", height: "auto", maxHeight: 500 }}
      />
      <Box
        ref={tooltipRef}
        sx={{
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          bgcolor: "rgba(15,23,42,0.95)",
          color: "#e2e8f0",
          border: "1px solid rgba(148,163,184,0.15)",
          borderRadius: 1,
          px: 1.5,
          py: 0.5,
          fontSize: "0.75rem",
          lineHeight: 1.4,
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          transition: "opacity 0.15s",
          zIndex: 10,
        }}
      />
      {cities.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 8 }}
        >
          {/* SVG内にプレースホルダーテキストを表示済み */}
        </Typography>
      )}
    </Box>
  );
}
