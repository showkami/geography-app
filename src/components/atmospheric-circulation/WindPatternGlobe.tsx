"use client";

import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {
  CELLS,
  PRESSURE_ZONES,
  getCellBoundaries,
  monthToDayOfYear,
  type CellId,
} from "@/lib/atmospheric";
import type { Topology, Objects } from "topojson-specification";

interface WindPatternGlobeProps {
  month: number;
  highlightedCell: CellId | null;
  showPressureZones: boolean;
  showWindArrows: boolean;
  width?: number;
  height?: number;
}

interface DrawProps {
  month: number;
  highlightedCell: CellId | null;
  showPressureZones: boolean;
  showWindArrows: boolean;
}

interface ArrowSpec {
  lat: number;
  bearing: number;
  cellId: CellId;
}

function buildArrowSpecs(boundaries: {
  itczLat: number;
  nhSubtropicalLat: number;
  shSubtropicalLat: number;
  nhSubpolarLat: number;
  shSubpolarLat: number;
}): ArrowSpec[] {
  const { itczLat, nhSubtropicalLat, shSubtropicalLat, nhSubpolarLat, shSubpolarLat } = boundaries;
  return [
    // NH trade winds (ITCZ → subtropical high midpoint)
    { lat: (itczLat + nhSubtropicalLat) / 2, bearing: 225, cellId: "hadley" },
    // SH trade winds
    { lat: (itczLat + shSubtropicalLat) / 2, bearing: 315, cellId: "hadley" },
    // NH westerlies (subtropical high → subpolar low midpoint)
    { lat: (nhSubtropicalLat + nhSubpolarLat) / 2, bearing: 50, cellId: "ferrel" },
    // SH westerlies
    { lat: (shSubtropicalLat + shSubpolarLat) / 2, bearing: 130, cellId: "ferrel" },
    // NH polar easterlies (subpolar low → pole midpoint)
    { lat: (nhSubpolarLat + 90) / 2, bearing: 225, cellId: "polar" },
    // SH polar easterlies
    { lat: (shSubpolarLat + -90) / 2, bearing: 315, cellId: "polar" },
  ];
}

const ARROW_LONS = [0, 45, 90, 135, 180, -135, -90, -45];

function createLatBand(lat1: number, lat2: number): GeoJSON.Polygon {
  const n = 72;
  const coords: [number, number][] = [];
  for (let i = 0; i <= n; i++)
    coords.push([-180 + (360 * i) / n, lat1]);
  for (let i = n; i >= 0; i--)
    coords.push([-180 + (360 * i) / n, lat2]);
  coords.push(coords[0]);
  return { type: "Polygon", coordinates: [coords] };
}

function moveAlongBearing(
  lon: number,
  lat: number,
  bearing: number,
  dist: number
): [number, number] {
  const R = Math.PI / 180;
  const latR = lat * R;
  const bearR = bearing * R;
  const distR = dist * R;
  const lat2 = Math.asin(
    Math.sin(latR) * Math.cos(distR) +
      Math.cos(latR) * Math.sin(distR) * Math.cos(bearR)
  );
  const lon2 =
    lon * R +
    Math.atan2(
      Math.sin(bearR) * Math.sin(distR) * Math.cos(latR),
      Math.cos(distR) - Math.sin(latR) * Math.sin(lat2)
    );
  return [lon2 / R, lat2 / R];
}

