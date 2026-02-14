"use client";

import React from "react";
import {
  Box,
  Slider,
  Typography,
  IconButton,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { doyToDate, MONTH_NAMES_JA } from "@/lib/solar";

interface DateControlsProps {
  dayOfYear: number;
  onDayChange: (day: number) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onReset: () => void;
}

export default function DateControls({
  dayOfYear,
  onDayChange,
  isPlaying,
  onPlayToggle,
  onReset,
}: DateControlsProps) {
  const dateInfo = doyToDate(dayOfYear);
  const dateLabel = `${MONTH_NAMES_JA[dateInfo.month - 1]}${dateInfo.day}日`;

  return (
    <Box sx={{ p: 2 }}>
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
    </Box>
  );
}
