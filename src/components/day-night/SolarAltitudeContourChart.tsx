"use client";

import React, { useRef, useEffect, useMemo, useId } from "react";
import * as d3 from "d3";
import {
  solarNoonAltitude,
  MONTH_NAMES_JA,
  doyToDate,
  AXIAL_TILT_DEFAULT,
  tropicLatitude,
  arcticCircleLatitude,
} from "@/lib/solar";

interface SolarAltitudeContourChartProps {
  dayOfYear: number;
  axialTilt?: number;
  width?: number;
  height?: number;
}

export default function SolarAltitudeContourChart({
  dayOfYear,
  axialTilt = AXIAL_TILT_DEFAULT,
  width = 650,
  height = 420,
}: SolarAltitudeContourChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");

  // Pre-compute the solar altitude grid (recompute when axialTilt changes)
  const gridData = useMemo(() => {
    const nx = 365; // days of year
    const ny = 181; // latitudes: 90°N to 90°S (1° steps)
    const values = new Float64Array(nx * ny);
    for (let iy = 0; iy < ny; iy++) {
      const lat = 90 - iy; // iy=0 → 90°N, iy=180 → 90°S
      for (let ix = 0; ix < nx; ix++) {
        values[iy * nx + ix] = solarNoonAltitude(lat, ix + 1, axialTilt);
      }
    }
    // Compute annual average solar noon altitude per latitude
    const avgByLat = new Float64Array(ny);
    for (let iy = 0; iy < ny; iy++) {
      let sum = 0;
      for (let ix = 0; ix < nx; ix++) {
        sum += values[iy * nx + ix];
      }
      avgByLat[iy] = sum / nx;
    }
    return { values, nx, ny, avgByLat };
  }, [axialTilt]);

  useEffect(() => {
    if (!svgRef.current) return;
    const { values, nx, ny, avgByLat } = gridData;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 22, right: 190, bottom: 45, left: 60 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // --- Scales ---
    const xGrid = d3.scaleLinear().domain([0, nx]).range([0, w]);
    const yGrid = d3.scaleLinear().domain([0, ny]).range([0, h]);
    const latToY = d3.scaleLinear().domain([90, -90]).range([0, h]);
    const xDayScale = d3.scaleLinear().domain([1, 365]).range([0, w]);

    // Color: warm = high altitude (hot sun), cool = low altitude
    const color = d3
      .scaleSequential()
      .domain([0, 90])
      .interpolator(d3.interpolateYlOrRd);

    // --- Contours ---
    const thresholds = d3.range(0, 91, 1); // every 1° for smooth fill
    const contours = d3
      .contours()
      .size([nx, ny])
      .thresholds(thresholds)(Array.from(values));

    // GeoPath with grid→SVG transform
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geoTransformDef: any = {
      point(x: number, y: number) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as any).stream.point(xGrid(x), yGrid(y));
      },
    };
    const pathGen = d3.geoPath(d3.geoTransform(geoTransformDef));

    // Defs & clip
    const clipId = `alt-contour-clip-${uid}`;
    const gradId = `alt-contour-grad-${uid}`;

    const defs = svg.append("defs");
    defs
      .append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("width", w)
      .attr("height", h);

    const chart = g.append("g").attr("clip-path", `url(#${clipId})`);

    // Filled contours
    chart
      .selectAll("path.fill")
      .data(contours)
      .enter()
      .append("path")
      .attr("d", (d) => pathGen(d))
      .attr("fill", (d) => color(d.value))
      .attr("stroke", "none");

    // Contour lines (every 10°)
    chart
      .selectAll("path.line")
      .data(
        contours.filter(
          (c) => c.value % 10 === 0 && c.value > 0 && c.value < 90
        )
      )
      .enter()
      .append("path")
      .attr("d", (d) => pathGen(d))
      .attr("fill", "none")
      .attr(
        "stroke",
        (d) =>
          d.value === 90 ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.22)"
      )
      .attr("stroke-width", (d) => (d.value === 90 ? 1.5 : 0.7));

    // --- Special latitude reference lines ---
    const tropic = tropicLatitude(axialTilt);
    const arctic = arcticCircleLatitude(axialTilt);
    const specialLats = [arctic, tropic, 0, -tropic, -arctic];
    specialLats.forEach((lat) => {
      g.append("line")
        .attr("x1", 0)
        .attr("x2", w)
        .attr("y1", latToY(lat))
        .attr("y2", latToY(lat))
        .attr("stroke", "rgba(255,255,255,0.5)")
        .attr("stroke-width", lat === 0 ? 1 : 0.7)
        .attr("stroke-dasharray", lat === 0 ? "none" : "3,3");
    });

    // --- Contour line labels ---
    const labelColumns = [75, 260]; // ~mid-March, ~mid-September
    const labelAngles = [10, 20, 30, 40, 50, 60, 70, 80];
    const placed: Array<{ x: number; y: number }> = [];

    labelColumns.forEach((col) => {
      labelAngles.forEach((targetA) => {
        for (let iy = 0; iy < ny - 1; iy++) {
          const v1 = values[iy * nx + col];
          const v2 = values[(iy + 1) * nx + col];
          if (
            (v1 >= targetA && v2 < targetA) ||
            (v1 < targetA && v2 >= targetA)
          ) {
            const t = (targetA - v1) / (v2 - v1);
            const sx = xGrid(col);
            const sy = yGrid(iy + t);

            // Avoid overlapping labels
            if (
              placed.some(
                (p) => Math.abs(p.x - sx) < 35 && Math.abs(p.y - sy) < 15
              )
            )
              continue;

            placed.push({ x: sx, y: sy });

            const label = `${targetA}°`;
            g.append("rect")
              .attr("x", sx - 13)
              .attr("y", sy - 8)
              .attr("width", 26)
              .attr("height", 15)
              .attr("fill", "white")
              .attr("fill-opacity", 0.88)
              .attr("rx", 3)
              .attr("stroke", "rgba(0,0,0,0.12)")
              .attr("stroke-width", 0.5);

            g.append("text")
              .attr("x", sx)
              .attr("y", sy + 4)
              .attr("text-anchor", "middle")
              .style("font-size", "9px")
              .style("fill", "#333")
              .style("font-weight", "600")
              .text(label);
          }
        }
      });
    });

    // --- Axes ---
    // X axis (months)
    const monthTicks = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
    g.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(
        d3
          .axisBottom(xDayScale)
          .tickValues(monthTicks)
          .tickFormat((_d, i) => MONTH_NAMES_JA[i])
      )
      .selectAll("text")
      .style("font-size", "11px");

    // Y axis (latitude) — tick values adapt to current axial tilt
    const yTickValues = Array.from(
      new Set([-90, -arctic, -45, -tropic, 0, tropic, 45, arctic, 90].map(v => Math.round(v * 10) / 10))
    ).sort((a, b) => b - a);
    g.append("g")
      .call(
        d3
          .axisLeft(latToY)
          .tickValues(yTickValues)
          .tickFormat((d) => {
            const v = d as number;
            if (v === 0) return "0°";
            return v > 0 ? `${v}°N` : `${Math.abs(v)}°S`;
          })
      )
      .selectAll("text")
      .style("font-size", "10px");

    // Y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -h / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#555")
      .text("緯度");

    // --- Current day marker ---
    const dx = xDayScale(dayOfYear);
    g.append("line")
      .attr("x1", dx)
      .attr("x2", dx)
      .attr("y1", 0)
      .attr("y2", h)
      .attr("stroke", "#d32f2f")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "6,3");

    const di = doyToDate(dayOfYear);
    g.append("text")
      .attr("x", dx)
      .attr("y", -7)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("fill", "#d32f2f")
      .style("font-weight", "bold")
      .text(`${di.month}/${di.day}`);

    // --- Color bar legend ---
    const lw = 14;
    const lh = h;
    const lx = w + 18;
    const lg = g.append("g").attr("transform", `translate(${lx},0)`);

    const grad = defs
      .append("linearGradient")
      .attr("id", gradId)
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");

    const nStops = 12;
    for (let i = 0; i <= nStops; i++) {
      const t = i / nStops;
      grad
        .append("stop")
        .attr("offset", `${t * 100}%`)
        .attr("stop-color", color(90 * t));
    }

    lg.append("rect")
      .attr("width", lw)
      .attr("height", lh)
      .attr("fill", `url(#${gradId})`)
      .attr("stroke", "#999")
      .attr("stroke-width", 0.5);

    const legendScale = d3.scaleLinear().domain([90, 0]).range([0, lh]);
    lg.append("g")
      .attr("transform", `translate(${lw},0)`)
      .call(
        d3
          .axisRight(legendScale)
          .tickValues([0, 10, 20, 30, 40, 50, 60, 70, 80, 90])
          .tickFormat((d) => `${d}°`)
      )
      .selectAll("text")
      .style("font-size", "9px");

    lg.append("text")
      .attr("x", lw / 2)
      .attr("y", -8)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#555")
      .text("南中高度");

    // --- Annual average side chart ---
    const sideW = 70;
    const sideX = w + 85; // after color bar area (18 + 14 + ~53)
    const sg = g.append("g").attr("transform", `translate(${sideX},0)`);

    // Clip path for side chart
    const sideClipId = `alt-side-clip-${uid}`;
    defs
      .append("clipPath")
      .attr("id", sideClipId)
      .append("rect")
      .attr("width", sideW)
      .attr("height", h);

    // Background
    sg.append("rect")
      .attr("width", sideW)
      .attr("height", h)
      .attr("fill", "#fefce8")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 0.5);

    // Scale for annual average altitude (x-axis of side chart)
    const sideXScale = d3.scaleLinear().domain([0, 90]).range([0, sideW]);

    // Reference grid lines
    [30, 60].forEach((v) => {
      sg.append("line")
        .attr("x1", sideXScale(v))
        .attr("x2", sideXScale(v))
        .attr("y1", 0)
        .attr("y2", h)
        .attr("stroke", "rgba(0,0,0,0.06)")
        .attr("stroke-width", 0.5);
    });

    // Special latitude reference lines (continuing from contour chart)
    specialLats.forEach((lat) => {
      sg.append("line")
        .attr("x1", 0)
        .attr("x2", sideW)
        .attr("y1", latToY(lat))
        .attr("y2", latToY(lat))
        .attr("stroke", "rgba(0,0,0,0.08)")
        .attr("stroke-width", 0.5)
        .attr("stroke-dasharray", "2,2");
    });

    // Build line data: [avgAltitude, latitude]
    const lineData: [number, number][] = [];
    for (let iy = 0; iy < ny; iy++) {
      lineData.push([avgByLat[iy], 90 - iy]);
    }

    const sideClipG = sg.append("g").attr("clip-path", `url(#${sideClipId})`);

    // Area fill (from x=0 to the line)
    const areaPath = d3
      .area<[number, number]>()
      .x0(0)
      .x1((d) => sideXScale(d[0]))
      .y((d) => latToY(d[1]))
      .curve(d3.curveBasis);

    sideClipG
      .append("path")
      .datum(lineData)
      .attr("d", areaPath)
      .attr("fill", "rgba(251, 146, 60, 0.18)")
      .attr("stroke", "none");

    // Line
    const linePath = d3
      .line<[number, number]>()
      .x((d) => sideXScale(d[0]))
      .y((d) => latToY(d[1]))
      .curve(d3.curveBasis);

    sideClipG
      .append("path")
      .datum(lineData)
      .attr("d", linePath)
      .attr("fill", "none")
      .attr("stroke", "#ea580c")
      .attr("stroke-width", 1.8);

    // X axis (bottom) for side chart
    sg.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(
        d3
          .axisBottom(sideXScale)
          .tickValues([0, 30, 60, 90])
          .tickFormat((d) => `${d}°`)
      )
      .selectAll("text")
      .style("font-size", "9px");

    // Title for side chart
    sg.append("text")
      .attr("x", sideW / 2)
      .attr("y", -8)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#555")
      .text("年間平均");

    // --- Side chart hover interaction ---
    const sideCrosshairH = sg
      .append("line")
      .attr("x1", 0)
      .attr("x2", sideW)
      .attr("stroke", "rgba(0,0,0,0.4)")
      .attr("stroke-width", 0.8)
      .attr("stroke-dasharray", "4,3")
      .attr("pointer-events", "none")
      .style("display", "none");

    const sideDot = sg
      .append("circle")
      .attr("r", 4)
      .attr("fill", "#ea580c")
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr("pointer-events", "none")
      .style("display", "none");

    // Side tooltip group
    const sideTooltip = sg
      .append("g")
      .attr("pointer-events", "none")
      .style("display", "none");

    const sideTooltipBg = sideTooltip
      .append("rect")
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", "rgba(15,23,42,0.88)")
      .attr("stroke", "rgba(255,255,255,0.15)")
      .attr("stroke-width", 0.5);

    const sideTooltipLine1 = sideTooltip
      .append("text")
      .attr("fill", "white")
      .style("font-size", "11px")
      .style("font-weight", "600");

    const sideTooltipLine2 = sideTooltip
      .append("text")
      .attr("fill", "#fb923c")
      .style("font-size", "12px")
      .style("font-weight", "700");

    // Invisible overlay for side chart mouse events
    sg.append("rect")
      .attr("width", sideW)
      .attr("height", h)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .style("cursor", "crosshair")
      .on("mousemove", function (event: MouseEvent) {
        const [, my] = d3.pointer(event, this);
        const cy = Math.max(0, Math.min(h, my));

        const latVal = latToY.invert(cy);
        const clampedLat = Math.max(-90, Math.min(90, latVal));

        // Look up average altitude (interpolate from avgByLat)
        const iyFloat = 90 - clampedLat; // continuous index
        const iy0 = Math.floor(iyFloat);
        const iy1 = Math.min(ny - 1, iy0 + 1);
        const frac = iyFloat - iy0;
        const avgAlt = avgByLat[iy0] * (1 - frac) + avgByLat[iy1] * frac;

        // Crosshair
        sideCrosshairH.attr("y1", cy).attr("y2", cy).style("display", null);

        // Dot on the line
        const dotX = sideXScale(avgAlt);
        sideDot.attr("cx", dotX).attr("cy", cy).style("display", null);

        // Format latitude
        const latAbs = Math.abs(clampedLat).toFixed(1);
        const latDir = clampedLat > 0 ? "°N" : clampedLat < 0 ? "°S" : "°";
        const latStr = `緯度 ${latAbs}${latDir}`;
        const avgStr = `平均 ${avgAlt.toFixed(1)}°`;

        sideTooltipLine1.text(latStr);
        sideTooltipLine2.text(avgStr);

        // Measure text for sizing
        const maxTW = Math.max(
          (sideTooltipLine1.node()?.getComputedTextLength() ?? 0),
          (sideTooltipLine2.node()?.getComputedTextLength() ?? 0)
        );
        const sPadX = 8;
        const sPadY = 6;
        const sLineH = 16;
        const sBgW = maxTW + sPadX * 2;
        const sBgH = sLineH * 2 + sPadY * 2 - 4;

        // Position tooltip: prefer left of dot, flip if needed
        let stx = dotX + 10;
        let sty = cy - sBgH - 8;
        if (stx + sBgW > sideW) stx = dotX - sBgW - 10;
        if (stx < 0) stx = 2;
        if (sty < 0) sty = cy + 10;

        sideTooltip.attr("transform", `translate(${stx},${sty})`).style("display", null);
        sideTooltipBg.attr("width", sBgW).attr("height", sBgH);
        sideTooltipLine1.attr("x", sPadX).attr("y", sPadY + 12);
        sideTooltipLine2.attr("x", sPadX).attr("y", sPadY + 12 + sLineH);
      })
      .on("mouseleave", function () {
        sideCrosshairH.style("display", "none");
        sideDot.style("display", "none");
        sideTooltip.style("display", "none");
      });

    // --- Hover tooltip with crosshairs ---
    const crosshairV = g
      .append("line")
      .attr("y1", 0)
      .attr("y2", h)
      .attr("stroke", "rgba(0,0,0,0.4)")
      .attr("stroke-width", 0.8)
      .attr("stroke-dasharray", "4,3")
      .attr("pointer-events", "none")
      .style("display", "none");

    const crosshairH = g
      .append("line")
      .attr("x1", 0)
      .attr("x2", w)
      .attr("stroke", "rgba(0,0,0,0.4)")
      .attr("stroke-width", 0.8)
      .attr("stroke-dasharray", "4,3")
      .attr("pointer-events", "none")
      .style("display", "none");

    // Tooltip group
    const tooltip = g
      .append("g")
      .attr("pointer-events", "none")
      .style("display", "none");

    const tooltipBg = tooltip
      .append("rect")
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", "rgba(15,23,42,0.88)")
      .attr("stroke", "rgba(255,255,255,0.15)")
      .attr("stroke-width", 0.5);

    const tooltipLine1 = tooltip
      .append("text")
      .attr("fill", "white")
      .style("font-size", "11px")
      .style("font-weight", "600");

    const tooltipLine2 = tooltip
      .append("text")
      .attr("fill", "rgba(255,255,255,0.85)")
      .style("font-size", "11px");

    const tooltipLine3 = tooltip
      .append("text")
      .attr("fill", "#fb923c")
      .style("font-size", "12px")
      .style("font-weight", "700");

    // Invisible overlay to capture mouse events
    g.append("rect")
      .attr("width", w)
      .attr("height", h)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .style("cursor", "crosshair")
      .on("mousemove", function (event: MouseEvent) {
        const [mx, my] = d3.pointer(event, this);

        const cx = Math.max(0, Math.min(w, mx));
        const cy = Math.max(0, Math.min(h, my));

        const dayVal = Math.round(xDayScale.invert(cx));
        const latVal = latToY.invert(cy);
        const clampedDay = Math.max(1, Math.min(365, dayVal));
        const clampedLat = Math.max(-90, Math.min(90, latVal));
        const altitude = solarNoonAltitude(clampedLat, clampedDay, axialTilt);
        const dateInfo = doyToDate(clampedDay);

        crosshairV.attr("x1", cx).attr("x2", cx).style("display", null);
        crosshairH.attr("y1", cy).attr("y2", cy).style("display", null);

        const latAbs = Math.abs(clampedLat).toFixed(1);
        const latDir =
          clampedLat > 0 ? "°N" : clampedLat < 0 ? "°S" : "°";
        const latStr = `${latAbs}${latDir}`;

        const dateStr = `${dateInfo.month}月${dateInfo.day}日`;
        const altStr = `南中高度 ${altitude.toFixed(1)}°`;

        tooltipLine1.text(dateStr);
        tooltipLine2.text(`緯度 ${latStr}`);
        tooltipLine3.text(altStr);

        const maxTextW = Math.max(
          (tooltipLine1.node()?.getComputedTextLength() ?? 0),
          (tooltipLine2.node()?.getComputedTextLength() ?? 0),
          (tooltipLine3.node()?.getComputedTextLength() ?? 0)
        );
        const padX = 10;
        const padY = 8;
        const lineH = 16;
        const bgW = maxTextW + padX * 2;
        const bgH = lineH * 3 + padY * 2 - 4;

        let tx = cx + 14;
        let ty = cy - bgH - 8;
        if (tx + bgW > w) tx = cx - bgW - 14;
        if (ty < 0) ty = cy + 14;

        tooltip.attr("transform", `translate(${tx},${ty})`).style("display", null);
        tooltipBg.attr("width", bgW).attr("height", bgH);
        tooltipLine1.attr("x", padX).attr("y", padY + 12);
        tooltipLine2.attr("x", padX).attr("y", padY + 12 + lineH);
        tooltipLine3.attr("x", padX).attr("y", padY + 12 + lineH * 2);
      })
      .on("mouseleave", function () {
        crosshairV.style("display", "none");
        crosshairH.style("display", "none");
        tooltip.style("display", "none");
      });
  }, [dayOfYear, axialTilt, width, height, gridData, uid]);

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
