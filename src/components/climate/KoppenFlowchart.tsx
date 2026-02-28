"use client";

import React, { useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import * as d3 from "d3";
import { CityClimateData } from "@/lib/climate-types";
import { KOPPEN_GROUP_COLORS, KoppenTracePath } from "@/lib/koppen";
import {
  NODES,
  EDGES,
  GROUP_REGIONS,
  C_MATRIX,
  D_MATRIX,
  FlowchartNode,
  FlowchartEdge,
  computeEdgePath,
  computeMatrixEdgePath,
  isMatrixEdge,
  getNodeMetric,
  getMatrixHeaderMetric,
  MatrixHeader,
} from "@/lib/koppen-flowchart";

interface KoppenFlowchartProps {
  cities: CityClimateData[];
  traces: Map<string, KoppenTracePath>;
}

const VIEW_W = 1380;
const VIEW_H = 700;
const BASE_COLOR = "rgba(148,163,184,0.15)";
const BASE_TEXT = "rgba(148,163,184,0.5)";
const NODE_BG = "rgba(21,29,48,0.8)";
const NODE_BORDER = "rgba(148,163,184,0.2)";

const nodeMap = new Map(NODES.map((n) => [n.id, n]));

/** エッジをセットのキーにする */
function edgeKey(from: string, to: string) {
  return `${from}→${to}`;
}

/** 都市がこのエッジを通過するか判定 */
function cityUsesEdge(trace: KoppenTracePath, edge: FlowchartEdge): boolean {
  const visited = trace.visitedNodes;
  for (let i = 0; i < visited.length - 1; i++) {
    if (visited[i] === edge.from && visited[i + 1] === edge.to) return true;
  }
  return false;
}

/** エッジ上の Yes/No ラベル位置を計算 */
function edgeLabelPos(edge: FlowchartEdge): { x: number; y: number } | null {
  if (!edge.label) return null;
  const from = nodeMap.get(edge.from)!;
  const to = nodeMap.get(edge.to)!;

  // 出発点のオフセット（Yes=左, No=右）
  let exitX = from.x;
  if (edge.label === "Yes") exitX = from.x - from.width / 4;
  else if (edge.label === "No") exitX = from.x + from.width / 4;
  const exitY = from.y + from.height / 2;

  const entryX = to.x;
  const entryY = to.y - to.height / 2;

  // ラベル位置: 出発点から少し進んだところ
  if (Math.abs(exitX - entryX) < 3) {
    return { x: exitX + 8, y: (exitY + entryY) / 2 };
  }
  const junctionY = exitY + (entryY - exitY) * 0.4;
  return { x: (exitX + entryX) / 2, y: junctionY - 4 };
}

export default function KoppenFlowchart({ cities, traces }: KoppenFlowchartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    svg.selectAll("*").remove();

    svg.attr("viewBox", `0 0 ${VIEW_W} ${VIEW_H}`);

    // ── defs: glow フィルター ──
    const defs = svg.append("defs");

    // 各都市色のglowフィルター
    cities.forEach((cd) => {
      const filterId = `glow-${cd.city.id.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const filter = defs
        .append("filter")
        .attr("id", filterId)
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
      filter
        .append("feDropShadow")
        .attr("dx", 0)
        .attr("dy", 0)
        .attr("stdDeviation", 4)
        .attr("flood-color", cd.city.color)
        .attr("flood-opacity", 0.6);
    });

    // ── グループ背景帯 ──
    const bgLayer = svg.append("g").attr("class", "group-backgrounds");
    for (const region of GROUP_REGIONS) {
      const color = KOPPEN_GROUP_COLORS[region.group] ?? "#888";
      bgLayer
        .append("rect")
        .attr("x", region.x)
        .attr("y", region.y)
        .attr("width", region.width)
        .attr("height", region.height)
        .attr("rx", 6)
        .attr("fill", color)
        .attr("opacity", 0.06);
      bgLayer
        .append("text")
        .attr("x", region.x + 6)
        .attr("y", region.y + 14)
        .attr("fill", color)
        .attr("opacity", 0.35)
        .attr("font-size", 10)
        .attr("font-weight", 600)
        .text(region.label);
    }

    // ── ベースレイヤー: エッジ ──
    const baseEdgeLayer = svg.append("g").attr("class", "base-edges");
    const mainEdges = EDGES.filter((e) => !isMatrixEdge(e));
    const matrixEdges = EDGES.filter((e) => isMatrixEdge(e));

    for (const edge of mainEdges) {
      const pathD = computeEdgePath(edge);
      baseEdgeLayer
        .append("path")
        .attr("d", pathD)
        .attr("fill", "none")
        .attr("stroke", BASE_COLOR)
        .attr("stroke-width", 1.5);

      // Yes/No ラベル
      const lpos = edgeLabelPos(edge);
      if (lpos) {
        baseEdgeLayer
          .append("text")
          .attr("x", lpos.x)
          .attr("y", lpos.y)
          .attr("text-anchor", "middle")
          .attr("fill", BASE_TEXT)
          .attr("font-size", 8)
          .attr("font-weight", 600)
          .text(edge.label!);
      }
    }

    // マトリクスエッジ（ファン状）
    for (const edge of matrixEdges) {
      const pathD = computeMatrixEdgePath(edge);
      baseEdgeLayer
        .append("path")
        .attr("d", pathD)
        .attr("fill", "none")
        .attr("stroke", BASE_COLOR)
        .attr("stroke-width", 0.8);
    }

    // ── ベースレイヤー: ノード ──
    const baseNodeLayer = svg.append("g").attr("class", "base-nodes");
    for (const node of NODES) {
      const nx = node.x - node.width / 2;
      const ny = node.y - node.height / 2;

      if (node.type === "start") {
        // 角丸（楕円型）
        baseNodeLayer
          .append("rect")
          .attr("x", nx)
          .attr("y", ny)
          .attr("width", node.width)
          .attr("height", node.height)
          .attr("rx", node.height / 2)
          .attr("fill", NODE_BG)
          .attr("stroke", NODE_BORDER)
          .attr("stroke-width", 1);
        baseNodeLayer
          .append("text")
          .attr("x", node.x)
          .attr("y", node.y + 1)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", BASE_TEXT)
          .attr("font-size", 10)
          .text(node.label);
      } else if (node.type === "decision") {
        baseNodeLayer
          .append("rect")
          .attr("x", nx)
          .attr("y", ny)
          .attr("width", node.width)
          .attr("height", node.height)
          .attr("rx", 5)
          .attr("fill", NODE_BG)
          .attr("stroke", NODE_BORDER)
          .attr("stroke-width", 1);
        baseNodeLayer
          .append("text")
          .attr("x", node.x)
          .attr("y", node.sublabel ? node.y - 2 : node.y + 1)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "#94a3b8")
          .attr("font-size", 10)
          .attr("font-weight", 600)
          .text(node.label);
        if (node.sublabel) {
          baseNodeLayer
            .append("text")
            .attr("x", node.x)
            .attr("y", node.y + 10)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "rgba(148,163,184,0.35)")
            .attr("font-size", 7)
            .text(node.sublabel);
        }
      } else {
        // result node
        const groupColor = node.group ? KOPPEN_GROUP_COLORS[node.group] ?? "#888" : "#888";
        baseNodeLayer
          .append("rect")
          .attr("x", nx)
          .attr("y", ny)
          .attr("width", node.width)
          .attr("height", node.height)
          .attr("rx", 4)
          .attr("fill", NODE_BG)
          .attr("stroke", groupColor)
          .attr("stroke-width", 1)
          .attr("stroke-opacity", 0.25);
        // 気候区分コード
        baseNodeLayer
          .append("text")
          .attr("x", node.x)
          .attr("y", node.sublabel ? node.y - 2 : node.y + 1)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", groupColor)
          .attr("font-size", node.width >= 60 ? 12 : 9)
          .attr("font-weight", 700)
          .attr("opacity", 0.6)
          .text(node.label);
        // 日本語名
        if (node.sublabel) {
          baseNodeLayer
            .append("text")
            .attr("x", node.x)
            .attr("y", node.y + 10)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "rgba(148,163,184,0.35)")
            .attr("font-size", 7)
            .text(node.sublabel);
        }
      }
    }

    // ── C/Dマトリクスヘッダー（テキストのみ、ヒットエリアは後で追加） ──
    const matrixHeaderLayer = svg.append("g").attr("class", "matrix-headers");

    function renderMatrixHeaderText(matrix: typeof C_MATRIX) {
      for (const col of matrix.colHeaders) {
        const hx = col.x!;
        const hy = matrix.headerY;
        matrixHeaderLayer
          .append("text")
          .attr("x", hx)
          .attr("y", hy)
          .attr("text-anchor", "middle")
          .attr("fill", "rgba(148,163,184,0.4)")
          .attr("font-size", 9)
          .attr("font-weight", 600)
          .text(col.label);
        matrixHeaderLayer
          .append("line")
          .attr("x1", hx - 6)
          .attr("x2", hx + 6)
          .attr("y1", hy + 3)
          .attr("y2", hy + 3)
          .attr("stroke", "rgba(148,163,184,0.15)")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "2,2");
      }
      for (const row of matrix.rowHeaders) {
        matrixHeaderLayer
          .append("text")
          .attr("x", matrix.headerX)
          .attr("y", row.y! + 1)
          .attr("text-anchor", "end")
          .attr("dominant-baseline", "middle")
          .attr("fill", "rgba(148,163,184,0.35)")
          .attr("font-size", 8)
          .text(row.label);
      }
    }

    renderMatrixHeaderText(C_MATRIX);
    renderMatrixHeaderText(D_MATRIX);

    // ── ハイライトレイヤー ──
    const highlightLayer = svg.append("g").attr("class", "highlights");

    // 同じエッジを通る都市のオフセット管理
    const edgeUsageCount = new Map<string, number>();

    const cityTraces = cities
      .filter((cd) => traces.has(cd.city.id))
      .map((cd) => ({ city: cd, trace: traces.get(cd.city.id)! }));

    for (const { city: cd, trace } of cityTraces) {
      const visitedSet = new Set(trace.visitedNodes);
      const cityGroup = highlightLayer.append("g");
      const color = cd.city.color;
      const filterId = `glow-${cd.city.id.replace(/[^a-zA-Z0-9]/g, "_")}`;

      // ハイライトエッジ
      for (const edge of EDGES) {
        if (!cityUsesEdge(trace, edge)) continue;

        const key = edgeKey(edge.from, edge.to);
        const count = edgeUsageCount.get(key) ?? 0;
        edgeUsageCount.set(key, count + 1);
        const offset = count * 4 - (cityTraces.length - 1) * 2;

        const pathD = isMatrixEdge(edge)
          ? computeMatrixEdgePath(edge)
          : computeEdgePath(edge);

        cityGroup
          .append("path")
          .attr("d", pathD)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 2.5)
          .attr("stroke-opacity", 0.85)
          .attr("transform", `translate(${offset}, 0)`);
      }

      // ハイライトノード（最終結果ノード以外）
      for (const nodeId of trace.visitedNodes) {
        const node = nodeMap.get(nodeId);
        if (!node || nodeId === trace.finalNode) continue;
        if (node.type === "start") continue;

        cityGroup
          .append("rect")
          .attr("x", node.x - node.width / 2 - 1)
          .attr("y", node.y - node.height / 2 - 1)
          .attr("width", node.width + 2)
          .attr("height", node.height + 2)
          .attr("rx", 5)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 1.5)
          .attr("stroke-opacity", 0.6);
      }

      // 最終結果ノードのglow
      const finalNode = nodeMap.get(trace.finalNode);
      if (finalNode) {
        // glow背景
        cityGroup
          .append("rect")
          .attr("x", finalNode.x - finalNode.width / 2 - 2)
          .attr("y", finalNode.y - finalNode.height / 2 - 2)
          .attr("width", finalNode.width + 4)
          .attr("height", finalNode.height + 4)
          .attr("rx", 5)
          .attr("fill", color)
          .attr("fill-opacity", 0.15)
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .attr("filter", `url(#${filterId})`);

        // 結果ノードのテキストを上書き（太文字・高不透明度）
        const groupColor = finalNode.group
          ? KOPPEN_GROUP_COLORS[finalNode.group] ?? "#fff"
          : "#fff";
        cityGroup
          .append("text")
          .attr("x", finalNode.x)
          .attr("y", finalNode.sublabel ? finalNode.y - 2 : finalNode.y + 1)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", groupColor)
          .attr("font-size", finalNode.width >= 60 ? 12 : 9)
          .attr("font-weight", 800)
          .text(finalNode.label);

        // 都市カラーのドットを最終ノードの下に表示
        const dotY = finalNode.y + finalNode.height / 2 + 6;
        cityGroup
          .append("circle")
          .attr("cx", finalNode.x)
          .attr("cy", dotY)
          .attr("r", 3)
          .attr("fill", color);
      }
    }

    // ── インタラクティブレイヤー（ツールチップ用の透明ヒットエリア） ──
    const interactiveLayer = svg.append("g").attr("class", "interactive");

    for (const node of NODES) {
      if (node.type === "start") continue;

      const hitPad = 4;
      interactiveLayer
        .append("rect")
        .attr("x", node.x - node.width / 2 - hitPad)
        .attr("y", node.y - node.height / 2 - hitPad)
        .attr("width", node.width + hitPad * 2)
        .attr("height", node.height + hitPad * 2)
        .attr("fill", "transparent")
        .style("cursor", "pointer")
        .on("mouseenter", (event) => {
          showTooltip(event, node);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", `${event.offsetX + 14}px`)
            .style("top", `${event.offsetY - 8}px`);
        })
        .on("mouseleave", () => {
          tooltip.style("opacity", 0);
        });
    }

    // ── マトリクスヘッダーのインタラクティブレイヤー（ノード hit rect より上） ──
    const matrixHitLayer = svg.append("g").attr("class", "matrix-hit");

    function renderMatrixHeaderHitAreas(
      matrix: typeof C_MATRIX,
      group: "C" | "D"
    ) {
      for (const col of matrix.colHeaders) {
        const hx = col.x!;
        const hy = matrix.headerY;
        matrixHitLayer
          .append("rect")
          .attr("x", hx - 14)
          .attr("y", hy - 12)
          .attr("width", 28)
          .attr("height", 20)
          .attr("fill", "transparent")
          .style("cursor", "pointer")
          .on("mouseenter", (event) => {
            showMatrixHeaderTooltip(event, col, "col", group);
          })
          .on("mousemove", (event) => {
            tooltip
              .style("left", `${event.offsetX + 14}px`)
              .style("top", `${event.offsetY - 8}px`);
          })
          .on("mouseleave", () => {
            tooltip.style("opacity", 0);
          });
      }
      for (const row of matrix.rowHeaders) {
        const rx = matrix.headerX;
        const ry = row.y!;
        const textWidth = row.label.length * 7 + 8;
        matrixHitLayer
          .append("rect")
          .attr("x", rx - textWidth)
          .attr("y", ry - 10)
          .attr("width", textWidth + 4)
          .attr("height", 20)
          .attr("fill", "transparent")
          .style("cursor", "pointer")
          .on("mouseenter", (event) => {
            showMatrixHeaderTooltip(event, row, "row", group);
          })
          .on("mousemove", (event) => {
            tooltip
              .style("left", `${event.offsetX + 14}px`)
              .style("top", `${event.offsetY - 8}px`);
          })
          .on("mouseleave", () => {
            tooltip.style("opacity", 0);
          });
      }
    }

    function showMatrixHeaderTooltip(
      event: MouseEvent,
      header: MatrixHeader,
      headerType: "col" | "row",
      group: "C" | "D"
    ) {
      let html = header.tip
        .split("\n")
        .map((line, i) =>
          i === 0
            ? `<strong>${line}</strong>`
            : `<span style="color:#64748b">${line}</span>`
        )
        .join("<br/>");

      const groupNodeId = group === "C" ? "c_group" : "d_group";
      for (const cd of cities) {
        if (!cd.normals) continue;
        const trace = traces.get(cd.city.id);
        const inGroup = trace?.visitedNodes.includes(groupNodeId);
        const metric = getMatrixHeaderMetric(
          header.key,
          headerType,
          group,
          cd.normals.temperature,
          cd.normals.precipitation,
          cd.city.latitude
        );
        if (!metric) continue;
        const opacity = inGroup ? 1 : 0.35;
        const mark = metric.matched ? "\u2713" : "\u2717";
        html += `<br/><span style="opacity:${opacity}"><span style="color:${cd.city.color}">\u25cf</span> ${cd.city.name}: ${metric.values} ${mark}</span>`;
      }

      tooltip
        .style("opacity", 1)
        .style("left", `${event.offsetX + 14}px`)
        .style("top", `${event.offsetY - 8}px`)
        .html(html);
    }

    renderMatrixHeaderHitAreas(C_MATRIX, "C");
    renderMatrixHeaderHitAreas(D_MATRIX, "D");

    function showTooltip(event: MouseEvent, node: FlowchartNode) {
      let html = "";

      if (node.type === "decision") {
        html += `<strong>${node.label}</strong>`;
        if (node.sublabel) html += `<br/><span style="color:#64748b">${node.sublabel}</span>`;

        // 各都市のメトリクス
        for (const cd of cities) {
          if (!cd.normals) continue;
          const metric = getNodeMetric(node.id, cd.normals.temperature, cd.normals.precipitation, cd.city.latitude);
          if (!metric) continue;
          const trace = traces.get(cd.city.id);
          const visited = trace?.visitedNodes.includes(node.id);
          const opacity = visited ? 1 : 0.4;
          const arrow = metric.passed ? "Yes" : "No";
          html += `<br/><span style="opacity:${opacity}"><span style="color:${cd.city.color}">\u25cf</span> ${cd.city.name}: ${metric.value} \u2192 ${arrow}</span>`;
        }
      } else if (node.type === "result") {
        const groupColor = node.group ? KOPPEN_GROUP_COLORS[node.group] ?? "#ccc" : "#ccc";
        html += `<strong style="color:${groupColor}">${node.label}</strong>`;
        if (node.sublabel) html += ` ${node.sublabel}`;

        // この結果に到達した都市
        const matchedCities = cities.filter(
          (cd) => traces.get(cd.city.id)?.finalNode === node.id
        );
        if (matchedCities.length > 0) {
          for (const cd of matchedCities) {
            html += `<br/><span style="color:${cd.city.color}">\u25cf</span> ${cd.city.name}`;
          }
        }
      }

      tooltip
        .style("opacity", 1)
        .style("left", `${event.offsetX + 14}px`)
        .style("top", `${event.offsetY - 8}px`)
        .html(html);
    }
  }, [cities, traces]);

  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "rgba(12,18,34,0.5)",
        borderRadius: 2,
        p: 1,
        minWidth: 900,
      }}
    >
      <svg
        ref={svgRef}
        style={{ width: "100%", height: "auto" }}
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
          lineHeight: 1.5,
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          transition: "opacity 0.15s",
          zIndex: 10,
          maxWidth: 320,
          whiteSpace: "nowrap",
        }}
      />
      {cities.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 6, position: "absolute", top: "40%", left: 0, right: 0 }}
        >
          都市を追加するとフローチャートが表示されます
        </Typography>
      )}
    </Box>
  );
}
