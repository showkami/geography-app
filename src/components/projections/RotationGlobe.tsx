"use client";

import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { Box, Typography, Stack } from "@mui/material";

interface RotationGlobeProps {
  lambda: number;
  phi: number;
  gamma: number;
  size?: number;
}

/**
 * 投影の回転パラメータ（λ, φ, γ）が球面上で何を意味するかを
 * 地球儀上に可視化するコンポーネント。
 *
 * 表示要素:
 * - 投影の赤道（中心大円）: 回転座標系の赤道。円筒図法ではここに沿って歪みが最小
 * - 中央経線: 回転座標系の経度0°の半大円
 * - 切断線: 回転座標系の経度180°の半大円（地図の「切れ目」）
 * - 投影の中心点: 回転座標系の原点
 * - 回転後の極: 回転座標系の北極・南極
 */
export default function RotationGlobe({
  lambda,
  phi,
  gamma,
  size = 260,
}: RotationGlobeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const worldDataRef = useRef<any>(null);
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const globeRotationRef = useRef<[number, number]>([0, -20]);

  // ドラッグハンドラからも最新のpropsを参照するためのref
  const propsRef = useRef({ lambda, phi, gamma });
  propsRef.current = { lambda, phi, gamma };

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      land: any,
      lam: number,
      ph: number,
      gam: number
    ) => {
      svg.selectAll("*").remove();

      const path = d3.geoPath(projection);
      const r = projection.scale()!;
      const cx = size / 2;
      const cy = size / 2;

      // 地理座標の点が地球儀の見える側にあるか判定
      const isVisible = (point: [number, number]) => {
        const rot = projection.rotate();
        return (
          d3.geoDistance(point, [-rot[0], -rot[1]]) < Math.PI / 2
        );
      };

      // === 背景（海） ===
      svg
        .append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", r)
        .attr("fill", "#f5f7fa")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);

      // === グラティキュール ===
      const graticule = d3.geoGraticule().step([30, 30]);
      svg
        .append("path")
        .datum(graticule())
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", 0.4);

      // === 陸地（薄い色） ===
      svg
        .append("path")
        .datum(land)
        .attr("d", path)
        .attr("fill", "#d4ddd0")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 0.3);

      // === 地理的赤道（参照線、細い灰色） ===
      const equatorCoords = d3
        .range(-180, 181, 2)
        .map((lon) => [lon, 0] as [number, number]);
      svg
        .append("path")
        .datum({
          type: "LineString",
          coordinates: equatorCoords,
        } as d3.GeoPermissibleObjects)
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#999")
        .attr("stroke-width", 0.8)
        .attr("stroke-dasharray", "2,2");

      // === 回転の計算 ===
      const rotation = d3.geoRotation([lam, ph, gam]);

      // === 切断線（回転座標系の経度±180°）===
      // 円筒図法では、この線で地球を切り開いて平面に展開する
      const antiMeridianCoords = d3
        .range(-89, 90, 2)
        .map((lat) => rotation.invert([180, lat]));
      svg
        .append("path")
        .datum({
          type: "LineString",
          coordinates: antiMeridianCoords,
        } as d3.GeoPermissibleObjects)
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#ff9800")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,3")
        .attr("stroke-linecap", "round");

      // === 中央経線（回転座標系の経度0°）===
      const centralMeridianCoords = d3
        .range(-89, 90, 2)
        .map((lat) => rotation.invert([0, lat]));
      svg
        .append("path")
        .datum({
          type: "LineString",
          coordinates: centralMeridianCoords,
        } as d3.GeoPermissibleObjects)
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#1565c0")
        .attr("stroke-width", 2)
        .attr("stroke-linecap", "round");

      // === 投影の赤道（回転座標系の赤道＝大円）===
      // 円筒図法では、この大円に沿って歪みが最小になる
      const projEquatorCoords = d3
        .range(-180, 181, 2)
        .map((lon) => rotation.invert([lon, 0]));
      svg
        .append("path")
        .datum({
          type: "LineString",
          coordinates: projEquatorCoords,
        } as d3.GeoPermissibleObjects)
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#e53935")
        .attr("stroke-width", 2.5)
        .attr("stroke-linecap", "round");

      // === 投影中心点 ===
      const centerPoint = rotation.invert([0, 0]) as [number, number];
      const centerProjected = projection(centerPoint);
      if (centerProjected && isVisible(centerPoint)) {
        svg
          .append("circle")
          .attr("cx", centerProjected[0])
          .attr("cy", centerProjected[1])
          .attr("r", 6)
          .attr("fill", "#ffc107")
          .attr("stroke", "#e65100")
          .attr("stroke-width", 2);
      }

      // === 回転後の北極 ===
      const northPole = rotation.invert([0, 90]) as [number, number];
      const northProjected = projection(northPole);
      if (northProjected && isVisible(northPole)) {
        const x = northProjected[0];
        const y = northProjected[1];
        const s = 6;
        svg
          .append("polygon")
          .attr(
            "points",
            `${x},${y - s} ${x - s * 0.866},${y + s * 0.5} ${x + s * 0.866},${y + s * 0.5}`
          )
          .attr("fill", "#e53935")
          .attr("stroke", "#b71c1c")
          .attr("stroke-width", 1);
      }

      // === 回転後の南極 ===
      const southPole = rotation.invert([0, -90]) as [number, number];
      const southProjected = projection(southPole);
      if (southProjected && isVisible(southPole)) {
        const x = southProjected[0];
        const y = southProjected[1];
        const s = 6;
        svg
          .append("polygon")
          .attr(
            "points",
            `${x},${y + s} ${x - s * 0.866},${y - s * 0.5} ${x + s * 0.866},${y - s * 0.5}`
          )
          .attr("fill", "#e53935")
          .attr("stroke", "#b71c1c")
          .attr("stroke-width", 1);
      }

      // === 輪郭 ===
      svg
        .append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#666")
        .attr("stroke-width", 1.5);
    },
    [size]
  );

  // プロジェクションとドラッグの初期化
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const projection = d3
      .geoOrthographic()
      .scale(size / 2.3)
      .translate([size / 2, size / 2])
      .clipAngle(90)
      .rotate([
        globeRotationRef.current[0],
        globeRotationRef.current[1],
        0,
      ]);

    projectionRef.current = projection;

    // ドラッグで地球儀の視点を回転（投影パラメータとは独立）
    const drag = d3.drag<SVGSVGElement, unknown>().on("drag", (event) => {
      const rotate = projection.rotate();
      const k = 0.5;
      const newRotation: [number, number, number] = [
        rotate[0] + event.dx * k,
        Math.max(-90, Math.min(90, rotate[1] - event.dy * k)),
        0,
      ];
      projection.rotate(newRotation);
      globeRotationRef.current = [newRotation[0], newRotation[1]];

      if (!worldDataRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const world = worldDataRef.current as any;
      const land = topojson.feature(world, world.objects.land);
      const { lambda: l, phi: p, gamma: g } = propsRef.current;
      drawGlobe(svg, projection, land, l, p, g);
    });

    svg.call(drag);

    return () => {
      svg.on(".drag", null);
    };
  }, [size, drawGlobe]);

  // λ, φ, γ の変更時に再描画
  useEffect(() => {
    if (!svgRef.current || !projectionRef.current) return;

    const svg = d3.select(svgRef.current);
    const projection = projectionRef.current;

    const render = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const world = (await loadWorldData()) as any;
      const land = topojson.feature(world, world.objects.land);
      drawGlobe(svg, projection, land, lambda, phi, gamma);
    };

    render();
  }, [lambda, phi, gamma, loadWorldData, drawGlobe]);

  return (
    <Box>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        style={{
          cursor: "grab",
          maxWidth: "100%",
          height: "auto",
          display: "block",
          margin: "0 auto",
        }}
        viewBox={`0 0 ${size} ${size}`}
      />

      {/* 凡例（コンパクト2列） */}
      <Box
        sx={{
          mt: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 0.3,
          px: 0.5,
        }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box
            sx={{
              width: 14,
              height: 3,
              bgcolor: "#e53935",
              borderRadius: 1,
              flexShrink: 0,
            }}
          />
          <Typography variant="caption" fontSize="0.65rem" lineHeight={1.2}>
            中心大円
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box
            sx={{
              width: 14,
              height: 3,
              bgcolor: "#1565c0",
              borderRadius: 1,
              flexShrink: 0,
            }}
          />
          <Typography variant="caption" fontSize="0.65rem" lineHeight={1.2}>
            中央経線
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box
            sx={{
              width: 14,
              height: 0,
              borderTop: "2px dashed #ff9800",
              flexShrink: 0,
            }}
          />
          <Typography variant="caption" fontSize="0.65rem" lineHeight={1.2}>
            切断線
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box
            sx={{
              width: 9,
              height: 9,
              bgcolor: "#ffc107",
              borderRadius: "50%",
              border: "1.5px solid #e65100",
              flexShrink: 0,
            }}
          />
          <Typography variant="caption" fontSize="0.65rem" lineHeight={1.2}>
            中心点
          </Typography>
        </Stack>
      </Box>

    </Box>
  );
}
