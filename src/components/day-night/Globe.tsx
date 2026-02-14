"use client";

import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { subsolarPoint } from "@/lib/solar";
import type { Topology, Objects, GeometryCollection } from "topojson-specification";

interface GlobeProps {
  dayOfYear: number;
  width?: number;
  height?: number;
}

export default function Globe({
  dayOfYear,
  width = 500,
  height = 500,
}: GlobeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const worldDataRef = useRef<Topology<Objects<any>> | null>(null);
  const projectionRef = useRef<d3.GeoProjection | null>(null);

  const loadWorldData = useCallback(async () => {
    if (worldDataRef.current) return worldDataRef.current;
    const res = await fetch("/data/world-110m.json");
    const data = await res.json();
    worldDataRef.current = data;
    return data;
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const projection = d3
      .geoOrthographic()
      .scale(width / 2.2)
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .rotate([0, -25, 0]);

    projectionRef.current = projection;
    const path = d3.geoPath(projection);

    // ドラッグで地球儀を回転
    const drag = d3.drag<SVGSVGElement, unknown>().on("drag", (event) => {
      const rotate = projection.rotate();
      const k = 0.5; // 感度
      projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
      renderGlobe();
    });

    svg.call(drag);

    const renderGlobe = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const world = (await loadWorldData()) as any;
      const land = topojson.feature(world, world.objects.land);

      svg.selectAll("*").remove();

      // 海（背景の円）
      svg
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", projection.scale())
        .attr("fill", "#e3f2fd")
        .attr("stroke", "#90caf9")
        .attr("stroke-width", 1.5);

      // グラティキュール（経緯線）
      const graticule = d3.geoGraticule();
      svg
        .append("path")
        .datum(graticule())
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#bbdefb")
        .attr("stroke-width", 0.4);

      // 陸地
      svg
        .append("path")
        .datum(land)
        .attr("d", path)
        .attr("fill", "#81c784")
        .attr("stroke", "#388e3c")
        .attr("stroke-width", 0.5);

      // 昼夜境界線（ターミネーター）
      const [sunLon, sunLat] = subsolarPoint(dayOfYear);
      const nightCircle = d3
        .geoCircle()
        .center([sunLon + 180, -sunLat])
        .radius(90);

      svg
        .append("path")
        .datum(nightCircle())
        .attr("d", path)
        .attr("fill", "rgba(25, 25, 112, 0.35)")
        .attr("stroke", "rgba(25, 25, 112, 0.6)")
        .attr("stroke-width", 1);

      // 赤道を強調
      const equator = d3.geoCircle().center([0, 90]).radius(90);
      svg
        .append("path")
        .datum(equator())
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#f44336")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,3");

      // 北回帰線・南回帰線
      [23.4, -23.4].forEach((lat) => {
        const tropic = d3
          .geoCircle()
          .center([0, lat > 0 ? 90 : -90])
          .radius(90 - Math.abs(lat));
        svg
          .append("path")
          .datum(tropic())
          .attr("d", path)
          .attr("fill", "none")
          .attr("stroke", "#ff9800")
          .attr("stroke-width", 0.8)
          .attr("stroke-dasharray", "3,3");
      });

      // 北極圏・南極圏
      [66.5, -66.5].forEach((lat) => {
        const arcticCircle = d3
          .geoCircle()
          .center([0, lat > 0 ? 90 : -90])
          .radius(90 - Math.abs(lat));
        svg
          .append("path")
          .datum(arcticCircle())
          .attr("d", path)
          .attr("fill", "none")
          .attr("stroke", "#2196f3")
          .attr("stroke-width", 0.8)
          .attr("stroke-dasharray", "3,3");
      });

      // 太陽直下点
      const sunProjected = projection([sunLon, sunLat]);
      if (sunProjected) {
        svg
          .append("circle")
          .attr("cx", sunProjected[0])
          .attr("cy", sunProjected[1])
          .attr("r", 6)
          .attr("fill", "#ffc107")
          .attr("stroke", "#f57f17")
          .attr("stroke-width", 2);
      }

      // 輪郭
      svg
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", projection.scale())
        .attr("fill", "none")
        .attr("stroke", "#455a64")
        .attr("stroke-width", 1.5);
    };

    renderGlobe();
  }, [dayOfYear, width, height, loadWorldData]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ cursor: "grab", maxWidth: "100%", height: "auto" }}
      viewBox={`0 0 ${width} ${height}`}
    />
  );
}
