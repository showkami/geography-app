"use client";

import React from "react";
import {
  Box,
  Slider,
  Typography,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PublicIcon from "@mui/icons-material/Public";
import { doyToDate, MONTH_NAMES_JA, AXIAL_TILT_DEFAULT } from "@/lib/solar";

interface DateControlsProps {
  dayOfYear: number;
  onDayChange: (day: number) => void;
  hourUTC: number;
  onHourChange: (hour: number) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onReset: () => void;
  axialTilt: number;
  onAxialTiltChange: (tilt: number) => void;
}

/** 数値を2桁ゼロ埋めする */
function pad2(n: number): string {
  return String(Math.floor(n)).padStart(2, "0");
}

/** hourUTC (0-24の小数) を "HH:MM" 形式にフォーマット */
function formatTime(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${pad2(h)}:${pad2(m)}`;
}

/** 地軸の傾きに応じた状態の説明を返す */
function getTiltDescription(tilt: number): { label: string; color: string } {
  if (tilt === 0) return { label: "季節なし（常に春分/秋分状態）", color: "#2196f3" };
  if (tilt < 10) return { label: "季節変化がほぼない", color: "#4caf50" };
  if (tilt < 20) return { label: "穏やかな季節変化", color: "#8bc34a" };
  if (Math.abs(tilt - AXIAL_TILT_DEFAULT) < 0.5) return { label: "現在の地球", color: "#ff9800" };
  if (tilt < 30) return { label: "現実に近い季節変化", color: "#ff9800" };
  if (tilt < 45) return { label: "極端な季節変化", color: "#f44336" };
  if (tilt < 60) return { label: "非常に極端な季節", color: "#d32f2f" };
  if (tilt < 80) return { label: "極めて過酷な季節変化", color: "#b71c1c" };
  return { label: "天王星のような横倒し状態", color: "#880e4f" };
}

export default function DateControls({
  dayOfYear,
  onDayChange,
  hourUTC,
  onHourChange,
  isPlaying,
  onPlayToggle,
  onReset,
  axialTilt,
  onAxialTiltChange,
}: DateControlsProps) {
  const dateInfo = doyToDate(dayOfYear);
  const dateLabel = `${MONTH_NAMES_JA[dateInfo.month - 1]}${dateInfo.day}日`;
  const tiltDesc = getTiltDescription(axialTilt);

  return (
    <Box sx={{ p: 2 }}>
      {/* 日付セクション */}
      <Typography variant="subtitle2" gutterBottom color="text.secondary">
        日付選択
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <IconButton
          onClick={onPlayToggle}
          color="primary"
          size="small"
          sx={{ bgcolor: "primary.50", "&:hover": { bgcolor: "primary.100" } }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton onClick={onReset} size="small">
          <RestartAltIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ minWidth: 100, textAlign: "center", fontWeight: 600 }}
        >
          {dateLabel}
        </Typography>
      </Box>

      <Slider
        value={dayOfYear}
        onChange={(_, v) => onDayChange(v as number)}
        min={1}
        max={365}
        step={1}
      />

      {/* 時刻セクション */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          時刻選択（UTC）
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <AccessTimeIcon sx={{ color: "text.secondary", fontSize: 20 }} />
          <Typography
            variant="h6"
            sx={{ minWidth: 80, textAlign: "center", fontWeight: 600 }}
          >
            {formatTime(hourUTC)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            UTC
          </Typography>
        </Box>
        <Slider
          value={hourUTC}
          onChange={(_, v) => onHourChange(v as number)}
          min={0}
          max={24}
          step={0.5}
          marks={[
            { value: 0, label: "0時" },
            { value: 6, label: "6時" },
            { value: 12, label: "12時" },
            { value: 18, label: "18時" },
            { value: 24, label: "24時" },
          ]}
        />
      </Box>

      {/* 地軸の傾きセクション */}
      <Box
        sx={{
          mt: 3,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <PublicIcon sx={{ color: "text.secondary", fontSize: 20 }} />
          <Typography variant="subtitle2" color="text.secondary">
            地軸の傾き（シミュレーション）
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              minWidth: 70,
              textAlign: "center",
              color: tiltDesc.color,
            }}
          >
            {axialTilt.toFixed(1)}°
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
            <Chip
              label={tiltDesc.label}
              size="small"
              sx={{
                fontSize: "0.72rem",
                bgcolor: `${tiltDesc.color}18`,
                color: tiltDesc.color,
                border: `1px solid ${tiltDesc.color}40`,
                fontWeight: 600,
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
              回帰線: ±{axialTilt.toFixed(1)}° / 極圏: ±{(90 - axialTilt).toFixed(1)}°
            </Typography>
          </Box>
        </Box>

        <Slider
          value={axialTilt}
          onChange={(_, v) => onAxialTiltChange(v as number)}
          min={0}
          max={90}
          step={0.1}
          sx={{
            color: tiltDesc.color,
            "& .MuiSlider-thumb": {
              width: 20,
              height: 20,
            },
          }}
          marks={[
            { value: 0, label: "0°" },
            { value: AXIAL_TILT_DEFAULT, label: "23.4°" },
            { value: 45, label: "45°" },
            { value: 90, label: "90°" },
          ]}
        />

        {/* プリセットボタン */}
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
          {[
            { label: "0° 傾きなし", value: 0 },
            { label: "23.4° 地球", value: 23.4 },
            { label: "25.2° 火星", value: 25.2 },
            { label: "3.1° 木星", value: 3.13 },
            { label: "26.7° 土星", value: 26.73 },
            { label: "82.2° 天王星", value: 82.23 },
            { label: "90° 最大", value: 90 },
          ].map((preset) => (
            <Tooltip key={preset.value} title={`地軸の傾きを${preset.value}°に設定`}>
              <Chip
                label={preset.label}
                size="small"
                variant={Math.abs(axialTilt - preset.value) < 0.05 ? "filled" : "outlined"}
                color={Math.abs(axialTilt - preset.value) < 0.05 ? "primary" : "default"}
                onClick={() => onAxialTiltChange(preset.value)}
                sx={{
                  cursor: "pointer",
                  fontSize: "0.68rem",
                  height: 24,
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
