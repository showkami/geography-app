"use client";

import React, { useRef, useState, useCallback } from "react";

interface CircularSliderLabel {
  value: number;
  label: string;
}

interface CircularSliderProps {
  /** 現在の値 */
  value: number;
  /** 最小値 */
  min: number;
  /** 最大値 */
  max: number;
  /** ステップ */
  step?: number;
  /** 値変更コールバック */
  onChange: (value: number) => void;
  /** 表示サイズ (CSS px)。内部座標系とは独立 */
  size?: number;
  /** アクティブカラー */
  color?: string;
  /** ラベル配列 */
  labels?: CircularSliderLabel[];
  /**
   * 1周分の値の範囲。デフォルトは max - min。
   * 例: 日付(1〜365)は365、時刻(0〜24)は24
   */
  fullCircleValue?: number;
  /**
   * 0度（上）に配置する値。デフォルトは min。
   * 例: 冬至(day 356)を上に置きたい場合は startValue={356}
   */
  startValue?: number;
  /** 中央に表示するコンテンツ */
  children?: React.ReactNode;
}

/**
 * 内部座標系のサイズ。
 * viewBoxを固定にすることでラベルが確実にSVG内に収まり、
 * 表示サイズ(size prop)とは独立して計算できる。
 */
const VB = 200;
const VB_HALF = VB / 2;
const TRACK_W = 10;
const LABEL_PAD = 24;
const LABEL_OFFSET = 12;
const RADIUS = (VB - TRACK_W) / 2 - LABEL_PAD;
const FONT_SIZE = 9;

export default function CircularSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  size = 180,
  color = "#1976d2",
  labels = [],
  fullCircleValue,
  startValue,
  children,
}: CircularSliderProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fullRange = fullCircleValue ?? max - min;
  const start = startValue ?? min;
  const TWO_PI = Math.PI * 2;

  // 値 → 角度 (ラジアン, 0=上, 時計回り)
  // startValue が0度（上）にくるようオフセット
  const valueToAngle = useCallback(
    (val: number): number => {
      const raw = ((val - start) / fullRange) * TWO_PI;
      return ((raw % TWO_PI) + TWO_PI) % TWO_PI;
    },
    [start, fullRange, TWO_PI]
  );

  // 角度 → 値（stepにスナップ、[min, max] に循環ラップ）
  const angleToValue = useCallback(
    (angle: number): number => {
      let norm = angle / TWO_PI;
      if (norm < 0) norm += 1;
      if (norm >= 1) norm -= Math.floor(norm);
      const rawVal = start + norm * fullRange;
      // [min, max] 範囲に循環ラップ
      let val = min + (((rawVal - min) % fullRange) + fullRange) % fullRange;
      val = Math.round((val - min) / step) * step + min;
      return Math.max(min, Math.min(max, val));
    },
    [start, min, max, fullRange, step, TWO_PI]
  );

  const toXY = useCallback(
    (angle: number, r: number = RADIUS) => ({
      x: VB_HALF + r * Math.sin(angle),
      y: VB_HALF - r * Math.cos(angle),
    }),
    []
  );

  const clientToAngle = useCallback(
    (clientX: number, clientY: number): number => {
      if (!svgRef.current) return 0;
      const rect = svgRef.current.getBoundingClientRect();
      const dx = (clientX - rect.left) * (VB / rect.width) - VB_HALF;
      const dy = (clientY - rect.top) * (VB / rect.height) - VB_HALF;
      let angle = Math.atan2(dx, -dy);
      if (angle < 0) angle += Math.PI * 2;
      return angle;
    },
    []
  );

  const updateValue = useCallback(
    (clientX: number, clientY: number) => {
      onChange(angleToValue(clientToAngle(clientX, clientY)));
    },
    [clientToAngle, angleToValue, onChange]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      svgRef.current?.setPointerCapture(e.pointerId);
      updateValue(e.clientX, e.clientY);
      e.preventDefault();
    },
    [updateValue]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updateValue(e.clientX, e.clientY);
    },
    [isDragging, updateValue]
  );

  const onPointerUp = useCallback(() => setIsDragging(false), []);

  const arcPath = useCallback(
    (sa: number, ea: number): string => {
      if (ea - sa < 0.01) return "";
      const s = toXY(sa);
      const e = toXY(ea);
      const large = ea - sa > Math.PI ? 1 : 0;
      return `M ${s.x} ${s.y} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${e.x} ${e.y}`;
    },
    [toXY]
  );

  const angle = valueToAngle(value);
  const thumb = toXY(angle);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VB} ${VB}`}
      width={size}
      height={size}
      overflow="hidden"
      style={{
        display: "block",
        touchAction: "none",
        userSelect: "none",
        cursor: "pointer",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* トラック背景 */}
      <circle
        cx={VB_HALF}
        cy={VB_HALF}
        r={RADIUS}
        fill="none"
        stroke="#e8e8e8"
        strokeWidth={TRACK_W}
      />

      {/* アクティブ円弧（進捗表示） */}
      {angle > 0.01 && (
        <path
          d={arcPath(0, Math.min(angle, Math.PI * 2 - 0.01))}
          fill="none"
          stroke={color}
          strokeWidth={TRACK_W}
          strokeLinecap="round"
          opacity={0.22}
        />
      )}

      {/* 目盛りとラベル */}
      {labels.map((l, i) => {
        const a = valueToAngle(l.value);
        const p1 = toXY(a, RADIUS - TRACK_W / 2);
        const p2 = toXY(a, RADIUS + TRACK_W / 2);
        const lp = toXY(a, RADIUS + TRACK_W / 2 + LABEL_OFFSET);
        return (
          <g key={i}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="#ccc"
              strokeWidth={1}
            />
            <text
              x={lp.x}
              y={lp.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={FONT_SIZE}
              fill="#999"
              fontFamily="sans-serif"
            >
              {l.label}
            </text>
          </g>
        );
      })}

      {/* つまみ */}
      <circle
        cx={thumb.x}
        cy={thumb.y}
        r={TRACK_W * 0.85}
        fill="white"
        stroke={color}
        strokeWidth={2.5}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.18))",
        }}
      />
      <circle
        cx={thumb.x}
        cy={thumb.y}
        r={TRACK_W * 0.3}
        fill={color}
      />

      {/* 中央コンテンツ */}
      {children && (
        <foreignObject
          x={VB_HALF - RADIUS * 0.6}
          y={VB_HALF - RADIUS * 0.45}
          width={RADIUS * 1.2}
          height={RADIUS * 0.9}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
            }}
          >
            {children}
          </div>
        </foreignObject>
      )}
    </svg>
  );
}
