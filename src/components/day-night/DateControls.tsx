"use client";

import React from "react";
import {
  Box,
  Slider,
  Typography,
  IconButton,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { doyToDate, MONTH_NAMES_JA } from "@/lib/solar";

interface DateControlsProps {
  dayOfYear: number;
  onDayChange: (day: number) => void;
  hourUTC: number;
  onHourChange: (hour: number) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onReset: () => void;
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

export default function DateControls({
  dayOfYear,
  onDayChange,
  hourUTC,
  onHourChange,
  isPlaying,
  onPlayToggle,
  onReset,
}: DateControlsProps) {
  const dateInfo = doyToDate(dayOfYear);
  const dateLabel = `${MONTH_NAMES_JA[dateInfo.month - 1]}${dateInfo.day}日`;

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
    </Box>
  );
}
