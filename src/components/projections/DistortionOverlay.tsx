"use client";

import * as d3 from "d3";
import type { GeoProjection } from "d3";

/**
 * ティソーの指示楕円（Tissot Indicatrix）を生成する
 * 球面上に等間隔に配置した小さな円を投影し、歪みを可視化する
 */
export function generateTissotIndicatrices(): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  const radius = 2.5; // 度

  for (let lon = -180; lon <= 180; lon += 30) {
    for (let lat = -80; lat <= 80; lat += 30) {
      // 極に近すぎる場所はスキップ
      if (Math.abs(lat) > 85) continue;

      const circle = d3.geoCircle().center([lon, lat]).radius(radius).precision(2);
      features.push({
        type: "Feature",
        geometry: circle() as GeoJSON.Geometry,
        properties: { lon, lat },
      });
    }
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

/**
 * SVGにティソー指示楕円を描画する
 */
export function drawTissotIndicatrices(
  svg: d3.Selection<SVGGElement, unknown, null, undefined>,
  path: d3.GeoPath<unknown, d3.GeoPermissibleObjects>,
  _projection: GeoProjection
) {
  const tissot = generateTissotIndicatrices();

  svg
    .selectAll("path.tissot")
    .data(tissot.features)
    .enter()
    .append("path")
    .attr("class", "tissot")
    .attr("d", path)
    .attr("fill", "rgba(233, 30, 99, 0.25)")
    .attr("stroke", "rgba(233, 30, 99, 0.6)")
    .attr("stroke-width", 0.5);
}
