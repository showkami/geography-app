"use client";

import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { PROJECTIONS } from "@/lib/projections";
import { drawTissotIndicatrices } from "./DistortionOverlay";

interface ProjectionMapProps {
  projectionId: string;
  lambda: number;
  phi: number;
  gamma: number;
  showTissot: boolean;
  onRotationChange: (lambda: number, phi: number) => void;
  width?: number;
  height?: number;
}

export default function ProjectionMap({
  projectionId,
  lambda,
  phi,
  gamma,
  showTissot,
  onRotationChange,
  width = 800,
  height = 500,
}: ProjectionMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const worldDataRef = useRef<any>(null);

  // ドラッグ中に最新の回転値を参照するための ref
  const rotationRef = useRef({ lambda, phi });
  rotationRef.current.lambda = lambda;
  rotationRef.current.phi = phi;

  const onRotationChangeRef = useRef(onRotationChange);
  onRotationChangeRef.current = onRotationChange;

  const loadWorldData = useCallback(async () => {
    if (worldDataRef.current) return worldDataRef.current;
    const res = await fetch("/data/world-110m.json");
    const data = await res.json();
    worldDataRef.current = data;
    return data;
  }, []);

  // ドラッグ操作の設定（レンダリングとは独立）
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    const drag = d3.drag<SVGSVGElement, unknown>().on("drag", (event) => {
      const sensitivity = 0.5;
      const current = rotationRef.current;
      const newLambda = current.lambda + event.dx * sensitivity;
      const newPhi = Math.max(
        -90,
        Math.min(90, current.phi - event.dy * sensitivity)
      );
      onRotationChangeRef.current(newLambda, newPhi);
    });

    svg.call(drag);

    return () => {
      svg.on(".drag", null);
    };
  }, []); // ドラッグは一度だけ設定

  // 地図のレンダリング
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // 投影法の設定
    const projInfo = PROJECTIONS.find((p) => p.id === projectionId);
    if (!projInfo) return;

    const projection = projInfo.factory();

    // 回転を設定してからfitExtentで自動スケーリング
    projection
      .rotate([lambda, phi, gamma])
      .precision(0.1);

    // 球面を無限大に投影する投影法には clipAngle を設定して範囲を制限
    const clipAngleDefaults: Record<string, number> = {
      stereographic: 90,
      conicConformal: 90,
    };
    if (clipAngleDefaults[projectionId]) {
      projection.clipAngle(clipAngleDefaults[projectionId]);
    }

    // パディング付きでSVG領域に収まるよう自動フィット
    const padding = 10;
    const sphere = { type: "Sphere" } as d3.GeoPermissibleObjects;
    projection.fitExtent(
      [[padding, padding], [width - padding, height - padding]],
      sphere
    );

    const path = d3.geoPath(projection);

    const render = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const world = (await loadWorldData()) as any;
      const land = topojson.feature(world, world.objects.land);
      const countries = topojson.feature(world, world.objects.countries);
      const borders = topojson.mesh(
        world,
        world.objects.countries,
        (a, b) => a !== b
      );

      svg.selectAll("*").remove();

      const g = svg.append("g");

      // 投影範囲の外枠（地球の輪郭）
      const outline = { type: "Sphere" } as d3.GeoPermissibleObjects;
      g.append("path")
        .datum(outline)
        .attr("d", path)
        .attr("fill", "#e8f4fd")
        .attr("stroke", "#90caf9")
        .attr("stroke-width", 1.5);

      // グラティキュール（経緯線）
      const graticule = d3.geoGraticule().step([15, 15]);
      g.append("path")
        .datum(graticule())
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#c5cae9")
        .attr("stroke-width", 0.4);

      // 陸地の塗りつぶし
      g.append("path")
        .datum(land)
        .attr("d", path)
        .attr("fill", "#a5d6a7")
        .attr("stroke", "none");

      // 国境線
      g.append("path")
        .datum(borders)
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#66bb6a")
        .attr("stroke-width", 0.5);

      // 赤道
      const equator = d3.geoGraticule().stepMinor([360, 0]).stepMajor([360, 0]);
      g.append("path")
        .datum({
          type: "LineString",
          coordinates: d3.range(-180, 181, 1).map((lon) => [lon, 0]),
        } as d3.GeoPermissibleObjects)
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#ef5350")
        .attr("stroke-width", 1.2)
        .attr("stroke-dasharray", "5,3");

      // ティソー指示楕円
      if (showTissot) {
        drawTissotIndicatrices(g, path, projection);
      }

      // 外枠（前面）
      g.append("path")
        .datum(outline)
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#546e7a")
        .attr("stroke-width", 1.5);
    };

    render();
  }, [projectionId, lambda, phi, gamma, showTissot, width, height, onRotationChange, loadWorldData]);

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
