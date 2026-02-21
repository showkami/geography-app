"use client";

import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {
  CELLS,
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

const ARROW_CONFIG: {
  lat: number;
  bearingNH: number;
  bearingSH: number;
  cellId: CellId;
}[] = [
  { lat: 15, bearingNH: 225, bearingSH: 315, cellId: "hadley" },
  { lat: 45, bearingNH: 50, bearingSH: 130, cellId: "ferrel" },
  { lat: 75, bearingNH: 225, bearingSH: 315, cellId: "polar" },
];

const ARROW_LONS = [0, 60, 120, 180, -120, -60];

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

      // Ocean
      svg
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", projection.scale()!)
        .attr("fill", "#e3f2fd")
        .attr("stroke", "#90caf9")
        .attr("stroke-width", 1.5);

      // Graticule
      svg
        .append("path")
        .datum(d3.geoGraticule()())
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#bbdefb")
        .attr("stroke-width", 0.4);

      // Pressure zone bands
      if (props.showPressureZones) {
        const bands = [
          { lat1: itczLat - 5, lat2: itczLat + 5, color: "#ef5350", op: 0.15 },
          { lat1: nhSubtropicalLat - 5, lat2: nhSubtropicalLat + 5, color: "#ff9800", op: 0.10 },
          { lat1: shSubtropicalLat - 5, lat2: shSubtropicalLat + 5, color: "#ff9800", op: 0.10 },
          { lat1: nhSubpolarLat - 5, lat2: nhSubpolarLat + 5, color: "#42a5f5", op: 0.10 },
          { lat1: shSubpolarLat - 5, lat2: shSubpolarLat + 5, color: "#42a5f5", op: 0.10 },
          { lat1: 80, lat2: 90, color: "#ab47bc", op: 0.10 },
          { lat1: -90, lat2: -80, color: "#ab47bc", op: 0.10 },
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
      }

      // Land
      svg
        .append("path")
        .datum(land)
        .attr("d", path)
        .attr("fill", "#81c784")
        .attr("stroke", "#388e3c")
        .attr("stroke-width", 0.5);

      // Equator
      svg
        .append("path")
        .datum(d3.geoCircle().center([0, 90]).radius(90)())
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#bdbdbd")
        .attr("stroke-width", 0.8)
        .attr("stroke-dasharray", "4,3");

      // ITCZ line
      svg
        .append("path")
        .datum(
          d3.geoCircle().center([0, 90]).radius(90 - itczLat)()
        )
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#ef5350")
        .attr("stroke-width", 1.8)
        .attr("stroke-dasharray", "5,3");

      // Wind arrows
      if (props.showWindArrows) {
        svg
          .append("defs")
          .append("marker")
          .attr("id", "globe-wind-arrow")
          .attr("viewBox", "0 0 6 4")
          .attr("refX", 5)
          .attr("refY", 2)
          .attr("markerWidth", 5)
          .attr("markerHeight", 3)
          .attr("orient", "auto")
          .append("polygon")
          .attr("points", "0,0 6,2 0,4")
          .attr("fill", "#546e7a");

        ARROW_CONFIG.forEach((cfg) => {
          const cell = CELLS.find((c) => c.id === cfg.cellId)!;
          const isActive =
            !props.highlightedCell ||
            props.highlightedCell === cfg.cellId;

          ARROW_LONS.forEach((lon) => {
            // NH
            const nhEnd = moveAlongBearing(
              lon,
              cfg.lat,
              cfg.bearingNH,
              6
            );
            if (
              projection([lon, cfg.lat]) &&
              projection(nhEnd)
            ) {
              svg
                .append("path")
                .datum({
                  type: "LineString" as const,
                  coordinates: [[lon, cfg.lat], nhEnd],
                })
                .attr("d", path)
                .attr("fill", "none")
                .attr("stroke", cell.color)
                .attr("stroke-width", 1.3)
                .attr("marker-end", "url(#globe-wind-arrow)")
                .attr("opacity", isActive ? 0.55 : 0.12);
            }

            // SH
            const shEnd = moveAlongBearing(
              lon,
              -cfg.lat,
              cfg.bearingSH,
              6
            );
            if (
              projection([lon, -cfg.lat]) &&
              projection(shEnd)
            ) {
              svg
                .append("path")
                .datum({
                  type: "LineString" as const,
                  coordinates: [[lon, -cfg.lat], shEnd],
                })
                .attr("d", path)
                .attr("fill", "none")
                .attr("stroke", cell.color)
                .attr("stroke-width", 1.3)
                .attr("marker-end", "url(#globe-wind-arrow)")
                .attr("opacity", isActive ? 0.55 : 0.12);
            }
          });
        });
      }

      // Outline
      svg
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", projection.scale()!)
        .attr("fill", "none")
        .attr("stroke", "#455a64")
        .attr("stroke-width", 1.5);

      // Zonal-mean note (avoid over-interpreting longitude variability)
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height - 8)
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .attr("fill", "#78909c")
        .text("※ 気圧帯・ITCZは帯状平均（経度差は省略）");
    },
    [width, height]
  );

  // Projection + drag setup
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const projection = d3
      .geoOrthographic()
      .scale(width / 2.2)
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .rotate(rotationRef.current);
    projectionRef.current = projection;

    const drag = d3
      .drag<SVGSVGElement, unknown>()
      .on("drag", (event) => {
        const rotate = projection.rotate();
        const k = 0.5;
        const newRotation: [number, number, number] = [
          rotate[0] + event.dx * k,
          rotate[1] - event.dy * k,
          rotate[2],
        ];
        projection.rotate(newRotation);
        rotationRef.current = newRotation;
        if (!worldDataRef.current) return;
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
      });
    svg.call(drag);
  }, [width, height, drawGlobe]);

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
      style={{ cursor: "grab", maxWidth: "100%", height: "auto" }}
      viewBox={`0 0 ${width} ${height}`}
    />
  );
}
