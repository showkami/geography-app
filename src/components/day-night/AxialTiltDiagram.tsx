"use client";

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { solarDeclination, AXIAL_TILT } from "@/lib/solar";

interface AxialTiltDiagramProps {
  dayOfYear: number;
  width?: number;
  height?: number;
}

export default function AxialTiltDiagram({
  dayOfYear,
  width = 360,
  height = 320,
}: AxialTiltDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const cx = width / 2;
    const cy = height / 2 + 10;
    const earthRadius = Math.min(width, height) * 0.25;
    const declination = solarDeclination(dayOfYear);
    const tiltRad = (AXIAL_TILT * Math.PI) / 180;

    // 太陽光の方向（左から）
    const sunX = cx - width * 0.42;
    const sunY = cy;

    // 太陽光線
    for (let i = -4; i <= 4; i++) {
      const yOffset = i * (earthRadius / 3);
      svg
        .append("line")
        .attr("x1", sunX)
        .attr("y1", sunY + yOffset)
        .attr("x2", cx - earthRadius - 5)
        .attr("y2", sunY + yOffset)
        .attr("stroke", "#ffc107")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.6);

      // 矢印
      svg
        .append("polygon")
        .attr(
          "points",
          `${cx - earthRadius - 5},${sunY + yOffset - 3} ${cx - earthRadius},${sunY + yOffset} ${cx - earthRadius - 5},${sunY + yOffset + 3}`
        )
        .attr("fill", "#ffc107")
        .attr("opacity", 0.8);
    }

    // 太陽
    svg
      .append("circle")
      .attr("cx", sunX)
      .attr("cy", sunY)
      .attr("r", 20)
      .attr("fill", "#ffc107")
      .attr("stroke", "#f57f17")
      .attr("stroke-width", 2);

    svg
      .append("text")
      .attr("x", sunX)
      .attr("y", sunY + 36)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("fill", "#f57f17")
      .text("太陽");

    // 地球の公転面（水平線）
    svg
      .append("line")
      .attr("x1", cx - earthRadius - 30)
      .attr("x2", cx + earthRadius + 30)
      .attr("y1", cy)
      .attr("y2", cy)
      .attr("stroke", "#9e9e9e")
      .attr("stroke-width", 0.5)
      .attr("stroke-dasharray", "3,3");

    // 地球の本体（傾いた楕円として表現）
    const earthG = svg.append("g").attr("transform", `translate(${cx},${cy})`);

    // 昼側（太陽に面した側）
    earthG
      .append("circle")
      .attr("r", earthRadius)
      .attr("fill", "#e3f2fd")
      .attr("stroke", "#455a64")
      .attr("stroke-width", 1.5);

    // 夜側（影）
    earthG
      .append("path")
      .attr(
        "d",
        d3.arc()({
          innerRadius: 0,
          outerRadius: earthRadius,
          startAngle: -Math.PI / 2,
          endAngle: Math.PI / 2,
        })
      )
      .attr("fill", "rgba(25, 25, 112, 0.2)");

    // 地軸（傾いた線）
    const axisLen = earthRadius * 1.4;
    earthG
      .append("line")
      .attr("x1", -axisLen * Math.sin(tiltRad))
      .attr("y1", axisLen * Math.cos(tiltRad))
      .attr("x2", axisLen * Math.sin(tiltRad))
      .attr("y2", -axisLen * Math.cos(tiltRad))
      .attr("stroke", "#d32f2f")
      .attr("stroke-width", 2);

    // N / Sラベル
    earthG
      .append("text")
      .attr("x", (axisLen + 8) * Math.sin(tiltRad))
      .attr("y", -(axisLen + 8) * Math.cos(tiltRad))
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#d32f2f")
      .text("N");

    earthG
      .append("text")
      .attr("x", -(axisLen + 8) * Math.sin(tiltRad))
      .attr("y", (axisLen + 14) * Math.cos(tiltRad))
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#d32f2f")
      .text("S");

    // 赤道ライン（傾いた横線）
    earthG
      .append("ellipse")
      .attr("rx", earthRadius)
      .attr("ry", earthRadius * 0.15)
      .attr("transform", `rotate(${-AXIAL_TILT})`)
      .attr("fill", "none")
      .attr("stroke", "#2196f3")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,2");

    // 太陽赤緯の位置表示
    const declY = -earthRadius * Math.sin((declination * Math.PI) / 180 + tiltRad) * 0.8;
    const declX = Math.sqrt(Math.max(0, earthRadius * earthRadius - declY * declY)) * -0.3;

    earthG
      .append("circle")
      .attr("cx", declX)
      .attr("cy", declY)
      .attr("r", 4)
      .attr("fill", "#ff5722");

    // 傾き角度の弧
    const angleArc = d3.arc()({
      innerRadius: axisLen * 0.5,
      outerRadius: axisLen * 0.5 + 1,
      startAngle: 0,
      endAngle: tiltRad,
    });

    earthG
      .append("path")
      .attr("d", angleArc)
      .attr("fill", "none")
      .attr("stroke", "#ff5722")
      .attr("stroke-width", 1.5);

    earthG
      .append("text")
      .attr("x", 20)
      .attr("y", -(axisLen * 0.5 + 6))
      .style("font-size", "11px")
      .style("fill", "#ff5722")
      .text(`${AXIAL_TILT}°`);

    // 太陽赤緯の情報テキスト
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#555")
      .text(`太陽赤緯: ${declination > 0 ? "+" : ""}${declination.toFixed(1)}°`);
  }, [dayOfYear, width, height]);

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