export default function WindPatternGlobe({
  month,
  highlightedCell,
  showPressureZones,
  showWindArrows,
  width = 400,
  height = 400,
}: WindPatternGlobeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const worldDataRef = useRef<Topology<Objects<any>> | null>(null);
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const rotationRef = useRef<[number, number, number]>([0, -15, 0]);
  const propsRef = useRef<DrawProps>({
    month,
    highlightedCell,
    showPressureZones,
    showWindArrows,
  });

  useEffect(() => {
    propsRef.current = {
      month,
      highlightedCell,
      showPressureZones,
      showWindArrows,
    };
  }, [month, highlightedCell, showPressureZones, showWindArrows]);

  const loadWorldData = useCallback(async () => {
    if (worldDataRef.current) return worldDataRef.current;
    const res = await fetch("/data/world-110m.json");
    const data = await res.json();
    worldDataRef.current = data;
    return data;
  }, []);

  const drawGlobe = useCallback(
    (
      svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
      projection: d3.GeoProjection,
      path: d3.GeoPath,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      land: any,
      props: DrawProps
    ) => {
      svg.selectAll("*").remove();

      const doy = monthToDayOfYear(props.month);
      const {
        itczLat,
        nhSubtropicalLat, shSubtropicalLat,
        nhSubpolarLat, shSubpolarLat,
      } = getCellBoundaries(doy);

      // Defs for gradients
      const defs = svg.append("defs");

      // Sphere shading gradient (3D depth)
      const sphereGrad = defs.append("radialGradient")
        .attr("id", "globe-sphere-shading")
        .attr("cx", "38%")
        .attr("cy", "32%");
      sphereGrad.append("stop").attr("offset", "0%").attr("stop-color", "rgba(120,160,200,0.10)");
      sphereGrad.append("stop").attr("offset", "55%").attr("stop-color", "rgba(40,80,130,0.02)");
      sphereGrad.append("stop").attr("offset", "100%").attr("stop-color", "rgba(0,0,15,0.18)");

      // Atmosphere glow
      const glowGrad = defs.append("radialGradient")
        .attr("id", "globe-atmo-glow")
        .attr("cx", "50%")
        .attr("cy", "50%");
      glowGrad.append("stop").attr("offset", "88%").attr("stop-color", "rgba(100,160,220,0)");
      glowGrad.append("stop").attr("offset", "96%").attr("stop-color", "rgba(100,160,220,0.08)");
      glowGrad.append("stop").attr("offset", "100%").attr("stop-color", "rgba(100,160,220,0.02)");

      // Atmosphere glow circle (behind globe)
      svg
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", projection.scale()! * 1.04)
        .attr("fill", "url(#globe-atmo-glow)")
        .attr("stroke", "none");

      // Ocean
      svg
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", projection.scale()!)
        .attr("fill", "#162d4a")
        .attr("stroke", "none");

      // Graticule (subtle)
      svg
        .append("path")
        .datum(d3.geoGraticule().step([30, 30])())
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "rgba(148, 163, 184, 0.10)")
        .attr("stroke-width", 0.3);

      // Pressure zone bands — subtle, narrow, harmonious colors
      // Low pressure: coral/warm tones, High pressure: amber/cool tones
      if (props.showPressureZones) {
        const bandWidth = 5;
        const bands = [
          // ITCZ (low pressure) — warm coral
          { lat1: itczLat - bandWidth, lat2: itczLat + bandWidth, color: "#ff8a65", op: 0.12 },
          // Subtropical highs — amber
          { lat1: nhSubtropicalLat - bandWidth, lat2: nhSubtropicalLat + bandWidth, color: "#ffd54f", op: 0.09 },
          { lat1: shSubtropicalLat - bandWidth, lat2: shSubtropicalLat + bandWidth, color: "#ffd54f", op: 0.09 },
          // Subpolar lows — sky blue
          { lat1: nhSubpolarLat - bandWidth, lat2: nhSubpolarLat + bandWidth, color: "#4fc3f7", op: 0.09 },
          { lat1: shSubpolarLat - bandWidth, lat2: shSubpolarLat + bandWidth, color: "#4fc3f7", op: 0.09 },
          // Polar highs — ice blue-grey
          { lat1: 78, lat2: 90, color: "#b0bec5", op: 0.10 },
          { lat1: -90, lat2: -78, color: "#b0bec5", op: 0.10 },
        ];
        bands.forEach((b) => {
          svg
            .append("path")
            .datum(createLatBand(b.lat1, b.lat2))
            .attr("d", path)
            .attr("fill", b.color)
            .attr("opacity", b.op)
            .attr("stroke", "none");
        });

        // Boundary lines at pressure zone latitudes
        const boundaryLines = [
          { lat: nhSubtropicalLat, color: "#ffd54f" },
          { lat: shSubtropicalLat, color: "#ffd54f" },
          { lat: nhSubpolarLat, color: "#4fc3f7" },
          { lat: shSubpolarLat, color: "#4fc3f7" },
        ];
        boundaryLines.forEach((bl) => {
          svg
            .append("path")
            .datum(d3.geoCircle().center([0, 90]).radius(90 - bl.lat)())
            .attr("d", path)
            .attr("fill", "none")
            .attr("stroke", bl.color)
            .attr("stroke-width", 0.6)
            .attr("stroke-dasharray", "3,5")
            .attr("opacity", 0.35);
        });
      }

      // Land
      svg
        .append("path")
        .datum(land)
        .attr("d", path)
        .attr("fill", "#2a6b48")
        .attr("stroke", "#4a9a6a")
        .attr("stroke-width", 0.4)
        .attr("opacity", 0.88);

      // Equator
      svg
        .append("path")
        .datum(d3.geoCircle().center([0, 90]).radius(90)())
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#78909c")
        .attr("stroke-width", 1.2)
        .attr("stroke-dasharray", "6,4");

      // ITCZ line
      svg
        .append("path")
        .datum(
          d3.geoCircle().center([0, 90]).radius(90 - itczLat)()
        )
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#ef5350")
        .attr("stroke-width", 2.5)
        .attr("stroke-dasharray", "6,3");

      // Sphere shading overlay (3D depth)
      svg
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", projection.scale()!)
        .attr("fill", "url(#globe-sphere-shading)")
        .attr("stroke", "none");

      // Wind arrows
      if (props.showWindArrows) {
        CELLS.forEach((cell) => {
          defs
            .append("marker")
            .attr("id", `globe-arrow-${cell.id}`)
            .attr("viewBox", "0 0 8 6")
            .attr("refX", 7)
            .attr("refY", 3)
            .attr("markerWidth", 7)
            .attr("markerHeight", 5)
            .attr("orient", "auto")
            .append("polygon")
            .attr("points", "0,0.5 8,3 0,5.5")
            .attr("fill", cell.color);
        });

        const arrowSpecs = buildArrowSpecs({
          itczLat, nhSubtropicalLat, shSubtropicalLat,
          nhSubpolarLat, shSubpolarLat,
        });
        const arrowLen = 14;

        arrowSpecs.forEach((spec) => {
          const cell = CELLS.find((c) => c.id === spec.cellId)!;
          const isActive =
            !props.highlightedCell ||
            props.highlightedCell === spec.cellId;

          ARROW_LONS.forEach((lon) => {
            const end = moveAlongBearing(lon, spec.lat, spec.bearing, arrowLen);
            const startPt = projection([lon, spec.lat]);
            const endPt = projection(end);
            if (startPt && endPt) {
              svg
                .append("path")
                .datum({
                  type: "LineString" as const,
                  coordinates: [[lon, spec.lat], end],
                })
                .attr("d", path)
                .attr("fill", "none")
                .attr("stroke", cell.color)
                .attr("stroke-width", isActive ? 2.2 : 1.0)
                .attr("marker-end", `url(#globe-arrow-${cell.id})`)
                .attr("opacity", isActive ? 0.75 : 0.15)
                .attr("stroke-linecap", "round");
            }
          });
        });
      }

      // On-globe labels for pressure zones & ITCZ
      if (props.showPressureZones) {
        const labelLon = -projection.rotate()[0];
        const labelData: { lat: number; text: string; color: string; bold?: boolean }[] = [
          { lat: itczLat, text: "ITCZ", color: "#ffab91", bold: true },
          { lat: nhSubtropicalLat, text: "高", color: "#ffe082" },
          { lat: shSubtropicalLat, text: "高", color: "#ffe082" },
          { lat: nhSubpolarLat, text: "低", color: "#81d4fa" },
          { lat: shSubpolarLat, text: "低", color: "#81d4fa" },
          { lat: 85, text: "高", color: "#cfd8dc" },
          { lat: -85, text: "高", color: "#cfd8dc" },
        ];

        labelData.forEach((ld) => {
          const pt = projection([labelLon, ld.lat]);
          if (!pt) return;
          const dist = Math.sqrt(
            (pt[0] - width / 2) ** 2 + (pt[1] - height / 2) ** 2
          );
          if (dist > projection.scale()! * 0.95) return;

          svg
            .append("text")
            .attr("x", pt[0])
            .attr("y", pt[1])
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", ld.bold ? 12 : 10)
            .attr("font-weight", ld.bold ? 700 : 600)
            .attr("fill", ld.color)
            .attr("stroke", "rgba(10, 20, 40, 0.75)")
            .attr("stroke-width", 2.8)
            .attr("paint-order", "stroke")
            .text(ld.text);
        });
      }

      // Outline
      svg
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", projection.scale()!)
        .attr("fill", "none")
        .attr("stroke", "rgba(148, 163, 184, 0.25)")
        .attr("stroke-width", 1.5);

      // Note
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height - 6)
        .attr("text-anchor", "middle")
        .attr("font-size", 9)
        .attr("fill", "#64748b")
        .text("※ 気圧帯・ITCZは帯状平均（経度差は省略）");
    },
    [width, height]
  );

  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  // Projection setup
  useEffect(() => {
    if (!svgRef.current) return;
    const projection = d3
      .geoOrthographic()
      .scale(width / 2.2)
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .rotate(rotationRef.current);
    projectionRef.current = projection;
  }, [width, height]);

  const handleDrag = useCallback(
    (dx: number, dy: number) => {
      const projection = projectionRef.current;
      if (!projection || !svgRef.current || !worldDataRef.current) return;
      const rotate = projection.rotate();
      const k = 0.5;
      const newRotation: [number, number, number] = [
        rotate[0] + dx * k,
        rotate[1] - dy * k,
        rotate[2],
      ];
      projection.rotate(newRotation);
      rotationRef.current = newRotation;

      const svg = d3.select(svgRef.current);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const world = worldDataRef.current as any;
      const land = topojson.feature(world, world.objects.land);
      drawGlobe(
        svg,
        projection,
        d3.geoPath(projection),
        land,
        propsRef.current
      );
    },
    [drawGlobe]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      svgRef.current?.setPointerCapture(e.pointerId);
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!lastPointerRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      handleDrag(dx, dy);
    },
    [handleDrag]
  );

  const onPointerUp = useCallback(() => {
    lastPointerRef.current = null;
  }, []);

  // Re-render on prop changes
  useEffect(() => {
    if (!svgRef.current || !projectionRef.current) return;
    const svg = d3.select(svgRef.current);
    const projection = projectionRef.current;
    const geoPath = d3.geoPath(projection);

    const render = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const world = (await loadWorldData()) as any;
      const land = topojson.feature(world, world.objects.land);
      drawGlobe(svg, projection, geoPath, land, {
        month,
        highlightedCell,
        showPressureZones,
        showWindArrows,
      });
    };
    render();
  }, [
    month,
    highlightedCell,
    showPressureZones,
    showWindArrows,
    width,
    height,
    loadWorldData,
    drawGlobe,
  ]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ cursor: "grab", maxWidth: "100%", height: "auto", touchAction: "none" }}
      viewBox={`0 0 ${width} ${height}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  );
}
