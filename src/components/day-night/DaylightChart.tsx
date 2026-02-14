"use client";

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import {
  daylightHours,
  LATITUDE_PRESETS,
  doyToDate,
  MONTH_NAMES_JA,
} from "@/lib/solar";

interface DaylightChartProps {
  dayOfYear: number;
  selectedLatitude?: number;
  width?: number;
  height?: number;
}

const COLORS = [
  "#d32f2f",
  "#e64a19",
  "#f9a825",
  "#2e7d32",
  "#00838f",
  "#1565c0",
  "#6a1b9a",
];

export default function DaylightChart({
  dayOfYear,
  selectedLatitude,
  width = 600,
  height = 350,
}: DaylightChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 130, bottom: 45, left: 55 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // スケール
    const xScale = d3.scaleLinear().domain([1, 365]).range([0, w]);
    const yScale = d3.scaleLinear().domain([0, 24]).range([h, 0]);

    // X軸（月）
    const monthTicks = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(monthTicks)
      .tickFormat((_d, i) => MONTH_NAMES_JA[i]);
    g.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "11px");

    // Y軸
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(8)
      .tickFormat((d) => `${d}h`);
    g.append("g").call(yAxis).selectAll("text").style("font-size", "11px");

    // Y軸ラベル
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -h / 2)
      .attr("y", -42)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#555")
      .text("昼間の長さ (時間)");

    // 12時間の基準線
    g.append("line")
      .attr("x1", 0)
      .attr("x2", w)
      .attr("y1", yScale(12))
      .attr("y2", yScale(12))
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");

    // 各緯度の昼間時間ライン
    const latitudes = LATITUDE_PRESETS;
    const line = d3
      .line<number>()
      .x((_, i) => xScale(i + 1))
      .y((d) => yScale(d))
      .curve(d3.curveBasis);

    latitudes.forEach((lat, idx) => {
      const data: number[] = [];
      for (let d = 1; d <= 365; d++) {
        data.push(daylightHours(lat.value, d));
      }

      const isSelected = selectedLatitude === lat.value;

      g.append("path")
        .datum(data)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", COLORS[idx])
        .attr("stroke-width", isSelected ? 3 : 1.5)
        .attr("opacity", isSelected ? 1 : 0.7);

      // 凡例
      const legendY = idx * 20;
      const legend = svg
        .append("g")
        .attr(
          "transform",
          `translate(${width - margin.right + 10},${margin.top + legendY})`
        );

      legend
        .append("line")
        .attr("x1", 0)
        .attr("x2", 16)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", COLORS[idx])
        .attr("stroke-width", isSelected ? 3 : 1.5);

      legend
        .append("text")
        .attr("x", 20)
        .attr("y", 4)
        .text(`${lat.value > 0 ? "N" : lat.value < 0 ? "S" : ""}${Math.abs(lat.value)}°`)
        .style("font-size", "10px")
        .style("fill", "#333")
        .style("font-weight", isSelected ? "bold" : "normal");
    });

    // 現在の日付の縦線
    g.append("line")
      .attr("x1", xScale(dayOfYear))
      .attr("x2", xScale(dayOfYear))
      .attr("y1", 0)
      .attr("y2", h)
      .attr("stroke", "#d32f2f")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "6,3");

    // 日付ラベル
    const dateInfo = doyToDate(dayOfYear);
    g.append("text")
      .attr("x", xScale(dayOfYear))
      .attr("y", -6)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("fill", "#d32f2f")
      .style("font-weight", "bold")
      .text(`${dateInfo.month}/${dateInfo.day}`);
  }, [dayOfYear, selectedLatitude, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ maxWidth: "100%", height: "auto" }}
      viewBox={`0 0 ${width} ${height}`}
    />
  );
}
